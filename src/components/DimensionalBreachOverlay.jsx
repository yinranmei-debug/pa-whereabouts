import React, { useEffect, useRef, useState } from 'react';

const T_EXPLODE = 4000;
const DEBUG_ENABLED_BY_DEFAULT = true;

export default function DimensionalBreachOverlay({ breach, chargingState }) {
  const portalRef = useRef(null);
  const portalShakeRef = useRef(null);
  const textShakeRef = useRef(null);
  const currentSizeRef = useRef(0);
  const rafRef = useRef();
  const shakeRafRef = useRef();

  const quakeRef = useRef({
    portal: { x: 0, y: 0 },
    text: { x: 0, y: 0 },
  });

  const phaseRef = useRef(null);
  const progressRef = useRef(0);
  const isChargingRef = useRef(false);

  const [showDebug, setShowDebug] = useState(DEBUG_ENABLED_BY_DEFAULT);
  const [debugStats, setDebugStats] = useState({ portalSize: 0, fps: 60 });
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'd' || e.key === 'D') setShowDebug(prev => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!showDebug) return;
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastFpsUpdateRef.current;
      const fps = elapsed > 0 ? Math.round((frameCountRef.current * 1000) / elapsed) : 60;
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
      setDebugStats({
        portalSize: currentSizeRef.current,
        fps,
      });
    }, 500);
    return () => clearInterval(interval);
  }, [showDebug]);

  const isExploding = !!breach && (
    breach.phase === 'EXPLODING' ||
    breach.phase === 'IMPLODING' ||
    breach.phase === 'FLOATING'
  );
  const isCharging = !breach && !!chargingState && chargingState.progress > 0.5;
  const chargingProgress = chargingState?.progress || 0;
  const chargingUserCount = chargingState?.userCount || 0;

  const showPortal = isCharging ? chargingProgress >= 30 : isExploding;

  useEffect(() => {
    phaseRef.current = breach?.phase || null;
    progressRef.current = chargingProgress;
    isChargingRef.current = isCharging;
  }, [breach, chargingProgress, isCharging]);

  useEffect(() => {
    if (!breach && !isCharging) {
      currentSizeRef.current = 0;
    }
    if (breach?.phase === 'FLOATING') {
      currentSizeRef.current = 0;
    }
  }, [breach, isCharging]);

  // Portal size animation
  useEffect(() => {
    const loop = () => {
      frameCountRef.current++;

      const el = portalRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const diagonal = Math.sqrt(
        window.innerWidth * window.innerWidth +
        window.innerHeight * window.innerHeight
      );

      const chargingMaxSize = window.innerHeight * 0.85;
      const explodingMaxSize = diagonal * 1.25;

      let target = 0;
      if (breach?.phase === 'EXPLODING') {
        target = explodingMaxSize;
      } else if (breach?.phase === 'IMPLODING' || breach?.phase === 'FLOATING') {
        target = 0;
      } else if (isCharging && chargingProgress >= 30) {
        const minSize = 80;
        const localProgress = (chargingProgress - 30) / 70;
        target = minSize + (chargingMaxSize - minSize) * Math.pow(localProgress, 0.7);
      }

      const cur = currentSizeRef.current;
      const diff = target - cur;
      const newVal = Math.abs(diff) < 0.5 ? target : cur + diff * 0.12;
      currentSizeRef.current = newVal;
      el.style.width = `${newVal}px`;
      el.style.height = `${newVal}px`;

      // 🎯 SMART: Only apply SVG filter when small enough to afford it
      // Below 500px: filter on (looks lava-like)
      // Above 500px: filter off (too expensive, but size hides lack of detail)
      const shouldFilter = newVal > 0 && newVal < 500;
      const filterValue = shouldFilter ? 'url(#breach-turbulence)' : 'none';
      if (el.style.filter !== filterValue) {
        el.style.filter = filterValue;
      }

      let opacity = 0;
      if (breach?.phase === 'EXPLODING') opacity = 1;
      else if (breach?.phase === 'IMPLODING') {
        opacity = newVal > 5 ? Math.min(1, newVal / 200) : 0;
      }
      else if (isCharging && chargingProgress >= 30) {
        opacity = Math.min(1, (chargingProgress - 30) / 10);
      }
      el.style.opacity = opacity;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [breach, isCharging, chargingProgress]);

  // Shake engine — only portal + text, throttled to 30fps
  useEffect(() => {
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const loop = (now) => {
      if (now - lastFrameTime < FRAME_INTERVAL) {
        shakeRafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastFrameTime = now;

      const ph = phaseRef.current;
      const pr = progressRef.current;
      const charging = isChargingRef.current;

      let portalX = 0, portalY = 0;
      let textX = 0, textY = 0;

      if (ph === 'EXPLODING') {
        portalX = (Math.random() - 0.5) * 10;
        portalY = (Math.random() - 0.5) * 10;
        textX = (Math.random() - 0.5) * 18;
        textY = (Math.random() - 0.5) * 18;
      } else if (ph === 'IMPLODING') {
        portalX = (Math.random() - 0.5) * 4;
        portalY = (Math.random() - 0.5) * 4;
      } else if (charging && pr > 5) {
        const base = Math.pow(pr / 100, 1.2) * 8;
        const t = performance.now() / 70;
        portalX = Math.sin(t * 0.6) * base * 0.5;
        portalY = Math.cos(t * 0.52) * base * 0.5;
      }

      const q = quakeRef.current;
      q.portal.x += (portalX - q.portal.x) * 0.4;
      q.portal.y += (portalY - q.portal.y) * 0.4;
      q.text.x += (textX - q.text.x) * 0.4;
      q.text.y += (textY - q.text.y) * 0.4;

      if (portalShakeRef.current) {
        portalShakeRef.current.style.transform = `translate3d(${q.portal.x}px, ${q.portal.y}px, 0)`;
      }
      if (textShakeRef.current) {
        textShakeRef.current.style.transform = `translate(-50%, -50%) translate3d(${q.text.x}px, ${q.text.y}px, 0)`;
      }

      shakeRafRef.current = requestAnimationFrame(loop);
    };
    shakeRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(shakeRafRef.current);
  }, []);

  const showAnything = !!breach || isCharging;
  const pr = Math.min(100, Math.max(0, chargingProgress));
  const isNearFull = pr > 75;

  return (
    <>
      {showDebug && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 99999,
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.88)',
            color: '#a5f3fc',
            fontFamily: 'monospace',
            fontSize: 11,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #a855f7',
            minWidth: 220,
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#fde047', fontWeight: 'bold', marginBottom: 6 }}>
            🔬 BREACH (D to toggle)
          </div>
          <div>
            PHASE: <span style={{ color: breach?.phase ? '#fb7185' : '#4ade80' }}>
              {breach?.phase || 'IDLE'}
            </span>
          </div>
          <div>PROGRESS: <span style={{ color: '#c084fc' }}>{(chargingState?.progress || 0).toFixed(1)}%</span></div>
          <div>PORTAL: <span style={{ color: '#f472b6' }}>{debugStats.portalSize.toFixed(0)}px</span></div>
          <div>
            FPS: <span style={{ color: debugStats.fps < 30 ? '#fb7185' : debugStats.fps < 50 ? '#fbbf24' : '#4ade80' }}>
              {debugStats.fps}
            </span>
          </div>
        </div>
      )}

      {showAnything && (
        <>
          {/* DARK VEIL */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 11350,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at center, rgba(10,0,30,0.85) 0%, rgba(0,0,0,0.95) 70%)',
              opacity: isExploding
                ? breach.phase === 'EXPLODING' ? 1 : breach.phase === 'IMPLODING' ? 0.5 : 0
                : isCharging
                ? Math.min(0.65, (chargingProgress / 100) * 0.75)
                : 0,
              transition: 'opacity 400ms ease-out',
            }}
          />

          {/* PORTAL */}
          {showPortal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 11600,
              }}
            >
              <div ref={portalShakeRef} style={{ willChange: 'transform' }}>
                <div
                  ref={portalRef}
                  style={{
                    width: 0,
                    height: 0,
                    borderRadius: '50%',
                    position: 'relative',
                    // 🎯 RICH radial gradient mimicking the original portal look
                    background: `radial-gradient(
                      circle at 50% 50%,
                      #000 0%,
                      #0a0420 25%,
                      #1e1b4b 50%,
                      #4c1d95 72%,
                      #a855f7 88%,
                      rgba(192,132,252,0.6) 96%,
                      transparent 100%
                    )`,
                    // 🎯 Layered box-shadow replaces blur filter — GPU accelerated
                    boxShadow: `
                      0 0 60px rgba(168,85,247,0.6),
                      0 0 120px rgba(79,70,229,0.45),
                      0 0 200px rgba(99,102,241,0.3),
                      inset 0 0 100px rgba(0,0,0,0.6)
                    `,
                    willChange: 'width, height, opacity',
                    // filter is set dynamically based on size
                  }}
                >
                  {/* Purple ring — slow rotation */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '2%', left: '2%', right: '2%', bottom: '2%',
                      borderRadius: '50%',
                      border: '2px solid transparent',
                      borderTopColor: '#a855f7',
                      borderLeftColor: '#a855f7',
                      animation: 'breachSpin 1.2s linear infinite',
                      opacity: 0.9,
                    }}
                  />
                  {/* Blue ring — reverse slower rotation */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%', left: '10%', right: '10%', bottom: '10%',
                      borderRadius: '50%',
                      border: '2px solid transparent',
                      borderBottomColor: '#60a5fa',
                      borderRightColor: '#60a5fa',
                      animation: 'breachSpin 1.8s linear infinite reverse',
                      opacity: 0.7,
                    }}
                  />
                  {/* Soft center pulse — CSS-only, very cheap */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '20%', left: '20%', right: '20%', bottom: '20%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      animation: 'breachPulse 2.2s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STATUS TEXT */}
          {isCharging && (
            <div
              style={{
                position: 'fixed',
                top: chargingProgress < 30 ? '50%' : '72%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 11650,
                pointerEvents: 'none',
                textAlign: 'center',
                animation: 'chargingFadeIn 400ms ease-out',
                transition: 'top 800ms ease-out',
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
                {chargingProgress < 15
                  ? 'something is stirring'
                  : chargingProgress < 30
                  ? 'energy accumulating'
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
                {chargingProgress < 30
                  ? 'keep going...'
                  : chargingProgress < 75
                  ? 'pressure building'
                  : 'breakthrough imminent'}
              </div>
            </div>
          )}

          {/* ENERGY BAR */}
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
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.3em', textTransform: 'uppercase',
                    }}
                  >
                    Energy
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: chargingUserCount >= 2 ? '#a855f7' : '#6366f1',
                      boxShadow: '0 0 12px currentColor',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 800,
                      letterSpacing: '0.25em', textTransform: 'uppercase',
                    }}
                  >
                    {chargingUserCount >= 2 ? `${chargingUserCount} teammates` : 'solo'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  maxWidth: 1600, margin: '0 auto',
                  height: 10, background: 'rgba(255,255,255,0.08)',
                  borderRadius: 999, overflow: 'hidden', position: 'relative',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  style={{
                    width: `${pr}%`, height: '100%',
                    background: isNearFull
                      ? 'linear-gradient(90deg, #6366f1 0%, #a855f7 40%, #c084fc 70%, #fde047 100%)'
                      : 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)',
                    borderRadius: 999,
                    boxShadow: isNearFull
                      ? '0 0 20px rgba(168,85,247,0.8)'
                      : '0 0 12px rgba(99,102,241,0.6)',
                    transition: 'width 180ms ease-out',
                  }}
                />
              </div>
            </div>
          )}

          {/* EXPLOSION TEXT */}
          {(breach?.phase === 'EXPLODING' || breach?.phase === 'IMPLODING') && (
            <div
              style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', zIndex: 11700, padding: '40px',
              }}
            >
              <div
                ref={textShakeRef}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
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
            </div>
          )}
        </>
      )}

      {/* 🎯 STATIC SVG filter — computed ONCE, cached by browser */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <filter id="breach-turbulence" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="25" />
        </filter>
      </svg>

      <style>{`
        @keyframes breachSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes breachPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50%      { opacity: 1; transform: scale(1.1); }
        }
        @keyframes breachPop {
          0%   { transform: scale(0.3); opacity: 0; }
          15%  { transform: scale(1.1); opacity: 1; }
          20%  { transform: scale(1); }
          85%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .breach-pop {
          animation: breachPop ${T_EXPLODE}ms cubic-bezier(0.2,0,0.2,1) forwards;
        }
        @keyframes chargingFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes energyBarFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}