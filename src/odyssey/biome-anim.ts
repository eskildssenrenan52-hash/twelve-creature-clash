// Vida por bioma: água ondulante com ondulações nas margens, lava borbulhante,
// vento curvando a vegetação em rajadas que atravessam a tela e partículas
// exclusivas de cada bioma (pétalas, folhas, neve, brasas, bolhas, aurora...).
import { T, TS, hash, tileAt, biomeOf } from './world';
import type { Game } from './engine';

type Ctx = CanvasRenderingContext2D;
const wrap = (v: number, m: number) => ((v % m) + m) % m;

/** Água viva: brilhos correndo com a corrente, anéis de ondulação nas margens e bolhas de lava. */
export function waterLife(g: Game, c: Ctx, x0: number, y0: number, x1: number, y1: number, wt: number) {
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = tileAt(g.world, tx, ty), x = tx * TS, y = ty * TS, ph = hash(tx, ty, 7);
    if (t === T.WATER) {
      // Brilho correndo com a corrente, em duas ondas cruzadas.
      const sx = x + wrap(wt * 7 + ph * 23, TS) - 2, sy = y + 4 + Math.sin(wt * 1.6 + ph * 9) * 4;
      c.globalAlpha = 0.22 + Math.sin(wt * 2.2 + ph * 12) * 0.1;
      c.fillStyle = '#dff6ff'; c.fillRect(Math.round(sx), Math.round(sy), 4, 1);
      const sx2 = x + wrap(-wt * 5 + ph * 31, TS) - 2;
      c.globalAlpha = 0.14; c.fillRect(Math.round(sx2), Math.round(y + 11 + Math.cos(wt * 1.3 + ph * 7) * 3), 3, 1);
      // Anel de ondulação se espalhando perto da margem.
      const shore = tileAt(g.world, tx + 1, ty) !== T.WATER || tileAt(g.world, tx - 1, ty) !== T.WATER || tileAt(g.world, tx, ty + 1) !== T.WATER || tileAt(g.world, tx, ty - 1) !== T.WATER;
      if (shore && ph > 0.45) {
        const k = wrap(wt * 0.45 + ph, 1), r = 2 + k * 6;
        c.globalAlpha = (1 - k) * 0.35; c.strokeStyle = '#cfeee8'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(x + 8, y + 9, r, r * 0.55, 0, 0, Math.PI * 2); c.stroke();
      }
    } else if (t === T.LAVA) {
      // Bolha de lava subindo e estourando, mais brilho pulsante na superfície.
      const k = wrap(wt * 0.7 + ph * 3, 1);
      c.globalAlpha = (1 - k) * 0.5; c.fillStyle = '#ffd27a';
      c.beginPath(); c.arc(x + 4 + ph * 8, y + 12 - k * 8, 1 + k, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.18 + Math.sin(wt * 3 + ph * 20) * 0.1; c.fillStyle = '#ff8a3a';
      c.fillRect(x + 2 + Math.floor(ph * 10), y + 3 + Math.floor(hash(tx, ty, 8) * 9), 2, 1);
    }
  }
  c.globalAlpha = 1;
}

/** Cor das lâminas de vegetação por bioma (padrão: verde de grama). */
const BLADE: Partial<Record<string, string>> = {
  desert: '#d8b060', mountain: '#cfe0e8', swamp: '#5a8a4a', autumn: '#c88030', volcanic: '#7a5a4a',
  mushroom: '#9a7ab8', coast: '#7ab86a', jungle: '#3a9a4a', meadow: '#8ac060', ruins: '#a8a078',
  amber: '#d8b060', oasis: '#7ab86a', aurora: '#cfe0e8', crimson: '#b05040',
};
/** Vento: lâminas de vegetação que se curvam em rajadas viajando pela tela. */
export function windLife(g: Game, c: Ctx, x0: number, y0: number, x1: number, y1: number, wt: number) {
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = tileAt(g.world, tx, ty);
    if (t !== T.GRASS && t !== T.FLOWER && t !== T.SAND && t !== T.SNOW && t !== T.MOSS && t !== T.AUTUMN) continue;
    const ph = hash(tx, ty, 21); if (ph > 0.4) continue;
    const gust = Math.sin(wt * 1.5 - (tx + ty) * 0.5) + Math.sin(wt * 0.7 - tx * 0.23) * 0.6;
    const bend = gust * 1.4, x = tx * TS, y = ty * TS;
    c.fillStyle = BLADE[biomeOf(g.world, x, y)] ?? '#3f8a52';
    c.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) {
      const bx = x + 3 + i * 5 + ph * 3, by = y + 13 - (i % 2) * 2;
      const hh = 4 + ((ph * 7 + i) % 3);
      // Lâmina curvada em dois segmentos: base firme, ponta levada pelo vento.
      c.fillRect(Math.round(bx), Math.round(by - hh / 2), 1, Math.ceil(hh / 2));
      c.fillRect(Math.round(bx + bend * 0.5), Math.round(by - hh), 1, Math.floor(hh / 2) + 1);
    }
  }
  c.globalAlpha = 1;
}

type Shape = 'petal' | 'leaf' | 'snow' | 'ember' | 'bubble' | 'mote' | 'spark' | 'dust' | 'pollen' | 'butterfly';
/** Partícula exclusiva de cada bioma: forma, cor e quantidade. */
const LIFE: Partial<Record<string, { shape: Shape; color: string; n: number; glow?: boolean }>> = {
  sakura: { shape: 'petal', color: '#ffc4da', n: 26 }, meadow: { shape: 'petal', color: '#ffe0f0', n: 16 },
  lotus: { shape: 'petal', color: '#f0d8ff', n: 18, glow: true }, lavender: { shape: 'petal', color: '#d0a8f0', n: 20 },
  autumn: { shape: 'leaf', color: '#e08a30', n: 22 }, crimson: { shape: 'leaf', color: '#d05038', n: 24 },
  forest: { shape: 'leaf', color: '#6ab04a', n: 14 }, jungle: { shape: 'leaf', color: '#50c058', n: 16 }, bamboo: { shape: 'leaf', color: '#a8e0a0', n: 18 },
  mountain: { shape: 'snow', color: '#ffffff', n: 40 }, aurora: { shape: 'snow', color: '#e8f4ff', n: 30 },
  volcanic: { shape: 'ember', color: '#ff8a30', n: 26, glow: true }, obsidian: { shape: 'ember', color: '#ff6a3a', n: 22, glow: true },
  coral: { shape: 'bubble', color: '#bfefff', n: 20 }, swamp: { shape: 'bubble', color: '#a8d890', n: 12 }, oasis: { shape: 'bubble', color: '#d0f0e0', n: 10 },
  spores: { shape: 'mote', color: '#e0b0ff', n: 26, glow: true }, mushroom: { shape: 'mote', color: '#f0b0ff', n: 20, glow: true },
  moonwood: { shape: 'mote', color: '#b0d8ff', n: 24, glow: true }, mangrove: { shape: 'mote', color: '#a0ffd0', n: 16, glow: true },
  thunder: { shape: 'spark', color: '#cfe0ff', n: 14, glow: true }, prism: { shape: 'spark', color: '#a0f0ff', n: 18, glow: true },
  ruins: { shape: 'dust', color: '#e8d8b0', n: 16 }, marble: { shape: 'dust', color: '#fff8e0', n: 14 }, cave: { shape: 'dust', color: '#b898ff', n: 14 },
  sunflower: { shape: 'pollen', color: '#ffe58a', n: 22 }, amber: { shape: 'pollen', color: '#ffd080', n: 18 },
  plains: { shape: 'butterfly', color: '#f0e0a0', n: 5 }, coast: { shape: 'butterfly', color: '#d0f0ff', n: 4 },
};

function drawShape(c: Ctx, shape: Shape, x: number, y: number, wt: number, seed: number, color: string, tw: number) {
  switch (shape) {
    case 'petal': {
      c.save(); c.translate(x, y); c.rotate(Math.sin(wt * 2 + seed) * 0.9);
      c.globalAlpha = 0.85; c.fillStyle = color; c.fillRect(-1, -2, 2, 4);
      c.globalAlpha = 0.5; c.fillStyle = '#ffffff'; c.fillRect(0, -2, 1, 2);
      c.restore(); break;
    }
    case 'leaf': {
      c.save(); c.translate(x, y); c.rotate(Math.sin(wt * 2.6 + seed) * 1.2);
      c.globalAlpha = 0.85; c.fillStyle = color; c.fillRect(-2, -1, 4, 2); c.fillRect(-1, -2, 2, 1);
      c.restore(); break;
    }
    case 'snow': {
      c.globalAlpha = 0.5 + tw * 0.4; c.fillStyle = color;
      const s = seed % 3 > 1.6 ? 2 : 1; c.fillRect(Math.round(x), Math.round(y), s, s);
      if (seed % 5 > 4) { c.globalAlpha = tw * 0.5; c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); }
      break;
    }
    case 'ember': {
      c.globalAlpha = tw * 0.25; c.fillStyle = color; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
      c.globalAlpha = tw; c.fillRect(Math.round(x), Math.round(y), 1, 1);
      c.globalAlpha = tw * 0.4; c.fillRect(Math.round(x), Math.round(y) + 2, 1, 1);
      break;
    }
    case 'bubble': {
      c.globalAlpha = 0.4 + tw * 0.2; c.strokeStyle = color; c.lineWidth = 1;
      c.beginPath(); c.arc(x, y, 1.5 + (seed % 2), 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 0.7; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 1, 1);
      break;
    }
    case 'mote': case 'pollen': {
      c.globalAlpha = tw * 0.22; c.fillStyle = color; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
      c.globalAlpha = tw; c.fillRect(Math.round(x), Math.round(y), shape === 'pollen' ? 1 : 2, shape === 'pollen' ? 1 : 2);
      break;
    }
    case 'spark': {
      if (Math.sin(wt * 7 + seed * 3) > 0.35) {
        c.globalAlpha = tw; c.fillStyle = color;
        c.fillRect(Math.round(x) - 2, Math.round(y), 5, 1); c.fillRect(Math.round(x), Math.round(y) - 2, 1, 5);
      }
      break;
    }
    case 'dust': {
      c.globalAlpha = 0.3 + tw * 0.25; c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), 1, 1);
      break;
    }
    case 'butterfly': {
      const flap = Math.sin(wt * 10 + seed) * 0.9;
      c.globalAlpha = 0.9; c.fillStyle = color;
      c.fillRect(Math.round(x - 1 - flap), Math.round(y - 1), 2, 2);
      c.fillRect(Math.round(x + 1 + flap) - 1, Math.round(y - 1), 2, 2);
      c.fillStyle = '#4a3a28'; c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3);
      break;
    }
  }
}

/** Cortinas de aurora ondulando no céu do bioma aurora. */
function auroraSky(c: Ctx, w: number, h: number, wt: number) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const cols = ['rgba(80,255,170,', 'rgba(120,180,255,', 'rgba(200,120,255,'];
  for (let b = 0; b < 3; b++) {
    const baseY = h * (0.1 + b * 0.09), amp = 10 + b * 5;
    c.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const y = baseY + Math.sin(wt * 0.4 + b * 2 + x * 0.015) * amp + Math.sin(wt * 0.23 + x * 0.05) * 4;
      if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.strokeStyle = `${cols[b]}${0.1 - b * 0.02})`; c.lineWidth = 14 - b * 3; c.stroke();
    c.strokeStyle = `${cols[b]}0.18)`; c.lineWidth = 3; c.stroke();
  }
  c.restore();
}

/** Partículas exclusivas do bioma atual, em espaço de tela com parallax suave. */
export function biomeLife(g: Game, c: Ctx) {
  if (g.interior || g.depth || g.island) return;
  const w = g.viewWidth, h = g.viewHeight, wt = g.clock, q = g.quality.level;
  if (g.biome === 'aurora') auroraSky(c, w, h, wt);
  const cfg = LIFE[g.biome]; if (!cfg || !g.weather.length) return;
  const n = Math.round(cfg.n * (q >= 2 ? 1 : q === 1 ? 0.6 : 0.35));
  c.save();
  if (cfg.glow) c.globalCompositeOperation = 'lighter';
  const par = 0.3;
  for (let i = 0; i < n; i++) {
    const f = g.weather[i % g.weather.length]!;
    const seed = f.s * 100 + i * 7.3;
    let x = 0, y = 0;
    switch (cfg.shape) {
      case 'petal': case 'leaf':
        x = wrap(f.x + wt * (10 + f.s * 14) + Math.sin(wt * 1.1 + seed) * 14 - g.cam.x * par, w + 24) - 12;
        y = wrap(f.y + wt * (12 + f.s * 16) - g.cam.y * par, h + 24) - 12; break;
      case 'snow':
        x = wrap(f.x + Math.sin(wt * 0.8 + seed) * 16 - wt * 6 - g.cam.x * par, w + 16) - 8;
        y = wrap(f.y + wt * (16 + f.s * 18) - g.cam.y * par, h + 16) - 8; break;
      case 'ember':
        x = wrap(f.x + Math.sin(wt * 1.7 + seed) * 10 - g.cam.x * par, w + 16) - 8;
        y = wrap(f.y - wt * (20 + f.s * 22) - g.cam.y * par, h + 16) - 8; break;
      case 'bubble':
        x = wrap(f.x + Math.sin(wt * 1.2 + seed) * 6 - g.cam.x * par, w + 12) - 6;
        y = wrap(f.y - wt * (12 + f.s * 12) - g.cam.y * par, h + 12) - 6; break;
      case 'spark':
        x = wrap(f.x + Math.sin(wt * 0.5 + seed) * 30 - g.cam.x * par, w + 16) - 8;
        y = wrap(f.y + Math.cos(wt * 0.4 + seed) * 24 - g.cam.y * par, h + 16) - 8; break;
      case 'dust':
        x = wrap(f.x + Math.sin(wt * 0.3 + seed) * 8 - g.cam.x * par, w + 12) - 6;
        y = wrap(f.y + wt * (3 + f.s * 4) - g.cam.y * par, h + 12) - 6; break;
      case 'pollen': case 'mote':
        x = wrap(f.x + Math.sin(wt * 0.5 + seed) * 18 - g.cam.x * par, w + 16) - 8;
        y = wrap(f.y + Math.cos(wt * 0.42 + seed * 1.3) * 14 - g.cam.y * par, h + 16) - 8; break;
      case 'butterfly':
        x = wrap(f.x + wt * (16 + f.s * 10) + Math.sin(wt * 2 + seed) * 22 - g.cam.x * par, w + 24) - 12;
        y = wrap(f.y + Math.sin(wt * 1.4 + seed) * 20 - g.cam.y * par, h + 24) - 12; break;
    }
    const tw = 0.55 + Math.sin(wt * 2.6 + seed * 2) * 0.35;
    drawShape(c, cfg.shape, x, y, wt, seed, cfg.color, tw);
  }
  c.restore();
}
