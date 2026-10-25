// A Grande Crônica em jogo: progresso da história principal, facções, contratos e cenas.
// Fica numa chave própria do navegador, então saves antigos continuam iguais.
import type { Game } from './engine';
import {
  FACTIONS, FACTION_BY_ID, MAIN_COUNT, getMain, mission, sideStory, factionScene, endingScene, decideEnding, clampRep, repPriceMult,
  type EndingId, type FactionId, type Objective, type EpicScene,
} from './epic';

const KEY = 'golden-arrow-epic';
export const MAX_CONTRACTS = 5;
export interface Contract { m: number; base: number }
export interface EpicState {
  v: 1; main: number; mainState: 'active' | 'choose' | 'done'; mainBase: number;
  rep: Record<FactionId, number>; ending: Record<EndingId, number>; endingSeen: EndingId | null;
  kills: number; biomes: string[]; contracts: Contract[]; done: number[]; met: FactionId[]; choices: number[];
}
export const freshEpic = (): EpicState => ({ v: 1, main: 0, mainState: 'active', mainBase: 0, rep: { coro: 0, raiz: 0, mare: 0, forja: 0, veu: 0, silencio: 0 }, ending: { cancao: 0, silencio: 0, harmonia: 0 }, endingSeen: null, kills: 0, biomes: [], contracts: [], done: [], met: [], choices: [] });

const states = new WeakMap<Game, EpicState>();
export function epic(g: Game): EpicState { let s = states.get(g); if (!s) { s = freshEpic(); states.set(g, s); } return s; }
export function epicLoad(g: Game) {
  try { const raw = localStorage.getItem(KEY); const d = raw ? JSON.parse(raw) : null; states.set(g, d && d.v === 1 ? { ...freshEpic(), ...d } : freshEpic()); } catch { states.set(g, freshEpic()); }
}
export function epicSave(g: Game) { try { localStorage.setItem(KEY, JSON.stringify(epic(g))); } catch { /* ignore */ } }
export function epicNewGame(g: Game) { states.set(g, freshEpic()); epicSave(g); playScene(g, factionScene(FACTION_BY_ID[getMain(0).giver])); epic(g).met.push(getMain(0).giver); playScene(g, getMain(0).intro); }

/* ───────── cenas ───────── */
export function playScene(g: Game, s: EpicScene, replay = false) {
  if (!replay && (g.seenBeats.has(s.id) || g.beatQueue.some((b) => b.id === s.id))) return;
  g.beatQueue.push({ id: s.id, trigger: 'epic', title: s.title, lines: s.lines, stage: s });
  if (!g.cutscene) g.nextBeat();
}

/* ───────── objetivos ───────── */
export function progress(g: Game, o: Objective, base: number): { cur: number; max: number; ok: boolean } {
  const s = epic(g);
  switch (o.kind) {
    case 'kills': { const cur = Math.min(o.n, s.kills - base); return { cur, max: o.n, ok: cur >= o.n }; }
    case 'biomes': { const cur = Math.min(o.n, s.biomes.length); return { cur, max: o.n, ok: cur >= o.n }; }
    case 'level': return { cur: Math.min(o.n, g.p.level), max: o.n, ok: g.p.level >= o.n };
    case 'gold': return { cur: Math.min(o.n, g.p.gold), max: o.n, ok: g.p.gold >= o.n };
    case 'visit': { const ok = s.biomes.includes(o.biome); return { cur: ok ? 1 : 0, max: 1, ok }; }
  }
}
export function epicOnKill(g: Game) { epic(g).kills++; }
export function epicOnBiome(g: Game, b: string) { const s = epic(g); if (!s.biomes.includes(b)) s.biomes.push(b); }
let tickT = 0;
/** Chamado algumas vezes por segundo: avisa quando a missão principal fica pronta. */
export function epicTick(g: Game) {
  const s = epic(g); if (s.mainState !== 'active') return;
  if (s.biomes.length === 0) epicOnBiome(g, g.biome);
  if (progress(g, getMain(s.main).obj, s.mainBase).ok && ++tickT > 0) { s.mainState = 'choose'; g.toast(`Missão principal pronta: ${getMain(s.main).title} — abra a Grande Crônica (O) e escolha.`, '#ffd040'); g.audio.sfx('level'); epicSave(g); }
}

/* ───────── missão principal ───────── */
export function chooseMain(g: Game, c: 0 | 1): string | null {
  const s = epic(g); if (s.mainState !== 'choose') return 'A missão ainda não está pronta.';
  const q = getMain(s.main), ch = q.choices[c];
  if (q.obj.kind === 'gold') g.p.gold -= q.obj.n;
  for (const [f, v] of Object.entries(ch.rep)) s.rep[f as FactionId] = clampRep(s.rep[f as FactionId] + (v ?? 0));
  s.ending[ch.ending] += 1; s.choices.push(c);
  g.gainXp(60 + s.main * 25); g.p.gold += 40 + s.main * 10;
  playScene(g, q.outro[c]);
  s.main++;
  if (s.main >= MAIN_COUNT) { s.mainState = 'done'; const e = decideEnding(s.ending); s.endingSeen = e; playScene(g, endingScene(e)); }
  else {
    s.mainState = 'active'; s.mainBase = s.kills; const nq = getMain(s.main);
    if (!s.met.includes(nq.giver)) { s.met.push(nq.giver); playScene(g, factionScene(FACTION_BY_ID[nq.giver])); }
    playScene(g, nq.intro);
  }
  g.save(); return null;
}

/* ───────── contratos (histórias paralelas) ───────── */
export const isDone = (g: Game, m: number) => epic(g).done.includes(m);
export function storyUnlocked(g: Game, st: number) { return st < 40 + epic(g).main * 45 + epic(g).done.length * 2; }
export function nextMissionOf(g: Game, st: number): number | null { const s = sideStory(st); return s.missions.find((m) => !isDone(g, m)) ?? null; }
export function acceptMission(g: Game, m: number): string | null {
  const s = epic(g);
  if (s.contracts.length >= MAX_CONTRACTS) return `Você já tem ${MAX_CONTRACTS} contratos ativos.`;
  if (s.contracts.some((c) => c.m === m) || isDone(g, m)) return 'Contrato já aceito.';
  const ms = mission(m); s.contracts.push({ m, base: s.kills });
  if (ms.step === 0) { const sc = sideStory(ms.story).scene; if (sc) playScene(g, sc); }
  g.audio.sfx('pickup'); epicSave(g); return null;
}
export function turnIn(g: Game, m: number): string | null {
  const s = epic(g), c = s.contracts.find((x) => x.m === m); if (!c) return 'Contrato não encontrado.';
  const ms = mission(m); if (!progress(g, ms.obj, c.base).ok) return 'Ainda não terminou.';
  if (ms.obj.kind === 'gold') g.p.gold -= ms.obj.n;
  s.contracts = s.contracts.filter((x) => x.m !== m); s.done.push(m);
  const f = sideStory(ms.story).faction; s.rep[f] = clampRep(s.rep[f] + ms.reward.rep);
  g.p.gold += ms.reward.gold; g.gainXp(ms.reward.xp); g.toast(`Contrato concluído: ${ms.title} (+${ms.reward.gold} ouro)`, '#a0ffa0');
  g.save(); return null;
}
export function abandon(g: Game, m: number) { const s = epic(g); s.contracts = s.contracts.filter((x) => x.m !== m); epicSave(g); }
export const shopPriceMult = (g: Game) => repPriceMult(epic(g).rep.mare);
export { FACTIONS };
