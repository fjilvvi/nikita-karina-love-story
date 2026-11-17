import Phaser from 'phaser';
import { story } from '../content/story';

const W = 960;
const H = 540;
const FLOWERS = [285, 420, 555];

export class StoryScene extends Phaser.Scene {
  private stage = 0;
  private started = false;
  private paused = false;
  private player!: Phaser.GameObjects.Image;
  private karinaSprite?: Phaser.GameObjects.Image;
  private floor = 405;
  private targetX: number | null = null;
  private autoInteract = false;
  private moveDirection = 0;
  private keyLeft = false;
  private keyRight = false;
  private playerBaseY = 0;
  private flowers = new Set<number>();
  private flowerSprites: Phaser.GameObjects.Image[] = [];
  private status!: Phaser.GameObjects.Text;
  private helper!: Phaser.GameObjects.Text;
  private initialVeil?: Phaser.GameObjects.Container;

  constructor() { super('Story'); }

  create(): void {
    this.makeTextures();
    this.drawStage();
    this.showInitialVeil();
    window.addEventListener('game:start', this.start);
    window.addEventListener('game:jump', this.jump as EventListener);
    window.addEventListener('game:continue', this.continueStory);
    window.addEventListener('game:move', this.setMove as EventListener);
    window.addEventListener('game:interact', this.interact);
    window.addEventListener('game:challenge-complete', this.openMemory);
    window.addEventListener('game:challenge-cancel', this.cancelChallenge);
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.started || this.paused || this.stage >= story.length) return;
      this.targetX = Phaser.Math.Clamp(pointer.x, 48, W - 48);
      this.autoInteract = true;
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('game:start', this.start);
      window.removeEventListener('game:jump', this.jump as EventListener);
      window.removeEventListener('game:continue', this.continueStory);
      window.removeEventListener('game:move', this.setMove as EventListener);
      window.removeEventListener('game:interact', this.interact);
      window.removeEventListener('game:challenge-complete', this.openMemory);
      window.removeEventListener('game:challenge-cancel', this.cancelChallenge);
      window.removeEventListener('keydown', this.keyDown);
      window.removeEventListener('keyup', this.keyUp);
    });
  }

  private start = (): void => {
    if (this.stage >= story.length) this.stage = 0;
    this.started = true;
    this.paused = false;
    this.initialVeil?.destroy();
    this.drawStage();
  };

  private jump = (event: CustomEvent<number>): void => {
    this.stage = Phaser.Math.Clamp(event.detail, 0, story.length);
    this.started = true;
    this.paused = false;
    this.initialVeil?.destroy();
    this.drawStage();
    if (this.stage === story.length) this.showEndingAfterScene();
  };

  private continueStory = (): void => {
    this.stage += 1;
    this.paused = false;
    this.drawStage();
    if (this.stage === story.length) this.showEndingAfterScene();
  };

  private showEndingAfterScene(): void {
    this.time.delayedCall(1700, () => {
      if (this.stage === story.length) window.dispatchEvent(new Event('game:complete'));
    });
  }

  private setMove = (event: CustomEvent<number>): void => {
    this.moveDirection = event.detail;
    if (event.detail) this.targetX = null;
  };

  private keyDown = (event: KeyboardEvent): void => {
    if (!this.started || this.paused) return;
    if (['ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keyLeft = true;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keyRight = true;
    if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) this.interact();
  };

  private keyUp = (event: KeyboardEvent): void => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.keyLeft = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.keyRight = false;
  };

  private interact = (): void => {
    if (!this.started || this.paused || this.stage >= story.length) return;
    const x = this.player.x;
    if (this.stage === 0 && Math.abs(x - 690) < 85) {
      this.openChallenge();
      return;
    }
    if (this.stage === 1) {
      const flowerIndex = FLOWERS.findIndex((fx, index) => !this.flowers.has(index) && Math.abs(x - fx) < 48);
      if (flowerIndex >= 0) {
        this.flowers.add(flowerIndex);
        this.flowerSprites[flowerIndex]?.destroy();
        this.popHeart(FLOWERS[flowerIndex], 310);
        this.status.setText(`БУКЕТ  /  ${this.flowers.size} ИЗ 3`);
        window.dispatchEvent(new CustomEvent('game:flowers', { detail: this.flowers.size }));
        if (this.flowers.size === 3) this.helper.setText('Букет готов. Подойди к Карине →');
        return;
      }
      if (this.flowers.size === 3 && Math.abs(x - 790) < 80) {
        this.karinaSprite?.setTexture('karina-coat');
        this.openChallenge();
        return;
      }
    }
    if (this.stage === 2 && Math.abs(x - 590) < 90) { this.openChallenge(); return; }
    if (this.stage === 3 && Math.abs(x - 720) < 95) { this.openChallenge(); return; }
    if (this.stage === 4 && Math.abs(x - 735) < 90) {
      this.paused = true;
      this.tweens.add({ targets: this.player, x: 700, duration: 340, ease: 'Sine.easeInOut' });
      this.popHeart(705, 280);
      this.time.delayedCall(520, this.openChallenge, [], this);
      return;
    }
    this.tweens.add({ targets: this.helper, alpha: 0.2, duration: 90, yoyo: true });
  };

  private openChallenge = (): void => {
    this.paused = true;
    this.moveDirection = 0;
    this.targetX = null;
    window.dispatchEvent(new CustomEvent('game:challenge', { detail: this.stage }));
  };

  private cancelChallenge = (): void => { this.paused = false; };

  private openMemory = (): void => {
    this.paused = true;
    this.moveDirection = 0;
    this.targetX = null;
    window.dispatchEvent(new CustomEvent('game:memory', { detail: this.stage }));
  };

  update(_time: number, delta: number): void {
    if (!this.started || this.paused || this.stage >= story.length) return;
    let direction = (this.keyRight ? 1 : 0) - (this.keyLeft ? 1 : 0);
    if (!direction) direction = this.moveDirection;
    if (!direction && this.targetX !== null) {
      const distance = this.targetX - this.player.x;
      if (Math.abs(distance) > delta * 0.25 + 2) direction = Math.sign(distance);
      else {
        this.player.x = this.targetX;
        this.targetX = null;
        if (this.autoInteract) { this.autoInteract = false; this.interact(); }
      }
    }
    if (direction) {
      this.player.x = Phaser.Math.Clamp(this.player.x + direction * delta * 0.25, 48, W - 48);
      this.player.setFlipX(direction < 0);
      this.player.y = this.playerBaseY + Math.sin(this.time.now * 0.024) * 2;
    } else this.player.y = this.playerBaseY;
  }

  private drawStage(): void {
    this.children.removeAll(true);
    this.targetX = null;
    this.autoInteract = false;
    this.moveDirection = 0;
    this.keyLeft = false;
    this.keyRight = false;
    this.flowers.clear();
    this.flowerSprites = [];
    this.karinaSprite = undefined;
    const g = this.add.graphics();
    if (this.stage === 0) this.drawClub(g);
    else if (this.stage === 1) this.drawWalk(g);
    else if (this.stage === 2) this.drawCafe(g);
    else if (this.stage === 3) this.drawMorning(g);
    else if (this.stage === 4) this.drawArrival(g);
    else this.drawFinal(g);
    if (this.stage < story.length) {
      const outfit = this.stage === 4 ? 'nikita-arrival' : this.stage === 1 ? 'nikita-coat' : 'nikita-pixel';
      const scale = 5.1;
      this.playerBaseY = this.floor - 19 * scale;
      this.player = this.add.image(this.stage === 2 ? 185 : 130, this.playerBaseY, outfit).setScale(scale).setDepth(12);
    }
    const title = this.stage < story.length ? story[this.stage].title : 'Никита + Карина';
    this.add.text(34, 24, `${String(this.stage + 1).padStart(2, '0')} / 06   ${title.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#fff4df', stroke: '#1b1329', strokeThickness: 5,
    }).setDepth(30).setVisible(false);
    this.status = this.add.text(W - 31, 24, this.stage === 1 ? 'БУКЕТ  /  0 ИЗ 3' : 'НИКИТА ♥ КАРИНА', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffd0be', stroke: '#1b1329', strokeThickness: 5,
    }).setOrigin(1, 0).setDepth(30).setVisible(false);
    this.helper = this.add.text(W / 2, 502, this.stage < story.length ? story[this.stage].hint : 'ИСТОРИЯ ПРОДОЛЖАЕТСЯ', {
      fontFamily: 'monospace', fontSize: '14px', color: '#fff0dd', stroke: '#1b1329', strokeThickness: 5,
      align: 'center', wordWrap: { width: 850 },
    }).setOrigin(0.5).setDepth(30).setVisible(false);
    if (this.stage < story.length) window.dispatchEvent(new CustomEvent('game:stage', { detail: this.stage }));
    else window.dispatchEvent(new CustomEvent('game:stage', { detail: 5 }));
  }

  private showInitialVeil(): void {
    const background = this.add.rectangle(0, 0, W, H, 0x100d20, 0.72).setOrigin(0);
    const heart = this.add.text(W / 2, 145, '♥', { fontFamily: 'Georgia', fontSize: '58px', color: '#ff9aa8' }).setOrigin(0.5);
    const title = this.add.text(W / 2, 225, 'ИХ ИСТОРИЯ НАЧНЁТСЯ ЗДЕСЬ', {
      fontFamily: 'Georgia, serif', fontSize: '35px', color: '#fff2dc', stroke: '#241b3b', strokeThickness: 6,
    }).setOrigin(0.5);
    const subtitle = this.add.text(W / 2, 272, 'Омск. Один вечер. Одна случайная встреча.', {
      fontFamily: 'monospace', fontSize: '17px', color: '#ffc6d1', stroke: '#241b3b', strokeThickness: 4,
    }).setOrigin(0.5);
    this.initialVeil = this.add.container(0, 0, [background, heart, title, subtitle]).setDepth(50);
  }

  private makeTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const nikita = (key: string, coat = false, suit = false, beanie = false) => {
      g.clear();
      g.fillStyle(0x2c242d).fillRect(5, 0, 10, 3).fillRect(3, 3, 14, 5);
      if (beanie) g.fillStyle(0x1c1c26).fillRect(3, 0, 14, 7);
      g.fillStyle(0xe9b99b).fillRect(4, 8, 12, 10);
      g.fillStyle(0x382b38).fillRect(5, 11, 2, 2).fillRect(13, 11, 2, 2);
      g.fillStyle(0xc07875).fillRect(8, 15, 4, 1);
      g.fillStyle(coat ? 0xb5815f : suit ? 0x34324a : 0xf1e9db).fillRect(4, 18, 12, 12).fillRect(2, 21, 2, 9).fillRect(16, 21, 2, 9);
      if (coat) g.fillStyle(0x3e3441).fillRect(8, 18, 4, 11);
      else if (suit) g.fillStyle(0xf8e5d4).fillRect(8, 18, 4, 10);
      else {
        g.fillStyle(0x9d766e).fillRect(5, 20, 2, 2).fillRect(12, 21, 2, 2).fillRect(8, 25, 2, 2).fillRect(14, 27, 2, 2);
        g.fillStyle(0x6d645b).fillRect(7, 23, 1, 2).fillRect(11, 27, 1, 2);
      }
      g.fillStyle(0x342d49).fillRect(5, 30, 4, 6).fillRect(11, 30, 4, 6);
      g.fillStyle(0x1c192a).fillRect(4, 36, 5, 2).fillRect(11, 36, 5, 2);
      g.generateTexture(key, 20, 38);
    };
    const karina = (key: string, coat = false, bride = false, red = false) => {
      g.clear();
      g.fillStyle(0xc8a67d).fillRect(4, 0, 12, 5).fillRect(3, 5, 14, 15).fillRect(3, 20, 2, 8).fillRect(15, 20, 2, 8);
      g.fillStyle(0xf0c5a6).fillRect(5, 8, 10, 10);
      g.fillStyle(0x3e2934).fillRect(6, 11, 2, 2).fillRect(12, 11, 2, 2);
      g.fillStyle(0xd68789).fillRect(8, 16, 4, 1);
      g.fillStyle(coat ? 0xcbb8a3 : red ? 0xb82d47 : 0xf6f0e8).fillRect(4, 18, 12, bride ? 17 : 13).fillRect(2, 21, 2, 9).fillRect(16, 21, 2, 9);
      if (coat) g.fillStyle(0xa1887f).fillRect(9, 20, 2, 12);
      if (red) g.fillStyle(0xffdfd7).fillRect(6, 21, 1, 1).fillRect(12, 23, 1, 1).fillRect(8, 28, 1, 1);
      if (bride) g.fillStyle(0xffffff).fillRect(2, 29, 16, 8);
      else g.fillStyle(red ? 0xb82d47 : 0x3c334d).fillRect(5, 31, 4, 6).fillRect(11, 31, 4, 6);
      g.generateTexture(key, 20, 38);
    };
    nikita('nikita-pixel');
    nikita('nikita-coat', true);
    nikita('nikita-arrival', true, false, true);
    nikita('nikita-suit', false, true);
    karina('karina-pixel');
    karina('karina-coat', true);
    karina('karina-bride', false, true);
    karina('karina-red', false, false, true);
    g.clear();
    g.fillStyle(0x557464).fillRect(7, 8, 2, 12);
    g.fillStyle(0xe6869b).fillRect(4, 3, 5, 7).fillRect(9, 3, 5, 7).fillRect(7, 1, 4, 9);
    g.fillStyle(0xffdfaa).fillRect(8, 5, 2, 2);
    g.generateTexture('flower-pixel', 18, 21);
    g.destroy();
  }

  private person(x: number, feet: number, texture: string, scale = 3): Phaser.GameObjects.Image {
    return this.add.image(x, feet - 19 * scale, texture).setScale(scale).setDepth(11);
  }

  private popHeart(x: number, y: number): void {
    const heart = this.add.text(x, y, '♥', { fontFamily: 'Georgia', fontSize: '31px', color: '#ffc1bf' }).setDepth(25);
    this.tweens.add({ targets: heart, y: y - 65, alpha: 0, duration: 730, onComplete: () => heart.destroy() });
  }

  private stars(count = 50): void {
    for (let i = 0; i < count; i++) {
      const star = this.add.rectangle((i * 137 + 59) % W, (i * 67 + 23) % 290, i % 7 ? 2 : 4, i % 7 ? 2 : 4, 0xffe5bd, 0.24 + (i % 5) * 0.12);
      this.tweens.add({ targets: star, alpha: 0.1, duration: 900 + i % 5 * 220, yoyo: true, repeat: -1 });
    }
  }

  private ground(g: Phaser.GameObjects.Graphics, y: number, color = 0x292139): void {
    this.floor = y;
    g.fillStyle(color).fillRect(0, y, W, H - y);
    g.fillStyle(0x62435f).fillRect(0, y, W, 8);
    for (let x = 12; x < W; x += 70) g.fillStyle(0x45364c).fillRect(x, y + 38 + x % 16, 32, 3);
  }

  private label(text: string, x: number, y: number, color = '#fff1dc', size = '25px'): void {
    this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: size, color, stroke: '#24162e', strokeThickness: 5 }).setOrigin(0.5).setDepth(10);
  }

  private floorTiles(g: Phaser.GameObjects.Graphics, top: number, a: number, b: number): void {
    this.floor = top;
    g.fillStyle(a).fillRect(0, top, W, H - top);
    for (let row = 0; row < 5; row++) {
      const y = top + row * (19 + row * 4);
      for (let col = 0; col < 14; col++) {
        const x = col * 77 - (row % 2) * 38;
        g.fillStyle((row + col) % 3 ? b : a, .48).fillRect(x, y, 73, 2);
        g.fillStyle(b, .45).fillRect(x, y, 2, 22 + row * 4);
      }
    }
  }

  private lamp(g: Phaser.GameObjects.Graphics, x: number, y: number, light: number): void {
    g.fillStyle(light, .08).fillCircle(x, y, 70);
    g.fillStyle(light, .14).fillCircle(x, y, 42);
    g.fillStyle(0x292038).fillRect(x - 11, y - 8, 22, 20);
    g.fillStyle(light).fillRect(x - 7, y - 4, 14, 13);
    g.fillStyle(0xfff1d3).fillRect(x - 3, y - 2, 6, 7);
  }

  private sparkle(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
    g.fillStyle(color, .8).fillRect(x - 1, y - 8, 3, 17).fillRect(x - 8, y - 1, 17, 3);
    g.fillStyle(0xffffff, .8).fillRect(x, y, 2, 2);
  }

  private drawClub(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x110f27).fillRect(0, 0, W, H);
    g.fillStyle(0x241c3b).fillRect(0, 62, W, 360);
    // DOSKI's real interior: exposed ceiling, illuminated stars, stage and purple booths.
    for (let x = -20; x < W; x += 126) {
      g.fillStyle(0x111020).fillRect(x, 82, 104, 18);
      g.fillStyle(0x514066).fillRect(x + 7, 96, 91, 3);
      g.fillStyle(0x1b1934).fillRect(x + 44, 98, 6, 30);
      g.fillStyle(0xa77eb2, .5).fillRect(x + 41, 123, 12, 3);
    }
    g.fillStyle(0x665286).fillRect(0, 121, W, 5);
    g.fillStyle(0x120f27).fillRect(23, 169, 367, 216);
    g.fillStyle(0x553b83).fillRect(31, 180, 351, 195);
    g.fillStyle(0x1a1334).fillRect(37, 186, 339, 181);
    for (let row = 0; row < 11; row++) for (let col = 0; col < 22; col++) {
      const c = (row + col) % 5 === 0 ? 0xf6a6df : (row * col) % 3 ? 0xa169ea : 0x63bce9;
      g.fillStyle(c, .8).fillRect(46 + col * 15, 195 + row * 15, 4, 4);
    }
    g.fillStyle(0x3d2c57).fillRect(0, 355, 415, 32);
    for (let x = 30; x < 400; x += 66) { g.fillStyle(0x151228).fillRect(x, 325, 18, 55); g.fillStyle(0xc37dda).fillRect(x + 2, 326, 14, 3); }
    g.fillStyle(0x463354).fillRect(744, 215, 195, 157);
    g.fillStyle(0x9c62d3).fillRect(753, 245, 180, 88);
    g.fillStyle(0xc98dff).fillRect(760, 250, 164, 8);
    g.fillStyle(0x583771).fillRect(753, 333, 180, 32);
    for (let x = 779; x < 930; x += 34) g.fillStyle(0xd4a4f5, .45).fillRect(x, 272, 4, 33);
    g.fillStyle(0x2f203c).fillRect(570, 162, 12, 215);
    g.fillStyle(0x544160).fillRect(579, 175, 4, 190);
    g.fillStyle(0x694874).fillRect(405, 83, 152, 18);
    this.label('DOSKI', 480, 94, '#ffc7e4', '25px');
    for (const x of [180, 514, 841]) {
      g.fillStyle(0xf6d8a4, .12).fillTriangle(x, 135, x - 105, 403, x + 105, 403);
      this.sparkle(g, x, 144, 0xffd8a9);
    }
    for (const x of [280, 627]) {
      g.fillStyle(0xc75df2, .12).fillTriangle(x, 130, x - 150, 412, x + 160, 412);
      this.lamp(g, x, 126, 0xd28eea);
    }
    this.floorTiles(g, 405, 0x241d38, 0x55486e);
    for (let x = 15; x < W; x += 64) { g.fillStyle(x % 3 ? 0x7757b7 : 0xb065ad, .42).fillRect(x, 426 + (x % 4) * 14, 17, 5); }
    // Karina and three friends form the group Nikita accidentally joins.
    [620, 685, 752, 823].forEach((x, i) => {
      const friend = this.person(x, 405, 'karina-pixel', i === 1 ? 4.1 : 3.55);
      if (i !== 1) friend.setTint([0xd6a6bf, 0xffffff, 0xeab7b4, 0xb8aed9][i]);
      if (i === 1) this.karinaSprite = friend;
      this.tweens.add({ targets: friend, y: friend.y - (i % 2 ? 5 : 3), duration: 420 + i * 90, yoyo: true, repeat: -1 });
    });
    this.label('КАРИНА  ♥', 686, 238, '#ffe1d5', '13px');
    this.stars(16);
  }

  private drawWalk(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x18182f).fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) g.fillStyle([0x22223b,0x2c2944,0x38314b,0x49384e,0x624356,0x765160][i]).fillRect(0, 85 + i * 47, W, 50);
    g.fillStyle(0xffdeb3, .14).fillCircle(797, 138, 70);
    g.fillStyle(0xffefd1).fillCircle(797, 138, 27);
    // The Omsk ТЮЗ facade follows the supplied architectural reference.
    g.fillStyle(0x4d4d64).fillRect(43, 214, 726, 180);
    g.fillStyle(0xb7b1ae).fillRect(48, 194, 674, 189);
    g.fillStyle(0xddd0c1).fillRect(54, 200, 665, 8);
    g.fillStyle(0x9f9ca7).fillRect(577, 150, 183, 233);
    g.fillStyle(0xd8d3cd).fillRect(590, 157, 158, 213);
    g.fillStyle(0x68677a).fillRect(288, 244, 244, 134);
    g.fillStyle(0xa2a2ae).fillRect(296, 252, 228, 117);
    for (let x = 306; x < 522; x += 39) { g.fillStyle(0x3e455b).fillRect(x, 259, 30, 105); g.fillStyle(0xe2c39c, .45).fillRect(x + 3, 262, 20, 37); }
    g.fillStyle(0xd9d6d0).fillRect(287, 235, 249, 16);
    g.fillStyle(0x4b4e63).fillRect(76, 270, 126, 78);
    g.fillStyle(0xddd6cb).fillRect(82, 276, 114, 66);
    for (let x = 615; x < 735; x += 43) { g.fillStyle(0x525369).fillRect(x, 212, 29, 43); g.fillStyle(0xffdab4, .6).fillRect(x + 4, 215, 22, 29); }
    this.label('ТЮЗ', 139, 308, '#615265', '27px');
    for (let x = 39; x < W; x += 125) {
      g.fillStyle(0x2e3f45).fillRect(x, 330, 6, 80);
      g.fillStyle(0x3b5c52).fillCircle(x + 3, 325, 32);
      g.fillStyle(0x527862).fillRect(x - 25, 316, 49, 14);
      g.fillStyle(0x6b8b67).fillRect(x - 13, 299, 28, 9);
    }
    for (const x of [125, 715]) {
      g.fillStyle(0x352c3e).fillRect(x, 235, 6, 176);
      this.lamp(g, x + 3, 231, 0xffd6a0);
      g.fillStyle(0xffd6a0, .09).fillTriangle(x + 3, 242, x - 74, 409, x + 80, 409);
    }
    this.floorTiles(g, 409, 0x403949, 0x6e6070);
    g.fillStyle(0xc99b98, .35).fillRect(0, 413, W, 4);
    for (let x = 0; x < W; x += 90) g.fillStyle(0xe6c19e, .18).fillRect(x + 8, 453 + (x % 3) * 9, 40, 2);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0x506953).fillRect(FLOWERS[i] - 33, 388, 66, 22);
      for (let j = 0; j < 7; j++) { g.fillStyle(j % 2 ? 0xe2a1a7 : 0xffd7ad).fillRect(FLOWERS[i] - 28 + j * 8, 380 + j % 3 * 4, 5, 5); }
      this.flowerSprites.push(this.add.image(FLOWERS[i], 375, 'flower-pixel').setScale(3).setDepth(11));
      this.tweens.add({ targets: this.flowerSprites[i], y: 370, duration: 650 + i * 120, yoyo: true, repeat: -1 });
    }
    this.karinaSprite = this.person(790, 409, 'karina-pixel', 4.2);
    this.label('КАРИНА', 790, 230, '#ffd9d4', '13px');
    this.stars(35);
  }

  private drawCafe(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x3e2d3d).fillRect(0, 0, W, H);
    g.fillStyle(0x7d4e4c).fillRect(0, 76, W, 328);
    g.fillStyle(0xbe6d62).fillRect(0, 94, W, 12);
    g.fillStyle(0xf2c394).fillRect(0, 110, W, 5);
    // The long red-and-white facade on Transportnaya is visible through the windows.
    for (const x of [40, 258, 746]) {
      g.fillStyle(0x3a2939).fillRect(x, 153, 186, 205);
      g.fillStyle(0x8cacc0).fillRect(x + 9, 162, 168, 185);
      g.fillStyle(0x405c77).fillRect(x + 9, 209, 168, 138);
      g.fillStyle(0xb34554).fillRect(x + 18, 227, 150, 30);
      g.fillStyle(0x74819a).fillRect(x + 13, 266, 158, 4);
      for (let pane = 1; pane <= 3; pane++) g.fillStyle(0x293d54).fillRect(x + 9 + pane * 42, 162, 5, 185);
      g.fillStyle(0xe5d4be, .4).fillRect(x + 21, 177, 12, 119);
    }
    g.fillStyle(0x9f433f).fillRect(440, 137, 300, 107);
    g.fillStyle(0xffd9aa).fillRect(457, 151, 267, 8);
    g.fillStyle(0x603c43).fillRect(442, 250, 299, 78);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(i % 2 ? 0xf7bc81 : 0xffdc9e).fillRect(461 + i * 51, 267, 35, 24);
      g.fillStyle(0x2b222b).fillRect(465 + i * 51, 297, 27, 4);
    }
    g.fillStyle(0x563c3f).fillRect(443, 327, 300, 13);
    this.label('КИФАЗ', 590, 196, '#ffe2b2', '31px');
    for (const x of [142, 357, 795]) {
      g.fillStyle(0x392a34).fillRect(x - 18, 113, 36, 12).fillRect(x - 3, 124, 6, 50);
      g.fillStyle(0xffcb88, .2).fillCircle(x, 184, 58);
      g.fillStyle(0xffdda4).fillRect(x - 15, 168, 30, 13);
    }
    this.floorTiles(g, 407, 0x59434b, 0x9c7372);
    g.fillStyle(0x3e2836).fillRect(465, 329, 266, 17).fillRect(485, 346, 12, 67).fillRect(703, 346, 12, 67);
    g.fillStyle(0xb68a78).fillRect(467, 322, 263, 8);
    g.fillStyle(0xe7d2a9).fillRect(512, 310, 45, 12).fillRect(643, 311, 43, 11);
    g.fillStyle(0xd19c7b).fillRect(517, 301, 35, 8).fillRect(649, 302, 31, 8);
    g.fillStyle(0x6a3d49).fillRect(553, 345, 74, 32);
    this.person(665, 407, 'karina-pixel', 4.05);
    this.label('ПОГОВОРИТЬ  ✦', 590, 275, '#fff0d4', '14px');
  }

  private drawMorning(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x806e80).fillRect(0, 0, W, H);
    g.fillStyle(0xc2a4a0).fillRect(0, 80, W, 325);
    for (let x = 22; x < W; x += 47) { g.fillStyle(0xe0b9aa, .25).fillRect(x, 104, 4, 300); }
    // A quiet morning at home; through the window, Omsk is already bright.
    g.fillStyle(0x52445e).fillRect(65, 135, 397, 245);
    g.fillStyle(0xbce1de).fillRect(77, 148, 372, 217);
    g.fillStyle(0x9fc9cb).fillRect(77, 148, 372, 78);
    g.fillStyle(0xffe5b0).fillCircle(381, 190, 27);
    for (let x = 75; x < 452; x += 54) {
      g.fillStyle(0x769b85).fillRect(x + 27, 252, 8, 112);
      g.fillStyle(x % 2 ? 0x5f937b : 0x83ad87).fillCircle(x + 31, 263, 30);
    }
    g.fillStyle(0x3f4e68).fillRect(236, 149, 8, 215).fillRect(77, 263, 372, 6);
    g.fillStyle(0xe3d1bd).fillRect(59, 378, 410, 16);
    g.fillStyle(0xffd5b4, .3).fillTriangle(80, 389, 302, 406, 405, 540);
    g.fillStyle(0x7d6475).fillRect(55, 346, 93, 56);
    g.fillStyle(0x917382).fillRect(74, 321, 70, 34);
    g.fillStyle(0xead5c0).fillRect(81, 323, 53, 22);
    g.fillStyle(0x433d5a).fillRect(488, 317, 113, 91);
    g.fillStyle(0x71627d).fillRect(498, 324, 93, 24);
    g.fillStyle(0x573f62).fillRect(495, 392, 112, 10);
    this.floorTiles(g, 407, 0x80707a, 0xb39999);
    // The phone is a playable landmark, with Karina's park reply foreshadowed on screen.
    g.fillStyle(0x2c283d).fillRect(645, 144, 167, 250);
    g.fillStyle(0x6a5b75).fillRect(653, 152, 151, 234);
    g.fillStyle(0xeadbd9).fillRect(664, 183, 129, 190);
    g.fillStyle(0xd9a4ae).fillRect(664, 183, 129, 25);
    g.fillStyle(0xf5e8e0).fillRect(675, 232, 105, 44);
    g.fillStyle(0xb180a1).fillRect(688, 304, 91, 43);
    this.label('КАРИНА', 729, 197, '#513b58', '12px');
    this.label('ПРОСНУЛИСЬ?', 728, 251, '#6f5670', '11px');
    this.label('ОТПРАВИТЬ', 733, 324, '#fff7e9', '13px');
    this.label('УТРО В ОМСКЕ', 312, 110, '#fff4e3', '20px');
    this.person(882, 407, 'karina-red', 3.2).setAlpha(.72);
  }

  private drawArrival(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x929aa9).fillRect(0, 0, W, H);
    g.fillStyle(0xd7dadd).fillRect(0, 75, W, 330);
    g.fillStyle(0xf4f0e9).fillRect(0, 95, W, 291);
    g.fillStyle(0x8290a4).fillRect(0, 127, W, 13).fillRect(0, 307, W, 8);
    for (let x = 0; x < W; x += 77) { g.fillStyle(0xc1c8cc).fillRect(x, 103, 8, 283); g.fillStyle(0x8494a3).fillRect(x + 4, 109, 2, 268); }
    // Lockers and glass entry echo the supplied reunion video.
    for (let x = 25; x < 510; x += 86) {
      g.fillStyle(0xadb7bd).fillRect(x, 155, 77, 208);
      g.fillStyle(0xe8e9e6).fillRect(x + 5, 160, 67, 196);
      g.fillStyle(0xb6bdc2).fillRect(x + 9, 231, 59, 3).fillRect(x + 9, 285, 59, 3);
      g.fillStyle(0x798998).fillRect(x + 58, 205, 4, 13).fillRect(x + 58, 258, 4, 13);
      g.fillStyle(0xd9575c).fillRect(x + 12, 170, 18, 5);
    }
    g.fillStyle(0x445268).fillRect(529, 135, 400, 243);
    g.fillStyle(0x8eafc1).fillRect(539, 145, 380, 224);
    g.fillStyle(0xb9d7de).fillRect(544, 150, 370, 72);
    g.fillStyle(0x6f8da0).fillRect(544, 290, 370, 79);
    for (let x = 591; x < 915; x += 91) { g.fillStyle(0x4d6378).fillRect(x, 145, 8, 224); g.fillStyle(0xd8f0ed, .45).fillRect(x + 13, 155, 13, 161); }
    g.fillStyle(0x3c4b61).fillRect(653, 65, 239, 59);
    g.fillStyle(0x738ba0).fillRect(660, 71, 225, 4);
    this.label('ОМСК  ♥', 773, 95, '#fff1d6', '23px');
    for (const x of [191, 485, 825]) {
      g.fillStyle(0xfff4dc, .17).fillCircle(x, 121, 40);
      g.fillStyle(0xfff7e6).fillRect(x - 25, 109, 50, 9);
    }
    this.floorTiles(g, 405, 0xa8a8a9, 0xd2c9c3);
    for (let x = 0; x < W; x += 115) g.fillStyle(0xede9e3, .6).fillRect(x + 11, 447, 75, 2);
    this.karinaSprite = this.person(735, 405, 'karina-coat', 4.2);
    g.fillStyle(0x4c3e58).fillRect(814, 344, 34, 62);
    g.fillStyle(0xbba4a3).fillRect(821, 335, 20, 9);
    this.label('КАРИНА', 736, 222, '#fff0e4', '14px');
  }

  private drawFinal(g: Phaser.GameObjects.Graphics): void {
    [0x33203f, 0x62354e, 0x9d5061, 0xd67d76, 0xf1a982, 0xf4bd91].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 67, W, 70));
    g.fillStyle(0xffe4b3, 0.24).fillCircle(480, 210, 105);
    g.fillStyle(0xffedc5).fillCircle(480, 210, 63);
    this.ground(g, 405, 0x49354d);
    g.fillStyle(0xf3c5a1).fillRect(335, 172, 14, 231).fillRect(611, 172, 14, 231).fillRect(335, 165, 290, 17);
    g.fillStyle(0xe8a4ae).fillRect(340, 168, 280, 8);
    for (let i = 0; i < 14; i++) {
      const x = 340 + i * 21;
      g.fillStyle(i % 2 ? 0xffd2b2 : 0xe993a5).fillRect(x, 159 + i % 3 * 4, 11, 11);
    }
    this.person(445, 405, 'nikita-suit', 3.2);
    this.person(520, 405, 'karina-bride', 3.2);
    this.label('НИКИТА  ♥  КАРИНА', 480, 98, '#fff6e2', '31px');
    for (let i = 0; i < 64; i++) {
      const x = (i * 103 + 19) % W, y = (i * 77 + 13) % 370;
      const bit = this.add.rectangle(x, y, 5, 8, i % 2 ? 0xffd6a7 : 0xff99aa, 0.8).setDepth(15);
      this.tweens.add({ targets: bit, y: y + 55, angle: i % 2 ? 80 : -80, alpha: 0.3, duration: 1500 + i % 5 * 400, yoyo: true, repeat: -1 });
    }
  }
}
