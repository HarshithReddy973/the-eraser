// Levels are plain data. To add a level, append an object here.
// Coordinates are top-left (x, y) + size (w, h) in a 960x540 world.
//
//  platforms : solid ink — never erasable
//  erasables : pencil sketches — can be erased; each costs Ink Stability
//              cost (optional)      % of stability spent when fully erased
//              eraseTime (optional) seconds of scribbling needed
//  boxes     : pushable crates (dynamic physics bodies)
//  switches  : pressure plates { x, y, w } — y is the plate's top; only boxes are heavy enough
//  exit      : { x: centre, y: floor line, locked?: true } — locked doors open once every switch is pressed
//  hints     : handwritten notes drawn on the page
//
// Tip: total erasable cost is deliberately > 100 in each level, so you CAN run out of ink.
export const LEVELS = [
  {
    name: 'Level 1 · First Strokes',
    spawn: { x: 70, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 420, h: 160 }, // left ground
      { x: 420, y: 380, w: 280, h: 160 }, // middle ground
      { x: 700, y: 500, w: 260, h: 40 }, // floor of the hidden chamber
      { x: 200, y: 322, w: 80, h: 18 }, // little step
      { x: 480, y: 292, w: 100, h: 18 }, // floating stepping stone
    ],
    erasables: [
      { id: 'wall', x: 380, y: 160, w: 40, h: 220, cost: 35, eraseTime: 1.1 }, // needed
      { id: 'floor', x: 700, y: 380, w: 260, h: 24, cost: 30, eraseTime: 0.9 }, // needed
      { id: 'decoy-a', x: 600, y: 240, w: 110, h: 18, cost: 25, eraseTime: 0.7 }, // optional (ink to waste)
      { id: 'decoy-b', x: 90, y: 170, w: 110, h: 18, cost: 25, eraseTime: 0.7 }, // optional (ink to waste)
    ],
    exit: { x: 880, y: 500 },
    hints: [
      { x: 150, y: 250, text: 'A / D to walk\nSpace to jump', angle: -3, color: '#5b6070' },
      { x: 300, y: 120, text: 'hold click & scribble\nover the wall!', angle: -4, color: '#d8262f' },
      { x: 830, y: 330, text: 'the floor can go too…', angle: 2, color: '#d8262f' },
      { x: 600, y: 200, text: 'erasing costs ink!', angle: -2, color: '#5b6070' },
    ],
  },
  {
    name: 'Level 2 · Support Act',
    spawn: { x: 60, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 260, h: 160 }, // left ground
      { x: 260, y: 470, w: 440, h: 70 }, // pit floor (pit is 90px deep: jump-out-able)
      { x: 700, y: 380, w: 260, h: 160 }, // right ground
    ],
    erasables: [
      { id: 'bridge', x: 260, y: 380, w: 150, h: 20, cost: 25, eraseTime: 0.8 }, // the box's support
      { id: 'wall', x: 700, y: 240, w: 40, h: 140, cost: 35, eraseTime: 1.0 }, // blocks the far side
      { id: 'decoy-a', x: 100, y: 250, w: 110, h: 18, cost: 25, eraseTime: 0.7 },
      { id: 'decoy-b', x: 30, y: 150, w: 90, h: 18, cost: 25, eraseTime: 0.7 },
    ],
    boxes: [{ x: 350, y: 336, w: 44, h: 44 }],
    switches: [{ x: 340, y: 462, w: 70 }],
    exit: { x: 880, y: 380, locked: true },
    hints: [
      { x: 330, y: 280, text: 'erase what the box stands on!', angle: -2, color: '#d8262f' },
      { x: 520, y: 400, text: 'the plate needs\nsomething heavy', angle: 2, color: '#5b6070' },
      { x: 860, y: 215, text: 'locked until\nthe plate is pressed', angle: -2, color: '#5b6070' },
      { x: 150, y: 330, text: 'stuck? press R', angle: -3, color: '#5b6070' },
    ],
  },
];
