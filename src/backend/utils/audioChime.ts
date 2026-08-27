// src/utils/audioChime.ts

export const playAcademicAlarmChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Chrome Auto-play Policy Resume
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Tone 1: High Pitch Academic Bell (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.4, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Tone 2: Harmonic Chime (B5 - 987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.18);
    gain2.gain.setValueAtTime(0.5, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Tone 3: Victory Resonance (E6 - 1318.5 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.36);
    gain3.gain.setValueAtTime(0.3, ctx.currentTime + 0.36);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 1.2);

    osc3.start(ctx.currentTime + 0.36);
    osc3.stop(ctx.currentTime + 1.5);
  } catch (err) {
    console.error('Audio Context Error:', err);
  }
};