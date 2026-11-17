const motifs = [
  [392, 494, 587, 494, 440, 494, 659, 587],
  [330, 392, 494, 392, 294, 392, 523, 440],
  [349, 440, 523, 440, 392, 440, 587, 523],
  [392, 523, 587, 523, 440, 523, 659, 587],
  [440, 554, 659, 554, 494, 554, 740, 659],
  [523, 659, 784, 659, 587, 659, 880, 784],
];
const bass = [196, 164.81, 174.61, 196, 220, 261.63];

class ChipMusic {
  private context?: AudioContext;
  private master?: GainNode;
  private timer?: number;
  private step = 0;
  private stage = 0;
  private started = false;
  private enabled = true;

  get isEnabled(): boolean { return this.enabled; }

  setStage(stage: number): void {
    this.stage = Math.min(Math.max(stage, 0), motifs.length - 1);
    this.step = 0;
    if (this.timer) { window.clearInterval(this.timer); this.timer = undefined; this.schedule(); }
  }

  start(): void {
    this.started = true;
    if (!this.enabled) return;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.context.destination);
    }
    void this.context.resume();
    this.schedule();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      if (this.timer) window.clearInterval(this.timer);
      this.timer = undefined;
      void this.context?.suspend();
    } else if (this.started) this.start();
    return this.enabled;
  }

  private schedule(): void {
    if (!this.context || this.timer || !this.enabled) return;
    const interval = this.stage === 0 ? 230 : this.stage === 5 ? 310 : 285;
    this.timer = window.setInterval(() => this.tick(), interval);
    this.tick();
  }

  private tick(): void {
    const motif = motifs[this.stage];
    const note = motif[this.step % motif.length];
    if (this.step % 2 === 0) this.playNote(note, 0.22, 'square', 0.09);
    if (this.step % 4 === 0) this.playNote(bass[this.stage], 0.35, 'triangle', 0.12);
    this.step++;
  }

  private playNote(frequency: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}

export const chipMusic = new ChipMusic();
