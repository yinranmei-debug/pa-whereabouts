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
const DECAY_PER_SEC = 100 / 8;
const PROGRESS_PER_CLICK_BASE = 1.7;
const MAX_COOP_BOOST = 3;

// 🌍 GLOBAL: all pill clicks contribute to one shared energy pool
const GLOBAL_KEY = '__global__';

export function useDimensionalBreach() {
  const [activeBreach, setActiveBreach] = useState(null);
  const [chargingState, setChargingState] = useState({
    key: null,
    progress: 0,
    userCount: 0,
  });

  // Single shared state instead of per-pill state
  const globalStateRef = useRef({
    progress: 0,
    users: new Set(),
    phase: null,
    lastClick: 0,
  });

  const rafRef = useRef();
  const breachTimersRef = useRef([]);

  useEffect(() => {
    let last = performance.now();
    let lastEmitTime = 0;

    const tick = (now) => {
      const dtSec = Math.min(now - last, 50) / 1000;
      last = now;

      const state = globalStateRef.current;

      // Only decay when not in a breach sequence
      if (!state.phase) {
        state.progress = Math.max(0, state.progress - DECAY_PER_SEC * dtSec);
        if (state.progress <= 0 && state.users.size > 0) {
          state.users.clear();
        }
      }

      if (now - lastEmitTime > 33) {
        lastEmitTime = now;
        setChargingState(prev => {
          const newProgress = state.progress;
          const newUserCount = state.users.size;
          if (
            Math.abs(prev.progress - newProgress) < 0.3 &&
            prev.userCount === newUserCount
          ) return prev;
          return {
            key: GLOBAL_KEY,
            progress: newProgress,
            userCount: newUserCount,
          };
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

  const registerClick = useCallback((_keyIgnored, userId, pillEl) => {
    const state = globalStateRef.current;

    // Ignore clicks during an active breach
    if (state.phase) return;

    state.users.add(userId);
    state.lastClick = performance.now();

    const coopBoost = Math.min(MAX_COOP_BOOST, state.users.size);
    state.progress = Math.min(100, state.progress + PROGRESS_PER_CLICK_BASE * coopBoost);

    if (state.progress >= 100) {
      state.phase = PHASES.EXPLODING;
      const rect = pillEl?.getBoundingClientRect?.() || null;

      setActiveBreach({
        key: GLOBAL_KEY,
        phase: PHASES.EXPLODING,
        originRect: rect,
      });

      window.dispatchEvent(new CustomEvent('rift-burst'));

      const t1 = setTimeout(() => {
        setActiveBreach(b => (b ? { ...b, phase: PHASES.IMPLODING } : null));
      }, T_EXPLODE);

      const t2 = setTimeout(() => {
        setActiveBreach(b => (b ? { ...b, phase: PHASES.FLOATING } : null));
      }, T_EXPLODE + T_IMPLODE);

      const t3 = setTimeout(() => {
        setActiveBreach(null);
        // Reset the global state after the full sequence
        globalStateRef.current = {
          progress: 0,
          users: new Set(),
          phase: null,
          lastClick: 0,
        };
      }, T_EXPLODE + T_IMPLODE + T_FLOATING);

      breachTimersRef.current.push(t1, t2, t3);
    }
  }, []);

  return {
    activeBreach,
    chargingState,
    registerClick,
  };
}