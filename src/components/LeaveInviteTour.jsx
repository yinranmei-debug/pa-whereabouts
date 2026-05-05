import { useState, useEffect } from 'react';

const CARD_W = 320;
const CARD_H = 280;
const PAD = 8;

export default function LeaveInviteTour({ isDayMode, onDone }) {
  const [visible, setVisible]   = useState(true);
  const [box,     setBox]       = useState(null);
  const [cardPos, setCardPos]   = useState(null);

  const night  = !isDayMode;
  const nameC  = night ? '#fff'                   : '#1A1830';
  const subC   = night ? 'rgba(220,215,255,0.6)'  : 'rgba(26,24,48,0.55)';
  const border = night ? 'rgba(167,139,250,0.25)' : 'rgba(119,11,255,0.15)';

  const measure = () => {
    const el = document.querySelector('#my-row .sh.mine') || document.querySelector('.sh.mine');
    if (!el) { setBox(null); setCardPos(null); return; }
    const r = el.getBoundingClientRect();
    const b = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
    setBox(b);

    // Position card above the spotlight
    let top  = r.top - CARD_H - 16;
    let left = r.left + r.width / 2 - CARD_W / 2;
    left = Math.max(12, Math.min(left, window.innerWidth  - CARD_W - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - CARD_H - 12));
    setCardPos({ top, left });
  };

  useEffect(() => {
    const t = setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => { setVisible(false); onDone(); };

  const overlayStyle = { position: 'fixed', background: 'rgba(4,13,26,0.82)', zIndex: 15400, pointerEvents: 'none' };

  const card = (
    <div style={{
      position: 'fixed',
      top:  cardPos ? cardPos.top  : undefined,
      left: cardPos ? cardPos.left : undefined,
      bottom: cardPos ? undefined : 28,
      right:  cardPos ? undefined : 28,
      width: CARD_W,
      zIndex: 15500,
      borderRadius: 20,
      background: night ? 'rgba(12,8,32,0.97)' : 'rgba(255,255,255,0.98)',
      border: `1px solid ${border}`,
      boxShadow: night
        ? '0 24px 64px rgba(0,0,0,0.65), 0 4px 20px rgba(119,11,255,0.25)'
        : '0 16px 48px rgba(119,11,255,0.14), 0 4px 16px rgba(0,0,0,0.08)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'litIn 0.36s cubic-bezier(0.34,1.56,0.64,1)',
      overflow: 'hidden',
    }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#770bff,#009bff)' }} />

      <div style={{ padding: '18px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="lit-finger" style={{ fontSize: 28 }}>👆</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: nameC, lineHeight: 1.2 }}>New: Leave Invite</div>
              <div style={{ fontSize: 11, color: 'rgba(139,92,246,0.9)', fontWeight: 600, marginTop: 2 }}>Auto-notify your team</div>
            </div>
          </div>
          <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subC, fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ fontSize: 12, color: subC, lineHeight: 1.65, marginBottom: 14 }}>
          When you mark yourself as{' '}
          <span style={{ color: nameC, fontWeight: 700 }}>Annual Leave, Sick Leave</span>{' '}
          or any leave type in your row, a prompt will appear to send a calendar invite to your HK team — straight from{' '}
          <span style={{ color: 'rgba(139,92,246,0.9)', fontWeight: 600 }}>hr.apac@pattern.com</span>.
        </div>

        <div style={{
          background: night ? 'rgba(119,11,255,0.08)' : 'rgba(119,11,255,0.05)',
          border: `1px solid ${border}`, borderRadius: 10, padding: '9px 12px', marginBottom: 14,
        }}>
          {[
            ['1', 'Click your AM or PM cell'],
            ['2', 'Select Annual Leave (or any leave)'],
            ['3', 'Choose who to notify → Send'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: n === '3' ? 0 : 6 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#770bff,#009bff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff',
              }}>{n}</div>
              <span style={{ fontSize: 11, color: nameC, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={dismiss} style={{
          width: '100%', padding: '10px 0', borderRadius: 10,
          background: 'linear-gradient(90deg,#770bff,#009bff)',
          border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Got it!
        </button>
      </div>
    </div>
  );

  if (!box) {
    return (
      <>
        <style>{`
          @keyframes litIn { from{opacity:0;transform:translateY(20px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          .lit-finger { animation: bob 1.2s ease-in-out infinite; display:inline-block; }
        `}</style>
        {card}
      </>
    );
  }

  const { top: bt, left: bl, width: bw, height: bh } = box;
  const br = bl + bw;
  const bb = bt + bh;

  return (
    <>
      <style>{`
        @keyframes litIn { from{opacity:0;transform:translateY(20px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .lit-finger { animation: bob 1.2s ease-in-out infinite; display:inline-block; }
        @keyframes spotlightPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,155,255,0.55), 0 0 0 0 rgba(119,11,255,0.25); }
          50%     { box-shadow: 0 0 0 7px rgba(0,155,255,0.12), 0 0 0 14px rgba(119,11,255,0.06); }
        }
        .lit-ring { animation: spotlightPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Dimming overlay — 4 rects around the spotlight */}
      <div style={{ ...overlayStyle, top: 0, left: 0, right: 0, height: Math.max(0, bt) }} />
      <div style={{ ...overlayStyle, top: Math.max(0, bb), left: 0, right: 0, bottom: 0 }} />
      <div style={{ ...overlayStyle, top: Math.max(0, bt), left: 0, width: Math.max(0, bl), height: Math.max(0, bh) }} />
      <div style={{ ...overlayStyle, top: Math.max(0, bt), left: Math.max(0, br), right: 0, height: Math.max(0, bh) }} />

      {/* Pulsing ring around the spotlight */}
      <div className="lit-ring" style={{
        position: 'fixed', top: bt, left: bl, width: bw, height: bh,
        border: '2px solid rgba(0,155,255,0.85)', borderRadius: 10,
        zIndex: 15401, pointerEvents: 'none', boxSizing: 'border-box',
      }} />

      {card}
    </>
  );
}
