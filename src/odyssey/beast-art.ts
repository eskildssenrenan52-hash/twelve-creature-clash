// Desenho animado das 100 criaturas do Abismo. Cada arquétipo tem anatomia própria,
// e cada criatura combina paleta, olhos, chifres, aura e membros diferentes.
import type { Beast } from './bestiary';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

function glow(c: Ctx, x: number, y: number, r: number, col: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1;
}
function blob(c: Ctx, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient) {
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
}
function shade(c: Ctx, x: number, y: number, r: number, light: string, dark: string) {
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, light); g.addColorStop(1, dark); return g;
}
function eyesRow(c: Ctx, b: Beast, x: number, y: number, spread: number, t: number, size = 1.3) {
  const n = b.eyes, blink = Math.sin(t * 1.7 + b.id) > 0.96 ? 0.2 : 1;
  for (let i = 0; i < n; i++) {
    const ex = x + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread), ey = y + (i % 2 ? -1 : 0) * (n > 2 ? 1 : 0);
    glow(c, ex, ey, size * 3, b.glow, 0.55);
    blob(c, ex, ey, size, size * blink, b.glow);
    blob(c, ex + 0.2, ey, size * 0.4, size * 0.45 * blink, '#ffffff');
  }
}
function horns(c: Ctx, b: Beast, x: number, y: number, w: number) {
  if (!b.horns) return;
  c.fillStyle = b.accent;
  for (const s of [-1, 1]) {
    c.beginPath();
    if (b.horns === 1) { c.moveTo(x + s * w * 0.4, y); c.quadraticCurveTo(x + s * w * 0.9, y - 5, x + s * w * 0.6, y - 9); c.lineTo(x + s * w * 0.25, y); }
    else if (b.horns === 2) { c.moveTo(x + s * w * 0.3, y); c.lineTo(x + s * w * 0.35, y - 8); c.lineTo(x + s * w * 0.55, y - 3); c.lineTo(x + s * w * 0.6, y - 6); c.lineTo(x + s * w * 0.7, y); }
    else { c.moveTo(x + s * w * 0.2, y); c.bezierCurveTo(x + s * w * 1.2, y - 2, x + s * w * 1.1, y - 10, x + s * w * 0.5, y - 7); c.lineTo(x + s * w * 0.4, y); }
    c.closePath(); c.fill();
  }
}
function aura(c: Ctx, b: Beast, y: number, t: number, r: number) {
  c.save();
  if (b.aura === 0) for (let i = 0; i < 5; i++) { const a = t * 1.3 + (i * TAU) / 5; glow(c, Math.cos(a) * r, y + Math.sin(a) * r * 0.45, 2.4, b.glow, 0.9); }
  else if (b.aura === 1) { c.strokeStyle = b.glow; c.lineWidth = 0.8; c.globalAlpha = 0.45 + Math.sin(t * 3) * 0.2; c.beginPath(); c.ellipse(0, y, r, r * 0.38, 0, 0, TAU); c.stroke(); c.globalAlpha = 0.25; c.beginPath(); c.ellipse(0, y, r * 1.25, r * 0.48, 0, t % TAU, t % TAU + 4); c.stroke(); }
  else if (b.aura === 2) for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i / 4) % 1; c.globalAlpha = 1 - p; c.fillStyle = b.glow; c.fillRect(Math.sin(i * 2.3 + b.id) * r * 0.8, y + r * 0.4 - p * r * 1.6, 1.4, 1.4); }
  else { c.globalAlpha = 0.6; c.fillStyle = b.accent; for (let i = 0; i < 3; i++) { const a = -t * 0.9 + (i * TAU) / 3; c.save(); c.translate(Math.cos(a) * r, y + Math.sin(a) * r * 0.4); c.rotate(a * 2); c.fillRect(-1.5, -1.5, 3, 3); c.restore(); } }
  c.restore();
}

export function drawBeast(c: Ctx, b: Beast, x: number, y: number, t: number, dir: number, flash: boolean, scale = 1) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(scale * (dir === 1 ? -1 : 1), scale);
  const W = flash ? '#ffffff' : b.body, A = flash ? '#ffffff' : b.accent;
  const s1 = Math.sin(t * 4), s2 = Math.sin(t * 8), hover = Math.sin(t * 2.6) * 1.6;
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 0, 8, 2.6, 0, 0, TAU); c.fill();
  switch (b.arch) {
    case 'wisp': {
      const y0 = -14 + hover;
      glow(c, 0, y0, 14, b.glow, 0.45);
      c.fillStyle = shade(c, 0, y0, 7, A, W);
      c.beginPath(); c.moveTo(-6, y0);
      c.bezierCurveTo(-7, y0 - 9, 7, y0 - 9, 6, y0);
      for (let i = 3; i >= -3; i--) c.lineTo(i * 2, y0 + 7 + Math.sin(t * 7 + i) * 2.5);
      c.closePath(); c.fill();
      eyesRow(c, b, 0, y0 - 1, 6, t); aura(c, b, y0, t, 10); break;
    }
    case 'jelly': {
      const y0 = -16 + hover, pulse = 1 + s1 * 0.08;
      glow(c, 0, y0, 15, b.glow, 0.35);
      c.strokeStyle = A; c.lineWidth = 1;
      for (let i = 0; i < b.limbs + 3; i++) { const lx = -6 + (i * 12) / (b.limbs + 2); c.beginPath(); c.moveTo(lx, y0 + 2); c.quadraticCurveTo(lx + Math.sin(t * 3 + i) * 4, y0 + 8, lx + Math.sin(t * 3 + i + 1) * 3, y0 + 14); c.stroke(); }
      c.globalAlpha = 0.85; c.fillStyle = shade(c, 0, y0, 9, b.glow, W);
      c.beginPath(); c.ellipse(0, y0, 9 * pulse, 7 / pulse, 0, Math.PI, 0); c.lineTo(9 * pulse, y0 + 2); c.lineTo(-9 * pulse, y0 + 2); c.fill(); c.globalAlpha = 1;
      blob(c, 0, y0 - 2, 4, 2.5, A);
      eyesRow(c, b, 0, y0 - 2, 8, t, 1.1); aura(c, b, y0, t, 12); break;
    }
    case 'eye': {
      const y0 = -15 + hover;
      aura(c, b, y0, t, 13);
      c.strokeStyle = A; c.lineWidth = 1.4;
      for (let i = 0; i < b.limbs + 2; i++) { const a = (i / (b.limbs + 2)) * TAU + t * 0.5; c.beginPath(); c.moveTo(Math.cos(a) * 7, y0 + Math.sin(a) * 7); c.quadraticCurveTo(Math.cos(a + 0.4) * 12, y0 + Math.sin(a + 0.4) * 12, Math.cos(a + 0.2 * s1) * 14, y0 + Math.sin(a + 0.2 * s1) * 13); c.stroke(); }
      blob(c, 0, y0, 8, 8, shade(c, 0, y0, 8, A, W));
      const lx = Math.sin(t * 0.9) * 2.5, ly = Math.cos(t * 1.3) * 1.5;
      blob(c, lx, y0 + ly, 5.5, 5.5, '#f8f0e8');
      glow(c, lx, y0 + ly, 6, b.glow, 0.6); blob(c, lx, y0 + ly, 3.2, 3.2, b.glow); blob(c, lx, y0 + ly, 1.5, 2.6, '#0a0a12'); blob(c, lx - 1, y0 + ly - 1.2, 0.8, 0.8, '#fff');
      horns(c, b, 0, y0 - 6, 10); break;
    }
    case 'moth': {
      const y0 = -15 + hover, flap = Math.abs(Math.sin(t * 9));
      glow(c, 0, y0, 14, b.glow, 0.3);
      for (const s of [-1, 1]) {
        c.save(); c.scale(s * (0.35 + flap * 0.65), 1);
        c.fillStyle = shade(c, 6, y0 - 3, 9, b.glow, A);
        c.beginPath(); c.moveTo(0, y0); c.bezierCurveTo(6, y0 - 12, 15, y0 - 9, 12, y0 - 1); c.bezierCurveTo(14, y0 + 4, 8, y0 + 8, 0, y0 + 2); c.fill();
        blob(c, 7, y0 - 4, 2.2, 2.2, W); blob(c, 7, y0 - 4, 1, 1, b.glow); c.restore();
      }
      blob(c, 0, y0 + 1, 2.2, 6, W);
      c.strokeStyle = A; c.lineWidth = 0.7; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, y0 - 4); c.quadraticCurveTo(s * 3, y0 - 9, s * 5, y0 - 9); c.stroke(); }
      eyesRow(c, b, 0, y0 - 3, 3, t, 0.8); aura(c, b, y0, t, 10); break;
    }
    case 'bell': {
      const y0 = -16 + hover, sw = Math.sin(t * 3) * 0.25;
      glow(c, 0, y0, 14, b.glow, 0.35);
      c.save(); c.translate(0, y0 - 8); c.rotate(sw);
      c.fillStyle = shade(c, 0, 6, 9, A, W);
      c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-5, 4, -6, 9); c.quadraticCurveTo(-9, 13, -9, 14); c.lineTo(9, 14); c.quadraticCurveTo(9, 13, 6, 9); c.quadraticCurveTo(5, 4, 3, 0); c.closePath(); c.fill();
      c.fillStyle = A; c.fillRect(-9, 12.5, 18, 1.5); c.fillRect(-1, -3, 2, 3);
      blob(c, Math.sin(t * 3 + 1) * 3, 15.5, 2, 2, b.glow);
      eyesRow(c, b, 0, 7, 7, t, 1); c.restore();
      if (Math.sin(t * 3) > 0.9) { c.strokeStyle = b.glow; c.globalAlpha = 0.5; c.beginPath(); c.arc(0, y0, 13, 0, TAU); c.stroke(); c.globalAlpha = 1; }
      aura(c, b, y0, t, 12); break;
    }
    case 'mask': {
      const y0 = -16 + hover;
      aura(c, b, y0, t, 12);
      c.fillStyle = 'rgba(10,6,20,0.7)'; c.beginPath(); c.moveTo(-7, y0); for (let i = -3; i <= 3; i++) c.lineTo(i * 2.3, y0 + 10 + Math.sin(t * 6 + i) * 2); c.lineTo(7, y0); c.fill();
      c.fillStyle = shade(c, 0, y0 - 2, 9, A, W);
      c.beginPath(); c.moveTo(0, y0 - 11); c.bezierCurveTo(9, y0 - 10, 9, y0 + 2, 0, y0 + 7); c.bezierCurveTo(-9, y0 + 2, -9, y0 - 10, 0, y0 - 11); c.fill();
      c.strokeStyle = b.glow; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, y0 - 10); c.lineTo(0, y0 + 6); c.stroke();
      c.fillStyle = '#05030a'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 3.3, y0 - 3, 2.2, 1.3, s * 0.3, 0, TAU); c.fill(); }
      glow(c, -3.3, y0 - 3, 3, b.glow, 0.9); glow(c, 3.3, y0 - 3, 3, b.glow, 0.9);
      c.fillStyle = '#05030a'; c.beginPath(); c.ellipse(0, y0 + 3, 2, 0.8 + Math.abs(s1) * 0.8, 0, 0, TAU); c.fill();
      horns(c, b, 0, y0 - 9, 9); break;
    }
    case 'hound': {
      const run = s2 * 2;
      c.fillStyle = W;
      for (const [lx, ph] of [[-5, 0], [-2, 1], [3, 1], [6, 0]] as const) { const o = ph ? run : -run; c.fillRect(lx + o * 0.5, -6, 2, 6); }
      c.fillStyle = shade(c, 0, -9, 9, A, W);
      c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(-2, -13, 6, -11); c.lineTo(8, -6); c.quadraticCurveTo(0, -4, -8, -6); c.fill();
      c.strokeStyle = A; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(-13, -10 + s1 * 2, -14, -14 + s1 * 2); c.stroke();
      c.fillStyle = shade(c, 9, -13, 5, A, W);
      c.beginPath(); c.moveTo(5, -10); c.lineTo(8, -16); c.lineTo(10, -13); c.lineTo(14, -12); c.lineTo(13, -9); c.lineTo(6, -8); c.fill();
      for (let i = 0; i < 3; i++) { c.fillStyle = b.glow; c.globalAlpha = 0.6; c.fillRect(-6 + i * 4, -12 - (i % 2), 1.5, 2); } c.globalAlpha = 1;
      eyesRow(c, { ...b, eyes: Math.min(3, b.eyes) }, 10, -13, 2, t, 0.8); aura(c, b, -9, t, 11); break;
    }
    case 'serpent': {
      const pts: [number, number][] = [];
      for (let i = 0; i < 14; i++) pts.push([-10 + i * 1.5, -4 - Math.sin(t * 5 - i * 0.6) * 2.5 - (i > 9 ? (i - 9) * 2.4 : 0)]);
      for (let i = 0; i < pts.length; i++) { const [px, py] = pts[i]!, r = 1.4 + i * 0.18; blob(c, px, py, r, r, i % 3 === 0 ? A : W); if (i % 2) { c.fillStyle = b.glow; c.globalAlpha = 0.5; c.fillRect(px - 0.5, py - r, 1, 1); c.globalAlpha = 1; } }
      const [hx, hy] = pts[pts.length - 1]!;
      blob(c, hx + 2, hy - 1, 4.5, 3.5, shade(c, hx + 2, hy - 1, 4.5, A, W));
      horns(c, b, hx + 2, hy - 2, 6);
      if (Math.sin(t * 2) > 0.5) { c.strokeStyle = '#ff4060'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(hx + 6, hy); c.lineTo(hx + 9, hy - 0.5); c.lineTo(hx + 10, hy - 1.5); c.moveTo(hx + 9, hy - 0.5); c.lineTo(hx + 10, hy + 0.5); c.stroke(); }
      eyesRow(c, { ...b, eyes: Math.min(2, b.eyes) }, hx + 3, hy - 2, 2.5, t, 0.8); aura(c, b, -8, t, 11); break;
    }
    case 'spider': {
      const y0 = -8 + Math.abs(s2) * 0.6;
      c.strokeStyle = W; c.lineWidth = 1.1;
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
        const ph = Math.sin(t * 10 + i * 1.6 + (s > 0 ? 0 : Math.PI)) * 1.5, kx = s * (6 + i * 1.2), ky = y0 - 5 - i * 0.5;
        c.beginPath(); c.moveTo(s * 2, y0 - 1 + i * 0.8); c.lineTo(kx, ky + ph); c.lineTo(s * (9 + i * 1.6), -0.5); c.stroke();
      }
      blob(c, -4, y0 - 1, 6, 5, shade(c, -4, y0 - 1, 6, A, W));
      c.fillStyle = b.glow; c.globalAlpha = 0.8; c.beginPath(); c.moveTo(-4, y0 - 4); c.lineTo(-2.5, y0 - 1); c.lineTo(-4, y0 + 2); c.lineTo(-5.5, y0 - 1); c.fill(); c.globalAlpha = 1;
      blob(c, 3, y0 - 1, 3.5, 3, W);
      eyesRow(c, { ...b, eyes: Math.max(2, b.eyes) }, 4, y0 - 2, 3, t, 0.6);
      if (b.aura % 2 === 0) { c.strokeStyle = b.glow; c.globalAlpha = 0.35; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-4, y0 - 6); c.lineTo(-4, -30); c.stroke(); c.globalAlpha = 1; }
      break;
    }
    case 'worm': {
      for (let i = 0; i < 8; i++) {
        const k = i / 7, px = -10 + i * 2.6, py = -3 - Math.max(0, Math.sin(t * 4 - i * 0.7)) * 3 - k * k * 8;
        blob(c, px, py, 3 + k * 1.6, 3 + k * 1.6, shade(c, px, py, 3.5, i % 2 ? A : W, W));
        c.fillStyle = b.glow; c.globalAlpha = 0.4; c.fillRect(px - 0.5, py - 2, 1, 1); c.globalAlpha = 1;
      }
      const hx = 8.2, hy = -14 - Math.max(0, Math.sin(t * 4 - 4.9)) * 3, open = 1.5 + Math.abs(s1) * 2;
      c.fillStyle = '#1a0510'; c.beginPath(); c.ellipse(hx + 3, hy, 2, open, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff8e0'; for (let i = -1; i <= 1; i++) c.fillRect(hx + 2.5, hy + i * open * 0.6, 1.2, 0.8);
      glow(c, hx + 3, hy, 4, b.glow, 0.5); eyesRow(c, { ...b, eyes: Math.min(3, b.eyes) }, hx, hy - 3, 3, t, 0.7); break;
    }
    case 'crab': {
      const y0 = -7 + Math.abs(s2) * 0.5, snap = Math.max(0, Math.sin(t * 3)) * 0.6;
      c.strokeStyle = W; c.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const ph = Math.sin(t * 9 + i + s) * 1.2; c.beginPath(); c.moveTo(s * 4, y0 + 1); c.lineTo(s * (8 + i), y0 - 2 + ph); c.lineTo(s * (9 + i * 1.5), 0); c.stroke(); }
      for (const s of [-1, 1]) { c.save(); c.translate(s * 9, y0 - 6); c.fillStyle = A; c.beginPath(); c.ellipse(0, 0, 3.4, 2.4, 0, 0, TAU); c.fill(); c.rotate(s * snap); c.beginPath(); c.moveTo(0, -1); c.lineTo(s * 4, -3); c.lineTo(s * 2, 0); c.fill(); c.restore(); }
      c.fillStyle = shade(c, 0, y0 - 3, 8, A, W);
      c.beginPath(); c.moveTo(-8, y0); c.quadraticCurveTo(-8, y0 - 9, 0, y0 - 9); c.quadraticCurveTo(8, y0 - 9, 8, y0); c.closePath(); c.fill();
      c.fillStyle = b.glow; c.globalAlpha = 0.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-4 + i * 4, y0 - 4, 1, 0, TAU); c.fill(); } c.globalAlpha = 1;
      horns(c, b, 0, y0 - 8, 7); eyesRow(c, { ...b, eyes: Math.min(2, b.eyes) }, 0, y0 - 11, 4, t, 0.9); break;
    }
    case 'hand': {
      const y0 = -10 + Math.sin(t * 2) * 1.2;
      glow(c, 0, y0, 13, b.glow, 0.25);
      c.fillStyle = shade(c, 0, y0 + 2, 7, A, W);
      c.beginPath(); c.roundRect(-5, y0 - 2, 10, 9, 3); c.fill(); c.fillRect(-3, y0 + 6, 6, 4);
      for (let i = 0; i < 4; i++) {
        const fx = -4.2 + i * 2.8, curl = Math.sin(t * 5 + i * 0.8) * 2, len = 6 + (i === 1 || i === 2 ? 2 : 0);
        c.strokeStyle = W; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, y0 - 1); c.quadraticCurveTo(fx, y0 - len * 0.6, fx + curl * 0.5, y0 - len + Math.abs(curl) * 0.5); c.stroke();
        blob(c, fx + curl * 0.5, y0 - len + Math.abs(curl) * 0.5, 0.8, 0.8, b.glow);
      }
      c.strokeStyle = W; c.beginPath(); c.moveTo(5, y0 + 3); c.quadraticCurveTo(9, y0 + 1, 8 + s1, y0 - 3); c.stroke(); c.lineCap = 'butt';
      blob(c, 0, y0 + 3, 1.8, 2.2, '#100810'); glow(c, 0, y0 + 3, 3.5, b.glow, 0.9); blob(c, 0, y0 + 3, 0.7, 1.1, b.glow);
      aura(c, b, y0, t, 11); break;
    }
    case 'knight': {
      const step = s2 * 1.2;
      c.fillStyle = W; c.fillRect(-4, -6 + Math.max(0, step), 3, 6); c.fillRect(1, -6 + Math.max(0, -step), 3, 6);
      c.fillStyle = shade(c, 0, -12, 8, A, W);
      c.beginPath(); c.moveTo(-6, -6); c.lineTo(-7, -15); c.lineTo(7, -15); c.lineTo(6, -6); c.closePath(); c.fill();
      c.fillStyle = b.glow; c.globalAlpha = 0.6 + s1 * 0.2; c.beginPath(); c.moveTo(0, -14); c.lineTo(2, -11); c.lineTo(0, -8); c.lineTo(-2, -11); c.fill(); c.globalAlpha = 1;
      blob(c, -7, -14, 2.6, 2, A); blob(c, 7, -14, 2.6, 2, A);
      c.fillStyle = shade(c, 0, -19, 5, A, W); c.beginPath(); c.roundRect(-4, -23, 8, 8, [4, 4, 1, 1]); c.fill();
      c.fillStyle = '#06040a'; c.fillRect(-3, -20, 6, 1.4);
      glow(c, 0, -19.3, 4, b.glow, 0.8);
      horns(c, b, 0, -22, 7);
      c.save(); c.translate(8, -12); c.rotate(-0.6 + Math.sin(t * 2.5) * 0.3); c.fillStyle = A; c.fillRect(-0.8, -12, 1.6, 13); c.fillStyle = b.glow; c.globalAlpha = 0.7; c.fillRect(-0.4, -12, 0.8, 9); c.restore(); c.globalAlpha = 1;
      aura(c, b, -12, t, 12); break;
    }
    case 'shard': {
      const y0 = -14 + hover * 0.6, rot = t * 0.7;
      glow(c, 0, y0, 16, b.glow, 0.35);
      for (let i = 0; i < b.limbs + 1; i++) {
        const a = rot + (i * TAU) / (b.limbs + 1), px = Math.cos(a) * 11, py = y0 + Math.sin(a) * 4;
        c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = i % 2 ? A : b.glow; c.globalAlpha = 0.85;
        c.beginPath(); c.moveTo(0, -3); c.lineTo(1.6, 0); c.lineTo(0, 3); c.lineTo(-1.6, 0); c.fill(); c.restore();
      }
      c.globalAlpha = 1;
      const g = c.createLinearGradient(-7, y0 - 10, 7, y0 + 8); g.addColorStop(0, b.glow); g.addColorStop(0.5, A); g.addColorStop(1, W);
      c.fillStyle = g; c.beginPath(); c.moveTo(0, y0 - 12); c.lineTo(6, y0 - 3); c.lineTo(4, y0 + 8); c.lineTo(-4, y0 + 8); c.lineTo(-6, y0 - 3); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, y0 - 12); c.lineTo(0, y0 + 8); c.moveTo(-6, y0 - 3); c.lineTo(6, y0 - 3); c.stroke();
      eyesRow(c, b, 0, y0 - 1, 6, t, 1); break;
    }
    case 'treant': {
      const sway = Math.sin(t * 1.8) * 0.12;
      c.fillStyle = W; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 2, -5); c.quadraticCurveTo(s * 6, -1, s * 8, 0); c.lineTo(s * 4, 0); c.fill(); }
      c.save(); c.rotate(sway);
      c.fillStyle = shade(c, 0, -12, 9, A, W); c.beginPath(); c.moveTo(-5, -2); c.quadraticCurveTo(-7, -14, -3, -20); c.lineTo(3, -20); c.quadraticCurveTo(7, -14, 5, -2); c.fill();
      c.strokeStyle = W; c.lineWidth = 1.5; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 4, -14); c.quadraticCurveTo(s * 10, -16 + s1 * 2, s * 12, -22 + s1 * 2); c.stroke(); }
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 0.3; blob(c, Math.cos(a) * 7, -22 + Math.sin(a) * 3, 3.6, 3, i % 2 ? A : b.glow); }
      c.fillStyle = '#0a0806'; c.beginPath(); c.ellipse(0, -9, 2.5, 1 + Math.abs(s1), 0, 0, TAU); c.fill();
      eyesRow(c, { ...b, eyes: Math.min(3, b.eyes) }, 0, -14, 4, t, 1); c.restore();
      aura(c, b, -12, t, 12); break;
    }
  }
  c.restore();
}
