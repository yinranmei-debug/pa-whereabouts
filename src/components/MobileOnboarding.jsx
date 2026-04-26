import React, { useEffect, useState } from 'react';

const STEPS = [
  {
    title: 'Install Whereabouts',
    icon: '🪐',
    body: 'Add Whereabouts to your home screen for a full-screen app experience.',
  },
  {
    title: 'Move Through Weeks',
    icon: '↔',
    body: 'Use the week arrows, then scroll the day strip to see Monday through Sunday.',
  },
  {
    title: 'Set Your Status',
    icon: '+',
    body: 'Tap Morning or Afternoon to update where you will be. Holidays and weekends do not need a status.',
  },
  {
    title: 'Check The Team',
    icon: '☷',
    body: 'Team groups follow the selected day. Tap a status group to see who is there for AM or PM.',
  },
  {
    title: 'Use The Hub',
    icon: '›',
    body: 'Swipe left for Weekly Team Update, Birthdays This Week, Mind Huddle, and Sign Out.',
  },
];

export default function MobileOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isInstallStep = step === 0;
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handlePrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
  };

  const finish = () => onDone?.();

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:13000,
      background:'rgba(4,13,26,0.82)',
      backdropFilter:'blur(12px)',
      display:'flex',alignItems:'flex-end',
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{
        width:'100%',
        margin:12,
        borderRadius:26,
        border:'1px solid rgba(167,139,250,0.25)',
        background:'linear-gradient(155deg,rgba(13,10,35,0.98),rgba(8,28,63,0.98))',
        boxShadow:'0 24px 70px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding:'22px 20px 18px',
        color:'#fff',
        overflow:'hidden',
        position:'relative',
      }}>
        <div style={{
          position:'absolute',right:-40,top:-44,width:180,height:180,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,229,199,0.2),rgba(119,11,255,0))',
          pointerEvents:'none',
        }}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,position:'relative'}}>
          <div style={{
            width:54,height:54,borderRadius:18,
            display:'flex',alignItems:'center',justifyContent:'center',
            background:'linear-gradient(135deg,rgba(0,155,255,0.22),rgba(119,11,255,0.2))',
            border:'1px solid rgba(167,139,250,0.25)',
            fontSize:26,fontWeight:900,
          }}>
            {current.icon}
          </div>
          <button onClick={finish} style={{
            border:'1px solid rgba(167,139,250,0.18)',
            background:'rgba(255,255,255,0.055)',
            color:'rgba(232,229,255,0.66)',
            borderRadius:12,
            height:34,
            padding:'0 12px',
            fontSize:12,
            fontWeight:800,
            cursor:'pointer',
          }}>Skip</button>
        </div>

        <div style={{position:'relative',marginTop:18}}>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:'0.14em',color:'rgba(167,139,250,0.72)',marginBottom:8}}>
            MOBILE TOUR
          </div>
          <div style={{fontSize:24,fontWeight:900,letterSpacing:'-0.035em',lineHeight:1.12}}>
            {current.title}
          </div>
          <div style={{fontSize:14,lineHeight:1.55,color:'rgba(232,229,255,0.66)',marginTop:10}}>
            {current.body}
          </div>
        </div>

        {isInstallStep && (
          <div style={{
            marginTop:16,
            padding:'12px 13px',
            borderRadius:18,
            border:'1px solid rgba(0,155,255,0.22)',
            background:'rgba(0,155,255,0.07)',
            color:'rgba(232,229,255,0.68)',
            fontSize:12,
            lineHeight:1.45,
          }}>
            {installPrompt
              ? 'Your browser supports direct install. Tap Install below.'
              : isiOS
                ? 'On iPhone: tap Share, then Add to Home Screen.'
                : 'If Install is not shown, open your browser menu and choose Install app or Add to Home screen.'}
          </div>
        )}

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginTop:20}}>
          <div style={{display:'flex',gap:6}}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width:i === step ? 22 : 7,height:7,borderRadius:10,
                background:i === step ? 'linear-gradient(90deg,#009bff,#770bff)' : 'rgba(167,139,250,0.25)',
                transition:'all 0.2s',
              }}/>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            {isInstallStep && installPrompt && (
              <button onClick={handleInstall} style={{
                height:42,padding:'0 16px',borderRadius:14,border:'1px solid rgba(0,155,255,0.34)',
                background:'rgba(0,155,255,0.12)',color:'#fff',fontSize:13,fontWeight:900,cursor:'pointer',
              }}>Install</button>
            )}
            <button onClick={() => isLast ? finish() : setStep(s => s + 1)} style={{
              height:42,padding:'0 18px',borderRadius:14,border:'none',
              background:'linear-gradient(90deg,#009bff,#770bff)',
              color:'#fff',fontSize:13,fontWeight:900,cursor:'pointer',
              boxShadow:'0 8px 22px rgba(119,11,255,0.3)',
            }}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
