// Indicador de objetivo: decide para onde o jogador deve ir agora (dado puro, testável).
import { BOSSES, ENEMIES, ITEMS, NPCS, type EnemyKind, type QuestDef } from './data';
import { FRONTIER_GATES } from './frontier';

export interface Waypoint { tx: number; ty: number; label: string; hint: string; color: string }
export interface SeenEnemy { kind: EnemyKind; tx: number; ty: number }

const biomeOfQuest = (id: string) => id.match(/^([a-z]+)_\d+$/)?.[1];

export function objectiveWaypoint(q: QuestDef, state: 'active' | 'available', ready: boolean, at: { x: number; y: number }, enemies: SeenEnemy[]): Waypoint | null {
  const giver = NPCS.find(n => n.id === q.giver);
  const toGiver = (hint: string, color: string): Waypoint | null => giver ? { tx: giver.tx, ty: giver.ty, label: giver.name, hint, color } : null;
  if (state === 'available') return toGiver(`Fale com ${giver?.name}: ${q.title}`, '#ffd040');
  if (ready) return toGiver(`Entregue a ${giver?.name}: ${q.title}`, '#80ff90');
  const g = q.goal;
  if (g.kind === 'boss') {
    const b = BOSSES.find(x => x.id === g.target);
    return b ? { tx: b.tx, ty: b.ty, label: b.name, hint: `Derrote ${b.name}`, color: '#ff5050' } : toGiver(q.title, '#ff5050');
  }
  if (g.kind === 'talk') { const n = NPCS.find(x => x.id === g.npc); return n ? { tx: n.tx, ty: n.ty, label: n.name, hint: `Leve o recado a ${n.name}`, color: '#a0d0ff' } : null; }
  if (g.kind === 'floor') return { tx: 144, ty: 150, label: 'Abismo', hint: `Desça ao andar ${g.n} do Abismo`, color: '#c78bff' };
  const kinds: EnemyKind[] = g.kind === 'kill' ? [g.target]
    : (Object.values(ENEMIES).filter(e => e.drops.some(([id]) => id === g.item)).map(e => e.kind));
  let best: SeenEnemy | null = null, bd = Infinity;
  for (const e of enemies) if (kinds.includes(e.kind)) { const d = Math.hypot(e.tx - at.x, e.ty - at.y); if (d < bd) { bd = d; best = e; } }
  const what = g.kind === 'kill' ? ENEMIES[g.target].name : ITEMS[g.item]?.name ?? g.item;
  const hint = g.kind === 'kill' ? `Cace ${what}` : `Colete ${what}`;
  if (best && bd < 60) return { tx: best.tx, ty: best.ty, label: what, hint, color: '#ffa040' };
  const gate = FRONTIER_GATES.find(x => x.biome === biomeOfQuest(q.id));
  if (gate) return { tx: gate.tx, ty: gate.ty + 6, label: gate.name, hint: `${hint} em ${gate.name}`, color: '#ffa040' };
  return best ? { tx: best.tx, ty: best.ty, label: what, hint, color: '#ffa040' } : null;
}
