// Arte procedural animada das novas criaturas (foes.ts). Desenhada na origem já transladada
// pelo drawEnemy (pés em y=0). Só fillRect/arc simples: barato até em celulares fracos.
import type { FoeKind } from './foes';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const dot = (c: Ctx, x: number, y: number, r: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };

/** Halo aditivo leve (sem gradiente): dois círculos translúcidos. */
function halo(c: Ctx, x: number, y: number, r: number, col: string, a: number) {
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = a * 0.35; dot(c, x, y, r, col);
  c.globalAlpha = a * 0.6; dot(c, x, y, r * 0.5, col);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}

export function drawFoe(c: Ctx, kind: FoeKind, t: number, dir: number, flash: boolean, tint?: string) {
  const F = (col: string) => (flash ? '#ffffff' : col);
  const fx = dir === 1 ? -1 : 1;
  const bob = Math.sin(t * 6);
  switch (kind) {
    case 'lanternmoth': {
      const y = -16 + bob * 2.5, flap = Math.abs(Math.sin(t * 14));
      const wing = tint ?? '#7d6aa8';
      for (const s of [-1, 1]) {
        c.fillStyle = F(wing);
        c.beginPath(); c.moveTo(0, y - 2); c.lineTo(s * (4 + flap * 8), y - 8 - flap * 3); c.lineTo(s * (3 + flap * 7), y + 1); c.closePath(); c.fill();
        c.fillStyle = F('#b9a6e6');
        c.beginPath(); c.moveTo(0, y); c.lineTo(s * (3 + flap * 5), y + 5); c.lineTo(s * 1.5, y + 3); c.closePath(); c.fill();
        dot(c, s * (3 + flap * 5), y - 4, 1, F('#ffe6a0'));
      }
      px(c, -1, y - 5, 2, 8, F('#3a2f4a'));
      px(c, -2, y - 7, 1, 3, '#3a2f4a'); px(c, 1, y - 7, 1, 3, '#3a2f4a');
      const pulse = 0.7 + Math.sin(t * 5) * 0.3;
      halo(c, 0, y + 6, 7, '#ffb84a', pulse);
      dot(c, 0, y + 6, 2.4, F('#ffe08a'));
      px(c, -1, y - 4, 1, 1, '#ffef9a'); px(c, 0, y - 4, 1, 1, '#ffef9a');
      break;
    }
    case 'thornback': {
      const roll = (t * 9) % TAU, rolling = Math.sin(t * 1.3) > 0.4;
      const body = tint ?? '#7a5434';
      if (rolling) {
        dot(c, 0, -6, 6, F(body));
        for (let i = 0; i < 9; i++) {
          const a = roll + (i * TAU) / 9;
          c.strokeStyle = F('#d8c08a'); c.lineWidth = 1.2; c.beginPath();
          c.moveTo(Math.cos(a) * 5, -6 + Math.sin(a) * 5); c.lineTo(Math.cos(a) * 9, -6 + Math.sin(a) * 9); c.stroke();
        }
      } else {
        c.fillStyle = F(body); c.beginPath(); c.ellipse(0, -5, 8, 5, 0, Math.PI, TAU); c.fill(); px(c, -8, -5, 16, 2, F(body));
        for (let i = 0; i < 7; i++) {
          const a = Math.PI + 0.2 + (i * (Math.PI - 0.4)) / 6, w = Math.sin(t * 8 + i) * 0.6;
          c.strokeStyle = F('#e2cc96'); c.lineWidth = 1.2; c.beginPath();
          c.moveTo(Math.cos(a) * 6, -5 + Math.sin(a) * 4); c.lineTo(Math.cos(a) * (10 + w), -5 + Math.sin(a) * (8 + w)); c.stroke();
        }
        px(c, fx * 6, -6, fx * 4, 3, F('#c8a07a')); px(c, fx * 9, -6, 1, 1, '#1a1010');
        px(c, -5, -3, 2, 3, F('#4a3020')); px(c, 3, -3, 2, 3, F('#4a3020'));
      }
      break;
    }
    case 'cogsentinel': {
      const metal = tint ?? '#8a7a5a', g1 = t * 2.2, scan = Math.sin(t * 1.6) * 3;
      px(c, -4, -5, 3, 5, F('#4a4232')); px(c, 1, -5, 3, 5, F('#4a4232'));
      px(c, -6, -17, 12, 12, F(metal)); px(c, -6, -17, 12, 2, F('#b8a878')); px(c, -6, -7, 12, 2, F('#5a5038'));
      for (const [gx, gy, r, sp] of [[-7, -13, 4, 1], [7, -10, 3, -1.4]] as const) {
        c.save(); c.translate(gx, gy); c.rotate(g1 * sp);
        dot(c, 0, 0, r, F('#c89a40'));
        c.fillStyle = F('#c89a40'); for (let i = 0; i < 6; i++) { c.rotate(TAU / 6); c.fillRect(-0.8, -r - 1.5, 1.6, 2); }
        dot(c, 0, 0, r * 0.35, '#3a3020'); c.restore();
      }
      px(c, -4, -14, 8, 4, '#201810');
      halo(c, scan, -12, 3, '#ff5030', 0.9);
      px(c, Math.round(scan) - 1, -13, 2, 2, '#ffd0a0');
      px(c, -1, -21, 2, 4, F('#6a5a3a')); dot(c, 0, -22, 1.3, Math.sin(t * 6) > 0 ? '#ff8040' : '#702010');
      break;
    }
    case 'inkling': {
      const ink = tint ?? '#1c1838';
      for (let i = 0; i < 5; i++) {
        const x = -6 + i * 3, len = 4 + Math.sin(t * 5 + i * 1.7) * 2;
        px(c, x, -4, 2, len, F(ink)); dot(c, x + 1, -4 + len, 1, F('#2c2858'));
      }
      c.fillStyle = F(ink); c.beginPath(); c.ellipse(0, -9 + bob, 8 + Math.sin(t * 3) * 0.8, 7 - Math.sin(t * 3) * 0.6, 0, 0, TAU); c.fill();
      c.globalAlpha = 0.5; dot(c, -3, -12 + bob, 2, F('#5a50a0')); c.globalAlpha = 1;
      const blink = Math.sin(t * 0.9) > 0.95;
      dot(c, fx * 2, -10 + bob, 3, '#f0ecff'); if (!blink) dot(c, fx * 3, -10 + bob, 1.4, '#1a1030'); else px(c, fx * 2 - 3, -10 + bob, 6, 1, '#1a1030');
      for (let i = 0; i < 3; i++) { const d = (t * 1.5 + i / 3) % 1; c.globalAlpha = 1 - d; dot(c, -4 + i * 4, -2 + d * 6, 1, '#3a3070'); }
      c.globalAlpha = 1;
      break;
    }
    case 'geodecrab': {
      const open = Math.sin(t * 1.4) > -0.2, k = open ? 1 : 0.3;
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
        const lg = Math.sin(t * 10 + i + (s > 0 ? 1 : 0)) * 1.2 * k;
        px(c, s * (5 + i * 2), -3 + lg, s * 3, 1, F('#a05040'));
      }
      c.fillStyle = F(tint ?? '#6a5a70'); c.beginPath(); c.ellipse(0, -8, 9, 7, 0, Math.PI, TAU); c.fill(); px(c, -9, -8, 18, 4, F('#5a4a60'));
      const crystals = ['#b890ff', '#90e0ff', '#ff9ad8', '#c8a8ff'];
      for (let i = 0; i < 4; i++) {
        const x = -5 + i * 3.3, hgt = 4 + (i % 2) * 3;
        c.fillStyle = F(crystals[i]); c.beginPath(); c.moveTo(x - 1.6, -10); c.lineTo(x, -10 - hgt); c.lineTo(x + 1.6, -10); c.fill();
      }
      const glint = (t * 0.7) % 1; if (glint < 0.25) { c.globalAlpha = 1 - glint * 4; px(c, -5 + glint * 40, -15, 1, 3, '#ffffff'); c.globalAlpha = 1; }
      if (open) {
        for (const s of [-1, 1]) { const snap = Math.abs(Math.sin(t * 4)) * 2; px(c, s * 9, -9, s * 3, 3, F('#c06050')); px(c, s * 11, -11 - snap, s * 2, 2, F('#d07060')); }
        px(c, -3, -7, 1, 2, '#101010'); px(c, 2, -7, 1, 2, '#101010');
      } else halo(c, 0, -10, 9, '#a080ff', 0.5);
      break;
    }
    case 'stormkite': {
      const y = -18 + bob * 3, wave = Math.sin(t * 4) * 0.25;
      c.save(); c.translate(0, y); c.rotate(wave * 0.4);
      c.fillStyle = F(tint ?? '#4a6a9a'); c.beginPath(); c.moveTo(0, -6); c.lineTo(11 + Math.sin(t * 7) * 2, 0); c.lineTo(0, 4); c.lineTo(-11 - Math.sin(t * 7) * 2, 0); c.closePath(); c.fill();
      c.fillStyle = F('#8ab4e0'); c.beginPath(); c.moveTo(0, -4); c.lineTo(6, 0); c.lineTo(0, 2); c.lineTo(-6, 0); c.closePath(); c.fill();
      px(c, -3, -1, 2, 1, '#eaffff'); px(c, 1, -1, 2, 1, '#eaffff');
      c.restore();
      c.strokeStyle = '#d8f0ff'; c.lineWidth = 1; c.beginPath(); let lx = 0, ly = y + 4; c.moveTo(lx, ly);
      for (let i = 1; i <= 5; i++) { lx = Math.sin(t * 9 + i * 1.3) * 3 * i * 0.5; ly = y + 4 + i * 3; c.lineTo(lx, ly); }
      c.stroke();
      if (Math.sin(t * 13) > 0.6) halo(c, lx, ly, 5, '#a0d8ff', 1);
      break;
    }
    case 'bonepiper': {
      const bone = tint ?? '#e4dcc4', sway = Math.sin(t * 3) * 1;
      px(c, -3, -7, 1, 7, F(bone)); px(c, 2, -7, 1, 7, F(bone));
      px(c, -4, -9, 8, 2, F('#c8bfa4'));
      for (let i = 0; i < 4; i++) px(c, -3, -17 + i * 2 + sway * 0.3, 6, 1, F(bone));
      px(c, -1, -18, 2, 10, F('#c8bfa4'));
      c.fillStyle = F('#5a3a6a'); c.beginPath(); c.moveTo(-6, -20); c.lineTo(6, -20); c.lineTo(4 + sway, -6); c.lineTo(-4 + sway, -6); c.closePath(); c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
      dot(c, 0, -23 + sway * 0.4, 4, F(bone));
      px(c, -2, -24 + sway * 0.4, 1, 2, '#5020a0'); px(c, 1, -24 + sway * 0.4, 1, 2, '#5020a0');
      px(c, fx * 2, -21, fx * 8, 1, F('#a89060')); for (let i = 0; i < 3; i++) px(c, fx * (4 + i * 2), -21, 1, 1, '#3a2a10');
      for (let i = 0; i < 3; i++) {
        const d = (t * 0.6 + i / 3) % 1, nx = fx * (10 + d * 8) + Math.sin(t * 4 + i) * 2, ny = -24 - d * 12;
        c.globalAlpha = 1 - d; px(c, nx, ny, 2, 2, '#e8d0ff'); px(c, nx + 1, ny - 3, 1, 3, '#e8d0ff'); c.globalAlpha = 1;
      }
      break;
    }
    case 'emberfox': {
      const fur = tint ?? '#d8602a', run = Math.sin(t * 12) * 1.5;
      for (let i = 0; i < 3; i++) {
        const a = -fx * (0.6 + i * 0.35) + Math.sin(t * 6 + i) * 0.25, len = 9 + i;
        const tx = -fx * 6 + Math.sin(a) * len * -1 * fx, ty = -8 - Math.cos(a) * len;
        c.strokeStyle = F(i === 1 ? '#ffb040' : '#ff6a20'); c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-fx * 5, -7); c.quadraticCurveTo(-fx * 9, -12, tx, ty); c.stroke();
        halo(c, tx, ty, 3, '#ffa040', 0.8 + Math.sin(t * 10 + i) * 0.2);
      }
      c.lineCap = 'butt';
      px(c, -4, -3 + run, 2, 3, F('#7a2a10')); px(c, 3, -3 - run, 2, 3, F('#7a2a10'));
      c.fillStyle = F(fur); c.beginPath(); c.ellipse(0, -7, 7, 4, 0, 0, TAU); c.fill();
      px(c, -4, -6, 8, 2, F('#ffd0a0'));
      c.fillStyle = F(fur); c.beginPath(); c.moveTo(fx * 4, -12); c.lineTo(fx * 11, -9); c.lineTo(fx * 4, -7); c.fill();
      px(c, fx * 4, -15, fx * 2, 3, F(fur)); px(c, fx * 7, -14, fx * 2, 2, F(fur));
      px(c, fx * 7, -11, 1, 1, '#fff2a0'); px(c, fx * 11, -9, 1, 1, '#200a04');
      break;
    }
    case 'mirrorshade': {
      const glass = tint ?? '#b8d8ff', y = -14 + bob * 1.5;
      c.globalAlpha = 0.8;
      c.fillStyle = F(glass); c.beginPath(); c.moveTo(0, y - 10); c.lineTo(5, y - 2); c.lineTo(3, y + 10); c.lineTo(-3, y + 10); c.lineTo(-5, y - 2); c.closePath(); c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-2, y - 6); c.lineTo(1, y); c.lineTo(-1, y + 6); c.moveTo(1, y); c.lineTo(4, y + 2); c.stroke();
      px(c, -2, y - 5, 1, 2, '#2a1050'); px(c, 1, y - 5, 1, 2, '#2a1050');
      for (let i = 0; i < 5; i++) {
        const a = t * 2.2 + (i * TAU) / 5, r = 10 + Math.sin(t * 3 + i) * 2;
        c.save(); c.translate(Math.cos(a) * r, y + Math.sin(a) * r * 0.45); c.rotate(a * 3);
        c.fillStyle = F(i % 2 ? '#e8f4ff' : '#90b8f0'); c.beginPath(); c.moveTo(0, -2.5); c.lineTo(1.5, 1.5); c.lineTo(-1.5, 1.5); c.fill(); c.restore();
      }
      if (Math.sin(t * 2.7) > 0.85) halo(c, 0, y, 9, '#c8e0ff', 0.8);
      break;
    }
    case 'bloomjaw': {
      const snap = Math.max(0, Math.sin(t * 3)), sway = Math.sin(t * 1.8) * 2;
      for (const s of [-1, 1]) { c.fillStyle = F('#3a8a3a'); c.beginPath(); c.ellipse(s * 6, -2, 5, 2, s * 0.4, 0, TAU); c.fill(); }
      c.strokeStyle = F('#2e7a2e'); c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sway * 2, -7, sway, -12); c.stroke();
      const hx = sway, hy = -15, petal = tint ?? '#d83a6a';
      for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6 + t * 0.3; dot(c, hx + Math.cos(a) * 6, hy + Math.sin(a) * 5, 3, F(petal)); }
      c.fillStyle = F('#7a1030'); c.beginPath(); c.ellipse(hx, hy, 5, 2 + snap * 3, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff4e0'; for (let i = 0; i < 4; i++) { const x = hx - 3 + i * 2; c.beginPath(); c.moveTo(x, hy - 2 - snap * 3); c.lineTo(x + 1, hy - snap); c.lineTo(x + 2, hy - 2 - snap * 3); c.fill(); }
      c.fillStyle = '#fff4e0'; for (let i = 0; i < 4; i++) { const x = hx - 3 + i * 2; c.beginPath(); c.moveTo(x, hy + 2 + snap * 3); c.lineTo(x + 1, hy + snap); c.lineTo(x + 2, hy + 2 + snap * 3); c.fill(); }
      if (snap > 0.9) { c.globalAlpha = 0.7; dot(c, hx + 3, hy + 6, 1, '#b6ff5a'); c.globalAlpha = 1; }
      break;
    }
    case 'frostwyrm': {
      const scale = tint ?? '#8ac8e8';
      for (let i = 5; i >= 0; i--) {
        const x = -fx * i * 3.2, y = -6 + Math.sin(t * 5 - i * 0.9) * 2.5, r = 4.2 - i * 0.45;
        dot(c, x, y, r, F(i % 2 ? scale : '#a8dcf4'));
        if (i % 2 === 0) { c.fillStyle = F('#e8faff'); c.beginPath(); c.moveTo(x - 1, y - r); c.lineTo(x, y - r - 2.5); c.lineTo(x + 1, y - r); c.fill(); }
      }
      const hy = -8 + Math.sin(t * 5 + 0.9) * 2.5;
      c.fillStyle = F(scale); c.beginPath(); c.ellipse(fx * 4, hy, 5, 3.6, 0, 0, TAU); c.fill();
      px(c, fx * 2, hy - 5, fx * 1, 3, F('#e8faff')); px(c, fx * 5, hy - 5, fx * 1, 3, F('#e8faff'));
      px(c, fx * 5, hy - 1, 1, 1, '#103050');
      for (let i = 0; i < 3; i++) { const d = (t * 1.4 + i / 3) % 1; c.globalAlpha = (1 - d) * 0.7; dot(c, fx * (9 + d * 8), hy + 1 - d * 2, 1 + d * 2, '#e0f8ff'); }
      c.globalAlpha = 1;
      break;
    }
    case 'dunewyrm': {
      const up = Math.max(0, Math.sin(t * 1.1)), sand = '#d8b878';
      c.fillStyle = F('#c4a060'); c.beginPath(); c.ellipse(0, -1, 9, 3.4, 0, Math.PI, TAU); c.fill();
      for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6; px(c, Math.cos(a) * 9, -1 - Math.abs(Math.sin(a)) * 3, 1, 1, sand); }
      if (up > 0.15) {
        const h = up * 16, body = tint ?? '#a87850';
        for (let i = 0; i < 4; i++) { const y = -2 - (i * h) / 4, w = 5 - i * 0.4 + Math.sin(t * 6 + i) * 0.4; px(c, -w, y - h / 4, w * 2, h / 4 + 0.5, F(i % 2 ? body : '#c09068')); }
        const hy = -2 - h;
        c.fillStyle = F('#3a1a10'); c.beginPath(); c.arc(0, hy, 4, 0, TAU); c.fill();
        c.fillStyle = '#fff0d0'; for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8 + t; c.fillRect(Math.cos(a) * 3 - 0.5, hy + Math.sin(a) * 3 - 0.5, 1, 1); }
        halo(c, 0, hy, 3, '#ff7040', 0.4 * up);
      }
      break;
    }
  }
}
