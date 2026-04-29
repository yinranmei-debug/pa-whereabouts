import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const TEST_RECIPIENT = 'yinran.mei@patternasia.com';
const FROM_EMAIL     = 'Whereabouts <onboarding@resend.dev>';

function buildICS(opts: {
  uid: string;
  summary: string;
  description: string;
  startDate: string; // YYYYMMDD
  endDate: string;   // YYYYMMDD (exclusive — day after last day)
  organizerName: string;
  organizerEmail: string;
  attendeeEmail: string;
}): string {
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Whereabouts//Leave Calendar//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${opts.startDate}`,
    `DTEND;VALUE=DATE:${opts.endDate}`,
    `SUMMARY:${opts.summary}`,
    `DESCRIPTION:${opts.description}`,
    `ORGANIZER;CN=${opts.organizerName}:mailto:${opts.organizerEmail}`,
    `ATTENDEE;CN=${opts.attendeeEmail};RSVP=TRUE:mailto:${opts.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function formatDateDisplay(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  const dt = new Date(`${y}-${m}-${d}T00:00:00`);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// Convert YYYY-MM-DD → YYYYMMDD
function toICSDate(ds: string): string {
  return ds.replace(/-/g, '');
}

// Add one day to YYYY-MM-DD for ICS DTEND (exclusive end)
function nextDay(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } });
  }

  try {
    const { personName, personEmail, statusLabel, statusIcon, dates, extraEmails = [] } = await req.json();
    // dates: string[] of YYYY-MM-DD sorted ascending

    if (!personName || !dates?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const sortedDates = [...dates].sort();
    const firstDate   = sortedDates[0];
    const lastDate    = sortedDates[sortedDates.length - 1];
    const isMulti     = sortedDates.length > 1;

    const summary     = `${statusIcon} ${personName} – ${statusLabel}`;
    const dateDisplay = isMulti
      ? `${formatDateDisplay(firstDate)} – ${formatDateDisplay(lastDate)}`
      : formatDateDisplay(firstDate);
    const description = `${personName} is on ${statusLabel}\\n${dateDisplay}`;
    const uid         = `leave-${personEmail}-${firstDate}-${lastDate}@whereabouts`;

    const icsContent = buildICS({
      uid,
      summary,
      description,
      startDate:      toICSDate(firstDate),
      endDate:        nextDay(lastDate),
      organizerName:  personName,
      organizerEmail: personEmail || TEST_RECIPIENT,
      attendeeEmail:  TEST_RECIPIENT,
    });

    const recipients = [TEST_RECIPIENT, ...extraEmails.filter((e: string) => e !== TEST_RECIPIENT)];

    // Send one email per recipient so each gets a proper invite
    await Promise.all(recipients.map((to: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    FROM_EMAIL,
          to:      [to],
          subject: `📅 ${summary} · ${dateDisplay}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="margin:0 0 8px">${statusIcon} ${personName} – ${statusLabel}</h2>
              <p style="color:#555;margin:0 0 16px">${dateDisplay}</p>
              <p style="color:#333">Open the attached <strong>.ics</strong> file to add this to your calendar.</p>
              <p style="color:#888;font-size:12px;margin-top:24px">Sent from Whereabouts</p>
            </div>
          `,
          attachments: [{
            filename: `${personName.replace(/ /g, '-')}-${statusLabel.replace(/ /g, '-')}.ics`,
            content:  btoa(icsContent),
          }],
        }),
      })
    ));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
