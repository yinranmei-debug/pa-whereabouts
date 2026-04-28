import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from './SettlementChar';
import { LEVELS } from './SettlementLevels';
import PatternBurst from './PatternBurst';

// ─── streak computation ───────────────────────────────────────────
// records: { "${staffId}-${date}-AM": statusId, ... }
// returns number of consecutive qualifying weeks (Mon-Fri, ≥2 active days/week)
function computeStreak(staffId, records) {
  if (!staffId || !records) return 0;

  const activeDates = new Set();
  Object.keys(records).forEach(key => {
    if (!key.startsWith(staffId + '-')) return;
    const parts = key.split('-');
    // key format: staffId-YYYY-MM-DD-SHIFT → date is parts[1]-parts[2]-parts[3]
    const shift = parts[parts.length - 1];
    if (shift !== 'AM' && shift !== 'PM') return;
    const date = parts.slice(1, parts.length - 1).join('-');
    if (records[key] && records[key] !== 'none') activeDates.add(date);
  });

  // Walk backwards week by week from the most recent Mon
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToMon);
  thisMonday.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let w = 0; w < 8; w++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - w * 7);
    let activeDaysThisWeek = 0;
    for (let d = 0; d < 5; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const ds = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      if (activeDates.has(ds)) activeDaysThisWeek++;
    }
    if (activeDaysThisWeek >= 2) {
      streak++;
    } else {
      break;
    }
  }
  return Math.min(streak, 4);
}

// ─── ring glow ────────────────────────────────────────────────────
function RingGlow({ from, to, blur = 5, opacity = 0.65, duration = '8s' }) {
  return (
    <div style={{
      position: 'absolute', inset: '-3px', borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${from}, ${to}, ${from})`,
      filter: `blur(${blur}px)`, opacity,
      animation: `ss-ringspin ${duration} linear infinite`,
      pointerEvents: 'none',
    }} />
  );
}

// ─── scene circle ─────────────────────────────────────────────────
function SceneCircle({ Scene, frame, from, to, size = 100, blurred = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <RingGlow from={from} to={to} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
        boxShadow: `0 0 0 2px ${from}44, 0 0 18px ${to}55`,
        filter: blurred ? 'blur(7px) brightness(0.25) saturate(0.4)' : 'none',
        transition: 'filter 0.3s',
      }}>
        <Scene frame={frame} />
      </div>
      {blurred && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <div style={{ fontSize: 22, filter: 'drop-shadow(0 0 6px #000)' }}>🔒</div>
        </div>
      )}
    </div>
  );
}

// ─── week pip row ─────────────────────────────────────────────────
function WeekPips({ streak, current, from, to }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 6 }}>
      {[1, 2, 3, 4].map(w => {
        const done = streak >= w;
        const active = w === current + 1 && !done;
        return (
          <div key={w} style={{
            width: 28, height: 6, borderRadius: 3,
            background: done
              ? `linear-gradient(90deg, ${from}, ${to})`
              : active
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(255,255,255,0.08)',
            boxShadow: done ? `0 0 6px ${to}88` : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
        );
      })}
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.06em', marginLeft: 2 }}>
        {streak}/4 WKS
      </span>
    </div>
  );
}

// ─── main dropdown ────────────────────────────────────────────────
export default function StreakDropdown({ staffId, records, onClose, onLogout }) {
  const ref = useRef();
  const frame = useFrame(true, 18);
  const [burst, setBurst] = useState(null);
  const [justClaimed, setJustClaimed] = useState(false);

  const streak = useMemo(() => computeStreak(staffId, records), [staffId, records]);
  const currentLevelIdx = streak - 1; // -1 = none
  const currentLevel = currentLevelIdx >= 0 ? LEVELS[currentLevelIdx] : null;
  const nextLevel = streak < 4 ? LEVELS[streak] : null;

  const claimKey = staffId ? `settlement-claimed-${staffId}` : null;
  const [claimedWeeks, setClaimedWeeks] = useState(() => {
    if (!claimKey) return [];
    try { return JSON.parse(localStorage.getItem(claimKey) || '[]'); } catch { return []; }
  });

  const canClaim = currentLevel && !claimedWeeks.includes(currentLevel.id);

  const handleClaim = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const updated = [...claimedWeeks, currentLevel.id];
    setClaimedWeeks(updated);
    if (claimKey) localStorage.setItem(claimKey, JSON.stringify(updated));
    setJustClaimed(true);
  };

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const night = true; // always night-style inside dropdown
  const bg     = 'rgba(10,8,28,0.97)';
  const border = 'rgba(167,139,250,0.2)';
  const subC   = 'rgba(220,215,255,0.45)';
  const nameC  = 'rgba(232,229,255,0.92)';

  return (
    <>
      <div ref={ref} style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        width: 260, zIndex: 14000,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        boxShadow: '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(119,11,255,0.18)',
        backdropFilter: 'blur(24px)',
        overflow: 'hidden',
        animation: 'ss-dropin 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── header ── */}
        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: 'rgba(167,139,250,0.6)', textTransform: 'uppercase', marginBottom: 3 }}>
            Settlement Saga
          </div>
          {streak === 0 ? (
            <div style={{ fontSize: 12, color: subC, fontWeight: 500 }}>
              Set your status 2+ days this week to start your journey.
            </div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 700, color: nameC }}>
              {currentLevel?.title}
              <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 8, color: currentLevel ? currentLevel.tagFg : subC, background: currentLevel ? currentLevel.tagBg : 'transparent', padding: '1px 7px', borderRadius: 5 }}>
                WK {streak}
              </span>
            </div>
          )}
          {streak > 0 && (
            <WeekPips streak={streak} current={currentLevelIdx} from={currentLevel?.ringFrom ?? '#888'} to={currentLevel?.ringTo ?? '#aaa'} />
          )}
        </div>

        {/* ── current level scene ── */}
        {currentLevel ? (
          <div style={{ padding: '14px 14px 10px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <SceneCircle Scene={currentLevel.Scene} frame={frame} from={currentLevel.ringFrom} to={currentLevel.ringTo} size={80} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: nameC, fontWeight: 600, lineHeight: 1.4 }}>{currentLevel.vibe}</div>
              {canClaim && (
                <button
                  onClick={handleClaim}
                  style={{
                    marginTop: 8, padding: '5px 14px', fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.1em', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${currentLevel.ringFrom}, ${currentLevel.ringTo})`,
                    color: '#0a0612', textTransform: 'uppercase',
                    boxShadow: `0 0 12px ${currentLevel.ringTo}88`,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✦ Claim
                </button>
              )}
              {justClaimed && !canClaim && (
                <div style={{ marginTop: 6, fontSize: 10, color: currentLevel.tagFg, fontWeight: 700 }}>✓ Claimed!</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 14px 8px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: subC, textAlign: 'center', lineHeight: 1.5 }}>
              Your journey begins when you<br />set your status this week.
            </div>
          </div>
        )}

        {/* ── next level (blurred preview) ── */}
        {nextLevel && (
          <div style={{ padding: '10px 14px 12px', borderTop: '1px solid rgba(167,139,250,0.08)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <SceneCircle Scene={nextLevel.Scene} frame={frame} from={nextLevel.ringFrom} to={nextLevel.ringTo} size={52} blurred />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(167,139,250,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
                Next · Week {nextLevel.week}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(220,215,255,0.35)', fontStyle: 'italic' }}>
                ???
              </div>
              <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.35)', marginTop: 3 }}>
                {nextLevel.rule}
              </div>
            </div>
          </div>
        )}

        {/* ── sign out ── */}
        <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)', padding: '8px 14px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '7px 0', fontSize: 11, fontWeight: 600,
              color: 'rgba(232,229,255,0.5)', background: 'none', border: 'none',
              cursor: 'pointer', borderRadius: 8, letterSpacing: '0.05em',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(232,229,255,0.5)'; e.currentTarget.style.background = 'none'; }}
          >
            Sign out →
          </button>
        </div>
      </div>

      {burst && (
        <PatternBurst
          origin={burst}
          palette={currentLevel ? [currentLevel.ringFrom, currentLevel.ringTo, '#ffd060', '#aef060', '#fff'] : undefined}
          onDone={() => setBurst(null)}
        />
      )}

      <style>{`
        @keyframes ss-ringspin { to { transform: rotate(360deg); } }
        @keyframes ss-dropin {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
