import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
const FROM = { name: 'HR APAC', email: 'hr.apac@pattern.com' };

function buildICS(opts: { uid: string; summary: string; description: string; startDate: string; endDate: string }): string {
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//Whereabouts//Leave Calendar//EN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`, `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${opts.startDate}`, `DTEND;VALUE=DATE:${opts.endDate}`,
    `SUMMARY:${opts.summary}`, `DESCRIPTION:${opts.description}`,
    'STATUS:CONFIRMED', 'TRANSP:TRANSPARENT',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function fmtDate(ds: string): string {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function toICSDate(ds: string): string { return ds.replace(/-/g, ''); }

function nextDay(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { personName, personEmail, statusLabel, statusIcon, dates, teamEmails = [], extraEmails = [] } = await req.json();

    if (!personName || !dates?.length) return json({ error: 'Missing required fields' }, 400);

    const sorted      = [...dates].sort();
    const firstDate   = sorted[0];
    const lastDate    = sorted[sorted.length - 1];
    const dateDisplay = sorted.length > 1
      ? `${fmtDate(firstDate)} – ${fmtDate(lastDate)}`
      : fmtDate(firstDate);
    const summary     = `${personName} - ${statusLabel}`;
    const icsContent  = buildICS({
      uid: `leave-${personEmail}-${firstDate}-${lastDate}@whereabouts`,
      summary, description: `${personName} is on ${statusLabel}\\n${dateDisplay}`,
      startDate: toICSDate(firstDate), endDate: nextDay(lastDate),
    });

    const allTo = [...new Set([...teamEmails, ...extraEmails])].filter(Boolean);
    if (allTo.length === 0) return json({ error: 'No recipients' }, 400);
    const invalidEmails = allTo.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalidEmails.length > 0) return json({ error: `Invalid email(s): ${invalidEmails.join(', ')}` }, 400);

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: FROM,
        to: allTo.map(email => ({ email })),
        subject: `📅 ${summary} · ${dateDisplay}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 8px">${statusIcon} ${personName} – ${statusLabel}</h2>
            <p style="color:#555;margin:0 0 16px">${dateDisplay}</p>
            <p style="color:#333">Open the attached <strong>.ics</strong> file to add this to your calendar.</p>
            <p style="color:#555;font-size:13px;margin-top:8px">This invite has been sent to your APAC team colleagues.</p>
            <p style="color:#888;font-size:12px;margin-top:24px">Sent from Whereabouts</p>
          </div>
        `,
        attachment: [{
          name: `${personName.replace(/ /g, '-')}-${statusLabel.replace(/ /g, '-')}.ics`,
          content: base64Encode(new TextEncoder().encode(icsContent)),
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return json({ error: 'Brevo error', detail: err }, 500);
    }

    return json({ ok: true });

  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
