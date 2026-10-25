// Desempenho: gradientes pré-renderizados e qualidade adaptativa para aparelhos fracos.
// Nada é removido: os efeitos caros só são espaçados ou simplificados quando o aparelho não aguenta.

/** Disco radial branco→transparente desenhado uma vez; reutilizado em toda luz/brilho. */
let soft: HTMLCanvasElement | null = null;
const tinted = new Map<string, HTMLCanvasElement>();
const SOFT = 64;
function softDisc(): HTMLCanvasElement | null {
  if (soft || typeof document === 'undefined') return soft;
  const c = document.createElement('canvas'); c.width = c.height = SOFT;
  const x = c.getContext('2d'); if (!x) return null;
  const g = x.createRadialGradient(SOFT / 2, SOFT / 2, 0, SOFT / 2, SOFT / 2, SOFT / 2);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, SOFT, SOFT); soft = c; return c;
}
/** Disco do brilho colorido (cor com alfa embutido, ex. 'rgba(255,140,50,0.32)'). */
function colorDisc(col: string): HTMLCanvasElement | null {
  const hit = tinted.get(col); if (hit) return hit;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = SOFT;
  const x = c.getContext('2d'); if (!x) return null;
  const g = x.createRadialGradient(SOFT / 2, SOFT / 2, 0, SOFT / 2, SOFT / 2, SOFT / 2);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, SOFT, SOFT);
  if (tinted.size > 256) tinted.clear();
  tinted.set(col, c); return c;
}
/** Abre um buraco de luz (use com destination-out). Mesmo visual do gradiente, sem criar objetos por quadro. */
export function softHole(l: CanvasRenderingContext2D, x: number, y: number, r: number, a = 1) {
  const d = softDisc(); if (!d || r <= 0) return;
  l.globalAlpha = a; l.drawImage(d, x - r, y - r, r * 2, r * 2); l.globalAlpha = 1;
}
export function softGlow(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) {
  const d = colorDisc(col); if (!d || r <= 0) return;
  c.drawImage(d, x - r, y - r, r * 2, r * 2);
}

/**
 * Governador de qualidade: mede o tempo médio de quadro e ajusta o nível.
 * 2 = completo, 1 = efeitos pesados espaçados, 0 = aparelho muito fraco (meia taxa de desenho).
 */
export class Quality {
  level = 2;
  private avg = 16.7;
  private calm = 0;
  private frame = 0;
  constructor() {
    if (typeof navigator !== 'undefined') {
      const n = navigator as Navigator & { deviceMemory?: number };
      if ((n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) <= 1) this.level = 0;
      else if ((n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 2) this.level = 1;
    }
  }
  /** Registra o tempo de um quadro (ms). */
  sample(ms: number) {
    this.frame++;
    this.avg += (Math.min(200, ms) - this.avg) * 0.05;
    if (this.avg > 20 && this.level > 0) { this.level--; this.avg = 16.7; this.calm = 0; }
    else if (this.avg < 13) { if (++this.calm > 600 && this.level < 2) { this.level++; this.calm = 0; } }
    else this.calm = 0;
  }
  /** No nível 0 desenha um quadro sim, outro não (a lógica continua a cada quadro). */
  private tick = 0;
  shouldRender() { this.tick++; return this.level > 0 || this.tick % 2 === 0; }
  /** Efeitos de tela cheia (bloom, raios de sol): todo quadro no nível 2, alternados abaixo. */
  heavyFx() { return this.frame % (this.level >= 2 ? 3 : this.level === 1 ? 4 : 6) === 0; }
  /** Intervalo de atualização do painel (ms): mais espaçado em aparelhos fracos. */
  hudEvery() { return this.level >= 2 ? 1 : this.level === 1 ? 2 : 3; }
}
