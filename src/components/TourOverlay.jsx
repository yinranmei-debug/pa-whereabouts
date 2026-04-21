import React, { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    id: 'preface',
    title: '🌿 Before We Begin',
    desc: `Stay in sync. Work well. Live well.\n\nWhereabouts helps make the workday feel clearer and lighter, with an easy way to share your status, stay in step with your team, and make space for focus, balance, and small moments of fun.`,
    position: 'center',
    highlight: () => null,
  },
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
    desc: 'Use ‹ › to move between weeks. Click Today to snap back instantly.',
    position: 'bottom',
    highlight: () => document.querySelector('.toolbar'),
  },
  {
    id: 'bulb',
    title: '💡 Daily Mind Huddle',
    desc: '3 mindfulness tips refreshed every day, just for you. Click the lightbulb anytime you need a moment to breathe.',
    position: 'bottom-left',
    highlight: () => document.querySelector('.bulb-btn'),
  },
  {
    id: 'status',
    title: '🗓 Set Your Status',
    desc: 'Click any AM or PM cell in your row to set your work status for the day. Your team sees it live.',
    position: 'top',
    highlight: () => document.querySelector('#my-row .sh.mine') || document.querySelector('.sh.mine'),
  },
  {
    id: 'mood',
    title: '😊 Share Your Mood',
    desc: "Click your avatar to pick a mood emoji. It shows as a badge so your team knows how you're feeling today.",
    position: 'right',
    highlight: () => document.querySelector('.n-av-wrap.is-me'),
  },
  {
    id: 'celebrate',
    title: '🎉 Tap to Celebrate!',
    desc: `See a weekend or holiday coming up? Tap the column — confetti flies for the whole team instantly 🎊\n\nSecret: when enough teammates tap together at the same time, something wild happens. A dimensional rift tears open. No spoilers — go find out 👀`,
    position: 'top',
    highlight: () => document.querySelector('.pill.we') || document.querySelector('.pill.hol'),
  },
];

const PAD   = 6;
const TIP_W = 480;
const TIP_H = 320;

export default function TourOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const [box,  setBox]  = useState(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });

  const current = STEPS[step];
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
    setBox({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });

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

  // Plain React handlers — simple, no ref magic needed
  const handleSkip = (e) => {
    e.stopPropagation();
    onDone();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      onDone();
    }
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (step > 0) setStep(s => s - 1);
  };

  const renderDesc = (desc) =>
    desc.split('\n\n').map((para, i) => (
      <p key={i} style={{
        fontSize: 15, lineHeight: 1.65,
        color: i === 1 ? '#5b21b6' : '#6b7280',
        margin: i === 0 ? '0 0 12px' : '0',
        fontStyle: i === 1 ? 'italic' : 'normal',
      }}>
        {para}
      </p>
    ));

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

      {/* Dark overlay — pointerEvents none, never steals clicks */}
      {!box && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,15,30,0.82)',
          zIndex: 11000,
          pointerEvents: 'none',
        }} />
      )}
      {box && (() => {
        const { top, left, width, height } = box;
        const right  = left + width;
        const bottom = top  + height;
        const s = { position: 'fixed', background: 'rgba(10,15,30,0.78)', zIndex: 11000, pointerEvents: 'none' };
        return (
          <>
            <div style={{ ...s, top: 0, left: 0, right: 0, height: Math.max(0, top) }} />
            <div style={{ ...s, top: Math.max(0, bottom), left: 0, right: 0, bottom: 0 }} />
            <div style={{ ...s, top: Math.max(0, top), left: 0, width: Math.max(0, left), height: Math.max(0, height) }} />
            <div style={{ ...s, top: Math.max(0, top), left: Math.max(0, right), right: 0, height: Math.max(0, height) }} />
          </>
        );
      })()}

      {/* Spotlight ring */}
      {box && (
        <div className="tour-ring" style={{
          position: 'fixed', top: box.top, left: box.left,
          width: box.width, height: box.height,
          border: '2px solid rgba(0,155,255,0.85)', borderRadius: 10,
          zIndex: 11001, pointerEvents: 'none', boxSizing: 'border-box',
        }} />
      )}

      {/* Tooltip card — has className so global mousedown handler ignores it */}
      <div
        className="tour-overlay-card"
        style={{
          position: 'fixed',
          top:  tipPos.top,
          left: tipPos.left,
          width: TIP_W,
          background: '#fff',
          borderRadius: 24,
          padding: '30px 33px 27px',
          zIndex: 11500,
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
          animation: isCenter
            ? 'prefacePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'tourTipIn 0.25s ease both',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg,#009bff,#770bff)',
          borderRadius: '24px 24px 0 0',
        }} />

        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 22 : 8, height: 8, borderRadius: 4,
                transition: 'all 0.25s',
                background: i === step
                  ? 'linear-gradient(90deg,#009bff,#770bff)'
                  : i < step ? '#c7d2fe' : '#e5e7eb',
              }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{step + 1} / {STEPS.length}</span>
        </div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          {current.title}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          {renderDesc(current.desc)}
        </div>

        {/* Buttons — plain React onClick, stopPropagation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleSkip}
            style={{
              fontSize: 13, color: '#9ca3af', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 500, padding: 0,
            }}
          >
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  height: 42, padding: '0 20px', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  fontSize: 15, fontWeight: 600, color: '#374151', cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                height: 42, padding: '0 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(90deg,#009bff,#770bff)',
                fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(119,11,255,0.25)',
              }}
            >
              {isLast ? "Let's go 🚀" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}