import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'preface',
    title: 'Welcome to Whereabouts',
   desc: `Stay in sync. Work well. Live well.\n\nA lighter, clearer way to share your status, stay in step with your team, and make space for focus, balance, and small moments of fun.\n\nP.S. Keep your eyes open — a certain someone might drop by unannounced.`,
    highlight: () => null,
  },
  {
    id: 'nav',
    title: 'Navigation',
    desc: 'Switch between Calendar and Holiday Planner here. Your home base for the whole app.',
    position: 'bottom',
    highlight: () => document.querySelector('.nav'),
  },
  {
    id: 'toolbar',
    title: 'Week Navigation',
    desc: 'Use ‹ › to move between weeks. Click Today to snap back instantly.',
    position: 'bottom',
    highlight: () => document.querySelector('.toolbar'),
  },
  {
    id: 'status',
    title: 'Set Your Status',
    desc: 'Click any AM or PM cell in your row to set your work status for the day. Your team sees it live.',
    position: 'top',
    highlight: () => document.querySelector('#my-row .sh.mine') || document.querySelector('.sh.mine'),
  },
  {
    id: 'mood',
    title: 'Share Your Mood',
    desc: "Click your avatar to pick a mood emoji. It shows as a badge so your team knows how you're feeling today.",
    position: 'right',
    highlight: () => document.querySelector('.n-av-wrap.is-me'),
  },
  {
    id: 'hub-weekly',
    title: 'Team Week at a Glance',
    desc: 'See what\'s happening this week — birthdays, holidays, and team updates. Add a quick note for everyone to see.',
    position: 'bottom-left',
    highlight: () => document.querySelector('button[title="Team week at a glance"]'),
  },
  {
    id: 'hub-bday',
    title: 'Birthday Celebrations',
    desc: "When it's someone's birthday, this lights up. Every birthday star gets their own unique birthday scene — don't hesitate to celebrate and drop a cake on them!",
    position: 'bottom-left',
    highlight: () => document.querySelector('button[title="Birthday today!"]') || document.querySelector('button[title="Birthdays"]'),
  },
 {
    id: 'hub-planet',
    title: 'Daily Mind Huddle',
    desc: '3 mindfulness tips refreshed every day. Click the planet anytime you need a moment to breathe.',
    position: 'bottom-left',
    highlight: () => document.querySelector('button[title="Daily Mind Huddle"]'),
  },
  {
    id: 'celebrate',
    title: 'Tap to Celebrate!',
  desc: "See a weekend or holiday column? Tap it — confetti flies for the whole team instantly.\n\nSecret: when enough teammates tap together at the same time, something unexpected happens. You'll know it when you see it!",
    position: 'top',
    highlight: () => document.querySelector('.pill.we') || document.querySelector('.pill.hol'),
  },
];

const PAD   = 6;
const TIP_W = 440;
const TIP_H = 300;

export default function TourOverlay({ onDone }) {
  const [step,   setStep]   = useState(0);
  const [box,    setBox]    = useState(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });

  const current  = STEPS[step];
  const isCenter = current.position === 'center';
  const isLast   = step === STEPS.length - 1;

  const measure = () => {
    const el = current.highlight?.();
    if (!el) {
      setBox(null);
      setTipPos({
        top:  window.innerHeight / 2 - TIP_H / 2,
        left: window.innerWidth  / 2 - TIP_W / 2,
      });
      return;
    }
    const r = el.getBoundingClientRect();
    setBox({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD*2, height: r.height + PAD*2 });

    const pos = current.position;
    let top, left;
    if (pos === 'bottom' || pos === 'bottom-left') {
      top  = r.bottom + PAD + 14;
      left = pos === 'bottom-left' ? r.right - TIP_W : r.left;
    } else if (pos === 'top') {
      top  = r.top - TIP_H - 16;
      left = r.left;
    } else if (pos === 'right') {
      top  = r.top;
      left = r.right + 16;
    } else {
      top  = r.bottom + 14;
      left = r.left;
    }
    left = Math.max(12, Math.min(left, window.innerWidth  - TIP_W - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - TIP_H - 12));
    setTipPos({ top, left });
  };

  useEffect(() => {
    const t = setTimeout(measure, 80);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step]);

  const handleSkip = (e) => { e.stopPropagation(); onDone(); };
  const handleNext = (e) => {
    e.stopPropagation();
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onDone();
  };
  const handleBack = (e) => { e.stopPropagation(); if (step > 0) setStep(s => s - 1); };

 const PatternLogoMini = () => (
    <svg viewBox="0 0 28 16" width="28" height="16"
      style={{ imageRendering:'pixelated', shapeRendering:'crispEdges', verticalAlign:'middle', marginLeft:4 }}>
      {/* top parallelogram */}
      {[
        {y:0,xs:5,xe:14},{y:1,xs:4,xe:13},{y:2,xs:3,xe:12},{y:3,xs:2,xe:11},
        {y:4,xs:1,xe:10},{y:5,xs:0,xe:9},
      ].map((r,i)=>(
        <rect key={'t'+i} x={r.xs} y={r.y} width={r.xe-r.xs+1} height={1} fill="#3bb8ff"/>
      ))}
      {/* bottom parallelogram */}
      {[
        {y:7, xs:8,xe:17},{y:8, xs:7,xe:16},{y:9, xs:6,xe:15},{y:10,xs:5,xe:14},
        {y:11,xs:4,xe:13},{y:12,xs:3,xe:12},
      ].map((r,i)=>(
        <rect key={'b'+i} x={r.xs} y={r.y} width={r.xe-r.xs+1} height={1} fill="#1e9eff"/>
      ))}
      {/* outline dots */}
      <rect x="5" y="0" width="10" height="1" fill="#08324d"/>
      <rect x="0" y="5" width="10" height="1" fill="#08324d"/>
      <rect x="8" y="7" width="10" height="1" fill="#08324d"/>
      <rect x="3" y="12" width="10" height="1" fill="#08324d"/>
    </svg>
  );

  const renderDesc = (desc) =>
    desc.split('\n\n').map((para, i, arr) => (
      <p key={i} style={{
        fontSize: 14, lineHeight: 1.7,
        color: i === 1 ? 'rgba(167,139,250,0.9)' : 'rgba(196,181,253,0.75)',
        margin: i === 0 ? '0 0 10px' : i < arr.length - 1 ? '0 0 10px' : '0',
        fontStyle: i === 1 ? 'italic' : 'normal',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
      }}>
        {i === arr.length - 1 && para.includes('certain someone') ? (
          <>{para}<PatternLogoMini/></>
        ) : para}
      </p>
    ));

  // Icon for each step
  const stepIcons = {
    preface:    <svg width="28" height="28" viewBox="0 0 26 26" fill="none"><defs><radialGradient id="ti1" cx="35%" cy="32%" r="65%"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="40%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#2e1065"/></radialGradient></defs><circle cx="13" cy="13" r="9" fill="url(#ti1)"/><ellipse cx="13" cy="13" rx="13" ry="4" fill="none" stroke="rgba(167,139,250,0.75)" strokeWidth="1.5"/></svg>,
    nav:        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="4" rx="2" fill="rgba(167,139,250,0.4)" stroke="rgba(167,139,250,0.7)" strokeWidth="1.2"/><rect x="3" y="9" width="8" height="12" rx="2" fill="rgba(167,139,250,0.2)" stroke="rgba(167,139,250,0.5)" strokeWidth="1"/><rect x="13" y="9" width="8" height="12" rx="2" fill="rgba(106,199,255,0.2)" stroke="rgba(106,199,255,0.5)" strokeWidth="1"/></svg>,
    toolbar:    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="10" width="4" height="4" rx="1" fill="rgba(167,139,250,0.7)"/><rect x="10" y="8" width="4" height="8" rx="2" fill="rgba(0,155,255,0.9)"/><rect x="18" y="10" width="4" height="4" rx="1" fill="rgba(167,139,250,0.7)"/></svg>,
    status:     <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.2"/><rect x="7" y="10" width="4" height="3" rx="1" fill="rgba(106,199,255,0.8)"/><rect x="13" y="10" width="4" height="3" rx="1" fill="rgba(167,139,250,0.8)"/></svg>,
    mood:       <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.7)" strokeWidth="1.2"/><circle cx="9" cy="10" r="1.5" fill="rgba(196,181,253,0.9)"/><circle cx="15" cy="10" r="1.5" fill="rgba(196,181,253,0.9)"/><path d="M8 15 Q12 18 16 15" stroke="rgba(196,181,253,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>,
   'hub-weekly': <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.65)" strokeWidth="1.4"/><rect x="3" y="5" width="18" height="5" rx="3" fill="rgba(167,139,250,0.32)"/><rect x="3" y="8" width="18" height="2" fill="rgba(167,139,250,0.32)"/><rect x="8" y="3" width="2" height="4" rx="1" fill="rgba(196,181,253,0.9)"/><rect x="14" y="3" width="2" height="4" rx="1" fill="rgba(106,199,255,0.9)"/><circle cx="8" cy="15" r="1.4" fill="rgba(196,181,253,0.85)"/><circle cx="12" cy="15" r="1.4" fill="rgba(167,139,250,0.6)"/><circle cx="16" cy="15" r="1.4" fill="rgba(106,199,255,0.8)"/></svg>,
    'hub-bday': <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.8)" stroke="rgba(255,183,0,0.6)" strokeWidth="1"/><rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.6)"/><rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,0.9)"/><rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,0.9)"/><ellipse cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,1)"/><ellipse cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,1)"/></svg>,
    'hub-planet': <svg width="28" height="28" viewBox="0 0 26 26" fill="none"><defs><radialGradient id="ti2" cx="35%" cy="32%" r="65%"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="40%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#2e1065"/></radialGradient></defs><circle cx="13" cy="13" r="7" fill="url(#ti2)"/><ellipse cx="13" cy="13" rx="13" ry="4" fill="none" stroke="rgba(167,139,250,0.75)" strokeWidth="1.5"/><circle cx="2" cy="4" r="1.1" fill="rgba(196,181,253,0.8)"/><circle cx="23" cy="3" r="0.85" fill="rgba(106,199,255,0.8)"/></svg>,
    celebrate:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" fill="rgba(90,10,50,0.6)" stroke="rgba(217,70,239,0.5)" strokeWidth="1.2"/><rect x="10" y="8" width="4" height="8" rx="1" fill="rgba(217,70,239,0.4)"/></svg>,
  };

  return (
    <>
      <style>{`
        @keyframes tourTipIn {
          from { opacity:0; transform:translateY(10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes spotlightPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,155,255,0.55), 0 0 0 0 rgba(119,11,255,0.25); }
          50%     { box-shadow: 0 0 0 7px rgba(0,155,255,0.12), 0 0 0 14px rgba(119,11,255,0.06); }
        }
        .tour-ring { animation: spotlightPulse 2s ease-in-out infinite; }
        @keyframes prefacePop {
          from { opacity:0; transform:scale(0.92) translateY(16px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>

      {/* Overlay */}
      {!box && (
        <div style={{ position:'fixed', inset:0, background:'rgba(4,13,26,0.85)', zIndex:11000, pointerEvents:'none' }}/>
      )}
      {box && (() => {
        const { top, left, width, height } = box;
        const right  = left + width;
        const bottom = top  + height;
        const s = { position:'fixed', background:'rgba(4,13,26,0.82)', zIndex:11000, pointerEvents:'none' };
        return (
          <>
            <div style={{ ...s, top:0, left:0, right:0, height:Math.max(0,top) }}/>
            <div style={{ ...s, top:Math.max(0,bottom), left:0, right:0, bottom:0 }}/>
            <div style={{ ...s, top:Math.max(0,top), left:0, width:Math.max(0,left), height:Math.max(0,height) }}/>
            <div style={{ ...s, top:Math.max(0,top), left:Math.max(0,right), right:0, height:Math.max(0,height) }}/>
          </>
        );
      })()}

      {/* Spotlight ring */}
      {box && (
        <div className="tour-ring" style={{
          position:'fixed', top:box.top, left:box.left,
          width:box.width, height:box.height,
          border:'2px solid rgba(0,155,255,0.85)', borderRadius:12,
          zIndex:11001, pointerEvents:'none', boxSizing:'border-box',
        }}/>
      )}

      {/* Tip card — dark cosmic theme */}
      <div
        key={step}
        className="tour-overlay-card"
        style={{
          position:'fixed',
          top:  tipPos.top,
          left: tipPos.left,
          width: TIP_W,
          background:'linear-gradient(135deg,rgba(13,10,35,0.97),rgba(7,24,54,0.97))',
          border:'1px solid rgba(167,139,250,0.25)',
          borderRadius:20,
          padding:'26px 28px 22px',
          zIndex:11500,
          boxShadow:'0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter:'blur(20px)',
          animation: isCenter
            ? 'prefacePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'tourTipIn 0.25s ease both',
          fontFamily:"'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* top gradient bar */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:3,
          background:'linear-gradient(90deg,#009bff,#770bff)',
          borderRadius:'20px 20px 0 0',
        }}/>

        {/* progress dots */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ display:'flex', gap:5 }}>
            {STEPS.map((_,i) => (
              <div key={i} style={{
                width: i===step ? 20 : 7, height:7, borderRadius:4,
                transition:'all 0.25s',
                background: i===step
                  ? 'linear-gradient(90deg,#009bff,#770bff)'
                  : i < step ? 'rgba(167,139,250,0.4)' : 'rgba(167,139,250,0.15)',
              }}/>
            ))}
          </div>
          <span style={{ fontSize:11, color:'rgba(167,139,250,0.5)', fontWeight:600, letterSpacing:'0.04em' }}>
            {step+1} / {STEPS.length}
          </span>
        </div>

        {/* icon + title */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{
            width:44, height:44, borderRadius:13, flexShrink:0,
            background:'rgba(167,139,250,0.1)',
            border:'1px solid rgba(167,139,250,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {stepIcons[current.id]}
          </div>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.2 }}>
            {current.title}
          </div>
        </div>

        {/* description */}
        <div style={{ marginBottom:22 }}>
          {renderDesc(current.desc)}
        </div>

        {/* buttons */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={handleSkip} style={{
            fontSize:12, color:'rgba(167,139,250,0.45)', background:'none', border:'none',
            cursor:'pointer', fontWeight:600, padding:0, fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>
            Skip tour
          </button>
          <div style={{ display:'flex', gap:8 }}>
            {step > 0 && (
              <button onClick={handleBack} style={{
                height:38, padding:'0 18px', borderRadius:10,
                border:'1px solid rgba(167,139,250,0.25)',
                background:'rgba(255,255,255,0.05)',
                fontSize:13, fontWeight:600, color:'rgba(232,229,255,0.7)',
                cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>
                Back
              </button>
            )}
            <button onClick={handleNext} style={{
              height:38, padding:'0 22px', borderRadius:10, border:'none',
              background:'linear-gradient(90deg,#009bff,#770bff)',
              fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer',
              boxShadow:'0 4px 14px rgba(119,11,255,0.35)',
              fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>
            {isLast ? "Let's go!" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}