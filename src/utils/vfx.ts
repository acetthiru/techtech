import confetti from 'canvas-confetti';

// Web Audio API Synthesizers for authentic physical buzzer, timer ticks, and winner fanfare
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play authentic high-impact stadium game-show buzzer sound
 * Uses detuned dual sawtooth oscillators for electric solenoid raspy buzz,
 * a square harmonic for bite, and an initial tactile bass-thump.
 */
export function playBuzzerSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Master buzzer gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    // Quick punchy attack, sustained energetic buzz, tight non-clicking decay
    masterGain.gain.linearRampToValueAtTime(0.38, t + 0.015);
    masterGain.gain.setValueAtTime(0.38, t + 0.28);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    masterGain.connect(ctx.destination);

    // Primary low saw oscillator (165 Hz - E3)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(165, t);

    // Detuned second saw oscillator (172 Hz - 7 Hz beating creates distinctive electric buzz rasp)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(172, t);

    // Third square oscillator (330 Hz - E4 octave overtone for stadium clarity)
    const osc3 = ctx.createOscillator();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(330, t);
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.18, t);
    osc3.connect(osc3Gain);
    osc3Gain.connect(masterGain);

    // Initial tactile low thump (85 Hz quick decaying kick)
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(95, t);
    thump.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    thumpGain.gain.setValueAtTime(0.4, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    // Acoustic presence filter (slight mid-boost around 950Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(950, t);
    filter.Q.setValueAtTime(1.8, t);
    filter.gain.setValueAtTime(4.0, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    thump.start(t);

    osc1.stop(t + 0.39);
    osc2.stop(t + 0.39);
    osc3.stop(t + 0.39);
    thump.stop(t + 0.09);

    // Tactile haptic buzz pattern on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([140, 50, 180]);
    }
  } catch {}
}

/**
 * Play celebratory triumphant chime (major triad arpeggio)
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.52);
    });
  } catch {}
}

/**
 * Play warning alarm tone for security violations
 */
export function playWarningBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.32);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }
  } catch {}
}

/**
 * Trigger confetti celebration effect
 */
export function triggerCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
    });
  } catch {}
}
