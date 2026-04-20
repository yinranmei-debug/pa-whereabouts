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

  // 🆕 Live state for the "charging" visual
  const [chargingState, setChargingState] = useState({
    key: null,       // which pill is being charged
    progress: 0,     // 0-100
    userCount: 0,    // how many unique users
  });

  const pillStatesRef = useRef({});
  // pillStatesRef.current: { [key]: { progress, users: Set, phase, lastClick } }

  const rafRef = useRef();
  const breachTimersRef = useRef([]);

  // Decay loop — continuously drains progress when no clicks
  useEffect(() => {
    let last = performance.now();
    let lastEmitTime = 0;

    const tick = (now) => {
      const dtSec = Math.min(now - last, 50) / 1000;
      last = now;

      // Find the most-charged pill (the "active" one we're tracking)
      let mostActiveKey = null;
      let maxProgress = 0;

      Object.keys(pillStatesRef.current).forEach(key => {
        const state = pillStatesRef.current[key];
        if (!state || state.phase) return;
        state.progress = Math.max(0, state.progress - DECAY_PER_SEC * dtSec);
        if (state.progress <= 0 && state.users.size > 0) {
          state.users.clear();
        }
        if (state.progress > maxProgress) {
          maxProgress = state.progress;
          mostActiveKey = key;
        }
      });

      // Throttle UI updates to ~30fps (every 33ms) to prevent flood
      if (now - lastEmitTime > 33) {
        lastEmitTime = now;
        const activeState = mostActiveKey ? pillStatesRef.current[mostActiveKey] : null;
        setChargingState(prev => {
          const newProgress = activeState?.progress || 0;
          const newKey = mostActiveKey;
          const newUserCount = activeState?.users?.size || 0;
          // Skip update if nothing changed meaningfully
          if (
            prev.key === newKey &&
            Math.abs(prev.progress - newProgress) < 0.3 &&
            prev.userCount === newUserCount
          ) return prev;
          return { key: newKey, progress: newProgress, userCount: newUserCount };
        });
      }

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

    if (state.phase) return;

    state.users.add(userId);
    state.lastClick = performance.now();

    const coopBoost = Math.min(MAX_COOP_BOOST, state.users.size);
    state.progress = Math.min(100, state.progress + PROGRESS_PER_CLICK_BASE * coopBoost);

    pillStatesRef.current[key] = state;

    if (state.progress >= 100) {
      state.phase = PHASES.EXPLODING;
      const rect = pillEl?.getBoundingClientRect?.() || null;

      setActiveBreach({
        key,
        phase: PHASES.EXPLODING,
        originRect: rect,
      });

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

  return {
    activeBreach,
    chargingState,    // 🆕 { key, progress, userCount }
    registerClick,
    getProgress,
    getUserCount,
  };
}