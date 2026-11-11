/**
 * Synthesizes a crisp, elegant two-tone notification chime ("Ding-Dong")
 * using standard HTML5 Web Audio API. Zero external audio file dependency.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!sharedAudioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return null;
      sharedAudioCtx = new AudioContextClass();

      // Listener interaksi pertama untuk membuka blokir autoplay browser
      const unlockAudio = () => {
        if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
          sharedAudioCtx.resume().catch(() => {});
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };

      window.addEventListener("click", unlockAudio);
      window.addEventListener("keydown", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    return sharedAudioCtx;
  } catch (err) {
    console.warn("[AUDIO_INIT_WARN]", err);
    return null;
  }
}

export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Nada pertama: D5 (587.33Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Nada kedua: A5 (880Hz) - lebih tinggi & riang
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("[AUDIO_CHIME_WARN]", err);
  }
}
