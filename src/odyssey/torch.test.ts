import { describe, it, expect } from 'vitest';
import { ITEMS, SHOP } from './data';
import { CARPENTRY_RECIPES } from './settlement';

describe('Tocha', () => {
  it('é vendida na loja', () => {
    expect(SHOP).toContain('torch');
    expect(ITEMS['torch']?.price).toBeGreaterThan(0);
  });
  it('também pode ser feita na carpintaria com 2 madeira + 1 carvão', () => {
    const r = CARPENTRY_RECIPES.find((x) => x.out === 'torch');
    expect(r?.cost).toEqual({ wood: 2, coal: 1 });
  });
});
