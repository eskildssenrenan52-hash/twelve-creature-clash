// Profundezas: o Abismo do Cântico (100 andares sob Potos) e os Templos Profundos,
// um segundo andar escuro para cada um dos 30 biomas. Dados determinísticos + arte.
import { BIOME_ENEMIES, BIOME_NAMES, type Biome, type EnemyKind } from './data';
import { FRONTIER, FRONTIER_GATES, type FrontierBiome } from './frontier';
import { BIOME_LEVEL } from './levels';
import { T, TS } from './world';
import { generateFloor, type DungeonFloor, type Theme } from './dungeon';
import forestArt from '@/assets/depths/temple-forest.png';
import desertArt from '@/assets/depths/temple-desert.png';
import iceArt from '@/assets/depths/temple-ice.png';
import fireArt from '@/assets/depths/temple-fire.png';
import crystalArt from '@/assets/depths/temple-crystal.png';
import waterArt from '@/assets/depths/temple-water.png';
import marbleArt from '@/assets/depths/temple-marble.png';
import mushroomArt from '@/assets/depths/temple-mushroom.png';
import gateArt from '@/assets/depths/abyss-gate.png';
import wallTorchArt from '@/assets/depths/wall-torch.png';

export type TempleFamily = 'forest' | 'desert' | 'ice' | 'fire' | 'crystal' | 'water' | 'marble' | 'mushroom';
export type StairStyle = 'roots' | 'sand' | 'frost' | 'lava' | 'crystal' | 'coral' | 'marble' | 'fungal' | 'spiral' | 'ladder' | 'petals' | 'bamboo' | 'storm' | 'bones' | 'gold' | 'moon';
export interface Temple { id: string; biome: Biome; name: string; family: TempleFamily; hue: number; stair: StairStyle; tx: number; ty: number; level: number; lore: string }

const FAMILY: Record<string, TempleFamily> = {
  plains: 'forest', forest: 'forest', autumn: 'forest', jungle: 'forest', meadow: 'forest', sakura: 'forest', bamboo: 'forest', sunflower: 'forest', lavender: 'forest', crimson: 'forest',
  desert: 'desert', oasis: 'desert', amber: 'desert',
  mountain: 'ice', aurora: 'ice',
  volcanic: 'fire', obsidian: 'fire', thunder: 'fire',
  cave: 'crystal', prism: 'crystal', moonwood: 'crystal',
  coast: 'water', swamp: 'water', coral: 'water', lotus: 'water', mangrove: 'water',
  ruins: 'marble', marble: 'marble',
  mushroom: 'mushroom', spores: 'mushroom',
};
/** Cada bioma tem sua própria escada (tipo e cor) e um tom próprio de templo. */
const STAIR: Record<string, [StairStyle, number]> = {
  plains: ['ladder', 0], forest: ['roots', 0], autumn: ['roots', -40], jungle: ['roots', 30], meadow: ['petals', 60], sakura: ['petals', -70], bamboo: ['bamboo', 20],
  sunflower: ['gold', -30], lavender: ['petals', 120], crimson: ['roots', -90], desert: ['sand', 0], oasis: ['gold', 20], amber: ['sand', -20],
  mountain: ['frost', 0], aurora: ['moon', 60], volcanic: ['lava', 0], obsidian: ['bones', -20], thunder: ['storm', 200], cave: ['crystal', 0], prism: ['crystal', 140],
  moonwood: ['moon', -40], coast: ['coral', 0], swamp: ['ladder', 80], coral: ['coral', -40], lotus: ['petals', 160], mangrove: ['roots', 140], ruins: ['marble', 30],
  marble: ['spiral', 0], mushroom: ['fungal', 0], spores: ['fungal', 120],
};
const TEMPLE_NAMES: Record<TempleFamily, string> = {
  forest: 'Santuário Enraizado', desert: 'Pirâmide Afundada', ice: 'Relicário Glacial', fire: 'Forja Sepulta', crystal: 'Catedral de Cristal',
  water: 'Templo Submerso', marble: 'Panteão Partido', mushroom: 'Cripta Micélica',
};
const LORE: Record<TempleFamily, string> = {
  forest: 'Raízes antigas descem para onde a luz nunca chegou.', desert: 'A areia guarda os degraus. Ninguém voltou para contar quantos.',
  ice: 'O frio aqui embaixo tem memória.', fire: 'O calor sobe do fundo como uma respiração.', crystal: 'Os cristais apagaram há séculos. Só a sua tocha os acorda.',
  water: 'A água escorre pelas paredes e sussurra.', marble: 'Deuses esquecidos ainda vigiam os corredores.', mushroom: 'Os esporos brilham fraco. Fraco demais.',
};
const LEGACY_HUBS: Record<string, [number, number]> = {
  plains: [122, 160], forest: [46, 110], desert: [196, 124], mountain: [118, 38], cave: [184, 60], meadow: [140, 202], ruins: [190, 204],
  volcanic: [245, 205], coast: [290, 205], swamp: [92, 202], jungle: [48, 202], autumn: [48, 160], mushroom: [24, 160],
};

export const TEMPLES: Temple[] = [
  ...Object.entries(LEGACY_HUBS).map(([b, [x, y]]) => ({ b: b as Biome, tx: x + 14, ty: y - 10 })),
  ...FRONTIER_GATES.map((g) => ({ b: g.biome as Biome, tx: g.tx + 18, ty: g.ty - 12 })),
].map(({ b, tx, ty }) => {
  const family = FAMILY[b] ?? 'marble', [stair, hue] = STAIR[b] ?? ['spiral', 0];
  return { id: `temple_${b}`, biome: b, name: `${TEMPLE_NAMES[family]} de ${BIOME_NAMES[b]}`, family, hue, stair, tx, ty, level: BIOME_LEVEL[b] + 8, lore: LORE[family] };
});
/** A porta de cada templo fica no meio da base do sprite. */
export const templeDoor = (t: Temple) => ({ tx: t.tx, ty: t.ty + 3 });
/** Pegada sólida do templo (sem a porta). */
export function templeFootprint(t: Temple) { const out: [number, number][] = []; for (let y = -3; y <= 2; y++) for (let x = -3; x <= 3; x++) out.push([t.tx + x, t.ty + y]); return out; }

const FLOOR_TILES: Record<TempleFamily, { floor: number; wall: number; deco: number }> = {
  forest: { floor: T.MOSS, wall: T.CWALL, deco: T.DTREE }, desert: { floor: T.SAND, wall: T.ROCK, deco: T.PILLAR }, ice: { floor: T.ICE, wall: T.ROCK, deco: T.CRYSTAL },
  fire: { floor: T.ASH, wall: T.ROCK, deco: T.LAVA }, crystal: { floor: T.CAVE, wall: T.CWALL, deco: T.CRYSTAL }, water: { floor: T.MOSS, wall: T.ROCK, deco: T.WATER },
  marble: { floor: T.RUINS, wall: T.WALL, deco: T.PILLAR }, mushroom: { floor: T.MOSS, wall: T.CWALL, deco: T.MUSHROOM },
};
const FAMILY_COLOR: Record<TempleFamily, string> = { forest: '#80e080', desert: '#f0c060', ice: '#a8e0ff', fire: '#ff7a3a', crystal: '#c080ff', water: '#60d0c0', marble: '#e8e0c8', mushroom: '#e090ff' };

/** O andar escuro de um templo: maior, com inimigos mais fortes e mais elites. */
export function generateTempleFloor(t: Temple): DungeonFloor {
  const ft = FLOOR_TILES[t.family];
  const enemies = ((t.biome in FRONTIER ? FRONTIER[t.biome as FrontierBiome].enemies : BIOME_ENEMIES[t.biome]) ?? ['shade']) as EnemyKind[];
  const theme: Theme = { name: t.name, floor: ft.floor, wall: ft.wall, deco: ft.deco, biome: t.biome, enemies: [...enemies], color: FAMILY_COLOR[t.family], lore: t.lore };
  const idx = TEMPLES.indexOf(t);
  const depthFloor = Math.max(4, Math.min(60, t.level));
  return generateFloor(depthFloor, { theme, seed: 4243 + idx * 9973, size: { w: 92 + (idx % 5) * 6, h: 68 + (idx % 4) * 5 }, level: t.level, idPrefix: t.id, eliteBonus: 0.08 });
}

/* ───────────── Arte ───────────── */
const SRC: Record<TempleFamily, string> = { forest: forestArt, desert: desertArt, ice: iceArt, fire: fireArt, crystal: crystalArt, water: waterArt, marble: marbleArt, mushroom: mushroomArt };
const loaded: Partial<Record<string, HTMLImageElement>> = {};
const tinted = new Map<string, HTMLCanvasElement>();
function img(src: string) { let i = loaded[src]; if (!i && typeof Image !== 'undefined') { i = new Image(); i.src = src; loaded[src] = i; } return i; }
function templeSprite(t: Temple): CanvasImageSource | null {
  const key = `${t.family}:${t.hue}`; const hit = tinted.get(key); if (hit) return hit;
  const base = img(SRC[t.family]); if (!base || !base.complete || !base.naturalWidth) return null;
  if (!t.hue) { const c = document.createElement('canvas'); c.width = base.naturalWidth; c.height = base.naturalHeight; c.getContext('2d')!.drawImage(base, 0, 0); tinted.set(key, c); return c; }
  const c = document.createElement('canvas'); c.width = base.naturalWidth; c.height = base.naturalHeight;
  const x = c.getContext('2d')!; x.filter = `hue-rotate(${t.hue}deg) saturate(1.1)`; x.drawImage(base, 0, 0); tinted.set(key, c); return c;
}
/** Desenha o templo com a base apoiada na linha da porta. Tamanho ~7×7 tiles. */
export function drawTemple(c: CanvasRenderingContext2D, t: Temple, wt: number) {
  const s = templeSprite(t), d = templeDoor(t), bx = d.tx * TS + 8, by = (d.ty + 1) * TS;
  if (!s) { c.fillStyle = FAMILY_COLOR[t.family]; c.fillRect(bx - 48, by - 96, 96, 96); return; }
  const sc = s as HTMLCanvasElement, w = 112, h = Math.round(sc.height / sc.width * w);
  c.drawImage(s, Math.round(bx - w / 2), Math.round(by - h), w, h);
  const glow = 0.25 + Math.sin(wt * 3) * 0.1;
  c.fillStyle = `rgba(255,220,140,${glow})`; c.fillRect(bx - 5, by - 22, 10, 3);
}
export function drawAbyssGate(c: CanvasRenderingContext2D, door: { tx: number; ty: number }, wt: number) {
  const s = img(gateArt), bx = door.tx * TS + 8, by = (door.ty + 1) * TS;
  if (!s || !s.complete || !s.naturalWidth) { c.fillStyle = '#3a2a5a'; c.fillRect(bx - 40, by - 70, 80, 70); return; }
  const w = 104, h = Math.round(s.naturalHeight / s.naturalWidth * w);
  c.drawImage(s, Math.round(bx - w / 2), Math.round(by - h), w, h);
  c.fillStyle = `rgba(190,120,255,${0.18 + Math.sin(wt * 4) * 0.08})`; c.beginPath(); c.ellipse(bx, by - 30, 18, 26, 0, 0, Math.PI * 2); c.fill();
}
export function drawWallTorch(c: CanvasRenderingContext2D, tx: number, ty: number, wt: number) {
  const s = img(wallTorchArt), x = tx * TS + 8, y = ty * TS + 14;
  if (s && s.complete && s.naturalWidth) c.drawImage(s, x - 4, y - 14, 8, 16);
  const f = Math.sin(wt * 18 + tx) * 1.2;
  c.fillStyle = '#ffd060'; c.fillRect(x - 1, y - 16 + f, 2, 3); c.fillStyle = '#ff7a20'; c.fillRect(x - 2, y - 14 + f, 4, 2);
}
const STAIR_COLORS: Record<StairStyle, [string, string, string]> = {
  roots: ['#4a3420', '#7a5a34', '#a0d070'], sand: ['#9a7a40', '#e0c080', '#fff0b0'], frost: ['#5a7a9a', '#b8e0ff', '#ffffff'], lava: ['#3a1a1a', '#5a2a20', '#ff6020'],
  crystal: ['#3a2a5a', '#a070ff', '#e0c0ff'], coral: ['#2a5a5a', '#ef8f90', '#bfefff'], marble: ['#8a8a80', '#e8e4d8', '#ffffff'], fungal: ['#4a2a4a', '#d070e0', '#ffc0ff'],
  spiral: ['#5a5a6a', '#b0b0c0', '#ffe9a0'], ladder: ['#4a3018', '#9a6a3a', '#d8b080'], petals: ['#5a3a4a', '#f0a8c8', '#fff0f8'], bamboo: ['#2a4a2a', '#8ac070', '#d8f0a0'],
  storm: ['#2a2a3a', '#7a8aa0', '#cfe0ff'], bones: ['#2a2028', '#d8d0c0', '#ff7a3a'], gold: ['#6a4a10', '#e8c040', '#fff4b0'], moon: ['#1a2a4a', '#90b8e0', '#e8f4ff'],
};
/** Escadas: cada estilo tem forma própria (degraus, espiral, escada de mão, raízes...). down=true desce. */
export function drawStairs(c: CanvasRenderingContext2D, style: StairStyle, tx: number, ty: number, down: boolean, wt: number, locked = false) {
  const [dark, mid, hi] = STAIR_COLORS[style], x = tx * TS, y = ty * TS;
  c.fillStyle = '#000'; c.fillRect(x - 2, y - 2, 20, 20);
  if (style === 'spiral' || style === 'moon') {
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + (down ? 0 : Math.PI); c.fillStyle = i % 2 ? mid : dark; c.beginPath(); c.moveTo(x + 8, y + 8); c.arc(x + 8, y + 8, 9 - i * 1.2, a, a + 1); c.fill(); }
  } else if (style === 'ladder' || style === 'bamboo') {
    c.fillStyle = dark; c.fillRect(x, y, 16, 16); c.fillStyle = mid; c.fillRect(x + 3, y - 1, 2, 18); c.fillRect(x + 11, y - 1, 2, 18);
    for (let k = 0; k < 4; k++) c.fillRect(x + 3, y + 1 + k * 4, 10, 2);
  } else if (style === 'roots') {
    c.fillStyle = dark; c.fillRect(x, y, 16, 16);
    for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? mid : '#5a4028'; c.fillRect(x + 1 + k, y + k * 4, 14 - k * 2, 3); }
    c.fillStyle = hi; c.fillRect(x + 1, y + 1, 2, 2); c.fillRect(x + 13, y + 6, 2, 2);
  } else if (style === 'crystal' || style === 'frost' || style === 'storm') {
    for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? mid : dark; c.beginPath(); c.moveTo(x + 8, y + k * 4); c.lineTo(x + 16 - k, y + 4 + k * 4); c.lineTo(x + k, y + 4 + k * 4); c.fill(); }
    c.fillStyle = hi; c.globalAlpha = 0.5 + Math.sin(wt * 4) * 0.3; c.fillRect(x + 7, y + 2, 2, 2); c.globalAlpha = 1;
  } else if (style === 'fungal' || style === 'petals' || style === 'coral') {
    for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? mid : dark; c.beginPath(); c.ellipse(x + 8, y + 2 + k * 4, 8 - k, 2.2, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = hi; c.fillRect(x + 4, y + 1, 2, 1); c.fillRect(x + 10, y + 9, 2, 1);
  } else {
    for (let k = 0; k < 4; k++) { c.fillStyle = down ? (k % 2 ? mid : dark) : (k % 2 ? dark : mid); c.fillRect(x + k, y + k * 4, 16 - k * 2, 4); c.fillStyle = hi; c.fillRect(x + k, y + k * 4, 16 - k * 2, 1); }
    if (style === 'lava') { c.fillStyle = `rgba(255,96,32,${0.5 + Math.sin(wt * 5) * 0.3})`; c.fillRect(x + 6, y + 12, 4, 3); }
  }
  // seta
  const b = Math.round(Math.sin(wt * 4) * 1.5);
  c.fillStyle = locked ? '#ff5050' : '#ffe9a0';
  if (down) { c.fillRect(x + 7, y - 9 + b, 2, 4); c.fillRect(x + 5, y - 6 + b, 6, 2); c.fillRect(x + 6, y - 4 + b, 4, 1); }
  else { c.fillRect(x + 6, y - 10 + b, 4, 1); c.fillRect(x + 5, y - 9 + b, 6, 2); c.fillRect(x + 7, y - 7 + b, 2, 4); }
}
