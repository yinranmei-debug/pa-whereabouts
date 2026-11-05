import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.102.1';

const CHANNEL = 'presence-party';
const LISTEN_MS = 4500;

type PresenceRow = {
  id?: string;
  email?: string;
  name?: string;
};

function unauthorized() {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Snapshot who currently has the board open. No track() — this listener stays invisible. */
async function readPresence(url: string, key: string): Promise<PresenceRow[]> {
  const client = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 2 } },
  });
  const channel = client.channel(CHANNEL, {
    config: { presence: { key: `recorder-${crypto.randomUUID()}` } },
  });

  const users = await new Promise<PresenceRow[]>((resolve, reject) => {
    let settled = false;
    const finish = (rows: PresenceRow[]) => {
      if (settled) return;
      settled = true;
      resolve(rows);
    };

    const timer = setTimeout(() => {
      const state = channel.presenceState() as Record<string, PresenceRow[]>;
      finish(Object.values(state).map((arr) => arr?.[0]).filter(Boolean) as PresenceRow[]);
    }, LISTEN_MS);

    channel.on('presence', { event: 'sync' }, () => {
      // Keep listening until timeout so late joiners settle; first sync is enough to know the channel works.
    });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timer);
        reject(new Error(`presence subscribe failed: ${status}`));
      }
    });
  });

  await client.removeChannel(channel);
  return users;
}

serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return json({ error: 'method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'missing supabase env' }, 500);
  }

  // Cron / dashboard calls must present the service role key. Publishable key is rejected.
  const presented =
    req.headers.get('apikey') ||
    req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
    '';
  if (presented !== serviceKey) return unauthorized();

  try {
    const online = await readPresence(supabaseUrl, serviceKey);
    const sampleId = crypto.randomUUID();
    const recordedAt = new Date().toISOString();

    const rows: Array<{
      sample_id: string;
      recorded_at: string;
      staff_id: string | null;
      email: string;
      name: string | null;
    }> = [];

    for (const u of online) {
      const email = (u.email || '').trim().toLowerCase();
      if (!email) continue;
      // Skip the recorder itself if it ever got tracked by mistake.
      if (email.startsWith('recorder-')) continue;
      rows.push({
        sample_id: sampleId,
        recorded_at: recordedAt,
        staff_id: u.id || null,
        email,
        name: u.name || null,
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    if (rows.length) {
      const { error: insertErr } = await admin.from('online_presence_log').insert(rows);
      if (insertErr) throw insertErr;
    }

    let purged: number | null = null;
    const { data: deleted, error: cleanErr } = await admin.rpc('cleanup_online_presence_log');
    if (cleanErr) {
      // Fallback if RPC is missing: delete by timestamp.
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from('online_presence_log')
        .delete({ count: 'exact' })
        .lt('recorded_at', cutoff);
      purged = count;
    } else {
      purged = typeof deleted === 'number' ? deleted : null;
    }

    return json({
      ok: true,
      sample_id: sampleId,
      recorded_at: recordedAt,
      online_count: rows.length,
      online: rows.map((r) => ({ email: r.email, name: r.name, staff_id: r.staff_id })),
      purged,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[record-online-presence]', message);
    return json({ error: message }, 500);
  }
});
