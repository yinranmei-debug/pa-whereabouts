import { useState, useEffect } from 'react';

export default function AvatarNudge({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDone && onDone(), 350);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes an-in {
          from { opacity:0; transform:translateY(-8px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes an-out {
          from { opacity:1; transform:translateY(0) scale(1); }
          to   { opacity:0; transform:translateY(-6px) scale(0.95); }
        }
        @keyframes an-arrow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>

      {/* Subtle backdrop to block stray clicks, but not full-dark */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 13500,
        background: 'rgba(0,0,0,0.18)',
      }} onClick={dismiss} />

      {/* Arrow pointing up at the avatar */}
      <div style={{
        position: 'fixed', top: 52, right: 28, zIndex: 13600,
        animation: leaving ? 'an-out 0.35s ease forwards' : 'an-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* upward arrow */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', paddingRight: 20,
          marginBottom: 2,
          animation: 'an-arrow 1.2s ease-in-out infinite',
        }}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M8 18 L8 2 M3 7 L8 2 L13 7" stroke="rgba(192,96,255,0.9)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Callout card */}
        <div onClick={e => e.stopPropagation()} style={{
          width: 230,
          background: 'linear-gradient(145deg, rgba(14,7,40,0.98), rgba(22,9,58,0.98))',
          border: '1px solid rgba(192,96,255,0.35)',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(192,96,255,0.1)',
          padding: '14px 16px 14px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0',
            background: 'linear-gradient(90deg, #7a6a9a, #c060ff)',
          }} />

          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(192,96,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
            Your Journey
          </div>
          <div style={{ fontSize: 13, color: 'rgba(218,205,255,0.88)', lineHeight: 1.55, fontWeight: 500 }}>
            Tap your avatar anytime to track your settlement and see how your world is growing.
          </div>

          <button onClick={dismiss} style={{
            marginTop: 12, width: '100%',
            padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7a6a9a, #c060ff)',
            color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            Got it ✦
          </button>
        </div>
      </div>
    </>
  );
}
