import { useEffect, useMemo } from 'react';

export default function PatternBurst({ origin, palette, count = 28, duration = 1400, onDone }) {
  const o = origin || {
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  };
  const colors = palette || ['#ff60c0', '#60d0ff', '#aef060', '#ffd060', '#c060ff', '#ffffff'];

  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, []);

  const shards = useMemo(() => {
    return [...Array(count)].map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 180 + Math.random() * 220;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist + 40;
      const rot   = (Math.random() * 2 - 1) * 540;
      const size  = 10 + Math.random() * 16;
      const kind  = i % 3;
      const color = colors[i % colors.length];
      const delay = Math.random() * 120;
      return { tx, ty, rot, size, kind, color, delay };
    });
  }, [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      <div style={{
        position: 'absolute', left: o.x, top: o.y,
        width: 8, height: 8, marginLeft: -4, marginTop: -4,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 0 80px 30px #ffffffaa',
        animation: `pb-flash ${duration}ms ease-out forwards`,
      }} />
      <div style={{
        position: 'absolute', left: o.x, top: o.y,
        width: 20, height: 20, marginLeft: -10, marginTop: -10,
        border: '2px solid #fff', borderRadius: 0,
        animation: `pb-shock ${duration}ms cubic-bezier(.2,.7,.3,1) forwards`,
      }} />
      {shards.map((s, i) => {
        const base = {
          position: 'absolute', left: o.x, top: o.y,
          width: s.size, height: s.size,
          marginLeft: -s.size / 2, marginTop: -s.size / 2,
          background: s.color,
          boxShadow: `0 0 12px ${s.color}aa`,
          '--tx': `${s.tx}px`,
          '--ty': `${s.ty}px`,
          '--rot': `${s.rot}deg`,
          animation: `pb-shard ${duration}ms cubic-bezier(.2,.6,.3,1) forwards`,
          animationDelay: `${s.delay}ms`,
        };
        if (s.kind === 0) return <div key={i} style={{ ...base, clipPath: 'polygon(25% 0, 100% 0, 75% 100%, 0 100%)' }} />;
        if (s.kind === 1) return <div key={i} style={{ ...base, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />;
        return <div key={i} style={base} />;
      })}
      <style>{`
        @keyframes pb-flash {
          0%   { transform: scale(0.6); opacity: 1; }
          15%  { transform: scale(2.4); opacity: 1; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes pb-shock {
          0%   { transform: scale(0.4) rotate(45deg); opacity: 0.9; border-width: 3px; }
          100% { transform: scale(28)  rotate(45deg); opacity: 0;   border-width: 0.5px; }
        }
        @keyframes pb-shard {
          0%   { transform: translate(0,0) rotate(0deg) scale(0.3); opacity: 1; }
          15%  { transform: translate(calc(var(--tx)*0.25), calc(var(--ty)*0.15)) rotate(calc(var(--rot)*0.3)) scale(1.1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
