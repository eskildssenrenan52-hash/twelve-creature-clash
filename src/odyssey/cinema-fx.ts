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

/** Poeira dourada / vaga-lumes flutuando em profundidade, com brilho aditivo. */
export function lightMotes(c: Ctx, w: number, h: number, t: number, n: number, col: [number, number, number], camX = 0, camY = 0, a = 1) {
  if (a <= 0.01) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const depth = .4 + rnd(i + 7) * .9;
    const x = ((rnd(i) * (w + 80) - camX * depth * .35 + Math.sin(t * .4 + i) * 18 + t * 6 * depth) % (w + 80) + (w + 80)) % (w + 80) - 40;
    const y = ((rnd(i + 3) * (h + 80) - camY * depth * .35 - t * 7 * depth + Math.cos(t * .5 + i * 2) * 10) % (h + 80) + (h + 80)) % (h + 80) - 40;
    const tw = .45 + .55 * Math.sin(t * (1.2 + rnd(i + 11) * 2) + i * 3);
    const r = 1.2 + depth * 2.6;
    const g = c.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${.55 * tw * a})`); g.addColorStop(.35, `rgba(${col[0]},${col[1]},${col[2]},${.18 * tw * a})`); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    c.fillStyle = `rgba(255,252,235,${.8 * tw * a})`; c.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  c.restore();
}

/** Bloom largo em duas passadas (realces borrados), mais suave e cinematográfico. */
export function softBloom(c: Ctx, src: HTMLCanvasElement, w: number, h: number, amt: number) {
  if (FILTER === null) FILTER = filterOk();
  if (!FILTER || amt <= 0) return;
  const bw = Math.max(1, w >> 3), bh = Math.max(1, h >> 3);
  if (!cache.blur) { cache.blur = document.createElement("canvas"); cache.blurX = cache.blur.getContext("2d"); }
  if (cache.blur.width !== bw || cache.blur.height !== bh) { cache.blur.width = bw; cache.blur.height = bh; }
  const b = cache.blurX; if (!b) return;
  b.globalCompositeOperation = "copy"; b.imageSmoothingEnabled = true;
  b.filter = "brightness(.9) contrast(2.2) saturate(1.5) blur(2px)";
  b.drawImage(src, 0, 0, bw, bh); b.filter = "none";
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "screen"; c.globalAlpha = amt; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
  c.drawImage(cache.blur, 0, 0, w, h); c.restore();
}

/** Tonalização dividida: sombras puxadas para azul-petróleo, realces para âmbar. */
export function splitTone(c: Ctx, w: number, h: number, warm = .12, cool = .14) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "soft-light";
  const g = c.createLinearGradient(0, 0, w * .3, h);
  g.addColorStop(0, `rgba(255,196,120,${warm})`); g.addColorStop(1, `rgba(40,80,140,${cool})`);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = "overlay"; c.fillStyle = "rgba(128,128,128,.0)"; // mantém o pipeline estável
  c.restore();
}

/** Halo de luz no canto superior (sol), com reflexos de lente discretos. */
export function lensGlow(c: Ctx, w: number, h: number, t: number, a: number) {
  if (a <= 0.01) return;
  const sx = w * .82 + Math.sin(t * .05) * w * .03, sy = -h * .08;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "lighter";
  const g = c.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * .7);
  g.addColorStop(0, `rgba(255,232,180,${.22 * a})`); g.addColorStop(.3, `rgba(255,200,140,${.08 * a})`); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  [[.35, 18, "255,220,160"], [.6, 9, "160,220,255"], [1.25, 26, "255,170,220"], [1.6, 12, "200,255,220"]].forEach(([k, r, col]) => {
    const x = sx + (cx - sx) * (k as number) * 2, y = sy + (cy - sy) * (k as number) * 2, rr = (r as number) * (w / 384);
    const f = c.createRadialGradient(x, y, 0, x, y, rr);
    f.addColorStop(0, `rgba(${col},${.07 * a})`); f.addColorStop(.7, `rgba(${col},${.035 * a})`); f.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = f; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
  });
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

/** Grão de filme animado muito sutil. */
export function filmGrain(c: Ctx, w: number, h: number, t: number, a = .045) {
  const fr = grainFrames()[Math.floor(t * 24) % 4];
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "overlay"; c.globalAlpha = a;
  const pat = c.createPattern(fr, "repeat"); if (pat) { c.fillStyle = pat; c.fillRect(0, 0, w, h); }
  c.restore();
}
