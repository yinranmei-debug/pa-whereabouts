import React, { useEffect, useRef } from 'react';

const T_EXPLODE = 6000;

export default function DimensionalBreachOverlay({ breach, chargingState }) {
  const portalRef = useRef(null);
  const currentSizeRef = useRef(0);
  const rafRef = useRef();

  // Decide what phase to render
  const isExploding = !!breach && (
    breach.phase === 'EXPLODING' ||
    breach.phase === 'IMPLODING' ||
    breach.phase === 'FLOATING'
  );

  // Charging state visible when there's progress but no active breach
  const isCharging = !breach && chargingState && chargingState.progress > 1;
  const chargingProgress = chargingState?.progress || 0;
  const chargingUserCount = chargingState?.userCount || 0;

  // Portal size animation — drives both charging and exploding states
  useEffect(() => {
    const loop = () => {
      const el = portalRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const viewportMax = Math.max(window.innerWidth, window.innerHeight);

      let target = 0;
      if (breach?.phase === 'EXPLODING') {
        target = viewportMax * (4 / 3);
      } else if (breach?.phase === 'IMPLODING' || breach?.phase === 'FLOATING') {
        target = 0;
      } else if (isCharging) {
        // Charging: gently grow from 80px to 50% of viewport as progress goes 0-100
        const minSize = 80;
        const maxSize = viewportMax * 0.5;
        target = minSize + (maxSize - minSize) * Math.pow(chargingProgress / 100, 0.7);
      }

      const cur = currentSizeRef.current;
      const diff = target - cur;
      const newVal = Math.abs(diff) < 0.5 ? target : cur + diff * 0.12;
      currentSizeRef.current = newVal;

      el.style.width = `${newVal}px`;
      el.style.height = `${newVal}px`;

      // Opacity: during charging, fade in based on progress
      let opacity = 0;
      if (breach?.phase === 'EXPLODING') opacity = 1;
      else if (isCharging) opacity = Math.min(1, chargingProgress / 15);
      el.style.opacity = opacity;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [breach, isCharging, chargingProgress]);

  // Nothing to show
  if (!breach && !isCharging) return null;

  return (
    <>
      {/* Full-screen flash - only on explosion */}
      {breach?.phase === 'EXPLODING' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 11500,
            pointerEvents: 'none',
            opacity: 0,
            animation: 'breachFlash 450ms ease-out forwards',
          }}
        />
      )}

      {/* Dark veil - more intense during explosion, lighter during charging */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(10,0,30,0.85) 0%, rgba(0,0,0,0.95) 70%)',
          zIndex: 11550,
          pointerEvents: 'none',
          opacity: isExploding
            ? (breach.phase === 'EXPLODING' ? 1 : breach.phase === 'IMPLODING' ? 0.5 : 0)
            : isCharging
            ? Math.min(0.55, chargingProgress / 100 * 0.7)  // gentle darken during charge
            : 0,
          transition: 'opacity 400ms ease-out',
        }}
      />

      {/* Portal core */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 11600,
        }}
      >
        <div
          ref={portalRef}
          style={{
            width: 0,
            height: 0,
            position: 'relative',
          }}
        >
          {/* Outer glow ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '4% solid rgba(79,70,229,0.3)',
              filter: 'blur(24px)',
              animation: 'breachPulse 1.5s ease-in-out infinite',
            }}
          />
          {/* Purple spinning ring */}
          <div
            style={{
              position: 'absolute',
              top: '2%', left: '2%', right: '2%', bottom: '2%',
              borderRadius: '50%',
              border: '2% solid transparent',
              borderTopColor: '#a855f7',
              borderLeftColor: '#a855f7',
              animation: 'breachSpin 0.8s linear infinite',
            }}
          />
          {/* Blue spinning ring */}
          <div
            style={{
              position: 'absolute',
              top: '12%', left: '12%', right: '12%', bottom: '12%',
              borderRadius: '50%',
              border: '2% solid transparent',
              borderBottomColor: '#60a5fa',
              borderRightColor: '#60a5fa',
              animation: 'breachSpin 0.45s linear infinite reverse',
            }}
          />
          {/* Core */}
          <div
            style={{
              position: 'absolute',
              top: '8%', left: '8%', right: '8%', bottom: '8%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #000 70%)',
              boxShadow:
                'inset 0 0 30% rgba(168,85,247,0.9), inset 0 0 12% rgba(59,130,246,0.6)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.5,
                background: 'radial-gradient(circle, white 0%, transparent 65%)',
                animation: 'breachPing 1.8s cubic-bezier(0,0,0.2,1) infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.4) 25%, transparent 50%, rgba(59,130,246,0.4) 75%, transparent 100%)',
                animation: 'breachSpin 3s linear infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* 🆕 Charging status text — small, elegant, beneath the portal */}
      {isCharging && (
        <div
          style={{
            position: 'fixed',
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11650,
            pointerEvents: 'none',
            textAlign: 'center',
            animation: 'chargingFadeIn 400ms ease-out',
          }}
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color: 'rgba(199,210,254,0.9)',
              textShadow: '0 0 20px rgba(129,140,248,0.6), 0 2px 10px rgba(0,0,0,0.8)',
              marginBottom: '8px',
              animation: 'chargingGlow 2s ease-in-out infinite',
            }}
          >
            {chargingUserCount >= 2
              ? `${chargingUserCount} teammates · building energy`
              : 'energy signal detected'}
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.4)',
              fontStyle: 'italic',
            }}
          >
            {chargingProgress < 40
              ? 'keep going...'
              : chargingProgress < 75
              ? 'the rift is widening'
              : 'almost there'}
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: '200px',
              height: '2px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              margin: '14px auto 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${chargingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                boxShadow: '0 0 10px rgba(168,85,247,0.8)',
                transition: 'width 200ms ease-out',
              }}
            />
          </div>
        </div>
      )}

      {/* Explosion text */}
      {(breach?.phase === 'EXPLODING' || breach?.phase === 'IMPLODING') && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 11700,
            padding: '48px',
            opacity: breach.phase === 'IMPLODING' ? 0 : 1,
            transform: breach.phase === 'IMPLODING' ? 'scale(0.7)' : 'scale(1)',
            transition: 'opacity 500ms ease-out, transform 600ms cubic-bezier(0.7,0,0.3,1)',
          }}
        >
          <div className="breach-pop" style={{ textAlign: 'center', maxWidth: '1200px' }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(48px, 8vw, 120px)',
                fontStyle: 'italic',
                textTransform: 'uppercase',
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                margin: '0 0 32px 0',
                background:
                  'linear-gradient(135deg, #a5b4fc 0%, #818cf8 25%, #6366f1 50%, #a855f7 75%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter:
                  'drop-shadow(0 6px 0 rgba(0,0,0,0.95)) drop-shadow(0 10px 24px rgba(99,102,241,0.55))',
              }}
            >
              YOUR ENERGY BROKE
              <br />
              THE DIMENSIONAL WALL!
            </h2>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(255,255,255,0.85)',
                fontSize: 'clamp(16px, 2vw, 28px)',
                fontWeight: 300,
                fontStyle: 'italic',
                letterSpacing: '0.02em',
                maxWidth: '720px',
                margin: '0 auto',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              What you asked for is on its way.
            </p>
          </div>
        </div>
      )}

      {/* FLOATING whisper */}
      {breach?.phase === 'FLOATING' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 11700,
            animation: 'receivedFloat 2400ms ease-out',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(165,180,252,0.8)',
                fontSize: '14px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.6em',
                animation: 'receivedGlow 2s ease-in-out infinite',
              }}
            >
              · received ·
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(255,255,255,0.35)',
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.3em',
                fontStyle: 'italic',
                marginTop: '10px',
              }}
            >
              the energy is yours now
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes breachFlash {
          0%   { opacity: 0; }
          20%  { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes breachSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes breachPulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes breachPing {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes breachPop {
          0%   { transform: scale(0.4) translateY(100px) rotate(-10deg); opacity: 0; }
          7%   { transform: scale(1.15) translateY(0) rotate(2deg); opacity: 1; }
          11%  { transform: scale(1) rotate(0); }
          90%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .breach-pop {
          animation: breachPop ${T_EXPLODE}ms cubic-bezier(0.2,0,0.2,1) forwards;
        }
        @keyframes receivedFloat {
          0%   { opacity: 0; transform: translateY(20px); }
          20%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; transform: translateY(-5px); }
          100% { opacity: 0; transform: translateY(-15px); }
        }
        @keyframes receivedGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(129,140,248,0.6); }
          50%      { text-shadow: 0 0 40px rgba(168,85,247,0.9), 0 0 60px rgba(99,102,241,0.6); }
        }
        @keyframes chargingFadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes chargingGlow {
          0%, 100% { opacity: 0.9; }
          50%      { opacity: 1; text-shadow: 0 0 30px rgba(168,85,247,0.9), 0 2px 10px rgba(0,0,0,0.8); }
        }
      `}</style>
    </>
  );
}