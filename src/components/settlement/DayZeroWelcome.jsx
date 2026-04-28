import { useState, useEffect } from 'react';
import { useFrame } from './SettlementChar';
import { SceneL0 } from './SettlementScenes';
import PatternBurst from './PatternBurst';

export default function DayZeroWelcome({ name, onDone }) {
  const frame = useFrame(true, 18);
  const [burst, setBurst] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const firstName = name ? name.split(' ')[0] : null;

  useEffect(() => {
    setBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const t = setTimeout(() => handleDone(), 8000);
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
          0%   { opacity:0; transform:scale(0.75) translateY(28px); }
          65%  { transform:scale(1.03) translateY(-3px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes dz-out {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.93) translateY(-14px); }
        }
        @keyframes dz-ringspin { to { transform:rotate(360deg); } }
        @keyframes dz-fadein {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dz-btnpulse {
          0%, 100% { box-shadow: 0 0 22px rgba(192,96,255,0.55), 0 4px 16px rgba(0,0,0,0.4); }
          50%       { box-shadow: 0 0 40px rgba(192,96,255,0.85), 0 4px 20px rgba(0,0,0,0.4); }
        }
        .dz-btn:hover { transform: scale(1.06) !important; }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 12000,
        background: 'rgba(4,2,14,0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: leaving ? 'dz-out 0.42s ease forwards' : undefined,
      }} onClick={handleDone}>

        <div onClick={e => e.stopPropagation()} style={{
          width: 380, borderRadius: 28,
          background: 'linear-gradient(150deg,rgba(12,6,34,0.99) 0%,rgba(20,8,52,0.99) 100%)',
          border: '1.5px solid rgba(192,96,255,0.28)',
          boxShadow: '0 0 100px rgba(122,106,154,0.2), 0 32px 80px rgba(0,0,0,0.7)',
          padding: '0 0 28px',
          animation: leaving ? 'dz-out 0.42s ease forwards' : 'dz-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: 'hidden',
        }}>

          {/* gradient top bar */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg,transparent,#7a6a9a,#c060ff,#7a6a9a,transparent)',
          }} />

          <div style={{ padding: '28px 32px 0' }}>
            {/* Scene circle */}
            <div style={{ position: 'relative', width: 148, height: 148, margin: '0 auto 24px' }}>
              <div style={{
                position: 'absolute', inset: '-4px', borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #7a6a9a, #c060ff, #9060e0, #7a6a9a)',
                filter: 'blur(8px)', opacity: 0.75,
                animation: 'dz-ringspin 8s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 0 0 2px rgba(192,96,255,0.4), 0 0 36px rgba(192,96,255,0.3)',
              }}>
                <SceneL0 frame={frame} />
              </div>
            </div>

            {/* eyebrow */}
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.22em',
              color: 'rgba(192,96,255,0.65)', textTransform: 'uppercase', marginBottom: 10,
              animation: 'dz-fadein 0.4s 0.15s ease both',
            }}>
              Day Zero · First Landing
            </div>

            {/* headline — name woven in */}
            <div style={{
              fontSize: 23, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 14,
              animation: 'dz-fadein 0.45s 0.28s ease both',
            }}>
              {firstName ? (
                <>{firstName}<span style={{ color: 'rgba(192,96,255,0.85)' }}>,</span> you're here.</>
              ) : (
                <>You're here.</>
              )}
            </div>

            {/* narrative body */}
            <div style={{
              fontSize: 14, color: 'rgba(210,195,255,0.72)', lineHeight: 1.65,
              marginBottom: 26,
              animation: 'dz-fadein 0.45s 0.42s ease both',
            }}>
              Your world just materialized out of nothing —
              no roads, no neighbors, just open ground.{' '}
              <span style={{ color: 'rgba(210,195,255,0.95)', fontWeight: 500 }}>
                Every week you show up, this place grows a little more alive.
              </span>
            </div>

            {/* CTA button */}
            <button className="dz-btn" onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              handleDone();
            }} style={{
              display: 'inline-block',
              padding: '12px 40px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7a6a9a, #c060ff)',
              color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em',
              animation: 'dz-fadein 0.45s 0.58s ease both, dz-btnpulse 2.2s 1s ease-in-out infinite',
              transition: 'transform 0.18s',
            }}>
              ✦ Start Building
            </button>

            <div style={{
              marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.18)',
              animation: 'dz-fadein 0.4s 0.75s ease both',
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
          count={36}
          duration={2400}
          onDone={() => setBurst(null)}
        />
      )}
    </>
  );
}
