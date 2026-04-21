import React, { useState, useEffect, useRef } from 'react';
import RAW_STAFF_LIST from '../data/staff.json';

// ── Shared primitives ──────────────────────────────────────────
function Rects({ data }) {
  return data.map((r, i) => (
    <rect key={i} x={r.x} y={r.y} width={r.w || 1} height={r.h || 1} fill={r.c} />
  ));
}

function usePixelTick(fps = 8, running = true) {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setF(p => p + 1), 1000 / fps);
    return () => clearInterval(id);
  }, [fps, running]);
  return f;
}

const OUT = '#1a1205';

// ── Theme 01: Wizard ───────────────────────────────────────────
function SceneWizard({ frame: t }) {
  const sparkle = t % 3;
  const bob = Math.sin(t * 0.5) * 1;
  const cake = [
    { x: 60, y: 88, w: 80, h: 3, c: '#6b4e10' },
    { x: 58, y: 86, w: 84, h: 2, c: '#8b6914' },
    { x: 66, y: 64, w: 68, h: 24, c: '#ff8fb0' },
    { x: 66, y: 64, w: 68, h: 2, c: '#ffb6cf' },
    { x: 66, y: 86, w: 68, h: 2, c: '#c96a8a' },
    { x: 70, y: 64, w: 4, h: 4, c: '#ffb6cf' }, { x: 82, y: 64, w: 5, h: 5, c: '#ffb6cf' },
    { x: 96, y: 64, w: 4, h: 4, c: '#ffb6cf' }, { x: 108, y: 64, w: 5, h: 5, c: '#ffb6cf' },
    { x: 124, y: 64, w: 4, h: 4, c: '#ffb6cf' },
    { x: 65, y: 64, w: 1, h: 22, c: OUT }, { x: 134, y: 64, w: 1, h: 22, c: OUT },
    { x: 66, y: 63, w: 68, h: 1, c: OUT },
    { x: 74, y: 70, w: 3, h: 1, c: '#2a7a2a' }, { x: 74, y: 71, w: 1, h: 2, c: '#2a7a2a' }, { x: 76, y: 72, w: 1, h: 1, c: '#2a7a2a' },
    { x: 80, y: 70, w: 1, h: 4, c: '#2a7a2a' }, { x: 81, y: 70, w: 2, h: 1, c: '#2a7a2a' }, { x: 81, y: 72, w: 2, h: 1, c: '#2a7a2a' }, { x: 81, y: 73, w: 2, h: 1, c: '#2a7a2a' },
    { x: 86, y: 70, w: 1, h: 4, c: '#2a7a2a' }, { x: 87, y: 70, w: 2, h: 1, c: '#2a7a2a' }, { x: 89, y: 71, w: 1, h: 2, c: '#2a7a2a' }, { x: 87, y: 73, w: 2, h: 1, c: '#2a7a2a' },
    { x: 92, y: 70, w: 1, h: 4, c: '#2a7a2a' }, { x: 93, y: 70, w: 3, h: 1, c: '#2a7a2a' }, { x: 96, y: 71, w: 1, h: 3, c: '#2a7a2a' }, { x: 93, y: 72, w: 2, h: 1, c: '#2a7a2a' },
    { x: 99, y: 54, w: 2, h: 10, c: '#6ab6ff' }, { x: 100, y: 54, w: 1, h: 10, c: '#4299e1' },
    { x: 99, y: 53, w: 1, h: 1, c: OUT },
    { x: 99, y: 49 - sparkle, w: 2, h: 4, c: '#ffb700' }, { x: 99, y: 48 - sparkle, w: 1, h: 1, c: '#fff200' },
  ];
  const wx = 20 + bob, wy = 70;
  const wizard = [
    { x: wx + 2, y: wy - 12, w: 8, h: 2, c: '#3a2266' },
    { x: wx + 4, y: wy - 20, w: 4, h: 8, c: '#3a2266' },
    { x: wx + 5, y: wy - 25, w: 2, h: 5, c: '#3a2266' },
    { x: wx + 1, y: wy - 12, w: 10, h: 1, c: OUT }, { x: wx + 2, y: wy - 11, w: 8, h: 1, c: OUT },
    { x: wx + 5, y: wy - 18, w: 1, h: 1, c: '#ffe14a' }, { x: wx + 7, y: wy - 22, w: 1, h: 1, c: '#ffe14a' },
    { x: wx + 3, y: wy - 10, w: 6, h: 4, c: '#ffe6c4' },
    { x: wx + 2, y: wy - 9, w: 1, h: 2, c: OUT }, { x: wx + 9, y: wy - 9, w: 1, h: 2, c: OUT },
    { x: wx + 3, y: wy - 11, w: 6, h: 1, c: OUT }, { x: wx + 3, y: wy - 6, w: 6, h: 1, c: OUT },
    { x: wx + 4, y: wy - 9, w: 1, h: 1, c: OUT }, { x: wx + 7, y: wy - 9, w: 1, h: 1, c: OUT },
    { x: wx + 3, y: wy - 5, w: 6, h: 3, c: '#f0f0f0' },
    { x: wx + 2, y: wy - 4, w: 1, h: 2, c: '#f0f0f0' }, { x: wx + 9, y: wy - 4, w: 1, h: 2, c: '#f0f0f0' },
    { x: wx + 1, y: wy - 2, w: 10, h: 10, c: '#3a2266' },
    { x: wx, y: wy, w: 12, h: 7, c: '#3a2266' },
    { x: wx, y: wy, w: 1, h: 7, c: OUT }, { x: wx + 11, y: wy, w: 1, h: 7, c: OUT },
    { x: wx, y: wy + 7, w: 12, h: 1, c: OUT },
    { x: wx + 1, y: wy + 3, w: 10, h: 1, c: '#ffe14a' },
    { x: wx + 11, y: wy - 5, w: 8, h: 1, c: '#6b4e10' },
    { x: wx + 18, y: wy - 6, w: 2, h: 2, c: '#ffe14a' },
  ];
  const sparks = [];
  for (let i = 0; i < 8; i++) {
    const life = (t + i * 2) % 12;
    if (life < 10) {
      const progress = life / 10;
      const sx = 40 + progress * 55 + Math.sin(i + t * 0.3) * 4;
      const sy = 58 + Math.sin(progress * Math.PI) * (-10);
      const colors = ['#ffe14a', '#ffb6cf', '#a78bfa', '#fff'];
      sparks.push({ x: Math.round(sx), y: Math.round(sy), w: 1, h: 1, c: colors[i % 4] });
      if (life < 6) sparks.push({ x: Math.round(sx) + 1, y: Math.round(sy), w: 1, h: 1, c: colors[(i + 1) % 4] });
    }
  }
  const glowRadius = 30 + sparkle * 2;
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width="200" height="120" fill="#0a0514" />
      <defs>
        <radialGradient id="cakeGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,183,0,0.4)" />
          <stop offset="100%" stopColor="rgba(255,183,0,0)" />
        </radialGradient>
      </defs>
      {Array.from({ length: 30 }).map((_, i) => {
        const sx = (i * 71) % 200, sy = (i * 43) % 90;
        const tw = (t + i) % 5 < 3;
        return tw ? <rect key={i} x={sx} y={sy} width="1" height="1" fill="#fff" /> : null;
      })}
      <circle cx="100" cy="70" r={glowRadius} fill="url(#cakeGlow)" />
      <Rects data={cake} />
      <Rects data={wizard} />
      <Rects data={sparks} />
    </svg>
  );
}

// ── Theme 02: Upside Down ──────────────────────────────────────
function SceneUpsideDown({ frame: t }) {
  const f = t % 16;
  const handY = f < 4 ? 80 - f * 3 : f < 12 ? 68 : 68 + (f - 12) * 1;
  const ground = [
    { x: 0, y: 90, w: 200, h: 30, c: '#2a0a18' },
    { x: 0, y: 89, w: 200, h: 1, c: '#4a0a20' },
  ];
  const crack = [
    { x: 90, y: 85, w: 20, h: 5, c: '#1a0008' },
    { x: 92, y: 86, w: 16, h: 3, c: '#3a0010' },
    { x: 85, y: 88, w: 6, h: 2, c: '#1a0008' }, { x: 109, y: 88, w: 8, h: 2, c: '#1a0008' },
    { x: 93, y: 87, w: 14, h: 1, c: '#ff3050' },
    { x: 95, y: 88, w: 10, h: 1, c: '#ff6080' },
  ];
  const hy = handY;
  const SKIN = '#c9a894', SKIN_SHADE = '#8a6a58', VEIN = '#6a0a20';
  const hand = [
    { x: 94, y: hy + 14, w: 6, h: 8, c: SKIN },
    { x: 93, y: hy + 14, w: 1, h: 8, c: OUT }, { x: 100, y: hy + 14, w: 1, h: 8, c: OUT },
    { x: 95, y: hy + 14, w: 4, h: 1, c: SKIN_SHADE },
    { x: 94, y: hy + 12, w: 6, h: 2, c: SKIN },
    { x: 93, y: hy + 12, w: 1, h: 2, c: OUT }, { x: 100, y: hy + 12, w: 1, h: 2, c: OUT },
    { x: 94, y: hy + 13, w: 6, h: 1, c: SKIN_SHADE },
    { x: 91, y: hy + 6, w: 12, h: 6, c: SKIN },
    { x: 90, y: hy + 6, w: 1, h: 6, c: OUT }, { x: 103, y: hy + 6, w: 1, h: 6, c: OUT },
    { x: 91, y: hy + 12, w: 12, h: 1, c: OUT },
    { x: 103, y: hy + 8, w: 3, h: 2, c: SKIN },
    { x: 103, y: hy + 7, w: 1, h: 3, c: OUT }, { x: 106, y: hy + 8, w: 1, h: 2, c: OUT },
    { x: 103, y: hy + 10, w: 3, h: 1, c: OUT },
    { x: 105, y: hy + 8, w: 1, h: 1, c: '#2a0a08' },
    { x: 92, y: hy - 3, w: 2, h: 9, c: SKIN },
    { x: 91, y: hy - 3, w: 1, h: 9, c: OUT }, { x: 94, y: hy - 3, w: 1, h: 9, c: OUT },
    { x: 92, y: hy - 4, w: 2, h: 1, c: OUT },
    { x: 92, y: hy + 1, w: 2, h: 1, c: SKIN_SHADE },
    { x: 92, y: hy - 3, w: 2, h: 1, c: '#d8c4b0' },
    { x: 95, y: hy - 5, w: 2, h: 11, c: SKIN },
    { x: 94, y: hy - 5, w: 1, h: 11, c: OUT }, { x: 97, y: hy - 5, w: 1, h: 11, c: OUT },
    { x: 95, y: hy - 6, w: 2, h: 1, c: OUT },
    { x: 95, y: hy, w: 2, h: 1, c: SKIN_SHADE },
    { x: 95, y: hy - 5, w: 2, h: 1, c: '#d8c4b0' },
    { x: 98, y: hy - 4, w: 2, h: 10, c: SKIN },
    { x: 97, y: hy - 4, w: 1, h: 10, c: OUT }, { x: 100, y: hy - 4, w: 1, h: 10, c: OUT },
    { x: 98, y: hy - 5, w: 2, h: 1, c: OUT },
    { x: 98, y: hy + 1, w: 2, h: 1, c: SKIN_SHADE },
    { x: 98, y: hy - 4, w: 2, h: 1, c: '#d8c4b0' },
    { x: 101, y: hy - 1, w: 2, h: 7, c: SKIN },
    { x: 100, y: hy - 1, w: 1, h: 7, c: OUT }, { x: 103, y: hy - 1, w: 1, h: 7, c: OUT },
    { x: 101, y: hy - 2, w: 2, h: 1, c: OUT },
    { x: 101, y: hy + 2, w: 2, h: 1, c: SKIN_SHADE },
    { x: 101, y: hy - 1, w: 2, h: 1, c: '#d8c4b0' },
    { x: 96, y: hy + 16, w: 1, h: 4, c: VEIN },
    { x: 95, y: hy + 12, w: 1, h: 1, c: '#00ffaa' },
    { x: 99, y: hy + 13, w: 1, h: 1, c: '#00ffaa' },
  ];
  const cupY = hy - 5;
  const cupcake = [
    { x: 94, y: cupY + 2, w: 8, h: 4, c: '#6b3a5a' },
    { x: 94, y: cupY + 2, w: 8, h: 1, c: '#8b4a7a' },
    { x: 94, y: cupY + 2, w: 1, h: 4, c: OUT }, { x: 101, y: cupY + 2, w: 1, h: 4, c: OUT },
    { x: 93, y: cupY, w: 10, h: 2, c: '#ffb6cf' },
    { x: 95, y: cupY - 2, w: 6, h: 2, c: '#ffb6cf' },
    { x: 96, y: cupY - 3, w: 4, h: 1, c: '#ffb6cf' },
    { x: 97, y: cupY - 4, w: 2, h: 1, c: '#ffb6cf' },
    { x: 97, y: cupY - 7, w: 2, h: 3, c: '#fffef5' },
    { x: 97, y: cupY - 9, w: 2, h: 2, c: '#ffb700' },
    { x: 97, y: cupY - 10, w: 1, h: 1, c: '#fff200' },
  ];
  const spores = [];
  for (let i = 0; i < 20; i++) {
    const p = ((t * 1.5 + i * 17) % 160) - 10;
    const sy = 20 + (i * 7) % 60 + Math.sin(t * 0.2 + i) * 3;
    spores.push({ x: Math.round(p), y: Math.round(sy), w: 1, h: 1, c: 'rgba(0,255,170,0.6)' });
  }
  const vines = [];
  for (let i = 0; i < 6; i++) {
    const vx = 20 + i * 30;
    const len = 15 + Math.sin(t * 0.15 + i) * 3;
    for (let j = 0; j < len; j++) {
      vines.push({ x: vx + Math.round(Math.sin(j * 0.5 + t * 0.1) * 2), y: j, w: 1, h: 1, c: '#4a1020' });
    }
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width="200" height="120" fill="url(#udBg)" />
      <defs>
        <radialGradient id="udBg" cx="50%" cy="70%">
          <stop offset="0%" stopColor="#5a0a20" />
          <stop offset="60%" stopColor="#2a0518" />
          <stop offset="100%" stopColor="#0a0008" />
        </radialGradient>
      </defs>
      <Rects data={vines} />
      <Rects data={spores} />
      <Rects data={crack} />
      <ellipse cx="100" cy="88" rx="18" ry="4" fill="rgba(255,50,80,0.35)" />
      <Rects data={hand} />
      <Rects data={cupcake} />
      <Rects data={ground} />
      <Rects data={crack} />
      <ellipse cx="100" cy="88" rx="14" ry="3" fill="rgba(255,50,80,0.45)" />
    </svg>
  );
}

// ── Theme 03: Polaroid ─────────────────────────────────────────
function ScenePolaroid({ frame: t }) {
  const TOTAL = 22;
  const cycle = t % TOTAL;
  const flash = cycle < 2;
  const cx = 100, cy = 55;
  let photoX, photoY, photoRot, dev, photoVisible;
  if (cycle < 2) {
    photoX = cx - 8; photoY = cy - 5; photoRot = 0; dev = 0; photoVisible = false;
  } else if (cycle < 10) {
    const p = (cycle - 2) / 8;
    photoX = cx - 8; photoY = cy - 5 + p * 35; photoRot = p * 4;
    dev = Math.min(1, Math.max(0, (p - 0.2) / 0.6)); photoVisible = true;
  } else if (cycle < 12) {
    photoX = cx - 8; photoY = cy + 30; photoRot = 4; dev = 1; photoVisible = true;
  } else {
    const p = (cycle - 12) / 10;
    photoX = cx - 8; photoY = cy + 30 - p * 35; photoRot = 4 - p * 4;
    dev = 1 - Math.min(1, Math.max(0, (p - 0.2) / 0.6));
    photoVisible = p < 0.95;
  }
  const cam = [
    { x: cx - 20, y: cy - 12, w: 40, h: 28, c: '#e8e2d0' },
    { x: cx - 21, y: cy - 12, w: 1, h: 28, c: OUT }, { x: cx + 20, y: cy - 12, w: 1, h: 28, c: OUT },
    { x: cx - 20, y: cy - 13, w: 40, h: 1, c: OUT }, { x: cx - 20, y: cy + 16, w: 40, h: 1, c: OUT },
    { x: cx - 6, y: cy - 17, w: 12, h: 5, c: '#d8d2c0' },
    { x: cx - 7, y: cy - 17, w: 1, h: 5, c: OUT }, { x: cx + 6, y: cy - 17, w: 1, h: 5, c: OUT },
    { x: cx - 6, y: cy - 18, w: 12, h: 1, c: OUT },
    { x: cx - 10, y: cy - 6, w: 20, h: 18, c: '#1a1a1a' },
    { x: cx - 11, y: cy - 6, w: 1, h: 18, c: OUT }, { x: cx + 10, y: cy - 6, w: 1, h: 18, c: OUT },
    { x: cx - 10, y: cy - 7, w: 20, h: 1, c: OUT }, { x: cx - 10, y: cy + 12, w: 20, h: 1, c: OUT },
    { x: cx - 7, y: cy - 3, w: 14, h: 12, c: '#2a2a2a' },
    { x: cx - 5, y: cy - 1, w: 10, h: 8, c: '#2a4a6a' },
    { x: cx - 3, y: cy + 1, w: 6, h: 4, c: '#6ac7ff' },
    { x: cx - 2, y: cy + 2, w: 2, h: 1, c: '#fff' },
    { x: cx + 12, y: cy - 10, w: 6, h: 4, c: flash ? '#ffffff' : '#a0a898' },
    { x: cx + 14, y: cy - 15, w: 3, h: 2, c: '#e63946' },
    { x: cx - 20, y: cy + 13, w: 6, h: 1, c: '#e63946' },
    { x: cx - 20, y: cy + 14, w: 6, h: 1, c: '#ffa500' },
    { x: cx - 20, y: cy + 15, w: 6, h: 1, c: '#ffe14a' },
    { x: cx - 9, y: cy + 17, w: 18, h: 1, c: '#1a1a1a' },
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width="200" height="120" fill="#0a0a14" />
      {cycle >= 12 && <text x="10" y="110" fontSize="7" fill="#6ac7ff" fontFamily="monospace" fontWeight="700" opacity={0.6}>◀◀ REWIND</text>}
      {cycle < 12 && cycle >= 2 && <text x="150" y="110" fontSize="7" fill="#ff8fb0" fontFamily="monospace" fontWeight="700" opacity={0.6}>PLAY ▶</text>}
      <Rects data={cam} />
      {photoVisible && (
        <g transform={`translate(${photoX} ${photoY}) rotate(${photoRot})`}>
          <rect x="0" y="0" width="16" height="20" fill="#fffef5" />
          <rect x="-1" y="0" width="1" height="20" fill={OUT} />
          <rect x="16" y="0" width="1" height="20" fill={OUT} />
          <rect x="0" y="-1" width="16" height="1" fill={OUT} />
          <rect x="0" y="20" width="16" height="1" fill={OUT} />
          <rect x="2" y="2" width="12" height="12" fill={`rgba(106,182,255,${dev * 0.85})`} />
          {dev > 0.3 && <rect x="4" y="4" width="3" height="3" fill="#ffe14a" opacity={dev} />}
          {dev > 0.4 && <rect x="4" y="8" width="8" height="5" fill="#ff8fb0" opacity={dev} />}
          {dev > 0.7 && <text x="3" y="18" fontSize="3" fill={OUT} fontFamily="monospace" fontWeight="700" opacity={dev}>HB!</text>}
        </g>
      )}
      {flash && <rect x="0" y="0" width="200" height="120" fill="rgba(255,255,255,0.4)" />}
    </svg>
  );
}

// ── Theme 04: Dinosaur ─────────────────────────────────────────
function SceneDinosaur({ frame: t }) {
  const cycle = t % 28;
  const stage = cycle < 9 ? 'egg' : cycle < 12 ? 'crack' : cycle < 16 ? 'pop' : 'roar';
  const wobble = stage === 'egg' ? Math.sin(t * 0.7) * 2 : 0;
  const cx = 100, cy = 65;
  const eggShape = (yOffset) => {
    const rows = [
      [0,10],[1,14],[2,18],[3,22],[4,26],[5,30],[6,34],[7,36],[8,38],[9,40],
      [10,42],[11,42],[12,44],[13,44],[14,46],[15,46],[16,48],[17,48],[18,50],[19,50],
      [20,52],[21,52],[22,52],[23,54],[24,54],[25,54],[26,54],[27,54],[28,54],[29,54],
      [30,54],[31,54],[32,54],[33,54],[34,52],[35,52],[36,52],[37,50],[38,50],[39,48],
      [40,46],[41,44],[42,42],[43,40],[44,36],[45,32],[46,26],[47,18],
    ];
    const eggTop = cy - 38 + yOffset;
    const parts = [];
    rows.forEach(([ry, rw]) => {
      const x = cx - rw / 2;
      parts.push({ x: Math.round(x), y: eggTop + ry, w: rw, h: 1, c: '#fffef5' });
      parts.push({ x: Math.round(x + rw * 0.62), y: eggTop + ry, w: Math.round(rw * 0.38), h: 1, c: '#e8e2d0' });
      parts.push({ x: Math.round(x) - 1, y: eggTop + ry, w: 1, h: 1, c: OUT });
      parts.push({ x: Math.round(x + rw), y: eggTop + ry, w: 1, h: 1, c: OUT });
    });
    parts.push({ x: cx - 18, y: eggTop + 14, w: 3, h: 2, c: '#ff8fb0' });
    parts.push({ x: cx + 8, y: eggTop + 10, w: 3, h: 2, c: '#6ab6ff' });
    parts.push({ x: cx + 14, y: eggTop + 26, w: 3, h: 2, c: '#ffe14a' });
    parts.push({ x: cx - 20, y: eggTop + 32, w: 3, h: 2, c: '#a78bfa' });
    return parts;
  };
  let eggParts = [];
  if (stage === 'egg' || stage === 'crack') {
    eggParts = eggShape(wobble);
    if (stage === 'crack') {
      eggParts.push({ x: cx - 6, y: cy - 15, w: 3, h: 4, c: OUT });
      eggParts.push({ x: cx - 2, y: cy - 8, w: 3, h: 5, c: OUT });
      eggParts.push({ x: cx + 4, y: cy - 2, w: 2, h: 5, c: OUT });
    }
  }
  let dinoParts = [];
  if (stage === 'pop' || stage === 'roar') {
    const popOffset = stage === 'pop' ? (cycle - 12) * 4 : 16;
    const dy = cy - 10 - popOffset;
    const dx = cx;
    const G = '#5aaa5a', GD = '#3a7a3a', GL = '#a0d89a';
    const shellRows = [[0,54],[1,52],[2,52],[3,50],[4,50],[5,48],[6,46],[7,42],[8,36],[9,28]];
    const shellTop = cy + 2;
    shellRows.forEach(([ry, rw]) => {
      const x = cx - rw / 2;
      eggParts.push({ x: Math.round(x), y: shellTop + ry, w: rw, h: 1, c: '#fffef5' });
      eggParts.push({ x: Math.round(x + rw * 0.62), y: shellTop + ry, w: Math.round(rw * 0.38), h: 1, c: '#e8e2d0' });
      eggParts.push({ x: Math.round(x) - 1, y: shellTop + ry, w: 1, h: 1, c: OUT });
      eggParts.push({ x: Math.round(x + rw), y: shellTop + ry, w: 1, h: 1, c: OUT });
    });
    dinoParts = [
      { x: dx - 24, y: dy + 18, w: 10, h: 4, c: G },
      { x: dx - 28, y: dy + 20, w: 6, h: 3, c: G },
      { x: dx - 10, y: dy + 8, w: 20, h: 14, c: G },
      { x: dx - 11, y: dy + 9, w: 1, h: 12, c: OUT }, { x: dx + 10, y: dy + 9, w: 1, h: 12, c: OUT },
      { x: dx - 10, y: dy + 22, w: 20, h: 1, c: OUT }, { x: dx - 10, y: dy + 7, w: 20, h: 1, c: OUT },
      { x: dx - 7, y: dy + 13, w: 14, h: 9, c: GL },
      { x: dx - 8, y: dy - 6, w: 16, h: 14, c: G },
      { x: dx - 9, y: dy - 5, w: 1, h: 13, c: OUT }, { x: dx + 8, y: dy - 5, w: 1, h: 13, c: OUT },
      { x: dx - 8, y: dy - 7, w: 16, h: 1, c: OUT },
      { x: dx - 6, y: dy - 3, w: 4, h: 4, c: '#fff' }, { x: dx + 2, y: dy - 3, w: 4, h: 4, c: '#fff' },
      { x: dx - 4, y: dy - 1, w: 2, h: 2, c: OUT }, { x: dx + 4, y: dy - 1, w: 2, h: 2, c: OUT },
      { x: dx - 2, y: dy + 3, w: 1, h: 1, c: OUT }, { x: dx + 2, y: dy + 3, w: 1, h: 1, c: OUT },
    ];
    if (stage === 'roar') {
      dinoParts.push({ x: dx - 5, y: dy + 5, w: 10, h: 4, c: OUT });
      dinoParts.push({ x: dx - 4, y: dy + 6, w: 8, h: 2, c: '#e63946' });
      dinoParts.push({ x: dx - 4, y: dy - 14, w: 8, h: 2, c: '#e63946' });
      dinoParts.push({ x: dx - 2, y: dy - 19, w: 4, h: 5, c: '#e63946' });
      dinoParts.push({ x: dx - 1, y: dy - 23, w: 2, h: 2, c: '#ffe14a' });
    }
  }
  const confetti = [];
  if (stage === 'roar') {
    const rFrame = cycle - 16;
    const colors = ['#ffe14a', '#ff8fb0', '#6ab6ff', '#a78bfa', '#e63946', '#00e5a8'];
    for (let i = 0; i < 30; i++) {
      const prog = (rFrame + i * 0.3) % 12;
      const angle = -Math.PI / 2 + (i / 30 - 0.5) * Math.PI * 1.1;
      const dist = prog * 6;
      const cfx = cx + Math.cos(angle) * dist;
      const cfy = 40 + Math.sin(angle) * dist + prog * 1.5;
      confetti.push({ x: Math.round(cfx), y: Math.round(cfy), w: 2, h: 2, c: colors[i % 6] });
    }
  }
  const stars = [];
  for (let i = 0; i < 40; i++) {
    const sx = (i * 71) % 200, sy = (i * 43) % 120;
    const tw = (t + i) % 6 < 3;
    if (tw) stars.push({ x: sx, y: sy, w: 1, h: 1, c: 'rgba(255,255,255,0.4)' });
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width="200" height="120" fill="#0a0a14" />
      <Rects data={stars} />
      <defs>
        <radialGradient id="dinoGlow" cx="50%" cy="55%">
          <stop offset="0%" stopColor="rgba(255,225,74,0.15)" />
          <stop offset="100%" stopColor="rgba(255,225,74,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx="50" ry="40" fill="url(#dinoGlow)" />
      <Rects data={eggParts} />
      <Rects data={dinoParts} />
      <Rects data={confetti} />
    </svg>
  );
}

// ── Theme 05: UFO ──────────────────────────────────────────────
function SceneUFO({ frame: t }) {
  const wobble = Math.sin(t * 0.4) * 2;
  const beamPulse = 0.5 + Math.sin(t * 0.6) * 0.2;
  const cakeY = Math.max(40, 75 - (t % 20) * 0.8);
  const ux = 100 + wobble, uy = 30;
  const ufo = [
    { x: ux - 8, y: uy - 4, w: 16, h: 2, c: '#6ac7ff' },
    { x: ux - 10, y: uy - 2, w: 20, h: 3, c: '#6ac7ff' },
    { x: ux - 10, y: uy - 4, w: 1, h: 2, c: OUT }, { x: ux + 9, y: uy - 4, w: 1, h: 2, c: OUT },
    { x: ux - 8, y: uy - 5, w: 16, h: 1, c: OUT },
    { x: ux - 11, y: uy - 2, w: 1, h: 3, c: OUT }, { x: ux + 10, y: uy - 2, w: 1, h: 3, c: OUT },
    { x: ux - 6, y: uy - 3, w: 4, h: 1, c: '#a0e0ff' },
    { x: ux - 14, y: uy + 1, w: 28, h: 4, c: '#c8c8d4' },
    { x: ux - 15, y: uy + 1, w: 1, h: 4, c: OUT }, { x: ux + 14, y: uy + 1, w: 1, h: 4, c: OUT },
    { x: ux - 14, y: uy, w: 28, h: 1, c: OUT },
    { x: ux - 12, y: uy + 5, w: 24, h: 2, c: '#8a8a98' },
    { x: ux - 12, y: uy + 7, w: 24, h: 1, c: OUT },
    ...[0, 1, 2, 3, 4].map(i => ({ x: ux - 10 + i * 5, y: uy + 3, w: 2, h: 1, c: (t + i) % 3 === 0 ? '#ffe14a' : '#ffaa00' })),
    { x: ux - 2, y: uy - 3, w: 4, h: 3, c: '#7aff7a' },
    { x: ux, y: uy - 7, w: 1, h: 2, c: OUT }, { x: ux, y: uy - 8, w: 1, h: 1, c: '#ffe14a' },
  ];
  const beam = [];
  for (let y = uy + 8; y < 100; y++) {
    const width = 4 + (y - uy - 8) * 0.6;
    beam.push({ x: Math.round(ux - width / 2), y, w: Math.round(width), h: 1, c: `rgba(106,200,255,${beamPulse * (1 - (y - uy - 8) / 80) * 0.5})` });
  }
  const cy = cakeY;
  const cake = [
    { x: ux - 10, y: cy + 8, w: 20, h: 1, c: '#c8c8d4' },
    { x: ux - 8, y: cy, w: 16, h: 8, c: '#ffb6cf' },
    { x: ux - 8, y: cy, w: 16, h: 1, c: '#ffd6e4' },
    { x: ux - 9, y: cy, w: 1, h: 8, c: OUT }, { x: ux + 8, y: cy, w: 1, h: 8, c: OUT },
    { x: ux - 8, y: cy - 1, w: 16, h: 1, c: OUT },
    { x: ux, y: cy - 5, w: 1, h: 4, c: '#6ab6ff' },
    { x: ux, y: cy - 7, w: 1, h: 2, c: '#ffb700' },
  ];
  const stars = [];
  for (let i = 0; i < 30; i++) {
    const sx = (i * 73) % 200, sy = (i * 31) % 40;
    const tw = (t + i) % 6 < 3;
    if (tw) stars.push({ x: sx, y: sy, w: 1, h: 1, c: '#fff' });
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <defs>
        <linearGradient id="ufoBg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a0028" />
          <stop offset="50%" stopColor="#1a0a48" />
          <stop offset="100%" stopColor="#2a1a58" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="120" fill="url(#ufoBg)" />
      <Rects data={stars} />
      <circle cx="160" cy="25" r="8" fill="#f0e8c8" />
      <rect x="20" y="95" width="8" height="15" fill="#1a0a28" />
      <rect x="40" y="92" width="10" height="18" fill="#1a0a28" />
      <rect x="140" y="95" width="10" height="15" fill="#1a0a28" />
      <Rects data={beam} />
      <Rects data={ufo} />
      <Rects data={cake} />
    </svg>
  );
}

// ── Theme 06: Corporate ────────────────────────────────────────
function SceneCorporate({ frame: t }) {
  const cycle = t % 30;
  const typing = cycle < 18;
  const lx = 60, ly = 50;
  const laptop = [
    { x: lx, y: ly, w: 80, h: 45, c: '#2a2a3a' },
    { x: lx - 1, y: ly, w: 1, h: 45, c: OUT }, { x: lx + 80, y: ly, w: 1, h: 45, c: OUT },
    { x: lx, y: ly - 1, w: 80, h: 1, c: OUT }, { x: lx, y: ly + 45, w: 80, h: 1, c: OUT },
    { x: lx + 3, y: ly + 3, w: 74, h: 38, c: '#f5f5f0' },
    { x: lx - 6, y: ly + 45, w: 92, h: 3, c: '#3a3a4a' },
    { x: lx - 7, y: ly + 45, w: 1, h: 3, c: OUT }, { x: lx + 86, y: ly + 45, w: 1, h: 3, c: OUT },
    { x: lx - 6, y: ly + 48, w: 92, h: 1, c: OUT },
  ];
  const screenX = lx + 3, screenY = ly + 3;
  const textLines = [];
  const typed = Math.min(cycle * 4, 60);
  for (let row = 0; row < 4; row++) {
    const rowStart = row * 18;
    const rowEnd = Math.min(rowStart + 18, typed);
    if (rowEnd > rowStart) {
      textLines.push({ x: screenX + 2, y: screenY + 18 + row * 4, w: rowEnd - rowStart, h: 1, c: '#4a4a5a' });
    }
  }
  const email = [
    { x: screenX, y: screenY, w: 74, h: 4, c: '#4a6a8a' },
    { x: screenX + 2, y: screenY + 1, w: 3, h: 2, c: '#e63946' },
    { x: screenX + 7, y: screenY + 1, w: 3, h: 2, c: '#ffe14a' },
    { x: screenX + 12, y: screenY + 1, w: 3, h: 2, c: '#00e5a8' },
    { x: screenX + 14, y: screenY + 11, w: 55, h: 4, c: '#e63946' },
    ...textLines,
    { x: screenX + 60, y: screenY + 35, w: 12, h: 5, c: cycle >= 18 ? '#00a0a0' : '#009bff' },
  ];
  if (typing && t % 2 === 0) {
    const row = Math.min(Math.floor(typed / 18), 3);
    const xoff = typed % 18;
    email.push({ x: screenX + 2 + xoff, y: screenY + 18 + row * 4, w: 1, h: 2, c: OUT });
  }
  const planes = [];
  if (cycle >= 20) {
    const stage = cycle - 20;
    const px = 100 + stage * 8;
    const py = 60 - Math.sin(stage * 0.4) * 10;
    planes.push({ x: px, y: py, w: 10, h: 1, c: '#f0f0f5' });
    planes.push({ x: px + 2, y: py + 1, w: 7, h: 1, c: '#f0f0f5' });
    planes.push({ x: px + 3, y: py - 3, w: 4, h: 3, c: '#ffb6cf' });
    for (let i = 1; i < 6; i++) {
      planes.push({ x: px - i * 3, y: py + 2, w: 2, h: 1, c: `rgba(200,200,220,${0.5 - i * 0.08})` });
    }
  }
  const corpStars = [];
  for (let i = 0; i < 60; i++) {
    const sx = (i * 83) % 200, sy = (i * 47) % 120;
    const tw = (t + i) % 8 < 4;
    if (tw) corpStars.push({ x: sx, y: sy, w: 1, h: 1, c: `rgba(255,255,255,${0.3 + (i % 3) * 0.2})` });
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <defs>
        <radialGradient id="corpSpace" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#0a0618" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="120" fill="url(#corpSpace)" />
      <Rects data={corpStars} />
      <ellipse cx="100" cy="99" rx="48" ry="5" fill="rgba(255,255,250,0.18)" />
      <Rects data={laptop} />
      <Rects data={email} />
      <Rects data={planes} />
    </svg>
  );
}

// ── Theme 07: Omelet ───────────────────────────────────────────
function SceneOmelet({ frame: t }) {
  const f = t % 8;
  const jumpY = [0, -4, -14, -20, -14, -4, 0, 0][f];
  const sx = [1.00, 1.06, 0.94, 0.92, 0.96, 1.06, 1.10, 1.02][f];
  const sy = [1.00, 0.92, 1.08, 1.14, 1.08, 0.94, 0.88, 0.98][f];
  const armR = [0, -20, -45, -80, -60, -30, -10, 0][f];
  const armL = [0, 20, 45, 80, 60, 30, 10, 0][f];
  const legBend = [0, 4, -2, -6, -2, 4, 6, 2][f];
  const cx = 100, cy = 70;
  const shadowScale = 1 - Math.abs(jumpY) / 25;
  const stars = [];
  for (let i = 0; i < 40; i++) {
    const sxS = (i * 71) % 200, syS = (i * 43) % 120;
    const tw = (t + i) % 6 < 3;
    if (tw) stars.push({ x: sxS, y: syS, w: 1, h: 1, c: 'rgba(255,255,255,0.5)' });
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="0" width="200" height="120" fill="#0a0a14" />
      <Rects data={stars} />
      <defs>
        <radialGradient id="omGlow" cx="50%" cy="55%">
          <stop offset="0%" stopColor="rgba(255,183,0,0.22)" />
          <stop offset="100%" stopColor="rgba(255,183,0,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx="55" ry="40" fill="url(#omGlow)" />
      <ellipse cx={cx} cy={105} rx={22 * shadowScale} ry={3 * shadowScale} fill="rgba(0,0,0,0.55)" />
      {f === 3 && [0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={cx - 30 + i * 20} y={50 + (i % 2) * 8} width="2" height="2" fill="#ffe14a" />
          <rect x={cx - 30 + i * 20 - 1} y={51 + (i % 2) * 8} width="4" height="1" fill="#ffe14a" />
        </g>
      ))}
      <g transform={`translate(0 ${jumpY})`}>
        <rect x={cx - 8} y={cy + 14} width="3" height={8 + legBend} fill="#f5b800" />
        <rect x={cx - 10} y={cy + 22 + legBend} width="6" height="3" fill="#f5b800" />
        <rect x={cx + 5} y={cy + 14} width="3" height={8 + legBend} fill="#f5b800" />
        <rect x={cx + 4} y={cy + 22 + legBend} width="6" height="3" fill="#f5b800" />
        <g style={{ transformOrigin: `${cx}px ${cy + 8}px`, transform: `scale(${sx},${sy})` }}>
          <ellipse cx={cx} cy={cy + 6} rx="28" ry="14" fill="#fffef5" />
          <ellipse cx={cx} cy={cy + 8} rx="30" ry="12" fill="#fffef5" />
          <circle cx={cx - 26} cy={cy + 3} r="4" fill="#fffef5" />
          <circle cx={cx + 26} cy={cy + 3} r="4" fill="#fffef5" />
          <circle cx={cx - 14} cy={cy - 6} r="5" fill="#fffef5" />
          <circle cx={cx + 14} cy={cy - 6} r="5" fill="#fffef5" />
          <circle cx={cx} cy={cy - 8} r="4" fill="#fffef5" />
          <ellipse cx={cx} cy={cy + 13} rx="25" ry="3" fill="#d4c88a" />
          <circle cx={cx} cy={cy + 3} r="10" fill="#f5b800" />
          <circle cx={cx - 3} cy={cy} r="3" fill="#ffd93d" />
          <rect x={cx - 5} y={cy + 1} width="2" height="2" fill={OUT} />
          <rect x={cx + 3} y={cy + 1} width="2" height="2" fill={OUT} />
          <rect x={cx - 3} y={cy + 6} width="6" height="3" fill={OUT} />
          <rect x={cx - 2} y={cy + 7} width="4" height="2" fill="#e63946" />
        </g>
        <polygon points={`${cx - 5},${cy - 14} ${cx + 5},${cy - 14} ${cx},${cy - 24}`} fill="#e63946" />
        <rect x={cx - 1} y={cy - 26} width="2" height="2" fill="#ffe14a" />
        <g transform={`rotate(${armL} ${cx - 15} ${cy + 4})`}>
          <rect x={cx - 22} y={cy + 3} width="8" height="3" fill="#f5b800" />
          <rect x={cx - 26} y={cy + 1} width="5" height="6" fill="#f5b800" />
        </g>
        <g transform={`rotate(${armR} ${cx + 15} ${cy + 4})`}>
          <rect x={cx + 14} y={cy + 3} width="8" height="3" fill="#f5b800" />
          <rect x={cx + 21} y={cy + 1} width="5" height="6" fill="#f5b800" />
        </g>
      </g>
    </svg>
  );
}

// ── Theme registry ─────────────────────────────────────────────
const BIRTHDAY_THEMES = [
  { id: 'omelet',      scene: SceneOmelet,     slogan: "It's your birthday. I'm an omelet.",              bg: '#0a0a14' },
  { id: 'wizard',      scene: SceneWizard,     slogan: 'Yer a birthday, Harry.',                          bg: '#0a0514' },
  { id: 'upsidedown',  scene: SceneUpsideDown, slogan: 'Happy Birthday from the Upside Down.',            bg: '#2a0518' },
  { id: 'polaroid',    scene: ScenePolaroid,   slogan: "I rewound time. It's still your birthday.",       bg: '#0a0a14' },
  { id: 'dinosaur',    scene: SceneDinosaur,   slogan: "It's both of our birthdays!",                     bg: '#0a0a14' },
  { id: 'ufo',         scene: SceneUFO,        slogan: 'Take us to your birthday.',                       bg: '#1a0a48' },
  { id: 'corporate',   scene: SceneCorporate,  slogan: 'Per my last email — happy birthday.',             bg: '#0a0618' },
];

function pickTheme(staffId, year) {
  const hash = (staffId + year).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return BIRTHDAY_THEMES[hash % BIRTHDAY_THEMES.length];
}

// ── Confetti ───────────────────────────────────────────────────
const CONFETTI_COLORS = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff9f43','#a29bfe','#fd79a8'];
const rand = (min, max) => Math.random() * (max - min) + min;

function BirthdayConfetti() {
  const items = useRef(
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: rand(0, 100),
      delay: rand(0, 1.2),
      duration: rand(2.5, 4.5),
      size: rand(8, 18),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      drift: rand(-150, 150),
      spin: rand(360, 1080) * (Math.random() > 0.5 ? 1 : -1),
    }))
  );
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 13000, overflow: 'hidden' }}>
      {items.current.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '-20px',
          width: p.size, height: p.shape === 'rect' ? p.size * 0.5 : p.size,
          borderRadius: p.shape === 'circle' ? '50%' : '2px',
          background: p.color,
          '--drift': `${p.drift}px`, '--spin': `${p.spin}deg`,
          animation: `bdayConfettiFall ${p.duration}s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
          willChange: 'transform, opacity',
        }} />
      ))}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function BirthdayOverlay({ currentUserEmail }) {
  const [birthdayPerson, setBirthdayPerson] = useState(null);
  const [theme, setTheme] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const frame = usePixelTick(8, visible);

  useEffect(() => {
    if (!currentUserEmail) return;
    const sessionKey = 'bday-shown-session';
    if (sessionStorage.getItem(sessionKey)) return;

    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMMDD = `${mm}-${dd}`;

    const match = RAW_STAFF_LIST.find(s => s.birthday === todayMMDD);
    if (!match) return;

    sessionStorage.setItem(sessionKey, '1');
    const year = today.getFullYear();
    setTheme(pickTheme(match.id, String(year)));
    setBirthdayPerson(match);
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [currentUserEmail]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(handleClose, 12000);
    return () => clearTimeout(t);
  }, [visible]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); setBirthdayPerson(null); }, 400);
  };

  if (!visible || !birthdayPerson || !theme) return null;

  const Scene = theme.scene;
  const isMe = birthdayPerson.email.toLowerCase() === currentUserEmail?.toLowerCase();
  const firstName = birthdayPerson.name.split(' ')[0];

  return (
    <>
      <style>{`
        @keyframes bdayConfettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity:1; }
          80%  { opacity:1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--spin)); opacity:0; }
        }
        @keyframes bdayOverlayIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes bdayCardIn {
          0%   { opacity:0; transform:scale(0.75) translateY(24px); }
          60%  { transform:scale(1.03) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes bdayCardOut {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.9) translateY(16px); }
        }
        @keyframes bdaySloganIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <BirthdayConfetti />

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 12999,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          animation: closing ? 'none' : 'bdayOverlayIn 0.4s ease',
          opacity: closing ? 0 : 1,
          transition: closing ? 'opacity 0.4s ease' : 'none',
          cursor: 'pointer',
        }}
      />

      {/* Card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 13001,
        width: 'min(520px, 92vw)',
        animation: closing ? 'bdayCardOut 0.4s ease forwards' : 'bdayCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Pixel art scene */}
        <div style={{
          width: '100%',
          background: theme.bg,
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          aspectRatio: '200 / 120',
        }}>
          <Scene frame={frame} />
        </div>

        {/* Text card below scene */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg,#0f0820,#1a0a2e)',
          borderRadius: '0 0 24px 24px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTop: 'none',
          padding: '24px 28px 20px',
          textAlign: 'center',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {/* Slogan */}
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(12px,1.8vw,16px)',
            fontStyle: 'italic',
            color: 'rgba(167,139,250,0.9)',
            marginBottom: 10,
            letterSpacing: '0.02em',
            animation: 'bdaySloganIn 0.4s ease 0.5s both',
          }}>
            "{theme.slogan}"
          </div>

          {/* Main message */}
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(22px,4vw,36px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: 10,
            animation: 'bdaySloganIn 0.4s ease 0.6s both',
          }}>
            {isMe ? `Happy Birthday, ${firstName}! 🎂` : `🎂 It's ${firstName}'s Birthday!`}
          </div>

          {/* Sub message */}
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
            marginBottom: 20,
            animation: 'bdaySloganIn 0.4s ease 0.7s both',
          }}>
            {isMe
              ? "Wishing you a wonderful day full of joy. The whole team is glad you're here ✨"
              : `Give ${firstName} some love today — it's their special day 🥳`
            }
          </div>

          {/* Button */}
          <button
            onClick={handleClose}
            style={{
              background: 'linear-gradient(90deg,#009bff,#770bff)',
              border: 'none', borderRadius: 100,
              padding: '10px 32px',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 20px rgba(119,11,255,0.4)',
              animation: 'bdaySloganIn 0.4s ease 0.8s both',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Celebrate! 🎉
          </button>

          <div style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            CLICK ANYWHERE TO DISMISS
          </div>
        </div>
      </div>
    </>
  );
}