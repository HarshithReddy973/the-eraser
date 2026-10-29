import Phaser from 'phaser';
import '@fontsource/patrick-hand/400.css';
import './style.css';
import { GAME_W, GAME_H, PHYSICS } from './config.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import FinalScene from './scenes/FinalScene.js';

const start = () =>
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#f4ecd8',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: PHYSICS.gravity }, debug: false },
    },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [MenuScene, GameScene, FinalScene], // boots into the title screen
  });

// Phaser bakes text into canvas textures, so wait for the handwriting font first
// (with a timeout so a font problem can never block the game).
Promise.race([
  document.fonts.load('24px "Patrick Hand"', 'Aa Bb 0123'),
  new Promise((resolve) => setTimeout(resolve, 2000)),
]).then(start, start);
