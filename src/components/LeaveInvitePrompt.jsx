import { useState } from 'react';

export default function LeaveInvitePrompt({ person, statusId, statusLabel, statusIcon, dates, isDayMode, onSend, onSkip }) {
  const [extraEmails, setExtraEmails] = useState(['']);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const night = !isDayMode;
  const bg     = night ? 'rgba(12,8,32,0.98)' : 'rgba(255,255,255,0.99)';
  const border = night ? 'rgba(167,139,250,0.25)' : 'rgba(119,11,255,0.15)';
  const nameC  = night ? '#fff' : '#1A1830';
  const subC   = night ? 'rgba(220,215,255,0.55)' : 'rgba(26,24,48,0.45)';

  const fmtDate = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const dateLabel = dates.length === 1
    ? fmtDate(dates[0])
    : `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])} (${dates.length} days)`;

  const addEmailField = () => setExtraEmails(e => [...e, '']);
  const updateEmail = (i, val) => setExtraEmails(e => e.map((v, idx) => idx === i ? val : v));
  const removeEmail = (i) => setExtraEmails(e => e.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    setSending(true);
    const extras = extraEmails.map(e => e.trim()).filter(Boolean);
    await onSend(extras);
    setSending(false);
    setSent(true);
    setTimeout(onSkip, 1800);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 16000,
      width: 320, borderRadius: 16,
      background: bg, border: `1px solid ${border}`,
      boxShadow: night
        ? '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(119,11,255,0.2)'
        : '0 16px 40px rgba(119,11,255,0.12), 0 4px 12px rgba(0,0,0,0.08)',
      backdropFilter: 'blur(24px)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'leavePromptIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes leavePromptIn {
          from { opacity:0; transform:translateY(16px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>

      {/* top bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #770bff, #009bff)' }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: nameC }}>Invite sent!</div>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(119,11,255,0.7)', textTransform: 'uppercase', marginBottom: 3 }}>
                  Notify HK team?
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: nameC }}>
                  {statusIcon} {person.name} – {statusLabel}
                </div>
                <div style={{ fontSize: 11, color: subC, marginTop: 2 }}>{dateLabel}</div>
                <div style={{ fontSize: 10, color: subC, marginTop: 3, opacity: 0.7 }}>
                  Calendar invite → HK team colleagues
                </div>
              </div>
              <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subC, fontSize: 14, padding: '0 0 0 8px', lineHeight: 1 }}>✕</button>
            </div>

            {/* extra emails */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: subC, fontWeight: 600, marginBottom: 5 }}>
                Add others (optional)
              </div>
              {extraEmails.map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                  <input
                    type="email"
                    placeholder="email@patternasia.com"
                    value={val}
                    onChange={e => updateEmail(i, e.target.value)}
                    style={{
                      flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 12,
                      background: night ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${border}`,
                      color: nameC, outline: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                  {extraEmails.length > 1 && (
                    <button onClick={() => removeEmail(i)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: subC, fontSize: 14, padding: '0 4px',
                    }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={addEmailField} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'rgba(119,11,255,0.7)', fontWeight: 600,
                padding: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>+ Add another</button>
            </div>

            {/* actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSkip} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'transparent', border: `1px solid ${border}`,
                color: subC, cursor: 'pointer',
              }}>
                Skip
              </button>
              <button onClick={handleSend} disabled={sending} style={{
                flex: 2, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(90deg, #770bff, #009bff)',
                border: 'none', color: '#fff', cursor: sending ? 'default' : 'pointer',
                opacity: sending ? 0.7 : 1,
              }}>
                {sending ? 'Sending…' : '📅 Send Invite'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
