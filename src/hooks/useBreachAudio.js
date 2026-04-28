import { useRef, useCallback } from 'react';

// Plays /public/breach.mp3 for the dimensional breach easter egg.
// At progress 75%+: audio starts at low volume and rises with the charge bar.
// On EXPLODING: volume jumps to full.
// On reset: audio stops and rewinds.

export function useBreachAudio() {
  const audioRef    = useRef(null);
  const startedRef  = useRef(false);
  const explodedRef = useRef(false);

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio('/breach.mp3');
      a.loop = false;
      a.volume = 0;
      audioRef.current = a;
    }
    return audioRef.current;
  };

  // Called every frame while charging (progress 0–100)
  const updateProgress = useCallback((progress) => {
    if (explodedRef.current) return;

    if (progress < 75) {
      // Below threshold — if we started, fade out
      if (startedRef.current && audioRef.current) {
        audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.02);
        if (audioRef.current.volume <= 0) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          startedRef.current = false;
        }
      }
      return;
    }

    const a = getAudio();
    const t = (progress - 75) / 25; // 0 at 75%, 1 at 100%
    const targetVol = 0.08 + t * 0.22; // 0.08 → 0.30

    if (!startedRef.current) {
      startedRef.current = true;
      a.currentTime = 0;
      a.volume = 0.08;
      a.play().catch(() => {}); // browser may block until gesture — safe to ignore
    } else {
      a.volume = Math.min(targetVol, 1);
    }
  }, []);

  // Called once when EXPLODING fires
  const triggerExplosion = useCallback(() => {
    if (explodedRef.current) return;
    explodedRef.current = true;

    const a = getAudio();
    if (!startedRef.current) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    // Ramp to full volume
    a.volume = 1;
  }, []);

  // Called when overlay resets
  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0;
    }
    startedRef.current  = false;
    explodedRef.current = false;
  }, []);

  return { updateProgress, triggerExplosion, reset };
}
