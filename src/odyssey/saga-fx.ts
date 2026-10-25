// Acabamento visual das zonas da Saga: cenário denso (sprites do mundo + objetos desenhados
// à mão por reino), um marco animado por zona, bichinhos ambientes, clima de tela cheia
// com 18 efeitos, gradação de cor e luzes. Tudo determinístico por zona.
import type { Game } from './engine';
import type { DungeonFloor } from './dungeon';
import type { SagaFx, SagaRealm, SagaZone } from './saga';
import { FRONTIER, type FrontierBiome } from './frontier';
import { T, TS, hash, solidAt } from './world';
import { softGlow } from './perf';

export interface Decor { tx: number; ty: number; kind: number; v: number }
export interface SceneLayout { decor: Decor[]; landmark: { tx: number; ty: number }; critters: { x: number; y: number; r: number; ph: number }[] }

const layouts = new Map<DungeonFloor, SceneLayout>();
/** Distribui cenário pelas salas sem tapar entrada, saída, baús nem corredores. */
export function sceneLayout(data: DungeonFloor, seed: number): SceneLayout {
  const hit = layouts.get(data); if (hit) return hit;
  const decor: Decor[] = [], taken = new Set<string>();
  const ok = (x: number, y: number) => !taken.has(`${x},${y}`) && !solidAt(data.world, x * TS + 8, y * TS + 8)
    && Math.hypot(data.start.tx - x, data.start.ty - y) > 3 && Math.hypot(data.stairs.tx - x, data.stairs.ty - y) > 4
    && !data.chests.some((c) => Math.abs(c.tx - x) < 2 && Math.abs(c.ty - y) < 2);
  let biggest = data.rooms[0]!;
  data.rooms.forEach((room, ri) => {
    if (room.w * room.h > biggest.w * biggest.h && Math.hypot(room.x - data.stairs.tx, room.y - data.stairs.ty) > 10) biggest = room;
    const n = Math.min(14, 3 + Math.floor((room.w * room.h) / 14));
    for (let k = 0; k < n * 3 && decor.length < 900; k++) {
      const h1 = hash(ri * 31 + k, seed, 11), h2 = hash(k, ri * 17 + seed, 23);
      // Preferência pelas bordas: o meio da sala fica livre para lutar.
      const edge = h1 < 0.7;
      const x = edge ? (h2 < 0.5 ? room.x + Math.floor(h2 * 4) : room.x + room.w - 1 - Math.floor((h2 - 0.5) * 4)) : room.x + 1 + Math.floor(h2 * Math.max(1, room.w - 2));
      const y = room.y + Math.floor(hash(k, ri, seed) * room.h);
      if (!ok(x, y)) continue;
      taken.add(`${x},${y}`); taken.add(`${x + 1},${y}`);
      decor.push({ tx: x, ty: y, kind: Math.floor(hash(x, y, seed) * 8), v: hash(y, x, seed + 1) });
      if (decor.filter((d) => d.tx >= room.x && d.tx < room.x + room.w && d.ty >= room.y && d.ty < room.y + room.h).length >= n) break;
    }
  });
  const landmark = { tx: biggest.x + Math.floor(biggest.w / 2), ty: biggest.y + Math.floor(biggest.h / 2) - 1 };
  const critters = data.rooms.slice(0, 18).map((room, i) => ({ x: (room.x + room.w / 2) * TS, y: (room.y + room.h / 2) * TS, r: Math.max(18, Math.min(room.w, room.h) * 5), ph: i * 1.7 }));
  const out = { decor: decor.filter((d) => Math.hypot(d.tx - landmark.tx, d.ty - landmark.ty) > 3), landmark, critters };
  layouts.set(data, out); return out;
}

/* ───────────── Objetos desenhados à mão por reino ───────────── */
type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, col: string, x: number, y: number, w: number, h: number) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
const shadow = (c: Ctx, x: number, y: number, r: number) => { c.save(); c.globalAlpha = 0.3; c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2); c.fill(); c.restore(); };
function glowDot(c: Ctx, x: number, y: number, r: number, col: string, a = 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; softGlow(c, x, y, r, col); c.restore(); }

type Drawer = (c: Ctx, x: number, y: number, v: number, wt: number, zn: SagaZone) => void;
const DRAW: Record<string, Drawer[]> = {
  aeloria: [
    (c, x, y, v) => { shadow(c, x, y, 6); px(c, '#f0e0d0', x - 4, y - 4, 8, 4); px(c, '#ffb0a0', x - 3, y - 5, 6, 1); px(c, '#c0a090', x - 1, y - 4, 1, 4); px(c, '#c0a090', x + 2, y - 4, 1, 4); if (v > .5) px(c, '#ffd0e0', x - 5, y - 2, 2, 2); },
    (c, x, y, v, wt) => { shadow(c, x, y, 8); px(c, '#6a4a30', x - 7, y - 3, 14, 3); px(c, '#4a3020', x - 7, y - 1, 14, 1); px(c, '#7a5a3a', x - 1, y - 22, 2, 20); px(c, '#e8e0d0', x + 1, y - 21 + Math.sin(wt + v * 9), 7, 8); px(c, '#c8c0b0', x + 1, y - 14 + Math.sin(wt + v * 9), 6, 1); },
    (c, x, y, v, wt) => { shadow(c, x, y, 5); px(c, '#d06040', x - 3, y - 3, 6, 3); px(c, '#ff8060', x - 4 + Math.sin(wt * 3 + v * 7), y - 5, 2, 2); px(c, '#ff8060', x + 2 - Math.sin(wt * 3 + v * 7), y - 5, 2, 2); px(c, '#000', x - 1, y - 4, 1, 1); px(c, '#000', x + 1, y - 4, 1, 1); },
    (c, x, y, v, wt) => { for (let i = 0; i < 4; i++) px(c, i % 2 ? '#40c0a0' : '#30a080', x - 4 + i * 2 + Math.sin(wt * 1.5 + i + v) * 1.2, y - 6 - i * 2, 2, 6 + i * 2); },
  ],
  ylvenna: [
    (c, x, y, v, wt) => { shadow(c, x, y, 6); px(c, '#f0e0ff', x - 1, y - 8, 3, 8); c.fillStyle = v > .5 ? '#ff70d0' : '#a070ff'; c.beginPath(); c.ellipse(x + .5, y - 9, 7, 4, 0, Math.PI, 0); c.fill(); px(c, '#fff', x - 3, y - 11, 1, 1); px(c, '#fff', x + 3, y - 10, 1, 1); glowDot(c, x, y - 9, 14, v > .5 ? 'rgba(255,110,210,0.35)' : 'rgba(160,110,255,0.35)', .6 + Math.sin(wt * 2 + v * 9) * .3); },
    (c, x, y, v) => { for (let i = 0; i < 5; i++) { const a = i * 1.26 + v * 6; px(c, '#4a9040', x + Math.cos(a) * 3, y - 2 + Math.sin(a) * 1, 1, 3); px(c, ['#ffd0f0', '#fff0a0', '#c0f0ff'][i % 3]!, x + Math.cos(a) * 4 - 1, y - 4 + Math.sin(a) * 1.5, 2, 2); } },
    (c, x, y, v, wt) => { px(c, '#503860', x, y - 18, 1, 18); const sw = Math.sin(wt * 1.4 + v * 5) * 1.5; px(c, '#ffe0a0', x - 2 + sw, y - 20, 5, 5); glowDot(c, x + .5 + sw, y - 18, 16, 'rgba(255,220,140,0.45)', .8); },
    (c, x, y, v) => { shadow(c, x, y, 7); c.fillStyle = '#3a7040'; c.beginPath(); c.ellipse(x, y - 4, 7, 5, 0, 0, Math.PI * 2); c.fill(); px(c, '#ff4060', x - 3, y - 7, 2, 2); px(c, '#ff4060', x + 2, y - 5, 2, 2); if (v > .4) px(c, '#ff4060', x - 1, y - 3, 2, 2); },
  ],
  thalassa: [
    (c, x, y, v, wt) => { for (let i = 0; i < 3; i++) for (let s = 0; s < 6; s++) px(c, s % 2 ? '#30a070' : '#40c080', x - 3 + i * 3 + Math.sin(wt * 1.2 + s * .5 + i + v * 4) * (s * .5), y - 2 - s * 3, 2, 3); },
    (c, x, y, v) => { shadow(c, x, y, 6); const col = v > .5 ? '#ff7090' : '#ffa050'; px(c, col, x - 1, y - 10, 2, 10); px(c, col, x - 5, y - 8, 2, 6); px(c, col, x + 3, y - 9, 2, 7); px(c, col, x - 5, y - 3, 10, 2); px(c, '#fff0f0', x - 1, y - 11, 2, 1); },
    (c, x, y, v, wt) => { shadow(c, x, y, 4); px(c, '#404860', x - 3, y - 3, 6, 3); for (let i = 0; i < 3; i++) { const t = (wt * .5 + i / 3 + v) % 1; c.globalAlpha = 1 - t; c.strokeStyle = '#c0f0ff'; c.lineWidth = 1; c.beginPath(); c.arc(x + Math.sin(t * 8 + i) * 2, y - 4 - t * 26, 1 + t * 2, 0, Math.PI * 2); c.stroke(); } c.globalAlpha = 1; },
    (c, x, y, v) => { shadow(c, x, y, 5); px(c, '#e8e0f0', x - 4, y - 3, 8, 3); px(c, '#ffffff', x - 2, y - 4, 4, 1); if (v > .5) glowDot(c, x, y - 3, 8, 'rgba(220,230,255,0.4)'); },
  ],
  aerith: [
    (c, x, y, v, wt) => { c.save(); c.globalAlpha = .85; c.fillStyle = '#ffffff'; const d = Math.sin(wt * .6 + v * 9) * 2; c.beginPath(); c.ellipse(x + d, y - 3, 9, 4, 0, 0, Math.PI * 2); c.ellipse(x - 4 + d, y - 6, 5, 4, 0, 0, Math.PI * 2); c.ellipse(x + 4 + d, y - 6, 5, 3, 0, 0, Math.PI * 2); c.fill(); c.restore(); },
    (c, x, y, v) => { shadow(c, x, y, 7); px(c, '#e8e0d0', x - 4, y - (v > .5 ? 22 : 12), 8, v > .5 ? 22 : 12); px(c, '#c8c0b0', x - 4, y - (v > .5 ? 22 : 12), 1, v > .5 ? 22 : 12); px(c, '#fff8e8', x - 6, y - (v > .5 ? 24 : 14), 12, 3); px(c, '#b0a890', x - 6, y - 2, 12, 2); },
    (c, x, y, v, wt) => { const s = Math.sin(wt * 1.3 + v * 9); px(c, '#ffe8a0', x - 1 + s, y - 8, 1, 8); px(c, '#fff4d0', x + s, y - 8, 3, 1); px(c, '#fff4d0', x + s, y - 6, 3, 1); px(c, '#fff4d0', x + s, y - 4, 2, 1); },
    (c, x, y, v, wt) => { shadow(c, x, y, 5); px(c, '#a08050', x - 3, y - 6, 6, 6); px(c, '#ffe070', x - 1, y - 9, 2, 3); glowDot(c, x, y - 9, 14, 'rgba(255,220,120,0.5)', .7 + Math.sin(wt * 6 + v * 9) * .2); },
  ],
  mortaveu: [
    (c, x, y, v) => { shadow(c, x, y, 6); px(c, '#6a7068', x - 4, y - 11, 8, 11); px(c, '#8a9088', x - 3, y - 12, 6, 1); px(c, '#4a5048', x - 1, y - 9, 2, 5); px(c, '#4a5048', x - 3, y - 8, 6, 2); if (v > .6) px(c, '#60a060', x - 4, y - 2, 8, 2); },
    (c, x, y, v, wt) => { px(c, '#f0f0e0', x - 1, y - 6, 2, 6); const f = Math.sin(wt * 10 + v * 30) * .6; px(c, '#a0ffb0', x - 1 + f, y - 9, 2, 3); glowDot(c, x, y - 8, 14, 'rgba(140,255,170,0.45)', .8); },
    (c, x, y) => { shadow(c, x, y, 6); px(c, '#e8e0c8', x - 5, y - 2, 10, 2); px(c, '#d8d0b8', x - 3, y - 4, 2, 2); px(c, '#f0e8d0', x + 1, y - 5, 4, 3); px(c, '#202020', x + 2, y - 4, 1, 1); },
    (c, x, y, v, wt) => { c.save(); c.globalAlpha = .35 + Math.sin(wt * 1.5 + v * 7) * .15; c.fillStyle = '#c0ffd0'; c.beginPath(); c.ellipse(x, y - 10 - Math.sin(wt + v * 5) * 3, 4, 7, 0, 0, Math.PI * 2); c.fill(); c.restore(); },
  ],
  khronn: [
    (c, x, y, v) => { shadow(c, x, y, 6); px(c, '#a07030', x - 5, y - 14, 10, 2); px(c, '#a07030', x - 5, y - 2, 10, 2); c.fillStyle = 'rgba(200,230,255,0.6)'; c.beginPath(); c.moveTo(x - 4, y - 12); c.lineTo(x + 4, y - 12); c.lineTo(x, y - 7); c.lineTo(x + 4, y - 2); c.lineTo(x - 4, y - 2); c.lineTo(x, y - 7); c.fill(); px(c, '#ffd080', x - 2, y - (v > .5 ? 5 : 11), 4, 2); },
    (c, x, y, v, wt) => { c.save(); c.translate(x, y - 6); c.rotate(wt * (v > .5 ? .6 : -.6)); c.fillStyle = '#b08040'; for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.fillRect(-1, -7, 2, 3); } c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#6a4a20'; c.beginPath(); c.arc(0, 0, 2, 0, Math.PI * 2); c.fill(); c.restore(); },
    (c, x, y) => { shadow(c, x, y, 7); px(c, '#d8b070', x - 6, y - 4, 12, 4); px(c, '#c09050', x - 4, y - 7, 8, 3); px(c, '#e8c890', x - 3, y - 7, 4, 1); },
    (c, x, y, v, wt) => { for (let i = 0; i < 6; i++) { const t = (wt * .3 + i / 6 + v) % 1; px(c, '#ffe0a0', x - 3 + i, y - t * 18, 1, 1); } },
  ],
  gehenna: [
    (c, x, y, v, wt) => { const a = .6 + Math.sin(wt * 3 + v * 9) * .3; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.strokeStyle = '#ff6020'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 7, y - 1); c.lineTo(x - 2, y - 3); c.lineTo(x + 1, y); c.lineTo(x + 7, y - 2); c.stroke(); c.restore(); glowDot(c, x, y - 1, 10, 'rgba(255,90,30,0.4)', a); },
    (c, x, y) => { shadow(c, x, y, 5); c.fillStyle = '#2a1818'; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x, y - 16); c.lineTo(x + 4, y); c.fill(); px(c, '#5a3030', x - 1, y - 12, 1, 10); },
    (c, x, y, v, wt) => { shadow(c, x, y, 6); px(c, '#3a2a2a', x - 5, y - 6, 10, 6); px(c, '#5a4040', x - 6, y - 7, 12, 2); const f = Math.sin(wt * 12 + v * 20); px(c, '#ff8020', x - 3, y - 11 + f, 6, 4); px(c, '#ffe060', x - 1, y - 13 - f, 2, 3); glowDot(c, x, y - 10, 20, 'rgba(255,120,40,0.5)', .9); },
    (c, x, y, v, wt) => { for (let i = 0; i < 7; i++) px(c, i % 2 ? '#504848' : '#686060', x - 1 + Math.sin(wt * .8 + i * .4 + v * 5) * (i * .4), y - 24 + i * 3, 3, 3); },
  ],
  vazio: [
    (c, x, y, v, wt) => { const b = Math.sin(wt * 1.3 + v * 9) * 3; c.fillStyle = v > .5 ? '#c0a0ff' : '#a0d0ff'; c.beginPath(); c.moveTo(x, y - 18 + b); c.lineTo(x + 4, y - 10 + b); c.lineTo(x, y - 4 + b); c.lineTo(x - 4, y - 10 + b); c.fill(); px(c, '#ffffff', x - 1, y - 14 + b, 1, 4); glowDot(c, x, y - 10 + b, 16, 'rgba(180,150,255,0.45)', .8); shadow(c, x, y, 4); },
    (c, x, y, v, wt) => { const s = .5 + Math.sin(wt * 3 + v * 20) * .5; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = s; px(c, '#ffffff', x, y - 8, 1, 1); px(c, '#d0c0ff', x - 2, y - 8, 5, 1); px(c, '#d0c0ff', x, y - 10, 1, 5); c.restore(); },
    (c, x, y, v, wt) => { c.save(); c.globalAlpha = .7; c.fillStyle = '#05000f'; c.beginPath(); c.ellipse(x, y - 2, 7 + Math.sin(wt * 2 + v) * 1, 2.5, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a080ff'; c.lineWidth = 1; c.stroke(); c.restore(); },
    (c, x, y) => { shadow(c, x, y, 6); px(c, '#4a4060', x - 5, y - 6, 10, 6); px(c, '#6a6088', x - 4, y - 7, 8, 1); px(c, '#8070b0', x + 1, y - 5, 2, 2); },
  ],
};

/** Desenha cenário, marco e bichinhos da zona atual na ordem de profundidade. */
export function drawSagaScenery(g: Game, c: Ctx, draws: { y: number; f: () => void }[], realm: SagaRealm, ri: number, zi: number, zone: SagaZone, x0: number, y0: number, x1: number, y1: number, wt: number) {
  const data = g.depth!.data, L = sceneLayout(data, 7_001 + ri * 131 + zi * 17), set = DRAW[realm.id] ?? DRAW['aeloria']!;
  const frontier = zone.biome in FRONTIER ? (zone.biome as FrontierBiome) : null;
  for (const d of L.decor) {
    if (d.tx < x0 - 2 || d.tx > x1 + 2 || d.ty < y0 - 2 || d.ty > y1 + 3) continue;
    const x = d.tx * TS + 8, y = d.ty * TS + 15;
    draws.push({ y, f: () => {
      // Um terço do cenário usa a arte detalhada dos biomas da superfície.
      if (d.kind === 0 && frontier && g.art.frontier.naturalWidth) g.art.frontierObject(c, frontier, d.tx, d.ty, wt);
      else if (d.kind === 1 && g.art.canopy.naturalWidth) g.art.prop(c, zone.deco === T.WATER || zone.deco === T.LAVA ? T.ROCK : zone.deco, zone.biome, d.tx, d.ty) || g.art.prop(c, T.BUSH, zone.biome, d.tx, d.ty);
      else if (d.kind === 2 && g.art.canopy.naturalWidth && (zone.wall === T.TREE || zone.deco === T.PALM)) g.art.tree(c, zone.deco === T.PALM ? T.PALM : T.TREE, d.tx, d.ty, wt);
      else set[d.kind % set.length]!(c, x, y, d.v, wt, zone);
    } });
  }
  const lm = L.landmark;
  if (lm.tx >= x0 - 6 && lm.tx <= x1 + 6 && lm.ty >= y0 - 6 && lm.ty <= y1 + 8) draws.push({ y: lm.ty * TS + 16, f: () => drawLandmark(c, realm, zi, zone, lm.tx * TS + 8, lm.ty * TS + 16, wt) });
  // Bichinhos do reino: voam, nadam ou flutuam por cima de tudo.
  draws.push({ y: 1e9 - 1, f: () => {
    c.save();
    for (const [i, cr] of L.critters.entries()) {
      const t = wt * (0.4 + (i % 3) * 0.15) + cr.ph, x = cr.x + Math.cos(t) * cr.r, y = cr.y + Math.sin(t * 1.3) * cr.r * 0.6 - 10;
      if (x < x0 * TS - 20 || x > x1 * TS + 20 || y < y0 * TS - 20 || y > y1 * TS + 20) continue;
      critter(c, realm.id, x, y, wt * 8 + i, zone.color, Math.cos(t) < 0);
    }
    c.restore();
  } });
}

function critter(c: Ctx, realm: string, x: number, y: number, ph: number, col: string, left: boolean) {
  const flap = Math.sin(ph) > 0 ? 1 : 0, dir = left ? -1 : 1;
  switch (realm) {
    case 'aeloria': case 'aerith': px(c, '#ffffff', x - 3, y - flap, 2, 1); px(c, '#ffffff', x + 1, y - flap, 2, 1); px(c, '#d0d0d0', x - 1, y, 2, 1); break; // gaivotas e pombas
    case 'ylvenna': glowDot(c, x, y, 8, 'rgba(255,200,255,0.5)'); px(c, '#ffe0ff', x - 2, y - 1 - flap, 2, 2); px(c, '#ffe0ff', x + 1, y - 1 - flap, 2, 2); px(c, '#ffffff', x, y, 1, 1); break; // fadinhas
    case 'thalassa': c.globalAlpha = .7; px(c, col, x - 3 * dir, y, 5, 2); px(c, col, x + 2 * dir, y - flap, 1, 3); c.globalAlpha = 1; break; // peixinhos
    case 'mortaveu': c.globalAlpha = .45; c.fillStyle = '#d0ffe0'; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); px(c, '#d0ffe0', x - 1, y + 2 + flap, 2, 3); c.globalAlpha = 1; break; // almas
    case 'khronn': px(c, '#402010', x - 2, y, 4, 2); px(c, '#806040', x - 3, y - flap, 2, 1); px(c, '#806040', x + 1, y - flap, 2, 1); break; // escaravelhos voadores
    case 'gehenna': glowDot(c, x, y, 10, 'rgba(255,100,30,0.5)'); px(c, '#ffb040', x - 1, y - 1, 2, 2); break; // brasas vivas
    default: glowDot(c, x, y, 9, 'rgba(180,160,255,0.5)'); px(c, '#ffffff', x, y, 1, 1); // notas perdidas
  }
}

/** Um marco grande e animado no coração de cada zona. */
function drawLandmark(c: Ctx, realm: SagaRealm, zi: number, zone: SagaZone, x: number, y: number, wt: number) {
  const pulse = 0.6 + Math.sin(wt * 2 + zi) * 0.25;
  c.save();
  c.globalAlpha = 0.35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, 26, 8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // Círculo de runas no chão, na cor da zona.
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35 * pulse; c.strokeStyle = zone.color; c.lineWidth = 1;
  c.beginPath(); c.ellipse(x, y - 1, 30, 10, 0, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 8; i++) { const a = wt * 0.3 + (i / 8) * Math.PI * 2; c.fillStyle = zone.color; c.fillRect(x + Math.cos(a) * 30 - 1, y - 1 + Math.sin(a) * 10 - 1, 2, 2); }
  c.restore();
  switch (realm.id) {
    case 'aeloria': { // casco de navio encalhado com sino
      px(c, '#5a3a22', x - 24, y - 14, 48, 12); px(c, '#3a2414', x - 22, y - 4, 44, 3); px(c, '#7a5232', x - 24, y - 14, 48, 2);
      for (let i = 0; i < 6; i++) px(c, '#2a1a10', x - 20 + i * 8, y - 12, 1, 9);
      px(c, '#6a4a2a', x - 2, y - 46, 3, 34); px(c, '#e8e0d0', x + 1, y - 44, 14, 16); px(c, '#c8c0b0', x + 1, y - 30, 14, 2);
      const sw = Math.sin(wt * 2) * 2; px(c, '#d0a040', x - 9 + sw, y - 38, 6, 6); glowDot(c, x - 6 + sw, y - 35, 16, 'rgba(255,220,120,0.4)', pulse); break;
    }
    case 'ylvenna': { // cogumelo-trono gigante
      px(c, '#f0e0ff', x - 4, y - 30, 8, 30); c.fillStyle = '#c050ff'; c.beginPath(); c.ellipse(x, y - 32, 26, 12, 0, Math.PI, 0); c.fill();
      for (let i = 0; i < 7; i++) px(c, '#ffe0ff', x - 20 + i * 6, y - 38 + (i % 2) * 4, 3, 3);
      glowDot(c, x, y - 34, 40, 'rgba(220,120,255,0.35)', pulse); break;
    }
    case 'thalassa': { // arco de coral com pérola
      c.strokeStyle = '#ff8090'; c.lineWidth = 6; c.beginPath(); c.arc(x, y - 6, 20, Math.PI, 0); c.stroke();
      c.strokeStyle = '#ffb0c0'; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 6, 20, Math.PI, 0); c.stroke();
      c.fillStyle = '#f8f0ff'; c.beginPath(); c.arc(x, y - 30 + Math.sin(wt) * 2, 5, 0, Math.PI * 2); c.fill();
      glowDot(c, x, y - 30, 30, 'rgba(200,230,255,0.5)', pulse); break;
    }
    case 'aerith': { // coluna partida com asa de pedra
      px(c, '#e8e0d0', x - 6, y - 40, 12, 40); px(c, '#fff8e8', x - 9, y - 44, 18, 5); px(c, '#c8c0b0', x - 6, y - 40, 2, 40);
      c.fillStyle = '#f8f0e0'; c.beginPath(); c.moveTo(x + 6, y - 36); c.quadraticCurveTo(x + 30, y - 50, x + 26, y - 20); c.quadraticCurveTo(x + 16, y - 26, x + 6, y - 22); c.fill();
      glowDot(c, x, y - 44, 34, 'rgba(255,240,180,0.45)', pulse); break;
    }
    case 'mortaveu': { // portal de lápides com chama verde
      px(c, '#5a6058', x - 18, y - 30, 8, 30); px(c, '#5a6058', x + 10, y - 30, 8, 30); px(c, '#6a7068', x - 20, y - 34, 40, 5);
      c.globalAlpha = 0.5 + Math.sin(wt * 3) * 0.2; c.fillStyle = '#80ffa0'; c.beginPath(); c.ellipse(x, y - 15, 9, 14, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      glowDot(c, x, y - 16, 36, 'rgba(120,255,160,0.45)', pulse); break;
    }
    case 'khronn': { // ampulheta colossal
      px(c, '#a07030', x - 16, y - 48, 32, 4); px(c, '#a07030', x - 16, y - 4, 32, 4); px(c, '#805020', x - 15, y - 44, 2, 40); px(c, '#805020', x + 13, y - 44, 2, 40);
      c.fillStyle = 'rgba(210,235,255,0.5)'; c.beginPath(); c.moveTo(x - 12, y - 44); c.lineTo(x + 12, y - 44); c.lineTo(x + 1, y - 24); c.lineTo(x + 12, y - 4); c.lineTo(x - 12, y - 4); c.lineTo(x - 1, y - 24); c.fill();
      const lvl = (wt * 0.05) % 1; c.fillStyle = '#ffd080'; c.beginPath(); c.moveTo(x - 10 * lvl, y - 6 - 14 * lvl); c.lineTo(x + 10 * lvl, y - 6 - 14 * lvl); c.lineTo(x + 11, y - 4); c.lineTo(x - 11, y - 4); c.fill();
      for (let i = 0; i < 4; i++) px(c, '#ffe0a0', x, y - 24 + ((wt * 30 + i * 5) % 18), 1, 2); break;
    }
    case 'gehenna': { // pilar de chifres com olho de fogo
      c.fillStyle = '#2a1414'; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x - 4, y - 50); c.lineTo(x + 4, y - 50); c.lineTo(x + 14, y); c.fill();
      c.fillStyle = '#4a2020'; c.beginPath(); c.moveTo(x - 4, y - 46); c.quadraticCurveTo(x - 20, y - 56, x - 18, y - 66); c.quadraticCurveTo(x - 10, y - 54, x - 2, y - 50); c.fill();
      c.beginPath(); c.moveTo(x + 4, y - 46); c.quadraticCurveTo(x + 20, y - 56, x + 18, y - 66); c.quadraticCurveTo(x + 10, y - 54, x + 2, y - 50); c.fill();
      c.fillStyle = '#ff5020'; c.beginPath(); c.ellipse(x, y - 30, 4, 2 + Math.abs(Math.sin(wt * 0.7)) * 3, 0, 0, Math.PI * 2); c.fill();
      glowDot(c, x, y - 30, 40, 'rgba(255,70,20,0.5)', pulse); break;
    }
    default: { // fenda no céu
      c.save(); c.translate(x, y - 30); c.rotate(Math.sin(wt * 0.3) * 0.1);
      c.fillStyle = '#05000f'; c.beginPath(); c.moveTo(0, -22); c.lineTo(8, -4); c.lineTo(3, 0); c.lineTo(10, 18); c.lineTo(-4, 4); c.lineTo(-1, 0); c.lineTo(-9, -12); c.fill();
      c.strokeStyle = '#c0a0ff'; c.lineWidth = 1; c.stroke(); c.restore();
      for (let i = 0; i < 10; i++) { const a = wt * 0.8 + i; px(c, '#ffffff', x + Math.cos(a) * (14 + i), y - 30 + Math.sin(a) * (10 + i), 1, 1); }
      glowDot(c, x, y - 30, 44, 'rgba(160,120,255,0.45)', pulse);
    }
  }
  c.restore();
}

/* ───────────── Clima de tela cheia ───────────── */
interface Mote { x: number; y: number; s: number; a: number }
const motes: Mote[] = Array.from({ length: 150 }, (_, i) => ({ x: hash(i, 1, 5) * 640, y: hash(i, 2, 5) * 400, s: hash(i, 3, 5), a: hash(i, 4, 5) * 6.28 }));
const FX_N: Record<SagaFx, number> = { embers: 60, ash: 70, bubbles: 40, spray: 50, leaves: 34, fireflies: 40, spores: 50, snow: 90, clouds: 8, sparkles: 40, ghosts: 14, sand: 80, rain: 120, petals: 40, void: 50, stars: 50, feathers: 22, gears: 10 };

function fx(c: Ctx, kind: SagaFx, list: Mote[], w: number, h: number, dt: number, wt: number, cam: { x: number; y: number }, col: string) {
  const par = 0.25;
  for (const [i, f] of list.entries()) {
    const sp = 0.5 + f.s;
    switch (kind) {
      case 'embers': case 'spores': case 'bubbles': case 'ghosts': f.y -= (kind === 'ghosts' ? 6 : 14) * sp * dt; f.x += Math.sin(wt + i) * 8 * dt; break;
      case 'ash': case 'snow': case 'petals': case 'leaves': case 'feathers': f.y += (kind === 'snow' ? 22 : 12) * sp * dt; f.x += (Math.sin(wt * 0.9 + i) * 14 - 4) * dt; break;
      case 'sand': case 'spray': f.x += (kind === 'sand' ? 120 : 40) * sp * dt; f.y += Math.sin(wt * 2 + i) * 4 * dt; break;
      case 'rain': f.y += 320 * dt; f.x -= 70 * dt; break;
      case 'clouds': f.x += 6 * sp * dt; break;
      case 'void': { const dx = w / 2 - f.x, dy = h / 2 - f.y, d = Math.hypot(dx, dy) || 1; f.x += (dx / d) * 18 * sp * dt; f.y += (dy / d) * 18 * sp * dt; if (d < 8) { f.x = hash(i, wt | 0, 3) * w; f.y = hash(wt | 0, i, 4) * h; } break; }
      default: f.x += Math.cos(wt * 0.5 + i) * 6 * dt; f.y += Math.sin(wt * 0.6 + i) * 5 * dt;
    }
    f.a += dt * (1 + f.s);
    f.x = ((f.x % w) + w) % w; f.y = ((f.y % h) + h) % h;
    const x = Math.round((((f.x - cam.x * par) % w) + w) % w), y = Math.round((((f.y - cam.y * par) % h) + h) % h), tw = 0.5 + Math.sin(wt * 3 + i * 1.7) * 0.5;
    switch (kind) {
      case 'embers': c.globalAlpha = 0.5 + tw * 0.5; c.fillStyle = i % 3 ? '#ff9040' : '#ffe080'; c.fillRect(x, y, 1 + (f.s > .7 ? 1 : 0), 1 + (f.s > .7 ? 1 : 0)); c.globalAlpha = 0.15; c.fillRect(x - 2, y - 2, 5, 5); break;
      case 'ash': c.globalAlpha = 0.45; c.fillStyle = '#a09890'; c.fillRect(x, y, 2, 1); break;
      case 'bubbles': c.globalAlpha = 0.5; c.strokeStyle = '#d0f4ff'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 1 + f.s * 2.5, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 1, 1, 1); break;
      case 'spray': c.globalAlpha = 0.35; c.fillStyle = '#e0f8ff'; c.fillRect(x, y, 3, 1); break;
      case 'leaves': case 'petals': case 'feathers': { c.save(); c.translate(x, y); c.rotate(f.a); c.globalAlpha = 0.8; c.fillStyle = kind === 'leaves' ? (i % 2 ? '#70c050' : '#c09040') : kind === 'petals' ? (i % 2 ? '#ffc0e0' : '#ffffff') : '#f8f4ea'; c.fillRect(-2, -1, kind === 'feathers' ? 5 : 3, kind === 'feathers' ? 1 : 2); c.restore(); break; }
      case 'fireflies': case 'sparkles': case 'stars': c.globalAlpha = tw; c.fillStyle = kind === 'fireflies' ? '#d0ff90' : kind === 'stars' ? '#ffffff' : col; c.fillRect(x, y, 1, 1); if (tw > .8) { c.globalAlpha = tw * .5; c.fillRect(x - 2, y, 5, 1); c.fillRect(x, y - 2, 1, 5); } break;
      case 'spores': c.globalAlpha = 0.4 + tw * 0.3; c.fillStyle = '#e0ffa0'; c.fillRect(x, y, 2, 2); break;
      case 'snow': c.globalAlpha = 0.8; c.fillStyle = '#ffffff'; c.fillRect(x, y, f.s > .6 ? 2 : 1, f.s > .6 ? 2 : 1); break;
      case 'clouds': c.globalAlpha = 0.08; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(x, y, 60 + f.s * 40, 18 + f.s * 10, 0, 0, Math.PI * 2); c.fill(); break;
      case 'ghosts': c.globalAlpha = 0.12 + tw * 0.1; c.fillStyle = '#d0ffe0'; c.beginPath(); c.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2); c.fill(); break;
      case 'sand': c.globalAlpha = 0.5; c.fillStyle = '#f0d090'; c.fillRect(x, y, 3, 1); break;
      case 'rain': c.globalAlpha = 0.5; c.fillStyle = '#b0c8ff'; c.fillRect(x, y, 1, 6); break;
      case 'void': c.globalAlpha = 0.6; c.fillStyle = i % 2 ? '#a080ff' : '#20103a'; c.fillRect(x, y, 2, 2); break;
      case 'gears': { c.save(); c.translate(x, y); c.rotate(f.a * 0.3); c.globalAlpha = 0.18; c.strokeStyle = '#ffd080'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 10 + f.s * 10, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillStyle = '#ffd080'; c.fillRect(-1, -(13 + f.s * 10), 3, 4); } c.restore(); break; }
    }
  }
  c.globalAlpha = 1;
}

/** Clima, gradação de cor e raios de luz da zona — desenhado em coordenadas de tela. */
export function drawSagaWeather(g: Game, c: Ctx, zone: SagaZone) {
  const w = g.viewWidth, h = g.viewHeight, dt = Math.min(0.1, g.lastDelta), wt = g.clock, q = g.quality.level === 0 ? 0.45 : g.quality.level === 1 ? 0.75 : 1;
  c.save();
  const [r, gg, b, a] = zone.tint;
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(${r},${gg},${b},${a * 1.6})`; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';
  // Raios de luz nas zonas claras.
  if (zone.light < 0.35) {
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x = ((i * 0.27 + wt * 0.01) % 1) * w * 1.4 - w * 0.2, alpha = 0.035 + Math.sin(wt * 0.4 + i * 2) * 0.02;
      const gr = c.createLinearGradient(x, 0, x - h * 0.4, h); gr.addColorStop(0, `rgba(${r},${gg},${b},${alpha * 2})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, 0); c.lineTo(x + 40 - h * 0.4, h); c.lineTo(x - h * 0.4, h); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
  }
  const n1 = Math.floor(FX_N[zone.fx] * q), n2 = zone.fx2 ? Math.floor(FX_N[zone.fx2] * 0.6 * q) : 0;
  fx(c, zone.fx, motes.slice(0, n1), w, h, dt, wt, g.cam, zone.color);
  if (zone.fx2) fx(c, zone.fx2, motes.slice(150 - n2), w, h, dt, wt, g.cam, zone.color);
  c.restore();
}

/** Luzes do cenário: marco e objetos que brilham. */
export function sagaSceneLights(g: Game, hole: (x: number, y: number, r: number, a?: number) => void, ri: number, zi: number) {
  const L = sceneLayout(g.depth!.data, 7_001 + ri * 131 + zi * 17);
  hole(L.landmark.tx * TS + 8, L.landmark.ty * TS - 10, 90, 0.85);
  for (const d of L.decor) if (d.kind >= 4 && d.v > 0.55) hole(d.tx * TS + 8, d.ty * TS + 4, 34, 0.55);
}
