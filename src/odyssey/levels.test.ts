import { describe, it, expect } from 'vitest';
import { BIOME_LEVEL, enemyLevel, levelScale, xpModifier } from './levels';
import { BIOME_LIST, generateWorld, W, T, SOLID } from './world';
import { FURNITURE, HOME_LEVELS, canPlace, freshHome, homeRect } from './home';
import { BUILDINGS, prepareExploration, doorOf } from './exploration';
import { ITEMS } from './data';
describe('Fixed enemy levels', () => {
  it('every biome has a fixed level, monsters add a fixed bonus', () => {
    for (const b of BIOME_LIST) expect(BIOME_LEVEL[b]).toBeGreaterThan(0);
    expect(enemyLevel('plains', 'mushroom')).toBe(1);
    expect(enemyLevel('cave', 'shade')).toBe(23);
    expect(enemyLevel('obsidian', 'golem')).toBe(36);
  });
  it('stronger at higher level; out-levelled monsters give little XP', () => {
    expect(levelScale(20).hp).toBeGreaterThan(levelScale(5).hp * 2);
    expect(xpModifier(30, 1)).toBe(0.1);
    expect(xpModifier(5, 10)).toBeCloseTo(1.5);
  });
});
describe('Player home', () => {
  it('grows with each renovation and furniture uses real materials', () => {
    for (let l = 2; l <= HOME_LEVELS.length; l++) expect(homeRect(l).width).toBeGreaterThan(homeRect(l - 1).width);
    for (const d of [...Object.values(FURNITURE), ...HOME_LEVELS]) for (const id of Object.keys(d.cost)) expect(ITEMS[id]).toBeDefined();
  });
  it('places furniture only on free floor and respects level requirements', () => {
    const h = freshHome(), r = homeRect(1);
    const bed = { kind: 'bed' as const, x: r.left + 1, y: r.top + 2 };
    expect(canPlace(h, bed)).toBe(true); h.furniture.push(bed);
    expect(canPlace(h, { kind: 'chair', x: r.left + 1, y: r.top + 2 })).toBe(false);
    expect(canPlace(h, { kind: 'chair', x: r.left, y: r.top + 3 })).toBe(false);
    expect(canPlace(h, { kind: 'piano', x: r.left + 5, y: r.top + 3 })).toBe(false);
  });
});
describe('Greater Potos', () => {
  it('has many more enterable buildings with doors', () => {
    expect(BUILDINGS.length).toBeGreaterThanOrEqual(23);
    const w = generateWorld(); prepareExploration(w);
    for (const b of BUILDINGS) { const d = doorOf(b); expect(w.tiles[d.ty * W + d.tx]).toBe(T.DOOR); expect(SOLID.has(w.tiles[(d.ty + 1) * W + d.tx])).toBe(false); }
  });
});
