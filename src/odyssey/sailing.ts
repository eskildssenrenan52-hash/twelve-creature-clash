/**
 * Velejar e visitar ilhas — ligação do Arquipélago com o motor (browser).
 * Progresso salvo só em `discoveries` (`boat:<id>`, `isle:<id>:...`): campos aditivos, saves antigos seguem válidos.
 */
import type { Game, Enemy } from "./engine";
import { ITEMS } from "./data";
import { W, H, TS, T, SOLID, BIOME_LIST, hash, type World } from "./world";
import { enemyLevel } from "./levels";
import {
  BOATS, ISLANDS, MAIN, SEA, ROCKS, CURRENTS, bestBoat, boatFromItem, coastRadius, depthAt, islandById, islandTileSpan,
  landAt, nearShore, stepBoat, windAt, ISLAND_TILES_PER_PX, type BoatDef, type BoatState, type IslandDef,
} from "./archipelago";

export interface SeaRun { boat: BoatState; def: BoatDef; t: number; wake: { x: number; y: number; life: number }[]; warnT: number }
export interface IslandRun { def: IslandDef; ox: number; oy: number; span: number; bossId: number; seaPos: { x: number; y: number; a: number }; center: { x: number; y: number }; tick: number; parts: { x: number; y: number; s: number }[] }

const MAIN_SEED = 3.1;
const DEPTH_NAMES = ["Terra", "Águas rasas", "Costas", "Mar aberto", "Fossa abissal"];

// ---------------------------------------------------------------- utilidades
const owned = (g: Game) => g.discoveries;
const done = (g: Game, k: string) => g.discoveries.has(k);

export function onBoatCraft(g: Game, out: string) {
  const b = boatFromItem(out); if (!b) return;
  g.removeItem(out, 1); g.discoveries.add(`boat:${b}`);
  g.biomeBanner = { name: `⚓ ${BOATS[b].name} pronta! Vá até a beira do mar e aperte E.`, t: 5 };
  g.save();
}

function nearWater(g: Game) {
  const ptx = Math.floor(g.p.x / TS), pty = Math.floor(g.p.y / TS);
  let n = 0;
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
    const tx = ptx + x, ty = pty + y;
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) { n++; continue; }
    if (g.world.tiles[ty * W + tx] === T.WATER) n++;
  }
  return n >= 4;
}
export function canLaunch(g: Game) {
  return !g.interior && !g.depth && !g.island && !g.sea && !!bestBoat(owned(g)) && nearWater(g);
}

// ---------------------------------------------------------------- mar
function startSea(g: Game, x: number, y: number, a: number) {
  const def = bestBoat(owned(g))!;
  g.sea = { boat: { x, y, a, vx: 0, vy: 0, hull: def.hull, anchored: false }, def, t: g.clock, wake: [], warnT: 0 };
  g.enemies = []; g.projs = []; g.teles = [];
  g.biomeBanner = { name: `Mar de Ømnia · ${def.name}`, t: 3 };
  g.audio.biome = "coast";
}
export function launch(g: Game) {
  g.seaReturn = { x: g.p.x, y: g.p.y };
  g.surfaceEnemies = g.enemies;
  const a = Math.atan2(g.p.y - (H * TS) / 2, g.p.x - (W * TS) / 2);
  let r = coastRadius(MAIN.r, MAIN_SEED, a) + 30;
  while (depthAt(MAIN.x + Math.cos(a) * r, MAIN.y + Math.sin(a) * r) === 0) r += 10;
  startSea(g, MAIN.x + Math.cos(a) * r, MAIN.y + Math.sin(a) * r, a);
  g.clearTransition(); g.save();
}
function returnHome(g: Game) {
  g.sea = null; g.island = null; g.world = g.overworld;
  g.enemies = g.surfaceEnemies; g.surfaceEnemies = [];
  g.p.x = g.seaReturn.x; g.p.y = g.seaReturn.y;
  g.clearTransition(); g.toast("De volta à Ilha de Potos.", "#bfe8ff"); g.save();
}

const inputOf = (g: Game) => {
  const k = g.keys;
  const up = k.has("KeyW") || k.has("ArrowUp"), dn = k.has("KeyS") || k.has("ArrowDown");
  const lf = k.has("KeyA") || k.has("ArrowLeft"), rt = k.has("KeyD") || k.has("ArrowRight");
  return { throttle: up ? 1 : dn ? -0.4 : 0, turn: (rt ? 1 : 0) - (lf ? 1 : 0) };
};

export function updateSea(g: Game, dt: number) {
  const s = g.sea!; s.t += dt; s.warnT -= dt;
  const res = stepBoat(s.boat, s.def, inputOf(g), dt, s.t);
  if (res.blocked === "deep" && s.warnT <= 0) { g.toast(s.def.maxDepth < 2 ? "Águas profundas demais para a Jangada — construa uma Caravela." : "As fossas abissais só se abrem para a Carraca do Abismo.", "#9fd0ff"); s.warnT = 3; }
  if (res.blocked === "rock") { g.shake = 4; g.audio.sfx("hurt"); }
  const sp = Math.hypot(s.boat.vx, s.boat.vy);
  if (sp > 20 && Math.random() < dt * 30) s.wake.push({ x: s.boat.x - Math.cos(s.boat.a) * 12, y: s.boat.y - Math.sin(s.boat.a) * 12, life: 1.6 });
  for (const w of s.wake) w.life -= dt;
  s.wake = s.wake.filter((w) => w.life > 0);
  if (s.boat.hull <= 0) {
    g.toast("O casco se partiu! As ondas te levaram de volta à praia.", "#ff9090");
    g.p.gold = Math.floor(g.p.gold * 0.9); returnHome(g);
  }
}

function shoreTarget(g: Game) { const s = g.sea; if (!s) return null; return nearShore(s.boat.x, s.boat.y, 46); }

// ---------------------------------------------------------------- ilhas
function buildIsland(def: IslandDef, arriveA: number) {
  const span = islandTileSpan(def), ox = W - span - 12, oy = H - span - 12, K = ISLAND_TILES_PER_PX;
  const tiles = new Uint8Array(W * H).fill(T.WATER);
  const bi = Math.max(0, BIOME_LIST.indexOf(def.base as never));
  const biomes = new Uint8Array(W * H).fill(bi);
  const cx = ox + span / 2, cy = oy + span / 2, beach = 16 * K + 1.5;
  const land: number[] = [];
  for (let ty = oy; ty < oy + span; ty++) for (let tx = ox; tx < ox + span; tx++) {
    const dx = (tx - cx) / K, dy = (ty - cy) / K, d = Math.hypot(dx, dy), cr = coastRadius(def.r, def.seed, Math.atan2(dy, dx));
    if (d >= cr) continue;
    const i = ty * W + tx, inner = (cr - d) * K;
    if (inner < beach) { tiles[i] = T.SAND; continue; }
    const hv = hash(tx, ty, def.seed);
    tiles[i] = def.ground[Math.floor(hash(tx >> 2, ty >> 2, def.seed + 3) * def.ground.length)]!;
    const nearCenter = Math.hypot(tx - cx, ty - cy) < 7;
    if (!nearCenter && inner > beach + 2 && hv < def.obstacleDensity) tiles[i] = def.obstacles[Math.floor(hash(tx, ty, def.seed + 9) * def.obstacles.length)]!;
    if (!SOLID.has(tiles[i]!)) land.push(i);
  }
  // praia de chegada e trilha até o monólito
  let sx = cx, sy = cy;
  for (let r = 0; r < span; r += 0.5) {
    const tx = Math.round(cx + Math.cos(arriveA) * r), ty = Math.round(cy + Math.sin(arriveA) * r);
    if (tiles[ty * W + tx] === T.WATER) break;
    if (SOLID.has(tiles[ty * W + tx]!)) tiles[ty * W + tx] = T.PATH;
    else if (tiles[ty * W + tx] !== T.SAND) tiles[ty * W + tx] = r % 3 < 1 ? T.PATH : tiles[ty * W + tx]!;
    sx = tx; sy = ty;
  }
  const nodes: World["nodes"] = [];
  let nid = 900000 + ISLANDS.indexOf(def) * 1000;
  for (const r of def.resources) for (let k = 0; k < r.n && land.length; k++) {
    const i = land[Math.floor(hash(k, nid, def.seed) * land.length)]!;
    nodes.push({ id: nid++, tx: i % W, ty: Math.floor(i / W), item: r.item, respawn: 0 });
  }
  return { world: { tiles, biomes, nodes } as World, ox, oy, span, center: { x: cx * TS + 8, y: cy * TS + 8 }, spawn: { x: sx * TS + 8, y: sy * TS + 8 }, land };
}

function land(g: Game, id: string) {
  const def = islandById(id); if (!def || !g.sea) return;
  const s = g.sea, arriveA = Math.atan2(s.boat.y - def.y, s.boat.x - def.x);
  const b = buildIsland(def, arriveA);
  g.world = b.world; g.p.x = b.spawn.x; g.p.y = b.spawn.y;
  g.biome = def.base as never; g.audio.biome = def.base as never;
  const enemies: Enemy[] = [];
  const count = Math.min(40, Math.floor(b.land.length / 260));
  for (let i = 0; i < count; i++) {
    const t = b.land[Math.floor(hash(i, 77, def.seed) * b.land.length)]!, x = (t % W) * TS + 8, y = Math.floor(t / W) * TS + 8;
    if (Math.hypot(x - b.spawn.x, y - b.spawn.y) < 160) continue;
    const k = def.enemies[i % def.enemies.length]!;
    enemies.push(g.makeEnemy(k, x, y, enemyLevel(def.base as never, k) + def.tier * 3));
  }
  let bossId = -1;
  if (!done(g, `isle:${def.id}:q1`)) {
    const bx = b.center.x - Math.cos(arriveA) * (b.span * TS * 0.18), by = b.center.y - Math.sin(arriveA) * (b.span * TS * 0.18);
    const boss = g.makeEnemy(def.boss.kind, bx, by, enemyLevel(def.base as never, def.boss.kind) + def.tier * 4 + 2);
    boss.hp = boss.maxhp = boss.maxhp * def.boss.hp; boss.atk = Math.round(boss.atk * 1.5); boss.elite = true; boss.xp *= 12; boss.gold *= 10;
    enemies.push(boss); bossId = boss.id;
  }
  g.enemies = enemies;
  g.island = { def, ox: b.ox, oy: b.oy, span: b.span, bossId, seaPos: { x: s.boat.x, y: s.boat.y, a: s.boat.a + Math.PI }, center: b.center, tick: 0, parts: [] };
  g.sea = null;
  const first = !done(g, `isle:${def.id}:visited`);
  g.discoveries.add(`isle:${def.id}:visited`);
  g.biomeBanner = { name: `✦ ${def.name} · ${def.biome}`, t: 5 };
  if (first) { g.toast(`Nova ilha descoberta: ${def.name}!`, "#ffe39a"); def.quests.forEach((q) => g.toast(`Missão: ${q.title} — ${q.text}`, "#c8f0ff")); }
  g.clearTransition(); g.save();
}

function embark(g: Game) {
  const r = g.island!; g.island = null; g.world = g.overworld;
  startSea(g, r.seaPos.x, r.seaPos.y, r.seaPos.a);
  let k = 0; while (depthAt(g.sea!.boat.x, g.sea!.boat.y) === 0 && k++ < 80) { g.sea!.boat.x += Math.cos(r.seaPos.a) * 8; g.sea!.boat.y += Math.sin(r.seaPos.a) * 8; }
  g.clearTransition(); g.save();
}

function complete(g: Game, def: IslandDef, q: number) {
  const key = `isle:${def.id}:q${q}`; if (done(g, key)) return;
  g.discoveries.add(key);
  const gold = 120 * def.tier + 60 * q; g.p.gold += gold; g.gainXp(180 * def.tier + 80 * q);
  g.toast(`Missão concluída: ${def.quests[q]!.title} (+${gold} ouro)`, "#a0ffa0"); g.audio.sfx("level");
  if ([0, 1, 2].every((i) => done(g, `isle:${def.id}:q${i}`)) && def.relic && !done(g, `isle:${def.id}:relic`)) {
    g.discoveries.add(`isle:${def.id}:relic`); g.addItem(def.relic.item, def.relic.qty);
    g.biomeBanner = { name: `Relíquia da ilha: ${ITEMS[def.relic.item]!.name} ×${def.relic.qty}`, t: 5 };
  }
  g.save();
}
export const questTarget = (def: IslandDef) => Math.max(5, Math.round(def.resources[0]!.n * 0.5));

export function islandTick(g: Game, dt: number) {
  const r = g.island; if (!r) return;
  r.tick -= dt; if (r.tick > 0) return; r.tick = 0.5;
  if (g.count(r.def.resources[0]!.item) >= questTarget(r.def)) complete(g, r.def, 0);
}
export function islandOnKill(g: Game, e: Enemy) {
  const r = g.island; if (!r || e.id !== r.bossId) return;
  r.bossId = -1; const b = r.def.boss;
  g.addItem(b.drop, b.dropQty); g.shake = 8;
  g.biomeBanner = { name: `${b.name} derrotado!`, t: 4 }; g.toast(b.lore, "#f4dc91");
  complete(g, r.def, 1);
}

// ---------------------------------------------------------------- interação
export function archipelagoInteract(g: Game): boolean {
  if (g.sea) {
    const id = shoreTarget(g);
    if (id === "main") { returnHome(g); return true; }
    if (id) { land(g, id); return true; }
    g.sea.boat.anchored = !g.sea.boat.anchored; g.toast(g.sea.boat.anchored ? "Âncora lançada." : "Âncora recolhida.", "#bfe8ff"); return true;
  }
  if (g.island) {
    const r = g.island;
    if (Math.hypot(g.p.x - r.center.x, g.p.y - r.center.y) < 30) {
      g.dialog = { npc: { id: "monolith", name: r.def.name, title: `Monólito de Origem · ${r.def.biome}`, tx: 0, ty: 0, pal: { skin: "#d8d0c0", hair: "#8a8070", body: "#6a6458", legs: "#4a443c" }, lines: [] }, text: r.def.origin, choices: [{ label: "Fechar", act: () => { g.dialog = null; } }] };
      complete(g, r.def, 2); return true;
    }
    if (nearWater(g)) { embark(g); return true; }
    return false;
  }
  if (canLaunch(g)) { launch(g); return true; }
  return false;
}
export function archipelagoPrompt(g: Game): string {
  if (g.island) {
    const r = g.island;
    if (Math.hypot(g.p.x - r.center.x, g.p.y - r.center.y) < 30) return "E · Ler monólito de origem";
    if (nearWater(g)) return "E · Embarcar";
    return "";
  }
  if (canLaunch(g)) return `E · Zarpar com a ${bestBoat(owned(g))!.name}`;
  return "";
}
export function leaveArchipelago(g: Game) {
  if (!g.sea && !g.island) return;
  g.sea = null; g.island = null; g.world = g.overworld; g.enemies = g.surfaceEnemies.length ? g.surfaceEnemies : g.enemies; g.surfaceEnemies = [];
}
export const archipelagoArea = (g: Game) => (g.sea ? "Mar de Ømnia" : g.island ? `${g.island.def.name}` : null);

// ---------------------------------------------------------------- render do mar
let MAP: HTMLCanvasElement | null = null;
const MS = 8;
function hex(c: string): [number, number, number] { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function buildMap() {
  const n = SEA / MS, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const ctx = cv.getContext("2d")!, img = ctx.createImageData(n, n);
  const water: [number, number, number][] = [[0, 0, 0], [96, 214, 206], [44, 160, 200], [26, 100, 168], [12, 40, 92]];
  const pal: Record<string, { s: [number, number, number]; l: [number, number, number]; a: [number, number, number] }> = { main: { s: hex("#ead9a2"), l: hex("#5f9e48"), a: hex("#3f7a34") } };
  for (const i of ISLANDS) pal[i.id] = { s: hex(i.sand), l: hex(i.land), a: hex(i.accent) };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const wx = x * MS + 4, wy = y * MS + 4, L = landAt(wx, wy), o = (y * n + x) * 4, dn = hash(x, y, 5);
    let c: [number, number, number];
    if (L.inside) {
      const p = pal[L.id ?? "main"]!;
      c = L.coast > -22 ? p.s : dn < 0.18 ? p.a : p.l;
      const k = 0.9 + hash(x >> 1, y >> 1, 9) * 0.2; c = [c[0] * k, c[1] * k, c[2] * k];
    } else {
      const d = depthAt(wx, wy); c = water[d]!;
      const k = 0.94 + dn * 0.1; c = [c[0] * k, c[1] * k, c[2] * k];
      if (L.coast < 14) c = [230, 248, 255];
    }
    img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

function drawBoat(c: CanvasRenderingContext2D, def: BoatDef, x: number, y: number, a: number, t: number) {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
  const bob = Math.sin(t * 3) * 0.6; c.translate(0, bob);
  c.fillStyle = "rgba(0,20,40,.35)"; c.beginPath(); c.ellipse(1, 2, def.tier === 1 ? 13 : 18, def.tier === 1 ? 7 : 8, 0, 0, Math.PI * 2); c.fill();
  if (def.id === "raft") {
    c.fillStyle = "#8a5a2a"; c.fillRect(-11, -6, 22, 12);
    c.fillStyle = "#b07a40"; for (let i = -10; i < 11; i += 4) c.fillRect(i, -6, 3, 12);
    c.fillStyle = "#d8c08a"; c.fillRect(-11, -1, 22, 2);
    c.fillStyle = "#6a4020"; c.fillRect(2, -1, 2, 2);
  } else {
    const hullC = def.id === "caravel" ? "#8a4a22" : "#3a3646", trim = def.id === "caravel" ? "#d8a860" : "#c8b0ff";
    c.fillStyle = hullC; c.beginPath(); c.moveTo(18, 0); c.lineTo(8, -7); c.lineTo(-14, -7); c.lineTo(-16, 0); c.lineTo(-14, 7); c.lineTo(8, 7); c.closePath(); c.fill();
    c.fillStyle = trim; c.fillRect(-14, -7, 22, 1); c.fillRect(-14, 6, 22, 1);
    c.fillStyle = "#5a3a1a"; c.fillRect(-2, -1, 3, 3); c.fillRect(-10, -1, 2, 2);
    const sail = def.id === "caravel" ? "#f2ecd8" : "#2a2438", sw = Math.sin(t * 2) * 1.5;
    c.fillStyle = sail; c.beginPath(); c.moveTo(0, -11 - sw); c.quadraticCurveTo(6, 0, 0, 11 + sw); c.lineTo(-2, 11); c.lineTo(-2, -11); c.closePath(); c.fill();
    if (def.id === "carrack") { c.fillStyle = "#c8b0ff"; c.fillRect(1, -1, 2, 2); }
    else { c.fillStyle = "#c04030"; c.fillRect(1, -2, 2, 4); }
  }
  c.restore();
}

export function renderSea(g: Game) {
  const s = g.sea!, c = g.ctx, vw = g.viewWidth, vh = g.viewHeight, t = s.t;
  if (!MAP) MAP = buildMap();
  const cx = Math.round(Math.max(0, Math.min(SEA - vw, s.boat.x - vw / 2))), cy = Math.round(Math.max(0, Math.min(SEA - vh, s.boat.y - vh / 2)));
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  c.drawImage(MAP, cx / MS, cy / MS, vw / MS + 1, vh / MS + 1, -(cx % MS), -(cy % MS), (Math.floor(vw / MS) + 1) * MS + MS, (Math.floor(vh / MS) + 1) * MS + MS);
  c.translate(-cx, -cy);
  // ondas em 3 profundidades
  const G = 24;
  for (let gy = Math.floor(cy / G) * G; gy < cy + vh + G; gy += G) for (let gx = Math.floor(cx / G) * G; gx < cx + vw + G; gx += G) {
    const d = depthAt(gx, gy); if (d === 0) continue;
    const hv = hash(gx, gy, 3), ph = t * (d === 1 ? 2.4 : d === 2 ? 1.6 : 1) + hv * 6.28;
    const ox = gx + hv * 16 + Math.sin(ph) * 3, oy = gy + hash(gy, gx, 4) * 16;
    if (d === 1) { if (Math.sin(ph * 1.7) > 0.6) { c.fillStyle = "rgba(255,255,255,.85)"; c.fillRect(ox, oy, 2, 1); c.fillRect(ox + 3, oy + 1, 1, 1); } }
    else if (d === 2) { c.fillStyle = `rgba(200,240,255,${0.35 + Math.sin(ph) * 0.25})`; c.fillRect(ox, oy, 5, 1); c.fillRect(ox + 1, oy - 1, 3, 1); }
    else { c.fillStyle = d === 4 ? `rgba(120,90,200,${0.25 + Math.sin(ph) * 0.15})` : `rgba(90,150,220,${0.3 + Math.sin(ph) * 0.2})`; c.fillRect(ox - 4, oy, 11, 1); c.fillRect(ox - 2, oy - 1, 7, 1); if (d === 4 && hv > 0.8) { c.fillStyle = "rgba(200,170,255,.6)"; c.fillRect(ox, oy + 3, 1, 1); } }
  }
  // correntes
  for (const cu of CURRENTS) {
    if (cu.x + cu.r < cx || cu.x - cu.r > cx + vw || cu.y + cu.r < cy || cu.y - cu.r > cy + vh) continue;
    const len = Math.hypot(cu.vx, cu.vy), ux = cu.vx / len, uy = cu.vy / len;
    c.fillStyle = "rgba(220,250,255,.35)";
    for (let i = 0; i < 40; i++) {
      const ang = hash(i, cu.x, 1) * 6.28, rr = Math.sqrt(hash(i, cu.y, 2)) * cu.r, ph = ((t * len * 0.8 + i * 37) % (cu.r * 2)) - cu.r;
      const px = cu.x + Math.cos(ang) * rr * 0.6 + ux * ph, py = cu.y + Math.sin(ang) * rr * 0.6 + uy * ph;
      if (Math.hypot(px - cu.x, py - cu.y) < cu.r) c.fillRect(px, py, ux ? 6 : 1, uy ? 6 : 1);
    }
  }
  // espuma da costa
  for (const isl of [{ x: MAIN.x, y: MAIN.y, r: MAIN.r, seed: MAIN_SEED }, ...ISLANDS]) {
    if (isl.x + isl.r * 1.4 < cx || isl.x - isl.r * 1.4 > cx + vw || isl.y + isl.r * 1.4 < cy || isl.y - isl.r * 1.4 > cy + vh) continue;
    c.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 160; i++) {
      const a = (i / 160) * Math.PI * 2, rr = coastRadius(isl.r, isl.seed, a) + 6 + Math.sin(t * 2 + i) * 4;
      c.fillRect(isl.x + Math.cos(a) * rr, isl.y + Math.sin(a) * rr, 2, 1);
    }
  }
  // rochas
  for (const r of ROCKS) {
    if (r.x < cx - 30 || r.x > cx + vw + 30 || r.y < cy - 30 || r.y > cy + vh + 30) continue;
    c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.arc(r.x, r.y + 2, r.r + 3 + Math.sin(t * 3 + r.x) * 1.5, 0, 6.28); c.fill();
    c.fillStyle = "#4a4e58"; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 6.28); c.fill();
    c.fillStyle = "#7a808c"; c.beginPath(); c.arc(r.x - r.r * 0.3, r.y - r.r * 0.3, r.r * 0.5, 0, 6.28); c.fill();
  }
  // nomes das ilhas
  c.font = "8px monospace"; c.textAlign = "center";
  for (const i of ISLANDS) {
    if (Math.hypot(i.x - s.boat.x, i.y - s.boat.y) > i.r + 320) continue;
    const lock = i.tier > s.def.tier;
    c.fillStyle = "rgba(10,20,30,.6)"; const label = `${i.name}${lock ? ` · requer ${["", "Jangada", "Caravela", "Carraca"][i.tier]}` : ""}`;
    const w = c.measureText(label).width + 8; c.fillRect(i.x - w / 2, i.y - i.r - 26, w, 11);
    c.fillStyle = lock ? "#ffb0a0" : "#ffe9a0"; c.fillText(label, i.x, i.y - i.r - 18);
  }
  // rastro e barco
  for (const w of s.wake) { c.fillStyle = `rgba(255,255,255,${w.life * 0.4})`; c.fillRect(w.x - 1, w.y - 1, 3, 2); }
  drawBoat(c, s.def, s.boat.x, s.boat.y, s.boat.a, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  // HUD
  const wd = windAt(t), d = depthAt(s.boat.x, s.boat.y);
  c.fillStyle = "rgba(10,24,36,.75)"; c.fillRect(6, vh - 52, 150, 46); c.strokeStyle = "#bfa87b"; c.strokeRect(6.5, vh - 51.5, 149, 45);
  c.fillStyle = "#f1e5c4"; c.textAlign = "left"; c.font = "8px monospace";
  c.fillText(`${s.def.name}`, 12, vh - 41);
  c.fillText(`${DEPTH_NAMES[d]} · ${Math.round(Math.hypot(s.boat.vx, s.boat.vy))} nós`, 12, vh - 31);
  c.fillStyle = "#3a1a1a"; c.fillRect(12, vh - 25, 80, 5); c.fillStyle = "#e06060"; c.fillRect(12, vh - 25, 80 * (s.boat.hull / s.def.hull), 5);
  c.fillStyle = "#c8d8e8"; c.fillText(s.def.wind ? "vento" : "remo", 12, vh - 12);
  c.save(); c.translate(130, vh - 29); c.rotate(wd.a); c.fillStyle = "#bfe8ff"; c.fillRect(-10 * wd.s, -1, 20 * wd.s, 2); c.beginPath(); c.moveTo(12, 0); c.lineTo(6, -4); c.lineTo(6, 4); c.fill(); c.restore();
  // mini-mapa
  const mm = 70, mx = vw - mm - 8, my = 8; c.globalAlpha = 0.9; c.drawImage(MAP, mx, my, mm, mm); c.globalAlpha = 1;
  c.strokeStyle = "#bfa87b"; c.strokeRect(mx - 0.5, my - 0.5, mm + 1, mm + 1);
  c.fillStyle = Math.floor(t * 4) % 2 ? "#fff" : "#ff4040"; c.fillRect(mx + (s.boat.x / SEA) * mm - 1, my + (s.boat.y / SEA) * mm - 1, 3, 3);
  // prompt
  const id = shoreTarget(g); let text = "";
  if (id === "main") text = "E · Atracar na Ilha de Potos";
  else if (id) text = `E · Ancorar em ${islandById(id)?.name}`;
  else text = s.boat.anchored ? "E · Recolher âncora" : "W/S vela · A/D leme · E âncora";
  c.font = "8px monospace"; c.textAlign = "center"; const w = c.measureText(text).width + 18;
  c.fillStyle = "#152d2f"; c.fillRect(vw / 2 - w / 2, vh - 46, w, 16); c.strokeStyle = "#bfa87b"; c.strokeRect(vw / 2 - w / 2, vh - 46, w, 16);
  c.fillStyle = "#f1e5c4"; c.fillText(text, vw / 2, vh - 35);
  if (g.transition > 0) { c.fillStyle = `rgba(0,0,0,${Math.min(1, g.transition * 1.6)})`; c.fillRect(0, 0, vw, vh); }
}

// ---------------------------------------------------------------- render das ilhas
export function drawIslandProps(g: Game, c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, wt: number) {
  const r = g.island!; const def = r.def;
  for (const n of g.world.nodes) {
    if (n.respawn > 0 || n.tx < x0 - 1 || n.tx > x1 || n.ty < y0 - 1 || n.ty > y1) continue;
    const x = n.tx * TS + 8, y = n.ty * TS + 14, col = ITEMS[n.item]?.color ?? "#fff", pulse = 0.6 + Math.sin(wt * 3 + n.id) * 0.4;
    c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x - 5, y - 1, 10, 2);
    c.fillStyle = col; c.fillRect(x - 2, y - 10, 4, 10); c.fillRect(x - 5, y - 6, 3, 6); c.fillRect(x + 2, y - 7, 3, 7);
    c.fillStyle = `rgba(255,255,255,${pulse})`; c.fillRect(x - 1, y - 9, 1, 3); c.fillRect(x + 3, y - 6, 1, 2);
  }
  // monólito de origem
  const mx = r.center.x, my = r.center.y;
  c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(mx - 9, my + 4, 18, 4);
  c.fillStyle = "#6a6458"; c.fillRect(mx - 6, my - 26, 12, 32); c.fillStyle = "#8a8474"; c.fillRect(mx - 6, my - 26, 4, 32); c.fillRect(mx - 4, my - 30, 8, 4);
  const read = g.discoveries.has(`isle:${def.id}:q2`);
  c.fillStyle = read ? def.accent : `rgba(255,255,255,${0.4 + Math.sin(wt * 4) * 0.4})`;
  for (let i = 0; i < 5; i++) c.fillRect(mx - 2 + (i % 2) * 2, my - 22 + i * 5, 2, 3);
  c.fillStyle = def.accent; c.globalAlpha = 0.25 + Math.sin(wt * 2) * 0.1; c.beginPath(); c.arc(mx, my - 10, 18, 0, 6.28); c.fill(); c.globalAlpha = 1;
}
export function drawIslandAtmosphere(g: Game, c: CanvasRenderingContext2D) {
  const r = g.island!, def = r.def, vw = g.viewWidth, vh = g.viewHeight, dt = g.lastDelta;
  const [R, Gc, B, A] = def.grade;
  c.fillStyle = `rgba(${R},${Gc},${B},${A})`; c.fillRect(0, 0, vw, vh);
  const wth = def.weather;
  while (r.parts.length < wth.n) r.parts.push({ x: Math.random() * vw, y: Math.random() * vh, s: Math.random() });
  c.fillStyle = wth.color;
  for (const p of r.parts) {
    if (wth.mode === "fall") { p.y += (14 + p.s * 26) * dt; p.x += Math.sin(g.clock * 1.3 + p.s * 9) * 0.4; }
    else if (wth.mode === "rise") { p.y -= (10 + p.s * 22) * dt; p.x += Math.sin(g.clock + p.s * 7) * 0.3; }
    else { p.x += Math.sin(g.clock * 0.7 + p.s * 13) * 0.5; p.y += Math.cos(g.clock * 0.6 + p.s * 11) * 0.4; }
    if (p.y > vh) p.y = 0; if (p.y < 0) p.y = vh; if (p.x > vw) p.x = 0; if (p.x < 0) p.x = vw;
    if (wth.glow) { c.globalAlpha = 0.25; c.fillRect(p.x - 1, p.y - 1, 3, 3); c.globalAlpha = 0.6 + Math.sin(g.clock * 4 + p.s * 20) * 0.4; }
    c.fillRect(p.x, p.y, p.s > 0.6 ? 2 : 1, p.s > 0.6 ? 2 : 1); c.globalAlpha = 1;
  }
}
