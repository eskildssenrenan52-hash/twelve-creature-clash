import { describe, expect, it } from 'vitest';
import { BEASTS, CHRONICLES, chaptersUnlocked, beastKey, pickBeast, floorBeasts } from './bestiary';

describe('Bestiário do Abismo', () => {
  it('tem 100 criaturas com nomes únicos, uma por andar', () => {
    expect(BEASTS).toHaveLength(100);
    expect(new Set(BEASTS.map((b) => b.name)).size).toBe(100);
    BEASTS.forEach((b, i) => expect(b.floor).toBe(i + 1));
  });
  it('cada estrato usa 10 formas de corpo diferentes', () => {
    for (let s = 0; s < 10; s++) expect(new Set(BEASTS.filter((b) => b.stratum === s).map((b) => b.arch)).size).toBe(10);
  });
  it('um andar só traz criaturas do próprio estrato até aquele andar', () => {
    expect(floorBeasts(23)).toEqual([20, 21, 22]);
    for (let r = 0; r < 1; r += 0.05) { const id = pickBeast(57, r); expect(id).toBeGreaterThanOrEqual(50); expect(id).toBeLessThanOrEqual(56); }
  });
  it('10 crônicas de 5 capítulos; um capítulo a cada 2 criaturas', () => {
    expect(CHRONICLES).toHaveLength(10);
    CHRONICLES.forEach((c) => expect(c.chapters).toHaveLength(5));
    expect(chaptersUnlocked(new Set([beastKey(30), beastKey(31), beastKey(32)]), 3)).toBe(1);
  });
});
