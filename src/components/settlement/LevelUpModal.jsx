import { useState, useEffect } from 'react';
import { useFrame } from './SettlementChar';
import PatternBurst from './PatternBurst';

export default function LevelUpModal({ lvl, onClose, onClaim }) {
  const frame = useFrame(true, 18);
  const [phase, setPhase] = useState(0); // 0=fastfwd, 1=reveal, 2=settle
  const [weekCount, setWeekCount] = useState(1);
  const [burst, setBurst] = useState(null);

  useEffect(() => {
    if (phase === 0) {
      let w = 1;
      setWeekCount(1);
      const id = setInterval(() => {
        w += 1;
        setWeekCount(w);
        if (w >= lvl.week) { clearInterval(id); setTimeout(() => setPhase(1), 400); }
      }, 340);
      return () => clearInterval(id);
    }
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 1100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const spotPct = phase === 0 ? 16 : 110;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 15000,
      background: 'rgba(4,2,14,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 340, borderRadius: 28,
        background: 'linear-gradient(160deg,rgba(10,6,28,0.99),rgba(16,8,40,0.99))',
        border: `1.5px solid ${lvl.ringFrom}44`,
        boxShadow: `0 0 80px ${lvl.ringTo}22, 0 32px 80px rgba(0,0,0,0.7)`,
        padding: '28px 28px 24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'center',
        animation: 'lum-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <style>{`
          @keyframes lum-pop {
            from { opacity:0; transform:scale(0.8) translateY(20px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          @keyframes lum-ringspin { to { transform:rotate(360deg); } }
          @keyframes lum-flashout { from{opacity:1;} to{opacity:0;} }
          @keyframes lum-confetti0 { to { transform:translate(80px,160px) rotate(720deg); opacity:0; } }
          @keyframes lum-confetti1 { to { transform:translate(-80px,180px) rotate(-720deg); opacity:0; } }
          @keyframes lum-confetti2 { to { transform:translate(30px,200px) rotate(360deg); opacity:0; } }
        `}</style>

        {/* label */}
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: lvl.tagFg, marginBottom: 6,
        }}>
          {lvl.week === 0 ? 'Day 0 · Arrived' : `Week ${lvl.week * 2} · Unlocked`}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: '-0.01em' }}>
          {lvl.title}
        </div>

        {/* Scene circle with iris */}
        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 20px' }}>
          {/* ring glow */}
          <div style={{
            position: 'absolute', inset: '-4px', borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${lvl.ringFrom}, ${lvl.ringTo}, ${lvl.ringFrom})`,
            filter: 'blur(10px)', opacity: phase === 2 ? 0.85 : 0.4,
            animation: 'lum-ringspin 6s linear infinite',
            transition: 'opacity 0.5s',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
            boxShadow: `0 0 0 2px ${lvl.ringFrom}66, 0 0 40px ${lvl.ringTo}66`,
          }}>
            <lvl.Scene frame={frame} />

            {/* Iris mask */}
            {phase < 2 && <>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${spotPct - 2}%, #06020c ${spotPct + 2}%, #06020c 100%)`,
                transition: 'background 0.9s cubic-bezier(.6,0,.3,1)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 50%, transparent ${Math.max(0, spotPct - 6)}%, ${lvl.ringTo}55 ${spotPct}%, transparent ${spotPct + 8}%)`,
                mixBlendMode: 'screen',
                transition: 'background 0.9s cubic-bezier(.6,0,.3,1)',
                pointerEvents: 'none',
              }} />
              {phase === 0 && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', color: '#fff',
                  textShadow: `0 0 20px ${lvl.ringTo}, 0 0 6px #000`,
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.85 }}>WEEK</div>
                  <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{weekCount}</div>
                </div>
              )}
            </>}

            {/* Reveal flash */}
            {phase === 1 && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle, ${lvl.ringTo}, transparent 70%)`,
                animation: 'lum-flashout 1.1s ease-out forwards',
              }} />
            )}

            {/* Settle confetti inside circle */}
            {phase === 2 && [...Array(20)].map((_, i) => {
              const colors = ['#ff60c0', '#60d0ff', '#aef060', '#ffd060', '#c060ff'];
              const angle = (i / 20) * Math.PI * 2;
              const dist = 55 + (i % 3) * 14;
              return <div key={i} style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 4, height: 4, background: colors[i % 5], borderRadius: 1,
                transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`,
                animation: `lum-confetti${i % 3} 1.4s ease-out forwards`,
                animationDelay: `${(i % 5) * 0.05}s`,
              }} />;
            })}
          </div>
        </div>

        {/* Vibe text */}
        <div style={{ fontSize: 13, color: 'rgba(232,229,255,0.85)', lineHeight: 1.55, marginBottom: 8 }}>
          {lvl.vibe}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
          {lvl.rule}
        </div>

        {/* Claim button — only in phase 2 */}
        {phase === 2 && (
          <button onClick={e => {
            const r = e.currentTarget.getBoundingClientRect();
            setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            onClaim && onClaim();
          }} style={{
            padding: '11px 36px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${lvl.ringFrom}, ${lvl.ringTo})`,
            color: '#0a0612', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: `0 0 24px ${lvl.ringTo}88`,
            transition: 'transform 0.15s',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✦ Claim Reward
          </button>
        )}
      </div>

      {burst && (
        <PatternBurst
          origin={burst}
          palette={[lvl.ringFrom, lvl.ringTo, '#ffd060', '#aef060', '#ffffff']}
          onDone={onClose}
        />
      )}
    </div>
  );
}
