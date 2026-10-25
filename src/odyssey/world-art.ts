import treesSheet from '@/assets/art/trees-sheet.png';
import frontierA from '@/assets/art/frontier-a.png';
import frontierB from '@/assets/art/frontier-b.png';
import propsSheet from '@/assets/art/props-sheet.png';
import { FRONTIER, type FrontierBiome } from './frontier';
import { T, TS, hash } from './world';
import type { Game } from './engine';

// Arte detalhada em pixel art (folhas de 8 sprites, células de 128px alinhadas pela base).
const CELL = 128;
/** Sprite único por bioma da fronteira: [folha, índice]. 0 = frontier-a, 1 = frontier-b, 2 = props. */
const FRONTIER_SPRITE: Record<FrontierBiome, [number, number, number]> = {
  sakura: [0, 0, 54], moonwood: [0, 1, 56], prism: [0, 2, 46], coral: [0, 3, 42], bamboo: [0, 4, 52], thunder: [0, 5, 50],
  obsidian: [0, 6, 48], sunflower: [0, 7, 40], lavender: [1, 0, 36], mangrove: [1, 1, 56], aurora: [1, 2, 54], amber: [1, 3, 46],
  spores: [1, 4, 50], lotus: [1, 5, 38], marble: [1, 6, 46], crimson: [1, 7, 54], oasis: [2, 6, 48],
};
/** Objetos dos biomas originais desenhados por cima do chão: tile -> [índice em props, tamanho]. */
const PROP: Partial<Record<number, [number, number]>> = {
  [T.ROCK]: [0, 28], [T.CACTUS]: [1, 32], [T.BUSH]: [2, 26], [T.CRYSTAL]: [3, 34], [T.MUSHROOM]: [4, 34], [T.PILLAR]: [5, 30],
};
const SANDY = new Set(['desert', 'oasis', 'amber', 'coast']);
const SNOWY = new Set(['mountain', 'aurora']);
export const hasProp = (t: number) => PROP[t] !== undefined;
export const TREE_TILES = new Set<number>([T.TREE, T.DTREE, T.AUTUMN_TREE, T.PALM, T.PINE]);

function load(src: string) { const i = new Image(); i.src = src; return i; }
const ready = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;

/**
 * Reduz cada sprite de 128px para o tamanho exibido com filtragem de alta qualidade
 * em etapas (128→64→alvo) e reforça contorno e brilho, preservando os detalhes finos
 * em vez de perder pixels aleatórios na redução sem suavização. Resultado em cache.
 */
const spriteCache = new Map<string, HTMLCanvasElement>();
export function scaledSprite(img: HTMLImageElement, i: number, size: number, variant = 0): HTMLCanvasElement {
  const key = `${img.src}|${i}|${size}|${variant}`;
  let cv = spriteCache.get(key);
  if (cv) return cv;
  let src: CanvasImageSource = img, sx = i * CELL, sw = CELL;
  if (size < CELL / 2) {
    const half = document.createElement('canvas'); half.width = half.height = CELL / 2;
    const h = half.getContext('2d')!; h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high';
    h.drawImage(img, sx, 0, CELL, CELL, 0, 0, CELL / 2, CELL / 2);
    src = half; sx = 0; sw = CELL / 2;
  }
  cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d')!; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  // 16 variações: espelhado (bit 1) e 8 tons (primavera, outono, frio, sombra, sol, musgo...).
  const tone = (variant >> 1) & 7;
  const TONES = [
    'contrast(1.12) saturate(1.16)',
    'contrast(1.12) saturate(1.26) hue-rotate(-9deg)',
    'contrast(1.1) saturate(1.04) hue-rotate(10deg)',
    'contrast(1.14) saturate(1.12) brightness(.93)',
    'contrast(1.08) saturate(1.22) brightness(1.06) sepia(.08)',
    'contrast(1.12) saturate(1.1) hue-rotate(-4deg) brightness(.97)',
    'contrast(1.16) saturate(1.3) hue-rotate(5deg)',
    'contrast(1.1) saturate(.98) brightness(1.03) hue-rotate(14deg)',
  ];
  c.filter = TONES[tone]!;
  if (variant & 1) { c.translate(size, 0); c.scale(-1, 1); }
  c.drawImage(src, sx, 0, sw, sw, 0, 0, size, size);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.filter = 'none';
  const d = c.getImageData(0, 0, size, size), a = d.data;
  const alpha = new Uint8Array(size * size);
  for (let p = 0; p < size * size; p++) alpha[p] = a[p * 4 + 3]! > 110 ? 1 : 0;
  // Distância até a borda (até 3px) para luz de contorno e oclusão em camadas.
  const dist = new Uint8Array(size * size);
  for (let p = 0; p < size * size; p++) dist[p] = alpha[p] ? 9 : 0;
  for (let pass = 1; pass <= 3; pass++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const p = y * size + x; if (dist[p] !== 9) continue;
    const nb = (dx: number, dy: number) => { const xx = x + dx, yy = y + dy; return xx < 0 || yy < 0 || xx >= size || yy >= size ? 0 : dist[yy * size + xx]!; };
    if (Math.min(nb(1, 0), nb(-1, 0), nb(0, 1), nb(0, -1)) === pass - 1) dist[p] = pass;
  }
  let top = size, bottom = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (alpha[y * size + x]) { if (y < top) top = y; if (y > bottom) bottom = y; }
  const span = Math.max(1, bottom - top);
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const p = y * size + x, o = p * 4;
    if (!alpha[p]) { a[o + 3] = 0; continue; }
    a[o + 3] = 255;
    let r = a[o]!, g = a[o + 1]!, b = a[o + 2]!;
    const dd = dist[p]!;
    if (dd === 1) { a[o] = r * .42; a[o + 1] = g * .38; a[o + 2] = b * .55 + 6; continue; } // contorno colorido escuro
    // Luz do alto à esquerda: borda iluminada (rim light quente), lado oposto em sombra fria.
    const lit = (x > 1 && !alpha[p - 2]) || (y > 1 && !alpha[p - 2 * size]) || (x > 2 && !alpha[p - 3] && y > 2 && !alpha[p - 3 * size]);
    const shadowSide = (x < size - 2 && !alpha[p + 2]) || (y < size - 2 && !alpha[p + 2 * size]);
    const vy = (y - top) / span;
    // Gradiente vertical pontilhado (topo mais claro, base com oclusão) – visual de pixel art feita à mão.
    const dither = (BAYER[(y & 3) * 4 + (x & 3)]! / 16 - .5) * .06;
    let k = 1.1 - vy * .26 + dither;
    if (lit) k += .18; else if (shadowSide) k -= .2;
    if (dd === 2 && !lit) k -= .06;
    r = r * k + (lit ? 14 : 0); g = g * k + (lit ? 10 : 0); b = b * (shadowSide ? k * .92 + .06 : k) + (shadowSide ? 10 : 0);
    // Oclusão de contato na base do objeto.
    if (vy > .9) { const ao = (vy - .9) * 3; r *= 1 - ao * .45; g *= 1 - ao * .42; b *= 1 - ao * .3; }
    // Brilho especular nos pontos já claros perto do topo iluminado.
    const lum = r * .3 + g * .59 + b * .11;
    if (lum > 175 && lit && vy < .55) { r += 28; g += 26; b += 18; }
    // Microtextura: pontilhado sutil (folhas, rocha, casca).
    const n = (hash(x, y, i * 7 + variant) - .5) * 20;
    a[o] = Math.max(0, Math.min(255, r + n)); a[o + 1] = Math.max(0, Math.min(255, g + n)); a[o + 2] = Math.max(0, Math.min(255, b + n * .8));
  }
  c.putImageData(d, 0, 0);
  spriteCache.set(key, cv);
  return cv;
}

export class WorldArt {
  trees: HTMLImageElement; sheets: HTMLImageElement[];
  /** Compatibilidade com o motor: indicam se a arte já carregou. */
  get canopy() { return this.trees; }
  get frontier() { return this.sheets[0]!; }
  constructor() {
    this.trees = load(treesSheet);
    this.sheets = [load(frontierA), load(frontierB), load(propsSheet)];
  }
  private blit(c: CanvasRenderingContext2D, img: HTMLImageElement, i: number, x: number, y: number, size: number, variant = 0) {
    if (!ready(img)) return;
    c.drawImage(scaledSprite(img, i, size, variant), Math.round(x - size / 2), Math.round(y - size));
  }
  /** Sombra em duas camadas (contato escuro + projeção suave para a direita). */
  private shadow(c: CanvasRenderingContext2D, x: number, y: number, rx: number) {
    c.save(); c.fillStyle = '#0c1c16';
    c.globalAlpha = .16; c.beginPath(); c.ellipse(x + rx * .35, y - 1, rx * 1.15, rx * .42, -.12, 0, Math.PI * 2); c.fill();
    c.globalAlpha = .3; c.beginPath(); c.ellipse(x + 1, y - 1, rx * .62, rx * .22, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  frontierObject(c: CanvasRenderingContext2D, biome: FrontierBiome, tx: number, ty: number, clock: number) {
    const [sheet, i, size0] = FRONTIER_SPRITE[biome] ?? [0, 0, 48];
    const size = size0 + Math.floor(hash(tx, ty, 61) * 6) - 2;
    const x = tx * TS + 8 + Math.sin(clock + tx) * .9, y = ty * TS + 17;
    this.shadow(c, x, y, size * .32);
    this.blit(c, this.sheets[sheet]!, i, x, y, size, Math.floor(hash(tx, ty, 62) * 8));
  }
  /** Rochas, cactos, arbustos, cristais, cogumelos e pilares. Retorna false se o tile não tem sprite. */
  prop(c: CanvasRenderingContext2D, t: number, biome: string, tx: number, ty: number) {
    const p = PROP[t]; if (!p) return false;
    let [i, size] = p;
    if (t === T.ROCK && SNOWY.has(biome)) i = 7;
    size += Math.floor(hash(tx, ty, 17) * 5) - 2;
    const x = tx * TS + 8, y = ty * TS + 16;
    this.shadow(c, x, y, size * .3);
    this.blit(c, this.sheets[2]!, i, x, y, size, Math.floor(hash(tx, ty, 18) * 8));
    return true;
  }
  /** Chão que aparece por baixo de um objeto desenhado como sprite. */
  groundUnder(t: number, biome: string): number {
    if (TREE_TILES.has(t)) return SNOWY.has(biome) ? T.SNOW : SANDY.has(biome) ? T.SAND : biome === 'swamp' ? T.MOSS : biome === 'autumn' ? T.AUTUMN : T.GRASS;
    if (!PROP[t]) return t;
    if (t === T.CACTUS || SANDY.has(biome)) return T.SAND;
    if (SNOWY.has(biome)) return T.SNOW;
    if (t === T.CRYSTAL || biome === 'cave') return T.CAVE;
    if (biome === 'volcanic') return T.ASH;
    if (t === T.MUSHROOM || biome === 'mushroom' || biome === 'swamp') return T.MOSS;
    if (biome === 'ruins') return T.RUINS;
    return T.GRASS;
  }
  tree(c: CanvasRenderingContext2D, t: number, tx: number, ty: number, clock: number) {
    if (!ready(this.trees)) return;
    const x = tx * TS + 8 + Math.sin(clock * 1.5 + tx * .2) * 1.1, y = ty * TS + 17;
    const r = hash(tx, ty, 84);
    const i = t === T.PALM ? 4 : t === T.DTREE ? 5 : t === T.AUTUMN_TREE ? 6 : t === T.PINE ? 7 : Math.floor(r * 4);
    const size = (t === T.PALM ? 46 : t === T.PINE ? 50 : 54) + Math.floor(r * 8) - 4;
    this.shadow(c, x, y, size * .34);
    this.blit(c, this.trees, i, x, y, size, Math.floor(hash(tx, ty, 85) * 8));
  }
  village(c: CanvasRenderingContext2D, clock: number) {
    if (!ready(this.trees)) return;
    for (const [tx, ty] of [[106, 116], [138, 116], [105, 128], [138, 138], [116, 140], [129, 110]]) this.tree(c, T.TREE, tx!, ty!, clock);
    // A grande árvore de Potos, com vaga-lumes de mana.
    const x = 122 * TS + 8, y = 111 * TS + 4;
    this.shadow(c, x, y, 50);
    c.drawImage(this.trees, 2 * CELL, 0, CELL, CELL, x - 80, y - 160, 160, 160);
    c.save(); c.fillStyle = '#c2efb6';
    for (let i = 0; i < 18; i++) { const ph = clock * .8 + i; c.globalAlpha = .3 + Math.sin(ph) * .25; c.fillRect(x + Math.sin(ph) * 50, y - 40 - Math.cos(ph * .7) * 60, 2, 2); }
    c.restore();
  }
  ambient(g: Game, c: CanvasRenderingContext2D) {
    if (g.interior) return;
    const palette = g.biome === 'autumn' || g.biome === 'crimson' ? ['#ecbe79', '#cc8b6c'] : g.biome === 'volcanic' || g.biome === 'obsidian' ? ['#f1c080', '#e79975']
      : g.biome === 'sakura' ? ['#f6c3d6', '#fbe1ea'] : SNOWY.has(g.biome) ? ['#ffffff', '#dbeaff'] : ['#d3e9b8', '#bdd7ca'];
    for (let i = 0; i < 28; i++) {
      const x = (hash(i, 3, 7) * g.canvas.width + g.clock * (g.biome === 'autumn' || g.biome === 'sakura' ? 9 : 2)) % g.canvas.width;
      const y = (hash(i, 8, 9) * g.canvas.height + Math.sin(g.clock * .6 + i) * 12 + (SNOWY.has(g.biome) ? g.clock * 14 : 0)) % g.canvas.height;
      c.globalAlpha = .18 + Math.sin(g.clock * 1.4 + i) * .12; c.fillStyle = palette[i % 2]!; c.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
    c.globalAlpha = 1;
  }
}
