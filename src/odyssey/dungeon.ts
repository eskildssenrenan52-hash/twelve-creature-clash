// O Abismo do Cântico: masmorra de 100 andares sob Potos.
// Dado puro e determinístico (sem canvas) para que os testes validem todos os andares.
import { W, H, T, BIOME_LIST, type World } from './world';
import type { Biome, BossDef, EnemyKind } from './data';

export const ABYSS_FLOORS = 100;
/** Entrada do Abismo em Potos (porta do prédio 'abyss'). */
export const ABYSS_ENTRY = { x: 141, y: 145, w: 7, h: 5 };
export const ABYSS_DOOR = { tx: ABYSS_ENTRY.x + 3, ty: ABYSS_ENTRY.y + ABYSS_ENTRY.h - 1 };
const OX = 4, OY = 4;

export interface Theme { name: string; floor: number; wall: number; deco: number; biome: Biome; enemies: EnemyKind[]; color: string; lore: string }
/** Dez estratos de dez andares cada, cada um com sua própria arquitetura e fauna. */
export const THEMES: Theme[] = [
  { name: 'Criptas da Raiz', floor: T.CAVE, wall: T.CWALL, deco: T.CRYSTAL, biome: 'cave', enemies: ['mushroom', 'goblin', 'sporeling'], color: '#8a6aff', lore: 'Raízes da Árvore de Mana descem até aqui, pulsando como veias.' },
  { name: 'Galerias Fúngicas', floor: T.MOSS, wall: T.CWALL, deco: T.MUSHROOM, biome: 'mushroom', enemies: ['sporeling', 'mushroom', 'shade'], color: '#d080ff', lore: 'Os fungos lembram de tudo que já morreu aqui embaixo.' },
  { name: 'Catacumbas do Conselho', floor: T.RUINS, wall: T.WALL, deco: T.PILLAR, biome: 'ruins', enemies: ['golem', 'shade', 'goblin'], color: '#e8d8b0', lore: 'O antigo Conselho selou Vael numa sala parecida com esta.' },
  { name: 'Lagos Subterrâneos', floor: T.MOSS, wall: T.ROCK, deco: T.WATER, biome: 'swamp', enemies: ['sporeling', 'scorpion', 'shade'], color: '#60c8b0', lore: 'A água aqui não reflete nada. Nem você.' },
  { name: 'Areias Engolidas', floor: T.SAND, wall: T.ROCK, deco: T.CACTUS, biome: 'desert', enemies: ['scorpion', 'golem', 'scorpion'], color: '#e8c070', lore: 'Um império inteiro desceu com a areia. Seus soldados ainda patrulham.' },
  { name: 'Geleiras Profundas', floor: T.ICE, wall: T.ROCK, deco: T.CRYSTAL, biome: 'mountain', enemies: ['wolf', 'golem', 'wolf'], color: '#a8e0ff', lore: 'O gelo escorrega. O frio fala. Cuidado com o chão.' },
  { name: 'Forjas de Kaore', floor: T.ASH, wall: T.ROCK, deco: T.LAVA, biome: 'volcanic', enemies: ['golem', 'shade', 'scorpion'], color: '#ff7a3a', lore: 'Os anões de Pedra-Negra forjaram o Colosso nestas fornalhas.' },
  { name: 'Biblioteca Afogada', floor: T.FLOOR, wall: T.PANEL, deco: T.FURNITURE, biome: 'ruins', enemies: ['shade', 'golem', 'shade'], color: '#d8b080', lore: 'Livros que ninguém escreveu, sobre vidas que ninguém viveu.' },
  { name: 'Coração de Cristal', floor: T.CAVE, wall: T.CWALL, deco: T.CRYSTAL, biome: 'cave', enemies: ['golem', 'wolf', 'shade'], color: '#c080ff', lore: 'Cada cristal guarda uma nota que o Silêncio arrancou do mundo.' },
  { name: 'O Vazio Sem Eco', floor: T.ASH, wall: T.CWALL, deco: T.LAVA, biome: 'volcanic', enemies: ['shade', 'wolf', 'golem', 'scorpion'], color: '#9a9ab8', lore: 'Aqui nada faz som. Nem seus passos. Nem seu coração.' },
];
export const themeOf = (floor: number) => THEMES[Math.min(THEMES.length - 1, Math.floor((floor - 1) / 10))]!;
export const floorLevel = (floor: number) => 2 + Math.round(floor * 1.15);
export const isGuardianFloor = (floor: number) => floor % 10 === 0;
/** Andares de onde o Guardião do Abismo deixa você recomeçar. */
export function checkpoints(best: number) { const out = [1]; for (let f = 5; f <= Math.min(best, ABYSS_FLOORS); f += 5) out.push(f); return out; }

/* ───────────── Guardiões ───────────── */
interface GuardianDef { name: string; kind: EnemyKind; tint: string; scale: number; minion: EnemyKind; reward: string[]; intro: string }
export const GUARDIANS: Record<number, GuardianDef> = {
  10: { name: 'Raiz-Mãe Ygdrasa', kind: 'sporeling', tint: '#7a5aff', scale: 3, minion: 'sporeling', reward: ['abyss_root_ring', 'hi_potion', 'hi_potion'], intro: 'A raiz mais antiga se levanta. Ela não quer que você desça.' },
  20: { name: 'Micélio Rei Fungaroth', kind: 'mushroom', tint: '#c050e0', scale: 3.2, minion: 'mushroom', reward: ['spore_mantle', 'elixir'], intro: 'Mil vozes fúngicas falam ao mesmo tempo: “volte”.' },
  30: { name: 'Juiz de Pedra Sentenor', kind: 'golem', tint: '#e0d0a0', scale: 3.1, minion: 'golem', reward: ['council_seal', 'elixir'], intro: 'O último juiz do Conselho ainda espera o réu: você.' },
  40: { name: 'Enguia Abissal Morgwyn', kind: 'scorpion', tint: '#40b0a0', scale: 3.2, minion: 'scorpion', reward: ['tide_lance', 'elixir'], intro: 'Algo enorme se move sob a água que não reflete.' },
  50: { name: 'Faraó Sepulto Anketh', kind: 'scorpion', tint: '#e8b040', scale: 3.3, minion: 'scorpion', reward: ['pharaoh_amulet', 'elixir', 'elixir'], intro: 'O imperador das areias engolidas desperta do sono de mil anos.' },
  60: { name: 'Wyrm Glacial Hrimfax', kind: 'wolf', tint: '#c0f0ff', scale: 3.4, minion: 'wolf', reward: ['glacier_mail', 'elixir', 'elixir'], intro: 'O frio ganha dentes. E fome.' },
  70: { name: 'Kael, o Forjador Caído', kind: 'golem', tint: '#ff6030', scale: 3.2, minion: 'golem', reward: ['kael_hammer', 'elixir', 'elixir'], intro: 'Kael Pedra-Negra, o irmão traidor, fundiu o próprio corpo com a forja.' },
  80: { name: 'Bibliotecária Sem Rosto', kind: 'shade', tint: '#e0c090', scale: 3.3, minion: 'shade', reward: ['blank_grimoire', 'elixir', 'elixir'], intro: 'Ela apagou o próprio nome para guardar todos os outros.' },
  90: { name: 'Prisma Partido Vel-Ara', kind: 'golem', tint: '#d0a0ff', scale: 3.5, minion: 'shade', reward: ['shattered_prism', 'elixir', 'elixir', 'elixir'], intro: 'O cristal que segura o teto do mundo começa a rachar... e a lutar.' },
};
export const FINAL_BOSS_ID = 'abyss_100';
export const FINAL_BOSS = {
  name: 'Ømnia, a Nota que Engoliu o Mundo', kind: 'shade' as EnemyKind, tint: '#f0f0ff', scale: 4.2,
  intro: [
    'No fundo do Abismo não há chão. Há uma nota, suspensa, que nunca terminou de soar.',
    'Ømnia: — Vael tentou me calar. Gorm tentou me cantar. Ambos falharam.',
    'Ømnia: — Eu sou o primeiro som e o último silêncio. Eu sou o fim de toda Canção.',
    'O Abismo inteiro prende a respiração. Lute.',
  ],
};

export function guardianBoss(floor: number, tx: number, ty: number): BossDef {
  const lvl = floorLevel(floor) + 6;
  if (floor >= ABYSS_FLOORS) {
    return { id: FINAL_BOSS_ID, name: FINAL_BOSS.name, biome: 'volcanic', tx, ty, hp: 900000, atk: 420, xp: 250000, gold: 50000, color: '#e8e8ff', minion: 'shade',
      reward: ['omnia_blade', 'omnia_crown', 'void_essence', 'void_essence', 'void_essence', 'elixir', 'elixir', 'elixir', 'elixir', 'elixir'] };
  }
  const g = GUARDIANS[floor]!;
  return { id: `abyss_${floor}`, name: g.name, biome: themeOf(floor).biome, tx, ty, hp: Math.round(3000 + lvl * lvl * 26), atk: Math.round(18 + lvl * 2.6),
    xp: Math.round(400 + lvl * lvl * 9), gold: lvl * 60, color: g.tint, minion: g.minion, reward: g.reward };
}
export const ABYSS_BOSS_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> = {
  ...Object.fromEntries(Object.entries(GUARDIANS).map(([f, g]) => [`abyss_${f}`, { kind: g.kind, tint: g.tint, scale: g.scale }])),
  [FINAL_BOSS_ID]: { kind: FINAL_BOSS.kind, tint: FINAL_BOSS.tint, scale: FINAL_BOSS.scale },
};

/* ───────────── Geração ───────────── */
export interface Room { x: number; y: number; w: number; h: number }
export interface FloorSpawn { kind: EnemyKind; tx: number; ty: number; level: number; elite: boolean }
export interface FloorChest { id: string; tx: number; ty: number; gold: number; item: string; qty: number }
export interface DungeonFloor {
  floor: number; theme: Theme; world: World; w: number; h: number; ox: number; oy: number; rooms: Room[];
  start: { tx: number; ty: number }; stairs: { tx: number; ty: number }; spawns: FloorSpawn[]; chests: FloorChest[]; boss: BossDef | null;
  /** Tochas de parede (poucas): as únicas luzes fixas do andar. */
  torches: { tx: number; ty: number }[];
}
export interface FloorOptions { theme: Theme; seed: number; size: { w: number; h: number }; level: number; idPrefix: string; eliteBonus?: number }

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const floorSize = (floor: number) => ({ w: Math.round(70 + floor * 1.3), h: Math.round(50 + floor * 1.0) });

const LOOT_TIERS = [['potion', 'ether', 'herb', 'iron_ore'], ['hi_potion', 'ether', 'mana_shard', 'crystal_ore'], ['hi_potion', 'elixir', 'crystal_ore', 'mana_shard'], ['elixir', 'eco_shard', 'crystal_ore'], ['elixir', 'eco_shard', 'void_essence']];

export function generateFloor(floor: number, opts?: FloorOptions): DungeonFloor {
  const theme = opts?.theme ?? themeOf(floor), r = rng(opts?.seed ?? floor * 7919 + 13);
  const { w, h } = opts?.size ?? floorSize(floor);
  const tiles = new Uint8Array(W * H).fill(theme.wall);
  const biomes = new Uint8Array(W * H).fill(Math.max(0, BIOME_LIST.indexOf(theme.biome)));
  const set = (x: number, y: number, t: number) => { if (x > OX && y > OY && x < OX + w - 1 && y < OY + h - 1) tiles[y * W + x] = t; };
  const carve = (x: number, y: number, rw: number, rh: number) => { for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) set(xx, yy, theme.floor); };
  const rooms: Room[] = [];
  const final = !opts && floor >= ABYSS_FLOORS, guardian = !opts && isGuardianFloor(floor);
  const overlaps = (a: Room) => rooms.some(b => a.x < b.x + b.w + 3 && a.x + a.w + 3 > b.x && a.y < b.y + b.h + 3 && a.y + a.h + 3 > b.y);

  if (final) {
    rooms.push({ x: OX + 6, y: OY + Math.floor(h / 2) - 5, w: 12, h: 10 });
    rooms.push({ x: OX + Math.floor(w / 2) - 34, y: OY + Math.floor(h / 2) - 26, w: 68, h: 52 });
  } else {
    const target = Math.min(36, 8 + Math.floor(floor / 3));
    for (let tries = 0; rooms.length < target && tries < 900; tries++) {
      const rw = 7 + Math.floor(r() * 11), rh = 6 + Math.floor(r() * 8);
      const room = { x: OX + 3 + Math.floor(r() * (w - rw - 6)), y: OY + 3 + Math.floor(r() * (h - rh - 6)), w: rw, h: rh };
      if (!overlaps(room)) rooms.push(room);
    }
    if (guardian) {
      // A sala do guardião é uma arena ampla no canto mais distante.
      const arena = { x: OX + w - 32, y: OY + h - 26, w: 26, h: 20 };
      for (let i = rooms.length - 1; i >= 0; i--) { const b = rooms[i]!; if (arena.x < b.x + b.w + 2 && arena.x + arena.w + 2 > b.x && arena.y < b.y + b.h + 2 && arena.y + arena.h + 2 > b.y) rooms.splice(i, 1); }
      rooms.push(arena);
    }
  }
  const center = (a: Room) => ({ x: a.x + Math.floor(a.w / 2), y: a.y + Math.floor(a.h / 2) });
  for (const room of rooms) carve(room.x, room.y, room.w, room.h);
  // Corredores: cada sala liga-se à anterior (ordem espacial) e há atalhos extras formando laços.
  const order = rooms.map((room, i) => ({ room, i })).sort((a, b) => (a.room.x + a.room.y * 0.6) - (b.room.x + b.room.y * 0.6));
  const cw = floor > 60 ? 3 : 2;
  const corridor = (a: Room, b: Room) => {
    const p = center(a), q = center(b), horizontalFirst = r() < 0.5;
    const hor = (y: number, x0: number, x1: number) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let k = 0; k < cw; k++) set(x, y + k, theme.floor); };
    const ver = (x: number, y0: number, y1: number) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + cw - 1; y++) for (let k = 0; k < cw; k++) set(x + k, y, theme.floor); };
    if (horizontalFirst) { hor(p.y, p.x, q.x); ver(q.x, p.y, q.y); } else { ver(p.x, p.y, q.y); hor(q.y, p.x, q.x); }
  };
  for (let i = 1; i < order.length; i++) corridor(order[i - 1]!.room, order[i]!.room);
  for (let i = 0; i < Math.floor(rooms.length / 4); i++) corridor(rooms[Math.floor(r() * rooms.length)]!, rooms[Math.floor(r() * rooms.length)]!);

  const startRoom = final ? rooms[0]! : order[0]!.room;
  const endRoom = final || guardian ? rooms[rooms.length - 1]! : order[order.length - 1]!.room;
  const s0 = center(startRoom), e0 = center(endRoom);
  const start = { tx: s0.x, ty: s0.y }, end = { tx: e0.x, ty: e0.y };
  // Decoração sólida apenas no interior das salas comuns, longe das entradas.
  for (const room of rooms) {
    if (room === startRoom || room === endRoom || room.w < 9 || room.h < 8) continue;
    const n = Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const dx = room.x + 2 + Math.floor(r() * (room.w - 4)), dy = room.y + 2 + Math.floor(r() * (room.h - 4));
      if (Math.abs(dx - center(room).x) + Math.abs(dy - center(room).y) < 2) continue;
      set(dx, dy, theme.deco);
    }
  }
  if (final) {
    const c = e0;
    // Arena final: pilares em anel, poças de vazio nas bordas.
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; set(Math.round(c.x + Math.cos(a) * 22), Math.round(c.y + Math.sin(a) * 16), T.PILLAR); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; set(Math.round(c.x + Math.cos(a) * 30), Math.round(c.y + Math.sin(a) * 22), T.LAVA); }
  }
  const level = opts?.level ?? floorLevel(floor);
  const spawns: FloorSpawn[] = [];
  if (!final) {
    const count = Math.min(95, 16 + Math.floor(floor * 0.8));
    const pool = theme.enemies;
    for (let i = 0, tries = 0; spawns.length < count && tries < count * 20; tries++, i++) {
      const room = rooms[Math.floor(r() * rooms.length)]!;
      if (room === startRoom || (guardian && room === endRoom)) continue;
      const tx = room.x + 1 + Math.floor(r() * (room.w - 2)), ty = room.y + 1 + Math.floor(r() * (room.h - 2));
      if (tiles[ty * W + tx] !== theme.floor) continue;
      const elite = r() < 0.08 + floor * 0.002 + (opts?.eliteBonus ?? 0);
      spawns.push({ kind: pool[i % pool.length]!, tx, ty, level: level + (elite ? 6 : Math.floor(r() * 3)), elite });
    }
  }
  const chests: FloorChest[] = [];
  const nChests = final ? 0 : 1 + Math.floor(r() * 3) + (guardian ? 2 : 0);
  const tier = LOOT_TIERS[Math.min(LOOT_TIERS.length - 1, Math.floor(floor / 21))]!;
  for (let i = 0, tries = 0; chests.length < nChests && tries < 200; tries++) {
    const room = guardian && i < 2 ? endRoom : rooms[Math.floor(r() * rooms.length)]!;
    if (room === startRoom) continue;
    const tx = room.x + 1 + Math.floor(r() * (room.w - 2)), ty = room.y + 1 + Math.floor(r() * (room.h - 2));
    if (tiles[ty * W + tx] !== theme.floor || (tx === end.tx && ty === end.ty)) continue;
    chests.push({ id: `${opts?.idPrefix ?? 'abyss'}-${floor}-${i}`, tx, ty, gold: Math.round(30 + floor * floor * 2.2), item: tier[Math.floor(r() * tier.length)]!, qty: 1 + Math.floor(r() * 2) });
    i++;
  }
  // Garante chão nos pontos-chave.
  for (const pt of [start, end]) for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) set(pt.tx + x, pt.ty + y, theme.floor);
  const boss = guardian || final ? guardianBoss(floor, end.tx, end.ty - (final ? 0 : 2)) : null;
  // Poucas tochas: uma a cada ~4 salas, sempre presas à parede de cima.
  const torches: { tx: number; ty: number }[] = [{ tx: start.tx, ty: startRoom.y - 1 }];
  for (const room of rooms) {
    if (room === startRoom || r() > 0.28) continue;
    const tx = room.x + 1 + Math.floor(r() * (room.w - 2)), ty = room.y - 1;
    if (tiles[ty * W + tx] === theme.wall) torches.push({ tx, ty });
  }
  return { floor, theme, world: { tiles, biomes, nodes: [] }, w, h, ox: OX, oy: OY, rooms, start, stairs: end, spawns, chests, boss, torches };
}

/** Verdadeiro se é possível caminhar do início até a escada (usado em testes). */
export function reachable(f: DungeonFloor, solid: Set<number>) {
  const seen = new Uint8Array((f.w + OX * 2) * (f.h + OY * 2)), stride = f.w + OX * 2;
  const q: [number, number][] = [[f.start.tx, f.start.ty]];
  seen[f.start.ty * stride + f.start.tx] = 1;
  while (q.length) {
    const [x, y] = q.pop()!;
    if (x === f.stairs.tx && y === f.stairs.ty) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= stride || ny >= f.h + OY * 2 || seen[ny * stride + nx]) continue;
      if (solid.has(f.world.tiles[ny * W + nx]!)) continue;
      seen[ny * stride + nx] = 1; q.push([nx, ny]);
    }
  }
  return false;
}
void H;
