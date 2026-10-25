// Liga a Saga dos Oito Céus ao motor: Oráculo e portais em Potos, zonas dos reinos,
// chefes de zona, capítulos de história, histórias paralelas, luzes e desenho.
import type { Game } from './engine';
import { ITEMS, type NpcDef, type BossDef, type EnemyKind } from './data';
import { generateFloor, type DungeonFloor } from './dungeon';
import { drawStairs, type Temple } from './depths';
import { drawChar } from './gfx';
import { TS, W, H, solidAt, type World } from './world';
import { enterDepthState } from './depthplay';
import { softGlow } from './perf';
import {
  SAGA_REALMS, SIDE_STORIES, sagaBossId, zoneLevel, bossStats, realmUnlocked, zoneUnlocked, realmDone,
  sideKey, sideChoiceKey, sideStepOf, sideDone, sidesOf, type SagaRealm, type SagaZone, type SideStory,
} from './saga';
import type { Beat } from './story';
import './saga-extra';
import { drawSagaScenery, drawSagaWeather, sagaSceneLights } from './saga-fx';

/* ───────────── Itens lendários de cada reino ───────────── */
for (const [i, r] of SAGA_REALMS.entries()) {
  const k = i + 1, rw = r.reward;
  ITEMS[rw.item] ??= rw.slot === 'weapon'
    ? { id: rw.item, name: rw.name, type: 'weapon', weapon: 'spear', atk: 160, bonus: { str: 40, int: 40, dex: 30, vit: 30, hp: 900, mp: 400 }, desc: rw.desc, color: r.color, price: 99999 }
    : { id: rw.item, name: rw.name, type: rw.slot, ...(rw.slot === 'armor' ? { def: 20 + k * 9 } : {}), bonus: { str: 5 + k * 4, int: 5 + k * 4, vit: 4 + k * 3, dex: 3 + k * 3, hp: 120 + k * 90, mp: 60 + k * 40 }, desc: rw.desc, color: r.color, price: 5000 * k };
}

/** Aparência dos chefes de saga (lida pelo motor ao desenhar chefes). */
export const SAGA_BOSS_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> = Object.fromEntries(
  SAGA_REALMS.flatMap((r) => r.zones.map((zn, i) => [sagaBossId(r, i), { kind: zn.boss.kind, tint: zn.boss.tint, scale: zn.boss.scale }])),
);

const done = (g: Game) => (id: string) => g.bossesDone.has(id);
const has = (g: Game) => (k: string) => g.discoveries.has(k);

/* ───────────── Oráculo e Círculo dos Oito Portais ───────────── */
export const ORACLE: NpcDef = { id: 'saga_oracle', name: 'Oráculo Seraphine', title: 'Voz dos Oito Céus', tx: 0, ty: 0, pal: { skin: '#f0d8c8', hair: '#e0e0ff', body: '#6040a0', legs: '#302050', accent: '#c0a0ff' }, lines: [] };
let plaza: { oracle: { tx: number; ty: number }; portals: { tx: number; ty: number }[] } | null = null;
function walk(world: World, x: number, y: number) { return x > 3 && y > 3 && x < W - 4 && y < H - 4 && !solidAt(world, x * TS + 8, y * TS + 8); }
function nearestFree(world: World, bx: number, by: number) {
  for (let r = 0; r < 14; r++) for (let k = -r; k <= r; k++) for (const [x, y] of [[bx + k, by - r], [bx + k, by + r], [bx - r, by + k], [bx + r, by + k]] as const) if (walk(world, x, y)) return { tx: x, ty: y };
  return { tx: bx, ty: by };
}
export function sagaPlaza(world: World) {
  if (plaza) return plaza;
  const o = nearestFree(world, 104, 140);
  const portals = SAGA_REALMS.map((_, i) => { const a = (i / SAGA_REALMS.length) * Math.PI * 2 - Math.PI / 2; return nearestFree(world, Math.round(o.tx + Math.cos(a) * 7), Math.round(o.ty + Math.sin(a) * 5)); });
  plaza = { oracle: o, portals }; return plaza;
}

/* ───────────── Estado da zona atual ───────────── */
interface SagaPos { realm: SagaRealm; ri: number; zi: number; zone: SagaZone }
const zoneTemples = new Map<string, Temple>();
function zoneTemple(r: SagaRealm, i: number): Temple {
  const id = `saga_${r.id}_${i}`; let t = zoneTemples.get(id);
  if (!t) { const zn = r.zones[i]!; t = { id, biome: zn.biome, name: zn.name, family: 'marble', hue: 0, stair: 'spiral', tx: 0, ty: 0, level: zoneLevel(r, i), lore: zn.lore }; zoneTemples.set(id, t); }
  return t;
}
export function sagaPosOf(g: Game): SagaPos | null {
  const id = g.depth?.temple?.id; if (!id || !id.startsWith('saga_')) return null;
  const parts = id.split('_'), ri = SAGA_REALMS.findIndex((r) => r.id === parts[1]), zi = Number(parts[2]);
  const realm = SAGA_REALMS[ri]; if (!realm) return null;
  return { realm, ri, zi, zone: realm.zones[zi]! };
}
export const isSaga = (t?: Temple) => !!t && t.id.startsWith('saga_');
const floorCache = new Map<string, DungeonFloor>();
function zoneFloor(r: SagaRealm, ri: number, i: number): DungeonFloor {
  const key = `${r.id}_${i}`; const hit = floorCache.get(key); if (hit) return hit;
  const zn = r.zones[i]!, last = i === r.zones.length - 1, lvl = zoneLevel(r, i);
  const f = generateFloor(Math.min(99, 10 + ri * 11 + i * 2), {
    theme: { name: zn.name, floor: zn.floor, wall: zn.wall, deco: zn.deco, biome: zn.biome, enemies: [...zn.enemies], color: zn.color, lore: zn.lore },
    seed: 910_001 + ri * 104_729 + i * 7_919, size: { w: (last ? 104 : 88) + (i % 3) * 8, h: (last ? 78 : 64) + (i % 2) * 6 }, level: lvl, idPrefix: `saga_${r.id}_${i}`, eliteBonus: 0.06 + ri * 0.015,
  });
  // Mais luz nas zonas abertas: tochas extras nas salas.
  for (const room of f.rooms) if (room.w > 8) f.torches.push({ tx: room.x + Math.floor(room.w / 2), ty: room.y - 1 });
  floorCache.set(key, f); return f;
}

/* ───────────── Cenas ───────────── */
function play(g: Game, beat: Beat) {
  if (g.seenBeats.has(beat.id) || g.beatQueue.some((b) => b.id === beat.id)) return;
  g.beatQueue.push(beat); if (!g.cutscene) g.nextBeat();
}
export const sagaBeats = (): Beat[] => SAGA_REALMS.flatMap((r) => [
  { id: `saga_pro_${r.id}`, trigger: 'saga', title: `${r.subtitle}`, lines: r.prologue },
  ...r.zones.map((zn, i) => ({ id: `saga_win_${r.id}_${i}`, trigger: 'saga', title: `${r.name} · ${zn.name}`, lines: zn.boss.victory })),
  { id: `saga_epi_${r.id}`, trigger: 'saga', title: `${r.name} · Epílogo`, lines: r.epilogue },
]);

/* ───────────── Entrar nas zonas ───────────── */
export function enterSagaZone(g: Game, ri: number, zi: number) {
  const r = SAGA_REALMS[ri]!, zn = r.zones[zi]!, data = zoneFloor(r, ri, zi);
  enterDepthState(g, { kind: 'temple', floor: zi + 1, temple: zoneTemple(r, zi), data, stair: 'spiral' }, 1.15 + ri * 0.04);
  const id = sagaBossId(r, zi);
  if (!g.bossesDone.has(id)) {
    const st = bossStats(r, zi), end = data.stairs;
    const def: BossDef = { id, name: zn.boss.name, biome: zn.biome, tx: end.tx, ty: end.ty - 2, hp: st.hp, atk: st.atk, xp: st.xp, gold: st.gold, color: zn.boss.tint, minion: zn.enemies[0]!, reward: ['elixir', 'hi_potion', 'eco_shard'] };
    const e = g.makeEnemy(zn.boss.kind, def.tx * TS + 8, def.ty * TS + 8, 1);
    e.hp = e.maxhp = def.hp; e.atk = def.atk; e.def = 8 + Math.floor(st.level / 3); e.xp = def.xp; e.gold = def.gold; e.speed = 32; e.level = st.level;
    e.boss = { def, active: false, phase: 1, patT: 2, charge: 0, cvx: 0, cvy: 0 };
    g.enemies.push(e);
  }
  g.discoveries.add(`saga:${r.id}:${zi}`);
  g.biomeBanner = { name: `✦ ${r.name} · ${zn.name} · Nv ${zoneLevel(r, zi)}+`, t: 5 };
  g.toast(zn.lore, zn.color);
  if (zi === 0) play(g, { id: `saga_pro_${r.id}`, trigger: 'saga', title: r.subtitle, lines: r.prologue });
  if (!g.bossesDone.has(id)) g.toast(`⚔ ${zn.boss.name}: ${zn.boss.intro}`, '#ff9080');
  g.save();
}

/** Chamado pelo motor quando um chefe cai. */
export function sagaOnBoss(g: Game, id: string) {
  for (const [ri, r] of SAGA_REALMS.entries()) for (const [i, zn] of r.zones.entries()) {
    if (sagaBossId(r, i) !== id) continue;
    play(g, { id: `saga_win_${r.id}_${i}`, trigger: 'saga', title: `${r.name} · ${zn.name}`, lines: zn.boss.victory });
    if (i === r.zones.length - 1) {
      play(g, { id: `saga_epi_${r.id}`, trigger: 'saga', title: `${r.name} · Epílogo`, lines: r.epilogue });
      if (g.addItem(r.reward.item)) g.toast(`✦ Relíquia da Saga: ${r.reward.name}`, r.color);
      const next = SAGA_REALMS[ri + 1];
      g.toast(next ? `🌀 Um novo portal desperta em Potos: ${next.name}.` : '✦ A Saga dos Oito Céus está completa!', '#ffd040');
    } else g.toast(`O caminho para ${r.zones[i + 1]!.name} está aberto.`, '#a0ffa0');
  }
}

/* ───────────── Contagem de abates por reino ───────────── */
const killKeyPrefix = (realm: string) => `sagakills:${realm}=`;
export function realmKills(g: Game, realm: string) {
  const p = killKeyPrefix(realm); for (const k of g.discoveries) if (k.startsWith(p)) return Number(k.slice(p.length)) || 0; return 0;
}
function setRealmKills(g: Game, realm: string, n: number) {
  const p = killKeyPrefix(realm); for (const k of [...g.discoveries]) if (k.startsWith(p)) g.discoveries.delete(k); g.discoveries.add(p + n);
}
export function sagaOnKill(g: Game) { const pos = sagaPosOf(g); if (pos) setRealmKills(g, pos.realm.id, realmKills(g, pos.realm.id) + 1); }
const baseKey = (s: SideStory, i: number) => `side:${s.id}:base${i}=`;
function stepBase(g: Game, s: SideStory, i: number) {
  const p = baseKey(s, i); for (const k of g.discoveries) if (k.startsWith(p)) return Number(k.slice(p.length)) || 0;
  const n = realmKills(g, s.realm); g.discoveries.add(p + n); return n;
}

/* ───────────── Histórias paralelas ───────────── */
export function sideProgress(g: Game, s: SideStory) {
  const i = sideStepOf(s, has(g)), st = s.steps[i];
  if (!st) return { i, text: 'Concluída', ready: false };
  const r = SAGA_REALMS.find((x) => x.id === s.realm)!;
  if (st.kind === 'kill') { const n = Math.max(0, realmKills(g, s.realm) - stepBase(g, s, i)); return { i, text: `${st.hint} (${Math.min(n, st.n!)}/${st.n})`, ready: n >= st.n! }; }
  if (st.kind === 'boss') return { i, text: st.hint, ready: g.bossesDone.has(sagaBossId(r, st.zone)) };
  if (st.kind === 'bring') return { i, text: `${st.hint} (${Math.min(g.count(st.item!), st.n!)}/${st.n})`, ready: g.count(st.item!) >= st.n! };
  return { i, text: st.hint, ready: true };
}
function npcOf(s: SideStory): NpcDef { return { id: `side_${s.id}`, name: s.npc.name, title: s.npc.title, tx: 0, ty: 0, pal: s.npc.pal, lines: [] }; }
function finishStep(g: Game, s: SideStory, i: number, opt = 0) {
  g.discoveries.add(sideKey(s, i)); g.audio.sfx('level'); g.burst(g.p.x, g.p.y - 12, '#ffe0a0', 24, 60, 2, -30);
  if (sideDone(s, has(g))) {
    const rw = s.reward; g.p.gold += rw.gold; g.gainXp(rw.xp); g.addItem(rw.item, rw.qty);
    const end = s.ending[opt] || s.ending[0];
    g.dialog = { npc: npcOf(s), text: `✦ História concluída: ${s.name}\n\n${end}\n\n+${rw.gold} ouro · +${rw.xp} XP · ${rw.qty}× ${ITEMS[rw.item]?.name ?? rw.item}`, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
    g.toast(`✦ ${s.name}`, '#ffd040');
  } else {
    const nx = s.steps[i + 1]!; if (nx.kind === 'kill') stepBase(g, s, i + 1);
    const r = SAGA_REALMS.find((x) => x.id === s.realm)!;
    g.dialog = { npc: npcOf(s), text: `${nx.text}\n\n→ ${nx.hint}${nx.zone !== s.steps[i]!.zone ? `\n(Local: ${r.zones[nx.zone]!.name})` : ''}`, choices: [{ label: 'Pode deixar', act: () => { g.dialog = null; } }] };
  }
  g.save();
}
function talkSide(g: Game, s: SideStory) {
  const pr = sideProgress(g, s), st = s.steps[pr.i]!, npc = npcOf(s), close = () => { g.dialog = null; };
  if (st.kind === 'choice') {
    g.dialog = { npc, text: st.text, choices: [
      { label: st.options![0], act: () => { g.discoveries.add(sideChoiceKey(s, 0)); finishStep(g, s, pr.i, 0); } },
      { label: st.options![1], act: () => { g.discoveries.add(sideChoiceKey(s, 1)); finishStep(g, s, pr.i, 1); } },
      { label: 'Pensar mais um pouco', act: close },
    ] };
    return;
  }
  if (st.kind === 'talk') { if (pr.i === 0) g.dialog = { npc, text: st.text, choices: [{ label: 'Eu ajudo', act: () => finishStep(g, s, pr.i) }, { label: 'Agora não', act: close }] }; else finishStep(g, s, pr.i); return; }
  if (!pr.ready) { g.dialog = { npc, text: `${st.text}\n\n→ ${pr.text}`, choices: [{ label: 'Já volto', act: close }] }; return; }
  if (st.kind === 'bring') g.removeItem(st.item!, st.n!);
  finishStep(g, s, pr.i);
}
/** NPCs de histórias paralelas presentes nesta zona, com a posição na sala. */
function sideNpcsHere(g: Game, pos: SagaPos) {
  const data = g.depth!.data, out: { s: SideStory; tx: number; ty: number }[] = [];
  for (const [k, s] of sidesOf(pos.realm.id).entries()) {
    const i = sideStepOf(s, has(g)), st = s.steps[i]; if (!st || st.zone !== pos.zi) continue;
    const room = data.rooms[(1 + k * 2) % data.rooms.length]!;
    out.push({ s, tx: room.x + Math.floor(room.w / 2) + 1, ty: room.y + Math.floor(room.h / 2) });
  }
  return out;
}

/* ───────────── Interação ───────────── */
const near = (g: Game, tx: number, ty: number, r = 22) => Math.hypot(g.p.x - tx * TS - 8, g.p.y - ty * TS - 8) < r;
function chooseZone(g: Game, ri: number) {
  const r = SAGA_REALMS[ri]!, d = done(g);
  const open = r.zones.map((_, i) => i).filter((i) => zoneUnlocked(r, i, d));
  const choices = open.slice(-5).map((i) => ({ label: `${g.bossesDone.has(sagaBossId(r, i)) ? '✓' : '⚔'} ${r.zones[i]!.name} (Nv ${zoneLevel(r, i)})`, act: () => { g.dialog = null; enterSagaZone(g, ri, i); } }));
  choices.push({ label: 'Agora não', act: () => { g.dialog = null; } });
  g.dialog = { npc: { ...ORACLE, name: r.name, title: r.subtitle }, text: `${r.prologue[1] ?? r.prologue[0]}\n\nZonas abertas: ${open.length}/${r.zones.length} · Nível recomendado ${r.level}+`, choices };
}
function oracleTalk(g: Game) {
  const d = done(g), cur = SAGA_REALMS.findIndex((r) => !realmDone(r, d));
  const total = SAGA_REALMS.reduce((n, r) => n + r.zones.filter((_, i) => d(sagaBossId(r, i))).length, 0), all = SAGA_REALMS.reduce((n, r) => n + r.zones.length, 0);
  const sides = SIDE_STORIES.filter((s) => sideDone(s, has(g))).length;
  const text = cur < 0
    ? `Você completou a Saga dos Oito Céus. Os portais continuam abertos para quem quiser revisitar os reinos.\n\nZonas: ${total}/${all} · Histórias: ${sides}/${SIDE_STORIES.length}`
    : `${cur === 0 ? 'Eu esperava você, viajante. A Deusa Lyria foi acorrentada numa ilha que não existe nos mapas, e o Rei Demônio Azrakel quer a voz dela para abrir o Inferno.' : `O próximo céu chama: ${SAGA_REALMS[cur]!.name}.`}\n\nEntre no portal que brilha ao meu redor.\n\nZonas vencidas: ${total}/${all} · Histórias paralelas: ${sides}/${SIDE_STORIES.length}`;
  g.dialog = { npc: ORACLE, text, choices: [
    ...(cur >= 0 ? [{ label: `Ir para ${SAGA_REALMS[cur]!.name}`, act: () => chooseZone(g, cur) }] : []),
    { label: 'Fechar', act: () => { g.dialog = null; } },
  ] };
}
export function sagaSurfaceAction(g: Game, run: boolean): string {
  const pz = sagaPlaza(g.overworld), d = done(g);
  if (near(g, pz.oracle.tx, pz.oracle.ty, 24)) { if (run) oracleTalk(g); return 'E · Oráculo Seraphine — A Saga dos Oito Céus'; }
  for (const [i, p] of pz.portals.entries()) {
    if (!near(g, p.tx, p.ty, 20)) continue;
    const r = SAGA_REALMS[i]!, open = realmUnlocked(i, d);
    if (run) { if (open) chooseZone(g, i); else g.toast(`O portal de ${r.name} está selado. Complete ${SAGA_REALMS[i - 1]!.name} primeiro.`, '#ff9a80'); }
    return open ? `E · Portal: ${r.name} (Nv ${r.level}+)` : `Portal selado: ${r.name}`;
  }
  return '';
}
export function sagaDepthAction(g: Game, run: boolean): string {
  const pos = sagaPosOf(g); if (!pos) return '';
  const data = g.depth!.data, { realm: r, ri, zi } = pos;
  for (const n of sideNpcsHere(g, pos)) if (near(g, n.tx, n.ty, 24)) { if (run) talkSide(g, n.s); return `E · ${n.s.npc.name} — ${n.s.name}`; }
  if (near(g, data.start.tx, data.start.ty, 20)) {
    if (run) { if (zi > 0) enterSagaZone(g, ri, zi - 1); else { g.depth = g.depth; leaveToSurface(g); } }
    return zi > 0 ? `E · Voltar para ${r.zones[zi - 1]!.name}` : 'E · Voltar a Potos';
  }
  if (near(g, data.stairs.tx, data.stairs.ty, 22)) {
    const locked = !g.bossesDone.has(sagaBossId(r, zi)), last = zi === r.zones.length - 1;
    if (run) {
      if (locked) g.toast(`${pos.zone.boss.name} bloqueia o caminho.`, '#ff8080');
      else if (last) { const id = `saga_${r.id}-altar`; if (!g.openedChests.has(id)) g.claimChest(id, 2000 + r.level * 120, 'elixir', 3, `Altar de ${r.name}`); leaveToSurface(g); }
      else enterSagaZone(g, ri, zi + 1);
    }
    return locked ? `Selado por ${pos.zone.boss.name}` : last ? 'E · Voltar a Potos em glória' : `E · Seguir para ${r.zones[zi + 1]!.name}`;
  }
  return '';
}
// eslint-disable-next-line no-var
var leaveImpl: ((g: Game) => void) | null | undefined;
export function setSagaLeave(f: (g: Game) => void) { leaveImpl = f; }
function leaveToSurface(g: Game) { leaveImpl?.(g); }

/* ───────────── Desenho ───────────── */
function drawPortal(c: CanvasRenderingContext2D, x: number, y: number, col: string, open: boolean, wt: number, i: number) {
  c.save();
  c.globalAlpha = 0.5; c.fillStyle = '#1a1028'; c.beginPath(); c.ellipse(x, y + 2, 15, 5, 0, 0, Math.PI * 2); c.fill();
  // arco de pedra
  c.globalAlpha = 1; c.fillStyle = '#5a5470'; c.fillRect(x - 13, y - 30, 4, 32); c.fillRect(x + 9, y - 30, 4, 32);
  c.fillStyle = '#8a84a0'; c.fillRect(x - 13, y - 30, 4, 2); c.fillRect(x + 9, y - 30, 4, 2);
  c.fillStyle = '#6a6488'; c.beginPath(); c.arc(x, y - 30, 13, Math.PI, 0); c.lineTo(x + 9, y - 30); c.arc(x, y - 30, 9, 0, Math.PI, true); c.closePath(); c.fill();
  c.fillStyle = col; c.fillRect(x - 2, y - 45, 4, 4);
  if (open) {
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const a = wt * (1.4 + k * 0.3) + k * 1.6 + i;
      c.globalAlpha = 0.25 + 0.12 * Math.sin(wt * 3 + k); c.strokeStyle = col; c.lineWidth = 2;
      c.beginPath(); c.ellipse(x, y - 15, 8 - k * 1.5, 14 - k * 2.5, Math.sin(a) * 0.2, a, a + Math.PI * 1.4); c.stroke();
    }
    c.globalAlpha = 0.35 + 0.15 * Math.sin(wt * 4 + i); c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 15, 8, 14, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) { const t = (wt * 0.7 + k / 6 + i * 0.13) % 1; c.globalAlpha = 1 - t; c.fillRect(x + Math.sin(k * 2.1 + wt) * 9, y - 4 - t * 34, 2, 2); }
  } else { c.globalAlpha = 0.5; c.fillStyle = '#20182c'; c.beginPath(); c.ellipse(x, y - 15, 8, 14, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
export function drawSaga(g: Game, c: CanvasRenderingContext2D, draws: { y: number; f: () => void }[], x0: number, y0: number, x1: number, y1: number, wt: number) {
  const vis = (tx: number, ty: number) => tx >= x0 - 3 && tx <= x1 + 3 && ty >= y0 - 3 && ty <= y1 + 4;
  if (!g.depth) {
    if (g.interior) return;
    const pz = sagaPlaza(g.overworld), d = done(g);
    if (vis(pz.oracle.tx, pz.oracle.ty)) {
      const x = pz.oracle.tx * TS + 8, y = pz.oracle.ty * TS + 14;
      draws.push({ y, f: () => {
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5 + Math.sin(wt * 2) * 0.15; softGlow(c, x, y - 10, 26, 'rgba(190,150,255,0.5)'); c.restore();
        drawChar(c, x, y - Math.sin(wt * 2) * 1.5, ORACLE.pal, 0, Math.floor(wt * 2) % 2);
        c.fillStyle = '#ffd040'; c.fillRect(x - 1, y - 30 - Math.sin(wt * 4) * 2, 3, 6); c.fillRect(x - 1, y - 22 - Math.sin(wt * 4) * 2, 3, 2);
      } });
    }
    for (const [i, p] of pz.portals.entries()) if (vis(p.tx, p.ty)) {
      const r = SAGA_REALMS[i]!, open = realmUnlocked(i, d);
      draws.push({ y: p.ty * TS + 14, f: () => drawPortal(c, p.tx * TS + 8, p.ty * TS + 14, r.portal, open, wt, i) });
    }
    return;
  }
  const pos = sagaPosOf(g); if (!pos) return;
  drawSagaScenery(g, c, draws, pos.realm, pos.ri, pos.zi, pos.zone, x0, y0, x1, y1, wt);
  for (const n of sideNpcsHere(g, pos)) if (vis(n.tx, n.ty)) {
    const x = n.tx * TS + 8, y = n.ty * TS + 14, pr = sideProgress(g, n.s);
    draws.push({ y, f: () => {
      drawChar(c, x, y, n.s.npc.pal, 0, Math.floor(wt * 1.5) % 2);
      const bob = Math.sin(wt * 4) * 2; c.fillStyle = pr.ready ? '#ffd040' : '#c0c0c0'; c.font = "8px 'Press Start 2P', monospace"; c.textAlign = 'center'; c.fillText(pr.ready ? '!' : '…', x, y - 26 + bob);
    } });
  }
}
/** Escadas próprias da saga (em vez do altar dos templos). */
export function drawSagaStairs(g: Game, c: CanvasRenderingContext2D, wt: number): boolean {
  const pos = sagaPosOf(g); if (!pos) return false;
  const data = g.depth!.data;
  drawStairs(c, 'spiral', data.start.tx, data.start.ty, false, wt);
  drawStairs(c, 'spiral', data.stairs.tx, data.stairs.ty, true, wt, !g.bossesDone.has(sagaBossId(pos.realm, pos.zi)));
  return true;
}
export function sagaLights(g: Game, hole: (x: number, y: number, r: number, a?: number) => void) {
  if (!g.depth) { const pz = sagaPlaza(g.overworld); hole(pz.oracle.tx * TS + 8, pz.oracle.ty * TS, 50, 0.9); for (const p of pz.portals) hole(p.tx * TS + 8, p.ty * TS, 40, 0.8); return; }
  const pos = sagaPosOf(g); if (!pos) return;
  for (const n of sideNpcsHere(g, pos)) hole(n.tx * TS + 8, n.ty * TS + 6, 46, 0.9);
  sagaSceneLights(g, hole, pos.ri, pos.zi);
  const d = g.depth.data; hole(d.stairs.tx * TS + 8, d.stairs.ty * TS + 8, 50, 0.8);
}
export const sagaDarkness = (g: Game) => sagaPosOf(g)?.zone.light ?? null;
export const sagaZoneOf = (g: Game) => sagaPosOf(g)?.zone ?? null;

/* ───────────── Painel ───────────── */
export function sagaSummary(g: Game) {
  const d = done(g);
  return SAGA_REALMS.map((r, ri) => ({
    realm: r, open: realmUnlocked(ri, d), complete: realmDone(r, d),
    zones: r.zones.map((zn, i) => ({ zone: zn, done: d(sagaBossId(r, i)), open: zoneUnlocked(r, i, d), level: zoneLevel(r, i) })),
    sides: sidesOf(r.id).map((s) => ({ story: s, done: sideDone(s, has(g)), started: g.discoveries.has(sideKey(s, 0)), progress: sideProgress(g, s), zone: r.zones[s.steps[Math.min(sideStepOf(s, has(g)), s.steps.length - 1)]!.zone]!.name })),
  }));
}

/** Clima da zona da saga (tela cheia). */
export function sagaWeather(g: Game, c: CanvasRenderingContext2D) { const z = sagaPosOf(g)?.zone; if (z) drawSagaWeather(g, c, z); }
