import { describe, it, expect } from 'vitest';
import { BOSSES, ENEMIES, ITEMS, NPCS, QUESTS, RECIPES, type QuestDef } from './data';
import { FRONTIER_GATES, FRONTIER_KEYS } from './frontier';
import { generateWorld, SOLID, TS, W, H, T } from './world';
import { ACTS, BEATS, ECOS, STORY_BOSS_LOOK, STORY_QUESTS, VAEL_ARENA, actChainQuests, beatsFor, cycleBonus, depthBonus, endgameDrop } from './story';

const questIds = new Set(QUESTS.map(q => q.id));
const npcIds = new Set(NPCS.map(n => n.id));
const bossIds = new Set(BOSSES.map(b => b.id));

describe('Crônica do Cântico Partido — dados', () => {
  it('cobre os 17 Ecos, um por bioma de fronteira, distribuídos nos atos II–V', () => {
    expect(ECOS.length).toBe(17);
    expect(new Set(ECOS.map(e => e.biome))).toEqual(new Set(FRONTIER_KEYS));
    expect(ACTS.flatMap(a => a.biomes).length).toBe(17);
    for (const b of FRONTIER_KEYS) expect(bossIds.has(`${b}_boss`)).toBe(true);
    expect(bossIds.has('vael')).toBe(true);
  });
  it('tem ids únicos e referências válidas (givers, requisitos, chefes, itens, inimigos)', () => {
    expect(questIds.size).toBe(QUESTS.length);
    for (const q of QUESTS) {
      expect(npcIds.has(q.giver), `giver de ${q.id}`).toBe(true);
      if (q.requires) expect(questIds.has(q.requires), `requires de ${q.id}`).toBe(true);
      for (const r of q.requiresAll ?? []) expect(questIds.has(r), `requiresAll de ${q.id}`).toBe(true);
      if (q.goal.kind === 'boss') expect(bossIds.has(q.goal.target) || q.goal.target.startsWith('abyss_'), `boss de ${q.id}`).toBe(true);
      if (q.goal.kind === 'collect') expect(ITEMS[q.goal.item], `item de ${q.id}`).toBeDefined();
      if (q.goal.kind === 'kill') expect(ENEMIES[q.goal.target], `inimigo de ${q.id}`).toBeDefined();
      for (const i of q.reward.items ?? []) expect(ITEMS[i], `recompensa de ${q.id}`).toBeDefined();
    }
    for (const b of BOSSES) for (const i of b.reward) expect(ITEMS[i], `recompensa de ${b.id}`).toBeDefined();
    for (const r of RECIPES) { expect(ITEMS[r.out]).toBeDefined(); for (const id of Object.keys(r.cost)) expect(ITEMS[id], `${r.out} usa ${id}`).toBeDefined(); }
    for (const b of BOSSES) expect(STORY_BOSS_LOOK[b.id] ?? true).toBeTruthy();
    for (const b of BOSSES.filter(b => b.id.endsWith('_boss') || b.id === 'vael')) expect(STORY_BOSS_LOOK[b.id]).toBeDefined();
  });
  it('é possível concluir a campanha inteira a partir do zero, na ordem dos requisitos', () => {
    const done = new Set<string>();
    const open = (q: QuestDef) => (!q.requires || done.has(q.requires)) && (q.requiresAll ?? []).every(r => done.has(r));
    for (let guard = 0; guard < 500; guard++) {
      const next = QUESTS.find(q => !done.has(q.id) && open(q));
      if (!next) break;
      done.add(next.id);
    }
    expect(done.size).toBe(QUESTS.length);
    expect(done.has('f4')).toBe(true);
  });
  it('tem mais de 70 missões novas e uma cadeia principal por Eco', () => {
    expect(STORY_QUESTS.length).toBeGreaterThanOrEqual(72);
    for (const e of ECOS) { expect(questIds.has(`${e.biome}_1`) && questIds.has(`${e.biome}_2`) && questIds.has(`${e.biome}_3`)).toBe(true); }
    expect(actChainQuests(2).length).toBe(18);
  });
  it('liga cada cena a um gatilho existente', () => {
    for (const b of BEATS) {
      const [kind, id] = b.trigger.split(':');
      if (kind === 'boss') expect(bossIds.has(id), b.id).toBe(true);
      else if (kind === 'quest') expect(questIds.has(id), b.id).toBe(true);
      else if (kind === 'act') expect([2, 3, 4, 5]).toContain(Number(id));
      else expect(b.trigger).toBe('new');
      expect(b.lines.length).toBeGreaterThan(2);
    }
    for (const a of [2, 3, 4, 5]) expect(beatsFor(`act:${a}`).length).toBe(1);
    expect(beatsFor('new').length).toBe(1);
  });
  it('escala a dificuldade com a profundidade e com os ciclos', () => {
    expect(depthBonus(500, 300)).toBe(0);
    expect(depthBonus(500, 3000)).toBeGreaterThan(depthBonus(500, 900));
    expect(cycleBonus(2)).toBeGreaterThan(cycleBonus(1));
    expect(endgameDrop(1)).toBeNull();
  });
});

describe('Crônica do Cântico Partido — mundo gerado', () => {
  const world = generateWorld();
  const passable = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !SOLID.has(world.tiles[y * W + x]);
  /** Busca em largura numa janela ao redor do portal: prova que dá para chegar a pé. */
  function reachable(fromX: number, fromY: number, toX: number, toY: number, win = 48) {
    const seen = new Set<number>([fromY * W + fromX]), q: [number, number][] = [[fromX, fromY]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      if (Math.abs(x - toX) <= 1 && Math.abs(y - toY) <= 1) return true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * W + nx;
        if (seen.has(k) || Math.abs(nx - fromX) > win || Math.abs(ny - fromY) > win || !passable(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return false;
  }
  it('coloca cada chefe de Eco e cada Vigia em chão livre, alcançável a pé a partir do portal', () => {
    for (const g of FRONTIER_GATES) {
      const boss = BOSSES.find(b => b.id === `${g.biome}_boss`)!, npc = NPCS.find(n => n.id === `vigia_${g.biome}`)!;
      expect(passable(boss.tx, boss.ty), `chefe ${g.biome}`).toBe(true);
      expect(passable(npc.tx, npc.ty), `vigia ${g.biome}`).toBe(true);
      expect(world.tiles[boss.ty * W + boss.tx]).not.toBe(T.WATER);
      expect(reachable(g.tx, g.ty + 2, boss.tx, boss.ty), `trilha até ${boss.name}`).toBe(true);
      expect(reachable(g.tx, g.ty + 2, npc.tx, npc.ty), `trilha até ${npc.name}`).toBe(true);
    }
  });
  it('controle negativo: o teste de alcance detecta um chefe cercado por água', () => {
    const g = FRONTIER_GATES[0], b = BOSSES.find(x => x.id === `${g.biome}_boss`)!, saved: [number, number][] = [];
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
      if (Math.max(Math.abs(x), Math.abs(y)) < 3) continue;
      const i = (b.ty + y) * W + b.tx + x; saved.push([i, world.tiles[i]]); world.tiles[i] = T.WATER;
    }
    expect(reachable(g.tx, g.ty + 2, b.tx, b.ty)).toBe(false);
    for (const [i, t] of saved) world.tiles[i] = t;
    expect(reachable(g.tx, g.ty + 2, b.tx, b.ty)).toBe(true);
  });
  it('mantém Vael numa arena livre e alcançável a partir do portal da Obsidiana', () => {
    const g = FRONTIER_GATES.find(x => x.biome === 'obsidian')!, v = BOSSES.find(b => b.id === 'vael')!;
    expect([v.tx, v.ty]).toEqual([VAEL_ARENA.tx, VAEL_ARENA.ty]);
    expect(passable(v.tx, v.ty)).toBe(true);
    expect(reachable(g.tx, g.ty + 2, v.tx, v.ty)).toBe(true);
    expect(Math.hypot(v.tx * TS - g.tx * TS, v.ty * TS - g.ty * TS)).toBeGreaterThan(160);
  });
});

import { CHRONICLE_BEATS } from './chronicle';
describe('crônicas extras', () => {
  it('cada Eco ganha fragmento, rumor e diário de Vael, com ids únicos', () => {
    for (const e of ECOS) for (const p of ['frag', 'rumor', 'diario']) expect(CHRONICLE_BEATS.some(b => b.id === `${p}_${e.biome}`)).toBe(true);
    expect(new Set(BEATS.map(b => b.id)).size).toBe(BEATS.length);
  });
});
