// Deterministic randomness for the simulator.

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash32(...xs: number[]) {
  let h = 0x9e3779b9;
  for (const x of xs) {
    h = Math.imul(h ^ (x | 0), 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
  }
  return h >>> 0;
}

/**
 * Same inputs → same uniform. Outcomes are keyed by (persona, week, cell), so every
 * policy that plans the same cell in the same week sees the same coin flip
 * (common random numbers → fair, low-noise comparisons).
 */
export const hashUniform = (...xs: number[]) => (hash32(...xs) + 0.5) / 4294967296;

export function normal(rng: () => number) {
  const u = Math.max(rng(), 1e-12), v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
