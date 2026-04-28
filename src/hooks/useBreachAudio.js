import { useRef, useCallback, useEffect } from 'react';

// Plays the last ~3 seconds of /public/breach.mp3 (the "Whereabouts!" finale).
// Seeks to CLIP_START - 0.2 so the "Whereabouts!" word lands right as the
// rift overlay fully opens. Triggered by 'rift-burst' DOM event.

const CLIP_START = 27.77; // seconds — "Whereabouts!" word position
const LEAD_IN   = 0.2;    // start 0.2s early so word lands on the visual burst

export function useBreachAudio() {
  const audioRef    = useRef(null);
  const explodedRef = useRef(false);

  const getAudio = () => {
    if (!audioRef.current) {
      const a = new Audio('/breach.mp3');
      a.loop = false;
      a.volume = 0;
      a.preload = 'auto';
      audioRef.current = a;
    }
    return audioRef.current;
  };

  // Preload on mount so there's no delay when burst fires
  useEffect(() => { getAudio(); }, []);

  // Fire 0.2s before the visual so "Whereabouts!" word lands on the burst frame
  useEffect(() => {
    const onBurst = () => {
      if (explodedRef.current) return;
      explodedRef.current = true;
      const a = getAudio();
      a.currentTime = CLIP_START - LEAD_IN;
      a.volume = 1;
      a.play().catch(() => {});
    };
    window.addEventListener('rift-burst', onBurst);
    return () => window.removeEventListener('rift-burst', onBurst);
  }, []);

  // No-op — charge bar no longer drives audio
  const updateProgress = useCallback((_progress) => {}, []);

  // Called when overlay resets
  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0;
    }
    explodedRef.current = false;
  }, []);

  // triggerExplosion kept for API compatibility but rift-burst handles it now
  const triggerExplosion = useCallback(() => {}, []);

  return { updateProgress, triggerExplosion, reset };
}
