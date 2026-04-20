import React, { useEffect, useRef } from 'react';

const T_EXPLODE = 4000;

export default function DimensionalBreachOverlay({ breach, chargingState }) {
  const portalRef = useRef(null);
  const portalShakeRef = useRef(null);
  const textShakeRef = useRef(null);
  const currentSizeRef = useRef(0);
  const rafRef = useRef();
  const shakeRafRef = useRef();
  const displacementRef = useRef(20);
  const filterRef = useRef(null);

  const isExploding = !!breach && (
    breach.phase === 'EXPLODING' ||
    breach.phase === 'IMPLODING' ||
    breach.phase === 'FLOATING'
  );
  const isCharging = !breach && !!chargingState && chargingState.progress > 0.5;
  const chargingProgress = chargingState?.progress || 0;
  const chargingUserCount = chargingState?.userCount || 0;

  // Reset portal size when fully back to IDLE
  useEffect(() => {
    if (!breach && !isCharging) {
      currentSizeRef.current = 0;
    }
  }, [breach, isCharging]);

  // Portal size animation
  useEffect(() => {
    const loop = () => {
      const el = portalRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const viewportMax = Math.max(window.innerWidth, window.innerHeight);

      let target = 0;
      if (breach?.phase === 'EXPLODING') target = viewportMax * (4 / 3);
      else if (breach?.phase === 'IMPLODING' || breach?.phase === 'FLOATING') target = 0;
      else if (isCharging) {
        const minSize = 80;
        const maxSize = viewportMax * 0.55;
        target = minSize + (maxSize - minSize) * Math.pow(chargingProgress / 100, 0.7);
      }

      const cur = currentSizeRef.current;
      const diff = target - cur;
      const newVal = Math.abs(diff) < 0.5 ? target : cur + diff * 0.12;
      currentSizeRef.current = newVal;
      el.style.width = `${newVal}px`;
      el.style.height = `${newVal}px`;

      const outerGlow = el.querySelector('[data-portal-glow]');
      const ringA = el.querySelector('[data-portal-ring-1]');
      const ringB = el.querySelector('[data-portal-ring-2]');
      const core = el.querySelector('[data-portal-core]');
      if (outerGlow) outerGlow.style.borderWidth = `${newVal * 0.04}px`;
      if (ringA) {
        ringA.style.borderTopWidth = `${newVal * 0.02}px`;
        ringA.style.borderLeftWidth = `${newVal * 0.02}px`;
      }
      if (ringB) {
        ringB.style.borderBottomWidth = `${newVal * 0.02}px`;
        ringB.style.borderRightWidth = `${newVal * 0.02}px`;
      }
      if (core) {
        core.style.boxShadow = `inset 0 0 ${newVal * 0.3}px rgba(168,85,247,0.9), inset 0 0 ${newVal * 0.12}px rgba(59,130,246,0.6)`;
      }

      let opacity = 0;
      if (breach?.phase === 'EXPLODING') opacity = 1;
      else if (isCharging) opacity = Math.min(1, chargingProgress / 10);
      el.style.opacity = opacity;

      const targetDisp = isCharging
        ? 20 + chargingProgress * 0.6
        : breach?.phase === 'EXPLODING'
        ? 80
        : 20;
      displacementRef.current += (targetDisp - displacementRef.current) * 0.1;
      if (filterRef.current) filterRef.current.setAttribute('scale', displacementRef.current.toFixed(1));

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [breach, isCharging, chargingProgress]);

  // Shake engine — only overlay elements
  useEffect(() => {
    const loop = () => {
      const portalEl = portalShakeRef.current;
      const textEl = textShakeRef.current;

      let portalX = 0, portalY = 0;
      let textX = 0, textY = 0;

      if (breach?.phase === 'EXPLODING') {
        portalX = (Math.random() - 0.5) * 14;
        portalY = (Math.random() - 0.5) * 14;
        textX = (Math.random() - 0.5) * 20;
        textY = (Math.random() - 0.5) * 20;
      } else if (breach?.phase === 'IMPLODING') {
        portalX = (Math.random() - 0.5) * 6;
        portalY = (Math.random() - 0.5) * 6;
      } else if (isCharging && chargingProgress > 30) {
        const base = Math.pow((chargingProgress - 30) / 70, 1.4) * 10;
        const t = performance.now() / 70;
        portalX = Math.sin(t * 0.6) * base + (Math.random() - 0.5) * base * 0.4;
        portalY = Math.cos(t * 0.52) * base + (Math.random() - 0.5) * base * 0.4;
      }

      if (portalEl) portalEl.style.transform = `translate3d(${portalX}px, ${portalY}px, 0)`;
      if (textEl) textEl.style.transform = `translate(-50%, -50%) translate3d(${textX}px, ${textY}px, 0)`;

      shakeRafRef.current = requestAnimationFrame(loop);
    };
    shakeRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(shakeRafRef.current);
  }, [breach, isCharging, chargingProgress]);

  const showAnything = !!breach || isCharging;
  const pr = Math.min(100, Math.max(0, chargingProgress));
  const isNearFull = pr > 75;

  return (
    <>
      {showAnything && (
        <>
          {breach?.phase === 'EXPLODING' && (
            <div
              style={{
                position: 'fixed', inset: 0, background: 'white',
                zIndex: 11500, pointerEvents: 'none', opacity: 0,
                animation: 'breachFlash 450ms ease-out forwards',
              }}
            />
          )}

          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'radial-gradient(circle at center, rgba(10,0,30,0.85) 0%, rgba(0,0,0,0.95) 70%)',
              zIndex: 11350, pointerEvents: 'none',
              opacity: isExploding
                ? breach.phase === 'EXPLODING' ? 1 : breach.phase === 'IMPLODING' ? 0.5 : 0
                : isCharging
                ? Math.min(0.65, (chargingProgress / 100) * 0.75)
                : 0,
              transition: 'opacity 400ms ease-out',
            }}
          />

          {/* Portal */}
          <div
            ref={portalShakeRef}
            style={{
              position: 'fixed', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', zIndex: 11600,
              willChange: 'transform',
            }}
          >
            <div
              ref={portalRef}
              style={{
                width: 0, height: 0, position: 'relative',
                filter: 'url(#breach-portal-filter)',
              }}
            >
              <div
                data-portal-glow
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  borderStyle: 'solid', borderColor: 'rgba(79,70,229,0.3)',
                  filter: 'blur(24px)',
                  animation: 'breachPulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                data-portal-ring-1
                style={{
                  position: 'absolute',
                  top: '2%', left: '2%', right: '2%', bottom: '2%',
                  borderRadius: '50%', borderStyle: 'solid',
                  borderWidth: '2px', borderColor: 'transparent',
                  borderTopColor: '#a855f7', borderLeftColor: '#a855f7',
                  animation: 'breachSpin 0.8s linear infinite',
                }}
              />
              <div
                data-portal-ring-2
                style={{
                  position: 'absolute',
                  top: '12%', left: '12%', right: '12%', bottom: '12%',
                  borderRadius: '50%', borderStyle: 'solid',
                  borderWidth: '2px', borderColor: 'transparent',
                  borderBottomColor: '#60a5fa', borderRightColor: '#60a5fa',
                  animation: 'breachSpin 0.45s linear infinite reverse',
                }}
              />
              <div
                data-portal-core
                style={{
                  position: 'absolute',
                  top: '8%', left: '8%', right: '8%', bottom: '8%',
                  borderRadius: '50%', overflow: 'hidden',
                  background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #000 70%)',
                }}
              >
                <div
                  style={{
                    position: 'absolute', inset: 0, opacity: 0.5,
                    background: 'radial-gradient(circle, white 0%, transparent 65%)',
                    animation: 'breachPing 1.8s cubic-bezier(0,0,0.2,1) infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.4) 25%, transparent 50%, rgba(59,130,246,0.4) 75%, transparent 100%)',
                    animation: 'breachSpin 3s linear infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Middle status text */}
          {isCharging && (
            <div
              style={{
                position: 'fixed',
                top: '72%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 11650,
                pointerEvents: 'none',
                textAlign: 'center',
                animation: 'chargingFadeIn 400ms ease-out',
              }}
            >
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.5em', textTransform: 'uppercase',
                  color: 'rgba(199,210,254,0.9)',
                  textShadow: '0 0 20px rgba(129,140,248,0.6), 0 2px 10px rgba(0,0,0,0.8)',
                  marginBottom: 6,
                }}
              >
                {chargingProgress < 40
                  ? 'energy signal detected'
                  : chargingProgress < 75
                  ? 'the rift is widening'
                  : 'almost there'}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 9, fontWeight: 500, letterSpacing: '0.3em',
                  color: 'rgba(255,255,255,0.4)', fontStyle: 'italic',
                }}
              >
                {chargingProgress < 40
                  ? 'keep going...'
                  : chargingProgress < 75
                  ? 'pressure building'
                  : 'breakthrough imminent'}
              </div>
            </div>
          )}

          {/* FULL-WIDTH ENERGY BAR at bottom */}
          {isCharging && (
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 11680,
                pointerEvents: 'none',
                padding: '20px 32px 24px 32px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                animation: 'energyBarFadeIn 500ms ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                  maxWidth: 1600,
                  margin: '0 auto 10px auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 900,
                      fontStyle: 'italic',
                      fontSize: 'clamp(32px, 4vw, 54px)',
                      lineHeight: 1,
                      background: isNearFull
                        ? 'linear-gradient(90deg, #fde047 0%, #c084fc 100%)'
                        : 'linear-gradient(90deg, #a5b4fc 0%, #c084fc 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.6))',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {Math.round(pr)}%
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'rgba(199,210,254,0.7)',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Energy
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: chargingUserCount >= 2 ? '#a855f7' : '#6366f1',
                      boxShadow: '0 0 12px currentColor',
                      animation: 'energyDot 1.2s ease-in-out infinite',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {chargingUserCount >= 2
                      ? `${chargingUserCount} teammates`
                      : 'solo'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  maxWidth: 1600,
                  margin: '0 auto',
                  height: 10,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow:
                    'inset 0 1px 2px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.2)',
                }}
              >
                <div
                  style={{
                    width: `${pr}%`,
                    height: '100%',
                    background: isNearFull
                      ? 'linear-gradient(90deg, #6366f1 0%, #a855f7 40%, #c084fc 70%, #fde047 100%)'
                      : 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)',
                    borderRadius: 999,
                    boxShadow: isNearFull
                      ? '0 0 24px rgba(168,85,247,0.9), 0 0 48px rgba(192,132,252,0.6)'
                      : '0 0 16px rgba(99,102,241,0.7)',
                    transition: 'width 180ms ease-out',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: 60,
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 100%)',
                      opacity: 0.8,
                      animation: 'energyShimmer 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Explosion text */}
          {(breach?.phase === 'EXPLODING' || breach?.phase === 'IMPLODING') && (
            <div
              ref={textShakeRef}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 11700, pointerEvents: 'none', padding: 48,
                opacity: breach.phase === 'IMPLODING' ? 0 : 1,
                transition: 'opacity 500ms ease-out',
                willChange: 'transform',
              }}
            >
              <div className="breach-pop" style={{ textAlign: 'center', maxWidth: 1200 }}>
                <h2
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900, fontSize: 'clamp(48px, 8vw, 120px)',
                    fontStyle: 'italic', textTransform: 'uppercase',
                    letterSpacing: '-0.04em', lineHeight: 0.95,
                    margin: '0 0 32px 0',
                    background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 25%, #6366f1 50%, #a855f7 75%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.95)) drop-shadow(0 10px 24px rgba(99,102,241,0.55))',
                  }}
                >
                  YOUR ENERGY BROKE<br />THE DIMENSIONAL WALL!
                </h2>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 'clamp(16px, 2vw, 28px)',
                    fontWeight: 300, fontStyle: 'italic',
                    letterSpacing: '0.02em', maxWidth: 720, margin: '0 auto',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  }}
                >
                  What you asked for is on its way.
                </p>
              </div>
            </div>
          )}

          {breach?.phase === 'FLOATING' && (
            <div
              style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', zIndex: 11700,
                animation: 'receivedFloat 500ms ease-out',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: 'rgba(165,180,252,0.8)',
                    fontSize: 14, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.6em',
                  }}
                >
                  · received ·
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <filter id="breach-portal-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="8">
            <animate attributeName="baseFrequency" values="0.04;0.06;0.04" dur="2.4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={filterRef} in="SourceGraphic" scale="20" />
        </filter>
      </svg>

      <style>{`
        @keyframes breachFlash {
          0%   { opacity: 0; }
          20%  { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes breachSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes breachPulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes breachPing {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes breachPop {
          0%   { transform: scale(0.4) translateY(100px) rotate(-10deg); opacity: 0; }
          7%   { transform: scale(1.15) translateY(0) rotate(2deg); opacity: 1; }
          11%  { transform: scale(1) rotate(0); }
          90%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .breach-pop {
          animation: breachPop ${T_EXPLODE}ms cubic-bezier(0.2,0,0.2,1) forwards;
        }
        @keyframes receivedFloat {
          0%   { opacity: 0; transform: translateY(15px); }
          50%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes chargingFadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes energyBarFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes energyShimmer {
          0%   { opacity: 0.3; transform: translateX(-30px); }
          50%  { opacity: 1; transform: translateX(0); }
          100% { opacity: 0.3; transform: translateX(-30px); }
        }
        @keyframes energyDot {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}