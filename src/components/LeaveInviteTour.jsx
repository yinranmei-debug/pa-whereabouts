import { useState } from 'react';

export default function LeaveInviteTour({ isDayMode, onDone }) {
  const [visible, setVisible] = useState(true);
  const night  = !isDayMode;
  const bg     = night ? 'rgba(12,8,32,0.97)'    : 'rgba(255,255,255,0.98)';
  const nameC  = night ? '#fff'                   : '#1A1830';
  const subC   = night ? 'rgba(220,215,255,0.6)'  : 'rgba(26,24,48,0.55)';
  const border = night ? 'rgba(167,139,250,0.25)' : 'rgba(119,11,255,0.15)';

  if (!visible) return null;

  const dismiss = () => { setVisible(false); onDone(); };

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 15500,
      width: 310, borderRadius: 20,
      background: bg, border: `1px solid ${border}`,
      boxShadow: night
        ? '0 24px 64px rgba(0,0,0,0.65), 0 4px 20px rgba(119,11,255,0.25)'
        : '0 16px 48px rgba(119,11,255,0.14), 0 4px 16px rgba(0,0,0,0.08)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      animation: 'litIn 0.36s cubic-bezier(0.34,1.56,0.64,1)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes litIn { from{opacity:0;transform:translateY(20px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .lit-finger { animation: bob 1.2s ease-in-out infinite; display:inline-block; }
      `}</style>

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
}
