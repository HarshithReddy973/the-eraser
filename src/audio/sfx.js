// Tiny WebAudio synth so the game needs no audio files.
// Browsers block audio until a user gesture, so call sfx.unlock() on first click/key.
let ctx = null;
let master = null;
let muted = false;
try { muted = localStorage.getItem('eraser.muted') === '1'; } catch { /* storage unavailable */ }

function ac() {
  try {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, { type = 'sine', vol = 0.07, slide = 0, delay = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur, { vol = 0.06, freq = 2600 } = {}) {
  const a = ac();
  if (!a) return;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start();
}

export const sfx = {
  unlock: ac,
  get muted() { return muted; },
  /** Returns the new muted state. */
  toggleMute() {
    muted = !muted;
    try { localStorage.setItem('eraser.muted', muted ? '1' : '0'); } catch { /* ignore */ }
    if (master) master.gain.value = muted ? 0 : 1;
    return muted;
  },
  jump: () => tone(300, 0.14, { type: 'triangle', slide: 260, vol: 0.05 }),
  land: () => { tone(130, 0.1, { slide: -60, vol: 0.06 }); noise(0.06, { vol: 0.03, freq: 600 }); },
  thud: () => { tone(90, 0.22, { slide: -40, vol: 0.12 }); noise(0.12, { vol: 0.06, freq: 300 }); },
  scratch: () => noise(0.07, { vol: 0.05, freq: 2200 + Math.random() * 1200 }),
  pop: () => { tone(520, 0.18, { type: 'triangle', slide: -380, vol: 0.08 }); noise(0.15, { vol: 0.05, freq: 1400 }); },
  deny: () => tone(150, 0.12, { type: 'square', slide: -40, vol: 0.04 }),
  click: () => tone(700, 0.08, { type: 'square', slide: 200, vol: 0.04 }),
  hurt: () => { tone(260, 0.22, { type: 'sawtooth', slide: -180, vol: 0.05 }); noise(0.12, { vol: 0.05, freq: 900 }); },
  open: () => [660, 880, 1175].forEach((f, i) => tone(f, 0.2, { type: 'triangle', delay: i * 0.07, vol: 0.06 })),
  beat: () => { tone(70, 0.12, { vol: 0.12 }); tone(60, 0.14, { vol: 0.09, delay: 0.17 }); },
  warn: (level) => (level >= 2
    ? tone(330, 0.3, { type: 'sawtooth', slide: -140, vol: 0.05 })
    : tone(440, 0.16, { type: 'triangle', slide: -60, vol: 0.06 })),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.1, vol: 0.07 })),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, { type: 'sawtooth', delay: i * 0.14, vol: 0.04 })),
};
