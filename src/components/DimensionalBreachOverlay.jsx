import React, { useEffect, useRef, useState, memo, useCallback } from 'react';

const T_EXPLODE = 4000;
const DEBUG_ENABLED_BY_DEFAULT = true;
const MAX_PARTICLES = 20;
const PORTAL_APPEAR_AT = 8;  // 🆕 Portal appears at 8% progress

/* ============================================================
   Canvas — particle engine with visible suck-in
============================================================ */
const BreachCanvas = memo(({ phaseRef, progressRef, isChargingRef, particleCountRef }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef();
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const clearHandler = () => { particles.current = []; };
    window.addEventListener('breach-clear-particles', clearHandler);
    return () => window.removeEventListener('breach-clear-particles', clearHandler);
  }, []);

  const animate = useCallback((now) => {
    // 50fps throttle
    if (now - lastFrameRef.current < 20) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameRef.current = now;

    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const phase = phaseRef.current;
    const progress = progressRef.current;
    const isCharging = isChargingRef.current;

    // 🎯 Spawn particles once the hole is visible (progress > 8%)
    if (isCharging && progress > PORTAL_APPEAR_AT && phase !== 'EXPLODING' && phase !== 'IMPLODING') {
      // 🎯 FASTER spawn rate — visible suck-in flow
      // 250ms at 8%, 60ms at 100%
      const spawnInterval = Math.max(60, 280 - progress * 2.2);
      if (now - lastSpawnRef.current > spawnInterval && particles.current.length < MAX_PARTICLES) {
        lastSpawnRef.current = now;

        // 🎯 Spawn from mid-distance, not far edge — they reach center faster
        // Random angle, distance ~60-85% from center
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.min(w, h) * (0.35 + Math.random() * 0.15);
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;

        // Initial velocity: tangential spiral + slight outward drift
        const dx = cx - sx;
        const dy = cy - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const tangentialSpeed = 1.0 + Math.random() * 1.2;

        const cosmicEmojis = ['✨', '⚡', '💫', '⭐', '🌠'];
        particles.current.push({
          x: sx, y: sy,
          vx: perpX * tangentialSpeed - (dx / dist) * 0.5,  // slight pull toward center
          vy: perpY * tangentialSpeed - (dy / dist) * 0.5,
          size: 20 + Math.random() * 12,
          emoji: cosmicEmojis[Math.floor(Math.random() * cosmicEmojis.length)],
          rotation: Math.random() * 360,
          rotVel: (Math.random() - 0.5) * 10,
          life: 1.0,
          kind: 'suck',
        });
      }
    }

    // EXPLOSION burst
    if (phase === 'EXPLODING' && !window.__breachBurstFired) {
      window.__breachBurstFired = true;
      const burstEmojis = ['🎉', '🎊', '✨', '🔥', '🌈', '⚡', '💫', '🌟'];
      const burstCount = Math.min(20, MAX_PARTICLES - particles.current.length);
      for (let i = 0; i < burstCount; i++) {
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

    if (phase !== 'EXPLODING') {
      window.__breachBurstFired = false;
    }

    if (particles.current.length > MAX_PARTICLES) {
      particles.current = particles.current.slice(-MAX_PARTICLES);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];

      if (phase === 'EXPLODING' && p.kind === 'burst') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.life -= 0.004;
      } else if (phase === 'IMPLODING') {
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
        // 🎯 STRONGER pull during charging — makes suck-in very visible
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const intensity = Math.pow(progress / 100, 1.2) * 2.5;  // was 1.2
        const strength = intensity * 1800;  // was 1000
        const force = strength / (dist + 50);
        p.vx = (p.vx + (dx / dist) * force * 0.06) * 0.95;  // was 0.05, 0.96
        p.vy = (p.vy + (dy / dist) * force * 0.06) * 0.95;
        p.x += p.vx;
        p.y += p.vy;
        if (dist < 30) p.life = 0;
        p.life -= 0.002;
      }

      p.rotation += p.rotVel;

      if (p.life > 0 && p.size > 1) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.font = `${Math.floor(p.size)}px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      if (p.life <= 0) particles.current.splice(i, 1);
    }

    if (particleCountRef) particleCountRef.current = particles.current.length;

    rafRef.current = requestAnimationFrame(animate);
  }, [phaseRef, progressRef, isChargingRef, particleCountRef]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
  const particleCountRef = useRef(0);

  const [showDebug, setShowDebug] = useState(DEBUG_ENABLED_BY_DEFAULT);
  const [debugStats, setDebugStats] = useState({ portalSize: 0, fps: 60, particles: 0 });
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
        particles: particleCountRef.current,
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

  // 🆕 Portal appears at 8% progress
  const showPortal = isCharging ? chargingProgress >= PORTAL_APPEAR_AT : isExploding;

  useEffect(() => {
    phaseRef.current = breach?.phase || null;
    progressRef.current = chargingProgress;
    isChargingRef.current = isCharging;
  }, [breach, chargingProgress, isCharging]);

  useEffect(() => {
    if (!breach && !isCharging) {
      currentSizeRef.current = 0;
      window.dispatchEvent(new CustomEvent('breach-clear-particles'));
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
      } else if (isCharging && chargingProgress >= PORTAL_APPEAR_AT) {
        // 🆕 From 8% (small) to 100% (full screen height)
        const minSize = 80;
        const localProgress = (chargingProgress - PORTAL_APPEAR_AT) / (100 - PORTAL_APPEAR_AT);
        target = minSize + (chargingMaxSize - minSize) * Math.pow(localProgress, 0.7);
      }

      const cur = currentSizeRef.current;
      const diff = target - cur;
      const newVal = Math.abs(diff) < 0.5 ? target : cur + diff * 0.12;
      currentSizeRef.current = newVal;
      el.style.width = `${newVal}px`;
      el.style.height = `${newVal}px`;

      // SVG filter only when portal < 500px
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
      else if (isCharging && chargingProgress >= PORTAL_APPEAR_AT) {
        // Fade in quickly over the first 4% after appearing
        opacity = Math.min(1, (chargingProgress - PORTAL_APPEAR_AT) / 4);
      }
      el.style.opacity = opacity;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [breach, isCharging, chargingProgress]);

  // 🆕 Shake engine — 60fps + LOWER damping coefficient for smoother feel
  useEffect(() => {
    const loop = () => {
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
        // 🆕 Demo-style with wave + random + jolt
        const base = Math.pow(pr / 100, 1.2) * 12;
        const t = performance.now() / 70;
        portalX = Math.sin(t * 0.6) * base * 0.5 + (Math.random() - 0.5) * base * 0.3;
        portalY = Math.cos(t * 0.52) * base * 0.5 + (Math.random() - 0.5) * base * 0.3;

        // Random jolts at high progress — the "demo secret sauce"
        if (Math.random() > 0.96 && pr > 50) {
          const jolt = (Math.random() - 0.5) * base * 2;
          portalX += jolt;
          portalY += jolt * 0.7;
        }
      }

      // 🎯 SMOOTHER DAMPING: 0.25 instead of 0.4 for silky feel
      const q = quakeRef.current;
      q.portal.x += (portalX - q.portal.x) * 0.25;
      q.portal.y += (portalY - q.portal.y) * 0.25;
      q.text.x += (textX - q.text.x) * 0.3;
      q.text.y += (textY - q.text.y) * 0.3;

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
      <BreachCanvas
        phaseRef={phaseRef}
        progressRef={progressRef}
        isChargingRef={isChargingRef}
        particleCountRef={particleCountRef}
      />

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
          <div>PARTICLES: <span style={{ color: debugStats.particles > 15 ? '#fbbf24' : '#4ade80' }}>
            {debugStats.particles}/{MAX_PARTICLES}
          </span></div>
          <div>
            FPS: <span style={{ color: debugStats.fps < 30 ? '#fb7185' : debugStats.fps < 50 ? '#fbbf24' : '#4ade80' }}>
              {debugStats.fps}
            </span>
          </div>
        </div>
      )}

      {showAnything && (
        <>
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
                    boxShadow: `
                      0 0 60px rgba(168,85,247,0.6),
                      0 0 120px rgba(79,70,229,0.45),
                      0 0 200px rgba(99,102,241,0.3),
                      inset 0 0 100px rgba(0,0,0,0.6)
                    `,
                    willChange: 'width, height, opacity',
                  }}
                >
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

          {isCharging && (
            <div
              style={{
                position: 'fixed',
                top: chargingProgress < PORTAL_APPEAR_AT ? '50%' : '72%',
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