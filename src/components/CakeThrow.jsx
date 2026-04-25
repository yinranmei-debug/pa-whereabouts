import React, { useState, useEffect, useRef } from 'react';

function CakeSVG({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.95)" stroke="rgba(255,183,0,0.9)" strokeWidth="1"/>
      <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.9)" stroke="rgba(255,225,74,0.8)" strokeWidth="1"/>
      <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,1)"/>
      <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,1)"/>
      <ellipse cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,1)"/>
      <ellipse cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,1)"/>
    </svg>
  );
}

function SplatSVG({ size = 72 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size}
      shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="24" y="24" width="16" height="14" fill="#ffb0d0"/>
      <rect x="22" y="26" width="20" height="10" fill="#ffb0d0"/>
      <rect x="20" y="28" width="24" height="6"  fill="#ffb0d0"/>
      <rect x="24" y="24" width="16" height="3"  fill="#ffd0e4"/>
      <rect x="22" y="26" width="20" height="1"  fill="#ffd0e4"/>
      <rect x="24" y="23" width="16" height="1"  fill="#1a1205"/>
      <rect x="22" y="25" width="2"  height="1"  fill="#1a1205"/>
      <rect x="40" y="25" width="2"  height="1"  fill="#1a1205"/>
      <rect x="20" y="27" width="2"  height="1"  fill="#1a1205"/>
      <rect x="42" y="27" width="2"  height="1"  fill="#1a1205"/>
      <rect x="19" y="28" width="1"  height="6"  fill="#1a1205"/>
      <rect x="44" y="28" width="1"  height="6"  fill="#1a1205"/>
      <rect x="20" y="34" width="2"  height="1"  fill="#1a1205"/>
      <rect x="42" y="34" width="2"  height="1"  fill="#1a1205"/>
      <rect x="22" y="35" width="2"  height="1"  fill="#1a1205"/>
      <rect x="40" y="35" width="2"  height="1"  fill="#1a1205"/>
      <rect x="24" y="36" width="16" height="1"  fill="#1a1205"/>
      <rect x="28" y="26" width="3"  height="3"  fill="#fff0f8"/>
      <rect x="34" y="28" width="2"  height="2"  fill="#fff0f8"/>
      <rect x="26" y="32" width="2"  height="2"  fill="#fff0f8"/>
      <rect x="36" y="32" width="3"  height="2"  fill="#fff0f8"/>
      <rect x="27" y="31" width="2"  height="1"  fill="#ffe14a"/>
      <rect x="32" y="30" width="2"  height="1"  fill="#6ab6ff"/>
      <rect x="37" y="31" width="2"  height="1"  fill="#a78bfa"/>
      <rect x="30" y="12" width="3"  height="3"  fill="#ffb0d0"/>
      <rect x="29" y="12" width="1"  height="3"  fill="#1a1205"/>
      <rect x="33" y="12" width="1"  height="3"  fill="#1a1205"/>
      <rect x="30" y="11" width="3"  height="1"  fill="#1a1205"/>
      <rect x="30" y="15" width="3"  height="1"  fill="#1a1205"/>
      <rect x="46" y="16" width="2"  height="2"  fill="#8b5a3c"/>
      <rect x="45" y="16" width="1"  height="2"  fill="#1a1205"/>
      <rect x="48" y="16" width="1"  height="2"  fill="#1a1205"/>
      <rect x="46" y="15" width="2"  height="1"  fill="#1a1205"/>
      <rect x="46" y="18" width="2"  height="1"  fill="#1a1205"/>
      <rect x="14" y="18" width="2"  height="2"  fill="#ffb0d0"/>
      <rect x="13" y="18" width="1"  height="2"  fill="#1a1205"/>
      <rect x="16" y="18" width="1"  height="2"  fill="#1a1205"/>
      <rect x="14" y="17" width="2"  height="1"  fill="#1a1205"/>
      <rect x="14" y="20" width="2"  height="1"  fill="#1a1205"/>
      <rect x="52" y="30" width="3"  height="2"  fill="#8b5a3c"/>
      <rect x="51" y="30" width="1"  height="2"  fill="#1a1205"/>
      <rect x="55" y="30" width="1"  height="2"  fill="#1a1205"/>
      <rect x="52" y="29" width="3"  height="1"  fill="#1a1205"/>
      <rect x="52" y="32" width="3"  height="1"  fill="#1a1205"/>
      <rect x="8"  y="32" width="2"  height="2"  fill="#ffb0d0"/>
      <rect x="7"  y="32" width="1"  height="2"  fill="#1a1205"/>
      <rect x="10" y="32" width="1"  height="2"  fill="#1a1205"/>
      <rect x="8"  y="31" width="2"  height="1"  fill="#1a1205"/>
      <rect x="8"  y="34" width="2"  height="1"  fill="#1a1205"/>
      <rect x="46" y="46" width="3"  height="2"  fill="#ffb0d0"/>
      <rect x="45" y="46" width="1"  height="2"  fill="#1a1205"/>
      <rect x="49" y="46" width="1"  height="2"  fill="#1a1205"/>
      <rect x="46" y="45" width="3"  height="1"  fill="#1a1205"/>
      <rect x="46" y="48" width="3"  height="1"  fill="#1a1205"/>
      <rect x="14" y="48" width="2"  height="2"  fill="#8b5a3c"/>
      <rect x="13" y="48" width="1"  height="2"  fill="#1a1205"/>
      <rect x="16" y="48" width="1"  height="2"  fill="#1a1205"/>
      <rect x="14" y="47" width="2"  height="1"  fill="#1a1205"/>
      <rect x="14" y="50" width="2"  height="1"  fill="#1a1205"/>
      <rect x="32" y="4"  width="1"  height="4"  fill="#ffe14a"/>
      <rect x="54" y="10" width="3"  height="1"  fill="#ffe14a"/>
      <rect x="8"  y="10" width="3"  height="1"  fill="#ffe14a"/>
      <rect x="32" y="56" width="1"  height="4"  fill="#ffe14a"/>
      <rect x="54" y="52" width="3"  height="1"  fill="#ffe14a"/>
      <rect x="8"  y="52" width="3"  height="1"  fill="#ffe14a"/>
    </svg>
  );
}

function ConfettiSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"
      shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="8"  y="6"  width="3" height="3" fill="#ffe14a"/>
      <rect x="20" y="10" width="2" height="4" fill="#ff8fb0"/>
      <rect x="34" y="4"  width="4" height="2" fill="#6ab6ff"/>
      <rect x="50" y="8"  width="3" height="3" fill="#a78bfa"/>
      <rect x="66" y="12" width="2" height="4" fill="#00e5a8"/>
      <rect x="4"  y="22" width="2" height="4" fill="#ff6b6b"/>
      <rect x="16" y="26" width="3" height="3" fill="#ffe14a"/>
      <rect x="28" y="20" width="4" height="2" fill="#a78bfa"/>
      <rect x="42" y="24" width="3" height="3" fill="#6ab6ff"/>
      <rect x="56" y="28" width="2" height="4" fill="#ff8fb0"/>
      <rect x="70" y="24" width="3" height="3" fill="#00e5a8"/>
      <rect x="10" y="40" width="4" height="2" fill="#a78bfa"/>
      <rect x="24" y="44" width="3" height="3" fill="#ff6b6b"/>
      <rect x="38" y="40" width="2" height="4" fill="#ffe14a"/>
      <rect x="52" y="46" width="3" height="3" fill="#6ab6ff"/>
      <rect x="66" y="42" width="2" height="4" fill="#ff8fb0"/>
      <rect x="6"  y="60" width="3" height="3" fill="#00e5a8"/>
      <rect x="18" y="64" width="4" height="2" fill="#ff8fb0"/>
      <rect x="32" y="58" width="3" height="3" fill="#ffe14a"/>
      <rect x="46" y="62" width="2" height="4" fill="#a78bfa"/>
      <rect x="60" y="66" width="3" height="3" fill="#ff6b6b"/>
      <rect x="72" y="60" width="4" height="2" fill="#6ab6ff"/>
      <rect x="14" y="14" width="1" height="1" fill="#ffffff"/>
      <rect x="44" y="14" width="1" height="1" fill="#ffffff"/>
      <rect x="62" y="36" width="1" height="1" fill="#ffffff"/>
      <rect x="22" y="54" width="1" height="1" fill="#ffffff"/>
      <rect x="54" y="56" width="1" height="1" fill="#ffffff"/>
    </svg>
  );
}

// ── Geometric bday hat — same style as cake button SVG ──────────
export function BdayHatSVG({ size = 32 }) {
  const s = size / 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* cone — layered rects like cake tiers */}
      <rect x="11" y="2"  width="2" height="2" rx="0.5" fill="rgba(255,220,50,0.95)"/>
      <rect x="10" y="4"  width="4" height="2" rx="0.5" fill="rgba(255,143,176,0.9)"/>
      <rect x="9"  y="6"  width="6" height="2" rx="0.5" fill="rgba(167,139,250,0.9)"/>
      <rect x="8"  y="8"  width="8" height="2" rx="0.5" fill="rgba(255,183,0,0.85)"/>
      <rect x="7"  y="10" width="10" height="2" rx="0.5" fill="rgba(106,199,255,0.85)"/>
      <rect x="6"  y="12" width="12" height="2" rx="0.5" fill="rgba(167,139,250,0.9)"/>
      {/* brim */}
      <rect x="4"  y="14" width="16" height="3" rx="1.5" fill="rgba(255,183,0,0.8)" stroke="rgba(255,225,74,0.7)" strokeWidth="0.8"/>
      {/* star tip */}
      <ellipse cx="12" cy="2" rx="1.5" ry="1.5" fill="rgba(255,240,80,1)"/>
      {/* stripe accents on cone */}
      <rect x="10" y="6"  width="1" height="1" rx="0.3" fill="rgba(255,255,255,0.5)"/>
      <rect x="13" y="6"  width="1" height="1" rx="0.3" fill="rgba(255,255,255,0.5)"/>
      <rect x="9"  y="10" width="1" height="1" rx="0.3" fill="rgba(255,255,255,0.45)"/>
      <rect x="14" y="10" width="1" height="1" rx="0.3" fill="rgba(255,255,255,0.45)"/>
      {/* gem on brim */}
      <ellipse cx="12" cy="15.5" rx="1.5" ry="1" fill="rgba(255,100,130,0.9)"/>
    </svg>
  );
}

function ConfettiParticles({ cx, cy }) {
  const COLORS = ['#ffe14a','#ff8fb0','#6ab6ff','#a78bfa','#00e5a8','#ff6b6b','#fff'];
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 80 + Math.random() * 60;
    return {
      id: i,
      color: COLORS[i % COLORS.length],
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 40,
      size: 4 + Math.random() * 6,
      isRect: i % 3 !== 0,
      delay: i * 0.02,
      spin: Math.random() * 720 - 360,
    };
  });
  return (
    <>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:cx - p.size/2, top:cy - p.size/2,
          width:p.size, height:p.isRect ? p.size*0.55 : p.size,
          borderRadius:p.isRect ? '2px' : '50%',
          background:p.color,
          animation:`ctBurst 0.9s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
          '--dx':`${p.dx}px`, '--dy':`${p.dy}px`, '--spin':`${p.spin}deg`,
        }}/>
      ))}
    </>
  );
}

export default function CakeThrow({ target, active, onComplete, onHatReady }) {
  const [phase, setPhase] = useState('idle');
  const [avatarPos, setAvatarPos] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    if (!active || !target) return;
    const avEl = document.getElementById(`av-${target.id}`);
    if (!avEl) { onComplete?.(); return; }
    const r = avEl.getBoundingClientRect();
    setAvatarPos({ x: r.left + r.width/2, y: r.top + r.height/2 });
    setPhase('fly');
    clearTimers();
    timers.current.push(setTimeout(() => setPhase('splat'), 650));
    timers.current.push(setTimeout(() => setPhase('confetti'), 850));
    timers.current.push(setTimeout(() => onHatReady?.(target.id), 900));
    timers.current.push(setTimeout(() => { setPhase('idle'); onComplete?.(); }, 1800));
    return clearTimers;
  }, [active, target]);

  if (phase === 'idle' || !avatarPos) return null;
  const { x: cx, y: cy } = avatarPos;

  return (
    <>
      <style>{`
        @keyframes ctFly {
          0%   { transform:translate(0,-80px) rotate(0deg) scale(1.2); opacity:1; }
          100% { transform:translate(0,0px) rotate(540deg) scale(0.9); opacity:1; }
        }
        @keyframes ctSplatIn {
          0%   { transform:scale(0) rotate(-15deg); opacity:1; }
          55%  { transform:scale(1.25) rotate(6deg); }
          75%  { transform:scale(0.92) rotate(-3deg); }
          100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes ctBurst {
          0%   { transform:translate(0,0) rotate(0deg); opacity:1; }
          80%  { opacity:0.8; }
          100% { transform:translate(var(--dx),var(--dy)) rotate(var(--spin)); opacity:0; }
        }
        @keyframes ctConfettiSheet {
          0%   { transform:scale(0) rotate(-20deg); opacity:1; }
          50%  { transform:scale(1.1) rotate(5deg); opacity:1; }
          100% { transform:scale(1) rotate(0deg); opacity:0; }
        }
      `}</style>
      <div style={{ position:'fixed', inset:0, zIndex:13300, pointerEvents:'none' }}>
        {phase === 'fly' && (
          <div style={{ position:'absolute', left:cx-20, top:cy-20, animation:'ctFly 0.65s cubic-bezier(0.4,0,0.2,1) forwards' }}>
            <CakeSVG size={40}/>
          </div>
        )}
        {phase === 'splat' && (
          <div style={{ position:'absolute', left:cx-36, top:cy-36, animation:'ctSplatIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <SplatSVG size={72}/>
          </div>
        )}
        {phase === 'confetti' && (
          <>
            <div style={{ position:'absolute', left:cx-40, top:cy-60, animation:'ctConfettiSheet 0.9s ease both' }}>
              <ConfettiSVG/>
            </div>
            <ConfettiParticles cx={cx} cy={cy}/>
          </>
        )}
      </div>
    </>
  );
}