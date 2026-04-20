import React, { useEffect, useRef, memo, useCallback } from 'react';

const T_EXPLODE = 4000;

/* ============================================================
   Canvas particle engine — safe, high-performance
============================================================ */
const BreachCanvas = memo(({ phaseRef, progressRef, isChargingRef }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef();
  const lastSpawnRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const phase = phaseRef.current;
    const progress = progressRef.current;
    const isCharging = isChargingRef.current;
    const now = performance.now();

    // 🆕 Spawn new particles from edges during charging (after 30%)
    if (isCharging && progress > 30 && phase !== 'EXPLODING' && phase !== 'IMPLODING') {
      // Rate scales with progress: more particles as energy builds
      const spawnInterval = Math.max(30, 200 - progress * 2); // 200ms at 30%, ~40ms at 100%
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const edge = Math.floor(Math.random() * 4);
        let sx, sy;
        const margin = 20;
        if (edge === 0) { sx = Math.random() * w; sy = -margin; }
        else if (edge === 1) { sx = w + margin; sy = Math.random() * h; }
        else if (edge === 2) { sx = Math.random() * w; sy = h + margin; }
        else { sx = -margin; sy = Math.random() * h; }

        // Velocity perpendicular to radius to create spiral (like galaxy)
        const dx = cx - sx;
        const dy = cy - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const tangentialSpeed = 1.5 + Math.random() * 1.5;

        const cosmicEmojis = ['✨', '⚡', '💫', '⭐', '🌠'];
        particles.current.push({
          x: sx,
          y: sy,
          vx: perpX * tangentialSpeed,
          vy: perpY * tangentialSpeed,
          size: 18 + Math.random() * 12,
          emoji: cosmicEmojis[Math.floor(Math.random() * cosmicEmojis.length)],
          rotation: Math.random() * 360,
          rotVel: (Math.random() - 0.5) * 10,
          life: 1.0,
          kind: 'suck',
        });
      }
    }

    // 🆕 Burst on explosion
    if (phase === 'EXPLODING' && !window.__breachBurstFired) {
      window.__breachBurstFired = true;
      const burstEmojis = ['🎉', '🎊', '✨', '🔥', '🎇', '🌈', '⚡', '💫', '🌟', '💥'];
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 7 + Math.random() * 16;
        particles.current.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 22 + Math.random() * 18,
          emoji: burstEmojis[Math.floor(Math.random() * burstEmojis.length)],
          rotation: Math.random() * 360,
          rotVel: (Math.random() - 0.5) * 20,
          life: 1.0,
          kind: 'burst',
        });
      }
    }

    // Reset burst flag when not exploding
    if (phase !== 'EXPLODING') {
      window.__breachBurstFired = false;
    }

    // Update & draw particles
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];

      if (phase === 'EXPLODING' && p.kind === 'burst') {
        // Outward spray
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.life -= 0.004;
      } else if (phase === 'IMPLODING') {
        // Strong vacuum — all particles sucked in
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const pull = 5.5;
        p.vx = (p.vx + (dx / dist) * pull) * 0.9;
        p.vy = (p.vy + (dy / dist) * pull) * 0.9;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.92;
        p.life -= 0.02;
        if (dist < 20) p.life = 0;
      } else {
        // Charging: gravitational pull toward center
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const intensity = Math.pow(progress / 100, 1.5) * 1.2;
        const strength = intensity * 1000;
        const force = strength / (dist + 50);
        p.vx = (p.vx + (dx / dist) * force * 0.05) * 0.96;
        p.vy = (p.vy + (dy / dist) * force * 0.05) * 0.96;
        p.x += p.vx;
        p.y += p.vy;
        if (dist < 30) p.life = 0;
        p.life -= 0.003;
      }

      p.rotation += p.rotVel;

      if (p.life > 0 && p.size > 1) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.font = `${Math.floor(p.size)}px sans-serif`;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      if (p.life <= 0) particles.current.splice(i, 1);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [phaseRef, progressRef, isChargingRef]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = window.innerWidth + 'px';
      cvs.style.height = window.innerHeight + 'px';
      const ctx = cvs.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 11400,
      }}
    />
  );
});

/* ============================================================
   Main overlay
============================================================ */
export default function DimensionalBreachOverlay({ breach, chargingState }) {
  const portalRef = useRef(null);
  const portalShakeRef = useRef(null);
  const textShakeRef = useRef(null);
  const globalShakeRef = useRef(null);   // 🆕 for subtle whole-overlay shake
  const currentSizeRef = useRef(0);
  const rafRef = useRef();
  const shakeRafRef = useRef();
  const displacementRef = useRef(20);
  const filterRef = useRef(null);

  const phaseRef = useRef(null);
  const progressRef = useRef(0);
  const isChargingRef = useRef(false);

  const isExploding = !!breach && (
    breach.phase === 'EXPLODING' ||
    breach.phase === 'IMPLODING' ||
    breach.phase === 'FLOATING'
  );
  const isCharging = !breach && !!chargingState && chargingState.progress > 0.5;
  const chargingProgress = chargingState?.progress || 0;
  const chargingUserCount = chargingState?.userCount || 0;

  // 🆕 Black hole only appears after 30% progress
  const showPortal = isCharging ? chargingProgress >= 30 : isExploding;

  // Sync refs
  useEffect(() => {
    phaseRef.current = breach?.phase || null;
    progressRef.current = chargingProgress;
    isChargingRef.current = isCharging;
  }, [breach, chargingProgress, isCharging]);

  // Reset portal size when fully IDLE
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
      else if (isCharging && chargingProgress >= 30) {
        // Grow from 80px (at 30% progress) to 55% viewport (at 100%)
        const minSize = 80;
        const maxSize = viewportMax * 0.55;
        const localProgress = (chargingProgress - 30) / 70;
        target = minSize + (maxSize - minSize) * Math.pow(localProgress, 0.7);
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
      else if (isCharging && chargingProgress >= 30) {
        opacity = Math.min(1, (chargingProgress - 30) / 10);
      }
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

  // 🆕 Shake engine — includes early tremor from 10%
  useEffect(() => {
    const loop = () => {
      const portalEl = portalShakeRef.current;
      const textEl = textShakeRef.current;
      const globalEl = globalShakeRef.current;

      let portalX = 0, portalY = 0;
      let textX = 0, textY = 0;
      let globalX = 0, globalY = 0;

      if (breach?.phase === 'EXPLODING') {
        portalX = (Math.random() - 0.5) * 14;
        portalY = (Math.random() - 0.5) * 14;
        textX = (Math.random() - 0.5) * 20;
        textY = (Math.random() - 0.5) * 20;
        globalX = (Math.random() - 0.5) * 6;
        globalY = (Math.random() - 0.5) * 6;
      } else if (breach?.phase === 'IMPLODING') {
        portalX = (Math.random() - 0.5) * 4;
        portalY = (Math.random() - 0.5) * 4;
      } else if (isCharging && chargingProgress > 10) {
        // 🆕 Start subtle tremor from 10% (before hole appears)
        // Early (10-30%): very gentle, just globalEl
        // Mid (30-75%): moderate, globalEl + portalEl
        // Late (75-100%): strong, all three
        const rawProgress = (chargingProgress - 10) / 90;
        const base = Math.pow(rawProgress, 1.6) * 10;
        const t = performance.now() / 70;

        // Global gentle tremor even at low progress
        const globalBase = Math.pow(rawProgress, 1.2) * 3;
        globalX = Math.sin(t * 0.4) * globalBase + (Math.random() - 0.5) * globalBase * 0.3;
        globalY = Math.cos(t * 0.35) * globalBase + (Math.random() - 0.5) * globalBase * 0.3;

        // Portal shake starts at 30%+
        if (chargingProgress > 30) {
          portalX = Math.sin(t * 0.6) * base + (Math.random() - 0.5) * base * 0.4;
          portalY = Math.cos(t * 0.52) * base + (Math.random() - 0.5) * base * 0.4;
        }
      }

      if (portalEl) portalEl.style.transform = `translate3d(${portalX}px, ${portalY}px, 0)`;
      if (textEl) textEl.style.transform = `translate(-50%, -50%) translate3d(${textX}px, ${textY}px, 0)`;
      if (globalEl) globalEl.style.transform = `translate3d(${globalX}px, ${globalY}px, 0)`;

      shakeRafRef.current = requestAnimationFrame(loop);
    };
    shakeRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(shakeRafRef.current);
  }, [breach, isCharging, chargingProgress]);

  // 🆕 Cleanup: reset all transforms when overlay unmounts
  useEffect(() => {
    return () => {
      if (portalShakeRef.current) portalShakeRef.current.style.transform = '';
      if (textShakeRef.current) textShakeRef.current.style.transform = '';
      if (globalShakeRef.current) globalShakeRef.current.style.transform = '';
    };
  }, []);

  const showAnything = !!breach || isCharging;
  const pr = Math.min(100, Math.max(0, chargingProgress));
  const isNearFull = pr > 75;

  return (
    <>
      {/* Canvas always mounted for smooth reuse */}
      <BreachCanvas
        phaseRef={phaseRef}
        progressRef={progressRef}
        isChargingRef={isChargingRef}
      />

      {showAnything && (
        <div ref={globalShakeRef} style={{ willChange: 'transform' }}>
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

          {/* Portal — only renders after 30% or exploding */}
          {showPortal && (
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
          )}

          {/* Middle status text */}
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

          {/* FULL-WIDTH ENERGY BAR */}
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
        </div>
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
        @keyframes chargingFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
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