// Original score synthesized in the browser; no samples or network requests.
type Track = { title: string; mood: string; bpm: number; root: number; chords: number[][]; lead: number[]; wave: OscillatorType; drums: number };
export const soundtrack: Track[] = [
  { title: 'Ночь в DOSKI', mood: 'НЕОНОВЫЙ ТАНЦПОЛ', bpm: 112, root: 57, chords: [[0,3,7,10],[5,8,12,15],[3,7,10,14],[7,10,14,17]], lead: [12,15,19,15,12,10,7,-1,12,15,19,22,19,15,12,-1], wave: 'sawtooth', drums: 1 },
  { title: 'Цветы у ТЮЗа', mood: 'НОЧНОЙ ОМСК', bpm: 82, root: 62, chords: [[0,3,7,10],[8,12,15,19],[5,8,12,15],[7,10,14,17]], lead: [12,-1,15,-1,14,12,-1,10,12,-1,15,19,17,-1,15,-1], wave: 'triangle', drums: .35 },
  { title: 'До утра', mood: 'РАЗГОВОР В КИФАЗЕ', bpm: 94, root: 60, chords: [[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]], lead: [16,14,12,-1,11,12,14,-1,16,19,16,14,12,-1,9,-1], wave: 'triangle', drums: .48 },
  { title: 'Проснулись?', mood: 'УТРО В ОМСКЕ', bpm: 88, root: 60, chords: [[0,4,7,11],[7,11,14,17],[9,12,16,19],[5,9,12,16]], lead: [12,16,19,-1,16,14,12,-1,11,12,16,-1,19,16,14,-1], wave: 'square', drums: .55 },
  { title: 'Снова в Омске', mood: 'ВОЗВРАЩЕНИЕ', bpm: 104, root: 62, chords: [[0,4,7,11],[7,11,14,17],[9,12,16,19],[5,9,12,16]], lead: [12,16,19,23,19,16,14,-1,12,14,16,19,21,19,16,-1], wave: 'sawtooth', drums: .84 },
  { title: 'Навсегда', mood: 'ИХ ИСТОРИЯ ПРОДОЛЖАЕТСЯ', bpm: 76, root: 65, chords: [[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]], lead: [12,-1,16,19,24,-1,19,16,14,-1,12,9,12,-1,16,-1], wave: 'sine', drums: .2 },
];
const hz = (note: number): number => 440 * 2 ** ((note - 69) / 12);
const clamp = (n: number): number => Math.min(1, Math.max(0, n));
const storedVolume = Number(localStorage.getItem('love-story-volume') ?? '.72');

class ProceduralScore {
  private ctx?: AudioContext;
  private master?: GainNode;
  private delay?: DelayNode;
  private noise?: AudioBuffer;
  private bus?: GainNode;
  private timer?: number;
  private stage = 0;
  private step = 0;
  private nextTime = 0;
  private beatZero = 0;
  private started = false;
  private enabled = localStorage.getItem('love-story-sound') !== 'off';
  private volume = Number.isFinite(storedVolume) ? clamp(storedVolume) : .72;
  private ducked = false;
  get isEnabled(): boolean { return this.enabled; }
  get isPlaying(): boolean { return this.started && this.enabled && this.ctx?.state === 'running' && !!this.timer; }
  get currentVolume(): number { return this.volume; }
  get currentTrack(): Track { return soundtrack[this.stage]; }
  get beatDurationMs(): number { return 60000 / this.currentTrack.bpm; }
  getBeatPhase(beats = 1): number {
    const elapsed = this.ctx && this.started && this.enabled ? (this.ctx.currentTime - this.beatZero) * 1000 : performance.now();
    return ((elapsed / (this.beatDurationMs * beats)) % 1 + 1) % 1;
  }
  start(): void {
    this.started = true;
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    // Schedule a source within the click gesture: Safari may not unlock audio
    // if the first oscillator is created only after resume() resolves.
    if (!this.timer) this.activate();
    this.setMasterLevel();
    if (this.ctx!.state !== 'running') void this.ctx!.resume().then(() => this.notifyState()).catch(() => this.notifyState());
    this.notifyState();
  }
  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('love-story-sound', this.enabled ? 'on' : 'off');
    if (this.enabled) this.start();
    else { if (this.timer) clearInterval(this.timer); this.timer = undefined; this.setMasterLevel(); }
    return this.enabled;
  }
  setVolume(value: number): void { this.volume = clamp(value); localStorage.setItem('love-story-volume', String(this.volume)); this.setMasterLevel(); }
  setVideoDucked(value: boolean): void { this.ducked = value; this.setMasterLevel(); }
  setStage(stage: number): void {
    const next = Math.min(Math.max(stage, 0), soundtrack.length - 1);
    if (this.stage === next && this.timer) return;
    this.stage = next;
    if (this.ctx && this.enabled && this.started) this.activate();
  }
  cue(kind: 'hit' | 'miss' | 'heart' | 'flower' | 'send' | 'complete'): void {
    if (!this.enabled || this.ctx?.state !== 'running' || !this.master) return;
    const notes = { hit: [84], miss: [48], heart: [81,88], flower: [76,81], send: [72,79,84], complete: [72,76,79,84] }[kind];
    notes.forEach((note, i) => this.voice(hz(note), this.ctx!.currentTime + i * .085, .19, kind === 'miss' ? 'triangle' : 'sine', .08, this.master!));
  }
  private init(): void {
    const ctx = new AudioContext();
    this.ctx = ctx;
    ctx.onstatechange = () => this.notifyState();
    const master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20; compressor.ratio.value = 3;
    master.connect(compressor).connect(ctx.destination);
    this.master = master;
    const delay = ctx.createDelay(.6), echo = ctx.createGain();
    delay.delayTime.value = .23; echo.gain.value = .13;
    delay.connect(echo).connect(master);
    this.delay = delay;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .3), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 91;
    for (let i = 0; i < data.length; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; data[i] = seed / 2147483648 - 1; }
    this.noise = buffer;
    this.setMasterLevel();
  }
  private setMasterLevel(): void {
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(this.enabled ? this.volume * (this.ducked ? .07 : .4) : 0, this.ctx.currentTime, .06);
  }
  private notifyState(): void { window.dispatchEvent(new Event('audio:state')); }
  private activate(): void {
    const ctx = this.ctx!;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (this.bus) {
      this.bus.gain.cancelScheduledValues(ctx.currentTime);
      this.bus.gain.setTargetAtTime(0, ctx.currentTime, .2);
      const previous = this.bus;
      setTimeout(() => previous.disconnect(), 1800);
    }
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(.0001, ctx.currentTime);
    bus.gain.setTargetAtTime(1, ctx.currentTime, .3);
    bus.connect(this.master!); bus.connect(this.delay!);
    this.bus = bus;
    this.step = 0;
    this.nextTime = ctx.currentTime + .07;
    this.beatZero = this.nextTime;
    this.timer = window.setInterval(() => this.schedule(), 40);
    this.schedule();
  }
  private schedule(): void {
    if (!this.ctx || !this.bus || !this.enabled) return;
    const unit = 60 / this.currentTrack.bpm / 4;
    if (this.nextTime < this.ctx.currentTime - unit) {
      const skipped = Math.ceil((this.ctx.currentTime + .02 - this.nextTime) / unit);
      this.step += skipped;
      this.nextTime += skipped * unit;
    }
    while (this.nextTime < this.ctx.currentTime + .18) {
      this.playStep(this.step, this.nextTime, unit, this.bus);
      this.step++; this.nextTime += unit;
    }
  }
  private playStep(step: number, time: number, unit: number, bus: GainNode): void {
    const track = this.currentTrack, slot = step % 16, bar = Math.floor(step / 16) % 4;
    const root = track.root + track.chords[bar][0];
    if (slot % 4 === 0) { this.voice(hz(root - 24), time, unit * 3, 'triangle', .17, bus); this.kick(time, bus, track.drums); }
    if (slot === 0) track.chords[bar].forEach((note, i) => this.voice(hz(track.root + note), time + i * .013, unit * 14, 'sine', .036, bus, .12));
    const lead = track.lead[slot];
    if (lead >= 0 && (slot % 2 === 0 || track.bpm > 100)) this.voice(hz(track.root + lead), time, unit * (track.bpm > 100 ? 1.5 : 2.5), track.wave, track.bpm > 100 ? .052 : .064, bus);
    if (slot === 4 || slot === 12) this.noiseHit(time, .1, 750, .08 * track.drums, bus);
    if (slot % (track.bpm > 100 ? 2 : 4) === 2) this.noiseHit(time, .04, 5200, .035 * track.drums, bus);
  }
  private voice(freq: number, time: number, duration: number, wave: OscillatorType, level: number, output: AudioNode, attack = .012): void {
    const osc = this.ctx!.createOscillator(), filter = this.ctx!.createBiquadFilter(), gain = this.ctx!.createGain();
    osc.type = wave; osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass'; filter.frequency.value = wave === 'sawtooth' ? 1700 : 4100;
    gain.gain.setValueAtTime(.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + attack);
    gain.gain.setValueAtTime(level, Math.max(time + attack, time + duration - .1));
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    osc.connect(filter).connect(gain).connect(output);
    osc.start(time); osc.stop(time + duration + .02);
  }
  private noiseHit(time: number, duration: number, cutoff: number, level: number, output: AudioNode): void {
    const source = this.ctx!.createBufferSource(), filter = this.ctx!.createBiquadFilter(), gain = this.ctx!.createGain();
    source.buffer = this.noise!;
    filter.type = 'highpass'; filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.connect(filter).connect(gain).connect(output);
    source.start(time); source.stop(time + duration);
  }
  private kick(time: number, output: AudioNode, strength: number): void {
    const osc = this.ctx!.createOscillator(), gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, time);
    osc.frequency.exponentialRampToValueAtTime(47, time + .16);
    gain.gain.setValueAtTime(.36 * strength, time);
    gain.gain.exponentialRampToValueAtTime(.0001, time + .21);
    osc.connect(gain).connect(output);
    osc.start(time); osc.stop(time + .22);
  }
}
export const chipMusic = new ProceduralScore();
