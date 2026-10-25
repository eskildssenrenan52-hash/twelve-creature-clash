// Camada cinematográfica compartilhada entre o jogo e a abertura:
// sombras de nuvens, poeira de luz, bloom suave em duas passadas,
// tonalização dividida (realces quentes, sombras frias), halo de lente e grão de filme.
type Ctx = CanvasRenderingContext2D;

const cache: { cloud?: HTMLCanvasElement; grain?: HTMLCanvasElement[]; bloom?: HTMLCanvasElement; bloomX?: CanvasRenderingContext2D | null; blur?: HTMLCanvasElement; blurX?: CanvasRenderingContext2D | null } = {};
const filterOk = () => typeof document !== "undefined" && "filter" in (document.createElement("canvas").getContext("2d") ?? {});
let FILTER: boolean | null = null;

function rnd(i: number) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

function cloudTex() {
  if (cache.cloud) return cache.cloud;
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 512;
  const x = cv.getContext("2d")!;
  for (let i = 0; i < 26; i++) {
    const cx = rnd(i) * 512, cy = rnd(i + 50) * 512, r = 40 + rnd(i + 99) * 90;
    for (const [ox, oy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
      const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
      g.addColorStop(0, "rgba(10,14,40,.55)"); g.addColorStop(.6, "rgba(10,14,40,.25)"); g.addColorStop(1, "rgba(10,14,40,0)");
      x.fillStyle = g; x.fillRect(cx + ox - r, cy + oy - r, r * 2, r * 2);
    }
  }
  return (cache.cloud = cv);
}

/** Sombras de nuvens deslizando pelo chão, presas ao mundo (parallax com a câmera). */
export function cloudShadows(c: Ctx, w: number, h: number, camX: number, camY: number, t: number, k = 1) {
  if (k <= 0.01) return;
  const tex = cloudTex(), S = 512 * 1.6;
  const ox = -(((camX * 0.9 + t * 9) % S) + S) % S, oy = -(((camY * 0.9 + t * 4) % S) + S) % S;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.32 * k; c.globalCompositeOperation = "multiply"; c.imageSmoothingEnabled = true;
  for (let y = oy; y < h; y += S) for (let x = ox; x < w; x += S) c.drawImage(tex, x, y, S, S);
  c.restore();
}

const moteDiscs = new Map<string, HTMLCanvasElement>();
function moteDisc(col: [number, number, number]) {
  const k = col.join(","); const hit = moteDiscs.get(k); if (hit) return hit;
  const cv = document.createElement("canvas"); cv.width = cv.height = 32; const x = cv.getContext("2d")!;
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, `rgba(${k},.55)`); g.addColorStop(.35, `rgba(${k},.18)`); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 32, 32); moteDiscs.set(k, cv); return cv;
}
/** Poeira dourada / vaga-lumes flutuando em profundidade, com brilho aditivo (discos pré-renderizados, sem gradiente por quadro). */
export function lightMotes(c: Ctx, w: number, h: number, t: number, n: number, col: [number, number, number], camX = 0, camY = 0, a = 1) {
  if (a <= 0.01 || n <= 0) return;
  const disc = moteDisc(col);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "lighter"; c.fillStyle = "rgb(255,252,235)";
  for (let i = 0; i < n; i++) {
    const depth = .4 + rnd(i + 7) * .9;
    const x = ((rnd(i) * (w + 80) - camX * depth * .35 + Math.sin(t * .4 + i) * 18 + t * 6 * depth) % (w + 80) + (w + 80)) % (w + 80) - 40;
    const y = ((rnd(i + 3) * (h + 80) - camY * depth * .35 - t * 7 * depth + Math.cos(t * .5 + i * 2) * 10) % (h + 80) + (h + 80)) % (h + 80) - 40;
    const tw = .45 + .55 * Math.sin(t * (1.2 + rnd(i + 11) * 2) + i * 3);
    if (tw <= 0) continue;
    const r = (1.2 + depth * 2.6) * 3;
    c.globalAlpha = tw * a; c.drawImage(disc, x - r, y - r, r * 2, r * 2);
    c.globalAlpha = .8 * tw * a; c.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  c.restore();
}

/** Bloom largo em duas passadas (realces borrados), mais suave e cinematográfico. */
export function softBloom(c: Ctx, src: HTMLCanvasElement, w: number, h: number, amt: number, refresh = true) {
  if (FILTER === null) FILTER = filterOk();
  if (!FILTER || amt <= 0) return;
  const bw = Math.max(1, w >> 3), bh = Math.max(1, h >> 3);
  if (!cache.blur) { cache.blur = document.createElement("canvas"); cache.blurX = cache.blur.getContext("2d"); }
  if (cache.blur.width !== bw || cache.blur.height !== bh) { cache.blur.width = bw; cache.blur.height = bh; refresh = true; }
  const b = cache.blurX; if (!b) return;
  if (refresh) { // recalcula o brilho só de tempos em tempos; nos outros quadros reaproveita
    b.globalCompositeOperation = "copy"; b.imageSmoothingEnabled = true;
    b.filter = "brightness(.9) contrast(2.2) saturate(1.5) blur(2px)";
    b.drawImage(src, 0, 0, bw, bh); b.filter = "none";
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "screen"; c.globalAlpha = amt; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
  c.drawImage(cache.blur, 0, 0, w, h); c.restore();
}

const toneC: { w: number; h: number; g: CanvasGradient | null; ctx: Ctx | null } = { w: 0, h: 0, g: null, ctx: null };
/** Tonalização dividida: sombras puxadas para azul-petróleo, realces para âmbar (gradiente em cache). */
export function splitTone(c: Ctx, w: number, h: number, warm = .12, cool = .14) {
  if (toneC.w !== w || toneC.h !== h || toneC.ctx !== c || !toneC.g) {
    const g = c.createLinearGradient(0, 0, w * .3, h);
    g.addColorStop(0, "rgb(255,196,120)"); g.addColorStop(1, "rgb(40,80,140)");
    toneC.w = w; toneC.h = h; toneC.g = g; toneC.ctx = c;
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "soft-light"; c.globalAlpha = Math.max(0, Math.min(1, (warm + cool) / 2));
  c.fillStyle = toneC.g; c.fillRect(0, 0, w, h);
  c.restore();
}

const lens: { w: number; h: number; cv: HTMLCanvasElement | null } = { w: 0, h: 0, cv: null };
/** Halo de luz no canto superior (sol), com reflexos de lente discretos — pintado uma vez por tamanho de tela. */
export function lensGlow(c: Ctx, w: number, h: number, t: number, a: number) {
  if (a <= 0.01) return;
  if (!lens.cv || lens.w !== w || lens.h !== h) {
    const cv = lens.cv ?? document.createElement("canvas"); cv.width = w; cv.height = h; lens.w = w; lens.h = h; lens.cv = cv;
    const x = cv.getContext("2d")!; x.clearRect(0, 0, w, h); x.globalCompositeOperation = "lighter";
    const sx = w * .82, sy = -h * .08;
    const g = x.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * .7);
    g.addColorStop(0, "rgba(255,232,180,.22)"); g.addColorStop(.3, "rgba(255,200,140,.08)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    for (const [k, r, col] of [[.35, 18, "255,220,160"], [.6, 9, "160,220,255"], [1.25, 26, "255,170,220"], [1.6, 12, "200,255,220"]] as const) {
      const fx = sx + (cx - sx) * k * 2, fy = sy + (cy - sy) * k * 2, rr = r * (w / 384);
      const f = x.createRadialGradient(fx, fy, 0, fx, fy, rr);
      f.addColorStop(0, `rgba(${col},.07)`); f.addColorStop(.7, `rgba(${col},.035)`); f.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = f; x.beginPath(); x.arc(fx, fy, rr, 0, Math.PI * 2); x.fill();
    }
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "lighter"; c.globalAlpha = Math.min(1, a);
  c.drawImage(lens.cv, Math.round(Math.sin(t * .05) * w * .03), 0);
  c.restore();
}

function grainFrames() {
  if (cache.grain) return cache.grain;
  cache.grain = [0, 1, 2, 3].map((f) => {
    const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
    const x = cv.getContext("2d")!; const d = x.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = rnd(i * 0.37 + f * 9973) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return cv;
  });
  return cache.grain;
}

const grainPats: { ctx: Ctx | null; p: (CanvasPattern | null)[] } = { ctx: null, p: [] };
/** Grão de filme animado muito sutil. */
export function filmGrain(c: Ctx, w: number, h: number, t: number, a = .045) {
  const i = Math.floor(t * 24) % 4;
  if (grainPats.ctx !== c) { grainPats.ctx = c; grainPats.p = grainFrames().map((f) => c.createPattern(f, "repeat")); }
  const pat = grainPats.p[i];
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "overlay"; c.globalAlpha = a;
  if (pat) { c.fillStyle = pat; c.fillRect(0, 0, w, h); }
  c.restore();
}
