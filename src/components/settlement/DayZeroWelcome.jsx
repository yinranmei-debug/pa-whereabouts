import { useState, useEffect } from 'react';
import { useFrame } from './SettlementChar';
import { SceneL0 } from './SettlementScenes';
import PatternBurst from './PatternBurst';

export default function DayZeroWelcome({ name, onDone }) {
  const frame = useFrame(true, 18);
  const [burst, setBurst] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // Fire burst immediately on mount from screen center
  useEffect(() => {
    setBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    // Auto-dismiss after 5.5s
    const t = setTimeout(() => handleDone(), 5500);
    return () => clearTimeout(t);
  }, []);

  const handleDone = () => {
    setLeaving(true);
    setTimeout(() => onDone && onDone(), 420);
  };

  return (
    <>
      <style>{`
        @keyframes dz-pop {
          0%   { opacity:0; transform:scale(0.7) translateY(24px); }
          60%  { transform:scale(1.04) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes dz-out {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.94) translateY(-12px); }
        }
        @keyframes dz-ringspin { to { transform:rotate(360deg); } }
        @keyframes dz-title-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 12000,
        background: 'rgba(6,4,18,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: leaving ? 'dz-out 0.42s ease forwards' : undefined,
      }} onClick={handleDone}>

        <div onClick={e => e.stopPropagation()} style={{
          width: 360, borderRadius: 28,
          background: 'linear-gradient(145deg,rgba(14,8,38,0.98) 0%,rgba(22,10,55,0.98) 100%)',
          border: '1.5px solid rgba(192,96,255,0.3)',
          boxShadow: '0 0 80px rgba(122,106,154,0.25), 0 30px 80px rgba(0,0,0,0.65)',
          padding: '32px 32px 28px',
          animation: leaving ? 'dz-out 0.42s ease forwards' : 'dz-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: 'relative', overflow: 'hidden',
        }}>
          {/* top gradient bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg,#7a6a9a,#c060ff,#7a6a9a)',
            backgroundSize: '200% auto',
            animation: 'dz-ringspin 3s linear infinite',
          }} />

          {/* Scene circle */}
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 22px' }}>
            {/* ring glow */}
            <div style={{
              position: 'absolute', inset: '-3px', borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #7a6a9a, #c060ff, #7a6a9a)',
              filter: 'blur(6px)', opacity: 0.7,
              animation: 'dz-ringspin 8s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
              boxShadow: '0 0 0 2px rgba(192,96,255,0.4), 0 0 28px rgba(192,96,255,0.35)',
            }}>
              <SceneL0 frame={frame} />
            </div>
          </div>

          {/* Wording */}
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
            color: 'rgba(192,96,255,0.7)', textTransform: 'uppercase', marginBottom: 8,
            animation: 'dz-title-in 0.4s 0.2s ease both',
          }}>
            Day Zero
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 10,
            animation: 'dz-title-in 0.4s 0.3s ease both',
          }}>
            Welcome{name ? `, ${name.split(' ')[0]}` : ''}!
          </div>
          <div style={{
            fontSize: 14, color: 'rgba(220,200,255,0.7)', lineHeight: 1.55, marginBottom: 24,
            animation: 'dz-title-in 0.4s 0.45s ease both',
          }}>
            You drop out of the sky onto a brand-new world.<br />
            <span style={{ color: 'rgba(192,96,255,0.9)', fontWeight: 600 }}>Awkward landing.</span>
          </div>

          {/* Begin button */}
          <button onClick={handleDone} style={{
            padding: '10px 32px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7a6a9a,#c060ff)',
            color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            boxShadow: '0 0 20px rgba(192,96,255,0.5)',
            transition: 'transform 0.15s, opacity 0.15s',
            animation: 'dz-title-in 0.4s 0.6s ease both',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Begin journey →
          </button>

          <div style={{
            marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.2)',
            animation: 'dz-title-in 0.4s 0.8s ease both',
          }}>
            Set your status 2+ days a week to level up
          </div>
        </div>
      </div>

      {burst && (
        <PatternBurst
          origin={burst}
          palette={['#c060ff', '#7a6a9a', '#e0a0ff', '#60d0ff', '#ffffff']}
          count={32}
          duration={2200}
          onDone={() => setBurst(null)}
        />
      )}
    </>
  );
}
