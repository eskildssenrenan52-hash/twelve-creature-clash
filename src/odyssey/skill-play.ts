// Grimório em jogo: lançar habilidades de livro, efeitos temporários e as fontes dos livros.
import type { Game } from './engine';
import { SKILLS, SKILL_BY_ID, SPIRIT_IDS, LOADOUT_SIZE, sanitizeLoadout, type BuffId, type SkillDef } from './skills';
import { REALMS, HEART_REALM } from './secrets';
import { SAGA_REALMS, sagaBossId } from './saga';
import { ISLANDS } from './archipelago';
import { STATUES } from './data';
import { growPlots } from './settlement';

const TS = 16;
export type Buffs = Record<BuffId, number>;
export const freshBuffs = (): Buffs => ({ shield: 0, stone: 0, regen: 0, might: 0, focus: 0, luck: 0, haste: 0 });

type SkillPlayer = { skills?: string[]; loadout?: string[]; spirits: string[] };
const pl = (g: Game) => g.p as unknown as SkillPlayer;

export function knownSkills(g: Game): string[] {
  const p = pl(g);
  return [...p.spirits, ...(p.skills ?? []).filter((id) => !SPIRIT_IDS.includes(id))];
}
export const knows = (g: Game, id: string) => knownSkills(g).includes(id);
export function loadout(g: Game): string[] {
  const p = pl(g);
  if (!p.loadout || p.loadout.length !== LOADOUT_SIZE) p.loadout = sanitizeLoadout(p.loadout);
  return p.loadout;
}
export function learn(g: Game, id: string, from: string): boolean {
  const s = SKILL_BY_ID[id]; if (!s || knows(g, id)) return false;
  const p = pl(g); p.skills = [...(p.skills ?? []), id];
  const lo = loadout(g); const free = lo.indexOf(''); if (free >= 0) lo[free] = id;
  g.toast(`Livro lido: ${s.book} — você aprendeu ${s.name}! (V abre o Grimório)`, s.color);
  if (from) g.toast(from, '#e0d8c8');
  g.audio.sfx('level'); g.burst(g.p.x, g.p.y - 12, s.color, 30, 70, 2, -40);
  return true;
}
/** Em combate = chefe ativo ou inimigo a menos de 90 px. */
export function inCombat(g: Game) {
  if (g.activeBoss) return true;
  return g.enemies.some((e) => e.alive && Math.hypot(e.x - g.p.x, e.y - g.p.y) < 90);
}
export function setSlot(g: Game, slot: number, id: string): string | null {
  if (inCombat(g)) return 'Não dá para trocar habilidades em combate.';
  if (slot < 0 || slot >= LOADOUT_SIZE) return 'Espaço inválido.';
  if (id && !knows(g, id)) return 'Você ainda não leu esse livro.';
  const lo = loadout(g);
  const prev = lo.indexOf(id); if (id && prev >= 0) lo[prev] = lo[slot] ?? '';
  lo[slot] = id; g.save(); return null;
}
export function buyBook(g: Game, id: string): string | null {
  const s = SKILL_BY_ID[id]; if (!s || s.source.kind !== 'shop') return 'Este livro não está à venda.';
  if (knows(g, id)) return 'Você já leu este livro.';
  const price = Math.round(s.source.price * g.priceMult());
  if (g.p.gold < price) { g.audio.sfx('hurt'); return `Faltam ${price - g.p.gold} de ouro.`; }
  g.p.gold -= price; g.audio.sfx('coin'); learn(g, id, ''); g.save(); return null;
}

/* ───────── lançar ───────── */
export function castSkill(g: Game, s: SkillDef) {
  const p = g.p, st = g.stats(), ef = s.effect;
  const focus = g.buffs.focus > 0 ? 1.5 : 1;
  const pow = (k: number) => (st.int * k + 10 + p.level) * focus;
  const a = g.aimNearest(170); const len = Math.hypot(a.x, a.y) || 1, dx = a.x / len, dy = a.y / len;
  g.setDirFrom(dx, dy); p.attackT = 1;
  const cx = p.x, cy = p.y - 8;
  switch (ef.kind) {
    case 'proj': {
      g.audio.sfx(ef.proj === 'ice' ? 'ice' : ef.proj === 'arrow' ? 'bow' : 'fire');
      for (let i = 0; i < ef.count; i++) {
        const o = ef.count === 1 ? 0 : (i / (ef.count - 1) - 0.5) * 2 * ef.spread * (ef.count > 3 ? 2 : 1);
        const ang = Math.atan2(dy, dx) + o;
        g.projs.push({ x: cx, y: cy, vx: Math.cos(ang) * ef.speed, vy: Math.sin(ang) * ef.speed, life: ef.life ?? 1, dmg: pow(ef.dmg), from: 'p', kind: ef.proj, r: ef.dmg > 6 ? 7 : 4, color: s.color, slow: !!ef.slow });
      }
      if (ef.drain) { const h = Math.round(pow(ef.dmg) * ef.drain); p.hp = Math.min(g.maxHp(), p.hp + h); g.float(p.x, p.y - 28, `+${h}`, '#ff80a0'); }
      break;
    }
    case 'ring':
      g.audio.sfx('ice');
      for (let i = 0; i < ef.count; i++) { const ang = (i / ef.count) * Math.PI * 2; g.projs.push({ x: cx, y: cy, vx: Math.cos(ang) * 200, vy: Math.sin(ang) * 200, life: 0.8, dmg: pow(ef.dmg), from: 'p', kind: ef.proj, r: 4, color: s.color, slow: !!ef.slow }); }
      break;
    case 'nova':
      g.audio.sfx('wind'); g.burst(cx, cy, s.color, 40, 150, 2);
      for (const e of g.enemies) { if (!e.alive) continue; const d = Math.hypot(e.x - cx, e.y - cy); if (d < ef.radius) { const k = 1 / (d || 1); g.damageEnemy(e, pow(ef.dmg), (e.x - cx) * k * ef.push, (e.y - cy) * k * ef.push, s.color); } }
      if (s.id === 'barreira') g.buffs.shield = Math.max(g.buffs.shield, 3);
      break;
    case 'zone':
      g.audio.sfx('light');
      for (let i = 0; i < ef.count; i++) {
        const ox = ef.count > 1 ? Math.cos(i * 2.1) * 34 : 0, oy = ef.count > 1 ? Math.sin(i * 2.1) * 24 : 0;
        const tx = cx + (len > 1 ? a.x : dx * 50) + ox, ty = cy + (len > 1 ? a.y : dy * 50) + oy;
        g.teles.push({ x: tx, y: ty, r: ef.radius, t: 0.35 + i * 0.18, max: 0.35 + i * 0.18, dmg: -pow(ef.dmg) });
      }
      break;
    case 'heal': {
      const h = Math.round(st.wis * ef.amount + 20); p.hp = Math.min(g.maxHp(), p.hp + h);
      if (ef.mana) p.mp = Math.min(g.maxMp(), p.mp + ef.mana);
      g.float(p.x, p.y - 28, `+${h}`, '#70ff90'); g.burst(cx, cy, s.color, 24, 50, 2, -60); g.audio.sfx('heal');
      break;
    }
    case 'buff':
      g.buffs[ef.buff] = Math.max(g.buffs[ef.buff], ef.dur);
      if (ef.heal) g.buffs.regen = Math.max(g.buffs.regen, ef.dur);
      g.audio.sfx('heal'); g.burst(cx, cy, s.color, 28, 60, 2, -40); g.float(p.x, p.y - 30, s.name, s.color);
      break;
    case 'dash': {
      g.audio.sfx('wind');
      const steps = 10, sx = p.x, sy = p.y;
      for (let i = 0; i < steps; i++) { const bx = p.x, by = p.y; g.moveBody(p, (dx * ef.dist) / steps, (dy * ef.dist) / steps); if (p.x === bx && p.y === by) break; }
      g.burst(sx, sy - 8, s.color, 18, 40); g.burst(p.x, p.y - 8, s.color, 18, 40); p.inv = Math.max(p.inv, 0.35);
      if (ef.trail) for (let i = 1; i <= 4; i++) g.teles.push({ x: sx + (p.x - sx) * (i / 4), y: sy - 8 + (p.y - sy) * (i / 4), r: 22, t: 0.15 * i, max: 0.15 * i, dmg: -pow(ef.trail) });
      break;
    }
    case 'recall': {
      if (g.depth || g.island || g.sea || g.interior) { g.toast('O mapa não dobra aqui dentro.', '#ff8080'); p.mp += s.mp; p.spellCd = 0; return; }
      const t = STATUES.find((x) => x.id === p.respawnStatue) ?? STATUES[0]!;
      p.x = t.tx * TS + 8; p.y = (t.ty + 2) * TS + 8; p.vx = p.vy = 0; g.audio.sfx('warp'); g.burst(p.x, p.y - 8, s.color, 40, 80);
      break;
    }
    case 'slowAll':
      g.audio.sfx('ice');
      for (const e of g.enemies) if (e.alive && Math.hypot(e.x - cx, e.y - cy) < ef.radius) { e.slow = ef.dur; g.burst(e.x, e.y - 8, s.color, 6, 30); }
      break;
    case 'harvest':
      growPlots(g.settlement, 120, true); g.audio.sfx('heal'); g.toast('As plantações crescem diante dos seus olhos.', s.color);
      break;
    case 'transmute':
      if (g.count('stone') < 3) { g.toast('Precisa de 3 pedras.', '#ff8080'); p.mp += s.mp; p.spellCd = 0; return; }
      g.removeItem('stone', 3); { const gold = 25 + p.level * 2; p.gold += gold; g.float(p.x, p.y - 28, `+${gold}g`, '#ffd040'); g.audio.sfx('coin'); }
      break;
  }
}

/* ───────── buffs a cada quadro ───────── */
export function skillTick(g: Game, dt: number) {
  const b = g.buffs;
  for (const k of Object.keys(b) as BuffId[]) if (b[k] > 0) b[k] = Math.max(0, b[k] - dt);
  if (b.regen > 0) g.p.hp = Math.min(g.maxHp(), g.p.hp + dt * (4 + g.maxHp() * 0.02));
  sourceT += dt; if (sourceT > 1.5) { sourceT = 0; checkBookSources(g); }
}
let sourceT = 0;
export const damageTakenMult = (g: Game) => (g.buffs.shield > 0 ? 0.5 : 1) * (g.buffs.stone > 0 ? 0.6 : 1);
export const damageDealtMult = (g: Game) => (g.buffs.might > 0 ? 1.35 : 1);
export const speedMult = (g: Game) => (g.buffs.haste > 0 ? 1.4 : 1);
export const luckMult = (g: Game) => (g.buffs.luck > 0 ? 1.5 : 1);

/* ───────── fontes dos livros (baús, relíquias e reinos) ───────── */
function resolve<T extends { id: string }>(list: readonly T[], ref: string): T | undefined {
  return ref.startsWith('#') ? list[Number(ref.slice(1))] : list.find((x) => x.id === ref);
}
export function sourceUnlocked(g: Game, s: SkillDef): boolean {
  const src = s.source;
  if (src.kind === 'abyss') return g.abyssBest >= src.floor;
  if (src.kind === 'realm') { const r = src.realm === HEART_REALM.id ? HEART_REALM : resolve(REALMS, src.realm); return !!r && g.openedChests.has(`realm_${r.id}-relic`); }
  if (src.kind === 'saga') { const r = resolve(SAGA_REALMS, src.realm); return !!r && g.bossesDone.has(sagaBossId(r, r.zones.length - 1)); }
  if (src.kind === 'island') { const i = resolve(ISLANDS, src.island); return !!i && g.discoveries.has(`isle:${i.id}:relic`); }
  return false;
}
export function checkBookSources(g: Game) {
  for (const s of SKILLS) {
    if (s.source.kind === 'spirit' || s.source.kind === 'shop' || knows(g, s.id)) continue;
    if (!sourceUnlocked(g, s)) continue;
    const where = s.source.kind === 'abyss' ? `Um baú antigo no andar ${s.source.floor} do Abismo guardava um livro.` : 'Junto da relíquia havia um livro esquecido.';
    learn(g, s.id, where); g.save();
  }
}
export const ABYSS_CHEST_FLOORS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
