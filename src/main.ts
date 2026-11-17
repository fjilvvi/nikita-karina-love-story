import { chapters, story } from './content/story';
import { mountGame } from './game';
import { chipMusic, soundtrack } from './audio';
import { MiniGames } from './minigames';
import './style.css';
import './challenge.css';
import './polish.css';
import './level-select.css';
import './challenge-polish.css';
import './retrowave.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App mount not found');

app.innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <a href="#top" class="brand" aria-label="На главную"><span class="brand-heart" aria-hidden="true">♥</span><span>НИКИТА<span class="brand-dot">.</span>КАРИНА</span></a>
      <div class="header-right"><span class="edition">ИХ ИСТОРИЯ <span>·</span> 16 БИТ</span><button class="sound-button" id="sound-button" type="button" aria-label="Выключить музыку" aria-pressed="true">♪ ЗВУК ВКЛ</button><a class="header-link" href="#chapters">ГЛАВЫ <span aria-hidden="true">↗</span></a></div>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-line"></span> ОСНОВАНО НА НАСТОЯЩЕЙ ИСТОРИИ</div>
          <div class="chapter-index">01 <span>/</span> 06</div>
          <h1 id="hero-title">Один танец.<br><em>Целая жизнь.</em></h1>
          <p class="hero-lead">Никита и Карина встретились случайно на танцполе в Омске. Пройдите их историю — от первого вечера до свадьбы.</p>
          <div class="hero-actions"><button id="start-button" class="pixel-button" type="button"><span class="button-arrow">▶</span> ИГРАТЬ В ИСТОРИЮ</button><span class="play-hint">6 коротких глав · 3–5 минут</span></div>
          <div class="hero-meta"><span>✦</span> ОСНОВАНО НА ВОСПОМИНАНИЯХ НИКИТЫ <span class="meta-divider">/</span> ОМСК</div>
        </div>
        <div class="game-column" id="game-area">
          <div class="game-frame" id="game-frame"><div class="frame-top"><span class="live-dot"></span> СЕЙЧАС В ИГРЕ <span class="frame-title" id="frame-title">ГЛАВА 01: ТАНЦПОЛ</span><button class="expand-button" id="expand-button" type="button" aria-label="Развернуть игру на весь экран">⛶</button></div><div id="game" class="game-canvas" role="application" aria-label="Пиксельная история Никиты и Карины"><div class="game-loading" id="game-loading"><span>♥</span><strong>ЗАГРУЖАЕМ ОМСК...</strong><small>СОБИРАЕМ ИСТОРИЮ ПО ПИКСЕЛЯМ</small></div></div><div class="game-hud" aria-hidden="true"><div class="hud-panel"><img src="assets/nikita-pixel-portrait.png" alt=""><span><small>НИКИТА · ОМСК</small><strong id="hud-chapter">ТАНЦПОЛ</strong></span></div><div class="hud-energy"><small>ИСТОРИЯ</small><span>♥ ♥ ♥ ♥ ♥</span></div><div class="hud-prompt" id="hud-prompt">E — ПОТАНЦЕВАТЬ</div></div><div class="frame-bottom"><span id="progress-label">✦ ГЛАВА 01 / 06</span><span>НИКИТА + КАРИНА</span><span>16 BIT LOVE STORY</span></div></div>
          <div class="music-station" id="music-station" aria-label="Музыка игры"><div class="station-icon" aria-hidden="true">♫</div><div class="station-copy"><small id="station-status">ORIGINAL SOUNDTRACK / ГОТОВ К ИГРЕ</small><strong id="track-title">01 · Ночь в DOSKI</strong><span id="track-mood">НЕОНОВЫЙ ТАНЦПОЛ · 112 BPM</span></div><div class="station-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><label class="station-volume">ГРОМКОСТЬ<input id="volume-range" type="range" min="0" max="100" value="72" aria-label="Громкость музыки"></label></div>
          <div class="mobile-controls" aria-label="Управление игрой"><button type="button" class="control-button" data-move="-1" aria-label="Идти влево">◀</button><button type="button" class="control-button" data-move="1" aria-label="Идти вправо">▶</button><button type="button" class="control-button action-button" id="interact-button">✦ ДЕЙСТВИЕ</button></div><p class="mobile-hint" id="mobile-hint">${story[0].hint}</p>
          <div class="game-caption"><span class="caption-star">✳</span><span>СТРЕЛКИ ИЛИ A/D — ИДТИ · E ИЛИ ПРОБЕЛ — ДЕЙСТВИЕ</span><div class="portrait-hud"><span class="portrait-badge"><img src="assets/nikita-pixel-portrait.png" alt="Пиксельный портрет Никиты"><small>НИКИТА</small></span><span class="hud-heart">♥</span><span class="portrait-badge"><img src="assets/karina-pixel-portrait.png" alt="Пиксельный портрет Карины"><small>КАРИНА</small></span></div></div>
        </div>
      </section>

      <section class="story-strip" aria-label="Этапы истории"><span>ДОСКИ</span><span class="strip-symbol">✦</span><span>ЦВЕТЫ У ТЮЗА</span><span class="strip-symbol">✦</span><span>ПЕРВОЕ СООБЩЕНИЕ</span><span class="strip-symbol">✦</span><span>ВОЗВРАЩЕНИЕ В ОМСК</span><span class="strip-symbol">✦</span><span>НАВСЕГДА</span></section>

      <section class="cast" aria-labelledby="cast-title"><div class="cast-heading"><p class="section-kicker">ГЕРОИ НАСТОЯЩЕЙ ИСТОРИИ</p><h2 id="cast-title">Теперь вы их <em>узнаете.</em></h2></div><div class="cast-grid"><article class="cast-card"><div class="cast-portrait"><img src="assets/nikita-pixel-portrait.png" alt="Пиксельный портрет Никиты по фотографии"></div><div class="cast-copy"><span>ИГРОК 01</span><h3>Никита</h3><p>Он танцевал с закрытыми глазами и не заметил, как друзья ушли с танцпола.</p></div></article><article class="cast-card cast-card-karina"><div class="cast-portrait"><img src="assets/karina-pixel-portrait.png" alt="Пиксельный портрет Карины по фотографии"></div><div class="cast-copy"><span>ИГРОК 02</span><h3>Карина</h3><p>Она увидела Никиту рядом со своей компанией и позвала его танцевать.</p></div></article></div></section>

      <section class="chapters" id="chapters" aria-labelledby="chapters-title">
        <div class="chapters-heading"><div><p class="section-kicker">ШЕСТЬ МОМЕНТОВ ОДНОЙ ИСТОРИИ</p><h2 id="chapters-title">От танца<br><em>до навсегда.</em></h2></div><p class="section-note">Выберите главу или пройдите всю историю по порядку.<br>Каждая сцена открывает настоящий кадр из жизни Никиты и Карины.</p></div>
        <div class="chapter-grid">${chapters.map((chapter, index) => `<button class="chapter-card ${index === 0 ? 'current' : ''}" type="button" data-chapter="${index}"><span class="card-top"><span>ГЛАВА ${chapter.number}</span><span>✦</span></span><span class="card-number">${chapter.number}</span><span class="card-bottom"><strong>${chapter.title}</strong><small>${chapter.subtitle}</small><span class="card-track">♫ ${soundtrack[index].title} · ${soundtrack[index].bpm} BPM</span></span></button>`).join('')}</div>
      </section>

      <section class="archive" id="archive" aria-labelledby="archive-title">
        <div class="archive-heading"><p class="section-kicker">НЕ ТОЛЬКО ПИКСЕЛИ</p><h2 id="archive-title">Настоящие <em>воспоминания.</em></h2><p>Кадры из первого дня и встречи после возвращения в Омск.</p></div>
        <div class="archive-grid"><figure><img src="assets/first-day.jpg" alt="Никита и Карина в день знакомства" loading="lazy"><figcaption>01 / ПЕРВЫЙ ДЕНЬ</figcaption></figure><figure><img src="assets/first-walk.jpeg" alt="Никита и Карина во время первой прогулки" loading="lazy"><figcaption>02 / ПЕРВАЯ ПРОГУЛКА</figcaption></figure><figure><video src="assets/reunion.mp4" controls playsinline preload="metadata" aria-label="Встреча после возвращения в Омск"></video><figcaption>03 / СНОВА В ОМСКЕ</figcaption></figure></div>
      </section>
    </main>

    <footer class="footer"><span>♥ НИКИТА + КАРИНА</span><span>НАСТОЯЩАЯ ИСТОРИЯ. ПИКСЕЛЬНОЕ ПРИКЛЮЧЕНИЕ.</span><a href="#top">НАВЕРХ ↑</a></footer>
  </div>

  <div class="challenge-modal" id="challenge-modal" hidden></div>
  <div class="memory-modal" id="memory-modal" hidden><div class="completion-backdrop"></div><div class="memory-card" role="dialog" aria-modal="true" aria-labelledby="memory-title"><div class="memory-visual" id="memory-visual"></div><div class="memory-copy"><div class="memory-portraits"><img src="assets/nikita-pixel-portrait.png" alt="Пиксельный портрет Никиты"><span>♥</span><img src="assets/karina-pixel-portrait.png" alt="Пиксельный портрет Карины"></div><p class="section-kicker" id="memory-kicker">ВОСПОМИНАНИЕ 01 / 05</p><h2 id="memory-title"></h2><p id="memory-text"></p><button class="pixel-button" id="memory-next" type="button">ПРОДОЛЖИТЬ →</button></div></div></div>
  <div class="completion-modal" id="completion-modal" hidden><div class="completion-backdrop"></div><div class="completion-card" role="dialog" aria-modal="true" aria-labelledby="completion-title"><div class="completion-spark">♥</div><p class="section-kicker">ФИНАЛ ИСТОРИИ</p><h2 id="completion-title">Никита + Карина</h2><p>Один случайный танец в Омске привёл их друг к другу. Со временем они стали семьёй и сыграли свадьбу. Самое прекрасное продолжение происходит уже в жизни.</p><div class="ending-photo"><img src="assets/first-day.jpg" alt="Никита и Карина в день знакомства"></div><button class="pixel-button" id="replay-button" type="button">↻ ПРОЙТИ СНАЧАЛА</button><button class="text-button" id="close-modal" type="button">ПОСМОТРЕТЬ ВОСПОМИНАНИЯ</button></div></div>
`;

const gameMount = document.querySelector<HTMLElement>('#game');
if (!gameMount) throw new Error('Game mount not found');
mountGame(gameMount);

const startButton = document.querySelector<HTMLButtonElement>('#start-button');
const gameArea = document.querySelector<HTMLElement>('#game-area');
const memoryModal = document.querySelector<HTMLElement>('#memory-modal');
const completionModal = document.querySelector<HTMLElement>('#completion-modal');
const progressLabel = document.querySelector<HTMLElement>('#progress-label');
const frameTitle = document.querySelector<HTMLElement>('#frame-title');
const hudChapter = document.querySelector<HTMLElement>('#hud-chapter');
const hudPrompt = document.querySelector<HTMLElement>('#hud-prompt');
const memoryVisual = document.querySelector<HTMLElement>('#memory-visual');
const challengeRoot = document.querySelector<HTMLElement>('#challenge-modal');
const miniGames = challengeRoot ? new MiniGames(challengeRoot) : null;
let started = false;
const siteShell = document.querySelector<HTMLElement>('.site-shell');
const station = document.querySelector<HTMLElement>('#music-station');
const soundButton = document.querySelector<HTMLButtonElement>('#sound-button');
const volumeRange = document.querySelector<HTMLInputElement>('#volume-range');

function updateSoundUI(): void {
  const enabled = chipMusic.isEnabled;
  if (soundButton) {
    soundButton.textContent = enabled ? '♪ ЗВУК ВКЛ' : '♪ ЗВУК ВЫКЛ';
    soundButton.setAttribute('aria-label', enabled ? 'Выключить музыку' : 'Включить музыку');
    soundButton.setAttribute('aria-pressed', String(enabled));
  }
  if (station) {
    station.dataset.muted = String(!enabled);
    station.dataset.playing = String(chipMusic.isPlaying);
  }
  const stationStatus = document.querySelector<HTMLElement>('#station-status');
  if (stationStatus) stationStatus.textContent = !enabled ? 'ORIGINAL SOUNDTRACK / ЗВУК ВЫКЛЮЧЕН' : chipMusic.isPlaying ? 'ORIGINAL SOUNDTRACK / СЕЙЧАС ИГРАЕТ' : 'ORIGINAL SOUNDTRACK / ГОТОВ К ИГРЕ';
}
if (volumeRange) volumeRange.value = String(Math.round(chipMusic.currentVolume * 100));
volumeRange?.addEventListener('input', () => chipMusic.setVolume(Number(volumeRange.value) / 100));
updateSoundUI();
function updateVideoDucking(): void {
  const playing = [...document.querySelectorAll<HTMLVideoElement>('video')].some(video => !video.paused && !video.muted);
  chipMusic.setVideoDucked(playing);
}
document.addEventListener('play', updateVideoDucking, true);
document.addEventListener('pause', updateVideoDucking, true);
document.addEventListener('ended', updateVideoDucking, true);

function scrollToGame(): void { gameArea?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function startGame(): void {
  miniGames?.close();
  chipMusic.start();
  updateSoundUI();
  if (started) window.dispatchEvent(new CustomEvent('game:jump', { detail: 0 }));
  else { started = true; window.dispatchEvent(new Event('game:start')); }
  if (startButton) startButton.innerHTML = '<span class="button-arrow">↻</span> ИГРАТЬ СНАЧАЛА';
  if (completionModal) completionModal.hidden = true;
  scrollToGame();
}
startButton?.addEventListener('click', startGame);

document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((button) => {
  button.addEventListener('click', () => {
    miniGames?.close();
    chipMusic.start();
    updateSoundUI();
    started = true;
    if (startButton) startButton.innerHTML = '<span class="button-arrow">↻</span> ИГРАТЬ СНАЧАЛА';
    if (memoryModal) memoryModal.hidden = true;
    if (completionModal) completionModal.hidden = true;
    window.dispatchEvent(new CustomEvent('game:jump', { detail: Number(button.dataset.chapter) }));
    scrollToGame();
  });
});

window.addEventListener('game:challenge', ((event: CustomEvent<number>) => {
  miniGames?.show(event.detail, () => window.dispatchEvent(new Event('game:challenge-complete')));
}) as EventListener);

window.addEventListener('game:stage', ((event: CustomEvent<number>) => {
  const loading = document.querySelector<HTMLElement>('#game-loading');
  if (loading) loading.hidden = true;
  const index = event.detail;
  if (progressLabel) progressLabel.textContent = `✦ ГЛАВА ${String(index + 1).padStart(2, '0')} / 06`;
  if (frameTitle) frameTitle.textContent = `ГЛАВА ${String(index + 1).padStart(2, '0')}: ${chapters[index].title.toUpperCase()}`;
  if (hudChapter) hudChapter.textContent = chapters[index].title.toUpperCase();
  if (hudPrompt) hudPrompt.textContent = ['E — ТАНЦЕВАТЬ', 'E — СОБРАТЬ ЦВЕТЫ', 'E — ПРИСЕСТЬ', 'E — НАПИСАТЬ', 'E — ВСТРЕТИТЬ', '♥ — НАВСЕГДА'][index];
  chipMusic.setStage(index);
  if (siteShell) siteShell.dataset.stage = String(index);
  const track = soundtrack[index];
  const trackTitle = document.querySelector<HTMLElement>('#track-title');
  const trackMood = document.querySelector<HTMLElement>('#track-mood');
  if (trackTitle) trackTitle.textContent = `${String(index + 1).padStart(2, '0')} · ${track.title}`;
  if (trackMood) trackMood.textContent = `${track.mood} · ${track.bpm} BPM`;
  const mobileHint = document.querySelector<HTMLElement>('#mobile-hint');
  if (mobileHint) mobileHint.textContent = index < story.length ? story[index].hint : 'История Никиты и Карины продолжается ♥';
  document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((card) => card.classList.toggle('current', Number(card.dataset.chapter) === index));
}) as EventListener);

window.addEventListener('game:flowers', ((event: CustomEvent<number>) => {
  chipMusic.cue('flower');
  if (hudPrompt) hudPrompt.textContent = event.detail === 3 ? 'E — ОТДАТЬ БУКЕТ И ПАЛЬТО' : `БУКЕТ ${event.detail} / 3 · E — СОБРАТЬ`;
}) as EventListener);

document.querySelector<HTMLButtonElement>('#expand-button')?.addEventListener('click', () => {
  const frame = document.querySelector<HTMLElement>('#game-frame');
  if (!frame) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else frame.requestFullscreen?.();
});

window.addEventListener('game:memory', ((event: CustomEvent<number>) => {
  const index = event.detail;
  const beat = story[index];
  if (!beat || !memoryModal || !memoryVisual) return;
  document.querySelector('#memory-kicker')!.textContent = `ВОСПОМИНАНИЕ ${String(index + 1).padStart(2, '0')} / 05`;
  document.querySelector('#memory-title')!.textContent = beat.cardTitle;
  document.querySelector('#memory-text')!.textContent = beat.cardText;
  document.querySelector('#memory-next')!.textContent = `${beat.nextLabel} →`;
  memoryVisual.replaceChildren();
  if (beat.media) {
    const media = document.createElement(beat.media.type === 'video' ? 'video' : 'img');
    media.setAttribute('src', beat.media.src);
    media.setAttribute(beat.media.type === 'video' ? 'aria-label' : 'alt', beat.media.alt);
    if (media instanceof HTMLVideoElement) { media.controls = true; media.playsInline = true; media.muted = true; media.poster = beat.media.poster ?? ''; }
    memoryVisual.append(media);
  }
  memoryModal.hidden = false;
}) as EventListener);

function closeMemoryAndContinue(): void {
  if (!memoryModal || memoryModal.hidden) return;
  memoryModal.hidden = true;
  memoryVisual?.replaceChildren();
  window.dispatchEvent(new Event('game:continue'));
}
document.querySelector('#memory-next')?.addEventListener('click', closeMemoryAndContinue);
window.addEventListener('game:complete', () => { chipMusic.cue('complete'); if (completionModal) completionModal.hidden = false; });
document.querySelector('#replay-button')?.addEventListener('click', startGame);
document.querySelector('#close-modal')?.addEventListener('click', () => {
  if (completionModal) completionModal.hidden = true;
  document.querySelector('#archive')?.scrollIntoView({ behavior: 'smooth' });
});
document.querySelector('#interact-button')?.addEventListener('click', () => window.dispatchEvent(new Event('game:interact')));
soundButton?.addEventListener('click', () => { chipMusic.toggle(); updateSoundUI(); });
document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => {
  const direction = Number(button.dataset.move);
  const stop = () => window.dispatchEvent(new CustomEvent('game:move', { detail: 0 }));
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); window.dispatchEvent(new CustomEvent('game:move', { detail: direction })); });
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointercancel', stop);
  button.addEventListener('lostpointercapture', stop);
});
