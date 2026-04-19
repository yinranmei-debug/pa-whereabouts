import { useRef, useState, useCallback, useEffect } from 'react';

const PHASES = {
  IDLE: 'IDLE',
  EXPLODING: 'EXPLODING',
  IMPLODING: 'IMPLODING',
  FLOATING: 'FLOATING',
};

const T_EXPLODE = 6000;
const T_IMPLODE = 900;
const T_FLOATING = 2400;
const DECAY_PER_SEC = 100 / 8;           // 8 seconds to decay to zero
const PROGRESS_PER_CLICK_BASE = 1.2;     // base gain per click
const MAX_COOP_BOOST = 3;                // max multiplier from multi-user

export function useDimensionalBreach() {
  const [activeBreach, setActiveBreach] = useState(null);
  // activeBreach: { key, phase, originRect } | null

  const pillStatesRef = useRef({});
  // pillStatesRef.current: { [key]: { progress, users: Set, phase, lastClick } }

  const rafRef = useRef();
  const breachTimersRef = useRef([]);

  // Decay loop — continuously drains progress when no clicks
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dtSec = Math.min(now - last, 50) / 1000;
      last = now;

      Object.keys(pillStatesRef.current).forEach(key => {
        const state = pillStatesRef.current[key];
        if (!state || state.phase) return;
        state.progress = Math.max(0, state.progress - DECAY_PER_SEC * dtSec);
        if (state.progress <= 0 && state.users.size > 0) {
          state.users.clear();
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      breachTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Register a click on a pill (from local user OR broadcast from another user)
  const registerClick = useCallback((key, userId, pillEl) => {
    if (!key) return;

    const state = pillStatesRef.current[key] || {
      progress: 0,
      users: new Set(),
      phase: null,
      lastClick: 0,
    };

    // Ignore clicks during an active breach for the same pill
    if (state.phase) return;

    state.users.add(userId);
    state.lastClick = performance.now();

    // Coop boost: more unique users = faster accumulation
    const coopBoost = Math.min(MAX_COOP_BOOST, state.users.size);
    state.progress = Math.min(100, state.progress + PROGRESS_PER_CLICK_BASE * coopBoost);

    pillStatesRef.current[key] = state;

    // BREACH! Trigger the dimensional wall event
    if (state.progress >= 100) {
      state.phase = PHASES.EXPLODING;
      const rect = pillEl?.getBoundingClientRect?.() || null;

      setActiveBreach({
        key,
        phase: PHASES.EXPLODING,
        originRect: rect,
      });

      // Phase sequence: EXPLODING -> IMPLODING -> FLOATING -> cleanup
      const t1 = setTimeout(() => {
        setActiveBreach(b => (b ? { ...b, phase: PHASES.IMPLODING } : null));
      }, T_EXPLODE);

      const t2 = setTimeout(() => {
        setActiveBreach(b => (b ? { ...b, phase: PHASES.FLOATING } : null));
      }, T_EXPLODE + T_IMPLODE);

      const t3 = setTimeout(() => {
        setActiveBreach(null);
        delete pillStatesRef.current[key];
      }, T_EXPLODE + T_IMPLODE + T_FLOATING);

      breachTimersRef.current.push(t1, t2, t3);
    }
  }, []);

  const getProgress = useCallback((key) => {
    return pillStatesRef.current[key]?.progress || 0;
  }, []);

  const getUserCount = useCallback((key) => {
    return pillStatesRef.current[key]?.users?.size || 0;
  }, []);

  return { activeBreach, registerClick, getProgress, getUserCount };
}