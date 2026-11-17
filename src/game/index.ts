import Phaser from 'phaser';
import { StoryScene } from './StoryScene';

export function mountGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#17142b',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [StoryScene],
    render: { pixelArt: true },
  });
}
