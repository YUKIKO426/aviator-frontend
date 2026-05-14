// Sound Manager — Web Audio API based, no files needed
// All sounds generated programmatically

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private volume = 0.5;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setEnabled(v: boolean) { this.enabled = v; }
  setVolume(v: number)   { this.volume = Math.max(0, Math.min(1, v)); }
  isEnabled()            { return this.enabled; }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 1, delay = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(this.volume * vol, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {}
  }

  // Bet placed — short click sound
  betPlaced() {
    this.playTone(440, 0.08, 'square', 0.3);
    this.playTone(660, 0.08, 'square', 0.3, 0.08);
  }

  // Cashout success — happy ascending chime
  cashOut() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      this.playTone(freq, 0.15, 'sine', 0.6, i * 0.08);
    });
  }

  // Crash / flew away — descending sad tone
  crash() {
    this.playTone(440, 0.1, 'sawtooth', 0.4);
    this.playTone(330, 0.15, 'sawtooth', 0.4, 0.1);
    this.playTone(220, 0.3, 'sawtooth', 0.3, 0.25);
  }

  // Big win — triumphant fanfare
  bigWin() {
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      this.playTone(freq, 0.2, 'sine', 0.7, i * 0.1);
    });
    setTimeout(() => {
      [784, 1047, 1319].forEach((freq, i) => {
        this.playTone(freq, 0.3, 'sine', 0.5, i * 0.12);
      });
    }, 700);
  }

  // Bet phase countdown tick
  tick() {
    this.playTone(880, 0.05, 'square', 0.15);
  }

  // Last 1 second tick — louder
  finalTick() {
    this.playTone(1100, 0.06, 'square', 0.3);
  }

  // Multiplier rising — subtle ambient hum (called periodically)
  riseTone(multiplier: number) {
    if (!this.enabled) return;
    const freq = 200 + (multiplier * 15);
    this.playTone(Math.min(freq, 800), 0.05, 'sine', 0.05);
  }

  // Deposit confirmed
  depositConfirmed() {
    [440, 550, 660].forEach((f, i) => this.playTone(f, 0.12, 'sine', 0.5, i * 0.06));
  }

  // Error / reject
  error() {
    this.playTone(200, 0.2, 'sawtooth', 0.4);
    this.playTone(150, 0.3, 'sawtooth', 0.3, 0.2);
  }
}

export const sounds = new SoundManager();
export default sounds;
