import { useState, useEffect } from 'react';

export const BLUE_LIGHT = '#3bb8ff';
export const BLUE       = '#1e9eff';
export const BLUE_DARK  = '#0a72c4';
export const BLUE_DEEP  = '#08538a';
export const OUTLINE    = '#08324d';

export function useFrame(running = true, fps = 18) {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0, last = performance.now();
    const tick = (now) => {
      if (now - last > 1000 / fps) { last = now; setF(v => v + 1); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, fps]);
  return f;
}

export function Rects({ data }) {
  return data.map((r, i) => (
    <rect key={i} x={r.x} y={r.y} width={r.w || 1} height={r.h || 1} fill={r.c} opacity={r.o ?? 1} />
  ));
}

export function LogoChar({ cx, cy, pose = {}, bodyTint = null, rim = null, hideLegs = false, scale = 1 }) {
  const {
    armL = 20, armR = -20, legPhase = 0, bob = 0, bodyLean = 0,
    eyeShape = 'open', mouth = 'grin',
    armUp = false, armBoth = false,
  } = pose;

  const drawParallelogram = (ox, oy, color, highlight, rimColor) => {
    const rows = [
      { y: 0, xs: 9, xe: 27 }, { y: 1, xs: 8, xe: 26 }, { y: 2, xs: 7, xe: 25 }, { y: 3, xs: 5, xe: 23 },
      { y: 4, xs: 4, xe: 22 }, { y: 5, xs: 3, xe: 21 }, { y: 6, xs: 2, xe: 20 }, { y: 7, xs: 0, xe: 18 },
    ];
    const out = [];
    rows.forEach(r => {
      out.push({ x: ox + r.xs, y: oy + r.y, w: r.xe - r.xs + 1, h: 1, c: color });
      out.push({ x: ox + r.xs, y: oy + r.y, w: 1, h: 1, c: OUTLINE });
      out.push({ x: ox + r.xe, y: oy + r.y, w: 1, h: 1, c: OUTLINE });
    });
    out.push({ x: ox + 9, y: oy, w: 19, h: 1, c: OUTLINE });
    out.push({ x: ox, y: oy + 7, w: 19, h: 1, c: OUTLINE });
    out.push({ x: ox + 10, y: oy + 1, w: 16, h: 1, c: highlight });
    if (rimColor) rows.forEach(r => out.push({ x: ox + r.xe - 1, y: oy + r.y, w: 1, h: 1, c: rimColor, o: 0.85 }));
    return out;
  };

  const topY = cy - 8 + bob, botY = cy + bob;
  const tt  = bodyTint?.top   ?? BLUE_LIGHT;
  const tth = bodyTint?.topHi ?? '#8ddcff';
  const bb  = bodyTint?.bot   ?? BLUE;
  const bbh = bodyTint?.botHi ?? '#5fc4ff';
  const top = drawParallelogram(cx - 14, topY, tt, tth, rim);
  const bot = drawParallelogram(cx - 8,  botY, bb, bbh, rim);

  const eyeY = topY + 3, eyeLX = cx - 5, eyeRX = cx + 1;
  const face = [];
  const drawEye = (ex, ey, shape) => {
    if (shape === 'closed' || shape === 'sleepy') {
      face.push({ x: ex - 1, y: ey + 1, w: 3, h: 1, c: OUTLINE });
    } else if (shape === 'happy') {
      face.push({ x: ex - 1, y: ey + 1, w: 1, h: 1, c: OUTLINE });
      face.push({ x: ex, y: ey, w: 1, h: 1, c: OUTLINE });
      face.push({ x: ex + 1, y: ey + 1, w: 1, h: 1, c: OUTLINE });
    } else if (shape === 'sparkle') {
      face.push({ x: ex - 1, y: ey, w: 3, h: 2, c: OUTLINE });
      face.push({ x: ex, y: ey, w: 1, h: 1, c: '#fff' });
      face.push({ x: ex + 1, y: ey - 1, w: 1, h: 1, c: '#ffd9a8' });
    } else if (shape === 'focus') {
      face.push({ x: ex - 1, y: ey, w: 3, h: 1, c: OUTLINE });
      face.push({ x: ex, y: ey, w: 1, h: 1, c: '#fff' });
    } else {
      face.push({ x: ex - 1, y: ey, w: 3, h: 2, c: OUTLINE });
      face.push({ x: ex, y: ey, w: 1, h: 1, c: '#fff' });
    }
  };
  drawEye(eyeLX, eyeY, eyeShape);
  drawEye(eyeRX, eyeY, eyeShape);

  const mouthY = topY + 5, mc = cx - 2;
  if (mouth === 'grin') {
    face.push({ x: mc - 1, y: mouthY, w: 4, h: 1, c: OUTLINE });
    face.push({ x: mc - 2, y: mouthY - 1, w: 1, h: 1, c: OUTLINE });
    face.push({ x: mc + 3, y: mouthY - 1, w: 1, h: 1, c: OUTLINE });
  } else if (mouth === 'bigGrin') {
    face.push({ x: mc - 2, y: mouthY, w: 6, h: 2, c: OUTLINE });
    face.push({ x: mc - 1, y: mouthY + 1, w: 4, h: 1, c: '#ff7a9a' });
    face.push({ x: mc - 3, y: mouthY - 1, w: 1, h: 1, c: OUTLINE });
    face.push({ x: mc + 4, y: mouthY - 1, w: 1, h: 1, c: OUTLINE });
  } else if (mouth === 'soft') {
    face.push({ x: mc, y: mouthY, w: 3, h: 1, c: OUTLINE });
  } else if (mouth === 'determined') {
    face.push({ x: mc, y: mouthY, w: 3, h: 1, c: OUTLINE });
    face.push({ x: mc - 1, y: mouthY, w: 1, h: 1, c: OUTLINE });
  }
  face.push({ x: cx - 8, y: topY + 4, w: 2, h: 1, c: 'rgba(255,140,160,0.6)' });
  face.push({ x: cx + 4, y: topY + 4, w: 2, h: 1, c: 'rgba(255,140,160,0.6)' });

  const apLX = cx - 6, apLY = botY + 3, apRX = cx + 7;
  const armSegment = (side, lift) => {
    const baseX = side === 'L' ? apLX : apRX;
    const baseY = apLY;
    const dir   = side === 'L' ? -1 : 1;
    return (
      <g transform={`rotate(${lift * dir} ${baseX} ${baseY})`}>
        <rect x={side === 'L' ? baseX - 7 : baseX} y={baseY} width="7" height="3" fill={BLUE_DARK} />
        <rect x={side === 'L' ? baseX - 7 : baseX} y={baseY} width="7" height="1" fill={OUTLINE} />
        <rect x={side === 'L' ? baseX - 7 : baseX} y={baseY + 3} width="7" height="1" fill={OUTLINE} />
        <rect x={side === 'L' ? baseX - 10 : baseX + 7} y={baseY - 1} width="3" height="4" fill={BLUE_LIGHT} />
        <rect x={side === 'L' ? baseX - 10 : baseX + 7} y={baseY - 1} width="3" height="1" fill={OUTLINE} />
        <rect x={side === 'L' ? baseX - 10 : baseX + 7} y={baseY + 3} width="3" height="1" fill={OUTLINE} />
      </g>
    );
  };
  const armUpSegment = (side) => {
    const baseX = side === 'L' ? apLX : apRX;
    const baseY = apLY;
    return (
      <g>
        <rect x={baseX - 1} y={baseY - 8} width="3" height="8" fill={BLUE_DARK} />
        <rect x={baseX - 1} y={baseY - 8} width="1" height="8" fill={OUTLINE} />
        <rect x={baseX + 1} y={baseY - 8} width="1" height="8" fill={OUTLINE} />
        <rect x={baseX - 2} y={baseY - 11} width="4" height="3" fill={BLUE_LIGHT} />
        <rect x={baseX - 2} y={baseY - 11} width="4" height="1" fill={OUTLINE} />
        <rect x={baseX - 2} y={baseY - 11} width="1" height="3" fill={OUTLINE} />
        <rect x={baseX + 1} y={baseY - 11} width="1" height="3" fill={OUTLINE} />
      </g>
    );
  };

  const leftArm  = armBoth ? armUpSegment('L') : armUp ? armSegment('L', armL) : armSegment('L', armL);
  const rightArm = armBoth ? armUpSegment('R') : armUp ? armUpSegment('R')     : armSegment('R', -armR);

  let legs = null;
  if (!hideLegs) {
    const legBaseY = botY + 7, legCx = cx;
    const phases = [
      { lx: -3, ly: 0, rx: 2, ry: -1 }, { lx: -2, ly: 0, rx: 2, ry: 0 },
      { lx: -3, ly: -1, rx: 3, ry: 0 }, { lx: -2, ly: 0, rx: 2, ry: 0 },
    ];
    const p = phases[legPhase % 4];
    legs = (
      <g>
        <rect x={legCx + p.lx - 1} y={legBaseY + p.ly} width="3" height={5 + p.ly} fill={BLUE_DEEP} />
        <rect x={legCx + p.lx - 1} y={legBaseY + p.ly} width="1" height={5 + p.ly} fill={OUTLINE} />
        <rect x={legCx + p.lx + 1} y={legBaseY + p.ly} width="1" height={5 + p.ly} fill={OUTLINE} />
        <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 5} width="5" height="2" fill={BLUE_DEEP} />
        <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 5} width="5" height="1" fill={OUTLINE} />
        <rect x={legCx + p.lx - 2} y={legBaseY + p.ly + 6} width="5" height="1" fill={OUTLINE} />
        <rect x={legCx + p.rx - 1} y={legBaseY + p.ry} width="3" height={5 + p.ry} fill={BLUE_DEEP} />
        <rect x={legCx + p.rx - 1} y={legBaseY + p.ry} width="1" height={5 + p.ry} fill={OUTLINE} />
        <rect x={legCx + p.rx + 1} y={legBaseY + p.ry} width="1" height={5 + p.ry} fill={OUTLINE} />
        <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 5} width="5" height="2" fill={BLUE_DEEP} />
        <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 5} width="5" height="1" fill={OUTLINE} />
        <rect x={legCx + p.rx - 2} y={legBaseY + p.ry + 6} width="5" height="1" fill={OUTLINE} />
      </g>
    );
  }

  return (
    <g style={{ transform: `rotate(${bodyLean}deg) scale(${scale})`, transformOrigin: `${cx}px ${cy + 6}px` }}>
      {legs}
      <Rects data={bot} />
      {leftArm}
      <Rects data={top} />
      {rightArm}
      <Rects data={face} />
    </g>
  );
}
