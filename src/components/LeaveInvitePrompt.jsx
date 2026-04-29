import { useState } from 'react';

export default function LeaveInvitePrompt({ person, statusLabel, statusIcon, dates, isDayMode, teamMembers = [], onSend, onSkip }) {
  const [mode, setMode] = useState('simple'); // 'simple' | 'customize'
  const [selected, setSelected] = useState(() => new Set(teamMembers.map(m => m.email)));
  const [bulkText, setBulkText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const night = !isDayMode;
  const bg     = night ? 'rgba(12,8,32,0.98)' : 'rgba(255,255,255,0.99)';
  const border = night ? 'rgba(167,139,250,0.25)' : 'rgba(119,11,255,0.15)';
  const nameC  = night ? '#fff' : '#1A1830';
  const subC   = night ? 'rgba(220,215,255,0.5)' : 'rgba(26,24,48,0.45)';
  const cardBg = night ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  const fmtDate = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const dateLabel = dates.length === 1
    ? fmtDate(dates[0])
    : `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])} (${dates.length} days)`;

  const toggleMember = email => setSelected(s => {
    const n = new Set(s);
    n.has(email) ? n.delete(email) : n.add(email);
    return n;
  });

  const parseBulk = () => bulkText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@'));

  const handleSend = async () => {
    setSending(true);
    const teamEmails = mode === 'customize' ? [...selected] : teamMembers.map(m => m.email);
    const extraEmails = mode === 'customize' ? parseBulk() : [];
    await onSend(teamEmails, extraEmails);
    setSending(false);
    setSent(true);
    setTimeout(onSkip, 2000);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 16000,
      width: mode === 'customize' ? 400 : 360,
      borderRadius: 20,
      background: bg, border: `1px solid ${border}`,
      boxShadow: night
        ? '0 24px 64px rgba(0,0,0,0.65), 0 4px 20px rgba(119,11,255,0.22)'
        : '0 16px 48px rgba(119,11,255,0.13), 0 4px 16px rgba(0,0,0,0.09)',
      backdropFilter: 'blur(28px)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'leavePromptIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
    }}>
      <style>{`
        @keyframes leavePromptIn {
          from { opacity:0; transform:translateY(18px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .lip-member { transition: background 0.15s; }
        .lip-member:hover { background: rgba(119,11,255,0.08) !important; }
      `}</style>

      <div style={{ height: 3, background: 'linear-gradient(90deg, #770bff, #009bff)' }} />

      <div style={{ padding: '20px 20px 20px' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: nameC, marginBottom: 6 }}>Team notified!</div>
            <div style={{ fontSize: 12, color: subC }}>Calendar invite sent to {mode === 'customize' ? selected.size : teamMembers.length} people.</div>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: nameC, lineHeight: 1.3, marginBottom: 4 }}>
                  {statusIcon} {person.name}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(119,11,255,0.8)', fontWeight: 700, marginBottom: 2 }}>{statusLabel}</div>
                <div style={{ fontSize: 12, color: subC }}>{dateLabel}</div>
              </div>
              <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subC, fontSize: 16, padding: '0 0 0 10px', lineHeight: 1, flexShrink: 0 }}>✕</button>
            </div>

            {mode === 'simple' ? (
              <>
                {/* simple description */}
                <div style={{
                  background: cardBg, borderRadius: 12, padding: '12px 14px', marginBottom: 16,
                  border: `1px solid ${border}`,
                }}>
                  <div style={{ fontSize: 13, color: nameC, fontWeight: 600, marginBottom: 4 }}>
                    📣 Notify the whole HK team
                  </div>
                  <div style={{ fontSize: 12, color: subC, lineHeight: 1.6 }}>
                    A calendar invite will be sent to all {teamMembers.length} HK team members automatically so they know when you're away.
                  </div>
                </div>

                <button onClick={() => setMode('customize')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'rgba(119,11,255,0.65)', fontWeight: 700,
                  padding: '0 0 14px', display: 'block', letterSpacing: '0.04em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Customize who receives this →
                </button>
              </>
            ) : (
              <>
                {/* customize header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* select all checkbox */}
                    <div onClick={() => {
                      const allEmails = teamMembers.map(m => m.email);
                      const allSelected = allEmails.every(e => selected.has(e));
                      setSelected(allSelected ? new Set() : new Set(allEmails));
                    }} style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                      background: teamMembers.every(m => selected.has(m.email))
                        ? 'linear-gradient(135deg, #770bff, #009bff)'
                        : teamMembers.some(m => selected.has(m.email))
                          ? 'rgba(119,11,255,0.35)'
                          : 'transparent',
                      border: teamMembers.every(m => selected.has(m.email)) ? 'none' : `1.5px solid ${subC}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff',
                    }}>
                      {teamMembers.every(m => selected.has(m.email)) ? '✓' : teamMembers.some(m => selected.has(m.email)) ? '–' : ''}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: subC, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      HK Team ({selected.size}/{teamMembers.length})
                    </div>
                  </div>
                  <button onClick={() => setMode('simple')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'rgba(119,11,255,0.6)', fontWeight: 700,
                    padding: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>← Back</button>
                </div>

                {/* team member grid */}
                <div style={{
                  maxHeight: 200, overflowY: 'auto', marginBottom: 12,
                  borderRadius: 12, border: `1px solid ${border}`,
                  scrollbarWidth: 'thin', scrollbarColor: `${border} transparent`,
                }}>
                  {teamMembers.map(m => (
                    <div key={m.email} className="lip-member" onClick={() => toggleMember(m.email)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', cursor: 'pointer',
                      borderBottom: `1px solid ${border}`,
                      background: selected.has(m.email) ? 'rgba(119,11,255,0.06)' : 'transparent',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        background: selected.has(m.email) ? 'linear-gradient(135deg, #770bff, #009bff)' : 'transparent',
                        border: selected.has(m.email) ? 'none' : `1.5px solid ${subC}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff',
                      }}>
                        {selected.has(m.email) && '✓'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: nameC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* bulk add */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: subC, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Add more (paste emails)
                  </div>
                  <textarea
                    placeholder={'james@company.com\nsara@agency.com'}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%', borderRadius: 10, padding: '8px 10px', fontSize: 11,
                      background: night ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${border}`, color: nameC, outline: 'none', resize: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </>
            )}

            {/* actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSkip} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: 'transparent', border: `1px solid ${border}`,
                color: subC, cursor: 'pointer',
              }}>
                Not now
              </button>
              <button onClick={handleSend} disabled={sending} style={{
                flex: 2, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(90deg, #770bff, #009bff)',
                border: 'none', color: '#fff', cursor: sending ? 'default' : 'pointer',
                opacity: sending ? 0.7 : 1,
              }}>
                {sending ? 'Sending…' : mode === 'customize' ? `📅 Send to ${selected.size + parseBulk().length}` : '📅 Notify Team'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
