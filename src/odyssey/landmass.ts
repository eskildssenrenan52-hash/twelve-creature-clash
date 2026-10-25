// Irregular continent + organic frontier regions + random road graph.
// Tile ids are literals here (not imported) to avoid a circular-import init order issue with ./world.
import { FRONTIER, FRONTIER_KEYS, FRONTIER_GATES, LEGACY_W, LEGACY_H, type FrontierBiome } from './frontier';
import { hash, noise } from './world';

const WATER = 3, ROCK = 7, WALL = 14, PILLAR = 18, CRYSTAL = 12, PINE = 16, DTREE = 20, AUTUMN_TREE = 27, MUSHROOM = 32, TREE = 4, PALM = 29, LAVA = 30, CACTUS = 21;
const SOLID_IDS = new Set([3, 4, 7, 11, 12, 14, 15, 16, 18, 20, 21, 23, 25, 27, 29, 30, 32]);

export type Layout = 'groves' | 'maze' | 'rings' | 'ridges' | 'terraces' | 'cells' | 'rooms';
/** Each frontier biome organises its walls and structures differently. */
export const BIOME_LAYOUT: Record<FrontierBiome, { layout: Layout; wall: number; pool?: number }> = {
  sakura: { layout: 'groves', wall: TREE },
  moonwood: { layout: 'cells', wall: DTREE },
  prism: { layout: 'maze', wall: CRYSTAL },
  coral: { layout: 'cells', wall: PALM, pool: WATER },
  bamboo: { layout: 'terraces', wall: PALM },
  thunder: { layout: 'ridges', wall: ROCK },
  obsidian: { layout: 'ridges', wall: ROCK, pool: LAVA },
  sunflower: { layout: 'rings', wall: AUTUMN_TREE },
  lavender: { layout: 'terraces', wall: MUSHROOM },
  mangrove: { layout: 'cells', wall: DTREE, pool: WATER },
  aurora: { layout: 'rings', wall: PINE },
  amber: { layout: 'ridges', wall: ROCK },
  spores: { layout: 'cells', wall: MUSHROOM },
  lotus: { layout: 'rings', wall: TREE, pool: WATER },
  marble: { layout: 'maze', wall: PILLAR },
  crimson: { layout: 'groves', wall: AUTUMN_TREE },
  oasis: { layout: 'rooms', wall: WALL, pool: WATER },
};
void CACTUS;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const C = 8;
class Field {
  constructor(public gw: number, public gh: number, public d: Float32Array) {}
  at(x: number, y: number) {
    const fx = x / C, fy = y / C; let i = fx | 0, j = fy | 0;
    if (i > this.gw - 2) i = this.gw - 2; if (j > this.gh - 2) j = this.gh - 2;
    const u = fx - i, v = fy - j, k = j * this.gw + i, d = this.d;
    const a = d[k] + (d[k + 1] - d[k]) * u, b = d[k + this.gw] + (d[k + this.gw + 1] - d[k + this.gw]) * u;
    return a + (b - a) * v;
  }
}
function field(gw: number, gh: number, fn: (i: number, j: number) => number) {
  const d = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) d[j * gw + i] = fn(i, j);
  return new Field(gw, gh, d);
}
const line = (n: number, scale: number, seed: number) => {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = noise(i / scale, 0.5, seed) * 0.65 + noise(i / (scale / 3), 1.5, seed + 1) * 0.35;
  return a;
};
const blend = (v: number, lo: number, hi: number) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

export interface Shape { land(x: number, y: number): boolean; legacy(x: number, y: number): boolean }

/** Coastline with random bays/peninsulas on every side, inland lakes, and a ragged legacy border. */
export function createShape(W: number, H: number): Shape {
  const top = line(W, 170, 201), bottom = line(W, 150, 203), left = line(H, 160, 205), right = line(H, 140, 207);
  const lw = line(H, 36, 211), lh = line(W, 36, 213);
  const gw = Math.ceil(W / C) + 2, gh = Math.ceil(H / C) + 2;
  const lakes = field(gw, gh, (i, j) => noise(i / 14, j / 14, 221) * 0.7 + noise(i / 5, j / 5, 223) * 0.3);
  const thrT = new Float32Array(W), thrB = new Float32Array(W), thrL = new Float32Array(H), thrR = new Float32Array(H);
  for (let x = 0; x < W; x++) {
    const k = blend(x, LEGACY_W + 30, LEGACY_W + 180);
    thrT[x] = (3 + top[x] * 6) * (1 - k) + (6 + top[x] * top[x] * 110) * k;
    thrB[x] = 20 + bottom[x] ** 1.5 * 620;
  }
  for (let y = 0; y < H; y++) {
    const k = blend(y, LEGACY_H + 30, LEGACY_H + 180);
    thrL[y] = (3 + left[y] * 6) * (1 - k) + (10 + left[y] ** 1.5 * 520) * k;
    thrR[y] = 10 + right[y] ** 1.5 * 340;
  }
  const legacy = (x: number, y: number) => x < LEGACY_W - 18 + lw[Math.min(H - 1, y | 0)] * 44 && y < LEGACY_H - 18 + lh[Math.min(W - 1, x | 0)] * 44;
  return {
    legacy,
    land(x, y) {
      if (x < thrL[y] || y < thrT[x] || W - x < thrR[y] || H - y < thrB[x]) return false;
      if (!legacy(x, y) && lakes.at(x, y) > 0.73) return false;
      return true;
    },
  };
}

interface Seed { x: number; y: number; biome: FrontierBiome; s: number }
export interface PaintCtx {
  tiles: Uint8Array; biomes: Uint8Array; W: number; H: number; shape: Shape;
  biomeId: (b: FrontierBiome) => number;
  pushNode: (tx: number, ty: number, item: string) => void;
  road: (pts: [number, number][], width?: number) => void;
}

export function paintFrontier(o: PaintCtx) {
  const { tiles, biomes, W, H, shape } = o;
  const r = rng(0x5eed1e);
  const seeds: Seed[] = FRONTIER_GATES.map(g => ({ x: g.tx, y: g.ty, biome: g.biome, s: 1 }));
  for (let tries = 0; seeds.length < 135 && tries < 6000; tries++) {
    const x = 20 + r() * (W - 40), y = 20 + r() * (H - 40);
    if (shape.legacy(x, y) || !shape.land(x | 0, y | 0)) continue;
    const minD = 80 + r() * 80;
    if (seeds.some(s => Math.hypot(s.x - x, s.y - y) < minD)) continue;
    seeds.push({ x, y, biome: FRONTIER_KEYS[Math.floor(r() * FRONTIER_KEYS.length)], s: 0.55 + r() * 1.0 });
  }
  // Weighted (power) Voronoi on a coarse grid; per-tile domain warp makes the borders organic.
  const gw = Math.ceil(W / C) + 2, gh = Math.ceil(H / C) + 2;
  const region = new Uint16Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const x = i * C, y = j * C; let best = 0, bd = Infinity;
    for (let k = 0; k < seeds.length; k++) { const s = seeds[k], d = ((s.x - x) ** 2 + (s.y - y) ** 2) / (s.s * s.s); if (d < bd) { bd = d; best = k; } }
    region[j * gw + i] = best;
  }
  const wx = field(gw, gh, (i, j) => (noise(i / 5, j / 5, 231) - 0.5) * 34 + (noise(i / 1.7, j / 1.7, 233) - 0.5) * 12);
  const wy = field(gw, gh, (i, j) => (noise(i / 5, j / 5, 235) - 0.5) * 34 + (noise(i / 1.7, j / 1.7, 237) - 0.5) * 12);
  const fa = field(gw, gh, (i, j) => noise(i / 3.2, j / 3.2, 241));
  const fb = field(gw, gh, (i, j) => noise(i / 1.4, j / 1.4, 243));
  const ids = FRONTIER_KEYS.map(k => o.biomeId(k));

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (shape.legacy(x, y)) continue;
    const idx = y * W + x;
    const ci = Math.max(0, Math.min(gw - 1, Math.round((x + wx.at(x, y)) / C)));
    const cj = Math.max(0, Math.min(gh - 1, Math.round((y + wy.at(x, y)) / C)));
    const sid = region[cj * gw + ci], s = seeds[sid], b = s.biome, d = FRONTIER[b], L = BIOME_LAYOUT[b];
    biomes[idx] = ids[FRONTIER_KEYS.indexOf(b)];
    if (!shape.land(x, y) && !FRONTIER_GATES.some(g => Math.abs(g.tx - x) < 30 && Math.abs(g.ty - y) < 30)) { tiles[idx] = WATER; continue; }
    const rr = hash(x, y, 777), a = fa.at(x, y), bb = fb.at(x, y);
    let t: number = d.ground;
    const scatter = rr > 0.982 ? d.obstacle : -1;
    const lx = Math.floor(x - s.x + 9000), ly = Math.floor(y - s.y + 9000);
    switch (L.layout) {
      case 'groves': if (a > 0.64 || bb > 0.8) t = L.wall; else if (scatter >= 0) t = scatter; break;
      case 'maze': {
        const cs = 11, gx = lx % cs, gy = ly % cs, cx = Math.floor(lx / cs), cy = Math.floor(ly / cs);
        if ((gx === 0 && hash(cx, cy, 301 + sid) > 0.42 && (gy < 4 || gy > 6)) || (gy === 0 && hash(cx, cy, 303 + sid) > 0.42 && (gx < 4 || gx > 6))) t = L.wall;
        else if (rr > 0.99) t = d.obstacle;
        break;
      }
      case 'rings': {
        const dd = Math.hypot(x - s.x, y - s.y), band = Math.floor(dd / 17);
        const seg = Math.floor(((Math.atan2(y - s.y, x - s.x) + Math.PI) / (Math.PI * 2)) * (8 + band * 3));
        if (dd > 9 && dd % 17 < 1.5 && hash(seg, band, 307 + sid) > 0.3) t = L.wall; else if (scatter >= 0) t = scatter;
        break;
      }
      case 'ridges':
        if ((Math.abs(a - 0.5) < 0.022 || Math.abs(bb - 0.5) < 0.016) && hash(x >> 3, y >> 3, 311 + sid) > 0.18) t = L.wall;
        else if (rr > 0.975) t = d.obstacle;
        break;
      case 'terraces': {
        const band = (y + a * 40) / 13, f = band - Math.floor(band);
        if (f < 0.09 && hash(Math.floor(x / 8), Math.floor(band), 313 + sid) > 0.32) t = L.wall; else if (scatter >= 0) t = scatter;
        break;
      }
      case 'cells': {
        const f = (a * 6) % 1;
        if (f < 0.07 && hash(x >> 2, y >> 2, 317 + sid) > 0.25) t = L.wall; else if (scatter >= 0) t = scatter;
        break;
      }
      case 'rooms': {
        const cs = 17, gx = lx % cs, gy = ly % cs, h = hash(Math.floor(lx / cs), Math.floor(ly / cs), 319 + sid);
        const rw = 6 + Math.floor(h * 97) % 7, rh = 5 + Math.floor(h * 53) % 6;
        const inRoom = h > 0.45 && gx >= 2 && gy >= 2 && gx <= 2 + rw && gy <= 2 + rh;
        const border = inRoom && (gx === 2 || gy === 2 || gx === 2 + rw || gy === 2 + rh);
        const door = gy === 2 + rh && Math.abs(gx - (2 + (rw >> 1))) < 1 || gx === 2 && h > 0.8 && gy === 2 + (rh >> 1);
        if (border && !door) t = L.wall; else if (!inRoom && scatter >= 0) t = scatter;
        break;
      }
    }
    if (L.pool !== undefined && bb < 0.2) t = L.pool;
    tiles[idx] = t;
    if (x % 32 === 8 && y % 24 === 8 && !SOLID_IDS.has(t)) o.pushNode(x, y, rr < 0.35 ? 'iron_ore' : d.resource);
  }

  // Random connection graph: spanning tree (all regions reachable) + random extra links.
  const n = seeds.length, inTree = new Array(n).fill(false), bestD = new Array(n).fill(Infinity), from = new Array(n).fill(-1);
  const edges: [number, number][] = [];
  bestD[0] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1; for (let k = 0; k < n; k++) if (!inTree[k] && (u < 0 || bestD[k] < bestD[u])) u = k;
    inTree[u] = true; if (from[u] >= 0) edges.push([from[u], u]);
    for (let k = 0; k < n; k++) if (!inTree[k]) { const dd = Math.hypot(seeds[k].x - seeds[u].x, seeds[k].y - seeds[u].y) * (0.7 + hash(u, k, 401) * 0.6); if (dd < bestD[k]) { bestD[k] = dd; from[k] = u; } }
  }
  for (let k = 0; k < n; k++) {
    if (r() > 0.4) continue;
    const near = seeds.map((s, i) => [i, Math.hypot(s.x - seeds[k].x, s.y - seeds[k].y)] as [number, number]).sort((p, q) => p[1] - q[1]);
    const pick = near[2 + Math.floor(r() * 3)];
    if (pick && pick[1] < 520) edges.push([k, pick[0]]);
  }
  const bent = (ax: number, ay: number, bx: number, by: number): [number, number][] => {
    const len = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / len, ny = (bx - ax) / len, pts: [number, number][] = [[ax, ay]];
    for (const t of [0.33, 0.66]) { const off = (r() - 0.5) * len * 0.35; pts.push([Math.round(ax + (bx - ax) * t + nx * off), Math.round(ay + (by - ay) * t + ny * off)]); }
    pts.push([bx, by]);
    return pts.map(([px, py]) => [Math.max(4, Math.min(W - 5, px)), Math.max(4, Math.min(H - 5, py))] as [number, number]);
  };
  for (const [a, b] of edges) o.road(bent(Math.round(seeds[a].x), Math.round(seeds[a].y), Math.round(seeds[b].x), Math.round(seeds[b].y)), 1 + Math.floor(r() * 2));
  // Old-world crossings: randomly chosen anchors on existing legacy roads join the nearest regions.
  const anchors: [number, number][] = [[290, 205], [140, 202], [48, 202], [218, 22], [288, 197]];
  for (const [ax, ay] of anchors.filter((_, i) => i < 2 || r() > 0.35)) {
    const near = seeds.map((s, i) => [i, Math.hypot(s.x - ax, s.y - ay)] as [number, number]).sort((p, q) => p[1] - q[1]);
    const t = seeds[near[Math.floor(r() * 2)][0]];
    o.road(bent(ax, ay, Math.round(t.x), Math.round(t.y)), 2);
  }
  return { seeds, edges };
}
