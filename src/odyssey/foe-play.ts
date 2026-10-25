// Comportamentos únicos das novas criaturas. Chamado pelo updateEnemies antes da IA padrão.
import type { Enemy, Game } from './engine';
import { FOES, isFoe } from './foes';
import { solidAt } from './world';

interface FoeState { t: number; baseDef: number; dash: number }
const state = new WeakMap<Enemy, FoeState>();
function st(e: Enemy): FoeState {
  let s = state.get(e);
  if (!s) { s = { t: 1.5 + Math.random() * 2, baseDef: e.def, dash: 0 }; state.set(e, s); }
  return s;
}

/**
 * Executa o traço especial da criatura. Retorna true quando o quadro já foi tratado
 * (a IA padrão de perseguir/atirar é pulada).
 */
export function foeTick(g: Game, e: Enemy, dt: number, d: number, dx: number, dy: number, aggro: number): boolean {
  if (!isFoe(e.kind) || e.boss) return false;
  const f = FOES[e.kind], s = st(e), p = g.p;
  const engaged = d < aggro && p.dead <= 0 && Math.hypot(e.hx - e.x, e.hy - e.y) < 260;
  s.t -= dt;

  // Tiros próprios (cor, leque, espiral, lentidão) para as criaturas de longo alcance.
  if (f.ranged && f.shot && engaged && e.cd <= 0 && d < 140 && d > 0) {
    e.cd = (f.trait === 'spiral' ? 3.2 : 2.1) + Math.random() * 0.8;
    const base = f.trait === 'spiral' ? e.t : Math.atan2(dy, dx), n = f.shot.n;
    for (let i = 0; i < n; i++) {
      const a = f.trait === 'spiral' ? base + i * f.shot.spread : base + (i - (n - 1) / 2) * f.shot.spread;
      g.projs.push({ x: e.x, y: e.y - 10, vx: Math.cos(a) * f.shot.speed, vy: Math.sin(a) * f.shot.speed, life: 1.7, dmg: e.atk, from: 'e', kind: 'spore', r: 3, color: f.shot.color, slow: f.shot.slow });
    }
  }

  switch (f.trait) {
    case 'root': { // planta fixa: nunca anda; morde quem chega colado
      if (engaged && d < 16 && e.cd <= 0.6) { e.cd = 1.4; g.hurtPlayer(e.atk, e.x, e.y); }
      return true;
    }
    case 'blink': { // some num clarão e reaparece ao redor do herói
      if (engaged && s.t <= 0 && d > 26) {
        s.t = 3.5 + Math.random() * 2;
        for (let k = 0; k < 6; k++) {
          const a = Math.random() * Math.PI * 2, r = 34 + Math.random() * 20, nx = p.x + Math.cos(a) * r, ny = p.y + Math.sin(a) * r;
          if (!solidAt(g.world, nx, ny) && Math.hypot(nx - e.hx, ny - e.hy) < 250) {
            g.burst(e.x, e.y - 10, f.shot?.color ?? '#9a80ff', 10, 50);
            e.x = nx; e.y = ny; e.cd = Math.max(e.cd, 0.6);
            g.burst(e.x, e.y - 10, f.shot?.color ?? '#9a80ff', 10, 50);
            break;
          }
        }
      }
      return false;
    }
    case 'charge': case 'burrow': { // investida em linha reta (usa o mesmo impulso do recuo)
      if (engaged && s.t <= 0 && d > 28 && d < 120) {
        s.t = 2.8 + Math.random() * 1.5; s.dash = 0.45;
        const sp = f.trait === 'burrow' ? 210 : 260;
        e.kbx = (dx / d) * sp; e.kby = (dy / d) * sp; e.dir = dx < 0 ? 1 : 2;
        g.burst(e.x, e.y - 4, f.trait === 'burrow' ? '#d8b878' : '#ffb060', 8, 40);
      }
      if (s.dash > 0) {
        s.dash -= dt;
        if (d < 14 && e.cd <= 0) { e.cd = 1.1; g.hurtPlayer(Math.round(e.atk * 1.3), e.x, e.y); s.dash = 0; }
        return true;
      }
      return false;
    }
    case 'shell': { // fecha a casca de cristal periodicamente: defesa altíssima, imóvel
      const closed = Math.sin(e.t * 1.4) <= -0.2;
      e.def = closed ? s.baseDef * 3 + 10 : s.baseDef;
      return closed;
    }
    default: return false;
  }
}
