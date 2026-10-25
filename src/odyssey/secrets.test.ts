import { describe, expect, it } from 'vitest';
import { SECRETS, REALMS, ALL_REALMS, REALM_NEED, stepOf, stepKey, realmOpen, chainDone } from './secrets';
import { ITEMS } from './data';

describe('Segredos do Cântico Oculto', () => {
  it('tem 350 segredos, cada um com 3 a 6 etapas', () => {
    expect(SECRETS.length).toBe(350);
    for (const s of SECRETS) { expect(s.steps.length).toBeGreaterThanOrEqual(3); expect(s.steps.length).toBeLessThanOrEqual(6); }
  });
  it('tem 14 reinos ocultos mais o Coração', () => { expect(REALMS.length).toBe(14); expect(ALL_REALMS.length).toBe(15); });
  it('a primeira etapa nunca é no Abismo e as oferendas usam itens reais', () => {
    for (const s of SECRETS) {
      expect(s.steps[0]!.kind).not.toBe('depth');
      for (const st of s.steps) if (st.kind === 'offer') expect(ITEMS[st.item!]).toBeTruthy();
      expect(ITEMS[s.reward.item]).toBeTruthy();
    }
  });
  it('o portal só abre com 8 segredos do círculo concluídos', () => {
    const set = new Set<string>(), has = (k: string) => set.has(k), none = () => false;
    const circle0 = SECRETS.filter((s) => s.circle === 0);
    for (const c of circle0.slice(0, REALM_NEED - 1)) c.steps.forEach((_, i) => set.add(stepKey(c, i)));
    expect(realmOpen(REALMS[0]!, has, none)).toBe(false);
    const c = circle0[REALM_NEED - 1]!; c.steps.forEach((_, i) => set.add(stepKey(c, i)));
    expect(chainDone(c, has)).toBe(true);
    expect(realmOpen(REALMS[0]!, has, none)).toBe(true);
  });
  it('etapas precisam ser feitas em ordem', () => {
    const c = SECRETS[0]!, set = new Set([stepKey(c, 1)]);
    expect(stepOf(c, (k) => set.has(k))).toBe(0);
  });
});
