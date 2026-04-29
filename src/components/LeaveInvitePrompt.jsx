import { useState } from 'react';

const storageKey = id => `leave-invite-custom-${id}`;

export default function LeaveInvitePrompt({ person, statusLabel, statusIcon, dates, isDayMode, teamMembers = [], onSend, onSkip }) {
  const savedRaw = (() => { try { return JSON.parse(localStorage.getItem(storageKey(person.id)) || 'null'); } catch { return null; } })();
  const savedEmails = savedRaw && savedRaw.length ? savedRaw : null;
  const savedNames  = savedEmails
    ? savedEmails.map(e => teamMembers.find(m => m.email === e)?.name?.split(' ')[0]).filter(Boolean)
    : [];

  const [mode,        setMode]        = useState(savedEmails ? 'choose' : 'simple');
  const [chosenOpt,   setChosenOpt]   = useState(savedEmails ? 'saved' : 'hk');
  const [showSavedList, setShowSavedList] = useState(false);
  const [selected,    setSelected]    = useState(() => new Set(savedEmails || teamMembers.map(m => m.email)));
  const [bulkText,    setBulkText]    = useState('');
  const [rememberMe,  setRememberMe]  = useState(false);
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [sentCount,   setSentCount]   = useState(0);

  const night   = !isDayMode;
  const bg      = night ? 'rgba(12,8,32,0.98)'          : 'rgba(255,255,255,0.99)';
  const border  = night ? 'rgba(167,139,250,0.22)'       : 'rgba(119,11,255,0.13)';
  const nameC   = night ? '#fff'                          : '#1A1830';
  const subC    = night ? 'rgba(220,215,255,0.48)'       : 'rgba(26,24,48,0.42)';
  const optHov  = night ? 'rgba(119,11,255,0.1)'         : 'rgba(119,11,255,0.05)';
  const optSel  = night ? 'rgba(119,11,255,0.16)'        : 'rgba(119,11,255,0.07)';

  const fmtDate  = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const dateLabel = dates.length === 1
    ? fmtDate(dates[0])
    : `${fmtDate(dates[0])} – ${fmtDate(dates[dates.length - 1])} (${dates.length} days)`;

  const toggleMember = email => setSelected(s => { const n = new Set(s); n.has(email) ? n.delete(email) : n.add(email); return n; });
  const parseBulk    = () => bulkText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@'));

  const handleSend = async () => {
    let teamEmails, extraEmails = [];
    if (mode === 'customize') {
      teamEmails = [...selected];
      extraEmails = parseBulk();
      if (rememberMe) localStorage.setItem(storageKey(person.id), JSON.stringify([...teamEmails, ...extraEmails]));
    } else if (mode === 'choose' && chosenOpt === 'saved') {
      teamEmails = savedEmails;
    } else {
      teamEmails = teamMembers.map(m => m.email);
    }
    setSentCount((teamEmails?.length || 0) + extraEmails.length);
    setSending(true);
    await onSend(teamEmails, extraEmails);
    setSending(false);
    setSent(true);
    setTimeout(onSkip, 2200);
  };

  const isWide   = mode === 'customize';
  const sendLabel = mode === 'customize'
    ? `📅 Send to ${selected.size + parseBulk().length}`
    : mode === 'choose' && chosenOpt === 'saved'
      ? `📅 Send to my team (${savedEmails?.length})`
      : `📅 Notify all HK team`;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 16000,
      width: isWide ? 400 : 370,
      borderRadius: 20,
      background: bg, border: `1px solid ${border}`,
      boxShadow: night
        ? '0 24px 64px rgba(0,0,0,0.65), 0 4px 20px rgba(119,11,255,0.22)'
        : '0 16px 48px rgba(119,11,255,0.13), 0 4px 16px rgba(0,0,0,0.09)',
      backdropFilter: 'blur(28px)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'lipIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      overflow: 'hidden',
      transition: 'width 0.22s ease',
    }}>
      <style>{`
        @keyframes lipIn { from{opacity:0;transform:translateY(18px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        .lip-opt { transition: background 0.14s, border-color 0.14s; cursor: pointer; }
        .lip-opt:hover { background: ${optHov} !important; }
        .lip-row { transition: background 0.12s; cursor: pointer; }
        .lip-row:hover { background: rgba(119,11,255,0.07) !important; }
        .lip-cb { transition: transform 0.12s; }
        .lip-cb:hover { transform: scale(1.1); }
      `}</style>

      <div style={{ height: 3, background: 'linear-gradient(90deg, #770bff, #009bff)' }} />

      <div style={{ padding: '18px 18px 18px' }}>

        {/* ── sent state ── */}
        {sent ? (
          <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: nameC, marginBottom: 5 }}>Team notified!</div>
            <div style={{ fontSize: 12, color: subC }}>Calendar invite sent to {sentCount} people.</div>
          </div>
        ) : (
          <>
            {/* ── person header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: nameC, lineHeight: 1.3, marginBottom: 3 }}>
                  {statusIcon} {person.name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(139,92,246,0.85)', fontWeight: 700, marginBottom: 2 }}>{statusLabel}</div>
                <div style={{ fontSize: 11, color: subC }}>{dateLabel}</div>
              </div>
              <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subC, fontSize: 16, padding: '0 0 0 10px', lineHeight: 1, flexShrink: 0 }}>✕</button>
            </div>

            {/* ══ CHOOSE mode (saved preference exists) ══ */}
            {mode === 'choose' && (
              <div style={{ marginBottom: 14 }}>
                {/* Option 1: saved team */}
                <div style={{
                  borderRadius: 12, border: `1.5px solid ${chosenOpt === 'saved' ? 'rgba(119,11,255,0.5)' : border}`,
                  background: chosenOpt === 'saved' ? optSel : 'transparent',
                  marginBottom: 7, overflow: 'hidden',
                  transition: 'border-color 0.14s',
                }}>
                  <div className="lip-opt" onClick={() => setChosenOpt('saved')} style={{
                    padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: chosenOpt === 'saved' ? 'linear-gradient(135deg,#770bff,#009bff)' : 'transparent',
                      border: chosenOpt === 'saved' ? 'none' : `1.5px solid ${subC}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff',
                    }}>{chosenOpt === 'saved' && '●'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: nameC, marginBottom: 2 }}>⭐ My saved team</div>
                      <div style={{ fontSize: 11, color: subC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {savedEmails.length} people · {savedNames.slice(0, 3).join(', ')}{savedNames.length > 3 ? '…' : ''}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setShowSavedList(v => !v); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
                      fontSize: 10, color: subC, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600, flexShrink: 0,
                    }}>{showSavedList ? 'Hide ▲' : 'View ▼'}</button>
                  </div>
                  {showSavedList && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: '8px 13px 10px', maxHeight: 120, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${border} transparent` }}>
                      {savedEmails.map(email => {
                        const member = teamMembers.find(m => m.email === email);
                        return (
                          <div key={email} style={{ fontSize: 11, color: subC, padding: '2px 0' }}>
                            {member ? member.name : email}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Option 2: whole HK */}
                <div className="lip-opt" onClick={() => setChosenOpt('hk')} style={{
                  borderRadius: 12, border: `1.5px solid ${chosenOpt === 'hk' ? 'rgba(119,11,255,0.5)' : border}`,
                  background: chosenOpt === 'hk' ? optSel : 'transparent',
                  padding: '10px 13px', marginBottom: 7,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: chosenOpt === 'hk' ? 'linear-gradient(135deg,#770bff,#009bff)' : 'transparent',
                    border: chosenOpt === 'hk' ? 'none' : `1.5px solid ${subC}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff',
                  }}>{chosenOpt === 'hk' && '●'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: nameC, marginBottom: 2 }}>👥 Whole HK team</div>
                    <div style={{ fontSize: 11, color: subC }}>{teamMembers.length} people</div>
                  </div>
                </div>

                {/* Option 3: customize */}
                <div className="lip-opt" onClick={() => { setSelected(new Set(savedEmails || teamMembers.map(m => m.email))); setMode('customize'); }} style={{
                  borderRadius: 12, border: `1.5px solid ${border}`,
                  background: 'transparent',
                  padding: '10px 13px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${subC}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: subC,
                  }}>✏️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: nameC, marginBottom: 2 }}>Customize</div>
                    <div style={{ fontSize: 11, color: subC }}>Choose exactly who gets this invite</div>
                  </div>
                  <div style={{ fontSize: 12, color: subC }}>›</div>
                </div>
              </div>
            )}

            {/* ══ SIMPLE mode ══ */}
            {mode === 'simple' && (
              <>
                <div style={{
                  background: night ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 12, padding: '11px 13px', marginBottom: 13,
                  border: `1px solid ${border}`,
                }}>
                  <div style={{ fontSize: 13, color: nameC, fontWeight: 600, marginBottom: 4 }}>📣 Notify the whole HK team</div>
                  <div style={{ fontSize: 12, color: subC, lineHeight: 1.6 }}>
                    A calendar invite goes to all {teamMembers.length} HK team members automatically.
                  </div>
                </div>
                <button onClick={() => setMode('customize')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'rgba(167,139,250,0.45)', fontWeight: 600,
                  padding: '0 0 13px', display: 'block', letterSpacing: '0.04em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Customize who receives this →
                </button>
              </>
            )}

            {/* ══ CUSTOMIZE mode ══ */}
            {mode === 'customize' && (
              <>
                {/* header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="lip-cb" onClick={() => {
                      const all = teamMembers.map(m => m.email);
                      setSelected(all.every(e => selected.has(e)) ? new Set() : new Set(all));
                    }} style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                      background: teamMembers.every(m => selected.has(m.email))
                        ? 'linear-gradient(135deg,#770bff,#009bff)'
                        : teamMembers.some(m => selected.has(m.email)) ? 'rgba(119,11,255,0.3)' : 'transparent',
                      border: teamMembers.every(m => selected.has(m.email)) ? 'none' : `1.5px solid ${subC}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff',
                    }}>
                      {teamMembers.every(m => selected.has(m.email)) ? '✓' : teamMembers.some(m => selected.has(m.email)) ? '–' : ''}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: subC, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      HK Team ({selected.size}/{teamMembers.length})
                    </span>
                  </div>
                  <button onClick={() => setMode(savedEmails ? 'choose' : 'simple')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'rgba(119,11,255,0.55)', fontWeight: 700,
                    padding: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>← Back</button>
                </div>

                {/* member list */}
                <div style={{
                  maxHeight: 180, overflowY: 'auto', marginBottom: 10,
                  borderRadius: 10, border: `1px solid ${border}`,
                  scrollbarWidth: 'thin', scrollbarColor: `${border} transparent`,
                }}>
                  {teamMembers.map((m, i) => (
                    <div key={m.email} className="lip-row" onClick={() => toggleMember(m.email)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 11px',
                      borderBottom: i < teamMembers.length - 1 ? `1px solid ${border}` : 'none',
                      background: selected.has(m.email) ? 'rgba(119,11,255,0.05)' : 'transparent',
                    }}>
                      <div style={{
                        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                        background: selected.has(m.email) ? 'linear-gradient(135deg,#770bff,#009bff)' : 'transparent',
                        border: selected.has(m.email) ? 'none' : `1.5px solid ${subC}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff',
                      }}>{selected.has(m.email) && '✓'}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: nameC, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                    </div>
                  ))}
                </div>

                {/* bulk add */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: subC, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Add more (paste emails)</div>
                  <textarea
                    placeholder={'james@company.com\nsara@agency.com'}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%', borderRadius: 9, padding: '7px 10px', fontSize: 11,
                      background: night ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${border}`, color: nameC, outline: 'none', resize: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box', lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* remember checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}
                  onClick={() => setRememberMe(r => !r)}>
                  <div style={{
                    width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                    background: rememberMe ? 'linear-gradient(135deg,#770bff,#009bff)' : 'transparent',
                    border: rememberMe ? 'none' : `1.5px solid ${subC}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff',
                    transition: 'all 0.15s',
                  }}>{rememberMe && '✓'}</div>
                  <span style={{ fontSize: 11, color: subC, fontWeight: 500 }}>
                    Remember this selection for next time
                  </span>
                </div>
              </>
            )}

            {/* ── actions ── */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSkip} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: 'transparent', border: `1px solid ${border}`, color: subC, cursor: 'pointer',
              }}>Not now</button>
              <button onClick={handleSend} disabled={sending || (mode === 'customize' && selected.size + parseBulk().length === 0)} style={{
                flex: 2, padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(90deg,#770bff,#009bff)',
                border: 'none', color: '#fff',
                cursor: (sending || (mode === 'customize' && selected.size + parseBulk().length === 0)) ? 'default' : 'pointer',
                opacity: (sending || (mode === 'customize' && selected.size + parseBulk().length === 0)) ? 0.55 : 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {sending ? 'Sending…' : sendLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
