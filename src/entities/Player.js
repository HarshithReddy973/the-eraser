import Phaser from 'phaser';
import { PHYSICS } from '../config.js';
import { sfx } from '../audio/sfx.js';

const approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));

/**
 * The doodle. Handles input, acceleration, and a forgiving jump:
 *  - coyote time: you can still jump a moment after walking off a ledge
 *  - jump buffer: pressing jump slightly before landing still counts
 *  - variable height: release jump early for a shorter hop
 * Jump consumes both timers, so you can never jump while airborne.
 *
 * Physics and looks are split: `sprite` is an invisible physics body (never scaled, so
 * collisions stay exact); `visual` follows it and gets the squash/stretch, lean and blinking.
 */
export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'doodle').setDepth(10).setVisible(false);
    const body = this.sprite.body;
    body.setSize(18, 30).setOffset(5, 6); // tighter than the art, feels fairer
    body.setMaxVelocity(400, 900);
    this.sprite.setCollideWorldBounds(true);

    this.visual = scene.add.image(x, y, 'doodle').setOrigin(0.5, 1).setDepth(10);

    this.keys = scene.input.keyboard.addKeys({
      a: 'A', d: 'D', left: 'LEFT', right: 'RIGHT', w: 'W', up: 'UP', space: 'SPACE',
    });
    this.lastGrounded = -Infinity;
    this.jumpPressedAt = -Infinity;
    this.cutJump = false;

    // animation state
    this.wasGrounded = false;
    this.prevVy = 0;
    this.landSquash = 0;
    this.sx = 1;
    this.sy = 1;
    this.stepAt = 0;
    this.nextBlink = 1500;
    this.blinkUntil = 0;
    this.faceLeft = false;
  }

  get grounded() {
    const b = this.sprite.body;
    return b.blocked.down || b.touching.down;
  }

  update(time, delta) {
    const k = this.keys, b = this.sprite.body, dt = delta / 1000;
    const grounded = this.grounded;
    if (grounded) { this.lastGrounded = time; this.cutJump = false; }

    // horizontal movement
    const dir = (k.a.isDown || k.left.isDown ? -1 : 0) + (k.d.isDown || k.right.isDown ? 1 : 0);
    let vx = b.velocity.x;
    if (dir !== 0) {
      vx = approach(vx, dir * PHYSICS.moveSpeed, (grounded ? PHYSICS.groundAccel : PHYSICS.airAccel) * dt);
      this.faceLeft = dir < 0;
    } else {
      vx = approach(vx, 0, (grounded ? PHYSICS.groundFriction : PHYSICS.airFriction) * dt);
    }
    b.setVelocityX(vx);

    // jumping
    const jd = Phaser.Input.Keyboard.JustDown;
    if (jd(k.space) || jd(k.w) || jd(k.up)) this.jumpPressedAt = time;
    const wantsJump = time - this.jumpPressedAt <= PHYSICS.bufferMs;
    const canJump = time - this.lastGrounded <= PHYSICS.coyoteMs;
    if (wantsJump && canJump) {
      b.setVelocityY(PHYSICS.jumpVelocity);
      this.lastGrounded = -Infinity;
      this.jumpPressedAt = -Infinity;
      this.cutJump = false;
      this.landSquash = -0.5; // negative = anticipation stretch
      this.dust(4);
      sfx.jump();
    }
    const held = k.space.isDown || k.w.isDown || k.up.isDown;
    if (!held && !this.cutJump && b.velocity.y < -170) {
      b.setVelocityY(b.velocity.y * 0.5); // short hop
      this.cutJump = true;
    }

    // landing: squash + dust + soft thump (prevVy is the speed just before touching down)
    if (grounded && !this.wasGrounded && this.prevVy > 280) {
      this.landSquash = Math.min(1, this.prevVy / 700);
      this.dust(Math.round(4 + this.landSquash * 6));
      sfx.land();
    }
    this.wasGrounded = grounded;
    this.prevVy = b.velocity.y;

    // little dust puffs while running
    if (grounded && Math.abs(vx) > 150 && time > this.stepAt) {
      this.stepAt = time + 150;
      this.scene.dustFx.emitParticleAt(this.sprite.x - Math.sign(vx) * 8, b.bottom - 2, 1);
    }

    this.animate(time, dt, grounded, vx, b);
  }

  dust(n) {
    const b = this.sprite.body;
    this.scene.dustFx.emitParticleAt(this.sprite.x, b.bottom - 2, n);
  }

  // Squash & stretch, lean, breathing and blinking — all on the visual only.
  animate(time, dt, grounded, vx, b) {
    let tx = 1, ty = 1;
    if (!grounded) {
      const v = Math.min(1, Math.abs(b.velocity.y) / 600);
      ty = 1 + 0.16 * v;
      tx = 1 - 0.1 * v;
    } else if (Math.abs(vx) > 40) {
      const w = Math.sin(time / 55) * 0.05; // run bob
      ty = 1 + w;
      tx = 1 - w;
    } else {
      const w = Math.sin(time / 380); // idle breathing
      ty = 1 + w * 0.025;
      tx = 1 - w * 0.015;
    }
    this.landSquash += (0 - this.landSquash) * Math.min(1, dt * 9);
    ty -= this.landSquash * 0.32;
    tx += this.landSquash * 0.26;
    const f = Math.min(1, dt * 18);
    this.sx += (tx - this.sx) * f;
    this.sy += (ty - this.sy) * f;

    // blink every few seconds
    if (time > this.nextBlink) {
      this.blinkUntil = time + 110;
      this.nextBlink = time + 2200 + Math.random() * 3000;
    }
    const blinking = time < this.blinkUntil;
    this.visual
      .setTexture(blinking ? 'doodle-blink' : 'doodle')
      .setPosition(this.sprite.x, b.bottom)
      .setScale(this.sx, this.sy)
      .setFlipX(this.faceLeft)
      .setRotation((vx / PHYSICS.moveSpeed) * 0.09); // lean into the run
  }

  respawn(x, y) {
    this.sprite.body.reset(x, y);
    this.lastGrounded = -Infinity;
    this.prevVy = 0;
  }
}
