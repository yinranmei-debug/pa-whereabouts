import { useState, useEffect } from 'react';
import { useFrame } from './SettlementChar';
import { SceneL0 } from './SettlementScenes';
import PatternBurst from './PatternBurst';

export default function DayZeroWelcome({ name, onDone }) {
  const frame = useFrame(true, 18);
  const [burst, setBurst] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const firstName = name ? name.split(' ')[0] : null;

  // No auto-dismiss — only the button closes it

  const handleDone = () => {
    setLeaving(true);
    setTimeout(() => onDone && onDone(), 500);
  };

  return (
    <>
      <style>{`
        @keyframes dz-pop {
          0%   { opacity:0; transform:scale(0.82) translateY(32px); }
          65%  { transform:scale(1.02) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes dz-out {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.92) translateY(-18px); }
        }
        @keyframes dz-ringspin  { to { transform:rotate(360deg); } }
        @keyframes dz-ringspinr { to { transform:rotate(-360deg); } }
        @keyframes dz-fadein {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dz-btnpulse {
          0%, 100% { box-shadow: 0 0 28px rgba(192,96,255,0.55), 0 6px 24px rgba(0,0,0,0.45); }
          50%       { box-shadow: 0 0 52px rgba(192,96,255,0.9),  0 6px 28px rgba(0,0,0,0.5); }
        }
        @keyframes dz-orbitspin {
          to { transform: rotate(360deg); }
        }
        .dz-btn { transition: transform 0.2s !important; }
        .dz-btn:hover { transform: scale(1.07) !important; }
      `}</style>

      {/* Backdrop — intentionally NOT clickable to dismiss */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 12000,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(80,20,140,0.35) 0%, rgba(4,2,14,0.92) 70%)',
        backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'center',
        overflowY: 'auto',
        padding: '4vh 20px',
        animation: leaving ? 'dz-out 0.5s ease forwards' : undefined,
      }}>

        <div style={{
          width: 'clamp(480px, 66vw, 860px)',
          margin: 'auto',
          flexShrink: 0,
          borderRadius: 40,
          background: 'linear-gradient(160deg, rgba(14,7,40,0.99) 0%, rgba(22,9,58,0.99) 55%, rgba(18,6,48,0.99) 100%)',
          border: '1.5px solid rgba(192,96,255,0.3)',
          boxShadow: '0 0 140px rgba(140,60,255,0.25), 0 48px 120px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          animation: leaving ? 'dz-out 0.5s ease forwards' : 'dz-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>

          {/* top gradient bar */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, transparent, #7a6a9a 20%, #c060ff 50%, #7a6a9a 80%, transparent)',
          }} />

          <div style={{ padding: '52px 72px 72px' }}>

            {/* Large scene circle */}
            <div style={{ position: 'relative', width: 'min(320px, 42vw)', height: 'min(320px, 42vw)', margin: '0 auto 44px' }}>
              {/* outer slow ring */}
              <div style={{
                position: 'absolute', inset: '-10px', borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #7a6a9a 0%, #c060ff 35%, #9060e0 60%, #c060ff 80%, #7a6a9a 100%)',
                filter: 'blur(14px)', opacity: 0.7,
                animation: 'dz-ringspin 10s linear infinite',
              }} />
              {/* inner counter-ring */}
              <div style={{
                position: 'absolute', inset: '-4px', borderRadius: '50%',
                background: 'conic-gradient(from 180deg, transparent 0%, rgba(192,96,255,0.6) 40%, transparent 70%)',
                animation: 'dz-ringspinr 6s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 0 0 2.5px rgba(192,96,255,0.45), 0 0 50px rgba(192,96,255,0.28)',
              }}>
                <SceneL0 frame={frame} />
              </div>
            </div>

            {/* eyebrow */}
            <div style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.26em',
              color: 'rgba(192,96,255,0.7)', textTransform: 'uppercase', marginBottom: 18,
              animation: 'dz-fadein 0.45s 0.2s ease both',
            }}>
              Day Zero · First Landing
            </div>

            {/* headline */}
            <div style={{
              fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.12, marginBottom: 22,
              letterSpacing: '-0.02em',
              animation: 'dz-fadein 0.5s 0.32s ease both',
            }}>
              {firstName ? (
                <>Welcome<span style={{ color: 'rgba(192,96,255,0.9)' }}>,</span> {firstName}<span style={{ color: 'rgba(192,96,255,0.9)' }}>!</span></>
              ) : (
                <>Welcome<span style={{ color: 'rgba(192,96,255,0.9)' }}>!</span></>
              )}
            </div>

            {/* narrative body */}
            <div style={{
              fontSize: 18, color: 'rgba(210,195,255,0.68)', lineHeight: 1.7,
              maxWidth: 520, margin: '0 auto 44px',
              animation: 'dz-fadein 0.5s 0.46s ease both',
            }}>
              No roads. No neighbors. Just you and a planet that needs building.{' '}
              <span style={{ color: 'rgba(218,205,255,0.95)', fontWeight: 600 }}>
                Show up, and watch this place come alive.
              </span>
            </div>

            {/* CTA */}
            <button className="dz-btn" onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              handleDone();
            }} style={{
              padding: '18px 68px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7a6a9a 0%, #c060ff 60%, #9040e0 100%)',
              color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '0.08em',
              animation: 'dz-fadein 0.5s 0.6s ease both, dz-btnpulse 2.4s 1.2s ease-in-out infinite',
            }}>
              ✦ Start Building
            </button>

            <div style={{
              marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.05em',
              animation: 'dz-fadein 0.45s 0.8s ease both',
            }}>
              2 days a week · your world takes shape
            </div>
          </div>
        </div>
      </div>

      {burst && (
        <PatternBurst
          origin={burst}
          palette={['#c060ff', '#9060e0', '#e0a0ff', '#7a6a9a', '#ffffff']}
          count={40}
          duration={2600}
          onDone={() => setBurst(null)}
        />
      )}
    </>
  );
}
