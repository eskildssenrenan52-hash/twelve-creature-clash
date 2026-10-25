// Tiles próprios de cada bioma: cada um dos 30 biomas recebe sua paleta, textura e
// pequenos detalhes desenhados pixel a pixel, para que o mesmo tipo de chão (grama,
// areia, trilha...) tenha cara diferente em cada região. Gerado sob demanda e guardado em cache.
import { T, TS, hash } from "./world";
import { FRONTIER } from "./frontier";
import { Pix, rgb, mix, shade, pn, fbm, type RGB } from "./tile-art";

type Pattern = "none" | "mottle" | "cracks" | "ripples" | "damp" | "roots" | "frost" | "glow" | "veins" | "litter" | "slabs" | "streaks" | "moss" | "hex";
type MotifName =
  | "flower" | "tuft" | "pebble" | "mushroom" | "leaf" | "petals" | "crystal" | "bone" | "shell" | "starfish" | "puddle" | "ember"
  | "rune" | "fern" | "clover" | "tracks" | "lily" | "sparkle" | "twig" | "pinecone" | "seaweed" | "coral" | "amber" | "sprig"
  | "skull" | "snowflake" | "glowdot" | "crack" | "sunpetal" | "feather" | "acorn" | "berry" | "root" | "bamboo" | "spore" | "tile";
type Motif = [MotifName, string[]];
interface Style { tint: string; amt: number; light?: number; pattern: Pattern; pcol: string; motifs: Motif[]; water?: string }

/** 30 biomas, nenhum igual ao outro. */
export const BIOME_STYLES: Record<string, Style> = {
  plains: { tint: "#5cae4c", amt: 0.15, pattern: "mottle", pcol: "#3f8a3a", motifs: [["flower", ["#ffffff", "#ffe35a"]], ["clover", ["#4f9e44"]], ["tuft", ["#7cc663"]], ["pebble", ["#a7a194"]], ["flower", ["#ff8fb0", "#ffe35a"]], ["berry", ["#d8364a"]]] },
  forest: { tint: "#2f7a3e", amt: 0.4, light: -0.12, pattern: "roots", pcol: "#3a2c1c", motifs: [["fern", ["#3e9850"]], ["mushroom", ["#c8402f"]], ["twig", ["#6e4a2c"]], ["acorn", ["#8c5a2c"]], ["leaf", ["#5f9b3a"]], ["root", ["#4d3622"]]] },
  desert: { tint: "#e3b86a", amt: 0.35, pattern: "ripples", pcol: "#b98b46", motifs: [["bone", ["#efe6cf"]], ["pebble", ["#b48a5a"]], ["crack", ["#a3773e"]], ["skull", ["#f1e8d2"]], ["tracks", ["#b38447"]], ["tuft", ["#a9a050"]]] },
  cave: { tint: "#463a68", amt: 0.4, light: -0.08, pattern: "cracks", pcol: "#1f1830", motifs: [["crystal", ["#9f86ff"]], ["pebble", ["#5d5480"]], ["bone", ["#bdb4a4"]], ["glowdot", ["#7fe3ff"]], ["puddle", ["#2b3b66"]], ["mushroom", ["#5ac8c0"]]] },
  mountain: { tint: "#8e96a4", amt: 0.35, pattern: "frost", pcol: "#dfe8f7", motifs: [["pebble", ["#7c8392"]], ["snowflake", ["#ffffff"]], ["crack", ["#5d6372"]], ["tuft", ["#8aa28a"]], ["feather", ["#e8eef8"]], ["crystal", ["#bfe2ff"]]] },
  autumn: { tint: "#c98a3e", amt: 0.38, pattern: "litter", pcol: "#d9692f", motifs: [["leaf", ["#e3a24f"]], ["leaf", ["#c9603c"]], ["acorn", ["#7a4a24"]], ["mushroom", ["#d6a860"]], ["twig", ["#6b4528"]], ["pinecone", ["#6e4426"]]] },
  swamp: { tint: "#4d6e3d", amt: 0.45, light: -0.15, pattern: "damp", pcol: "#2a3e2a", water: "#3f6040", motifs: [["puddle", ["#3b5a4a"]], ["lily", ["#5d9b4a"]], ["mushroom", ["#9fbf55"]], ["glowdot", ["#d8ff7a"]], ["root", ["#3a2e1e"]], ["fern", ["#4f7d3a"]]] },
  coast: { tint: "#f0dca0", amt: 0.25, pattern: "ripples", pcol: "#ffffff", water: "#2a8ad0", motifs: [["shell", ["#f7d6c8"]], ["starfish", ["#f07a52"]], ["seaweed", ["#3f8a5a"]], ["pebble", ["#c9c2b0"]], ["shell", ["#ffffff"]], ["feather", ["#ffffff"]]] },
  jungle: { tint: "#1f8a4a", amt: 0.45, light: -0.06, pattern: "roots", pcol: "#14512c", motifs: [["fern", ["#2fb060"]], ["flower", ["#ff4f7a", "#ffd24a"]], ["berry", ["#7a2fd0"]], ["root", ["#5a3a1c"]], ["leaf", ["#3fbf5a"]], ["flower", ["#ff9a2a", "#ffffff"]]] },
  volcanic: { tint: "#5a3a3a", amt: 0.4, light: -0.1, pattern: "veins", pcol: "#ff6a2a", motifs: [["ember", ["#ff8a3a"]], ["crack", ["#ff5a1a"]], ["pebble", ["#2e2228"]], ["skull", ["#c9b8a8"]], ["ember", ["#ffd15a"]], ["crystal", ["#ff5a3a"]]] },
  mushroom: { tint: "#6a4a8e", amt: 0.4, pattern: "glow", pcol: "#c39bff", motifs: [["mushroom", ["#e8506a"]], ["mushroom", ["#5ad0e0"]], ["spore", ["#e6c8ff"]], ["glowdot", ["#a8ffcf"]], ["mushroom", ["#f0c040"]], ["spore", ["#9af0ff"]]] },
  meadow: { tint: "#9cc46e", amt: 0.25, light: 0.05, pattern: "mottle", pcol: "#b8d888", motifs: [["flower", ["#f2bccb", "#ffe35a"]], ["flower", ["#c9d8f2", "#ffffff"]], ["sprig", ["#b08ae0"]], ["clover", ["#6faa4a"]], ["flower", ["#ffffff", "#ffd24a"]], ["feather", ["#fff6e0"]]] },
  ruins: { tint: "#8f9a88", amt: 0.3, pattern: "slabs", pcol: "#5b6964", motifs: [["rune", ["#6fd0c0"]], ["tile", ["#b8b6a6"]], ["tuft", ["#5f8a4e"]], ["pebble", ["#9a9a8e"]], ["crack", ["#4f5a56"]], ["skull", ["#d8d2c0"]]] },
  sakura: { tint: "#9cc8a2", amt: 0.3, pattern: "litter", pcol: "#f2a8c4", motifs: [["petals", ["#f7b8d0"]], ["petals", ["#ffd8e6"]], ["flower", ["#ffc8dc", "#fff2a0"]], ["twig", ["#6a3e3a"]], ["clover", ["#7ab88a"]], ["sparkle", ["#ffe8f2"]]] },
  moonwood: { tint: "#3e6f8e", amt: 0.45, light: -0.1, pattern: "glow", pcol: "#cfe8ff", motifs: [["mushroom", ["#bfe0ff"]], ["sparkle", ["#e8f4ff"]], ["fern", ["#5a9ab0"]], ["flower", ["#dfe8ff", "#9fd0ff"]], ["glowdot", ["#c8f0ff"]], ["feather", ["#d0dcf0"]]] },
  prism: { tint: "#7ab8c0", amt: 0.35, pattern: "hex", pcol: "#e6c8ff", motifs: [["crystal", ["#ade2da"]], ["crystal", ["#d5b4df"]], ["sparkle", ["#ffffff"]], ["crystal", ["#ffe08a"]], ["glowdot", ["#ff9adf"]], ["pebble", ["#9ac0c8"]]] },
  coral: { tint: "#c8e0c8", amt: 0.3, pattern: "ripples", pcol: "#f6c8c0", water: "#2aa0b8", motifs: [["coral", ["#ff8a8a"]], ["coral", ["#ffb85a"]], ["shell", ["#ffe0d0"]], ["starfish", ["#ff6a8a"]], ["seaweed", ["#4fae8a"]], ["pebble", ["#e0d8c0"]]] },
  bamboo: { tint: "#6aaa70", amt: 0.35, pattern: "streaks", pcol: "#a8d088", motifs: [["bamboo", ["#8ac060"]], ["leaf", ["#a2c883"]], ["pebble", ["#a8a89a"]], ["fern", ["#4f9a68"]], ["bamboo", ["#c8d880"]], ["tuft", ["#6ab07a"]]] },
  thunder: { tint: "#7c8894", amt: 0.4, pattern: "streaks", pcol: "#c8d8ff", motifs: [["crack", ["#e8f0ff"]], ["pebble", ["#5e6874"]], ["sparkle", ["#fff8a0"]], ["tuft", ["#9aa888"]], ["feather", ["#b8c0cc"]], ["rune", ["#a0c8ff"]]] },
  obsidian: { tint: "#3a3048", amt: 0.5, light: -0.12, pattern: "veins", pcol: "#ff7a5a", motifs: [["crystal", ["#2a2236"]], ["ember", ["#ff7a4a"]], ["crack", ["#d84a3a"]], ["pebble", ["#1e1a26"]], ["crystal", ["#a85aff"]], ["skull", ["#a89aa0"]]] },
  sunflower: { tint: "#a8b850", amt: 0.35, light: 0.05, pattern: "mottle", pcol: "#d8c058", motifs: [["sunpetal", ["#ffd030"]], ["flower", ["#ffd030", "#7a4a20"]], ["tuft", ["#c8c860"]], ["berry", ["#e0a020"]], ["feather", ["#f8e8b0"]], ["clover", ["#8aa848"]]] },
  lavender: { tint: "#8aa890", amt: 0.3, pattern: "mottle", pcol: "#b89ad8", motifs: [["sprig", ["#a982d8"]], ["sprig", ["#c8a8f0"]], ["flower", ["#ffffff", "#e0c8ff"]], ["pebble", ["#b8b0c0"]], ["tuft", ["#9ab890"]], ["sparkle", ["#f0e8ff"]]] },
  mangrove: { tint: "#2f7a6e", amt: 0.45, light: -0.1, pattern: "damp", pcol: "#1f4a44", water: "#2a6a6a", motifs: [["root", ["#5a4030"]], ["puddle", ["#2a5a5a"]], ["shell", ["#c8d0b0"]], ["lily", ["#4fa070"]], ["fern", ["#3a9070"]], ["seaweed", ["#2f6a4a"]]] },
  aurora: { tint: "#b8d8e8", amt: 0.35, light: 0.05, pattern: "frost", pcol: "#a0ffd8", motifs: [["snowflake", ["#ffffff"]], ["crystal", ["#a8f0e0"]], ["sparkle", ["#c8a8ff"]], ["tracks", ["#8ab0d0"]], ["pebble", ["#90a8c0"]], ["glowdot", ["#80ffc8"]]] },
  amber: { tint: "#c89a5a", amt: 0.4, pattern: "cracks", pcol: "#8a5a32", motifs: [["amber", ["#ffaa30"]], ["pebble", ["#a8784a"]], ["crack", ["#7a5030"]], ["amber", ["#ffd060"]], ["bone", ["#f0e0c0"]], ["tuft", ["#b8a058"]]] },
  spores: { tint: "#507a80", amt: 0.4, light: -0.06, pattern: "glow", pcol: "#e8c8ff", motifs: [["spore", ["#d0baff"]], ["mushroom", ["#c88af0"]], ["glowdot", ["#9affd0"]], ["spore", ["#ffd0f0"]], ["fern", ["#5a9a88"]], ["sparkle", ["#ffffff"]]] },
  lotus: { tint: "#6aa8b0", amt: 0.35, pattern: "damp", pcol: "#a0d8d0", water: "#4a98b8", motifs: [["lily", ["#6ab88a"]], ["flower", ["#ffc8e0", "#fff0a0"]], ["puddle", ["#4a90a8"]], ["sparkle", ["#ffe8f8"]], ["glowdot", ["#fff0b0"]], ["petals", ["#f0c0e0"]]] },
  marble: { tint: "#d8d8c8", amt: 0.35, light: 0.05, pattern: "slabs", pcol: "#a8a898", motifs: [["tile", ["#f0eee0"]], ["rune", ["#e0b850"]], ["crack", ["#9a9a8a"]], ["tuft", ["#8ab08a"]], ["sparkle", ["#fff8d0"]], ["pebble", ["#c8c8b8"]]] },
  crimson: { tint: "#a8905a", amt: 0.35, pattern: "litter", pcol: "#c8483a", motifs: [["leaf", ["#d8483a"]], ["leaf", ["#e88a5a"]], ["berry", ["#a82030"]], ["twig", ["#5a3020"]], ["mushroom", ["#e0c890"]], ["leaf", ["#f0b060"]]] },
  oasis: { tint: "#e0c890", amt: 0.3, pattern: "ripples", pcol: "#f8ecc0", water: "#30b0c0", motifs: [["tuft", ["#8ac070"]], ["shell", ["#f8e8d0"]], ["sparkle", ["#fff8d0"]], ["flower", ["#ff8ab0", "#fff0a0"]], ["pebble", ["#c8b088"]], ["tracks", ["#b89a68"]]] },
};

const NATURAL = new Set<number>([T.GRASS, T.FLOWER, T.PATH, T.SAND, T.DUNE, T.SNOW, T.ICE, T.CAVE, T.COBBLE, T.AUTUMN, T.MOSS, T.ASH, T.MEADOW, T.RUINS, ...Object.values(FRONTIER).map((d) => d.ground)]);
const ANIMATED = new Set<number>([T.WATER]);
/** Variações próprias por bioma e por tipo de chão. */
export const BIOME_VARIANTS = 48;

const cache = new Map<string, HTMLCanvasElement>();

/** Devolve o tile próprio do bioma (ou null para usar o tile comum). */
export function biomeTile(src: HTMLCanvasElement, t: number, biome: string, v: number): HTMLCanvasElement | null {
  const st = BIOME_STYLES[biome];
  if (!st) return null;
  const anim = ANIMATED.has(t);
  if (!anim && !NATURAL.has(t)) return null;
  if (anim && !st.water) return null;
  const key = `${biome}|${t}|${v}`;
  let cv = cache.get(key);
  if (cv) return cv;
  if (typeof document === "undefined") return null;
  cv = document.createElement("canvas"); cv.width = TS; cv.height = TS;
  const c = cv.getContext("2d", { willReadFrequently: true });
  if (!c) return null;
  c.drawImage(src, 0, 0);
  const p = new Pix(c);
  const seed = biome.length * 97 + biome.charCodeAt(0) * 13 + biome.charCodeAt(1) * 7 + t * 31;
  // Quatro tons por variação (chão mais claro, mais escuro, mais úmido, mais seco) – quebra a repetição.
  const toneShift = [0, 0.05, -0.06, 0.025][v & 3]!;
  tint(p, rgb(anim ? st.water! : st.tint), anim ? 0.45 : st.amt, (st.light ?? 0) + (anim ? 0 : toneShift), seed + v);
  if (!anim) {
    pattern(p, st.pattern, rgb(st.pcol), seed, v);
    // Um terço das variações recebe uma segunda textura suave do bioma.
    if (v % 3 === 1) pattern(p, SECOND[st.pattern], shade(rgb(st.tint), 0.25), seed + 333, v);
    microDetail(p, rgb(st.tint), seed, v);
    // 0–9 limpos, 10–47 com 1, 2 ou 3 detalhes do bioma
    if (v >= 10) {
      motif(p, st.motifs[(v * 7 + t) % st.motifs.length]!, seed, v, 0);
      if (v >= 24) motif(p, st.motifs[(v * 3 + t + 2) % st.motifs.length]!, seed, v, 1);
      if (v >= 38) motif(p, st.motifs[(v * 5 + t + 4) % st.motifs.length]!, seed, v, 2);
    }
  }
  p.done();
  cache.set(key, cv);
  return cv;
}

/** Textura secundária que combina com a principal de cada bioma. */
const SECOND: Record<Pattern, Pattern> = {
  none: "mottle", mottle: "moss", cracks: "mottle", ripples: "streaks", damp: "moss", roots: "mottle", frost: "glow",
  glow: "mottle", veins: "cracks", litter: "mottle", slabs: "moss", streaks: "mottle", moss: "mottle", hex: "glow",
};

/** Pontinhos de luz e sombra de 1px, pedrinhas e grãos – detalhe fino em todo tile. */
function microDetail(p: Pix, base: RGB, s: number, v: number) {
  const n = 3 + (v % 4);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, v, s + 801) * 16), y = Math.floor(hash(i, v, s + 802) * 16);
    const under = p.get(x, y), up = hash(i, v, s + 803) > 0.5;
    p.set(x, y, up ? mix(shade(under, 0.22), base, 0.2) : shade(under, -0.22), 0.85);
    if (up && y < 15) p.set(x, y + 1, shade(p.get(x, y + 1), -0.15), 0.6);
  }
}

/** Escolhe a variação própria do bioma pelo tile do mapa. */
export function biomeVariant(tx: number, ty: number) { return Math.floor(hash(tx, ty, 913) * BIOME_VARIANTS) % BIOME_VARIANTS; }

const lum = (c: RGB) => (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;
function tint(p: Pix, col: RGB, amt: number, light: number, s: number) {
  const L = Math.max(0.15, lum(col));
  p.fill((x, y) => {
    const o = p.get(x, y), k = lum(o) / L;
    const target: RGB = [Math.min(255, col[0] * k), Math.min(255, col[1] * k), Math.min(255, col[2] * k)];
    let c = mix(o, target, amt);
    c = shade(c, light + (pn(x, y, 8, s + 71) - 0.5) * 0.08);
    return c;
  });
}

function pattern(p: Pix, kind: Pattern, col: RGB, s: number, v: number) {
  const at = (x: number, y: number) => p.get(x, y);
  switch (kind) {
    case "mottle": p.fill((x, y) => { const n = pn(x, y, 4, s + v); return n > 0.72 ? mix(at(x, y), col, (n - 0.72) * 1.6) : n < 0.22 ? shade(at(x, y), -0.08) : null; }); break;
    case "cracks": p.fill((x, y) => { const n = Math.abs(pn(x, y, 8, s + 11 + (v & 3)) - 0.5); return n < 0.035 ? mix(at(x, y), col, 0.75) : n < 0.06 ? shade(at(x, y), 0.1) : null; }); break;
    case "ripples": p.fill((x, y) => { const r = Math.sin((y + (v & 3) * 2) * 0.785 + Math.sin(x * 0.393) * 1.2); return r > 0.88 ? mix(at(x, y), col, 0.3) : r < -0.9 ? shade(at(x, y), -0.1) : null; }); break;
    case "damp": p.fill((x, y) => { const n = fbm(x, y, s + 5 + v); return n < 0.32 ? mix(shade(at(x, y), -0.2), col, 0.35) : n < 0.36 ? shade(at(x, y), 0.15) : null; }); break;
    case "roots": p.fill((x, y) => { const n = Math.abs(pn(x, y, 8, s + 3 + (v & 3)) - 0.5); return n < 0.03 ? mix(at(x, y), col, 0.55) : null; }); break;
    case "frost": p.fill((x, y) => { const n = pn(x, y, 4, s + 9 + v); const g = hash(x & 15, y & 15, s + v); return g > 0.975 ? [255, 255, 255] : n > 0.75 ? mix(at(x, y), col, 0.3) : null; }); break;
    case "glow": p.fill((x, y) => { const g = hash(x & 15, y & 15, s + v * 3); return g > 0.982 ? mix(col, [255, 255, 255], 0.3) : g > 0.96 ? mix(at(x, y), col, 0.4) : null; }); break;
    case "veins": p.fill((x, y) => { const n = Math.abs(pn(x, y, 8, s + 17 + (v & 3)) - 0.5); return n < 0.025 ? col : n < 0.05 ? mix(at(x, y), col, 0.35) : null; }); break;
    case "litter": for (let i = 0; i < 3; i++) { const x = Math.floor(hash(i, v, s + 1) * 15), y = Math.floor(hash(i, v, s + 2) * 15); const lc = shade(col, (hash(i, v, s + 3) - 0.5) * 0.4); p.set(x, y, lc); p.set(x + 1, y, shade(lc, -0.15)); p.set(x, y + 1, shade(at(x, y + 1), -0.25), 0.6); } break;
    case "slabs": p.fill((x, y) => ((x & 7) === 7 || (y & 7) === 7 ? mix(at(x, y), col, 0.45) : (x & 7) === 0 || (y & 7) === 0 ? shade(at(x, y), 0.08) : null)); break;
    case "streaks": p.fill((x, y) => { const r = ((x + y * 2 + v * 3) % 11 + 11) % 11; return r === 0 && hash(x, y, s) > 0.4 ? mix(at(x, y), col, 0.35) : null; }); break;
    case "moss": p.fill((x, y) => (pn(x, y, 4, s + v) > 0.7 ? mix(at(x, y), col, 0.4) : null)); break;
    case "hex": p.fill((x, y) => { const a = (x + (y >> 2) * 2) % 8, b = y % 4; return (a === 0 && b !== 0) || (b === 0 && a < 5) ? mix(at(x, y), col, 0.3) : null; }); break;
    default: break;
  }
}

function motif(p: Pix, [name, cols]: Motif, s: number, v: number, slot: number) {
  const r = (i: number) => hash(i + slot * 17, v, s + 500);
  const cx = 3 + Math.floor(r(1) * 10), cy = 4 + Math.floor(r(2) * 9);
  const c0 = rgb(cols[0]!), c1 = cols[1] ? rgb(cols[1]) : shade(c0, 0.35);
  const under = p.get(cx, cy), dark = shade(under, -0.45), hi = shade(c0, 0.35), lo = shade(c0, -0.3);
  const S = (dx: number, dy: number, c: RGB, a = 1) => p.set(cx + dx, cy + dy, c, a);
  switch (name) {
    case "flower": S(0, 1, shade(under, -0.3)); S(0, 2, shade(under, -0.2)); S(-1, 0, c0); S(1, 0, c0); S(0, -1, hi); S(0, 1, lo, 0.6); S(0, 0, c1); S(1, 1, dark, 0.4); break;
    case "tuft": for (const [dx, h] of [[-1, 2], [0, 3], [1, 2], [2, 1]] as const) for (let k = 0; k < h; k++) S(dx, -k, k === h - 1 ? hi : shade(c0, -0.15 + k * 0.1)); S(0, 1, dark, 0.5); break;
    case "pebble": S(0, 0, c0); S(1, 0, lo); S(0, -1, hi); S(1, -1, c0); S(0, 1, dark, 0.6); S(1, 1, dark, 0.6); S(3, 2, c0); S(3, 3, dark, 0.5); break;
    case "mushroom": S(0, 1, [236, 226, 200]); S(0, 2, [200, 190, 165]); S(-1, 0, c0); S(0, 0, c0); S(1, 0, lo); S(-1, -1, hi); S(0, -1, c0); S(-1, 0, [255, 255, 255], 0.4); S(1, 2, dark, 0.6); break;
    case "leaf": S(0, 0, c0); S(1, 0, hi); S(-1, 1, c0); S(0, 1, lo); S(1, -1, shade(c0, 0.2)); S(-1, 2, shade(lo, -0.2), 0.7); S(0, 2, dark, 0.5); break;
    case "petals": for (let i = 0; i < 4; i++) { const x = Math.floor(r(10 + i) * 6) - 3, y = Math.floor(r(20 + i) * 6) - 3; S(x, y, i % 2 ? c0 : hi); S(x + 1, y, lo, 0.6); } break;
    case "crystal": for (let k = 0; k < 4; k++) { S(0, -k, k > 2 ? hi : c0); S(1, -k + 1, lo); } S(-1, 0, lo); S(-1, 1, c0); S(0, -2, [255, 255, 255], 0.7); S(0, 1, dark, 0.7); S(1, 1, dark, 0.6); break;
    case "bone": S(-2, 0, c0); S(-1, 0, c0); S(0, 0, c0); S(1, 0, c0); S(-3, -1, hi); S(-3, 1, c0); S(2, -1, hi); S(2, 1, c0); S(-1, 1, dark, 0.5); S(0, 1, dark, 0.5); break;
    case "skull": S(-1, -1, c0); S(0, -1, hi); S(1, -1, c0); S(-1, 0, [40, 30, 30]); S(0, 0, c0); S(1, 0, [40, 30, 30]); S(0, 1, lo); S(-1, 1, c0); S(1, 1, c0); S(0, 2, dark, 0.6); break;
    case "shell": S(0, 0, c0); S(-1, 0, lo); S(1, 0, lo); S(0, -1, hi); S(-1, 1, c0); S(0, 1, c0); S(1, 1, c0); S(0, 2, dark, 0.5); S(0, 0, shade(c0, -0.15)); break;
    case "starfish": S(0, 0, c0); S(0, -1, c0); S(0, -2, hi); S(-1, 0, c0); S(-2, 0, lo); S(1, 0, c0); S(2, 0, lo); S(-1, 1, c0); S(1, 1, c0); S(-2, 2, lo); S(2, 2, lo); break;
    case "puddle": for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) < 3) S(dx, dy, mix(c0, [255, 255, 255], dy === -1 && dx < 0 ? 0.35 : 0)); S(-1, -1, [220, 240, 255], 0.6); S(0, 2, dark, 0.3); break;
    case "ember": S(0, 0, c0); S(1, 0, [255, 230, 140]); S(0, 1, lo); S(-1, 1, [60, 30, 30]); S(2, 1, [60, 30, 30]); S(0, -1, c0, 0.4); break;
    case "rune": S(0, -2, c0); S(0, -1, c0); S(0, 0, c0); S(0, 1, c0); S(-1, -1, c0); S(1, 0, c0); S(1, 1, hi); S(0, 0, [255, 255, 255], 0.4); S(-1, 0, c0, 0.25); S(1, -1, c0, 0.25); break;
    case "fern": for (let k = 0; k < 4; k++) { S(k - 1, -k, c0); S(k - 2, -k, hi); S(k, -k + 1, lo); } S(-1, 1, dark, 0.5); break;
    case "clover": S(0, 0, c0); S(1, 0, hi); S(0, 1, lo); S(1, 1, c0); S(-1, 0, c0); S(0, -1, hi); S(0, 2, shade(c0, -0.4)); break;
    case "tracks": for (let i = 0; i < 3; i++) { S(i * 2 - 2, i % 2 ? 1 : -1, c0); S(i * 2 - 1, i % 2 ? 1 : -1, lo, 0.7); } break;
    case "lily": S(-1, 0, c0); S(0, 0, c0); S(1, 0, c0); S(-1, 1, lo); S(0, 1, c0); S(1, -1, hi); S(0, -1, hi); S(0, 0, [255, 210, 230]); S(1, 1, dark, 0.4); break;
    case "sparkle": S(0, 0, [255, 255, 255]); S(-1, 0, c0); S(1, 0, c0); S(0, -1, c0); S(0, 1, c0); S(4, 3, c0, 0.8); break;
    case "twig": for (let i = 0; i < 5; i++) { S(i - 2, i >> 1, i === 0 ? hi : c0); S(i - 2, (i >> 1) + 1, dark, 0.5); } S(0, -1, c0); break;
    case "pinecone": S(0, -1, hi); S(-1, 0, c0); S(0, 0, lo); S(1, 0, c0); S(0, 1, c0); S(-1, 1, lo); S(1, 1, lo); S(0, 2, dark, 0.6); break;
    case "seaweed": for (let k = 0; k < 4; k++) { S((k & 1) ? 1 : 0, -k, c0); S((k & 1) ? 2 : -1, -k, hi, 0.4); } S(0, 1, dark, 0.5); break;
    case "coral": S(0, 0, c0); S(0, -1, c0); S(-1, -2, hi); S(1, -2, c0); S(-1, -1, c0); S(1, -1, lo); S(1, -3, hi); S(0, 1, dark, 0.6); break;
    case "amber": S(0, 0, c0); S(1, 0, lo); S(0, -1, hi); S(0, -1, [255, 250, 210], 0.6); S(0, 1, dark, 0.5); S(3, 2, c0); S(3, 1, hi); break;
    case "sprig": for (let k = 0; k < 4; k++) { S(0, -k + 1, shade(under, -0.3)); S(k & 1 ? 1 : -1, -k, k === 3 ? hi : c0); } S(0, -3, hi); break;
    case "snowflake": S(0, 0, c0); S(-1, -1, c0, 0.7); S(1, 1, c0, 0.7); S(1, -1, c0, 0.7); S(-1, 1, c0, 0.7); S(3, 3, c0); S(-3, 2, c0, 0.8); break;
    case "glowdot": S(0, 0, [255, 255, 255]); S(-1, 0, c0, 0.6); S(1, 0, c0, 0.6); S(0, -1, c0, 0.6); S(0, 1, c0, 0.6); S(4, -2, c0); S(-3, 3, c0, 0.8); break;
    case "crack": { let x = 0, y = 0; for (let i = 0; i < 6; i++) { S(x, y, c0); S(x + 1, y, shade(under, 0.25), 0.4); x += r(30 + i) > 0.5 ? 1 : 0; y += r(40 + i) > 0.3 ? 1 : 0; if (r(50 + i) > 0.8) x--; } break; }
    case "sunpetal": S(0, 0, [122, 74, 32]); S(-1, 0, c0); S(1, 0, c0); S(0, -1, c0); S(0, 1, c0); S(-1, -1, hi, 0.7); S(1, 1, lo, 0.7); S(1, -1, hi, 0.5); S(-1, 1, lo, 0.5); break;
    case "feather": for (let k = 0; k < 4; k++) { S(k - 1, -k + 1, c0); S(k - 2, -k + 1, hi, 0.6); } S(-2, 2, shade(c0, -0.3)); break;
    case "acorn": S(0, -1, [110, 80, 50]); S(-1, 0, c0); S(0, 0, hi); S(1, 0, c0); S(0, 1, lo); S(0, 2, dark, 0.5); break;
    case "berry": S(0, 0, c0); S(1, 0, lo); S(0, 1, lo); S(-1, 1, c0); S(0, 0, [255, 255, 255], 0.35); S(0, -1, [70, 120, 50]); break;
    case "root": for (let i = 0; i < 6; i++) { S(i - 3, Math.round(Math.sin(i) * 1), c0); S(i - 3, Math.round(Math.sin(i) * 1) + 1, dark, 0.5); } break;
    case "bamboo": for (let k = 0; k < 3; k++) { S(k - 1, -k, c0); S(k, -k, hi); } S(-2, 1, lo); S(1, 1, dark, 0.5); break;
    case "spore": S(0, 0, c0); S(0, 0, [255, 255, 255], 0.4); S(-3, 2, c0, 0.8); S(3, -2, hi, 0.8); S(2, 3, c0, 0.6); break;
    case "tile": for (let dy = -1; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) S(dx, dy, dy === -1 ? hi : dy === 2 ? lo : c0); S(-2, 3, dark, 0.5); S(2, 3, dark, 0.5); break;
    default: S(0, 0, c0); S(1, 1, dark, 0.5); break;
  }
}
