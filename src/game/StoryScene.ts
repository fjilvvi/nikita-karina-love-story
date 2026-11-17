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
  private floor = 405;
  private targetX: number | null = null;
  private autoInteract = false;
  private moveDirection = 0;
  private keyLeft = false;
  private keyRight = false;
  private danceCount = 0;
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
    if (this.stage === story.length) window.dispatchEvent(new Event('game:complete'));
  };

  private continueStory = (): void => {
    this.stage += 1;
    this.paused = false;
    this.drawStage();
    if (this.stage === story.length) window.dispatchEvent(new Event('game:complete'));
  };

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
      this.danceCount += 1;
      this.status.setText(`ТАНЕЦ  /  ${Math.min(this.danceCount, 3)} ИЗ 3`);
      this.popHeart(665 + this.danceCount * 17, 220);
      this.tweens.add({ targets: this.player, angle: this.danceCount % 2 ? -8 : 8, duration: 110, yoyo: true });
      if (this.danceCount >= 3) this.openMemory();
      return;
    }
    if (this.stage === 1) {
      const flowerIndex = FLOWERS.findIndex((fx, index) => !this.flowers.has(index) && Math.abs(x - fx) < 48);
      if (flowerIndex >= 0) {
        this.flowers.add(flowerIndex);
        this.flowerSprites[flowerIndex]?.destroy();
        this.popHeart(FLOWERS[flowerIndex], 310);
        this.status.setText(`БУКЕТ  /  ${this.flowers.size} ИЗ 3`);
        if (this.flowers.size === 3) this.helper.setText('Букет готов. Подойди к Карине →');
        return;
      }
      if (this.flowers.size === 3 && Math.abs(x - 790) < 80) { this.openMemory(); return; }
    }
    if (this.stage === 2 && Math.abs(x - 590) < 90) { this.openMemory(); return; }
    if (this.stage === 3 && Math.abs(x - 720) < 95) { this.openMemory(); return; }
    if (this.stage === 4 && Math.abs(x - 735) < 90) { this.openMemory(); return; }
    this.tweens.add({ targets: this.helper, alpha: 0.2, duration: 90, yoyo: true });
  };

  private openMemory(): void {
    this.paused = true;
    this.moveDirection = 0;
    this.targetX = null;
    window.dispatchEvent(new CustomEvent('game:memory', { detail: this.stage }));
  }

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
      this.player.y = this.floor - 26 + Math.sin(this.time.now * 0.024) * 2;
    } else this.player.y = this.floor - 26;
  }

  private drawStage(): void {
    this.children.removeAll(true);
    this.targetX = null;
    this.autoInteract = false;
    this.moveDirection = 0;
    this.keyLeft = false;
    this.keyRight = false;
    this.danceCount = 0;
    this.flowers.clear();
    this.flowerSprites = [];
    const g = this.add.graphics();
    if (this.stage === 0) this.drawClub(g);
    else if (this.stage === 1) this.drawWalk(g);
    else if (this.stage === 2) this.drawCafe(g);
    else if (this.stage === 3) this.drawMorning(g);
    else if (this.stage === 4) this.drawArrival(g);
    else this.drawFinal(g);
    if (this.stage < story.length) {
      this.player = this.add.image(this.stage === 2 ? 185 : 130, this.floor - 26, 'nikita-pixel').setScale(3).setDepth(12);
    }
    const title = this.stage < story.length ? story[this.stage].title : 'Никита + Карина';
    this.add.text(34, 24, `${String(this.stage + 1).padStart(2, '0')} / 06   ${title.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#fff4df', stroke: '#1b1329', strokeThickness: 5,
    }).setDepth(30);
    this.status = this.add.text(W - 31, 24, this.stage === 1 ? 'БУКЕТ  /  0 ИЗ 3' : 'НИКИТА ♥ КАРИНА', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffd0be', stroke: '#1b1329', strokeThickness: 5,
    }).setOrigin(1, 0).setDepth(30);
    this.helper = this.add.text(W / 2, 502, this.stage < story.length ? story[this.stage].hint : 'ИСТОРИЯ ПРОДОЛЖАЕТСЯ', {
      fontFamily: 'monospace', fontSize: '14px', color: '#fff0dd', stroke: '#1b1329', strokeThickness: 5,
      align: 'center', wordWrap: { width: 850 },
    }).setOrigin(0.5).setDepth(30);
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
    g.fillStyle(0x332a34).fillRect(5, 0, 10, 3).fillRect(3, 3, 14, 5);
    g.fillStyle(0xf0bf9f).fillRect(4, 8, 12, 10);
    g.fillStyle(0x382b38).fillRect(5, 11, 2, 2).fillRect(13, 11, 2, 2);
    g.fillStyle(0xc66d82).fillRect(4, 18, 12, 12).fillRect(2, 21, 2, 9).fillRect(16, 21, 2, 9);
    g.fillStyle(0x372e49).fillRect(5, 30, 4, 6).fillRect(11, 30, 4, 6);
    g.fillStyle(0x1c192a).fillRect(4, 36, 5, 2).fillRect(11, 36, 5, 2);
    g.generateTexture('nikita-pixel', 20, 38);
    g.clear();
    g.fillStyle(0xc29b6a).fillRect(4, 0, 12, 4).fillRect(3, 4, 14, 15);
    g.fillStyle(0xf4c6a6).fillRect(5, 8, 10, 10);
    g.fillStyle(0x422a35).fillRect(6, 11, 2, 2).fillRect(12, 11, 2, 2);
    g.fillStyle(0xcd6b79).fillRect(4, 18, 12, 15).fillRect(2, 20, 2, 10).fillRect(16, 20, 2, 10);
    g.fillStyle(0x352d45).fillRect(5, 33, 4, 4).fillRect(11, 33, 4, 4);
    g.generateTexture('karina-pixel', 20, 38);
    g.clear();
    g.fillStyle(0x557464).fillRect(7, 8, 2, 12);
    g.fillStyle(0xe6869b).fillRect(4, 3, 5, 7).fillRect(9, 3, 5, 7).fillRect(7, 1, 4, 9);
    g.fillStyle(0xffdfaa).fillRect(8, 5, 2, 2);
    g.generateTexture('flower-pixel', 18, 21);
    g.destroy();
  }

  private person(x: number, feet: number, type: 'karina' | 'nikita', scale = 3): Phaser.GameObjects.Image {
    return this.add.image(x, feet - 19 * scale, type === 'karina' ? 'karina-pixel' : 'nikita-pixel').setScale(scale).setDepth(11);
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

  private city(g: Phaser.GameObjects.Graphics, top: number, floor: number): void {
    g.fillStyle(0x241d37).fillRect(0, top, W, floor - top);
    for (let i = 0; i < 20; i++) {
      const x = i * 53 - 9, height = 40 + (i * 37) % 100;
      g.fillStyle(i % 3 ? 0x30223c : 0x3a2942).fillRect(x, floor - height, 50, height);
      for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
        if ((row + col + i) % 3 !== 0) g.fillStyle(0xf7b28b, 0.65).fillRect(x + 7 + col * 13, floor - height + 10 + row * 17, 4, 6);
      }
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

  private drawClub(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x151020).fillRect(0, 0, W, H);
    g.fillStyle(0x2b1740).fillRect(0, 76, W, 335);
    for (let x = 0; x < W; x += 85) {
      g.fillStyle(x % 2 ? 0x5d2d76 : 0x363a87, 0.3).fillTriangle(x + 40, 96, x - 70, 400, x + 140, 400);
    }
    for (let x = 0; x < W; x += 160) {
      g.fillStyle(0x291733).fillRect(x, 125, 100, 164);
      g.fillStyle(0xd55eaa, 0.7).fillRect(x + 8, 135, 84, 4);
      g.fillStyle(0x6359ba, 0.7).fillRect(x + 8, 273, 84, 4);
    }
    g.fillStyle(0xe49cdc).fillCircle(480, 104, 28);
    g.fillStyle(0x734b9c).fillRect(453, 99, 54, 9).fillRect(474, 78, 10, 52);
    g.fillStyle(0x24182c).fillRect(0, 390, W, 16);
    this.ground(g, 406, 0x211a30);
    for (let x = 17; x < W; x += 59) g.fillStyle(x % 3 ? 0x965790 : 0x4f66a5, 0.6).fillRect(x, 430 + x % 28, 11, 5);
    g.fillStyle(0xffa0c5).fillRect(345, 143, 270, 6);
    this.label('D O S K I', 480, 175, '#ffb8ce', '30px');
    [638, 686, 739, 790].forEach((x, i) => {
      const friend = this.person(x, 406, 'karina', 2.4);
      if (i !== 1) friend.setTint([0xdcb8db, 0xffffff, 0xf2c2b3, 0xc9c3e6][i]);
    });
    this.label('КАРИНА', 687, 279, '#ffd5d1', '14px');
    this.stars(25);
  }

  private drawWalk(g: Phaser.GameObjects.Graphics): void {
    [0x18152c, 0x211a37, 0x34233f, 0x5d3453, 0x81415b, 0xa65b63].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 67, W, 70));
    g.fillStyle(0xffe2b5, 0.18).fillCircle(770, 135, 52);
    g.fillStyle(0xffe7c8).fillCircle(770, 135, 27);
    this.city(g, 265, 405);
    g.fillStyle(0x65536a).fillRect(130, 282, 210, 124);
    g.fillStyle(0x3b2c46).fillRect(142, 302, 186, 104);
    g.fillStyle(0xd9a6ab).fillRect(146, 292, 178, 9);
    this.label('ТЮЗ', 235, 339, '#f7d9c6', '24px');
    this.ground(g, 405);
    for (let i = 0; i < 3; i++) {
      this.flowerSprites.push(this.add.image(FLOWERS[i], 389, 'flower-pixel').setScale(2.3).setDepth(11));
      g.fillStyle(0x506953).fillRect(FLOWERS[i] - 19, 393, 38, 12);
    }
    this.person(790, 405, 'karina');
    this.label('КАРИНА', 790, 301, '#ffd9d4', '13px');
    this.stars();
  }

  private drawCafe(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x4d2e3c).fillRect(0, 0, W, H);
    g.fillStyle(0x9f6256).fillRect(0, 64, W, 350);
    g.fillStyle(0xe2a177).fillRect(0, 113, W, 10);
    for (let x = 65; x < W; x += 190) {
      g.fillStyle(0x64394b).fillRect(x, 163, 115, 120);
      g.fillStyle(0xffd2a3).fillRect(x + 9, 172, 97, 103);
      g.fillStyle(0x955b55).fillRect(x + 14, 211, 88, 61);
    }
    g.fillStyle(0x853947).fillRect(545, 71, 335, 74);
    this.label('КИФАЗ', 712, 107, '#ffe6bf', '33px');
    g.fillStyle(0x463044).fillRect(345, 320, 452, 28).fillRect(375, 348, 22, 60).fillRect(751, 348, 22, 60);
    g.fillStyle(0xf9d5aa).fillRect(475, 311, 44, 9).fillRect(634, 310, 40, 10);
    this.ground(g, 407, 0x493249);
    this.person(605, 400, 'karina', 2.5);
    this.label('ПОГОВОРИТЬ  ✦', 590, 264, '#fff0d4', '15px');
  }

  private drawMorning(g: Phaser.GameObjects.Graphics): void {
    [0x7ca8be, 0x8ec1c5, 0xb7d8cb, 0xe1d7b1, 0xeacda7, 0xe7b99f].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 69, W, 72));
    g.fillStyle(0xffedbc).fillCircle(777, 98, 51);
    for (let i = 0; i < 11; i++) {
      const x = i * 100 - 20;
      g.fillStyle(0x5d805f).fillRect(x + 36, 244, 13, 165);
      g.fillStyle(i % 2 ? 0x6f9a72 : 0x88a873).fillCircle(x + 42, 260, 57);
    }
    this.ground(g, 407, 0x93847d);
    g.fillStyle(0x2e2638).fillRect(650, 159, 145, 216);
    g.fillStyle(0x47455f).fillRect(660, 170, 125, 193);
    g.fillStyle(0xf0dbd0).fillRect(669, 210, 105, 54);
    g.fillStyle(0xc77889).fillRect(692, 289, 82, 42);
    this.label('ПРОСНУЛИСЬ?', 721, 235, '#3b2b3a', '12px');
    this.label('ОТПРАВИТЬ', 731, 307, '#fff3e1', '13px');
    this.label('УТРО ПОСЛЕ ВСТРЕЧИ', 400, 135, '#fff8e8', '23px');
  }

  private drawArrival(g: Phaser.GameObjects.Graphics): void {
    [0x5c739c, 0x748db0, 0x99b4c5, 0xc6cdd0, 0xd2c8c8].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 83, W, 85));
    g.fillStyle(0x35435b).fillRect(0, 206, W, 198);
    for (let x = 0; x < W; x += 148) {
      g.fillStyle(0x9bb4c9).fillRect(x + 8, 218, 129, 158);
      g.fillStyle(0x556b86).fillRect(x + 69, 218, 5, 158);
    }
    g.fillStyle(0xe7e0d3).fillRect(0, 188, W, 22);
    g.fillStyle(0x3e4d65).fillRect(0, 355, W, 50);
    this.label('ОМСК', 480, 232, '#fff3d9', '35px');
    this.ground(g, 405, 0x5e5b6d);
    this.person(735, 405, 'karina');
    g.fillStyle(0x4c3e58).fillRect(784, 359, 27, 47);
    g.fillStyle(0xbba4a3).fillRect(790, 351, 15, 8);
    this.label('КАРИНА', 735, 299, '#fff0e4', '14px');
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
    this.person(445, 405, 'nikita', 3.2);
    this.person(520, 405, 'karina', 3.2);
    this.label('НИКИТА  ♥  КАРИНА', 480, 98, '#fff6e2', '31px');
    for (let i = 0; i < 64; i++) {
      const x = (i * 103 + 19) % W, y = (i * 77 + 13) % 370;
      const bit = this.add.rectangle(x, y, 5, 8, i % 2 ? 0xffd6a7 : 0xff99aa, 0.8).setDepth(15);
      this.tweens.add({ targets: bit, y: y + 55, angle: i % 2 ? 80 : -80, alpha: 0.3, duration: 1500 + i % 5 * 400, yoyo: true, repeat: -1 });
    }
  }
}
