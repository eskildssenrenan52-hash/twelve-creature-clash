// Pintura detalhada dos tiles do chão e das paredes (16x16, sem emendas visíveis).
// Cada pixel recebe sombreamento por ruído periódico, luz vinda do alto à esquerda,
// relevo, rachaduras e pequenos detalhes. Chamado por buildTiles depois do desenho base.
import { T, TS, hash } from "./world";
import { FRONTIER } from "./frontier";

type Ctx = CanvasRenderingContext2D;
export type RGB = [number, number, number];

export const rgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h.slice(0, 6);
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const shade = (c: RGB, k: number): RGB => (k >= 0 ? mix(c, [255, 250, 235], k) : mix(c, [18, 14, 30], -k));

export class Pix {
  d: ImageData;
  constructor(public c: Ctx) { this.d = c.getImageData(0, 0, TS, TS); }
  get(x: number, y: number): RGB { const i = ((y & 15) * TS + (x & 15)) * 4; return [this.d.data[i]!, this.d.data[i + 1]!, this.d.data[i + 2]!]; }
  set(x: number, y: number, col: RGB, a = 1) {
    if (x < 0 || y < 0 || x >= TS || y >= TS) return;
    const i = (y * TS + x) * 4, o = this.get(x, y), m = a >= 1 ? col : mix(o, col, a);
    this.d.data[i] = m[0]; this.d.data[i + 1] = m[1]; this.d.data[i + 2] = m[2]; this.d.data[i + 3] = 255;
  }
  fill(f: (x: number, y: number) => RGB | null) { for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const c = f(x, y); if (c) this.set(x, y, c); } }
  done() { this.c.putImageData(this.d, 0, 0); }
}

/** Ruído de valor periódico (repete a cada 16px, então os tiles encaixam). */
export function pn(x: number, y: number, cell: number, s: number) {
  const n = TS / cell, gx = x / cell, gy = y / cell, xi = Math.floor(gx), yi = Math.floor(gy);
  const fx = gx - xi, fy = gy - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const h = (a: number, b: number) => hash(((a % n) + n) % n, ((b % n) + n) % n, s);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
export const fbm = (x: number, y: number, s: number) => pn(x, y, 8, s) * 0.5 + pn(x, y, 4, s + 3) * 0.32 + pn(x, y, 2, s + 9) * 0.18;

/** Chão orgânico: tons em manchas, grãos, pedrinhas com luz e sombra. */
export function ground(p: Pix, base: string, flecks: string[], v: number, opts: { pebbles?: number; grain?: number; seed?: number } = {}) {
  const b = rgb(base), fl = flecks.map(rgb), s = (opts.seed ?? 0) + v * 17;
  p.fill((x, y) => {
    const n = fbm(x, y, s) - 0.5, g = hash(x, y, s + 5) - 0.5;
    let c = shade(b, n * 0.34 + g * (opts.grain ?? 0.07));
    const pick = pn(x, y, 4, s + 21);
    if (fl.length && pick > 0.68) c = mix(c, fl[Math.floor(hash(x >> 2, y >> 2, s + 2) * fl.length)]!, Math.min(1, (pick - 0.68) * 3));
    return c;
  });
  const peb = opts.pebbles ?? 2;
  for (let i = 0; i < peb; i++) {
    const x = Math.floor(hash(i, v, s + 40) * 14) + 1, y = Math.floor(hash(i, v, s + 41) * 14) + 1;
    const pc = shade(fl[i % Math.max(1, fl.length)] ?? b, 0.05);
    p.set(x, y, pc); p.set(x + 1, y, shade(pc, -0.12)); p.set(x, y - 1, shade(pc, 0.3), 0.8); p.set(x + 1, y + 1, shade(b, -0.35), 0.7);
  }
}

export function grassBlades(p: Pix, base: RGB, v: number, n = 7, flowers: RGB[] = []) {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, v, 77) * 16), y = 3 + Math.floor(hash(i, v, 78) * 12), h = 2 + Math.floor(hash(i, v, 79) * 3);
    for (let k = 0; k < h; k++) p.set(x + (k === h - 1 && i % 2 ? 1 : 0), y - k, shade(base, k === h - 1 ? 0.28 : -0.22 + k * 0.08));
    p.set(x + 1, y, shade(base, -0.4), 0.5);
  }
  flowers.forEach((fc, i) => {
    const x = 2 + Math.floor(hash(i, v, 91) * 12), y = 3 + Math.floor(hash(i, v, 92) * 11);
    p.set(x, y + 1, shade(base, -0.3)); p.set(x, y + 2, shade(base, -0.2));
    p.set(x - 1, y, fc); p.set(x + 1, y, fc); p.set(x, y - 1, shade(fc, 0.25)); p.set(x, y + 1, shade(fc, -0.2), 0.5); p.set(x, y, [255, 226, 120]);
  });
}

function water(p: Pix, v: number, deep: string, light: string, foam = "#e8f6ff") {
  const d = rgb(deep), l = rgb(light), f = rgb(foam);
  p.fill((x, y) => {
    const w = Math.sin((x + v * 4) * 0.785 + Math.sin(y * 0.6) * 1.4) * 0.5 + 0.5;
    const n = fbm(x, y, 300 + v);
    let c = mix(d, l, n * 0.55 + w * 0.2);
    const crest = Math.sin((x * 0.39 + y * 0.785 + v * 1.57)) * Math.sin(y * 0.785 - v * 0.8 + x * 0.2);
    if (crest > 0.82) c = mix(c, f, (crest - 0.82) * 4);
    return c;
  });
  for (let i = 0; i < 3; i++) { const x = Math.floor(hash(i, v, 33) * 15), y = Math.floor(hash(i, v, 34) * 15); p.set(x, y, f, 0.9); if (i === 0) p.set(x + 1, y, f, 0.5); }
}

function bricks(p: Pix, base: string, mortar: string, rowH: number, brickW: number, v: number, seed: number) {
  const b = rgb(base), m = rgb(mortar);
  p.fill((x, y) => {
    const row = Math.floor(y / rowH), off = (row % 2) * (brickW >> 1), bx = Math.floor((x + off) / brickW);
    const lx = (x + off) % brickW, ly = y % rowH;
    if (ly === rowH - 1 || lx === brickW - 1) return shade(m, (hash(x, y, seed) - 0.5) * 0.15);
    const tone = (hash(bx, row, seed + v) - 0.5) * 0.22, n = (fbm(x, y, seed + 4) - 0.5) * 0.18;
    let c = shade(b, tone + n);
    if (ly === 0) c = shade(c, 0.22); else if (lx === 0) c = shade(c, 0.12);
    if (ly === rowH - 2) c = shade(c, -0.16);
    return c;
  });
}

function rockFacets(p: Pix, base: string, v: number, seed: number) {
  const b = rgb(base);
  const pts = Array.from({ length: 6 }, (_, i) => [hash(i, v, seed) * 16, hash(i, v, seed + 1) * 16, (hash(i, v, seed + 2) - 0.5) * 0.4] as const);
  p.fill((x, y) => {
    let best = 1e9, second = 1e9, k = 0;
    for (const [px, py, t] of pts) for (const ox of [-16, 0, 16]) for (const oy of [-16, 0, 16]) {
      const d = (x - px - ox) ** 2 + (y - py - oy) ** 2;
      if (d < best) { second = best; best = d; k = t; } else if (d < second) second = d;
    }
    const edge = Math.sqrt(second) - Math.sqrt(best);
    let c = shade(b, k + (fbm(x, y, seed + 9) - 0.5) * 0.25);
    if (edge < 0.9) c = shade(b, -0.55);
    else if (edge < 1.8) c = shade(c, 0.2);
    return c;
  });
}

/** Repinta com riqueza de detalhes os tiles de chão e parede. Retorna false para manter o desenho original. */
export function paintDetailed(c: Ctx, t: number, v: number): boolean {
  const frontier = Object.values(FRONTIER).find((d) => d.ground === t);
  const p = new Pix(c);
  if (frontier) {
    ground(p, frontier.base, [...frontier.flecks], v, { pebbles: 3, seed: t * 13 });
    grassBlades(p, rgb(frontier.base), v, 3);
    p.done(); return true;
  }
  switch (t) {
    case T.GRASS: {
      ground(p, "#4f9a4c", ["#5fae58", "#3f8743", "#6cb862"], v, { pebbles: 0, seed: 1 });
      grassBlades(p, rgb("#4f9a4c"), v, 9);
      break;
    }
    case T.FLOWER: {
      ground(p, "#4fa040", ["#60b052", "#3e8a36"], v, { pebbles: 0, seed: 2 });
      grassBlades(p, rgb("#4fa040"), v, 6, [["#ff6f8e", "#ffe35a", "#ffffff", "#8fb0ff"][v & 3]!, ["#ffd24a", "#ff7aa0", "#c890ff", "#fff3c4"][v & 3]!].map(rgb));
      break;
    }
    case T.MEADOW: {
      ground(p, "#86b076", ["#9cc488", "#729e68"], v, { pebbles: 0, seed: 3 });
      grassBlades(p, rgb("#86b076"), v, 6, ["#f2bccb", "#f5e3a0", "#c9d8f2"].map(rgb));
      break;
    }
    case T.MOSS: ground(p, "#468e78", ["#5ba487", "#357066", "#79b07c"], v, { seed: 4 }); grassBlades(p, rgb("#468e78"), v, 4); break;
    case T.AUTUMN: {
      ground(p, "#97a05d", ["#d6ae66", "#c2834f", "#a85c3e", "#71905a"], v, { seed: 5 });
      for (let i = 0; i < 4; i++) { const x = Math.floor(hash(i, v, 55) * 14) + 1, y = Math.floor(hash(i, v, 56) * 14) + 1, lc = rgb(["#e3a24f", "#c9603c", "#f0c96a", "#a8452f"][i]!); p.set(x, y, lc); p.set(x + 1, y, shade(lc, -0.2)); p.set(x, y + 1, shade(lc, -0.35)); }
      break;
    }
    case T.PATH: ground(p, "#c7a468", ["#b38e55", "#dcbd86", "#9f7c48"], v, { pebbles: 4, grain: 0.1, seed: 6 }); break;
    case T.SAND: {
      ground(p, "#e6c77c", ["#d7b466", "#f2dc9a"], v, { pebbles: 1, seed: 7 });
      p.fill((x, y) => { const r = Math.sin((y + v * 2) * 0.785 + Math.sin(x * 0.4) * 0.9); return r > 0.9 ? shade(p.get(x, y), -0.1) : r < -0.92 ? shade(p.get(x, y), 0.12) : null; });
      break;
    }
    case T.DUNE: {
      ground(p, "#dcb868", ["#c9a052", "#edd18c"], v, { pebbles: 0, seed: 8 });
      p.fill((x, y) => { const r = Math.sin((y * 0.5 + x * 0.2 + v) * 1.2); return r > 0.85 ? shade(p.get(x, y), -0.18) : r > 0.6 ? shade(p.get(x, y), 0.14) : null; });
      break;
    }
    case T.SNOW: {
      ground(p, "#eef3fd", ["#d7e2f5", "#ffffff", "#c6d4ee"], v, { pebbles: 0, grain: 0.03, seed: 9 });
      for (let i = 0; i < 3; i++) p.set(Math.floor(hash(i, v, 66) * 16), Math.floor(hash(i, v, 67) * 16), [255, 255, 255]);
      p.set(Math.floor(hash(9, v, 66) * 16), Math.floor(hash(9, v, 67) * 16), [176, 214, 255]);
      break;
    }
    case T.ICE: {
      const a = rgb("#9fd2ee"), b = rgb("#d9f3ff");
      p.fill((x, y) => mix(a, b, (fbm(x, y, 400 + v) * 0.6 + (1 - (x + y) / 30) * 0.4)));
      for (let k = 0; k < 6; k++) p.set(2 + k + (v & 3), 3 + k, [245, 252, 255], 0.8);
      for (let k = 0; k < 5; k++) p.set(12 - k, 9 + (k >> 1), rgb("#6fa8cc"));
      p.set(3, 12, [255, 255, 255]);
      break;
    }
    case T.WATER: water(p, v, "#1d58b8", "#4f97ec"); break;
    case T.LAVA: {
      const crust = rgb("#4a1e22"), hot = rgb("#ff8a3a"), white = rgb("#ffe7a0");
      p.fill((x, y) => {
        const n = fbm(x + v * 1.5, y, 500), vein = Math.abs(pn(x, y + v, 4, 510) - 0.5);
        let c = mix(rgb("#c2442f"), hot, n);
        if (vein < 0.08) c = mix(hot, white, 1 - vein / 0.08);
        if (n < 0.35) c = mix(crust, c, n / 0.35);
        return c;
      });
      break;
    }
    case T.ASH: ground(p, "#6f6870", ["#8b7b7b", "#565262", "#b5866f"], v, { pebbles: 3, seed: 10 }); if (v === 2) { p.set(7, 8, rgb("#ff9a4a")); p.set(8, 8, rgb("#c2442f")); } break;
    case T.CAVE: ground(p, "#3b3152", ["#2c2440", "#493e64", "#55467a"], v, { pebbles: 4, seed: 11 }); break;
    case T.CWALL: {
      rockFacets(p, "#2a2140", v, 600);
      p.fill((x, y) => (y >= 13 ? shade(p.get(x, y), -0.35 - (y - 13) * 0.1) : y <= 1 ? shade(p.get(x, y), 0.12) : null));
      if (v === 1) { p.set(5, 6, rgb("#9a7fe0")); p.set(6, 6, rgb("#cdb8ff")); }
      break;
    }
    case T.COBBLE: {
      const pts = Array.from({ length: 7 }, (_, i) => [hash(i, v, 700) * 16, hash(i, v, 701) * 16, (hash(i, v, 702) - 0.5) * 0.3] as const);
      p.fill((x, y) => {
        let best = 1e9, second = 1e9, cx = 0, cy = 0, k = 0;
        for (const [px, py, t] of pts) for (const ox of [-16, 0, 16]) for (const oy of [-16, 0, 16]) {
          const d = (x - px - ox) ** 2 + (y - py - oy) ** 2;
          if (d < best) { second = best; best = d; cx = px + ox; cy = py + oy; k = t; } else if (d < second) second = d;
        }
        const edge = Math.sqrt(second) - Math.sqrt(best);
        if (edge < 1.1) return hash(x, y, 703) < 0.18 ? rgb("#5f8a4e") : rgb("#6c6056");
        const lit = ((cx - x) + (cy - y)) / 8;
        return shade(rgb("#b4a492"), k + lit * 0.28 + (hash(x, y, 704) - 0.5) * 0.06);
      });
      break;
    }
    case T.RUINS: {
      bricks(p, "#a3a89c", "#62746e", 8, 8, v, 800);
      for (let k = 0; k < 5; k++) p.set(3 + k, 2 + ((k * 3) % 4), rgb("#5b6964"));
      for (let i = 0; i < 4; i++) p.set(Math.floor(hash(i, v, 801) * 16), 6 + (i % 2) * 8, rgb(i % 2 ? "#6f9a58" : "#88b06a"));
      break;
    }
    case T.WALL: {
      bricks(p, "#e8dcbf", "#b3a184", 4, 8, v, 900);
      p.fill((x, y) => (y === 0 ? rgb("#6b4b2e") : y === 1 ? rgb("#9a7550") : null));
      if (v === 0) {
        p.fill((x, y) => (x >= 4 && x <= 11 && y >= 5 ? shade(rgb("#6c4224"), (x === 4 ? 0.2 : x === 11 ? -0.3 : 0) + (x % 2 ? -0.06 : 0.04)) : null));
        for (let x = 4; x <= 11; x++) p.set(x, 5, rgb("#8d5c33"));
        p.set(5, 8, rgb("#2b2a30")); p.set(5, 12, rgb("#2b2a30")); p.set(10, 10, rgb("#ffd34a")); p.set(10, 9, rgb("#fff1a8"));
        for (let x = 3; x <= 12; x++) p.set(x, 4, rgb("#5a3a20"));
      } else {
        p.fill((x, y) => (x >= 3 && x <= 12 && y >= 3 && y <= 10 ? rgb("#5a3a20") : null));
        p.fill((x, y) => (x >= 4 && x <= 11 && y >= 4 && y <= 9 ? mix(rgb("#4d82cf"), rgb("#a9d4ff"), Math.max(0, 1 - (x - 4 + y - 4) / 8)) : null));
        for (let y = 4; y <= 9; y++) p.set(7, y, rgb("#6b4b2e")); for (let x = 4; x <= 11; x++) p.set(x, 6, rgb("#6b4b2e"));
        p.set(5, 5, [255, 255, 255]); p.set(9, 7, [230, 244, 255], 0.8);
        for (let x = 2; x <= 13; x++) { p.set(x, 11, rgb("#9a7550")); p.set(x, 12, rgb("#5a3a20"), 0.5); }
        if (v === 2) { p.set(4, 10, rgb("#e2577a")); p.set(6, 10, rgb("#ffd24a")); p.set(9, 10, rgb("#e2577a")); p.set(11, 10, rgb("#ffffff")); }
      }
      break;
    }
    case T.ROOF: {
      const base = rgb(["#c24a31", "#b8442c", "#c9543a", "#bc4a30"][v & 3]!);
      p.fill((x, y) => {
        const row = y >> 2, off = (row % 2) * 2, lx = (x + off) % 4, ly = y % 4;
        const curve = Math.abs(lx - 1.5) / 1.5;
        let c = shade(base, (hash((x + off) >> 2, row, 950 + v) - 0.5) * 0.2 + (ly === 0 ? 0.2 : ly === 3 ? -0.35 : 0) - curve * 0.12);
        if (ly === 3 && curve > 0.6) c = shade(base, -0.55);
        return c;
      });
      break;
    }
    case T.FLOOR: {
      const wood = rgb("#a4754c");
      p.fill((x, y) => {
        const plank = y >> 2, ly = y & 3, seam = (x + plank * 5) % 16 === 0;
        if (ly === 3 || seam) return shade(wood, -0.4);
        const grain = Math.sin(x * 0.9 + plank * 2 + Math.sin(x * 0.3 + plank) * 2) * 0.5;
        return shade(wood, (hash(plank, (x + plank * 5) >> 4, 960 + v) - 0.5) * 0.2 + grain * 0.07 + (ly === 0 ? 0.12 : 0));
      });
      p.set(2, 1, rgb("#4a3020")); p.set(13, 9, rgb("#4a3020"));
      break;
    }
    case T.BRIDGE: {
      water(p, v, "#1d58b8", "#4f97ec");
      const wood = rgb("#9a6a3a");
      p.fill((x, y) => {
        if (x < 1 || x > 14) return null;
        const ly = y & 3;
        if (ly === 3) return shade(wood, -0.5);
        return shade(wood, (hash(y >> 2, 0, 970 + v) - 0.5) * 0.25 + (ly === 0 ? 0.2 : 0) + Math.sin(x * 1.3 + (y >> 2)) * 0.04);
      });
      for (let y = 0; y < 16; y++) { p.set(0, y, rgb("#d8c08a")); p.set(15, y, rgb("#b89a64")); }
      for (let y = 1; y < 16; y += 4) { p.set(2, y, rgb("#3a2a20")); p.set(13, y, rgb("#3a2a20")); }
      break;
    }
    case T.PANEL: {
      bricks(p, "#ddd4b1", "#bfb38e", 16, 4, v, 980);
      p.fill((x, y) => (x < 2 ? rgb(x === 0 ? "#4a3428" : "#7a5a44") : y >= 12 ? shade(rgb("#654b39"), y === 12 ? 0.25 : -(y - 12) * 0.1) : null));
      break;
    }
    case T.DOOR: {
      p.fill((x, y) => (x < 2 || x > 13 ? shade(rgb("#553b32"), x === 0 ? 0.2 : -0.1) : shade(rgb("#3a2e2a"), (x % 3 === 0 ? -0.3 : 0) + (hash(x, y, 990) - 0.5) * 0.1)));
      for (let x = 2; x < 14; x++) { p.set(x, 3, rgb("#6b6f78")); p.set(x, 10, rgb("#6b6f78")); }
      p.set(11, 7, rgb("#ffd34a")); p.set(11, 6, rgb("#fff1a8"));
      p.fill((x, y) => (y >= 14 ? rgb(y === 14 ? "#e0c98f" : "#a68c5a") : null));
      break;
    }
    default: return false;
  }
  if (v >= 4) embellish(p, t, v);
  p.done();
  return true;
}

/** Quantidade de variações por tile: 0–3 são as bases; 4–11 recebem detalhes únicos. */
export const TILE_VARIANTS = 12;
/** Escolhe a variação de um tile no mapa: 60% bases limpas, 40% com detalhes, para não ficar repetitivo nem poluído. */
export function pickVariant(r: number) { return r < 0.6 ? Math.floor((r / 0.6) * 4) : 4 + Math.min(7, Math.floor(((r - 0.6) / 0.4) * 8)); }

const GRASSY = new Set<number>([T.GRASS, T.FLOWER, T.MEADOW, T.MOSS, T.AUTUMN]);
const SANDY = new Set<number>([T.SAND, T.DUNE, T.PATH, T.ASH]);
const COLD = new Set<number>([T.SNOW, T.ICE]);
const STONY = new Set<number>([T.CAVE, T.COBBLE, T.RUINS, T.FLOOR, T.BRIDGE]);

/** Pequenos detalhes desenhados à mão que deixam cada variação diferente. */
function embellish(p: Pix, t: number, v: number) {
  const k = v - 4, r = (i: number, s: number) => hash(i, v, t * 31 + s);
  const cx = 3 + Math.floor(r(1, 1) * 10), cy = 4 + Math.floor(r(1, 2) * 9);
  const under = p.get(cx, cy), dark = shade(under, -0.42), lite = shade(under, 0.3);
  const crack = (len: number, col: RGB) => { let x = cx, y = cy; for (let i = 0; i < len; i++) { p.set(x, y, col); p.set(x + 1, y, shade(col, 0.5), 0.35); x += r(i, 9) > 0.5 ? 1 : 0; y += r(i, 10) > 0.35 ? 1 : 0; if (r(i, 11) > 0.8) x--; } };
  const stones = (n: number) => { for (let i = 0; i < n; i++) { const x = cx + Math.floor(r(i, 20) * 5) - 2, y = cy + Math.floor(r(i, 21) * 4) - 2, g: RGB = shade([150, 146, 140], (r(i, 22) - 0.5) * 0.4); p.set(x, y, g); p.set(x + 1, y, shade(g, -0.15)); p.set(x, y - 1, shade(g, 0.35), 0.8); p.set(x, y + 1, dark, 0.6); p.set(x + 1, y + 1, dark, 0.5); } };
  const isFrontier = Object.values(FRONTIER).some((d) => d.ground === t);
  if (GRASSY.has(t) || isFrontier) {
    switch (k) {
      case 0: { const cl = shade(under, 0.18); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 1], [2, 1]]) p.set(cx + dx!, cy + dy!, (dx! + dy!) % 2 ? cl : shade(cl, 0.12)); p.set(cx, cy + 2, dark); break; }
      case 1: { const cap: RGB = r(3, 3) > 0.5 ? [200, 64, 54] : [214, 168, 96]; p.set(cx, cy + 1, [236, 226, 200]); p.set(cx, cy + 2, [210, 198, 170]); p.set(cx - 1, cy, cap); p.set(cx, cy, shade(cap, 0.15)); p.set(cx + 1, cy, shade(cap, -0.2)); p.set(cx, cy - 1, shade(cap, 0.3)); p.set(cx, cy, [255, 246, 220], 0.5); p.set(cx + 1, cy + 2, dark, 0.6); break; }
      case 2: stones(3); break;
      case 3: { const tw: RGB = [120, 84, 52]; for (let i = 0; i < 5; i++) { p.set(cx - 2 + i, cy + (i >> 1), shade(tw, i === 0 ? 0.2 : 0)); p.set(cx - 2 + i, cy + 1 + (i >> 1), dark, 0.5); } p.set(cx, cy - 1, shade(tw, 0.1)); break; }
      case 4: { for (let i = 0; i < 3; i++) { const x = cx + i * 2 - 2, y = cy + (i % 2); p.set(x, y + 1, shade(under, -0.25)); p.set(x, y, [255, 236, 90]); p.set(x - 1, y, [255, 250, 200], 0.7); p.set(x + 1, y, [240, 200, 60], 0.7); } break; }
      case 5: { for (let y = -2; y <= 2; y++) for (let x = -3; x <= 3; x++) if (x * x / 9 + y * y / 4 <= 1) p.set(cx + x, cy + y, shade(under, -0.14 - (y > 0 ? 0.06 : 0)), 0.85); grassBlade(p, cx, cy, under); grassBlade(p, cx + 2, cy + 1, under); break; }
      case 6: { const dirt: RGB = [128, 98, 64]; for (let y = -1; y <= 1; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 3) p.set(cx + x, cy + y, shade(dirt, (hash(x, y, v) - 0.5) * 0.3), Math.abs(x) === 2 ? 0.5 : 0.9); p.set(cx - 1, cy - 1, shade(dirt, 0.3)); break; }
      default: { for (let i = 0; i < 5; i++) p.set(Math.floor(r(i, 40) * 16), Math.floor(r(i, 41) * 16), [235, 250, 255], 0.75); p.set(cx, cy, lite); break; }
    }
  } else if (SANDY.has(t)) {
    switch (k % 6) {
      case 0: { const sh: RGB = t === T.ASH ? [190, 170, 160] : [246, 222, 214]; p.set(cx, cy, sh); p.set(cx + 1, cy, shade(sh, -0.1)); p.set(cx - 1, cy, shade(sh, -0.1)); p.set(cx, cy - 1, shade(sh, 0.15)); p.set(cx, cy + 1, [214, 150, 140]); p.set(cx + 1, cy + 1, dark, 0.5); break; }
      case 1: crack(6, dark); break;
      case 2: { for (const [dx, dy] of [[0, 0], [3, -3], [0, -6]]) { p.set(cx + dx!, cy + dy! + 3, dark, 0.55); p.set(cx + dx! + 1, cy + dy! + 3, dark, 0.55); p.set(cx + dx!, cy + dy! + 4, dark, 0.45); } break; }
      case 3: stones(4); break;
      case 4: { const tw: RGB = t === T.ASH ? [60, 50, 50] : [150, 120, 80]; for (let i = 0; i < 4; i++) p.set(cx - 2 + i, cy - (i >> 1), tw); p.set(cx + 1, cy + 1, tw); p.set(cx + 2, cy, dark, 0.5); break; }
      default: { if (t === T.ASH) { p.set(cx, cy, [255, 140, 60]); p.set(cx + 1, cy, [190, 70, 40]); p.set(cx, cy - 1, [255, 220, 140], 0.6); } else { const b: RGB = [236, 230, 214]; p.set(cx - 1, cy, b); p.set(cx, cy, b); p.set(cx + 1, cy, b); p.set(cx - 2, cy - 1, b); p.set(cx + 2, cy + 1, b); p.set(cx, cy + 1, dark, 0.5); } }
    }
  } else if (COLD.has(t)) {
    switch (k % 4) {
      case 0: { const ic: RGB = [210, 240, 255]; p.set(cx, cy, [255, 255, 255]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.set(cx + dx!, cy + dy!, ic); p.set(cx + 2, cy, ic, 0.5); p.set(cx - 2, cy, ic, 0.5); break; }
      case 1: { for (const [dx, dy] of [[0, 0], [2, -3], [0, -6]]) { p.set(cx + dx!, cy + dy! + 3, [168, 190, 226], 0.8); p.set(cx + dx!, cy + dy! + 4, [190, 208, 236], 0.7); } break; }
      case 2: crack(5, [120, 170, 210]); break;
      default: stones(2);
    }
  } else if (STONY.has(t)) {
    switch (k % 5) {
      case 0: crack(6, dark); break;
      case 1: { const m: RGB = [86, 134, 70]; for (let i = 0; i < 6; i++) p.set(cx + Math.floor(r(i, 50) * 4) - 1, cy + Math.floor(r(i, 51) * 3) - 1, shade(m, (r(i, 52) - 0.5) * 0.4)); break; }
      case 2: { const w: RGB = [70, 110, 160]; for (let x = -2; x <= 2; x++) { p.set(cx + x, cy, w, 0.55); if (Math.abs(x) < 2) p.set(cx + x, cy + 1, w, 0.45); } p.set(cx - 1, cy, [200, 230, 255], 0.7); break; }
      case 3: stones(2); break;
      default: { p.set(cx, cy, dark); p.set(cx + 1, cy, dark, 0.7); p.set(cx, cy - 1, lite); p.set(cx - 1, cy - 1, lite, 0.6); }
    }
  }
}
function grassBlade(p: Pix, x: number, y: number, base: RGB) { for (let k = 0; k < 3; k++) p.set(x + (k === 2 ? 1 : 0), y - k, shade(base, k === 2 ? 0.3 : -0.2 + k * 0.1)); }
