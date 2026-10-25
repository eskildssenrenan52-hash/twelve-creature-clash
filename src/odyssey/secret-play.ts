// Liga os Segredos do Cântico Oculto e os Reinos Ocultos ao motor: runas, pistas, enigmas e portais.
import type { Game } from './engine';
import { ITEMS, BIOME_NAMES, type NpcDef } from './data';
import { TEMPLES, type Temple } from './depths';
import { generateFloor, type DungeonFloor } from './dungeon';
import { TS, W, H, solidAt, type World } from './world';
import {
  SECRETS, REALMS, HEART_REALM, ALL_REALMS, stepKey, stepOf, chainDone, circleDone, realmOpen, clueFor,
  type SecretChain, type SecretStep, type RealmDef,
} from './secrets';

const SAGE: NpcDef = { id: 'secret_rune', name: 'Runa Oculta', title: 'Cântico Oculto', tx: 0, ty: 0, pal: { skin: '#d8e8ff', hair: '#7a8aff', body: '#3a3a7a', legs: '#1a1a3a', accent: '#c0d0ff' }, lines: [] };
const anchorName = (i: number) => BIOME_NAMES[TEMPLES[i % TEMPLES.length]!.biome];
const itemName = (id: string) => ITEMS[id]?.name ?? id;
export const secretClue = (s: SecretStep) => clueFor(s, anchorName, itemName);

/* ───────────── Posições (resolvidas uma vez, longe de paredes e templos) ───────────── */
const posCache = new Map<string, { tx: number; ty: number }>();
function resolve(world: World, anchor: number, dx: number, dy: number) {
  const key = `${anchor},${dx},${dy}`, hit = posCache.get(key); if (hit) return hit;
  const t = TEMPLES[anchor % TEMPLES.length]!;
  const bx = Math.max(4, Math.min(W - 5, t.tx + dx)), by = Math.max(4, Math.min(H - 5, t.ty + dy));
  const ok = (x: number, y: number) => x > 2 && y > 2 && x < W - 3 && y < H - 3 && !solidAt(world, x * TS + 8, y * TS + 8)
    && !TEMPLES.some((q) => Math.abs(q.tx - x) < 7 && Math.abs(q.ty - y) < 8);
  let out = { tx: bx, ty: by };
  search: for (let r = 0; r < 18; r++) for (let k = -r; k <= r; k++) for (const [x, y] of [[bx + k, by - r], [bx + k, by + r], [bx - r, by + k], [bx + r, by + k]] as const)
    if (ok(x, y)) { out = { tx: x, ty: y }; break search; }
  posCache.set(key, out); return out;
}
const heartPos = (world: World) => { const k = 'heart'; const hit = posCache.get(k); if (hit) return hit; const p = resolve(world, 0, 0, 0); void p; const o = (() => { for (let r = 0; r < 20; r++) for (let x = 128 - r; x <= 128 + r; x++) for (const y of [118 - r, 118 + r]) if (!solidAt(world, x * TS + 8, y * TS + 8)) return { tx: x, ty: y }; return { tx: 128, ty: 118 }; })(); posCache.set(k, o); return o; };
export const realmPortalPos = (world: World, r: RealmDef) => r === HEART_REALM ? heartPos(world) : resolve(world, r.anchor, r.dx, r.dy);

/* ───────────── Etapas ativas (recalculadas só quando o progresso muda) ───────────── */
interface Active { chain: SecretChain; step: number; tx: number; ty: number; floor?: number | undefined }
let activeCache: { size: number; list: Active[] } | null = null;
function actives(g: Game): Active[] {
  if (activeCache && activeCache.size === g.discoveries.size) return activeCache.list;
  const has = (k: string) => g.discoveries.has(k), list: Active[] = [];
  for (const c of SECRETS) {
    const s = stepOf(c, has); if (s >= c.steps.length) continue;
    const st = c.steps[s]!;
    if (st.kind === 'depth') list.push({ chain: c, step: s, tx: 0, ty: 0, floor: st.floor });
    else { const p = resolve(g.overworld, st.anchor!, st.dx!, st.dy!); list.push({ chain: c, step: s, ...p }); }
  }
  activeCache = { size: g.discoveries.size, list }; return list;
}
const depthRune = (d: DungeonFloor) => { const r = d.rooms[Math.min(1, d.rooms.length - 1)]!; return { tx: r.x + Math.floor(r.w / 2), ty: r.y + Math.floor(r.h / 2) + 1 }; };
const near = (g: Game, tx: number, ty: number, r = 20) => Math.hypot(g.p.x - tx * TS - 8, g.p.y - ty * TS - 8) < r;
const isNight = (g: Game) => g.time < 0.22 || g.time > 0.8;
const isDay = (g: Game) => g.time >= 0.375 && g.time <= 0.67;

export function secretStats(g: Game) {
  const has = (k: string) => g.discoveries.has(k);
  const done = SECRETS.filter((c) => chainDone(c, has)).length;
  const realms = ALL_REALMS.filter((r) => g.openedChests.has(`realm_${r.id}-relic`)).length;
  return { done, total: SECRETS.length, realms, totalRealms: ALL_REALMS.length };
}

function advance(g: Game, a: Active) {
  const c = a.chain; g.discoveries.add(stepKey(c, a.step)); activeCache = null;
  g.audio.sfx('level'); g.burst(g.p.x, g.p.y - 12, '#b0c0ff', 26, 60, 2, -30);
  const nextIdx = a.step + 1;
  if (nextIdx >= c.steps.length) {
    g.p.gold += c.reward.gold; g.gainXp(c.reward.xp); g.addItem(c.reward.item, c.reward.qty);
    const r = REALMS[c.circle]!, n = circleDone(c.circle, (k) => g.discoveries.has(k));
    let text = `✦ Segredo desvendado: ${c.name}.\n${c.lore}\n\n+${c.reward.gold} ouro · +${c.reward.xp} XP · ${c.reward.qty}× ${itemName(c.reward.item)}\n\nCírculo do ${r.name}: ${n}/${r.need} para abrir o portal.`;
    if (n === r.need) text += `\n\n🌀 O ${r.name} despertou! ${secretClue({ kind: 'touch', anchor: r.anchor, dx: r.dx, dy: r.dy }).split('.')[0]}.`;
    g.dialog = { npc: SAGE, text, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
    g.toast(`✦ ${c.name} (${secretStats(g).done}/${SECRETS.length})`, '#c0d0ff');
  } else {
    const next = c.steps[nextIdx]!;
    g.dialog = { npc: SAGE, text: `${c.name} · etapa ${nextIdx}/${c.steps.length} concluída.\n\nPróxima pista: ${secretClue(next)}`, choices: [{ label: 'Guardar a pista', act: () => { g.dialog = null; } }] };
  }
  g.save();
}

function tryStep(g: Game, a: Active) {
  const st = a.chain.steps[a.step]!, close = () => { g.dialog = null; };
  if (st.kind === 'night' && !isNight(g)) { g.toast('A runa dorme. Volte quando for noite.', '#9ab8ff'); return; }
  if (st.kind === 'day' && !isDay(g)) { g.toast('A runa só acorda sob o sol alto.', '#ffe080'); return; }
  if (st.kind === 'rain' && !g.raining) { g.toast('A runa está seca. Ela espera a chuva.', '#80c0ff'); return; }
  if (st.kind === 'offer') {
    if (g.count(st.item!) < st.qty!) { g.toast(`A runa pede ${st.qty}× ${itemName(st.item!)}.`, '#ffb070'); return; }
    g.removeItem(st.item!, st.qty!);
  }
  if (st.kind === 'riddle' && st.riddle) {
    const rd = st.riddle;
    g.dialog = { npc: SAGE, text: `${a.chain.name}\n\n“${rd.q}”`, choices: [
      ...rd.options.map((o, i) => ({ label: o, act: () => { close(); if (i === rd.correct) advance(g, a); else { g.toast('A voz se cala. Resposta errada.', '#ff8080'); g.audio.sfx('ui'); } } })),
      { label: 'Ainda não sei', act: close },
    ] };
    return;
  }
  advance(g, a);
}

function cluesDialog(g: Game) {
  const list = actives(g).filter((a) => a.step > 0).slice(0, 6);
  const s = secretStats(g);
  const text = list.length
    ? `Segredos: ${s.done}/${s.total} · Reinos: ${s.realms}/${s.totalRealms}\n\n` + list.map((a) => `• ${a.chain.name}: ${secretClue(a.chain.steps[a.step]!)}`).join('\n')
    : `Segredos: ${s.done}/${s.total} · Reinos: ${s.realms}/${s.totalRealms}\n\nNenhuma pista em andamento. Procure runas que cintilam quando você chega perto.`;
  g.dialog = { npc: SAGE, text, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
}

/* ───────────── Reinos Ocultos ───────────── */
const realmTemples = new Map<string, Temple>();
function realmTemple(r: RealmDef): Temple {
  let t = realmTemples.get(r.id);
  if (!t) { t = { id: `realm_${r.id}`, biome: r.biome, name: r.name, family: 'crystal', hue: 0, stair: 'moon', tx: 0, ty: 0, level: r.level, lore: r.lore }; realmTemples.set(r.id, t); }
  return t;
}
export const isRealm = (t?: Temple) => !!t && t.id.startsWith('realm_');
export function realmFloor(r: RealmDef): DungeonFloor {
  const i = ALL_REALMS.indexOf(r);
  return generateFloor(Math.min(99, 20 + i * 6), {
    theme: { name: r.name, floor: r.floor, wall: r.wall, deco: r.deco, biome: r.biome, enemies: [...r.enemies], color: r.color, lore: r.lore },
    seed: 77003 + i * 31337, size: { w: 84 + (i % 4) * 8, h: 64 + (i % 3) * 6 }, level: r.level, idPrefix: `realm_${r.id}`, eliteBonus: 0.12,
  });
}
export const realmDefOf = (t?: Temple) => ALL_REALMS.find((r) => t && `realm_${r.id}` === t.id);
export { realmTemple };

/* ───────────── Interação ───────────── */
/** Superfície: runas ativas, portais dos Reinos e o Coração. */
export function secretSurfaceAction(g: Game, run: boolean, enterRealm: (r: RealmDef) => void): string {
  const has = (k: string) => g.discoveries.has(k), relic = (id: string) => g.openedChests.has(id);
  for (const r of ALL_REALMS) {
    if (!realmOpen(r, has, relic)) continue;
    const p = realmPortalPos(g.overworld, r);
    if (near(g, p.tx, p.ty, 22)) { if (run) enterRealm(r); return `E · Portal do ${r.name} (Nv ${r.level}+)`; }
  }
  for (const a of actives(g)) {
    if (a.floor !== undefined || !near(g, a.tx, a.ty)) continue;
    if (run) {
      if (a.step > 0) tryStep(g, a);
      else g.dialog = { npc: SAGE, text: `Uma runa antiga pulsa sob seus pés: “${a.chain.name}”. ${secretClue(a.chain.steps[0]!).split('. ').slice(1).join('. ') || 'Ela espera ser tocada.'}`, choices: [
        { label: 'Tocar a runa', act: () => { g.dialog = null; tryStep(g, a); } },
        { label: 'Relembrar pistas', act: () => cluesDialog(g) },
        { label: 'Deixar quieta', act: () => { g.dialog = null; } },
      ] };
    }
    return `E · Runa: ${a.chain.name}`;
  }
  return '';
}
/** Profundezas: runas que só existem em certos andares do Abismo. */
export function secretDepthAction(g: Game, run: boolean): string {
  const d = g.depth; if (!d || d.kind !== 'abyss') return '';
  const pos = depthRune(d.data);
  if (!near(g, pos.tx, pos.ty)) return '';
  const here = actives(g).filter((a) => a.floor === d.floor);
  if (!here.length) return '';
  if (run) tryStep(g, here[0]!);
  return `E · Runa do andar ${d.floor}: ${here[0]!.chain.name}${here.length > 1 ? ` (+${here.length - 1})` : ''}`;
}

/* ───────────── Desenho ───────────── */
function rune(c: CanvasRenderingContext2D, tx: number, ty: number, col: string, wt: number, alpha: number, big = false) {
  const x = tx * TS + 8, y = ty * TS + 10, pulse = Math.sin(wt * 3 + tx) * 0.5 + 0.5, r = big ? 12 : 6;
  c.save(); c.globalAlpha = alpha * (0.45 + pulse * 0.4); c.strokeStyle = col; c.lineWidth = 1;
  c.beginPath(); c.ellipse(x, y, r + pulse, (r + pulse) * 0.5, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = col; c.globalAlpha = alpha * 0.25; c.beginPath(); c.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = alpha; c.fillRect(x - 1, y - 6 - pulse * 3, 2, 4); c.fillRect(x - 3, y - 4 - pulse * 3, 6, 1);
  if (big) { for (let i = 0; i < 6; i++) { const a = wt * 1.5 + i * 1.047; c.fillRect(Math.round(x + Math.cos(a) * 14), Math.round(y - 10 + Math.sin(a) * 6), 2, 2); } }
  c.restore();
}
export function drawSecrets(g: Game, c: CanvasRenderingContext2D, draws: { y: number; f: () => void }[], x0: number, y0: number, x1: number, y1: number, wt: number) {
  const vis = (tx: number, ty: number) => tx >= x0 - 2 && tx <= x1 + 2 && ty >= y0 - 2 && ty <= y1 + 3;
  if (g.depth) {
    if (g.depth.kind !== 'abyss') return;
    const f = g.depth.floor; if (!actives(g).some((a) => a.floor === f)) return;
    const p = depthRune(g.depth.data); if (vis(p.tx, p.ty)) draws.push({ y: p.ty * TS + 4, f: () => rune(c, p.tx, p.ty, '#c0d0ff', wt, 1) });
    return;
  }
  const has = (k: string) => g.discoveries.has(k), relic = (id: string) => g.openedChests.has(id);
  for (const r of ALL_REALMS) {
    const p = realmPortalPos(g.overworld, r);
    if (vis(p.tx, p.ty) && realmOpen(r, has, relic)) draws.push({ y: p.ty * TS + 6, f: () => rune(c, p.tx, p.ty, r.color, wt, 1, true) });
  }
  for (const a of actives(g)) {
    if (a.floor !== undefined || !vis(a.tx, a.ty)) continue;
    // A primeira runa de cada segredo só cintila quando você chega perto.
    const alpha = a.step > 0 ? 1 : Math.max(0, 1 - Math.hypot(g.p.x - a.tx * TS, g.p.y - a.ty * TS) / (TS * 6));
    if (alpha > 0.05) draws.push({ y: a.ty * TS + 4, f: () => rune(c, a.tx, a.ty, REALMS[a.chain.circle]!.color, wt, alpha) });
  }
}
export function secretLights(g: Game, hole: (x: number, y: number, r: number, a?: number) => void) {
  if (g.depth) { if (g.depth.kind === 'abyss' && actives(g).some((a) => a.floor === g.depth!.floor)) { const p = depthRune(g.depth.data); hole(p.tx * TS + 8, p.ty * TS + 8, 30, 0.8); } return; }
  const has = (k: string) => g.discoveries.has(k), relic = (id: string) => g.openedChests.has(id);
  for (const r of ALL_REALMS) if (realmOpen(r, has, relic)) { const p = realmPortalPos(g.overworld, r); hole(p.tx * TS + 8, p.ty * TS + 8, 44, 0.9); }
}
/** Posição na superfície de uma etapa (usado pelos testes e pela lista de pistas). */
export const secretSitePos = (g: Game, s: SecretStep) => resolve(g.overworld, s.anchor!, s.dx!, s.dy!);
