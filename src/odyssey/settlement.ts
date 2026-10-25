import type { Game } from './engine';
import { ITEMS, type Recipe } from './data';
import { TS, W, H, T, SOLID, tileAt, hash } from './world';
import { BUILDINGS, doorOf, type Building } from './exploration';
import { freshHome, FURNITURE, HOME_LEVELS, canPlace, canUpgrade, createHomeInterior, pieceAt, type HomeState } from './home';

export type Tool = 'explore' | 'mine' | 'axe' | 'till' | 'seed' | 'water' | 'build' | 'furnish' | 'unfurnish';
export type StructureKind = 'home' | 'bench' | 'forge' | 'fence' | 'lamp';
export type CropKind = 'carrot' | 'wheat' | 'moonflower';
export interface Plot { x: number; y: number; crop: CropKind | null; growth: number; watered: boolean }
export interface Structure { x: number; y: number; kind: StructureKind }
export interface SettlementState { plots: Plot[]; structures: Structure[]; mining: number; harvests: number; carpentry: number; home: HomeState }
export const freshSettlement = (): SettlementState => ({ plots: [], structures: [], mining: 0, harvests: 0, carpentry: 0, home: freshHome() });
export const isPlayerHome = (b: Building | null) => !!b && b.id.startsWith('player-');
/** Spend materials to enlarge and improve the player's home. */
export function upgradeHome(g: Game): boolean {
  const h = g.settlement.home;
  if (!canUpgrade(h)) { g.toast('Sua casa já é uma mansão completa!'); return false; }
  const next = HOME_LEVELS[h.level];
  if (!Object.entries(next.cost).every(([id, n]) => g.count(id) >= n)) { g.toast('Faltam materiais para a reforma.'); return false; }
  Object.entries(next.cost).forEach(([id, n]) => g.removeItem(id, n));
  h.level++;
  if (isPlayerHome(g.interior)) g.world = createHomeInterior(h);
  g.toast(`Reforma concluída: ${next.name}!`, '#f6d18b'); g.audio.sfx('level'); g.save(); return true;
}
export const CROPS: Record<CropKind, { name: string; seed: string; item: string; seconds: number }> = {
  carrot: { name: 'Cenoura', seed: 'carrot_seed', item: 'carrot', seconds: 40 },
  wheat: { name: 'Trigo', seed: 'wheat_seed', item: 'wheat', seconds: 65 },
  moonflower: { name: 'Flor da Lua', seed: 'moon_seed', item: 'moonflower', seconds: 90 },
};
export const STRUCTURES: Record<StructureKind, { name: string; cost: Record<string, number>; w: number; h: number }> = {
  home: { name: 'Cabana do viajante', cost: { plank: 8, stone: 12 }, w: 5, h: 4 },
  bench: { name: 'Bancada de carpintaria', cost: { wood: 6, stone: 2 }, w: 2, h: 1 },
  forge: { name: 'Forja de pedra', cost: { stone: 8, iron_ingot: 2 }, w: 2, h: 2 },
  fence: { name: 'Cerca de madeira', cost: { plank: 1 }, w: 1, h: 1 },
  lamp: { name: 'Lanterna de Mana', cost: { wood: 2, mana_shard: 1 }, w: 1, h: 1 },
};
export function growPlots(state: SettlementState, dt: number, raining: boolean) {
  for (const p of state.plots) {
    if (!p.crop) continue;
    if (raining) p.watered = true;
    if (p.watered) p.growth = Math.min(1, p.growth + dt / CROPS[p.crop].seconds);
  }
}
export function homeBuilding(s: Structure): Building {
  return { id: `player-${s.x}-${s.y}`, name: 'Minha casa', x: s.x, y: s.y, w: 5, h: 4, kind: 'inn', note: 'Um lar entre as raízes de Mana.' };
}
export function applyStructures(g: Game) {
  for (const s of g.settlement.structures) {
    const def = STRUCTURES[s.kind];
    g.overworld.nodes = g.overworld.nodes.filter(n => !(n.tx>=s.x&&n.tx<s.x+def.w&&n.ty>=s.y&&n.ty<s.y+def.h));
    for (let y = 0; y < def.h; y++) for (let x = 0; x < def.w; x++) {
      g.overworld.tiles[(s.y + y) * W + s.x + x] = s.kind === 'home' ? (y < 2 ? T.ROOF : T.WALL) : T.FURNITURE;
    }
    if (s.kind === 'home') { const d = doorOf(homeBuilding(s)); g.overworld.tiles[d.ty * W + d.tx] = T.DOOR; }
  }
}
export function useWorldTool(g: Game, wx: number, wy: number) {
  if (isPlayerHome(g.interior) && (g.tool === 'furnish' || g.tool === 'unfurnish')) return furnishAt(g, Math.floor(wx / TS), Math.floor(wy / TS));
  if (g.interior || g.p.dead > 0) return false;
  const x = Math.floor(wx / TS), y = Math.floor(wy / TS);
  if (x < 4 || y < 4 || x >= W - 8 || y >= H - 8) return false;
  const dist = Math.hypot(wx - g.p.x, wy - g.p.y);
  if (dist > 64) { g.toast('Aproxime-se do local.'); return false; }
  const t = tileAt(g.world, x, y);
  const plot = g.settlement.plots.find(p => p.x === x && p.y === y);
  const fx = (color: string) => { g.burst(x * TS + 8, y * TS + 8, color, 14, 45); g.audio.sfx('craft'); g.save(); };
  if (g.tool === 'mine' || g.tool === 'axe') {
    if (g.actionCooldown > 0) return false;
    const node = g.world.nodes.find(n => n.tx === x && n.ty === y && n.respawn <= 0);
    const mining = g.tool === 'mine';
    const valid = mining ? [T.ROCK, T.CWALL, T.CRYSTAL].includes(t as 7) || (node && ['iron_ore', 'crystal_ore', 'copper_ore', 'coal', 'stone'].includes(node.item)) : [T.TREE, T.DTREE, T.PINE, T.AUTUMN_TREE, T.PALM].includes(t as 4) || node?.item === 'wood';
    if (!valid) { g.toast(mining ? 'Escolha uma rocha ou um veio de minério.' : 'Escolha uma árvore.'); return false; }
    let item = mining ? (t === T.CRYSTAL ? 'crystal_ore' : hash(x, y, 9) < .35 ? 'iron_ore' : 'stone') : 'wood';
    if (node) item = node.item;
    if (!g.addItem(item, mining ? 2 : 3)) return false;
    if (node) node.respawn = 60;
    else { g.world.tiles[y * W + x] = t === T.CWALL || t === T.CRYSTAL ? T.CAVE : T.GRASS; g.terrainEdits[`${x},${y}`] = g.world.tiles[y * W + x]; }
    g.actionCooldown = .45; g.p.attackT = 1; g.setDirFrom(wx - g.p.x, wy - g.p.y);
    if (mining) { g.settlement.mining++; g.addItem('stone'); }
    g.toast(`+${mining ? 2 : 3} ${ITEMS[item].name}`); fx(ITEMS[item].color); return true;
  }
  if (g.tool === 'till') {
    if (plot || SOLID.has(t) || ![T.GRASS, T.FLOWER, T.PATH, T.AUTUMN, T.MOSS].includes(t as 0) || BUILDINGS.some(b => x >= b.x && x < b.x+b.w && y >= b.y && y < b.y+b.h)) { g.toast('Escolha um terreno livre.'); return false; }
    g.settlement.plots.push({ x, y, crop: null, growth: 0, watered: false }); fx('#b78e62'); return true;
  }
  if (g.tool === 'seed') {
    if (!plot || plot.crop) { g.toast('Prepare um canteiro vazio primeiro.'); return false; }
    const crop = CROPS[g.crop];
    if (g.count(crop.seed) < 1) { g.toast('Sem sementes. Visite o mercado.'); return false; }
    g.removeItem(crop.seed); plot.crop = g.crop; plot.growth = 0; plot.watered = false; fx('#8ac579'); return true;
  }
  if (g.tool === 'water') {
    if (!plot?.crop) { g.toast('Escolha uma plantação.'); return false; }
    plot.watered = true; fx('#80d8eb'); return true;
  }
  if (g.tool === 'build') {
    const def = STRUCTURES[g.structure];
    for (let oy = -1; oy <= def.h; oy++) for (let ox = -1; ox <= def.w; ox++) {
      if (SOLID.has(tileAt(g.world, x + ox, y + oy)) || g.settlement.plots.some(p => p.x === x + ox && p.y === y + oy) || Math.hypot((x + ox) * TS + 8 - g.p.x, (y + oy) * TS + 8 - g.p.y) < 12) { g.toast('O espaço precisa estar livre.'); return false; }
    }
    if (!Object.entries(def.cost).every(([id, n]) => g.count(id) >= n)) { g.toast('Faltam materiais para construir.'); return false; }
    Object.entries(def.cost).forEach(([id, n]) => g.removeItem(id, n));
    g.settlement.structures.push({ x, y, kind: g.structure }); applyStructures(g); g.settlement.carpentry++; g.tool = 'explore'; g.toast(`${def.name} construída!`); fx('#f6d18b'); g.buildMinimap(); return true;
  }
  if (plot?.crop && plot.growth >= 1) {
    const crop = CROPS[plot.crop];
    if (!g.addItem(crop.item, 3)) return false;
    g.addItem(crop.seed, 2); plot.crop = null; plot.growth = 0; plot.watered = false; g.settlement.harvests++; g.gainXp(12); g.toast(`Colheita: +3 ${crop.name}`); fx('#a4dc8d'); return true;
  }
  return false;
}
function furnishAt(g: Game, x: number, y: number): boolean {
  const h = g.settlement.home;
  if (g.tool === 'unfurnish') {
    const f = pieceAt(h, x, y); if (!f) { g.toast('Nenhum móvel aqui.'); return false; }
    h.furniture = h.furniture.filter(p => p !== f);
    Object.entries(FURNITURE[f.kind].cost).forEach(([id, n]) => g.addItem(id, n));
  } else {
    const d = FURNITURE[g.furniture], piece = { kind: g.furniture, x, y };
    if (h.level < d.minLevel) { g.toast(`Requer a reforma "${HOME_LEVELS[d.minLevel - 1].name}".`); return false; }
    if (!canPlace(h, piece)) { g.toast('Não cabe aqui.'); return false; }
    for (let oy = 0; oy < d.h; oy++) for (let ox = 0; ox < d.w; ox++) if (d.solid && Math.hypot((x + ox) * TS + 8 - g.p.x, (y + oy) * TS + 8 - g.p.y) < 12) { g.toast('Saia do caminho primeiro.'); return false; }
    if (!Object.entries(d.cost).every(([id, n]) => g.count(id) >= n)) { g.toast('Faltam materiais para este móvel.'); return false; }
    Object.entries(d.cost).forEach(([id, n]) => g.removeItem(id, n));
    h.furniture.push(piece); g.toast(`${d.name} colocado!`);
  }
  g.world = createHomeInterior(h); g.burst(x * TS + 8, y * TS + 8, '#f6d18b', 12, 40); g.audio.sfx('craft'); g.save(); return true;
}
export function interactSettlement(g: Game): boolean {
  const near = (x: number, y: number) => Math.hypot(g.p.x - x * TS - 8, g.p.y - y * TS - 8) < 32;
  if (g.interior) return false;
  for (const s of g.settlement.structures) {
    if (s.kind === 'home') { const b = homeBuilding(s), d = doorOf(b); if (near(d.tx, d.ty)) { g.enterInterior(b); return true; } }
    else if (near(s.x, s.y) && (s.kind === 'bench' || s.kind === 'forge')) { g.openStation = s.kind === 'bench' ? 'carpenter' : 'smith'; return true; }
  }
  const plot = g.settlement.plots.find(p => p.crop && p.growth >= 1 && near(p.x, p.y));
  if (plot) { const old = g.tool; g.tool = 'explore'; const result = useWorldTool(g, plot.x * TS + 8, plot.y * TS + 8); g.tool = old; return result; }
  return false;
}
export function renderSettlement(g: Game, c: CanvasRenderingContext2D) {
  const box = (x: number, y: number, w: number, h: number, color: string) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h); };
  for (const p of g.settlement.plots) {
    const x = p.x * TS, y = p.y * TS;
    box(x + 1, y + 1, 14, 14, p.watered ? '#594b40' : '#916b4b');
    for (let i = 0; i < 3; i++) box(x + 2, y + 3 + i * 4, 12, 1, '#493c36');
    if (p.crop) { const h = 3 + p.growth * 9; for (const dx of [4, 10]) { box(x + dx, y + 12 - h, 1, h, '#6ca65f'); box(x + dx - 2, y + 13 - h, 5, 2, p.crop === 'wheat' ? '#e2c76e' : p.crop === 'moonflower' ? '#bcabeb' : '#99ce78'); if (p.growth >= 1) box(x + dx - 1, y + 7, 3, 5, p.crop === 'carrot' ? '#ed9b53' : '#f4e5a0'); } }
    if (p.crop && p.growth >= 1) box(x + 13, y - 2 + Math.sin(g.clock * 3) * 2, 2, 2, '#fff4c9');
  }
  for (const s of g.settlement.structures) {
    const x = s.x * TS, y = s.y * TS;
    if (s.kind === 'home') {
      box(x - 3, y - 3, 86, 38, '#92545e'); for (let i = 0; i < 7; i++) box(x - 3, y + i * 5, 86, 1, '#c37c79');
      box(x, y + 32, 80, 32, '#e1c99b'); box(x, y + 32, 80, 3, '#574638'); box(x + 32, y + 46, 16, 18, '#344e46');
      for (const dx of [10, 58]) { box(x + dx, y + 42, 12, 12, '#659ca5'); box(x + dx + 5, y + 42, 2, 12, '#735a42'); box(x + dx, y + 47, 12, 2, '#735a42'); }
      box(x + 62, y - 12, 7, 16, '#89908b'); for (let i = 0; i < 3; i++) { c.globalAlpha = .3; box(x + 62 + Math.sin(g.clock + i) * 4, y - 14 - (g.clock * 8 + i * 8) % 30, 7, 5, '#ece6d7'); } c.globalAlpha = 1;
    } else if (s.kind === 'bench') { box(x, y + 6, 32, 9, '#b68f60'); box(x + 3, y + 15, 3, 4, '#674b38'); box(x + 26, y + 15, 3, 4, '#674b38'); box(x + 5, y + 2, 10, 4, '#d1c8ac'); }
    else if (s.kind === 'forge') { box(x, y, 32, 28, '#89918e'); box(x + 5, y + 8, 22, 18, '#3a4242'); for (let i = 0; i < 6; i++) { const h = 5 + Math.sin(g.clock * 10 + i) * 4; box(x + 6 + i * 3, y + 24 - h, 3, h, i % 2 ? '#ffd683' : '#df8759'); } }
    else if (s.kind === 'fence') { box(x + 2, y + 2, 3, 14, '#a9885d'); box(x + 12, y + 2, 3, 14, '#a9885d'); box(x, y + 5, 16, 2, '#dbb87d'); box(x, y + 11, 16, 2, '#dbb87d'); }
    else { box(x + 7, y - 12, 2, 27, '#a79261'); box(x + 3, y - 13, 10, 9, '#659e91'); box(x + 5, y - 11, 6, 5, '#f8e6a8'); }
  }
  if (g.tool !== 'explore' && !g.interior) {
    const x = g.cursor.x, y = g.cursor.y, def = STRUCTURES[g.structure];
    c.strokeStyle = Math.hypot(x * TS + 8 - g.p.x, y * TS + 8 - g.p.y) <= 64 ? '#ccebb7' : '#ed9691'; c.lineWidth = 1;
    c.strokeRect(x * TS + .5, y * TS + .5, (g.tool === 'build' ? def.w : 1) * TS - 1, (g.tool === 'build' ? def.h : 1) * TS - 1);
  }
}
export const CARPENTRY_RECIPES: Recipe[] = [
  { out: 'plank', qty: 4, station: 'carpenter', cost: { wood: 3 }, gold: 0 },
  { out: 'torch', qty: 1, station: 'carpenter', cost: { wood: 2, coal: 1 }, gold: 0 },
  { out: 'carrot_seed', qty: 3, station: 'carpenter', cost: { carrot: 1 }, gold: 0 },
  { out: 'wheat_seed', qty: 3, station: 'carpenter', cost: { wheat: 1 }, gold: 0 },
];