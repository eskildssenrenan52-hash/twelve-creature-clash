// Player home: upgradeable size/quality and placeable furniture.
import { ROOM } from './exploration';
import { W, H, T, TS, type World } from './world';

export type FurnitureKind = 'bed' | 'table' | 'chair' | 'shelf' | 'plant' | 'rug' | 'fireplace' | 'chest' | 'lamp' | 'crystal' | 'wardrobe' | 'piano';
export interface Furniture { kind: FurnitureKind; x: number; y: number }
export interface HomeState { level: number; furniture: Furniture[] }
export const freshHome = (): HomeState => ({ level: 1, furniture: [] });

export const HOME_LEVELS = [
  { name: 'Cabana simples', w: 13, h: 9, cost: {} as Record<string, number> },
  { name: 'Casa de madeira', w: 19, h: 12, cost: { plank: 15, stone: 20 } },
  { name: 'Casarão de pedra', w: 25, h: 15, cost: { plank: 30, stone: 40, iron_ingot: 5 } },
  { name: 'Mansão de Mana', w: 31, h: 18, cost: { plank: 50, stone: 60, iron_ingot: 10, crystal_ore: 8 } },
];
export const FURNITURE: Record<FurnitureKind, { name: string; w: number; h: number; solid: boolean; cost: Record<string, number>; minLevel: number }> = {
  bed: { name: 'Cama confortável', w: 2, h: 3, solid: true, cost: { plank: 6, herb: 2 }, minLevel: 1 },
  table: { name: 'Mesa de jantar', w: 3, h: 2, solid: true, cost: { plank: 4 }, minLevel: 1 },
  chair: { name: 'Cadeira', w: 1, h: 1, solid: true, cost: { plank: 2 }, minLevel: 1 },
  plant: { name: 'Vaso de planta', w: 1, h: 1, solid: true, cost: { herb: 2, stone: 1 }, minLevel: 1 },
  rug: { name: 'Tapete bordado', w: 3, h: 2, solid: false, cost: { plank: 1, herb: 4 }, minLevel: 1 },
  chest: { name: 'Baú decorado', w: 1, h: 1, solid: true, cost: { plank: 3, iron_ore: 1 }, minLevel: 1 },
  shelf: { name: 'Estante de livros', w: 3, h: 1, solid: true, cost: { plank: 5 }, minLevel: 2 },
  lamp: { name: 'Lanterna de Mana', w: 1, h: 1, solid: true, cost: { wood: 1, mana_shard: 1 }, minLevel: 2 },
  fireplace: { name: 'Lareira de pedra', w: 3, h: 1, solid: true, cost: { stone: 10, iron_ingot: 1 }, minLevel: 2 },
  wardrobe: { name: 'Guarda-roupa', w: 2, h: 1, solid: true, cost: { plank: 8 }, minLevel: 3 },
  crystal: { name: 'Cristal decorativo', w: 1, h: 1, solid: true, cost: { crystal_ore: 2 }, minLevel: 3 },
  piano: { name: 'Piano de cauda', w: 3, h: 2, solid: true, cost: { plank: 12, iron_ingot: 2 }, minLevel: 4 },
};

export function homeRect(level: number) {
  const L = HOME_LEVELS[Math.max(0, Math.min(HOME_LEVELS.length - 1, level - 1))];
  const left = ROOM.exitX - Math.floor(L.w / 2);
  return { left, top: ROOM.exitY - L.h, width: L.w, height: L.h };
}

export function createHomeInterior(home: HomeState): World {
  const tiles = new Uint8Array(W * H).fill(T.CWALL), biomes = new Uint8Array(W * H);
  const r = homeRect(home.level);
  for (let y = r.top; y <= ROOM.exitY; y++) for (let x = r.left; x < r.left + r.width; x++) {
    const edge = y < r.top + 2 || y === ROOM.exitY || x === r.left || x === r.left + r.width - 1;
    tiles[y * W + x] = edge ? T.PANEL : T.FLOOR;
  }
  tiles[ROOM.exitY * W + ROOM.exitX] = T.DOOR;
  for (const f of home.furniture) { const d = FURNITURE[f.kind]; if (d.solid) for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) tiles[(f.y + y) * W + f.x + x] = T.FURNITURE; }
  return { tiles, biomes, nodes: [] };
}

const overlaps = (a: Furniture, b: Furniture) => {
  const A = FURNITURE[a.kind], B = FURNITURE[b.kind];
  return a.x < b.x + B.w && b.x < a.x + A.w && a.y < b.y + B.h && b.y < a.y + A.h;
};
/** A piece fits when it lies on free floor, avoids the door lane and other pieces of the same layer. */
export function canPlace(home: HomeState, piece: Furniture): boolean {
  const d = FURNITURE[piece.kind], r = homeRect(home.level);
  if (home.level < d.minLevel) return false;
  for (let y = piece.y; y < piece.y + d.h; y++) for (let x = piece.x; x < piece.x + d.w; x++) {
    if (x <= r.left || x >= r.left + r.width - 1 || y < r.top + 2 || y >= ROOM.exitY) return false;
    if (Math.abs(x - ROOM.exitX) <= 0 && y >= ROOM.exitY - 2) return false;
  }
  return !home.furniture.some(f => FURNITURE[f.kind].solid === d.solid && overlaps(f, piece));
}
export function pieceAt(home: HomeState, x: number, y: number) {
  // Prefer solid pieces (drawn on top of rugs).
  const hit = home.furniture.filter(f => { const d = FURNITURE[f.kind]; return x >= f.x && x < f.x + d.w && y >= f.y && y < f.y + d.h; });
  return hit.find(f => FURNITURE[f.kind].solid) ?? hit[0];
}
export const canUpgrade = (home: HomeState) => home.level < HOME_LEVELS.length;

type Ctx = CanvasRenderingContext2D;
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
const FLOOR_STYLE = [['#b48a5c', '#a07a50'], ['#c99a63', '#b38556'], ['#cfc6b4', '#bdb39f'], ['#e5ddd0', '#c9bfe0']];
const WALL_STYLE = ['#7a5a44', '#8f6a4c', '#6f7a86', '#7d6aa0'];

export function drawHome(c: Ctx, home: HomeState, time: number) {
  const r = homeRect(home.level), lv = Math.min(3, home.level - 1), [fa, fb] = FLOOR_STYLE[lv];
  for (let y = r.top + 2; y < ROOM.exitY; y++) for (let x = r.left + 1; x < r.left + r.width - 1; x++) {
    box(c, x * TS, y * TS, TS, TS, (lv === 2 || lv === 3) ? ((x + y) % 2 ? fa : fb) : fa);
    if (lv < 2) { box(c, x * TS, y * TS + 7, TS, 1, fb); box(c, x * TS + ((y % 2) ? 4 : 12), y * TS, 1, TS, fb); }
  }
  // Back wall with wainscot, windows and (higher levels) trims and banners.
  box(c, r.left * TS, r.top * TS, r.width * TS, 2 * TS, WALL_STYLE[lv]);
  box(c, r.left * TS, (r.top + 2) * TS - 6, r.width * TS, 6, '#00000030');
  if (lv >= 1) box(c, r.left * TS, r.top * TS + 3, r.width * TS, 2, '#e6c98f');
  for (let x = r.left + 3; x < r.left + r.width - 3; x += 6) {
    box(c, x * TS, r.top * TS + 7, 20, 18, '#5b4334'); box(c, x * TS + 2, r.top * TS + 9, 16, 14, '#a8dbe0'); box(c, x * TS + 9, r.top * TS + 9, 2, 14, '#5b4334');
    if (lv >= 3) { box(c, x * TS + 26, r.top * TS + 6, 8, 20, '#8a4fb0'); box(c, x * TS + 28, r.top * TS + 22, 4, 4, '#f4d27a'); }
  }
  const pieces = [...home.furniture].sort((a, b) => Number(FURNITURE[a.kind].solid) - Number(FURNITURE[b.kind].solid) || a.y - b.y);
  for (const f of pieces) drawFurniture(c, f, time);
}

export function drawFurniture(c: Ctx, f: Furniture, time: number) {
  const x = f.x * TS, y = f.y * TS, d = FURNITURE[f.kind], w = d.w * TS, h = d.h * TS;
  if (d.solid) box(c, x + 2, y + h - 3, w - 2, 4, '#00000035');
  switch (f.kind) {
    case 'bed': box(c, x, y, w, h, '#6b4a36'); box(c, x + 2, y + 2, w - 4, 12, '#f2ead6'); box(c, x + 2, y + 14, w - 4, h - 17, '#5c86b8'); box(c, x + 2, y + 14, w - 4, 3, '#8fb4dd'); break;
    case 'table': box(c, x, y + 4, w, h - 8, '#8a5f3c'); box(c, x, y + 2, w, h - 10, '#b98653'); box(c, x + 3, y + h - 6, 3, 6, '#5a3d28'); box(c, x + w - 6, y + h - 6, 3, 6, '#5a3d28'); box(c, x + 18, y + 4, 10, 6, '#f1f1ea'); box(c, x + 21, y + 1, 3, 4, '#d84f4f'); break;
    case 'chair': box(c, x + 3, y, 10, 6, '#8a5f3c'); box(c, x + 3, y + 6, 10, 5, '#b98653'); box(c, x + 3, y + 11, 2, 5, '#5a3d28'); box(c, x + 11, y + 11, 2, 5, '#5a3d28'); break;
    case 'shelf': box(c, x, y - 10, w, h + 10, '#6b4a36'); for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) box(c, x + 3 + i * 5, y - 8 + row * 12, 3, 9, ['#c25b5b', '#5b8cc2', '#d8b45c', '#6fae6a'][(i + row) % 4]); break;
    case 'plant': box(c, x + 4, y + 9, 8, 7, '#b5683f'); box(c, x + 2, y + 1, 12, 9, '#4f9a56'); box(c, x + 5, y - 3, 6, 6, '#6cc06f'); box(c, x + 7, y - 1, 2, 2, '#f3b0c8'); break;
    case 'rug': box(c, x, y, w, h, '#9a4a5c'); box(c, x + 3, y + 3, w - 6, h - 6, '#d9b07a'); box(c, x + 6, y + 6, w - 12, h - 12, '#6e3f6a'); break;
    case 'fireplace': { box(c, x, y - 12, w, h + 12, '#8d8f90'); box(c, x + 8, y - 4, w - 16, h + 2, '#2c2a2c'); for (let i = 0; i < 7; i++) { const fh = 4 + Math.round((Math.sin(time * 9 + i * 2) + 1) * 4); box(c, x + 10 + i * 4, y + 12 - fh, 3, fh, i % 2 ? '#f6c56a' : '#e0703f'); } box(c, x - 2, y - 14, w + 4, 3, '#b9b7ad'); break; }
    case 'chest': box(c, x + 1, y + 3, 14, 12, '#7a4e2c'); box(c, x + 1, y + 3, 14, 4, '#b07a3c'); box(c, x + 7, y + 7, 3, 3, '#f2d27a'); break;
    case 'lamp': { box(c, x + 7, y - 6, 2, 22, '#7f6d4f'); const g = 0.6 + Math.sin(time * 4) * 0.2; c.globalAlpha = g * 0.35; box(c, x - 4, y - 14, 24, 18, '#9ff3ff'); c.globalAlpha = 1; box(c, x + 3, y - 10, 10, 8, '#7fe6f2'); box(c, x + 6, y - 8, 4, 4, '#ffffff'); break; }
    case 'crystal': { const b = Math.round(Math.sin(time * 2 + f.x)); box(c, x + 4, y + 10, 8, 6, '#5f5f74'); box(c, x + 5, y - 4 + b, 6, 14, '#b88cff'); box(c, x + 7, y - 7 + b, 3, 6, '#e3d2ff'); box(c, x + 6, y - 2 + b, 1, 8, '#ffffff'); break; }
    case 'wardrobe': box(c, x, y - 14, w, h + 14, '#5e3f2c'); box(c, x + 2, y - 12, w / 2 - 3, h + 10, '#86593a'); box(c, x + w / 2 + 1, y - 12, w / 2 - 3, h + 10, '#86593a'); box(c, x + w / 2 - 3, y - 2, 2, 4, '#e6c56a'); box(c, x + w / 2 + 1, y - 2, 2, 4, '#e6c56a'); break;
    case 'piano': box(c, x, y, w, h, '#1e1c22'); box(c, x + 2, y + 2, w - 4, 10, '#34303a'); box(c, x + 2, y + h - 10, w - 4, 6, '#f4f2ea'); for (let i = 0; i < 11; i++) box(c, x + 4 + i * 4, y + h - 10, 2, 4, '#1e1c22'); break;
  }
}
