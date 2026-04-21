import React, { useState, useEffect, useRef } from 'react';

const BANANA_DAYS = [1, 3, 5]; // Mon, Wed, Fri

// ── Pattern logo pixel data ──────────────────────────────────
const OUT_LINE = '#000';
const BLUE = '#009bff';
const BLUE_LIGHT = '#6ac7ff';

function drawParallelogram(ox, oy, color, highlight) {
  const rows = [
    {y:0, xs:9, xe:27},
    {y:1, xs:8, xe:26},
    {y:2, xs:7, xe:25},
    {y:3, xs:5, xe:23},
    {y:4, xs:4, xe:22},
    {y:5, xs:3, xe:21},
    {y:6, xs:2, xe:20},
    {y:7, xs:0, xe:18},
  ];
  const out = [];
  rows.forEach(r => {
    out.push({x: ox + r.xs, y: oy + r.y, w: r.xe - r.xs + 1, h:1, c: color});
    out.push({x: ox + r.xs, y: oy + r.y, w:1, h:1, c: OUT_LINE});
    out.push({x: ox + r.xe, y: oy + r.y, w:1, h:1, c: OUT_LINE});
  });
  out.push({x: ox+9,  y: oy,   w:19, h:1, c: OUT_LINE});
  out.push({x: ox,    y: oy+7, w:19, h:1, c: OUT_LINE});
  out.push({x: ox+10, y: oy+1, w:16, h:1, c: highlight});
  out.push({x: ox+8,  y: oy+2, w:3,  h:1, c: highlight});
  return out;
}

function drawPatternLogo(cx, cy, bob) {
  const topY = cy - 8 + bob;
  const botY = cy + bob;
  const top = drawParallelogram(cx - 14, topY, BLUE_LIGHT, '#8ddcff');
  const bot = drawParallelogram(cx - 8,  botY, BLUE,       '#5fc4ff');

  const eyeY   = topY + 3;
  const mouthY = topY + 5;

  const face = [
    // eyes
    {x: cx - 4, y: eyeY,   w:2, h:2, c: OUT_LINE},
    {x: cx + 2, y: eyeY,   w:2, h:2, c: OUT_LINE},
    {x: cx - 3, y: eyeY,   w:1, h:1, c: '#fff'},
    {x: cx + 3, y: eyeY,   w:1, h:1, c: '#fff'},
    // blush
    {x: cx - 6, y: topY+4, w:2, h:1, c: '#ffb6cf'},
    {x: cx + 4, y: topY+4, w:2, h:1, c: '#ffb6cf'},
    // mouth smile
    {x: cx - 3, y: mouthY, w:6, h:1, c: OUT_LINE},
    {x: cx - 2, y: mouthY+1, w:4, h:1, c: OUT_LINE},
  ];

  return [...top, ...bot, ...face];
}

// ── Pose functions ────────────────────────────────────────────
function monPose(f) {
  const legPhase = f % 4;
  const bob = [0, -2, 0, -1][legPhase];
  const armL = [30, -10, -30, 10][legPhase];
  const armR = [-30, 10, 30, -10][legPhase];
  return {
    pose: { legPhase, bob, armL, armR,
      eyeShape: f % 10 < 1 ? 'closed' : 'sparkle',
      mouth: 'bigGrin', bodyLean: Math.sin(f * 0.5) * 2 },
    speed: 14.0,
  };
}

function wedPose(f) {
  const legPhase = f % 4;
  const bob = [0, -1, 0, 0][legPhase];
  const armL = [20, -5, -20, 5][legPhase];
  const armR = [-20, 5, 20, -5][legPhase];
  const fistPump = (f % 16) < 6;
  return {
    pose: { legPhase, bob, armL, armR,
      eyeShape: f % 12 < 1 ? 'closed' : 'open',
      mouth: 'smirk', fistPump },
    speed: 11.0,
  };
}

function friPose(f) {
  const skipPhase = f % 4;
  const bob = [0, -5, 0, -4][skipPhase];
  const legPhase = skipPhase % 2 === 0 ? 1 : (Math.floor(f / 4) % 2 === 0 ? 0 : 2);
  return {
    pose: { legPhase, bob, armUp: true,
      eyeShape: 'happy', mouth: 'bigGrin',
      bodyLean: Math.sin(f * 0.5) * 3 },
    speed: 13.0,
  };
}

// ── Pixel rect renderer ───────────────────────────────────────
function PixelRects({ data, scale = 3 }) {
  return (
    <>
      {data.map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: r.x * scale,
          top:  r.y * scale,
          width:  (r.w || 1) * scale,
          height: (r.h || 1) * scale,
          background: r.c,
          imageRendering: 'pixelated',
        }}/>
      ))}
    </>
  );
}

// ── Draw character ────────────────────────────────────────────
function drawCharacter(cx, cy, pose) {
  const { legPhase, bob = 0, armL = 0, armR = 0,
          eyeShape = 'open', mouth = 'smile',
          bodyLean = 0, fistPump = false, armUp = false } = pose;

  const pixels = [];
  const bx = cx + Math.round(bodyLean);
  const by = cy + bob;

  // Logo body (Pattern parallelogram)
  const logoPixels = drawPatternLogo(bx, by - 8, bob);
  pixels.push(...logoPixels);

  // Legs
  const legColors = ['#009bff', '#0077cc'];
  const legOffsets = [[0,0],[0,0],[0,0],[0,0]];
  const lLeg = legPhase === 0 ? 3 : legPhase === 1 ? 6 : legPhase === 2 ? 3 : 0;
  const rLeg = legPhase === 0 ? 0 : legPhase === 1 ? 3 : legPhase === 2 ? 6 : 3;

  // left leg
  pixels.push({x: bx - 4, y: by + 8, w: 3, h: 4 + lLeg/3, c: legColors[0]});
  pixels.push({x: bx - 5, y: by + 8, w: 1, h: 4 + lLeg/3, c: OUT_LINE});
  pixels.push({x: bx - 1, y: by + 8, w: 1, h: 4 + lLeg/3, c: OUT_LINE});
  // left foot
  pixels.push({x: bx - 6, y: by + 12 + lLeg/3, w: 5, h: 2, c: legColors[1]});
  pixels.push({x: bx - 7, y: by + 12 + lLeg/3, w: 1, h: 2, c: OUT_LINE});
  pixels.push({x: bx - 1, y: by + 12 + lLeg/3, w: 1, h: 2, c: OUT_LINE});

  // right leg
  pixels.push({x: bx + 1, y: by + 8, w: 3, h: 4 + rLeg/3, c: legColors[0]});
  pixels.push({x: bx,     y: by + 8, w: 1, h: 4 + rLeg/3, c: OUT_LINE});
  pixels.push({x: bx + 4, y: by + 8, w: 1, h: 4 + rLeg/3, c: OUT_LINE});
  // right foot
  pixels.push({x: bx + 1, y: by + 12 + rLeg/3, w: 5, h: 2, c: legColors[1]});
  pixels.push({x: bx,     y: by + 12 + rLeg/3, w: 1, h: 2, c: OUT_LINE});
  pixels.push({x: bx + 6, y: by + 12 + rLeg/3, w: 1, h: 2, c: OUT_LINE});

  // Arms
  if (armUp) {
    // Both arms up (Friday)
    pixels.push({x: bx - 14, y: by - 6, w: 10, h: 3, c: BLUE_LIGHT});
    pixels.push({x: bx + 4,  y: by - 6, w: 10, h: 3, c: BLUE_LIGHT});
  } else if (fistPump) {
    pixels.push({x: bx - 14, y: by - 8, w: 10, h: 3, c: BLUE_LIGHT});
    pixels.push({x: bx - 14, y: by - 11, w: 4, h: 3, c: BLUE});
    pixels.push({x: bx + 4,  y: by,      w: 10, h: 3, c: BLUE_LIGHT});
  } else {
    // Normal arms with rotation
    const alRad = (armL * Math.PI) / 180;
    const arRad = (armR * Math.PI) / 180;
    const alx = Math.round(Math.cos(alRad) * 8);
    const aly = Math.round(Math.sin(alRad) * 4);
    const arx = Math.round(Math.cos(arRad) * 8);
    const ary = Math.round(Math.sin(arRad) * 4);
    pixels.push({x: bx - 8 + alx, y: by + 2 + aly, w: 8, h: 2, c: BLUE_LIGHT});
    pixels.push({x: bx,            y: by + 2 + ary, w: 8, h: 2, c: BLUE_LIGHT});
  }

  return pixels;
}

// ── Messages ──────────────────────────────────────────────────
const DAY_MESSAGES = {
  1: "New week, let's go! 💪",
  3: 'Midweek energy! ⚡',
  5: 'TGIF — Weekend incoming! 🎉',
};

// ── Main component ────────────────────────────────────────────
export default function BananaEasterEgg() {
  const [active,    setActive]    = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [progress,  setProgress]  = useState(0); // 0→1
  const [frame,     setFrame]     = useState(0);
  const rafRef      = useRef();
  const startRef    = useRef();
  const frameTickRef = useRef();
  const DURATION    = 7200; // Slowed down to 2/3 speed! (Was 3200)
  const SCALE       = 3;    // pixel scale
  const CHAR_W      = 36 * SCALE;

useEffect(() => {
    const today  = new Date();
    const dow    = today.getDay();
    if (!BANANA_DAYS.includes(dow)) return;

    const sessionKey = `banana-shown-${today.toDateString()}`;
    
    // TEMPORARILY DISABLED FOR TESTING:
    // if (sessionStorage.getItem(sessionKey)) return;

    setDayOfWeek(dow);
    const t = setTimeout(() => {
      // We can leave this here, it won't block it since we disabled the check above
      sessionStorage.setItem(sessionKey, '1');
      setActive(true);
    }, 1800);
    return () => clearTimeout(t);
  }, []);
  // Animate progress
  useEffect(() => {
    if (!active) return;
    startRef.current = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startRef.current) / DURATION, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActive(false);
        setProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  // Frame ticker for animation (8fps)
  useEffect(() => {
    if (!active) return;
    frameTickRef.current = setInterval(() => setFrame(f => f + 1), 1000 / 8);
    return () => clearInterval(frameTickRef.current);
  }, [active]);

  if (!active || dayOfWeek === null) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // X: start off-left, end off-right
  const x = -CHAR_W + progress * (vw + CHAR_W * 2);

  // Y: Monday straight, Wednesday wave, Friday hop
  let y = vh * 0.44;
  let currentFrame = frame;

  const poseMap = { 1: monPose, 3: wedPose, 5: friPose };
  const getPose = poseMap[dayOfWeek] || monPose;
  
  // FIX: Grab the speed first before we do the math!
  const baseSpeed = getPose(0).speed; 
  const { pose, speed } = getPose(Math.floor(progress * baseSpeed * 20));

  if (dayOfWeek === 3) {
    y = vh * 0.44 + Math.sin(progress * Math.PI * 5) * 35;
  } else if (dayOfWeek === 5) {
    y = vh * 0.44 + Math.abs(Math.sin(progress * Math.PI * 8)) * -30;
  }

  const pixels = drawCharacter(16, 14, pose);

  // Speed lines for Monday & Friday
  const showSpeedLines = (dayOfWeek === 1 || dayOfWeek === 5) && progress > 0.05;

  return (
    <>
      <style>{`
        @keyframes bananaTagIn {
          from { opacity:0; transform:translateX(-50%) translateY(-4px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Message tag */}
      {progress > 0.08 && progress < 0.88 && (
        <div style={{
          position: 'fixed',
          left: x + CHAR_W / 2,
          top: y - 44,
          transform: 'translateX(-50%)',
          zIndex: 13500,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 100,
          padding: '5px 14px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 12, fontWeight: 700, color: '#fff',
          whiteSpace: 'nowrap',
          animation: 'bananaTagIn 0.3s ease',
        }}>
          {DAY_MESSAGES[dayOfWeek]}
        </div>
      )}

      {/* Speed lines */}
      {showSpeedLines && [1, 2, 3].map(i => (
        <div key={i} style={{
          position: 'fixed',
          left: x - 20 - i * 18,
          top: y + 10 + (i - 1.5) * 6,
          width: 14 + i * 8,
          height: 2,
          background: `rgba(0,155,255,${0.55 - i * 0.12})`,
          borderRadius: 2,
          zIndex: 13499,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* Character */}
      <div style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 13500,
        pointerEvents: 'none',
        width: 36 * SCALE,
        height: 32 * SCALE,
        imageRendering: 'pixelated',
        willChange: 'transform',
      }}>
        <PixelRects data={pixels} scale={SCALE} />
      </div>
    </>
  );
}