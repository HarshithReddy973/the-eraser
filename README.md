# THE ERASER

> *Erase the world. Rewrite your fate.*

A hand-drawn 2D puzzle-platformer that runs in the browser. You are a tiny unfinished doodle trapped in a sketchbook. With a magical red eraser you can rub out parts of the page — walls, platforms, supports — to open paths and make things fall. But every stroke costs **Ink Stability**, and if it hits zero the page falls apart.

Built with **Phaser 3** (Arcade Physics), **Vite** and plain JavaScript. No backend, no React, no image files — all artwork and sound are generated in code.

---

## Status

| Day | Scope | State |
|---|---|---|
| 1–2 | Project setup, player, eraser, ink stability, prototype level | Done |
| 3 | Box, pressure plate, locked door, spikes, Levels 2 and 3 as data | Done |
| 4 | Start screen, pause menu, How to Play, level-complete / final screens | Done |
| 5 | Art pass: bundled handwriting font, animated doodle, eraser cursor, hazards, cracks | Done |
| 6 | Juice: particles, low-ink warnings, synthesized sound, mute | Done |
| 7 | Balancing, soft-lock safety nets, saved bests, auto-pause | Done |
| 8 | Full playtest in a real browser, bug fixes, deploy workflow | Done |

The game boots into the title screen. Three levels are playable, followed by a final completion screen.

---

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev        # dev server, http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the built dist/ locally
```

`vite.config.js` uses `base: './'`, so the contents of `dist/` can be dropped onto any static host (GitHub Pages, Netlify, Vercel, itch.io).

---

## Controls

| Action | Input |
|---|---|
| Move | `A` / `D` or `←` / `→` |
| Jump | `Space`, `W` or `↑` |
| Erase | Hold **left mouse button** and drag over pencil objects |
| Restart level | `R` or the Restart button |
| Pause / resume | `Esc` or the Pause button (also pauses automatically when the window loses focus) |
| Put a stuck box back | `B` (levels with boxes) |
| Mute / unmute | `M` (remembered between visits) |
| Jump to level (testing) | `1`, `2`, `3` — only with `?dev` in the URL |

---

## How it plays

**Ink vs. pencil.** Solid black-ink shapes are permanent. Lighter, hatched *pencil* shapes can be erased.

**Erasing.** Each erasable object has a progress value. While the eraser circle overlaps it, progress fills and the object fades; at 100% it is destroyed and its physics body is removed, so it stops colliding immediately. Anything resting on it falls.

**Reach.** You can only erase within 340 px of the doodle. Erasing ink, or anything out of reach, is *denied*: grey cursor with an X, a dull sound and (for out-of-reach) a dashed ring showing your range.

**Ink Stability.** Every level starts at 100%. Erasing spends it in proportion to progress, using each object's `cost`. Warnings escalate:

| Stability | Effect |
|---|---|
| above 60% | calm |
| 30–60% | orange meter, faint red vignette, light shake |
| below 30% | red meter, pulsing vignette, stronger shake (blinks under 15%) |
| 0% | game over |

Below 45% cracks also creep in from the page edges, and below 30% the camera slowly wobbles with a heartbeat thump.

Each level's total erasable cost is deliberately above 100, so you can run out of ink — you must plan, not just erase everything.

**Boxes and plates.** Boxes are pushable physics bodies. A pressure plate is pressed while a box sits on it (the doodle is too light). A `locked` exit shows a padlock until every plate is pressed, then it **latches open** — pushing the box off the plate afterwards does not close it again.

**Spikes.** Touching spikes, or falling off the page, sends you back to the spawn point. Anything you erased stays erased until you press `R`.

**Soft-lock safety nets.** `R` restarts the level at any time. `B` puts every box back where it started (it simply falls again if its support is gone), and a box that leaves the page respawns by itself. Pits are always shallower than a jump, so you can climb out of any pit.

**Best results.** After each level the game saves your best time and the most ink stability you had left (a cleaner solve) in `localStorage`, and the level-complete panel shows them with a ★ when you beat a record. If storage is blocked the game works the same, just without saving.

### Levels

| # | Name | Teaches | Ink needed |
|---|---|---|---|
| 1 | First Strokes | Moving, jumping, erasing a wall, erasing the floor to drop to the door | 65% |
| 2 | Support Act | Erase a box's support so it falls on a plate, unlocking the door | 60% |
| 3 | Ink Budget | Spikes, stepping stones, a high box on a shelf, a blocking wall, tight ink | 75% |

---

## Project structure

```
src/
  main.js                 Phaser game config and boot
  config.js               All tunable numbers (physics, eraser, colours, font)
  style.css               Page styling around the canvas
  levels/levels.js        Level data — add levels here
  scenes/MenuScene.js     Title screen with the animated eraser sweep
  scenes/GameScene.js     Builds a level, runs the game loop, pause, win/lose, restart
  scenes/FinalScene.js    Final completion screen with run stats
  entities/Player.js      Movement, coyote time, jump buffer, variable jump height
  systems/Eraser.js       Cursor, rubbing, progress, denied feedback, removal
  systems/Stability.js    Ink Stability meter and danger levels
  systems/Run.js          In-memory stats for the current playthrough
  systems/Save.js         Best time / best ink in localStorage
  ui/ui.js                HUD, sketchy buttons, pause/win/lose panels, How to Play
  art/sketch.js           Wobbly-line helpers (sketchRect, wobbleCircle, ...)
  art/textures.js         Paper, doodle, door, particle and vignette textures
  audio/sfx.js            Synthesized WebAudio sound effects, master volume and mute
```

---

## Adding a level

Levels are plain objects appended to the array in `src/levels/levels.js`. The world is 960 × 540; positions are top-left `(x, y)` with size `(w, h)`.

```js
{
  name: 'Level 4 · Your Title',
  spawn: { x: 50, y: 330 },
  stability: 100,
  platforms: [{ x: 0, y: 380, w: 300, h: 160 }],          // permanent ink
  erasables: [{ id: 'wall', x: 300, y: 200, w: 40, h: 180,
                cost: 35, eraseTime: 1.0 }],               // pencil
  boxes:     [{ x: 100, y: 336, w: 44, h: 44 }],           // optional
  switches:  [{ x: 400, y: 472, w: 60 }],                  // optional; y = plate top
  spikes:    [{ x: 500, y: 480, w: 90 }],                  // optional; y = floor line
  exit:      { x: 880, y: 380, locked: true },             // x = centre, y = floor
  hints:     [{ x: 200, y: 150, text: 'hello', angle: -3, color: '#d8262f' }],
}
```

- `cost` is the % of stability spent for a full erase. If omitted it is derived from the object's area.
- `eraseTime` is seconds of scribbling for a full erase (default 1).
- Level-complete shows **Next level** automatically when another level exists; after the last level it shows **Finish**, which opens the final screen.

### Design rules of thumb

- Jump height is about **112 px**, and about **190 px** across a flat gap. Keep pits shallower than ~100 px so the player can always climb out.
- Keep total erasable cost above the stability budget so players can fail; keep the cost *needed to win* comfortably below it.
- Leave at least ~15 px of headroom under ceilings above jump paths.
- Always assume the player can press `R`; avoid states that need more than a restart to escape.

---

## Tuning

Everything that affects feel is in `src/config.js`:

- `PHYSICS`: gravity, move speed, acceleration, jump velocity, coyote time (100 ms), jump buffer (110 ms), fall-death height.
- `ERASER`: cursor radius (30 px) and reach (340 px).
- `COLORS` and `FONT`: the paper-and-ink palette and handwriting font stack.

---

## Technical notes

- **Physics:** Arcade Physics. Solids and erasables share one static group; destroying an erasable's sprite removes its body. Boxes are dynamic bodies with high horizontal drag so they feel heavy.
- **Art:** Platforms, the doodle, door, spikes, boxes and paper are drawn procedurally with seeded jitter, so every shape looks hand-drawn but is identical on every restart. Textures are cached by key.
- **Audio:** Sound is synthesized with WebAudio; browsers start it on the first click or key press.
- **Fonts:** *Patrick Hand* is bundled through `@fontsource/patrick-hand` (Open Font License), so the look is identical everywhere. The game waits for it to load before starting. A few arrow glyphs fall back to a system font.
- **Doodle animation:** The physics body is an invisible sprite that is never scaled; a separate visual image follows it and gets squash and stretch, lean, breathing, blinking and dust puffs.

---

## Known gaps / roadmap

- Possible later: more levels, a level-select screen, a reset-progress button, gamepad or touch support.

---

## Deploying

`npm run build` produces a fully static site in `dist/` (relative asset paths, no server needed).

- **GitHub Pages (automatic):** push this project to a GitHub repo with a `main` branch, then in *Settings → Pages* set **Source: GitHub Actions**. The included workflow `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **Netlify / Vercel:** import the repo; build command `npm run build`, output directory `dist`. Or drag the `dist/` folder onto Netlify Drop.
- **itch.io:** zip the *contents* of `dist/` (so `index.html` is at the top level), upload as an HTML5 game and set the viewport to 960 × 540.

---

## Dev mode and testing

Add query parameters to the URL (for example `http://localhost:5173/?dev`):

| Parameter | Effect |
|---|---|
| `?dev` | Exposes the game as `window.__game` and enables the `1` / `2` / `3` level shortcuts |
| `?canvas` | Forces the 2D canvas renderer (much faster in software-rendered or headless browsers) |

**How it was tested.** The finished game was played through in a real headless Chromium driven with real keyboard and mouse input: all three levels were beaten from the title screen; pause really freezes the game; running out of ink triggers game over and `R` resets ink, objects and position; the Finish → final screen → menu → play-again loop works; boxes, plates, latched doors, `B`, box respawn, auto-pause, mute and saved bests were each checked; no console errors were logged. Frame-by-frame traces confirmed the Level 3 spike jump clears the spikes with room to spare.

---

## License

Add a license of your choice before publishing.
