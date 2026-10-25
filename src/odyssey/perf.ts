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
  /** Aparelho de toque (celular/tablet): começa no modo equilibrado e nunca liga os filtros mais caros. */
  readonly mobile: boolean;
  private avg = 16.7;
  private calm = 0;
  private frame = 0;
  private base = 16.7;
  constructor() {
    let mobile = false;
    if (typeof navigator !== 'undefined') {
      const n = navigator as Navigator & { deviceMemory?: number };
      mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(n.userAgent ?? '') || (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches);
      if ((n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) <= 1) this.level = 0;
      else if (mobile || (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 2) this.level = 1;
    }
    this.mobile = mobile;
  }
  /**
   * Registra o intervalo real entre quadros (ms) — inclui o tempo de GPU/composição,
   * que é o gargalo nos celulares. A meta acompanha a taxa da tela (60/90/120 Hz).
   */
  sample(ms: number) {
    if (!(ms > 0)) return;
    this.frame++;
    const v = Math.min(200, ms);
    if (v < this.base) this.base += (v - this.base) * 0.2; else this.base += (Math.min(v, 16.7) - this.base) * 0.002;
    this.avg += (v - this.avg) * 0.05;
    if (this.frame < 90) return; // ignora o aquecimento (carregamento de imagens, JIT)
    if (this.avg > this.base * 1.45 && this.level > 0) { this.level--; this.avg = this.base; this.calm = 0; }
    else if (this.avg < this.base * 1.12) { if (++this.calm > 900 && this.level < (this.mobile ? 1 : 2)) { this.level++; this.calm = 0; } }
    else this.calm = 0;
  }
  /** No nível 0 desenha um quadro sim, outro não (a lógica continua a cada quadro). */
  private tick = 0;
  shouldRender() { this.tick++; return this.level > 0 || this.tick % 2 === 0; }
  /** Quadro em que efeitos caros são recalculados; nos outros, o resultado em cache é reaproveitado. */
  heavyFx() { return this.frame % (this.level >= 2 ? 3 : this.level === 1 ? 5 : 8) === 0; }
  /** Intervalo de atualização do painel (ms): mais espaçado em aparelhos fracos. */
  hudEvery() { return this.level >= 2 ? 1 : this.level === 1 ? 2 : 3; }
  /** Limite de partículas vivas. */
  maxParticles() { return this.level >= 2 ? 600 : this.level === 1 ? 320 : 160; }
}
