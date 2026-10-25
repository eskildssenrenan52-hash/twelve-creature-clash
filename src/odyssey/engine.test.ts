import { describe, it, expect, vi } from 'vitest';
import { Game } from './engine';
import { QUESTS, BOSSES } from './data';
import { actChainQuests, ALL_ECO_BOSSES } from './story';
import { FRONTIER_GATES, FRONTIER } from './frontier';
import { TS } from './world';

// Canvas 2D falso: qualquer método é um no-op, gradientes aceitam addColorStop.
function fakeCtx(canvas: unknown) {
  const store: Record<string | symbol, unknown> = { canvas };
  const noop = () => undefined;
  return new Proxy(store, {
    get: (t, k) => (k in t ? t[k] : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : k === 'createImageData' ? (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : k === 'measureText' ? () => ({ width: 8 }) : k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : noop),
    set: (t, k, v) => { t[k] = v; return true; },
  });
}
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) { return fakeCtx(this) as never; });
const make = (fresh = true) => { if (fresh) localStorage.clear(); const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const g = new Game(cv); g.started = true; return g; };

describe('Engine — campanha integrada', { timeout: 90000 }, () => {
  const g = make();
  it('só libera os Vigias depois de salvar a Árvore (Ato I) e respeita requiresAll entre atos', () => {
    expect(g.availableQuest('vigia_sunflower')).toBeUndefined();
    g.questStatus['m6'] = 'done';
    expect(g.availableQuest('vigia_sunflower')?.id).toBe('sunflower_1');
    expect(g.availableQuest('vigia_moonwood')).toBeUndefined();
    for (const id of actChainQuests(2)) g.questStatus[id] = 'done';
    expect(g.availableQuest('vigia_moonwood')?.id).toBe('moonwood_1');
    expect(g.availableQuest('vigia_prism')).toBeUndefined();
  });
  it('cenas: enfileira, avança, não repete e sobrevive a save/load', () => {
    g.fireBeats('new');
    expect(g.cutscene?.beat.id).toBe('prologue');
    const n = g.cutscene!.beat.lines.length;
    for (let i = 0; i < n; i++) g.advanceCutscene();
    expect(g.cutscene).toBeNull();
    g.fireBeats('new');
    expect(g.cutscene).toBeNull();
    g.save();
    const h = make(false);
    h.load();
    expect(h.seenBeats.has('prologue')).toBe(true);
  });
  it('concluir a cadeia de um ato dispara a cena do ato uma única vez', () => {
    const k = make(); k.questStatus['m6'] = 'done';
    const chain = actChainQuests(2), last = QUESTS.find(q => q.id === chain[chain.length - 1])!;
    for (const id of chain.slice(0, -1)) k.questStatus[id] = 'done';
    k.questStatus[last.id] = 'active'; k.bossesDone.add(last.goal.kind === 'boss' ? last.goal.target : '');
    const npc = { id: last.giver, name: 'x', title: 'y', tx: 0, ty: 0, pal: { skin: '', hair: '', body: '', legs: '' }, lines: [] };
    k.completeQuest(last, npc);
    const ids = [k.cutscene?.beat.id, ...k.beatQueue.map(b => b.id)];
    expect(ids).toContain('act2_end');
    k.afterQuest(last);
    expect([k.cutscene?.beat.id, ...k.beatQueue.map(b => b.id)].filter(x => x === 'act2_end').length).toBe(1);
  });
  it('vencer um chefe de Eco entrega Fragmentos de Eco e dispara a cena do Eco', () => {
    const k = make(), boss = k.enemies.find(e => e.boss?.def.id === 'sunflower_boss')!;
    expect(boss).toBeDefined(); expect(boss.level).toBeGreaterThan(10);
    k.killEnemy(boss);
    expect(k.bossesDone.has('sunflower_boss')).toBe(true);
    expect(k.count('eco_shard')).toBeGreaterThanOrEqual(3);
    expect(k.cutscene?.beat.id).toBe('eco_sunflower');
  });
  it('Ciclo do Eco: só após o epílogo, reinicia a campanha, reergue chefes mais fortes e persiste', () => {
    const k = make();
    expect(k.startCycle()).toBe(false);
    const before = k.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!.maxhp;
    k.questStatus['f4'] = 'done'; k.questStatus['m6'] = 'done'; k.questStatus['sunflower_1'] = 'done';
    for (const id of ALL_ECO_BOSSES) k.bossesDone.add(id);
    expect(k.startCycle()).toBe(true);
    expect(k.cycle).toBe(1);
    expect(k.questStatus['f4']).toBeUndefined(); expect(k.questStatus['sunflower_1']).toBeUndefined(); expect(k.questStatus['m6']).toBe('done');
    const boss = k.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!;
    expect(boss.alive).toBe(true); expect(boss.maxhp).toBeGreaterThan(before);
    expect(k.canStartCycle()).toBe(false);
    k.save(); const h = make(false); h.load(); expect(h.cycle).toBe(1);
    expect(h.enemies.find(e => e.boss?.def.id === 'obsidian_boss')!.maxhp).toBe(boss.maxhp);
  });
  it('inimigos de fronteira longe do centro ficam mais fortes que os das regiões iniciais', () => {
    const k = make(), near = FRONTIER_GATES[0];
    k.p.x = near.tx * TS; k.p.y = (near.ty + 2) * TS; k.populateFrontier();
    const nearMax = Math.max(...k.enemies.filter(e => !e.boss && e.hx > 320 * TS).map(e => e.level));
    k.frontierSector = ''; k.enemies = []; k.p.x = 2400 * TS; k.p.y = 2000 * TS; k.populateFrontier();
    const far = k.enemies.filter(e => !e.boss);
    expect(far.length).toBeGreaterThan(0);
    expect(Math.min(...far.map(e => e.level))).toBeGreaterThan(nearMax);
  });
  it('renderiza todos os biomas (grading, bloom, partículas, raios) sem erro', () => {
    const k = make();
    for (const b of ['plains', 'forest', 'cave', 'mountain', 'desert', 'volcanic', ...Object.keys(FRONTIER)] as const) {
      k.biome = b as never; k.time = 0.32; k.update(0.016); k.render(); k.time = 0.0; k.render();
    }
    k.biome = 'thunder' as never; k.flashT = 0; k.render(); expect(k.flash).toBeGreaterThan(0);
    k.interior = null; k.cutscene = { beat: { id: 't', trigger: 'new', title: 't', lines: ['a'] }, i: 0 }; k.update(0.016);
    expect(BOSSES.length).toBeGreaterThan(20);
  });
});
