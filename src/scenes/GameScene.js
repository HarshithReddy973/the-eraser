import Phaser from 'phaser';
import { GAME_W, GAME_H, HUD_H, COLORS, FONT, PHYSICS } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { ensureTextures, makeTexture } from '../art/textures.js';
import { sketchRect, wobbleLine, rng } from '../art/sketch.js';
import Player from '../entities/Player.js';
import Stability from '../systems/Stability.js';
import Eraser from '../systems/Eraser.js';
import { createHud, showPanel, showHowTo, toast } from '../ui/ui.js';
import Run from '../systems/Run.js';
import Save from '../systems/Save.js';
import { sfx } from '../audio/sfx.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = data?.level ?? 0;
    this.level = LEVELS[this.levelIndex];
    this.state = 'playing'; // 'playing' | 'won' | 'lost'
    this.fontFamily = FONT;
    this.panel = null;
    this.shakeAt = 0;
    this.deaths = 0;
    this.lastDanger = 0;
    this.beatAt = 0;
    this.pausedTotal = 0; // ms spent paused (excluded from the level timer)
    this.pauseStart = 0;
    this.howto = null;
    this.invulnUntil = 0;
  }

  create() {
    ensureTextures(this);
    this.input.mouse.disableContextMenu();
    this.physics.world.setBounds(0, -400, GAME_W, GAME_H + 800);
    this.physics.world.setBoundsCollision(true, true, false, false); // left, right, up, down

    this.add.image(0, 0, 'paper').setOrigin(0).setDepth(-10);

    this.buildLevel();

    this.stability = new Stability(this.level.stability, () => this.gameOver());
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y);
    this.physics.add.collider(this.player.sprite, this.solids);
    this.physics.add.collider(this.boxGroup, this.solids);
    this.physics.add.collider(this.player.sprite, this.boxGroup);
    this.physics.add.collider(this.boxGroup, this.boxGroup);

    // particles for the eraser
    this.inkFx = this.add.particles(0, 0, 'ink-dot', {
      speed: { min: 30, max: 130 }, angle: { min: 190, max: 350 }, gravityY: 260,
      lifespan: { min: 300, max: 650 }, scale: { start: 0.9, end: 0.1 }, alpha: { start: 1, end: 0 },
      tint: 0x22222a, emitting: false,
    }).setDepth(40);
    this.dustFx = this.add.particles(0, 0, 'ink-dot', {
      speed: { min: 15, max: 70 }, angle: { min: 0, max: 360 }, gravityY: -25,
      lifespan: { min: 600, max: 1000 }, scale: { start: 1, end: 2.4 }, alpha: { start: 0.55, end: 0 },
      tint: 0xcbb98f, emitting: false,
    }).setDepth(39);
    this.confettiFx = this.add.particles(0, 0, 'ink-dot', {
      speed: { min: 80, max: 260 }, angle: { min: 200, max: 340 }, gravityY: 420,
      lifespan: { min: 700, max: 1300 }, scale: { start: 1.3, end: 0.4 }, alpha: { start: 1, end: 0 },
      tint: { onEmit: () => Phaser.Math.RND.pick([0xd8262f, 0x1d1d24, 0xc9731d, 0x5b6070, 0xf6c244]) }, emitting: false,
    }).setDepth(45);

    this.eraser = new Eraser(this);
    this.registerErasables();

    this.hud = createHud(this, this.level, { onRestart: () => this.restart(), onPause: () => this.togglePause() });
    this.vignette = this.add.image(0, 0, 'vignette').setOrigin(0).setDepth(50).setAlpha(0);
    this.cracks = this.add.image(0, 0, 'cracks').setOrigin(0).setDepth(49).setAlpha(0);

    // level intro: fade in from paper + a handwritten title card
    this.cameras.main.setRotation(0);
    this.cameras.main.fadeIn(350, 244, 236, 216);
    const card = this.add.text(GAME_W / 2, GAME_H / 2 - 50, this.level.name, {
      fontFamily: FONT, fontSize: '46px', fontStyle: 'bold', color: '#1d1d24',
    }).setOrigin(0.5).setDepth(70).setAlpha(0).setAngle(-1.5);
    this.tweens.add({ targets: card, alpha: 0.9, yoyo: true, hold: 1000, duration: 380, onComplete: () => card.destroy() });

    this.input.keyboard.on('keydown-R', () => this.restart());
    this.input.keyboard.on('keydown-B', () => this.resetBoxes());
    this.input.keyboard.on('keydown-M', () => toast(this, sfx.toggleMute() ? 'Sound off' : 'Sound on'));
    this.input.keyboard.on('keydown-ESC', () => (this.howto ? this.closeHowTo() : this.togglePause()));
    this.input.keyboard.on('keydown', () => sfx.unlock());
    // dev shortcut (only with ?dev in the URL): press 1 / 2 / 3 to jump straight to that level
    if (new URLSearchParams(location.search).has('dev')) {
      LEVELS.forEach((_, i) => this.input.keyboard.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i]}`, () => this.scene.restart({ level: i })));
    }
    this.t0 = this.time.now;

    // alt-tabbing away pauses the game instead of letting you die offscreen
    const onBlur = () => { if (this.state === 'playing') this.togglePause(); };
    this.game.events.on('blur', onBlur);
    this.events.once('shutdown', () => this.game.events.off('blur', onBlur));
  }

  // ---- level construction -------------------------------------------------

  buildLevel() {
    const L = this.level, li = this.levelIndex;
    this.solids = this.physics.add.staticGroup();
    this.solidRects = [];
    this.erasableDefs = [];

    L.platforms.forEach((p, i) => {
      const key = `plat-${li}-${i}`;
      makeTexture(this, key, p.w, p.h, (g) => sketchRect(g, 0, 0, p.w, p.h, { seed: 100 + i, width: 3 }));
      this.solids.create(p.x + p.w / 2, p.y + p.h / 2, key).setDepth(5);
      this.solidRects.push({ x: p.x, y: p.y, w: p.w, h: p.h });
    });

    L.erasables.forEach((e, i) => {
      const key = `eras-${li}-${i}`;
      // pencil look: pink eraser-coloured fill and a dashed outline, so players learn "pencil = erasable"
      makeTexture(this, key, e.w, e.h, (g) =>
        sketchRect(g, 0, 0, e.w, e.h, { seed: 300 + i, ink: 0x5a4650, width: 2.4, fill: 0xf7dfd6, hatchColor: 0xb5685a, hatchAlpha: 0.4, hatchGap: 8, dashed: true }));
      const sprite = this.solids.create(e.x + e.w / 2, e.y + e.h / 2, key).setDepth(6);
      const cost = e.cost ?? Phaser.Math.Clamp(Math.round((e.w * e.h) / 1500), 4, 40);
      this.erasableDefs.push({ id: e.id, sprite, rect: { x: e.x, y: e.y, w: e.w, h: e.h }, cost, eraseTime: e.eraseTime ?? 1 });
    });

    // pushable boxes: dynamic bodies, so if their support is erased they simply fall
    this.boxGroup = this.physics.add.group();
    (L.boxes ?? []).forEach((b, i) => {
      const key = `box-${li}-${i}`;
      makeTexture(this, key, b.w, b.h, (g) => {
        sketchRect(g, 0, 0, b.w, b.h, { seed: 500 + i, fill: 0xe8d3a3, hatch: false, width: 3 });
        const r = rng(9 + i);
        g.lineStyle(2, COLORS.ink, 0.55);
        wobbleLine(g, 7, 7, b.w - 7, b.h - 7, r, 0.8);
        wobbleLine(g, b.w - 7, 7, 7, b.h - 7, r, 0.8);
      });
      const box = this.boxGroup.create(b.x + b.w / 2, b.y + b.h / 2, key).setDepth(8);
      box.body.setDragX(1400); // heavy: stops quickly when you stop pushing
      box.body.setMaxVelocity(220, 900);
      box.setCollideWorldBounds(true);
      box.setData('start', { x: b.x + b.w / 2, y: b.y + b.h / 2 });
    });

    // pressure plates (only boxes count — the doodle is too light)
    this.switches = [];
    (L.switches ?? []).forEach((sw, i) => {
      const key = `switch-${li}-${i}`;
      makeTexture(this, key, sw.w, 8, (g) => sketchRect(g, 0, 0, sw.w, 8, { seed: 700 + i, fill: 0xe9b3ab, hatch: false, width: 2 }));
      const img = this.add.image(sw.x, sw.y + 8, key).setOrigin(0, 1).setDepth(4);
      this.switches.push({ rect: new Phaser.Geom.Rectangle(sw.x, sw.y, sw.w, 8), img, pressed: false });
    });

    // spikes: not solid, but touching one sends the doodle back to the start
    this.spikeRects = [];
    (L.spikes ?? []).forEach((sp, i) => {
      const key = `spikes-${li}-${i}`;
      makeTexture(this, key, sp.w, 18, (g) => {
        const r = rng(40 + i);
        const n = Math.max(1, Math.round(sp.w / 18));
        const tw = sp.w / n;
        for (let k = 0; k < n; k++) {
          const x0 = k * tw, x1 = x0 + tw, xm = (x0 + x1) / 2;
          g.fillStyle(0xf1e6c8, 1);
          g.beginPath();
          g.moveTo(x0 + 1, 17);
          g.lineTo(xm, 2);
          g.lineTo(x1 - 1, 17);
          g.closePath();
          g.fillPath();
          g.fillStyle(COLORS.red, 1); // red danger tip
          g.fillTriangle(xm, 2, xm - 3.6, 9, xm + 3.6, 9);
          g.lineStyle(2.4, COLORS.ink, 1);
          wobbleLine(g, x0 + 1, 17, xm, 2, r, 0.6);
          wobbleLine(g, xm, 2, x1 - 1, 17, r, 0.6);
        }
        g.lineStyle(2.4, COLORS.ink, 1);
        wobbleLine(g, 0, 17, sp.w, 17, r, 0.5);
      });
      this.add.image(sp.x, sp.y, key).setOrigin(0, 1).setDepth(4);
      // forgiving hitbox: a bit narrower and shorter than the drawing
      this.spikeRects.push(new Phaser.Geom.Rectangle(sp.x + 3, sp.y - 13, sp.w - 6, 12));
    });

    const ex = L.exit;
    this.door = this.add.image(ex.x, ex.y, 'door').setOrigin(0.5, 1).setDepth(3);
    this.exitRect = new Phaser.Geom.Rectangle(ex.x - 18, ex.y - 56, 36, 56);
    this.exitOpen = !ex.locked;
    if (!this.exitOpen) this.door.setTexture('door-locked'); // greyed out with a padlock

    (L.hints ?? []).forEach((h) => {
      this.add.text(h.x, h.y, h.text, { fontFamily: FONT, fontSize: '20px', color: h.color, align: 'center' })
        .setOrigin(0.5).setAngle(h.angle ?? 0).setDepth(2).setAlpha(0.85);
    });
  }

  registerErasables() {
    this.erasableDefs.forEach((d) => this.eraser.register(d));
  }

  // ---- state --------------------------------------------------------------

  isOverUI(pointer) {
    return this.state !== 'playing' || pointer.y < HUD_H;
  }

  restart() {
    this.scene.restart({ level: this.levelIndex });
  }

  levelComplete() {
    if (this.state !== 'playing') return;
    this.state = 'won';
    this.physics.pause();
    sfx.win();
    this.confettiFx.emitParticleAt(this.door.x, this.door.y - 40, 70);
    const secs = ((this.time.now - this.t0 - this.pausedTotal) / 1000).toFixed(1);
    const left = Math.ceil(this.stability.value);
    const hasNext = this.levelIndex + 1 < LEVELS.length;
    Run.record(this.levelIndex, Number(secs), left, this.deaths);
    const rec = Save.submit(this.levelIndex, Number(secs), left);
    const star = ' ★';
    const lines = [
      `Time ${secs}s  (best ${rec.best.bestTime.toFixed(1)}s)${rec.newTime ? star : ''}`,
      `Ink left ${left}%  (best ${rec.best.bestInk}%)${rec.newInk ? star : ''}`,
    ];
    if (this.deaths) lines.push(`Oops count: ${this.deaths}`);
    const buttons = [{ label: 'Replay', onClick: () => this.restart() }];
    buttons.push(hasNext
      ? { label: 'Next level', primary: true, onClick: () => this.scene.restart({ level: this.levelIndex + 1 }) }
      : { label: 'Finish', primary: true, onClick: () => this.scene.start('Final') });
    this.panel = showPanel(this, {
      title: 'Sketch complete!',
      subtitle: lines.join('\n'),
      buttons,
    });
  }

  // Soft-lock insurance: put a box back where it started (it simply falls again if its support is gone).
  resetBox(bx) {
    const st = bx.getData('start');
    this.dustFx.emitParticleAt(bx.x, bx.y, 8);
    bx.body.reset(st.x, st.y);
    bx.setData('pvy', 0);
    this.dustFx.emitParticleAt(st.x, st.y, 8);
  }

  resetBoxes() {
    if (this.state !== 'playing' || !this.boxGroup.getLength()) return;
    this.boxGroup.getChildren().forEach((bx) => this.resetBox(bx));
    sfx.click();
    toast(this, 'Box put back');
  }

  // ---- pause ----------------------------------------------------------------

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.physics.pause();
      this.pauseStart = this.time.now;
      this.openPauseMenu();
    } else if (this.state === 'paused' && !this.howto) {
      this.panel?.destroy();
      this.panel = null;
      this.state = 'playing';
      this.physics.resume();
      this.pausedTotal += this.time.now - this.pauseStart;
    }
  }

  openPauseMenu() {
    this.panel = showPanel(this, {
      title: 'Paused',
      layout: 'column',
      buttons: [
        { label: 'Resume', primary: true, onClick: () => this.togglePause() },
        { label: 'Restart', onClick: () => this.restart() },
        { label: 'How to Play', onClick: () => this.openHowTo() },
        { label: 'Main menu', onClick: () => this.scene.start('Menu') },
      ],
    });
  }

  openHowTo() {
    this.panel?.destroy();
    this.panel = null;
    this.howto = showHowTo(this, { onClose: () => this.closeHowTo() });
  }

  closeHowTo() {
    this.howto?.destroy();
    this.howto = null;
    this.openPauseMenu();
  }

  // Hazard or fall: back to the start. Erased objects stay erased (restart with R for a clean page).
  killPlayer(time) {
    const s = this.player.sprite;
    this.deaths++;
    this.inkFx.emitParticleAt(s.x, s.y, 18);
    this.cameras.main.shake(140, 0.006);
    sfx.hurt();
    this.player.respawn(this.level.spawn.x, this.level.spawn.y);
    this.invulnUntil = time + 500;
  }

  gameOver() {
    if (this.state !== 'playing') return;
    this.state = 'lost';
    this.physics.pause();
    this.cameras.main.shake(300, 0.012);
    sfx.lose();
    this.panel = showPanel(this, {
      title: 'The page fell apart!',
      subtitle: 'You ran out of ink stability.\nTry erasing less.',
      titleColor: COLORS.red,
      buttons: [{ label: 'Restart', primary: true, onClick: () => this.restart() }],
    });
  }

  // ---- loop ---------------------------------------------------------------

  update(time, delta) {
    this.hud.update(this.stability, time);
    this.updateWarnings(time);
    this.eraser.update(time, delta);
    if (this.state !== 'playing') return;

    this.player.update(time, delta);

    const s = this.player.sprite;
    const pb = s.body;
    const onSpikes = this.spikeRects.some((r) => pb.x < r.right && pb.right > r.x && pb.y < r.bottom && pb.bottom > r.y);
    if (s.y > PHYSICS.fallDeathY || (onSpikes && time > this.invulnUntil)) this.killPlayer(time);

    this.updateSwitches();

    // boxes: dust, shake and a thump when one lands hard
    for (const bx of this.boxGroup.getChildren()) {
      if (bx.y > PHYSICS.fallDeathY) this.resetBox(bx); // fell off the page
      const pv = bx.getData('pvy') ?? 0;
      const vy = bx.body.velocity.y;
      if (pv > 260 && vy < pv - 200) {
        this.dustFx.emitParticleAt(bx.x, bx.body.bottom - 2, 10);
        this.cameras.main.shake(100, 0.004);
        sfx.thud();
      }
      bx.setData('pvy', vy);
    }

    const b = s.body;
    const hit = this.exitOpen && b.x < this.exitRect.right && b.right > this.exitRect.x && b.y < this.exitRect.bottom && b.bottom > this.exitRect.y;
    if (hit) this.levelComplete();
  }

  // A plate is pressed while any box overlaps it. The door opens when every plate is pressed.
  updateSwitches() {
    if (!this.switches.length) return;
    const boxes = this.boxGroup.getChildren();
    let all = true;
    for (const sw of this.switches) {
      const pressed = boxes.some((bx) => {
        const b = bx.body;
        return b.x < sw.rect.right && b.right > sw.rect.x && b.y < sw.rect.bottom && b.bottom > sw.rect.y;
      });
      if (pressed !== sw.pressed) {
        sw.pressed = pressed;
        sw.img.setScale(1, pressed ? 0.4 : 1);
        sw.img.setTint(pressed ? 0xa9e08f : 0xffffff);
        sfx.click();
      }
      all = all && pressed;
    }
    // the door latches: once it has been unlocked it stays open, even if the box is pushed off the plate
    if (all && !this.exitOpen) {
      this.exitOpen = true;
      this.door.setTexture('door');
      this.tweens.add({ targets: this.door, scaleX: 1.12, scaleY: 1.06, yoyo: true, duration: 120 });
      this.confettiFx.emitParticleAt(this.door.x, this.door.y - 40, 24);
      sfx.open();
    }
  }

  // Low stability gets progressively scarier: red vignette, cracks creeping in from the page edges,
  // shaking, a slow camera wobble ("the paper is warping") and a heartbeat thump.
  updateWarnings(time) {
    const d = this.stability.danger, ratio = this.stability.ratio, cam = this.cameras.main;
    const target = d === 0 ? 0 : d === 1 ? 0.28 : 0.6 + 0.15 * Math.sin(time / 150);
    this.vignette.setAlpha(this.vignette.alpha + (target - this.vignette.alpha) * 0.08);
    this.cracks.setAlpha(Math.max(0, (0.45 - ratio) / 0.45) * 0.85);

    if (this.state !== 'playing') return;
    if (d > this.lastDanger) sfx.warn(d);
    this.lastDanger = d;
    if (d > 0 && time > this.shakeAt) {
      cam.shake(130, d === 1 ? 0.0018 : 0.0036);
      this.shakeAt = time + (d === 1 ? 2200 : 1100);
    }
    if (d === 2) {
      cam.setRotation(Math.sin(time / 230) * 0.004);
      if (time > this.beatAt) { sfx.beat(); this.beatAt = time + 900; }
    } else {
      cam.setRotation(cam.rotation * 0.9);
    }
  }
}
