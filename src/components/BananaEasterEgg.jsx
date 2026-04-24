import React, { useState, useEffect, useRef } from 'react';

const BANANA_DAYS = [0, 1, 3, 5, 6]; // Sun, Mon, Wed, Fri, Sat

const BLUE_LIGHT = '#3bb8ff';
const BLUE       = '#1e9eff';
const BLUE_DARK  = '#0a72c4';
const BLUE_DEEP  = '#08538a';
const OUTLINE    = '#08324d';

// ── Pixel rect renderer (SVG) ─────────────────────────────────
function Rects({ data }) {
  return (
    <>
      {data.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w || 1} height={r.h || 1} fill={r.c} />
      ))}
    </>
  );
}

// ── Pattern logo parallelogram ────────────────────────────────
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
    out.push({x: ox + r.xs, y: oy + r.y, w: r.xe - r.xs + 1, h: 1, c: color});
    out.push({x: ox + r.xs, y: oy + r.y, w: 1, h: 1, c: OUTLINE});
    out.push({x: ox + r.xe, y: oy + r.y, w: 1, h: 1, c: OUTLINE});
  });
  out.push({x: ox + 9,  y: oy,     w: 19, h: 1, c: OUTLINE});
  out.push({x: ox,      y: oy + 7, w: 19, h: 1, c: OUTLINE});
  out.push({x: ox + 10, y: oy + 1, w: 16, h: 1, c: highlight});
  out.push({x: ox + 8,  y: oy + 2, w: 3,  h: 1, c: highlight});
  return out;
}

// ── Full LogoChar component (ported from reference) ───────────
function LogoChar({ cx, cy, pose = {} }) {
  const {
    armL = 0, armR = 0,
    legPhase = 0,
    bob = 0,
    bodyLean = 0,
    eyeShape = 'open',
    mouth = 'grin',
    armUp = false,
    fistPump = false,
  } = pose;

  const topY = cy - 8 + bob;
  const botY = cy + bob;
  const top  = drawParallelogram(cx - 14, topY, BLUE_LIGHT, '#8ddcff');
  const bot  = drawParallelogram(cx - 8,  botY, BLUE, '#5fc4ff');

  // Face
  const eyeY  = topY + 3;
  const eyeLX = cx - 5;
  const eyeRX = cx + 1;
  const face  = [];

  const drawEye = (ex, ey) => {
    if (eyeShape === 'closed') {
      face.push({x: ex - 1, y: ey + 1, w: 3, h: 1, c: OUTLINE});
    } else if (eyeShape === 'happy') {
      face.push({x: ex - 1, y: ey + 1, w: 1, h: 1, c: OUTLINE});
      face.push({x: ex,     y: ey,     w: 1, h: 1, c: OUTLINE});
      face.push({x: ex + 1, y: ey + 1, w: 1, h: 1, c: OUTLINE});
    } else {
      face.push({x: ex - 1, y: ey, w: 3, h: 2, c: OUTLINE});
      face.push({x: ex,     y: ey, w: 1, h: 1, c: '#fff'});
    }
  };
  drawEye(eyeLX, eyeY);
  drawEye(eyeRX, eyeY);

  const mouthY  = topY + 5;
  const mouthCx = cx - 2;
  if (mouth === 'grin') {
    face.push({x: mouthCx - 1, y: mouthY,     w: 4, h: 1, c: OUTLINE});
    face.push({x: mouthCx - 2, y: mouthY - 1, w: 1, h: 1, c: OUTLINE});
    face.push({x: mouthCx + 3, y: mouthY - 1, w: 1, h: 1, c: OUTLINE});
  } else if (mouth === 'bigGrin') {
    face.push({x: mouthCx - 2, y: mouthY,     w: 6, h: 2, c: OUTLINE});
    face.push({x: mouthCx - 1, y: mouthY + 1, w: 4, h: 1, c: '#ff7a9a'});
    face.push({x: mouthCx,     y: mouthY + 1, w: 2, h: 1, c: '#fff'});
    face.push({x: mouthCx - 3, y: mouthY - 1, w: 1, h: 1, c: OUTLINE});
    face.push({x: mouthCx + 4, y: mouthY - 1, w: 1, h: 1, c: OUTLINE});
  } else if (mouth === 'smirk') {
    face.push({x: mouthCx,     y: mouthY,     w: 4, h: 1, c: OUTLINE});
    face.push({x: mouthCx + 3, y: mouthY - 1, w: 1, h: 1, c: OUTLINE});
  } else if (mouth === 'ohh') {
    face.push({x: mouthCx,     y: mouthY - 1, w: 3, h: 3, c: OUTLINE});
    face.push({x: mouthCx + 1, y: mouthY,     w: 1, h: 1, c: '#ff7a9a'});
  }

  // Blush
  face.push({x: cx - 8, y: topY + 4, w: 2, h: 1, c: 'rgba(255,100,140,0.5)'});
  face.push({x: cx + 4, y: topY + 4, w: 2, h: 1, c: 'rgba(255,100,140,0.5)'});

  // Arms
  const armPivotLX = cx - 6, armPivotLY = botY + 3;
  const armPivotRX = cx + 7, armPivotRY = botY + 3;

  let leftArm, rightArm;
  if (armUp) {
    leftArm = (
      <g key="arml">
        <rect x={armPivotLX - 2} y={armPivotLY - 8}  width="3" height="8" fill={BLUE_DARK}/>
        <rect x={armPivotLX - 2} y={armPivotLY - 8}  width="1" height="8" fill={OUTLINE}/>
        <rect x={armPivotLX}     y={armPivotLY - 8}  width="1" height="8" fill={OUTLINE}/>
        <rect x={armPivotLX - 3} y={armPivotLY - 11} width="4" height="3" fill={BLUE_LIGHT}/>
        <rect x={armPivotLX - 3} y={armPivotLY - 11} width="4" height="1" fill={OUTLINE}/>
        <rect x={armPivotLX - 3} y={armPivotLY - 11} width="1" height="3" fill={OUTLINE}/>
        <rect x={armPivotLX}     y={armPivotLY - 11} width="1" height="3" fill={OUTLINE}/>
      </g>
    );
    rightArm = (
      <g key="armr">
        <rect x={armPivotRX}     y={armPivotRY - 8}  width="3" height="8" fill={BLUE_DARK}/>
        <rect x={armPivotRX}     y={armPivotRY - 8}  width="1" height="8" fill={OUTLINE}/>
        <rect x={armPivotRX + 2} y={armPivotRY - 8}  width="1" height="8" fill={OUTLINE}/>
        <rect x={armPivotRX - 1} y={armPivotRY - 11} width="4" height="3" fill={BLUE_LIGHT}/>
        <rect x={armPivotRX - 1} y={armPivotRY - 11} width="4" height="1" fill={OUTLINE}/>
        <rect x={armPivotRX - 1} y={armPivotRY - 11} width="1" height="3" fill={OUTLINE}/>
        <rect x={armPivotRX + 2} y={armPivotRY - 11} width="1" height="3" fill={OUTLINE}/>
      </g>
    );
  } else {
    leftArm = (
      <g key="arml" transform={`rotate(${armL} ${armPivotLX} ${armPivotLY})`}>
        <rect x={armPivotLX - 7}  y={armPivotLY}     width="7" height="3" fill={BLUE_DARK}/>
        <rect x={armPivotLX - 7}  y={armPivotLY}     width="7" height="1" fill={OUTLINE}/>
        <rect x={armPivotLX - 7}  y={armPivotLY + 3} width="7" height="1" fill={OUTLINE}/>
        <rect x={armPivotLX - 7}  y={armPivotLY}     width="1" height="3" fill={OUTLINE}/>
        <rect x={armPivotLX - 10} y={armPivotLY - 1} width="3" height="4" fill={BLUE_LIGHT}/>
        <rect x={armPivotLX - 10} y={armPivotLY - 1} width="3" height="1" fill={OUTLINE}/>
        <rect x={armPivotLX - 10} y={armPivotLY + 3} width="3" height="1" fill={OUTLINE}/>
        <rect x={armPivotLX - 11} y={armPivotLY}     width="1" height="2" fill={OUTLINE}/>
      </g>
    );
    if (fistPump) {
      rightArm = (
        <g key="armr">
          <rect x={armPivotRX}     y={armPivotRY - 8}  width="3" height="8"  fill={BLUE_DARK}/>
          <rect x={armPivotRX}     y={armPivotRY - 8}  width="1" height="8"  fill={OUTLINE}/>
          <rect x={armPivotRX + 2} y={armPivotRY - 8}  width="1" height="8"  fill={OUTLINE}/>
          <rect x={armPivotRX - 1} y={armPivotRY - 12} width="5" height="4"  fill={BLUE_LIGHT}/>
          <rect x={armPivotRX - 1} y={armPivotRY - 12} width="5" height="1"  fill={OUTLINE}/>
          <rect x={armPivotRX - 1} y={armPivotRY - 8}  width="5" height="1"  fill={OUTLINE}/>
          <rect x={armPivotRX - 1} y={armPivotRY - 12} width="1" height="4"  fill={OUTLINE}/>
          <rect x={armPivotRX + 3} y={armPivotRY - 12} width="1" height="4"  fill={OUTLINE}/>
          <rect x={armPivotRX}     y={armPivotRY - 10} width="3" height="1"  fill={OUTLINE}/>
        </g>
      );
    } else {
      rightArm = (
        <g key="armr" transform={`rotate(${armR} ${armPivotRX} ${armPivotRY})`}>
          <rect x={armPivotRX}     y={armPivotRY}     width="7" height="3" fill={BLUE_DARK}/>
          <rect x={armPivotRX}     y={armPivotRY}     width="7" height="1" fill={OUTLINE}/>
          <rect x={armPivotRX}     y={armPivotRY + 3} width="7" height="1" fill={OUTLINE}/>
          <rect x={armPivotRX + 6} y={armPivotRY}     width="1" height="3" fill={OUTLINE}/>
          <rect x={armPivotRX + 7} y={armPivotRY - 1} width="3" height="4" fill={BLUE_LIGHT}/>
          <rect x={armPivotRX + 7} y={armPivotRY - 1} width="3" height="1" fill={OUTLINE}/>
          <rect x={armPivotRX + 7} y={armPivotRY + 3} width="3" height="1" fill={OUTLINE}/>
          <rect x={armPivotRX + 10} y={armPivotRY}    width="1" height="2" fill={OUTLINE}/>
        </g>
      );
    }
  }

  // Legs
  const legBaseY = botY + 7;
  const legCx = cx;
  const phases = [
    {lx: -3, ly: 0,  rx: 2,  ry: -1},
    {lx: -2, ly: 0,  rx: 2,  ry: 0},
    {lx: -3, ly: -1, rx: 3,  ry: 0},
    {lx: -2, ly: 0,  rx: 2,  ry: 0},
  ];
  const p = phases[legPhase % 4];
  const legs = (
    <g>
      <rect x={legCx + p.lx - 1} y={legBaseY + p.ly} width="3" height={5 + p.ly} fill={BLUE_DEEP}/>
      <rect x={legCx + p.lx - 1} y={legBaseY + p.ly} width="1" height={5 + p.ly} fill={OUTLINE}/>
      <rect x={legCx + p.lx + 1} y={legBaseY + p.ly} width="1" height={5 + p.ly} fill={OUTLINE}/>
      <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 5} width="5" height="2" fill={BLUE_DEEP}/>
      <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 5} width="5" height="1" fill={OUTLINE}/>
      <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 6} width="5" height="1" fill={OUTLINE}/>
      <rect x={legCx + p.lx - 3} y={legBaseY + p.ly + 5} width="1" height="2" fill={OUTLINE}/>
      <rect x={legCx + p.lx + 2} y={legBaseY + p.ly + 5} width="1" height="2" fill={OUTLINE}/>
      <rect x={legCx + p.rx - 1} y={legBaseY + p.ry} width="3" height={5 + p.ry} fill={BLUE_DEEP}/>
      <rect x={legCx + p.rx - 1} y={legBaseY + p.ry} width="1" height={5 + p.ry} fill={OUTLINE}/>
      <rect x={legCx + p.rx + 1} y={legBaseY + p.ry} width="1" height={5 + p.ry} fill={OUTLINE}/>
      <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 5} width="5" height="2" fill={BLUE_DEEP}/>
      <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 5} width="5" height="1" fill={OUTLINE}/>
      <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 6} width="5" height="1" fill={OUTLINE}/>
      <rect x={legCx + p.rx - 3} y={legBaseY + p.ry + 5} width="1" height="2" fill={OUTLINE}/>
      <rect x={legCx + p.rx + 2} y={legBaseY + p.ry + 5} width="1" height="2" fill={OUTLINE}/>
    </g>
  );

  return (
    <g style={{
      transform: `rotate(${bodyLean}deg) scale(1, 1)`,
      transformOrigin: `${cx}px ${cy + 6}px`,
    }}>
      {legs}
      <Rects data={bot}/>
      {leftArm}
      <Rects data={top}/>
      {rightArm}
      <Rects data={face}/>
    </g>
  );
}

// ── Pose drivers ──────────────────────────────────────────────
function monPose(f) {
  const legPhase = f % 4;
  return {
    pose: {
      legPhase,
      bob:      [0, -2, 0, -1][legPhase],
      armL:     [30, -10, -30, 10][legPhase],
      armR:     [-30, 10, 30, -10][legPhase],
      eyeShape: f % 10 < 1 ? 'closed' : 'open',
      mouth:    'bigGrin',
      bodyLean: Math.sin(f * 0.5) * 2,
    },
    speed: 14.0,
  };
}

function wedPose(f) {
  const legPhase = f % 4;
  return {
    pose: {
      legPhase,
      bob:      [0, -1, 0, 0][legPhase],
      armL:     [20, -5, -20, 5][legPhase],
      armR:     [-20, 5, 20, -5][legPhase],
      eyeShape: f % 12 < 1 ? 'closed' : 'open',
      mouth:    'smirk',
      fistPump: (f % 16) < 6,
    },
    speed: 11.0,
  };
}

function friPose(f) {
  const skipPhase = f % 4;
  const legPhase  = skipPhase % 2 === 0 ? 1 : (Math.floor(f / 4) % 2 === 0 ? 0 : 2);
  return {
    pose: {
      legPhase,
      bob:      [0, -5, 0, -4][skipPhase],
      armUp:    true,
      eyeShape: 'happy',
      mouth:    'bigGrin',
      bodyLean: Math.sin(f * 0.5) * 3,
    },
    speed: 13.0,
  };
}

function satPose(f) {
  const beat = f % 4;
  const bob = [-1, -6, -1, -5][beat];
  const bodyLean = Math.sin(f * 0.9) * 8;
  const pointLeft = Math.floor(f / 4) % 2 === 0;
  const armL = pointLeft ? -95 : 60;
  const armR = pointLeft ? 60 : -95;
  return {
    pose: {
      legPhase: beat, bob, armL, armR, bodyLean,
      eyeShape: (f % 8) < 2 ? 'closed' : (f % 6 < 1 ? 'happy' : 'open'),
      mouth: (f % 8) < 2 ? 'ohh' : 'bigGrin',
    },
    speed: 5.5,
  };
}

function DiscoBall({ cx, cy, frame }) {
  const swingX = Math.sin(frame * 0.15) * 2;
  const bx = cx + swingX;
  const by = cy;
  const spin = frame % 4;
  const cells = [];
  const R = 7;
  for (let gy = -R; gy <= R; gy++) {
    for (let gx = -R; gx <= R; gx++) {
      const dist = Math.sqrt(gx * gx + gy * gy);
      if (dist > R) continue;
      const tileId = ((gx + spin) % 3 + 3) % 3;
      const rim = dist > R - 1.5;
      let color = rim ? '#4a5f88' : tileId === 0 ? '#fff' : tileId === 1 ? '#b5dcff' : '#6b96d4';
      if (gx <= -3 && gy <= -2 && dist <= R - 1) color = '#ffffff';
      cells.push(<rect key={`${gx},${gy}`} x={bx + gx} y={by + gy} width="1" height="1" fill={color} />);
    }
  }
  const spokes = [];
  for (let i = 0; i < 6; i++) {
    const ang = frame * 0.12 + i * Math.PI / 3;
    const len = 18 + Math.sin(frame * 0.3 + i) * 3;
    spokes.push(<line key={'sk' + i} x1={bx} y1={by} x2={bx + Math.cos(ang) * len} y2={by + Math.sin(ang) * len} stroke="#fff2a8" strokeWidth="0.6" opacity="0.35" />);
  }
  return (
    <g>
      {spokes}
      <rect x={bx} y={4} width="1" height={by - R - 4} fill={OUTLINE} />
      <circle cx={bx} cy={by} r={R + 0.5} fill="none" stroke={OUTLINE} strokeWidth="1" />
      {cells}
      <rect x={bx - 4} y={by - 4} width="2" height="1" fill="#ffffff" opacity="0.9" />
    </g>
  );
}

// ── Pixel speech bubble ───────────────────────────────────────
function PixelBubble({ cx, cy, text, frame }) {
  const charW = 6;
  const padX  = 8;
  const textW = text.length * charW;
  const w     = textW + padX * 2;
  const h     = 16;
  const scale = Math.min(frame, 8) / 8;
  const bob   = Math.sin(frame * 0.35) * 1;
  const bx    = cx - w / 2;
  const by    = cy - h - 12 + bob;
  return (
    <g transform={`translate(${cx} ${cy + bob}) scale(${scale}) translate(${-cx} ${-cy - bob})`}>
      <rect x={bx + 2} y={by + 2} width={w} height={h} fill="rgba(0,0,0,0.2)" rx="3"/>
      <rect x={bx} y={by} width={w} height={h} fill="#fff" stroke={OUTLINE} strokeWidth="1.5" rx="4"/>
      <polygon
        points={`${cx - 3},${by + h} ${cx + 3},${by + h} ${cx},${by + h + 5}`}
        fill="#fff" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="miter"
      />
      <rect x={cx - 2} y={by + h - 1} width="4" height="2" fill="#fff"/>
      <text
        x={cx} y={by + h / 2 + 4}
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', 'Geist Mono', monospace"
        fontSize="9" fontWeight="800" fill={OUTLINE} letterSpacing="0.5"
      >
        {text}
      </text>
    </g>
  );
}

// ── Day messages ──────────────────────────────────────────────
const DAY_MESSAGES = {
  1: "LET'S GO!!",
  3: 'HALFWAY!!',
  5: 'WEEKEND TMR!!',
};

// ── Particle effects ──────────────────────────────────────────
function Particles({ mood, x, frame, svgH }) {
  const cy = svgH / 2;
  const particles = [];

  if (mood === 1) {
    for (let i = 0; i < 4; i++) {
      particles.push(
        <rect key={'m' + i} x={x - 20 - i * 6} y={cy + (i % 2 ? -4 : 4)}
              width={6 - i} height="1" fill="#5fc4ff" opacity={0.5 - i * 0.08}/>
      );
    }
    if (frame % 3 === 0) {
      particles.push(
        <g key="star" transform={`translate(${x + 10} ${cy - 22})`}>
          <rect x="-1" y="-3" width="2" height="6" fill="#ffd000"/>
          <rect x="-3" y="-1" width="6" height="2" fill="#ffd000"/>
        </g>
      );
    }
  } else if (mood === 3) {
    if ((frame % 16) < 4) {
      [0, 1, 2].forEach(i => {
        const ang = (Math.PI / 2) + (i - 1) * 0.4;
        const r   = 6 + (frame % 4);
        particles.push(
          <rect key={'w' + i}
                x={x + 12 + Math.cos(ang) * r}
                y={cy - 18 + Math.sin(ang) * r}
                width="2" height="2" fill="#ffd000"/>
        );
      });
    }
    for (let i = 0; i < 3; i++) {
      const px = x - 20 - i * 8, py = cy;
      particles.push(
        <g key={'a' + i} opacity={0.4 - i * 0.1}>
          <rect x={px}     y={py - 2} width="1" height="1" fill="#5fc4ff"/>
          <rect x={px + 1} y={py - 1} width="1" height="1" fill="#5fc4ff"/>
          <rect x={px + 2} y={py}     width="1" height="1" fill="#5fc4ff"/>
          <rect x={px + 1} y={py + 1} width="1" height="1" fill="#5fc4ff"/>
          <rect x={px}     y={py + 2} width="1" height="1" fill="#5fc4ff"/>
        </g>
      );
    }
  } else if (mood === 5) {
    const colors = ['#ff6b9a','#ffd000','#00e5a8','#ff8a3a','#a66bff','#5fc4ff'];
    for (let i = 0; i < 8; i++) {
      const seed = (i * 37 + frame) % 60;
      particles.push(
        <rect key={'c' + i + frame}
              x={x + (i * 8 - 20) + Math.sin(frame * 0.3 + i) * 3}
              y={cy - 25 - seed * 0.5}
              width="2" height="2" fill={colors[i % colors.length]}/>
      );
    }
  }
  if (mood === 0 || mood === 6) {
    // Weekend party particles
    for (let i = 0; i < 10; i++) {
      const py = ((frame * 3 + i * 23) % 90) - 20;
      const px = (i * 87 + frame) % 200;
      const confColors = ['#ff3bb8','#ffd000','#3bb8ff','#00e5a8','#a66bff','#ff6b9a','#ff8a3a'];
      const rot = (frame + i * 30) % 360;
      particles.push(<rect key={'cf'+i} x={px} y={py} width="3" height="2" fill={confColors[i%7]} transform={`rotate(${rot} ${px+1.5} ${py+1})`}/>);
    }
    for (let i = 0; i < 3; i++) {
      const age = (frame + i * 12) % 36;
      const op = Math.max(0, 1 - age / 36);
      const nx = x + (i - 1) * 18 + Math.sin(age * 0.3) * 4;
      const ny = svgH / 2 - 20 - age * 1.2;
      const noteColors = ['#ff3bb8','#3bb8ff','#ffd000'];
      particles.push(<g key={'note'+i} opacity={op} transform={`translate(${nx} ${ny})`}>
        <rect x="2" y="-6" width="1" height="7" fill={noteColors[i%3]}/>
        <rect x="0" y="0" width="3" height="3" fill={noteColors[i%3]}/>
      </g>);
    }
    const beatF = frame % 4;
    if (beatF < 2) {
      particles.push(<circle key={'ring'+beatF} cx={x} cy={svgH/2+4} r={18 + beatF*12} fill="none" stroke="#ff3bb8" strokeWidth="1.5" opacity={0.6 - beatF*0.25}/>);
    }
  }
  return <>{particles}</>;
}

export default function BananaEasterEgg({ readySignal = false }) {
  const [active,    setActive]    = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [progress,  setProgress]  = useState(0);
  const [frame,     setFrame]     = useState(0);
  const rafRef       = useRef();
  const startRef     = useRef();
  const frameTickRef = useRef();
  const eligibleDowRef = useRef(null); // 存 dow，避免异步 state 读不到
  const firedRef       = useRef(false); // 防止重复触发
  const DURATION = 8000;

  // 合并成一个 effect，readySignal 变化时重跑
  useEffect(() => {
    const today = new Date();
    const dow   = today.getDay();
    if (!BANANA_DAYS.includes(dow)) return;
    const sessionKey = `banana-shown-${today.toDateString()}`;
    if (sessionStorage.getItem(sessionKey)) return;
    if (firedRef.current) return;``

    // 每次跑都设好 dow（幂等）
    setDayOfWeek(dow);
    eligibleDowRef.current = dow;

    if (!readySignal) return; // 还没 ready，等下次 readySignal 变 true 重跑

    const t = setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      sessionStorage.setItem(sessionKey, '1');
      setActive(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [readySignal]); // readySignal 变化驱动重跑

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

  useEffect(() => {
    if (!active) return;
    frameTickRef.current = setInterval(() => setFrame(f => f + 1), 1000 / 8);
    return () => clearInterval(frameTickRef.current);
  }, [active]);

  if (!active || dayOfWeek === null) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // SVG viewport — character lives at cx=40, cy=svgH/2
  const SVG_W = 900;
  const SVG_H = 80;
  const CX    = 40;
  const CY    = SVG_H / 2;

  // Map progress → screen X position (start off-left, end off-right)
  const screenX = -60 + progress * (vw + 120);

  // Y offset by day
  let screenY = vh * 0.44;
  if (dayOfWeek === 3) {
    screenY = vh * 0.44 + Math.sin(progress * Math.PI * 5) * 35;
  } else if (dayOfWeek === 5) {
    screenY = vh * 0.44 - Math.abs(Math.sin(progress * Math.PI * 8)) * 30;
  }

  const poseMap = { 0: satPose, 1: monPose, 3: wedPose, 5: friPose, 6: satPose };
  const getPose = poseMap[dayOfWeek] || monPose;
  const { pose, speed } = getPose(frame);

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const SAT_PHRASES = ["WEEKEND!!", "LET'S GO!!", "WOO!!", "PARTY TIME!!"];
  const SUN_PHRASES = ["SUNDAY!!", "RELAX!!", "REST DAY!!", "RECHARGE!!"];
  const weekendPhrases = dayOfWeek === 6 ? SAT_PHRASES : SUN_PHRASES;

  const DAY_MESSAGES_EXT = { ...DAY_MESSAGES, 0: SUN_PHRASES[Math.floor(frame/18) % SUN_PHRASES.length], 6: SAT_PHRASES[Math.floor(frame/18) % SAT_PHRASES.length] };
  const bubbleText = isWeekend ? weekendPhrases[Math.floor(frame / 18) % weekendPhrases.length] : (DAY_MESSAGES[dayOfWeek] || "LET'S GO!!");
  const showBubble = progress > 0.06 && progress < 0.90;
  const showSpeedLines = (dayOfWeek === 1 || dayOfWeek === 5) && progress > 0.05;

  // Scale factor: SVG renders at SVG_W×SVG_H but we want character to look ~3× pixel size
  // We achieve this by rendering the SVG small (natural pixel coords) then sizing the element
  const PIXEL_SCALE = 3;
  const displayW = SVG_W * PIXEL_SCALE;
  const displayH = SVG_H * PIXEL_SCALE;

  return (
    <>
      <style>{`
        @keyframes bananaTagIn {
          from { opacity:0; transform:translateX(-50%) translateY(-6px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Speed lines */}
      {showSpeedLines && [1, 2, 3].map(i => (
        <div key={i} style={{
          position: 'fixed',
          left: screenX - 20 - i * 18,
          top:  screenY + 14 + (i - 1.5) * 7,
          width:  14 + i * 8,
          height: 2,
          background: `rgba(0,155,255,${0.55 - i * 0.12})`,
          borderRadius: 2,
          zIndex: 13499,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* SVG character — crisp pixel art */}
      <div style={{
        position: 'fixed',
        left: screenX - CX * PIXEL_SCALE,
        top:  screenY - CY * PIXEL_SCALE,
        width:  displayW,
        height: displayH,
        zIndex: 13500,
        pointerEvents: 'none',
        willChange: 'transform',
        overflow: 'visible',
      }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={displayW}
          height={displayH}
          style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', overflow: 'visible' }}
        >
          <Particles mood={dayOfWeek} x={CX} frame={frame} svgH={SVG_H}/>
          {isWeekend && <DiscoBall cx={CX + 40} cy={18} frame={frame}/>}
          <LogoChar cx={CX} cy={CY} pose={pose}/>
          {showBubble && (
            <PixelBubble cx={CX} cy={CY - 20} text={bubbleText} frame={frame}/>
          )}
        </svg>
      </div>
    </>
  );
}