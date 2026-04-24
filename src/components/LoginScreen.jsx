import React, { useState, useEffect } from 'react';

const LoginScreen = ({ onLogin, isInitializing, error }) => {
  const [show, setShow] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    setStars(Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() > 0.85 ? 2 : 1,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
      color: i % 9 === 0 ? 'rgba(255,240,180,0.9)' : 'rgba(255,255,255,0.7)',
    })));
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      background: '#040d1a',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes starTwinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes auroraRot1 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes auroraRot2 { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes auroraRot3 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeSlideUp {
          0%{opacity:0;transform:translateY(32px) scale(0.97)}
          100%{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes logoShimmer {
          0%{background-position:0% center}
          100%{background-position:200% center}
        }
        @keyframes spinSoft { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes glintCosmo {
          0%{left:-100%;opacity:0}
          30%{opacity:1}
          100%{left:120%;opacity:0}
        }
        @keyframes pulseGlow {
          0%,100%{box-shadow:0 0 0 0 rgba(119,11,255,0)}
          50%{box-shadow:0 0 24px 4px rgba(119,11,255,0.25)}
        }
        @keyframes orbitDot {
          from{transform:rotate(0deg) translateX(34px) rotate(0deg)}
          to{transform:rotate(360deg) translateX(34px) rotate(-360deg)}
        }
        @keyframes ringOrbitLogin {
          from{transform:rotate(0deg) scaleY(0.3);}
          to{transform:rotate(360deg) scaleY(0.3);}
        }

        .ls-aurora { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .ls-card-inner {
          opacity:0;
          animation: fadeSlideUp 0.9s cubic-bezier(0.23,1,0.32,1) forwards;
        }
        .ls-logo-text {
          background: linear-gradient(90deg, #009bff 0%, #a78bfa 30%, #770bff 50%, #00e5ff 70%, #009bff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: logoShimmer 5s linear infinite;
        }
        .ls-btn {
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer; border: none;
        }
        .ls-btn::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(0,155,255,0.15), rgba(119,11,255,0.15));
          opacity:0; transition: opacity 0.3s;
        }
        .ls-btn::after {
          content:''; position:absolute; top:0; height:100%; width:70px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-20deg); left:-100%; pointer-events:none;
        }
        .ls-btn:hover::before { opacity:1; }
        .ls-btn:hover::after { animation: glintCosmo 0.7s ease-in-out; }
        .ls-btn:hover { transform: translateY(-2px) scale(1.015); }
        .ls-btn:active { transform: scale(0.96); }
        .ls-spinner {
          width:22px; height:22px;
          border:2px solid rgba(167,139,250,0.2);
          border-top-color:#a78bfa;
          border-radius:50%;
          animation: spinSoft 0.75s linear infinite;
        }
        .ls-card-wrap {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* ── Video background ── */}
      <video autoPlay loop muted playsInline style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 0, opacity: 0.12,
      }}>
        <source src="https://hr-support.pattern.com/assets/Pattern_logo_video.mp4" type="video/mp4"/>
      </video>

      {/* ── Cosmic gradient base ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 55% at 15% 8%, rgba(0,155,255,0.32) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 88% 6%, rgba(119,0,191,0.28) 0%, transparent 60%),
          radial-gradient(ellipse 55% 45% at 85% 60%, rgba(76,195,174,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 10% 80%, rgba(0,155,255,0.18) 0%, transparent 55%),
          linear-gradient(180deg, #040d1a 0%, #071836 40%, #0a1f42 75%, #08182f 100%)
        `,
      }}/>

      {/* ── Dot grid ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 100%)',
      }}/>

      {/* ── Aurora ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden', mixBlendMode: 'screen' }}>
        <div className="ls-aurora" style={{
          width: 700, height: 280, top: -100, left: -120, opacity: 0.55,
          background: 'conic-gradient(from 0deg, #009bff, #7700bf, #4cc3ae, #009bff)',
          animation: 'auroraRot1 28s linear infinite',
        }}/>
        <div className="ls-aurora" style={{
          width: 560, height: 230, top: '20%', right: -130, opacity: 0.45,
          background: 'conic-gradient(from 120deg, #7700bf, #4cc3ae, #009bff, #7700bf)',
          animation: 'auroraRot2 34s linear infinite',
        }}/>
        <div className="ls-aurora" style={{
          width: 420, height: 180, bottom: '8%', left: '20%', opacity: 0.4,
          background: 'conic-gradient(from 240deg, #4cc3ae, #009bff, #7700bf, #4cc3ae)',
          animation: 'auroraRot3 40s linear infinite',
        }}/>
      </div>

      {/* ── Starfield ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        {stars.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            borderRadius: '50%', background: s.color,
            animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 460,
        transition: 'opacity 0.8s, transform 0.8s',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(24px)',
      }}>

        {/* Slogan above card */}
        <div className="ls-card-inner" style={{ animationDelay: '0.1s', opacity: 0, marginBottom: 36 }}>
          <div style={{
            fontSize: 'clamp(11px,1.4vw,13px)', fontWeight: 700,
            letterSpacing: '0.18em', color: 'rgba(167,139,250,0.7)',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            Pattern Asia · Internal
          </div>
          <h1 style={{
            fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: '0 0 12px', color: '#fff',
          }}>
            Play the<br/>
            <span className="ls-logo-text">long game.</span>
          </h1>
          <p style={{
            color: 'rgba(196,181,253,0.55)', fontSize: 'clamp(13px,1.8vw,15px)',
            fontWeight: 500, margin: 0, letterSpacing: '0.01em',
          }}>
            Stay present. Manage time. Keep balance.
          </p>
        </div>

        {/* Card */}
        <div className="ls-card-wrap" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(167,139,250,0.18)',
          borderRadius: 28,
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          padding: '40px 44px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <div className="ls-card-inner" style={{ animationDelay: '0.35s', opacity: 0 }}>

            {/* Logo mark — graphic planet + orbiting dot */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="56" height="56" viewBox="0 0 26 26" fill="none" overflow="visible" style={{ position: 'relative', zIndex: 2 }}>
                  <defs>
                    <radialGradient id="lpGrad" cx="35%" cy="32%" r="68%">
                      <stop offset="0%" stopColor="#e0d4ff"/>
                      <stop offset="28%" stopColor="#a78bfa"/>
                      <stop offset="62%" stopColor="#6d28d9"/>
                      <stop offset="100%" stopColor="#1e1065"/>
                    </radialGradient>
                    <radialGradient id="lpShine" cx="30%" cy="28%" r="45%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.35)"/>
                      <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                    </radialGradient>
                  </defs>
                  <circle cx="13" cy="13" r="9" fill="url(#lpGrad)"/>
                  <ellipse cx="13" cy="11" rx="6" ry="1.5" fill="rgba(196,181,253,0.18)"/>
                  <ellipse cx="13" cy="14.5" rx="7" ry="1.2" fill="rgba(109,40,217,0.3)"/>
                  <circle cx="13" cy="13" r="9" fill="url(#lpShine)"/>
                  <circle cx="13" cy="13" r="9" stroke="rgba(167,139,250,0.35)" strokeWidth="0.5" fill="none"/>
                  <ellipse cx="13" cy="13" rx="13" ry="4" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="1.2"
                    style={{transformBox:'fill-box', transformOrigin:'center', animation:'ringOrbitLogin 8s linear infinite'}}/>
                </svg>
                {/* Orbiting dot */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 10, height: 10, marginTop: -5, marginLeft: -5,
                  animation: 'orbitDot 3.5s linear infinite',
                  zIndex: 3,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #7afff4, #00b8d4)',
                    boxShadow: '0 0 8px rgba(0,229,255,0.9), 0 0 16px rgba(0,229,255,0.4)',
                  }}/>
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 22, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.02em', marginBottom: 6,
            }}>
              Whereabouts
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(196,181,253,0.5)',
              fontWeight: 500, marginBottom: 32,
            }}>
              Sign in with your Pattern account
            </div>

            {isInitializing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0' }}>
                <div className="ls-spinner"/>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(167,139,250,0.55)', letterSpacing: '0.06em' }}>
                  Initializing session...
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="ls-btn"
                  style={{
                    width: '100%', height: 56,
                    background: 'linear-gradient(135deg, rgba(7,24,54,0.9) 0%, rgba(13,10,35,0.95) 100%)',
                    color: '#fff', borderRadius: 16,
                    fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
                    border: '1.5px solid rgba(167,139,250,0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '0.01em',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="white"/>
                    <rect x="11" y="1" width="9" height="9" fill="white" fillOpacity="0.65"/>
                    <rect x="1" y="11" width="9" height="9" fill="white" fillOpacity="0.65"/>
                    <rect x="11" y="11" width="9" height="9" fill="white" fillOpacity="0.35"/>
                  </svg>
                  Sign in with Microsoft
                </button>

                {error && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px',
                    background: 'rgba(239,68,68,0.12)',
                    borderLeft: '3px solid rgba(239,68,68,0.6)',
                    color: '#fca5a5', fontSize: 12,
                    borderRadius: '0 8px 8px 0',
                    textAlign: 'left',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {error}
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div style={{
              marginTop: 28, paddingTop: 24,
              borderTop: '1px solid rgba(167,139,250,0.1)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #009bff, #770bff)',
                  boxShadow: '0 0 6px rgba(119,11,255,0.5)',
                }}/>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  color: 'rgba(167,139,250,0.45)', textTransform: 'uppercase',
                }}>
                  Pattern Asia
                </span>
              </div>
              <p style={{
                fontSize: 11, color: 'rgba(167,139,250,0.3)',
                margin: 0, lineHeight: 1.6,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Built by May Mei · For internal use only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;