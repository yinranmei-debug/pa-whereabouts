import React, { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    id: 'nav',
    title: 'Navigation',
    desc: 'Switch between Calendar view and Holiday Planner here. The Holiday Planner shows all public holidays for the year.',
    position: 'bottom',
    highlight: () => document.querySelector('.nav-logo-text')?.closest('nav'),
  },
  {
    id: 'toolbar',
    title: 'Week Navigation',
    desc: 'Use ‹ › to move between weeks, or click Today to jump back to the current week instantly.',
    position: 'bottom',
    highlight: () => document.querySelector('.toolbar'),
  },
  {
    id: 'bulb',
    title: 'Wellbeing Daily Tips',
    desc: 'Every day we pick 3 wellbeing tips just for you. Click the lightbulb anytime to read them.',
    position: 'bottom-left',
    highlight: () => document.querySelector('.bulb-btn'),
  },
  {
    id: 'status',
    title: 'Set Your Status',
    desc: 'Click any AM or PM cell in your row to set your work status — Office, WFH, Leave and more.',
    position: 'top',
    highlight: () => document.querySelector('[id="my-row"] .sh.mine'),
  },
  {
    id: 'mood',
    title: 'Share Your Mood',
    desc: 'Click your avatar to pick a mood emoji. It appears as a badge on your profile for the team to see.',
    position: 'right',
    highlight: () => document.querySelector('.n-av-wrap.is-me'),
  },
  {
    id: 'online',
    title: 'Live Presence',
    desc: 'See who\'s currently online in real time. The green dot means they\'re active right now.',
    position: 'bottom-left',
    highlight: () => document.querySelector('.online-pill'),
  },
];

const PAD = 8;

const TourOverlay = ({ onDone }) => {
  const [step,    setStep]    = useState(0);
  const [box,     setBox]     = useState(null);
  const [tipPos,  setTipPos]  = useState({ top: 0, left: 0 });
  const rafRef = useRef(null);

  const current = STEPS[step];

  const measure = () => {
    const el = current.highlight?.();
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBox({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD*2, height: r.height + PAD*2 });

    const TIP_W = 300, TIP_H = 160;
    const pos = current.position;
    let top, left;

    if (pos === 'bottom' || pos === 'bottom-left') {
      top  = r.bottom + PAD + 12;
      left = pos === 'bottom-left' ? r.right - TIP_W : r.left;
    } else if (pos === 'top') {
      top  = r.top - TIP_H - 16;
      left = r.left;
    } else if (pos === 'right') {
      top  = r.top;
      left = r.right + 16;
    } else {
      top  = r.bottom + 12;
      left = r.left;
    }

    // clamp to viewport
    left = Math.max(12, Math.min(left, window.innerWidth - TIP_W - 12));
    top  = Math.max(12, Math.min(top,  window.innerHeight - TIP_H - 12));
    setTipPos({ top, left });
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [step]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onDone();
  };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const cutout = box
    ? `polygon(0% 0%, 0% 100%, ${box.left}px 100%, ${box.left}px ${box.top}px, ${box.left+box.width}px ${box.top}px, ${box.left+box.width}px ${box.top+box.height}px, ${box.left}px ${box.top+box.height}px, ${box.left}px 100%, 100% 100%, 100% 0%)`
    : 'none';

  return (
    <>
      <style>{`
        @keyframes tourFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes tourTipIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tourPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,155,255,0.5);}50%{box-shadow:0 0 0 8px rgba(0,155,255,0);}}
        .tour-highlight-ring{animation:tourPulse 1.8s ease-in-out infinite;}
      `}</style>

      {/* dark overlay with cutout */}
      <div style={{
        position:'fixed',inset:0,zIndex:11000,
        background:'rgba(10,15,30,0.65)',
        clipPath: cutout,
        animation:'tourFadeIn 0.3s ease',
        pointerEvents:'all',
      }} onClick={next}/>

      {/* highlight ring */}
      {box && (
        <div className="tour-highlight-ring" style={{
          position:'fixed',
          top:box.top, left:box.left,
          width:box.width, height:box.height,
          border:'2px solid #009bff',
          borderRadius:12,
          zIndex:11001,
          pointerEvents:'none',
          boxSizing:'border-box',
        }}/>
      )}

      {/* tooltip card */}
      <div style={{
        position:'fixed',
        top:tipPos.top, left:tipPos.left,
        width:300,
        background:'#fff',
        borderRadius:18,
        padding:'20px 22px 18px',
        zIndex:11002,
        boxShadow:'0 16px 48px rgba(0,0,0,0.18)',
        animation:'tourTipIn 0.25s ease',
      }}>
        {/* gradient top bar */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#009bff,#770bff)',borderRadius:'18px 18px 0 0'}}/>

        {/* step counter */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div style={{display:'flex',gap:5}}>
            {STEPS.map((_,i)=>(
              <div key={i} style={{width:i===step?18:6,height:6,borderRadius:3,transition:'all 0.25s',background:i===step?'linear-gradient(90deg,#009bff,#770bff)':i<step?'#c7d2fe':'#e5e7eb'}}/>
            ))}
          </div>
          <span style={{fontSize:11,color:'#9ca3af',fontWeight:500}}>{step+1} / {STEPS.length}</span>
        </div>

        <div style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          {current.title}
        </div>
        <p style={{fontSize:13,lineHeight:1.6,color:'#6b7280',margin:'0 0 18px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          {current.desc}
        </p>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button
            onClick={e=>{e.stopPropagation();onDone();}}
            style={{fontSize:12,color:'#9ca3af',background:'none',border:'none',cursor:'pointer',fontWeight:500,padding:0,fontFamily:"'Plus Jakarta Sans',sans-serif"}}
          >Skip tour</button>
          <div style={{display:'flex',gap:8}}>
            {step > 0 && (
              <button
                onClick={e=>{e.stopPropagation();prev();}}
                style={{height:34,padding:'0 14px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
              >Back</button>
            )}
            <button
              onClick={e=>{e.stopPropagation();next();}}
              style={{height:34,padding:'0 18px',borderRadius:9,border:'none',background:'linear-gradient(90deg,#009bff,#770bff)',fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 12px rgba(119,11,255,0.25)'}}
            >{step === STEPS.length-1 ? "Let's go 🚀" : 'Next'}</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourOverlay;