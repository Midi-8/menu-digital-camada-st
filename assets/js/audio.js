/**
 * Camada Audio Alerts
 * Web Audio API synthesizer for kitchen bell & notifications
 */
const CamadaAudio = (function() {
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Restaurant Service Bell Chime (Ding!)
  function playKitchenBell() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Harmonic bell frequencies
      const frequencies = [880, 1760, 2640];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = idx === 0 ? 0.4 : (idx === 1 ? 0.2 : 0.1);
        gain.gain.setValueAtTime(initialGain, now);
        // Exponential decay for realistic metallic bell chime
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.8);
      });

      // Secondary ping after 0.2s
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const t2 = ctx.currentTime;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1174.66, t2); // Note D6
          gain2.gain.setValueAtTime(0.3, t2);
          gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.4);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(t2);
          osc2.stop(t2 + 1.4);
        } catch (e) {
          console.warn("Audio ping error", e);
        }
      }, 150);

    } catch (e) {
      console.warn("Could not play sound effect:", e);
    }
  }

  // Subtle success chime for customer order confirmed
  function playSuccessTone() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (i * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {
      console.warn("Audio success tone error", e);
    }
  }

  return {
    playKitchenBell,
    playSuccessTone,
    enableSound: function(val) { soundEnabled = !!val; },
    isSoundEnabled: function() { return soundEnabled; },
    initContext: function() { getAudioContext(); }
  };
})();

window.CamadaAudio = CamadaAudio;
