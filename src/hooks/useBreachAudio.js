import { useRef, useCallback } from 'react';

// Synthesized dimensional breach soundscape — no audio files required.
// Build phase (progress 75-100%): low drone swells in pitch + volume.
// Explosion: sub bass thump + noise burst + rising sweep + 20s ambient pad.
// Imploding/done: everything fades out.

export function useBreachAudio() {
  const ctxRef       = useRef(null);
  const droneOscRef  = useRef(null);
  const droneGainRef = useRef(null);
  const harmOscRef   = useRef(null);
  const harmGainRef  = useRef(null);
  const buildingRef  = useRef(false);
  const explodedRef  = useRef(false);

  const ctx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  // ── called every frame while charging ──────────────────────────
  const updateProgress = useCallback((progress) => {
    if (explodedRef.current) return;

    if (progress < 75) {
      // Below threshold — fade out if we started
      if (buildingRef.current) {
        const t = ctx().currentTime;
        droneGainRef.current?.gain.setTargetAtTime(0, t, 0.4);
        harmGainRef.current?.gain.setTargetAtTime(0, t, 0.4);
      }
      return;
    }

    const ac = ctx();
    const t = (progress - 75) / 25; // 0 at 75%, 1 at 100%

    if (!buildingRef.current) {
      buildingRef.current = true;

      // Low sine drone
      const drone = ac.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 48;
      const dGain = ac.createGain();
      dGain.gain.value = 0;
      drone.connect(dGain);
      dGain.connect(ac.destination);
      drone.start();
      droneOscRef.current  = drone;
      droneGainRef.current = dGain;

      // Harmonic layer — sawtooth through lowpass filter
      const harm = ac.createOscillator();
      harm.type = 'sawtooth';
      harm.frequency.value = 96;
      const hFilter = ac.createBiquadFilter();
      hFilter.type = 'lowpass';
      hFilter.frequency.value = 180;
      const hGain = ac.createGain();
      hGain.gain.value = 0;
      harm.connect(hFilter);
      hFilter.connect(hGain);
      hGain.connect(ac.destination);
      harm.start();
      harmOscRef.current  = harm;
      harmGainRef.current = hGain;
    }

    const now = ac.currentTime;
    // Pitch rises from 48 Hz → 110 Hz
    droneOscRef.current.frequency.setTargetAtTime(48 + t * 62, now, 0.15);
    // Volume rises 0 → 0.28
    droneGainRef.current.gain.setTargetAtTime(t * 0.28, now, 0.12);
    // Harmonic volume rises 0 → 0.09
    harmGainRef.current.gain.setTargetAtTime(t * 0.09, now, 0.12);
  }, []);

  // ── called once when progress hits 100% / EXPLODING fires ──────
  const triggerExplosion = useCallback(() => {
    if (explodedRef.current) return;
    explodedRef.current = true;

    const ac = ctx();
    const now = ac.currentTime;

    // Kill build oscillators
    droneGainRef.current?.gain.setTargetAtTime(0, now, 0.08);
    harmGainRef.current?.gain.setTargetAtTime(0, now, 0.08);

    // 1 ── Sub bass thump  (80 Hz → 18 Hz, 2s)
    const sub = ac.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, now);
    sub.frequency.exponentialRampToValueAtTime(18, now + 2);
    const subG = ac.createGain();
    subG.gain.setValueAtTime(0.55, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    sub.connect(subG); subG.connect(ac.destination);
    sub.start(now); sub.stop(now + 2.5);

    // 2 ── White noise burst (bandpass filtered)
    const noiseLen = ac.sampleRate * 2.5;
    const noiseBuf = ac.createBuffer(1, noiseLen, ac.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;
    const noise = ac.createBufferSource();
    noise.buffer = noiseBuf;
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 800;
    nFilter.Q.value = 0.4;
    const nGain = ac.createGain();
    nGain.gain.setValueAtTime(0.35, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(ac.destination);
    noise.start(now);

    // 3 ── Rising sawtooth sweep (100 Hz → 3500 Hz, 3.5s)
    const sweep = ac.createOscillator();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(100, now);
    sweep.frequency.exponentialRampToValueAtTime(3500, now + 3.5);
    const sFilter = ac.createBiquadFilter();
    sFilter.type = 'lowpass';
    sFilter.frequency.setValueAtTime(400, now);
    sFilter.frequency.exponentialRampToValueAtTime(9000, now + 3.5);
    const sGain = ac.createGain();
    sGain.gain.setValueAtTime(0, now);
    sGain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
    sweep.connect(sFilter); sFilter.connect(sGain); sGain.connect(ac.destination);
    sweep.start(now); sweep.stop(now + 4.5);

    // 4 ── Ambient sustain pad — A minor chord, 4 detuned sines, 22s total
    const padNotes = [110, 130.81, 164.81, 220]; // A2 C3 E3 A3
    padNotes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * (1 + (i % 2 === 0 ? 0.003 : -0.003)); // slight chorus
      const oGain = ac.createGain();
      const attackStart = now + 0.3 + i * 0.25;
      oGain.gain.setValueAtTime(0, attackStart);
      oGain.gain.linearRampToValueAtTime(0.065, attackStart + 1.5);
      oGain.gain.setValueAtTime(0.065, now + 20);
      oGain.gain.linearRampToValueAtTime(0, now + 28);
      osc.connect(oGain); oGain.connect(ac.destination);
      osc.start(attackStart); osc.stop(now + 28);
    });

    // 5 ── High shimmer layer (triangle, 1800→4200 Hz, fades 1→7s)
    const shimmer = ac.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1800, now + 1);
    shimmer.frequency.linearRampToValueAtTime(4200, now + 6);
    const shG = ac.createGain();
    shG.gain.setValueAtTime(0, now + 1);
    shG.gain.linearRampToValueAtTime(0.12, now + 2);
    shG.gain.linearRampToValueAtTime(0, now + 7);
    shimmer.connect(shG); shG.connect(ac.destination);
    shimmer.start(now + 1); shimmer.stop(now + 7);
  }, []);

  // ── called when overlay resets ──────────────────────────────────
  const reset = useCallback(() => {
    buildingRef.current  = false;
    explodedRef.current  = false;
    droneOscRef.current  = null;
    droneGainRef.current = null;
    harmOscRef.current   = null;
    harmGainRef.current  = null;
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, []);

  return { updateProgress, triggerExplosion, reset };
}
