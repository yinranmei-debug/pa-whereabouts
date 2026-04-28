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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: leaving ? 'dz-out 0.5s ease forwards' : undefined,
      }}>

        <div style={{
          width: 'min(90vw, 580px)',
          borderRadius: 36,
          background: 'linear-gradient(160deg, rgba(14,7,40,0.99) 0%, rgba(22,9,58,0.99) 55%, rgba(18,6,48,0.99) 100%)',
          border: '1.5px solid rgba(192,96,255,0.3)',
          boxShadow: '0 0 120px rgba(140,60,255,0.22), 0 40px 100px rgba(0,0,0,0.75)',
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

          <div style={{ padding: '40px 52px 44px' }}>

            {/* Large scene circle */}
            <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto 36px' }}>
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
              fontSize: 11, fontWeight: 800, letterSpacing: '0.24em',
              color: 'rgba(192,96,255,0.7)', textTransform: 'uppercase', marginBottom: 14,
              animation: 'dz-fadein 0.45s 0.2s ease both',
            }}>
              Day Zero · First Landing
            </div>

            {/* headline */}
            <div style={{
              fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 18,
              letterSpacing: '-0.02em',
              animation: 'dz-fadein 0.5s 0.32s ease both',
            }}>
              {firstName ? (
                <>{firstName}<span style={{ color: 'rgba(192,96,255,0.9)' }}>,</span> you're here.</>
              ) : (
                <>You're here.</>
              )}
            </div>

            {/* narrative body */}
            <div style={{
              fontSize: 16, color: 'rgba(210,195,255,0.68)', lineHeight: 1.7,
              marginBottom: 36, maxWidth: 420, margin: '0 auto 36px',
              animation: 'dz-fadein 0.5s 0.46s ease both',
            }}>
              Your world just materialized out of nothing —
              no roads, no neighbors, just open ground and a horizon full of possibility.{' '}
              <span style={{ color: 'rgba(218,205,255,0.95)', fontWeight: 600 }}>
                Every week you show up, this place grows a little more alive.
              </span>
            </div>

            {/* CTA */}
            <button className="dz-btn" onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              handleDone();
            }} style={{
              padding: '16px 56px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7a6a9a 0%, #c060ff 60%, #9040e0 100%)',
              color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '0.08em',
              animation: 'dz-fadein 0.5s 0.6s ease both, dz-btnpulse 2.4s 1.2s ease-in-out infinite',
            }}>
              ✦ Start Building
            </button>

            <div style={{
              marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.05em',
              animation: 'dz-fadein 0.45s 0.8s ease both',
            }}>
              Check in 2+ days a week · watch your settlement grow
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
