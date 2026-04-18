import React, { useState, useEffect } from 'react';

const LoginScreen = ({ onLogin, isInitializing, error }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div style={{minHeight:'100vh',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center',position:'relative',overflow:'hidden',background:'#f8fafc',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes revealText{0%{filter:blur(15px);opacity:0;transform:translateY(20px);}100%{filter:blur(0);opacity:1;transform:translateY(0);}}
        @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        @keyframes cloudFloat{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(30px,-20px) scale(1.1);}}
        @keyframes glintLogin{0%{left:-100%;}100%{left:100%;}}
        @keyframes spinSoft{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
        .ls-orb{position:absolute;border-radius:50%;filter:blur(80px);z-index:1;animation:cloudFloat 12s ease-in-out infinite;opacity:0.35;}
        .ls-part1{opacity:0;animation:revealText 1.2s cubic-bezier(0.23,1,0.32,1) forwards;animation-delay:0.3s;}
        .ls-part2{opacity:0;animation:revealText 1.2s cubic-bezier(0.23,1,0.32,1) forwards,shimmer 6s linear infinite;animation-delay:0.6s,2s;background:linear-gradient(90deg,#6366f1,#a855f7,#6366f1);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;}
        .ls-sub{opacity:0;animation:revealText 1s cubic-bezier(0.23,1,0.32,1) forwards;animation-delay:1.2s;}
        .ls-card{background:rgba(255,255,255,0.75);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.6);box-shadow:0 40px 100px -20px rgba(148,163,184,0.2),inset 0 0 0 1px rgba(255,255,255,0.5);}
        .ls-btn{position:relative;overflow:hidden;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);cursor:pointer;border:none;}
        .ls-btn::after{content:'';position:absolute;top:0;height:100%;width:60px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transform:skewX(-20deg);left:-100%;}
        .ls-btn:hover::after{animation:glintLogin 0.8s ease-in-out;}
        .ls-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 20px 40px rgba(99,102,241,0.25);}
        .ls-btn:active{transform:scale(0.96);}
        .ls-spinner{width:24px;height:24px;border:3px solid rgba(99,102,241,0.1);border-top-color:#6366f1;border-radius:50%;animation:spinSoft 0.8s linear infinite;}
      `}</style>

      {/* video background */}
      <video
        autoPlay loop muted playsInline
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0,opacity:0.35}}
      >
        <source src="https://hr-support.pattern.com/assets/Pattern_logo_video.mp4" type="video/mp4"/>
      </video>

      {/* gradient overlay */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(248,250,252,0.92),rgba(248,250,252,0.6),rgba(248,250,252,0.92))',zIndex:1}}/>

      {/* soft orbs */}
      <div className="ls-orb" style={{width:400,height:400,background:'#c7d2fe',top:-80,left:-60,animationDelay:'0s'}}/>
      <div className="ls-orb" style={{width:320,height:320,background:'#ddd6fe',bottom:-60,right:-40,animationDelay:'-4s'}}/>
      <div className="ls-orb" style={{width:200,height:200,background:'#e0e7ff',top:'40%',right:'10%',animationDelay:'-8s'}}/>

      <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:900,transition:'all 1s',opacity:show?1:0,transform:show?'translateY(0)':'translateY(40px)'}}>

        {/* slogan */}
        <div style={{marginBottom:48}}>
          <h1 style={{lineHeight:1.4,paddingBottom:8,overflow:'visible',fontSize:'clamp(32px,5vw,56px)',fontWeight:800,color:'#1e293b',letterSpacing:'-0.03em',margin:'0 0 8px',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <span className="ls-part1" style={{display:'inline-block',marginRight:12}}>Play the</span>
            <span className="ls-part2" style={{display:'inline-block'}}>Long Game.</span>
          </h1>
          <p className="ls-sub" style={{color:'#94a3b8',fontSize:'clamp(14px,2vw,18px)',fontWeight:500,margin:0,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            Sustainable growth through mindful presence.
          </p>
        </div>

        {/* card */}
        <div className="ls-card" style={{width:'100%',maxWidth:480,margin:'0 auto',borderRadius:52,padding:'48px 56px',display:'flex',flexDirection:'column',alignItems:'center'}}>

          <img
            src="https://i.ibb.co/YTQHg15F/Pattern-Logo.png"
            alt="Pattern"
            style={{height:44,objectFit:'contain',opacity:0.85,marginBottom:32}}
            onError={e=>{e.currentTarget.style.display='none';}}
          />

          <h2 style={{fontSize:20,fontWeight:700,color:'#1e293b',letterSpacing:'-0.02em',marginBottom:32,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            Welcome Back
          </h2>

          {isInitializing ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'24px 0'}}>
              <div className="ls-spinner"/>
              <div style={{fontSize:13,fontWeight:600,color:'#94a3b8',letterSpacing:'0.04em',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Initializing session...
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="ls-btn"
                style={{width:'100%',height:64,background:'#0f172a',color:'#fff',borderRadius:16,fontSize:15,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:16,boxShadow:'0 8px 24px rgba(15,23,42,0.2)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
              >
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="white"/>
                  <rect x="11" y="1" width="9" height="9" fill="white" fillOpacity="0.7"/>
                  <rect x="1" y="11" width="9" height="9" fill="white" fillOpacity="0.7"/>
                  <rect x="11" y="11" width="9" height="9" fill="white" fillOpacity="0.4"/>
                </svg>
                Sign in with Microsoft
              </button>
              {error && (
                <div style={{marginTop:20,padding:'10px 16px',background:'#fef2f2',borderLeft:'4px solid #f87171',color:'#b91c1c',fontSize:13,borderRadius:'0 8px 8px 0',textAlign:'left',width:'100%',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {error}
                </div>
              )}
            </>
          )}

          <div style={{width:'100%',paddingTop:28,marginTop:32,borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#818cf8'}}/>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',color:'#94a3b8',textTransform:'uppercase',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                Whereabouts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;