import { chipMusic } from './audio';

type Done = () => void;

const directions = ['←', '→', '↑', '←'];
const stageNames = ['ТАНЕЦ', 'ПАЛЬТО', 'КИФАЗ', 'СООБЩЕНИЕ', 'ВСТРЕЧА'];

export class MiniGames {
  private root: HTMLElement;
  private done: Done = () => {};
  private raf = 0;
  private active = false;
  private runId = 0;
  private keyHandler = (event: KeyboardEvent): void => {
    if (!this.active) return;
    const key = event.key;
    if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(key)) event.preventDefault();
    if (key === ' ' || key === 'Enter' || key.toLowerCase() === 'e') this.root.querySelector<HTMLButtonElement>('[data-action="hit"]')?.click();
    if (key.startsWith('Arrow')) this.root.querySelector<HTMLButtonElement>(`[data-dir="${key.slice(5).toLowerCase()}"]`)?.click();
  };

  constructor(root: HTMLElement) { this.root = root; }

  show(stage: number, done: Done): void {
    this.close();
    this.active = true;
    this.done = done;
    this.root.hidden = false;
    this.root.innerHTML = `<div class="challenge-shade"></div><section class="challenge-card" role="dialog" aria-modal="true" aria-label="Мини-игра"><header class="challenge-head"><span>✦ ОМСК / ${stageNames[stage]}</span><div class="challenge-head-portraits"><img src="assets/nikita-pixel-portrait.png" alt=""><span>♥</span><img src="assets/karina-pixel-portrait.png" alt=""></div><button class="challenge-close" type="button" aria-label="Закрыть мини-игру">×</button></header><div class="challenge-body" id="challenge-body"></div></section>`;
    this.root.querySelector('.challenge-close')?.addEventListener('click', () => { this.close(); window.dispatchEvent(new Event('game:challenge-cancel')); });
    window.addEventListener('keydown', this.keyHandler);
    if (stage === 0) this.rhythm();
    if (stage === 1) this.coat();
    if (stage === 2) this.tray();
    if (stage === 3) this.message();
    if (stage === 4) this.reunion();
  }

  close(): void {
    this.runId++;
    cancelAnimationFrame(this.raf);
    this.active = false;
    window.removeEventListener('keydown', this.keyHandler);
    this.root.hidden = true;
    this.root.replaceChildren();
  }

  private finish(): void { const done = this.done; this.close(); done(); }
  private later(delay: number, callback: () => void): void {
    const run = this.runId;
    setTimeout(() => { if (this.active && this.runId === run) callback(); }, delay);
  }
  private body(): HTMLElement { return this.root.querySelector<HTMLElement>('#challenge-body')!; }
  private feedback(text: string, good = true): void {
    const el = this.root.querySelector<HTMLElement>('.challenge-feedback');
    if (el) { el.textContent = text; el.dataset.good = String(good); }
  }

  private rhythm(): void {
    let hits = 0;
    const body = this.body();
    body.innerHTML = `<div class="challenge-layout"><div class="challenge-copy"><p class="challenge-kicker">УРОВЕНЬ 01 · DOSKI</p><h2>Попади<br><em>в этот ритм.</em></h2><p>Никита танцует с закрытыми глазами. Жми в тот момент, когда светящийся квадрат проходит через сердце. Четыре удара — и Карина заметит его.</p><div class="beat-track"><span class="beat-target">♥</span><span class="beat-cursor" id="beat-cursor"></span></div><div class="challenge-score" id="beat-score">РИТМ 0 / 4</div><div class="challenge-feedback" aria-live="polite">Жми пробел, E или кнопку</div><button class="challenge-primary" data-action="hit" type="button">✦ ПОПАСТЬ В ТАКТ</button></div><div class="challenge-video"><video src="assets/first-day.mp4" poster="assets/first-day-poster.png" autoplay loop muted playsinline controls aria-label="Видео первого вечера в DOSKI"></video><span>НАСТОЯЩИЙ КАДР · ПЕРВЫЙ ВЕЧЕР</span></div></div>`;
    const cursor = this.root.querySelector<HTMLElement>('#beat-cursor')!;
    let position = 0;
    const animate = () => {
      if (!this.active || !cursor.isConnected) return;
      position = (Math.sin(chipMusic.getBeatPhase() * Math.PI * 2) + 1) / 2;
      cursor.style.left = `${position * 100}%`;
      this.raf = requestAnimationFrame(animate);
    };
    this.raf = requestAnimationFrame(animate);
    body.querySelector('[data-action="hit"]')?.addEventListener('click', () => {
      if (hits >= 4) return;
      if (Math.abs(position - .5) < .16) {
        chipMusic.cue('hit');
        hits++;
        this.feedback(hits === 4 ? 'Идеально! Теперь повтори движение.' : 'В ТОЧКУ! ♥');
        body.querySelector('#beat-score')!.textContent = `РИТМ ${hits} / 4`;
        if (hits === 4) { cancelAnimationFrame(this.raf); this.later(600, () => this.dance()); }
      } else { chipMusic.cue('miss'); this.feedback('Чуть раньше или позже — попробуй снова', false); }
    });
  }

  private dance(): void {
    let step = 0;
    const body = this.body();
    body.innerHTML = `<div class="challenge-layout"><div class="challenge-copy"><p class="challenge-kicker">УРОВЕНЬ 01 · ВТОРОЙ ТАНЕЦ</p><h2>Повтори<br><em>движение.</em></h2><p>Смотри кадр первого вечера и повтори короткую игровую связку. Последовательность можно подсматривать — главное двигаться вместе.</p><div class="dance-sequence">${directions.map((d, i) => `<span data-step="${i}">${d}</span>`).join('')}</div><div class="challenge-feedback" aria-live="polite">Нажимай стрелки или кнопки ниже</div><div class="dance-buttons"><button data-dir="left" type="button">←</button><button data-dir="up" type="button">↑</button><button data-dir="right" type="button">→</button></div></div><div class="challenge-video"><video src="assets/first-day.mp4" poster="assets/first-day-poster.png" autoplay loop muted playsinline controls aria-label="Видео первого вечера в DOSKI"></video><span>НАСТОЯЩИЙ КАДР · ПЕРВЫЙ ВЕЧЕР</span></div></div>`;
    body.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.dir === 'left' ? '←' : button.dataset.dir === 'right' ? '→' : '↑';
      if (value !== directions[step]) { chipMusic.cue('miss'); step = 0; body.querySelectorAll('[data-step]').forEach(el => el.classList.remove('done')); this.feedback('Давай ещё раз, с первого движения', false); return; }
      chipMusic.cue('hit');
      body.querySelector(`[data-step="${step}"]`)?.classList.add('done');
      step++;
      this.feedback(step === 4 ? 'Карина зовёт танцевать вместе ♥' : 'Отлично, дальше!');
      if (step === 4) this.later(750, () => this.finish());
    }));
  }

  private coat(): void {
    let position = 0;
    let won = false;
    const body = this.body();
    body.innerHTML = `<div class="challenge-centered"><p class="challenge-kicker">УРОВЕНЬ 02 · У ТЮЗА</p><h2>Тёплый <em>жест.</em></h2><p>Букет уже у Карины. Поймай момент, чтобы накинуть пальто ей на плечи.</p><div class="coat-scene"><img class="coat-character" src="assets/nikita-full.webp" alt=""><img class="coat-character karina" src="assets/karina-full.webp" alt=""><span class="coat-moving" id="coat-moving">🧥</span><span class="coat-target">♥</span></div><div class="challenge-feedback" aria-live="polite">Поймай пальто рядом с сердцем</div><button class="challenge-primary" data-action="hit" type="button">✦ ОТДАТЬ ПАЛЬТО</button></div>`;
    const moving = body.querySelector<HTMLElement>('#coat-moving')!;
    const start = performance.now();
    const animate = (now: number) => { if (!this.active || !moving.isConnected) return; position = (Math.sin((now - start) * Math.PI / 1000 - Math.PI / 2) + 1) / 2; moving.style.left = `${position * 80 + 10}%`; this.raf = requestAnimationFrame(animate); };
    this.raf = requestAnimationFrame(animate);
    body.querySelector('[data-action="hit"]')?.addEventListener('click', () => {
      if (won) return;
      if (position > .72) { won = true; chipMusic.cue('heart'); this.feedback('Согрелась ♥'); this.later(650, () => this.finish()); }
      else { chipMusic.cue('miss'); this.feedback('Чуть ближе к Карине', false); }
    });
  }

  private tray(): void {
    let count = 0;
    let locked = true;
    const body = this.body();
    body.innerHTML = `<div class="challenge-centered"><p class="challenge-kicker">УРОВЕНЬ 03 · КИФАЗ НА ТРАНСПОРТНОЙ</p><h2>Первый <em>разговор.</em></h2><p>Запомни три игровых символа вечера, а когда они исчезнут — повтори порядок. Это не точный заказ Никиты и Карины.</p><div class="tray-slots"><span id="tray-one">?</span><span id="tray-two">?</span><span id="tray-three">?</span></div><div class="tray-options"><button data-item="♥" type="button">♥<small>РАЗГОВОР</small></button><button data-item="🍟" type="button">🍟<small>ПЕРЕКУС</small></button><button data-item="🥤" type="button">🥤<small>НАПИТОК</small></button></div><div class="challenge-feedback" aria-live="polite">Запомни порядок...</div></div>`;
    const expected = ['🥤', '🍟', '♥'];
    const slots = ['one', 'two', 'three'].map(name => body.querySelector<HTMLElement>(`#tray-${name}`)!);
    const showPattern = (): void => {
      locked = true;
      slots.forEach((slot, index) => { slot.textContent = expected[index]; slot.classList.add('preview'); });
      this.feedback('Запомни порядок...');
      setTimeout(() => {
        if (!body.isConnected) return;
        slots.forEach(slot => { slot.textContent = '?'; slot.classList.remove('preview'); });
        locked = false;
        this.feedback('Теперь повтори его по памяти');
      }, 2400);
    };
    showPattern();
    body.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(button => button.addEventListener('click', () => {
      if (locked) return;
      if (button.dataset.item !== expected[count]) {
        chipMusic.cue('miss');
        count = 0;
        body.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(item => item.disabled = false);
        this.feedback('Попробуй ещё раз — подсказка вернётся', false);
        setTimeout(() => { if (body.isConnected) showPattern(); }, 400);
        locked = true;
        return;
      }
      slots[count].textContent = expected[count];
      chipMusic.cue('hit');
      button.disabled = true;
      count++;
      this.feedback(count === 3 ? 'Вечер хочется продолжать ♥' : 'Хорошо, что дальше?');
      if (count === 3) this.later(850, () => this.finish());
    }));
  }

  private message(): void {
    const body = this.body();
    let selected: string[] = [];
    body.innerHTML = `<div class="challenge-centered"><p class="challenge-kicker">УРОВЕНЬ 04 · УТРО В ОМСКЕ</p><h2>Напиши <em>ей.</em></h2><p>Собери первое сообщение из двух фраз, о которых рассказал Никита.</p><div class="phone-message"><span>КАРИНА</span><div id="message-preview">Выбери две фразы…</div></div><div class="message-options"><button data-phrase="Как дела?" type="button">Как дела?</button><button data-phrase="Проснулись?" type="button">Проснулись?</button><button data-phrase="Пойдём в парк?" type="button">Пойдём в парк?</button></div><div class="challenge-feedback" aria-live="polite">Выбери подходящие слова</div><button class="challenge-primary" data-action="send" type="button">↗ ОТПРАВИТЬ</button></div>`;
    body.querySelectorAll<HTMLButtonElement>('[data-phrase]').forEach(button => button.addEventListener('click', () => {
      const phrase = button.dataset.phrase!;
      if (selected.includes(phrase)) selected = selected.filter(item => item !== phrase);
      else if (selected.length < 2) selected.push(phrase);
      body.querySelector('#message-preview')!.textContent = selected.length ? selected.join(' ') : 'Выбери две фразы…';
      body.querySelectorAll<HTMLButtonElement>('[data-phrase]').forEach(item => item.classList.toggle('selected', selected.includes(item.dataset.phrase!)));
    }));
    body.querySelector('[data-action="send"]')?.addEventListener('click', () => {
      if (selected.includes('Как дела?') && selected.includes('Проснулись?')) { chipMusic.cue('send'); this.feedback('Карина уже собирается в парк ♥'); this.later(900, () => this.finish()); }
      else { chipMusic.cue('miss'); this.feedback('Никита спросил, как дела и проснулись ли они', false); }
    });
  }

  private reunion(): void {
    let step = 0;
    const expected = ['ТАНЕЦ', 'ЦВЕТЫ', 'СООБЩЕНИЕ'];
    const body = this.body();
    body.innerHTML = `<div class="challenge-centered"><p class="challenge-kicker">УРОВЕНЬ 05 · СНОВА В ОМСКЕ</p><h2>Всё привело <em>сюда.</em></h2><p>Перед встречей в аэропорту вспомни, с чего началась эта история. Расставь три момента по порядку.</p><div class="reunion-timeline"><span id="moment-0">01 ?</span><span id="moment-1">02 ?</span><span id="moment-2">03 ?</span></div><div class="message-options"><button data-moment="ЦВЕТЫ" type="button">✿ ЦВЕТЫ</button><button data-moment="СООБЩЕНИЕ" type="button">✉ СООБЩЕНИЕ</button><button data-moment="ТАНЕЦ" type="button">♫ ТАНЕЦ</button></div><div class="challenge-feedback" aria-live="polite">Как всё начиналось?</div></div>`;
    body.querySelectorAll<HTMLButtonElement>('[data-moment]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.moment !== expected[step]) { chipMusic.cue('miss'); this.feedback('Вспомни самый первый вечер', false); return; }
      chipMusic.cue('hit');
      body.querySelector(`#moment-${step}`)!.textContent = `${String(step + 1).padStart(2,'0')} ${expected[step]}`;
      button.disabled = true;
      step++;
      this.feedback(step === 3 ? 'И вот они снова вместе в Омске ♥' : 'Да! Что было дальше?');
      if (step === 3) this.later(900, () => this.finish());
    }));
  }
}
