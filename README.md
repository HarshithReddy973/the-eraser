# THE ERASER

*Erase the world. Rewrite your fate.*

**THE ERASER** is a hand-drawn 2D puzzle-platformer that runs in your browser. You play as a tiny unfinished doodle trapped inside a sketchbook. Use a magical red eraser to remove pencil-drawn walls, platforms, and supports, creating paths and changing the level around you.

Every erasure consumes **Ink Stability**. If it reaches zero, the page falls apart. You need to think carefully about what to erase instead of removing everything in sight.

# PLAY

Playable Link : **[Play THE ERASER](https://harshithreddy973.github.io/the-eraser/)**


## Features

- Erasable pencil objects and permanent ink platforms.
- Ink Stability system that makes every erasure a trade-off.
- Pushable boxes, pressure plates, locked exits, and spikes.
- Three playable levels, each introducing different puzzle mechanics.
- Player movement with jumping, coyote time, and jump buffering.
- Title screen, pause menu, instructions, level-complete screen, and final screen.
- Synthesized sound effects, particles, visual feedback, and mute control.
- Saved best times and remaining Ink Stability using `localStorage`.

## Controls

| Action | Input |
|---|---|
| Move | `A` / `D` or `←` / `→` |
| Jump | `Space`, `W`, or `↑` |
| Erase | Hold the left mouse button and drag over pencil objects |
| Restart level | `R` or the Restart button |
| Pause / resume | `Esc` or the Pause button |
| Reset boxes | `B` (levels with boxes) |
| Mute / unmute | `M` |

## Built With

- JavaScript
- [Phaser 3](https://phaser.io/) — game framework and Arcade Physics
- [Vite](https://vite.dev/) — development server and build tool

The game's artwork is drawn procedurally in code, and its sound effects are synthesized with Web Audio.

## To Run Locally

Requires **Node.js 18 or later**.

1. Clone the repository:

   ```bash
   git clone https://github.com/HarshithReddy973/the-eraser.git
   cd the-eraser
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed in your terminal (usually `http://localhost:5173`).

To create and preview a production build:

```bash
npm run build
npm run preview
```

---

Made as an original browser game project. Have fun erasing!
