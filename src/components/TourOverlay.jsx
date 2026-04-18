import React, { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    id: 'nav',
    title: '📍 Navigation',
    desc: 'Switch between Calendar and Holiday Planner here. Your home base for the whole app.',
    position: 'bottom',
    highlight: () => document.querySelector('.nav'),
  },
  {
    id: 'toolbar',
    title: '⏪ Week Navigation',
    desc: 'Use ‹ › to move between weeks. Click Today to snap back instantly — watch the cool pulse effect!',
    position: 'bottom',
    highlight: () => document.querySelector('.toolbar'),
  },
  {
    id: 'bulb',
    title: '💡 Wellbeing Tips',
    desc: 'Every day we pick 3 personalised wellbeing tips just for you. Click the lightbulb anytime.',
    position: 'bottom-left',
    highlight: () => document.querySelector('.bulb-btn'),
  },
  {
    id: 'status',
    title: '🗓 Set Your Status',
    desc: 'Click any AM or PM cell in your row to set your work status. Try it — there\'s a fun flying effect!',
    position: 'top',
    highlight: () => document.querySelector('#my-row .sh.mine') || document.querySelector('.sh.mine'),
  },
  {
    id: 'mood',
    title: '😊 Share Your Mood',
    desc: 'Click your avatar to pick a mood emoji. It shows as a badge so your team knows how you\'re feeling.',
    position: 'right',
    highlight: () => document.querySelector('.n-av-wrap.is-me'),
  },
  {
    id: 'celebrate',
    title: '🎉 Celebrate Together',
    desc: 'Click on any weekend or holiday column — it triggers confetti and sends a live party effect to the whole team!',
    position: 'top',
    highlight: () => document.querySelector('.pill.we') || document.querySelector('.pill.hol'),
  },
  {
    id: 'online',
    title: '🟢 Live Presence',
    desc: 'See who\'s online right now in real time. The green dot means they\'re active.',
    position: 'bottom-left',
    highlight: () => document.querySelector('.online-pill'),
  },
];

const PAD = 6;

const TourOverlay = ({ onDone }) => {
  const [step,   setStep]   = useState(0);
  const [box,    setBox]    = useState(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });

  const current = STEPS[step];

  const measure = () => {
    const el = current.highlight?.();
    if (!el) { setBox(null); return; }
    const r = el.getBoundingClientRect();
    setBox({
      top:    r.top    - PAD,
      left:   r.left   - PAD,
      width:  r.width  + PAD * 2,
      height: r.height + PAD * 2,
    });

    const TIP_W = 300, TIP_H = 200;
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
    measure();
    window.addEventListener('resize',  measure);
    window.addEventListener('scroll',  measure, true);
    return () => {
      window.removeEventListener('resize',  measure);
      window.removeEventListener('scroll',  measure, true);
    };
  }, [step]);

  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : onDone();
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  // spotlight: four dark rectangles around the highlighted box
  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderSpotlight = () => {
    if (!box) return (
      <div style={{position:'fixed',inset:0,background:'rgba(10,15,30,0.75)',zIndex:11000,cursor:'pointer'}} onClick={next}/>
    );
    const { top, left, width, height } = box;
    const right  = left + width;
    const bottom = top  + height;
    const style  = { position:'fixed', background:'rgba(10,15,30,0.78)', zIndex:11000, cursor:'pointer' };
    return (
      <>
        {/* top */}
        <div style={{...style, top:0, left:0, right:0, height:Math.max(0,top)}} onClick={next}/>
        {/* bottom */}
        <div style={{...style, top:bottom, left:0, right:0, bottom:0}} onClick={next}/>
        {/* left */}
        <div style={{...style, top:Math.max(0,top), left:0, width:Math.max(0,left), height:height}} onClick={next}/>
        {/* right */}
        <div style={{...style, top:Math.max(0,top), left:right, right:0, height:height}} onClick={next}/>
      </>
    );
  };

  return (
    <>
      <style>{`
        @keyframes tourTipIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spotlightPulse{
          0%,100%{box-shadow:0 0 0 0 rgba(0,155,255,0.6),0 0 0 0 rgba(119,11,255,0.3);}
          50%{box-shadow:0 0 0 6px rgba(0,155,255,0.15),0 0 0 12px rgba(119,11,255,0.08);}
        }
        .tour-ring{animation:spotlightPulse 2s ease-in-out infinite;}
      `}</style>

      {/* spotlight panels */}
      {renderSpotlight()}

      {/* glowing ring around highlight */}
      {box && (
        <div className="tour-ring" style={{
          position:'fixed',
          top:box.top, left:box.left,
          width:box.width, height:box.height,
          border:'2px solid rgba(0,155,255,0.8)',
          borderRadius:10,
          zIndex:11001,
          pointerEvents:'none',
          boxSizing:'border-box',
        }}/>
      )}

      {/* tooltip */}
      <div style={{
        position:'fixed',
        top:tipPos.top, left:tipPos.left,
        width:300,
        background:'#fff',
        borderRadius:18,
        padding:'20px 22px 18px',
        zIndex:11002,
        boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
        animation:'tourTipIn 0.25s ease',
        fontFamily:"'Plus Jakarta Sans',sans-serif",
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#009bff,#770bff)',borderRadius:'18px 18px 0 0'}}/>

        {/* dots */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{display:'flex',gap:5}}>
            {STEPS.map((_,i)=>(
              <div key={i} style={{
                width:i===step?18:6, height:6, borderRadius:3,
                transition:'all 0.25s',
                background: i===step ? 'linear-gradient(90deg,#009bff,#770bff)' : i<step ? '#c7d2fe' : '#e5e7eb',
              }}/>
            ))}
          </div>
          <span style={{fontSize:11,color:'#9ca3af',fontWeight:500}}>{step+1} / {STEPS.length}</span>
        </div>

        <div style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:8}}>{current.title}</div>
        <p style={{fontSize:13,lineHeight:1.6,color:'#6b7280',margin:'0 0 18px'}}>{current.desc}</p>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={e=>{e.stopPropagation();onDone();}} style={{fontSize:12,color:'#9ca3af',background:'none',border:'none',cursor:'pointer',fontWeight:500,padding:0}}>
            Skip tour
          </button>
          <div style={{display:'flex',gap:8}}>
            {step > 0 && (
              <button onClick={e=>{e.stopPropagation();prev();}} style={{height:34,padding:'0 14px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer'}}>
                Back
              </button>
            )}
            <button onClick={e=>{e.stopPropagation();next();}} style={{height:34,padding:'0 18px',borderRadius:9,border:'none',background:'linear-gradient(90deg,#009bff,#770bff)',fontSize:13,fontWeight:700,color:'#fff',cursor:'pointer',boxShadow:'0 4px 12px rgba(119,11,255,0.25)'}}>
              {step === STEPS.length-1 ? "Let's go 🚀" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourOverlay;