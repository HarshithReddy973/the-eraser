// Best results per level, kept in localStorage. Every access is wrapped so the game still
// works (just without saving) in private windows or when storage is blocked.
const KEY = 'eraser.save.v1';

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return d && typeof d === 'object' && d.levels ? d : { levels: {} };
  } catch {
    return { levels: {} };
  }
}

const Save = {
  /** { bestTime, bestInk } or null if the level hasn't been completed yet. */
  best(index) {
    return load().levels[index] ?? null;
  },

  /**
   * Record a finished run. "Best ink" means the MOST ink stability left over (a cleaner solve).
   * Returns the stored bests and whether this run set a new record for each.
   */
  submit(index, secs, ink) {
    const data = load();
    const prev = data.levels[index];
    const newTime = !prev || secs < prev.bestTime;
    const newInk = !prev || ink > prev.bestInk;
    const best = { bestTime: newTime ? secs : prev.bestTime, bestInk: newInk ? ink : prev.bestInk };
    data.levels[index] = best;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
    return { best, newTime, newInk };
  },

  reset() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};

export default Save;
