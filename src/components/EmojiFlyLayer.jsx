import React, { useState, useEffect, useRef } from 'react';

function EmojiFlyLayer({ flight, onComplete }) {
  const [progress,   setProgress]   = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!flight) { setProgress(0); setPathPoints([]); return; }
    const DURATION = 850;
    const t0 = performance.now();
    const pts = [];

    const animate = (now) => {
      const p = Math.min((now - t0) / DURATION, 1);
      setProgress(p);
      const { start, end } = flight;
      // 向上弧线控制点
      const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 40 };
      if (p >= 0.25) {
        const t  = (p - 0.25) / 0.75;
        const ez = t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
        pts.push({
          x: Math.pow(1-ez,2)*start.x + 2*(1-ez)*ez*ctrl.x + Math.pow(ez,2)*end.x,
          y: Math.pow(1-ez,2)*start.y + 2*(1-ez)*ez*ctrl.y + Math.pow(ez,2)*end.y,
        });
        setPathPoints([...pts]);
      }
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else { rafRef.current = null; setTimeout(onComplete, 40); }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [flight]);

  if (!flight) return null;

  const { start, end, icon } = flight;
  const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 120 };

  let x, y, scale, rotate, opacity;
  if (progress < 0.25) {
    const t  = progress / 0.25;
    const ez = 1 - Math.pow(1-t, 3);
    x = start.x; y = start.y;
    scale = 1 + ez; rotate = t * -18; opacity = ez;
  } else {
    const t  = (progress - 0.25) / 0.75;
    const ez = t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
    x = Math.pow(1-ez,2)*start.x + 2*(1-ez)*ez*ctrl.x + Math.pow(ez,2)*end.x;
    y = Math.pow(1-ez,2)*start.y + 2*(1-ez)*ez*ctrl.y + Math.pow(ez,2)*end.y;
    scale   = 2 - ez * 1.1;
    rotate  = -18 + ez * 18;
    opacity = progress > 0.88 ? 1 - (progress - 0.88) / 0.12 : 1;
  }

  const dPath = pathPoints.length > 1
    ? `M ${pathPoints[0].x} ${pathPoints[0].y} ` + pathPoints.slice(1).map(p=>`L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <>
      <svg style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:10998}}>
        <defs>
          <linearGradient id="fly-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#009bff" stopOpacity="0"/>
            <stop offset="55%"  stopColor="#009bff" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="#770bff" stopOpacity="0.82"/>
          </linearGradient>
          <filter id="fly-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {dPath && (
          <path d={dPath} fill="none" stroke="url(#fly-grad)" strokeWidth="7"
            strokeLinecap="round" filter="url(#fly-blur)"
            opacity={progress > 0.88 ? 0 : 1}
            style={{transition:'opacity 0.12s'}}
          />
        )}
      </svg>
      <div style={{
        position:'fixed', left:x, top:y,
        transform:`translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`,
        fontSize:'26px', pointerEvents:'none', zIndex:10999, opacity,
        filter:`drop-shadow(0 0 10px rgba(119,11,255,${progress>0.28?0.5:0}))`,
        willChange:'transform,opacity',
      }}>
        {icon}
      </div>
    </>
  );
}

export default EmojiFlyLayer;