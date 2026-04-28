import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from './SettlementChar';
import { LEVELS } from './SettlementLevels';
import LevelUpModal from './LevelUpModal';

// ─── streak computation ───────────────────────────────────────────
// Active day = any AM or PM status set (non-"none") on a weekday.
// Qualifying week = Mon-Fri with ≥2 active days.
// Streak = consecutive qualifying weeks going back from current week.
// Tier thresholds (cumulative): T1=1wk, T2=3wks, T3=6wks, T4=10wks
export function computeStreak(staffId, records) {
  if (!staffId || !records) return 0;

  const activeDates = new Set();
  Object.keys(records).forEach(key => {
    if (!key.startsWith(staffId + '-')) return;
    const parts = key.split('-');
    const shift = parts[parts.length - 1];
    if (shift !== 'AM' && shift !== 'PM') return;
    const date = parts.slice(1, parts.length - 1).join('-');
    if (records[key] && records[key] !== 'none') activeDates.add(date);
  });

  const today = new Date();
  const dow = today.getDay();
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToMon);
  thisMonday.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let w = 0; w < 10; w++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - w * 7);
    let count = 0;
    for (let d = 0; d < 5; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const ds = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      if (activeDates.has(ds)) count++;
    }
    if (count >= 2) streak++;
    else break;
  }
  return streak; // 0-10
}

// streak (0-10) → LEVELS index (0-4)
// 0 = Day Zero, 1-2 = Tier 1, 3-5 = Tier 2, 6-9 = Tier 3, 10 = Tier 4
export function streakToLevelIdx(streak) {
  if (streak >= 10) return 4;
  if (streak >= 6)  return 3;
  if (streak >= 3)  return 2;
  if (streak >= 1)  return 1;
  return 0;
}

// ─── sub-components ───────────────────────────────────────────────
function RingGlow({ from, to }) {
  return (
    <div style={{
      position: 'absolute', inset: '-3px', borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${from}, ${to}, ${from})`,
      filter: 'blur(5px)', opacity: 0.65,
      animation: 'ss-ringspin 8s linear infinite',
      pointerEvents: 'none',
    }} />
  );
}

function SceneCircle({ Scene, frame, from, to, size = 100, blurred = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <RingGlow from={from} to={to} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
        boxShadow: `0 0 0 2px ${from}44, 0 0 18px ${to}55`,
        filter: blurred ? 'blur(7px) brightness(0.22) saturate(0.3)' : 'none',
      }}>
        <Scene frame={frame} />
      </div>
      {blurred && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 20, filter: 'drop-shadow(0 0 6px #000)' }}>🔒</div>
        </div>
      )}
    </div>
  );
}

// 10 pips grouped 1 | 2 | 3 | 4 matching tier costs T1=1, T2=2, T3=3, T4=4
function WeekPips({ streak, from, to }) {
  const groupEnds = new Set([1, 3, 6]); // divider after pip 1, 3, 6
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', marginTop: 7, flexWrap: 'nowrap' }}>
      {[1,2,3,4,5,6,7,8,9,10].map(w => {
        const done = streak >= w;
        const active = w === streak + 1;
        return (
          <div key={w} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <div style={{
              width: 15, height: 5, borderRadius: 3,
              background: done
                ? `linear-gradient(90deg, ${from}, ${to})`
                : active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              boxShadow: done ? `0 0 5px ${to}77` : 'none',
              transition: 'background 0.3s',
            }} />
            {groupEnds.has(w) && <div style={{ width: 1, height: 8, background: 'rgba(255,255,255,0.1)', flexShrink: 0, marginLeft: 1 }} />}
          </div>
        );
      })}
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.06em', marginLeft: 3 }}>
        {streak}/10
      </span>
    </div>
  );
}

// ─── main dropdown ────────────────────────────────────────────────
export default function StreakDropdown({ staffId, records, onClose, onLogout }) {
  const ref = useRef();
  const frame = useFrame(true, 18);
  const [showModal, setShowModal] = useState(false);

  const streak = useMemo(() => computeStreak(staffId, records), [staffId, records]);
  const levelIdx = streakToLevelIdx(streak);
  const currentLevel = LEVELS[levelIdx];
  const nextLevel = levelIdx < 4 ? LEVELS[levelIdx + 1] : null;

  const claimKey = staffId ? `settlement-claimed-${staffId}` : null;
  const [claimedLevels, setClaimedLevels] = useState(() => {
    if (!claimKey) return [];
    try { return JSON.parse(localStorage.getItem(claimKey) || '[]'); } catch { return []; }
  });

  // Can claim if at a real level (not Day Zero) and haven't claimed yet
  const canClaim = levelIdx > 0 && !claimedLevels.includes(currentLevel.id);

  const handleClaimDone = () => {
    const updated = [...claimedLevels, currentLevel.id];
    setClaimedLevels(updated);
    if (claimKey) localStorage.setItem(claimKey, JSON.stringify(updated));
    setShowModal(false);
  };

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target) && !showModal) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, showModal]);

  const subC  = 'rgba(220,215,255,0.72)';
  const nameC = 'rgba(232,229,255,0.92)';

  // weeks needed to reach next level
  const weeksToNext = nextLevel ? nextLevel.weeksRequired - streak : 0;

  return (
    <>
      <div ref={ref} style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        width: 300, zIndex: 14000,
        background: 'rgba(10,8,28,0.97)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 20,
        boxShadow: '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(119,11,255,0.18)',
        backdropFilter: 'blur(24px)',
        overflow: 'hidden',
        animation: 'ss-dropin 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── header ── */}
        <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 4 }}>
            Settlement Saga
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: nameC }}>{currentLevel.title}</div>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
              color: currentLevel.tagFg, background: currentLevel.tagBg,
              padding: '2px 8px', borderRadius: 5,
            }}>
              {levelIdx === 0 ? 'DAY 0' : `TIER ${levelIdx}`}
            </span>
          </div>
          <WeekPips streak={streak} from={currentLevel.ringFrom} to={currentLevel.ringTo} />
        </div>

        {/* ── current level scene — big centered circle ── */}
        <div style={{ padding: '18px 16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <SceneCircle Scene={currentLevel.Scene} frame={frame} from={currentLevel.ringFrom} to={currentLevel.ringTo} size={120} />
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: 12, color: nameC, fontWeight: 600, lineHeight: 1.55 }}>{currentLevel.vibe}</div>
            {levelIdx === 0 ? (
              <div style={{ marginTop: 6, fontSize: 10, color: subC, lineHeight: 1.6 }}>
                Update your status 2 days this week — a new scene unlocks.
              </div>
            ) : nextLevel && weeksToNext > 0 ? (
              <div style={{ marginTop: 6, fontSize: 10, color: subC }}>
                {weeksToNext} more week{weeksToNext > 1 ? 's' : ''} to unlock Tier {levelIdx + 1}
              </div>
            ) : null}
            {canClaim && (
              <button onClick={() => setShowModal(true)} style={{
                marginTop: 12, padding: '9px 28px', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.12em', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${currentLevel.ringFrom}, ${currentLevel.ringTo})`,
                color: '#0a0612', textTransform: 'uppercase',
                boxShadow: `0 0 18px ${currentLevel.ringTo}88, 0 0 6px ${currentLevel.ringFrom}66`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                animation: 'ss-claimpulse 2s ease-in-out infinite',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = `0 0 28px ${currentLevel.ringTo}cc`; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 18px ${currentLevel.ringTo}88, 0 0 6px ${currentLevel.ringFrom}66`; }}
              >✦ Claim Reward</button>
            )}
            {!canClaim && levelIdx > 0 && (
              <div style={{ marginTop: 8, fontSize: 10, color: currentLevel.tagFg, fontWeight: 700, opacity: 0.65 }}>✓ Reward claimed</div>
            )}
          </div>
        </div>

        {/* ── next level blurred preview ── */}
        {nextLevel && (
          <div style={{ padding: '10px 16px 12px', borderTop: '1px solid rgba(167,139,250,0.08)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <SceneCircle Scene={nextLevel.Scene} frame={frame} from={nextLevel.ringFrom} to={nextLevel.ringTo} size={60} blurred />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(167,139,250,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                Next unlock · {nextLevel.weeksRequired} wks
              </div>
              <div style={{ fontSize: 12, color: 'rgba(220,215,255,0.28)', fontStyle: 'italic' }}>???</div>
              <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.3)', marginTop: 3 }}>
                {nextLevel.rule}
              </div>
            </div>
          </div>
        )}

        {/* ── sign out ── */}
        <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)', padding: '8px 14px' }}>
          <button className="streak-signout" onClick={onLogout} style={{
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

      {/* Level-up claim modal — renders outside dropdown, fullscreen */}
      {showModal && (
        <LevelUpModal
          lvl={currentLevel}
          onClose={() => setShowModal(false)}
          onClaim={handleClaimDone}
        />
      )}

      <style>{`
        @keyframes ss-ringspin { to { transform: rotate(360deg); } }
        @keyframes ss-dropin {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ss-claimpulse {
          0%, 100% { box-shadow: 0 0 18px var(--ct,rgba(200,100,255,0.5)), 0 0 6px rgba(200,100,255,0.4); }
          50%       { box-shadow: 0 0 32px var(--ct,rgba(200,100,255,0.8)), 0 0 12px rgba(200,100,255,0.6); }
        }
      `}</style>
    </>
  );
}
