import { useState } from 'react';
import { useFrame } from './SettlementChar';
import PatternBurst from './PatternBurst';

export default function LevelUpModal({ lvl, nextLevel, streak, onClose, onClaim }) {
  const frame = useFrame(true, 18);
  const [burst, setBurst] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const handleClaim = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setLeaving(true);
    setTimeout(() => onClaim && onClaim(), 500);
  };

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose && onClose(), 500);
  };

  // derive a readable body text color from the level's ring tint
  const bodyColor = `rgba(210,205,255,0.68)`;
  const accentColor = lvl.ringTo;

  return (
    <>
      <style>{`
        @keyframes lum-pop {
          0%   { opacity:0; transform:scale(0.82) translateY(32px); }
          65%  { transform:scale(1.02) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes lum-out {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.92) translateY(-18px); }
        }
        @keyframes lum-ringspin  { to { transform:rotate(360deg); } }
        @keyframes lum-ringspinr { to { transform:rotate(-360deg); } }
        @keyframes lum-fadein {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lum-btnpulse {
          0%, 100% { box-shadow: 0 0 28px ${lvl.ringTo}88, 0 6px 24px rgba(0,0,0,0.45); }
          50%       { box-shadow: 0 0 52px ${lvl.ringTo}cc, 0 6px 28px rgba(0,0,0,0.5); }
        }
        .lum-btn { transition: transform 0.2s !important; }
        .lum-btn:hover { transform: scale(1.07) !important; }
      `}</style>

      {/* Backdrop — not clickable to dismiss */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 15000,
        background: `radial-gradient(ellipse at 50% 60%, ${lvl.ringFrom}44 0%, rgba(4,2,14,0.92) 70%)`,
        backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'center',
        overflowY: 'auto',
        padding: '4vh 20px',
        animation: leaving ? 'lum-out 0.5s ease forwards' : undefined,
      }}>

        <div style={{
          width: 'clamp(480px, 66vw, 860px)',
          margin: 'auto',
          flexShrink: 0,
          borderRadius: 40,
          background: 'linear-gradient(160deg, rgba(10,6,28,0.99) 0%, rgba(16,8,40,0.99) 55%, rgba(12,6,34,0.99) 100%)',
          border: `1.5px solid ${lvl.ringFrom}44`,
          boxShadow: `0 0 140px ${lvl.ringFrom}33, 0 48px 120px rgba(0,0,0,0.8)`,
          overflow: 'hidden',
          animation: leaving ? 'lum-out 0.5s ease forwards' : 'lum-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>

          {/* top gradient bar */}
          <div style={{
            height: 4,
            background: `linear-gradient(90deg, transparent, ${lvl.ringFrom} 20%, ${lvl.ringTo} 50%, ${lvl.ringFrom} 80%, transparent)`,
          }} />

          <div style={{ padding: '52px 72px 72px' }}>

            {/* Large scene circle */}
            <div style={{ position: 'relative', width: 'min(320px, 42vw)', height: 'min(320px, 42vw)', margin: '0 auto 44px' }}>
              {/* outer slow ring */}
              <div style={{
                position: 'absolute', inset: '-10px', borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${lvl.ringFrom} 0%, ${lvl.ringTo} 35%, ${lvl.ringFrom} 60%, ${lvl.ringTo} 80%, ${lvl.ringFrom} 100%)`,
                filter: 'blur(14px)', opacity: 0.75,
                animation: 'lum-ringspin 10s linear infinite',
              }} />
              {/* inner counter-ring */}
              <div style={{
                position: 'absolute', inset: '-4px', borderRadius: '50%',
                background: `conic-gradient(from 180deg, transparent 0%, ${lvl.ringTo}88 40%, transparent 70%)`,
                animation: 'lum-ringspinr 6s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                boxShadow: `0 0 0 2.5px ${lvl.ringFrom}66, 0 0 50px ${lvl.ringTo}44`,
              }}>
                <lvl.Scene frame={frame} />
              </div>
            </div>

            {/* eyebrow */}
            <div style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.26em',
              color: lvl.tagFg, textTransform: 'uppercase', marginBottom: 18,
              animation: 'lum-fadein 0.45s 0.2s ease both',
            }}>
              Tier {lvl.week} · Unlocked
            </div>

            {/* headline */}
            <div style={{
              fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.12, marginBottom: 22,
              letterSpacing: '-0.02em',
              animation: 'lum-fadein 0.5s 0.32s ease both',
            }}>
              {lvl.title}<span style={{ color: accentColor }}>.</span>
            </div>

            {/* vibe body */}
            <div style={{
              fontSize: 18, color: bodyColor, lineHeight: 1.7,
              maxWidth: 520, margin: '0 auto 36px',
              animation: 'lum-fadein 0.5s 0.46s ease both',
            }}>
              {lvl.vibe}
            </div>

            {/* bottom actions — stacked center */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              animation: 'lum-fadein 0.5s 0.54s ease both',
            }}>

              {/* achievement rule */}
              <div style={{
                fontSize: 13, color: 'rgba(220,215,255,0.55)', fontWeight: 500,
                maxWidth: 380, lineHeight: 1.5,
              }}>
                {lvl.rule}
              </div>

              {/* CTA */}
              <button className="lum-btn" onClick={handleClaim} style={{
                padding: '18px 68px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${lvl.ringFrom} 0%, ${lvl.ringTo} 60%, ${lvl.ringFrom} 100%)`,
                color: '#0a0612', fontSize: 18, fontWeight: 800, letterSpacing: '0.08em',
                animation: 'lum-btnpulse 2.4s 1.2s ease-in-out infinite',
              }}>
                ✦ Claim Reward
              </button>

              {/* next tier nudge */}
              {nextLevel && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: `rgba(255,255,255,0.04)`,
                  border: `1px solid ${nextLevel.ringFrom}30`,
                  borderRadius: 100, padding: '7px 18px',
                }}>
                  <span style={{ fontSize: 13, color: nextLevel.ringFrom, fontWeight: 700 }}>→</span>
                  <span style={{ fontSize: 12, color: 'rgba(220,215,255,0.5)', fontWeight: 500 }}>
                    {lvl.nudgeTemplate
                      ? lvl.nudgeTemplate(nextLevel.weeksRequired - streak, nextLevel.title)
                      : `${nextLevel.weeksRequired - streak} more week${nextLevel.weeksRequired - streak > 1 ? 's' : ''} to unlock ${nextLevel.title}`}
                  </span>
                </div>
              )}

              {/* dismiss link */}
              <button onClick={handleClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                maybe later
              </button>
            </div>
          </div>
        </div>
      </div>

      {burst && (
        <PatternBurst
          origin={burst}
          palette={[lvl.ringFrom, lvl.ringTo, '#ffd060', '#ffffff', lvl.tagFg]}
          count={40}
          duration={2600}
          onDone={() => setBurst(null)}
        />
      )}
    </>
  );
}
