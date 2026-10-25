import { describe, expect, it } from 'vitest';
import { FOES, FOE_KINDS } from './foes';
import { BIOME_ENEMIES, ENEMIES, ITEMS } from './data';
import { MONSTER_LEVEL } from './levels';

describe('novas criaturas', () => {
  it('são 12 espécies, cada uma com nome e traço próprios', () => {
    expect(FOE_KINDS.length).toBe(12);
    expect(new Set(FOE_KINDS.map((k) => FOES[k].name)).size).toBe(12);
  });
  it('entram no catálogo de inimigos, nos níveis e em pelo menos um bioma', () => {
    for (const k of FOE_KINDS) {
      expect(ENEMIES[k].name).toBe(FOES[k].name);
      expect(MONSTER_LEVEL[k]).toBe(FOES[k].level);
      expect(Object.values(BIOME_ENEMIES).some((l) => l.includes(k))).toBe(true);
      for (const [item] of FOES[k].drops) expect(ITEMS[item]).toBeDefined();
    }
  });
  it('mantém todos os inimigos originais nos biomas', () => {
    expect(BIOME_ENEMIES.plains.slice(0, 5)).toEqual(['mushroom', 'mushroom', 'goblin', 'slime', 'rat']);
  });
});
