import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';
import { SmtpClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const BREVO_USER = Deno.env.get('BREVO_USER')!;
const BREVO_PASS = Deno.env.get('BREVO_PASS')!;
const FROM_EMAIL = 'Whereabouts <a9b598001@smtp-brevo.com>';

function buildICS(opts: {
  uid: string;
  summary: string;
  description: string;
  startDate: string;
  endDate: string;
}): string {
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Whereabouts//Leave Calendar//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${opts.startDate}`,
    `DTEND;VALUE=DATE:${opts.endDate}`,
    `SUMMARY:${opts.summary}`,
    `DESCRIPTION:${opts.description}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function formatDateDisplay(ds: string): string {
  const dt = new Date(ds + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function toICSDate(ds: string): string {
  return ds.replace(/-/g, '');
}

function nextDay(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { personName, personEmail, statusLabel, statusIcon, dates, teamEmails = [], extraEmails = [] } = await req.json();

    if (!personName || !dates?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const sortedDates  = [...dates].sort();
    const firstDate    = sortedDates[0];
    const lastDate     = sortedDates[sortedDates.length - 1];
    const isMulti      = sortedDates.length > 1;
    const summary      = `${personName} - ${statusLabel}`;
    const dateDisplay  = isMulti
      ? `${formatDateDisplay(firstDate)} – ${formatDateDisplay(lastDate)}`
      : formatDateDisplay(firstDate);
    const description  = `${personName} is on ${statusLabel}\\n${dateDisplay}`;
    const uid          = `leave-${personEmail}-${firstDate}-${lastDate}@whereabouts`;

    const icsContent   = buildICS({ uid, summary, description, startDate: toICSDate(firstDate), endDate: nextDay(lastDate) });
    const icsB64       = base64Encode(new TextEncoder().encode(icsContent));
    const icsFilename  = `${personName.replace(/ /g, '-')}-${statusLabel.replace(/ /g, '-')}.ics`;

    const allRecipients = [...new Set([...teamEmails, ...extraEmails])].filter(Boolean);
    if (allRecipients.length === 0) {
      return new Response(JSON.stringify({ error: 'No recipients' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">${statusIcon} ${personName} – ${statusLabel}</h2>
        <p style="color:#555;margin:0 0 16px">${dateDisplay}</p>
        <p style="color:#333">Open the attached <strong>.ics</strong> file to add this to your calendar.</p>
        <p style="color:#555;font-size:13px;margin-top:8px">This invite has been sent to your HK team colleagues.</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent from Whereabouts</p>
      </div>
    `;

    const client = new SmtpClient({ connection: { hostname: 'smtp-relay.brevo.com', port: 587, tls: false, auth: { username: BREVO_USER, password: BREVO_PASS } } });

    await client.send({
      from: FROM_EMAIL,
      to:   allRecipients,
      subject: `📅 ${summary} · ${dateDisplay}`,
      html: htmlBody,
      attachments: [{ filename: icsFilename, contentType: 'text/calendar', encoding: 'base64', content: icsB64 }],
    });

    await client.close();

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
