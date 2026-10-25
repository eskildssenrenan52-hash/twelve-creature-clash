import { describe, it, expect } from 'vitest';
import { generateWorld, W, H, T } from './world';
import { BIOME_LAYOUT } from './landmass';
import { FRONTIER_KEYS } from './frontier';
describe('Irregular world shape', () => {
  it('is not a rectangle: far corners are ocean and edges vary', () => {
    const w = generateWorld();
    expect(w.tiles[(H - 5) * W + (W - 5)]).toBe(T.WATER);
    const firstLand = (y: number) => { for (let x = 0; x < W; x++) if (w.tiles[y * W + x] !== T.WATER) return x; return W; };
    const xs = [800, 1200, 1600, 2000].map(firstLand);
    expect(new Set(xs).size).toBeGreaterThan(1);
  });
  it('gives every frontier biome a wall layout', () => {
    for (const k of FRONTIER_KEYS) expect(BIOME_LAYOUT[k]).toBeDefined();
    expect(new Set(Object.values(BIOME_LAYOUT).map(l => l.layout)).size).toBe(7);
  });
});
