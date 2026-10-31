
// Coordinates are top-left (x, y) + size (w, h) in a 960x540 world.

//  hints     : handwritten notes drawn on the page

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
      { x: 150, y: 330, text: 'box stuck? press B', angle: -3, color: '#5b6070' },
    ],
  },
  {
    name: 'Level 3 · Ink Budget',
    spawn: { x: 50, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 200, h: 160 }, // start ledge
      { x: 200, y: 480, w: 400, h: 60 }, // floor of the spike pit (100px deep: jump-out-able)
      { x: 225, y: 400, w: 60, h: 16 }, // stepping stones across the pit
      { x: 345, y: 370, w: 60, h: 16 },
      { x: 505, y: 345, w: 60, h: 16 },
      { x: 600, y: 380, w: 360, h: 160 }, // far ledge with the door
    ],
    erasables: [
      { id: 'shelf', x: 415, y: 200, w: 80, h: 16, cost: 30, eraseTime: 0.9 }, // holds the box up
      { id: 'wall', x: 600, y: 200, w: 40, h: 180, cost: 45, eraseTime: 1.2 }, // blocks the far ledge
      { id: 'decoy-a', x: 760, y: 280, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
      { id: 'decoy-b', x: 60, y: 250, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
    ],
    boxes: [{ x: 433, y: 156, w: 44, h: 44 }],
    switches: [{ x: 425, y: 472, w: 60 }],
    spikes: [
      { x: 300, y: 480, w: 120 }, // pit, left patch
      { x: 490, y: 480, w: 72 }, // pit, right patch
      { x: 690, y: 380, w: 60 }, // on the far ledge, before the door
    ],
    exit: { x: 880, y: 380, locked: true },
    hints: [
      { x: 330, y: 150, text: 'drop the box on the plate', angle: -2, color: '#d8262f' },
      { x: 620, y: 150, text: 'spend ink wisely —\nyou can\'t erase everything', angle: 2, color: '#5b6070' },
      { x: 450, y: 440, text: 'spikes!', angle: -3, color: '#5b6070' },
    ],
  },
  {
    name: 'Level 4 · Step Up',
    spawn: { x: 50, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 960, h: 160 }, // one long floor
      { x: 560, y: 250, w: 400, h: 24 }, // high ledge with the door (130px up: too high to jump)
    ],
    erasables: [
      { id: 'wall', x: 300, y: 160, w: 40, h: 220, cost: 45, eraseTime: 1.2 }, // needed: lets you push the box across
      { id: 'decoy-a', x: 100, y: 190, w: 110, h: 18, cost: 30, eraseTime: 0.8 }, // optional (ink to waste)
      { id: 'decoy-b', x: 440, y: 140, w: 110, h: 18, cost: 30, eraseTime: 0.8 }, // optional (ink to waste)
    ],
    boxes: [{ x: 110, y: 336, w: 44, h: 44 }],
    exit: { x: 880, y: 250 },
    hints: [
      { x: 170, y: 290, text: 'a box can be a stair', angle: -3, color: '#5b6070' },
      { x: 320, y: 120, text: 'erase it, then push\nthe box through', angle: -3, color: '#d8262f' },
      { x: 700, y: 205, text: 'too high to jump…', angle: 2, color: '#5b6070' },
    ],
  },
  {
    name: 'Level 5 · Twin Plates',
    spawn: { x: 50, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 300, h: 160 }, // left ground
      { x: 300, y: 480, w: 100, h: 60 }, // pit floor (100px deep: jump-out-able)
      { x: 400, y: 380, w: 560, h: 160 }, // right ground
    ],
    erasables: [
      { id: 'shelf', x: 310, y: 200, w: 80, h: 16, cost: 30, eraseTime: 0.9 }, // holds box A over the pit
      { id: 'wall', x: 520, y: 160, w: 40, h: 220, cost: 40, eraseTime: 1.1 }, // blocks box B
      { id: 'decoy-a', x: 60, y: 230, w: 110, h: 18, cost: 30, eraseTime: 0.8 },
      { id: 'decoy-b', x: 700, y: 230, w: 110, h: 18, cost: 30, eraseTime: 0.8 },
    ],
    boxes: [
      { x: 328, y: 156, w: 44, h: 44 }, // box A: on the shelf, over plate A
      { x: 440, y: 336, w: 44, h: 44 }, // box B: on the floor, push it onto plate B
    ],
    switches: [
      { x: 320, y: 472, w: 60 }, // plate A (in the pit)
      { x: 700, y: 372, w: 70 }, // plate B (on the floor)
    ],
    spikes: [{ x: 800, y: 380, w: 60 }],
    exit: { x: 900, y: 380, locked: true },
    hints: [
      { x: 160, y: 150, text: 'two plates,\ntwo boxes', angle: -3, color: '#5b6070' },
      { x: 350, y: 140, text: 'drop this one…', angle: -2, color: '#d8262f' },
      { x: 600, y: 120, text: '…push that one', angle: 2, color: '#d8262f' },
    ],
  },
  {
    name: 'Level 6 · Step & Press',
    spawn: { x: 50, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 960, h: 160 }, // one long floor
      { x: 640, y: 250, w: 320, h: 24 }, // high ledge with the door (too high to jump)
      { x: 100, y: 300, w: 120, h: 18 }, // little ink table that holds the plate
    ],
    erasables: [
      { id: 'shelf', x: 120, y: 150, w: 80, h: 16, cost: 30, eraseTime: 0.9 }, // holds box 2 over the plate
      { id: 'wall', x: 520, y: 160, w: 40, h: 220, cost: 40, eraseTime: 1.1 }, // blocks box 1
      { id: 'decoy-a', x: 300, y: 170, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
      { id: 'decoy-b', x: 780, y: 140, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
    ],
    boxes: [
      { x: 138, y: 106, w: 44, h: 44 }, // box 2: on the shelf, over the plate
      { x: 400, y: 336, w: 44, h: 44 }, // box 1: your staircase
    ],
    switches: [{ x: 130, y: 292, w: 60 }],
    spikes: [{ x: 760, y: 250, w: 50 }], // on the ledge, before the door
    exit: { x: 890, y: 250, locked: true },
    hints: [
      { x: 330, y: 80, text: 'unlock the door…', angle: -2, color: '#d8262f' },
      { x: 590, y: 120, text: '…then climb to it', angle: 2, color: '#d8262f' },
      { x: 280, y: 300, text: 'boxes can be stairs', angle: -3, color: '#5b6070' },
    ],
  },
  {
    name: 'Level 7 · Rewrite the Page',
    spawn: { x: 50, y: 330 },
    stability: 100,
    platforms: [
      { x: 0, y: 380, w: 200, h: 160 }, // start ledge
      { x: 200, y: 480, w: 380, h: 60 }, // floor of the spike pit (100px deep: jump-out-able)
      { x: 225, y: 400, w: 60, h: 16 }, // stepping stones across the pit
      { x: 345, y: 365, w: 60, h: 16 },
      { x: 485, y: 330, w: 60, h: 16 },
      { x: 580, y: 380, w: 380, h: 160 }, // far ground with the door
    ],
    erasables: [
      { id: 'shelf', x: 405, y: 190, w: 80, h: 16, cost: 35, eraseTime: 1.0 }, // holds box A over plate A
      { id: 'wall', x: 580, y: 180, w: 40, h: 200, cost: 50, eraseTime: 1.3 }, // blocks the far ground
      { id: 'decoy-a', x: 60, y: 250, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
      { id: 'decoy-b', x: 740, y: 200, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
      { id: 'decoy-c', x: 230, y: 170, w: 100, h: 18, cost: 30, eraseTime: 0.8 },
    ],
    boxes: [
      { x: 423, y: 146, w: 44, h: 44 }, // box A: on the shelf, over plate A
      { x: 650, y: 336, w: 44, h: 44 }, // box B: on the far ground
    ],
    switches: [
      { x: 415, y: 472, w: 60 }, // plate A (pit floor, between the stones)
      { x: 740, y: 372, w: 70 }, // plate B (far ground)
    ],
    spikes: [
      { x: 305, y: 480, w: 100 }, // pit, left patch
      { x: 490, y: 480, w: 80 }, // pit, right patch
      { x: 830, y: 380, w: 50 }, // before the door
    ],
    exit: { x: 925, y: 380, locked: true },
    hints: [
      { x: 330, y: 120, text: 'everything you\nhave learned…', angle: -2, color: '#5b6070' },
      { x: 700, y: 140, text: 'ink is tight —\nplan before you scribble', angle: 2, color: '#d8262f' },
    ],
  },
];