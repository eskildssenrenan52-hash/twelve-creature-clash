import type { Biome, EnemyKind } from './data';
import { FOES, FOE_KINDS } from './foes';

/** Fixed recommended level of every biome (no randomness). */
export const BIOME_LEVEL: Record<Biome, number> = {
  plains: 1, meadow: 2, forest: 4, autumn: 5, mushroom: 6, coast: 7, desert: 9, swamp: 10, jungle: 12,
  mountain: 14, ruins: 16, cave: 18, volcanic: 20,
  sunflower: 8, sakura: 10, coral: 11, lotus: 12, lavender: 13, oasis: 14, moonwood: 16, bamboo: 17,
  mangrove: 18, amber: 20, crimson: 21, prism: 23, aurora: 24, spores: 25, marble: 27, thunder: 29, obsidian: 32,
};
/** Fixed level bonus of each monster species on top of its biome level. */
export const MONSTER_LEVEL: Record<EnemyKind, number> = {
  mushroom: 0, goblin: 1, sporeling: 2, scorpion: 3, wolf: 3, golem: 4, shade: 5,
  slime: 0, rat: 0, crow: 1, frog: 1, pixie: 2, jelly: 2, spider: 2, boar: 2, crab: 2, bat: 2,
  wisp: 3, serpent: 3, imp: 3, sprite: 3, beetle: 3, skeleton: 4, mummy: 4, salamander: 4,
  treant: 5, gargoyle: 5, wraith: 6, mimic: 6,
  ...Object.fromEntries(FOE_KINDS.map((k) => [k, FOES[k].level])),
} as Record<EnemyKind, number>;

export const enemyLevel = (biome: Biome, kind: EnemyKind) => BIOME_LEVEL[biome] + MONSTER_LEVEL[kind];

/** Stat multipliers grow with level; reward shrinks when the hero out-levels the monster. */
export function levelScale(level: number) {
  const l = level - 1;
  return { hp: 1 + l * 0.17 + l * l * 0.004, atk: 1 + l * 0.12, def: Math.floor(level / 3), reward: 1 + l * 0.15 };
}
export function xpModifier(heroLevel: number, enemyLevel: number) {
  const gap = enemyLevel - heroLevel;
  if (gap >= 0) return 1 + Math.min(gap, 6) * 0.1;
  return Math.max(0.1, 1 + gap * 0.15);
}
