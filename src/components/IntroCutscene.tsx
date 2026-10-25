import { useEffect, useRef } from "react";
import { filmGrain, lensGlow, lightMotes, softBloom, splitTone } from "@/odyssey/cinema-fx";
import treesSheet from "@/assets/art/trees-sheet.png";
import propsSheet from "@/assets/art/props-sheet.png";
import { buildTiles, drawChar, drawEnemy, drawStatue } from "@/odyssey/gfx";
import { scaledSprite } from "@/odyssey/world-art";
import { T, TS, hash } from "@/odyssey/world";

// Cena de abertura desenhada ao vivo com os próprios objetos do jogo:
// azulejos do mundo, árvores e objetos das folhas de sprites, personagens e criaturas.
// Oito cenas: o vazio, a Canção criando as terras, os dezessete Ecos, Vael e Gorm,
// o Silêncio, Potos, a jornada do herói e a revelação final.
const VW = 384, VH = 216;
type Ctx = CanvasRenderingContext2D;
const HERO = { skin: "#f4c8a0", hair: "#e8a030", body: "#3a7a4a", legs: "#3a3060", accent: "#ffd040" };
const GORM = { skin: "#f0c8a0", hair: "#e8e8e8", body: "#6a3a9a", legs: "#3a2050" };
const GORM_YOUNG = { skin: "#f0c8a0", hair: "#7a4a20", body: "#6a3a9a", legs: "#3a2050" };
const VAEL = { skin: "#e8d0c0", hair: "#c8c8d8", body: "#5a6a8a", legs: "#303848" };
const GREY = { skin: "#9a9aa2", hair: "#5a5a64", body: "#6a6a74", legs: "#44444c" };
const VILLAGER = [
  { skin: "#f0c090", hair: "#7a4a20", body: "#c05040", legs: "#4a3020" },
  { skin: "#e8b888", hair: "#2a1a10", body: "#4070b0", legs: "#303050" },
  { skin: "#d8a070", hair: "#203040", body: "#2a7a9a", legs: "#183040" },
];
const ECO_COLORS = ["#d9a520", "#e58aa8", "#ef7f8e", "#a98ad4", "#6fc7c0", "#e8c15a", "#8fb6d9", "#58b87a", "#2f8f78", "#d49a3c", "#c0453f", "#b9a0f0", "#7be0c8", "#d98be0", "#e9e5d0", "#8fb2ff", "#9a7aca"];

function load(src: string) { const i = new Image(); i.src = src; return i; }
const ok = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0;
const ease = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };

export function IntroCutscene({ scene }: { scene: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  const startRef = useRef(0);
  if (sceneRef.current !== scene) { sceneRef.current = scene; startRef.current = performance.now(); }

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext("2d"); if (!c) return;
    c.imageSmoothingEnabled = false;
    const tiles = buildTiles();
    const trees = load(treesSheet), props = load(propsSheet);
    startRef.current = performance.now();
    let raf = 0, last = 0;
    const slow = (navigator.hardwareConcurrency ?? 4) <= 2;

    const ground = (pick: (x: number, y: number) => number, top: number, ox = 0) => {
      for (let y = Math.floor(top / TS); y <= VH / TS + 1; y++) for (let x = -1; x <= VW / TS + 1; x++) {
        const gx = x + Math.floor(ox / TS);
        const t = pick(gx, y), v = Math.floor(hash(gx, y, 3) * 4);
        const tile = tiles[t]?.[v]; if (tile) c.drawImage(tile, x * TS - (((ox % TS) + TS) % TS), y * TS);
      }
    };
    const sprite = (img: HTMLImageElement, i: number, x: number, y: number, size: number, alpha = 1) => {
      if (!ok(img)) return;
      c.save(); c.globalAlpha = alpha * .28; c.fillStyle = "#0a1410";
      c.beginPath(); c.ellipse(x + 2, y - 1, size * .32, size * .1, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = alpha; c.drawImage(scaledSprite(img, i, size), Math.round(x - size / 2), Math.round(y - size)); c.restore();
    };
    const sky = (stops: [number, string][]) => {
      const gr = c.createLinearGradient(0, 0, 0, VH); stops.forEach(([o, col]) => gr.addColorStop(o, col));
      c.fillStyle = gr; c.fillRect(-20, -20, VW + 40, VH + 40);
    };
    const stars = (t: number, n = 60, alpha = 1, h = 90) => {
      for (let i = 0; i < n; i++) {
        const x = hash(i, 1, 9) * VW, y = hash(i, 2, 9) * h;
        c.globalAlpha = alpha * (.4 + .6 * Math.abs(Math.sin(t * 1.4 + i)));
        c.fillStyle = i % 7 ? "#fffbe6" : "#f6d18b"; c.fillRect(Math.round(x), Math.round(y), i % 13 ? 1 : 2, i % 13 ? 1 : 2);
      }
      c.globalAlpha = 1;
    };
    const glow = (x: number, y: number, r: number, col: string, a: number) => {
      if (a <= 0 || r <= 0) return;
      const gr = c.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)");
      c.globalAlpha = Math.min(1, a); c.globalCompositeOperation = "lighter"; c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2);
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    };
    const rays = (x: number, y: number, n: number, len: number, t: number, col: string, a: number) => {
      c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const ang = i / n * Math.PI * 2 + t * .15, w = .05 + .04 * Math.sin(t * 2 + i * 3);
        c.globalAlpha = a * (.35 + .35 * Math.sin(t * 1.7 + i));
        c.beginPath(); c.moveTo(x, y);
        c.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len);
        c.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len); c.fill();
      }
      c.restore();
    };
    const notes = (t: number, cx: number, cy: number, n: number, col: string, spread = 70) => {
      for (let i = 0; i < n; i++) {
        const ph = (t * .25 + hash(i, 5, 1)) % 1, a = i / n * Math.PI * 2 + t * .3;
        const x = cx + Math.cos(a) * (30 + ph * spread), y = cy - ph * 120 + Math.sin(a) * 10;
        c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = col;
        c.fillRect(Math.round(x), Math.round(y), 2, 3); c.fillRect(Math.round(x) + 2, Math.round(y) - 4, 1, 5);
      }
      c.globalAlpha = 1;
    };
    const motes = (t: number, n: number, col: string, up = true) => {
      c.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const sp = 8 + hash(i, 3, 3) * 18, ph = (hash(i, 4, 3) * VH + t * sp) % (VH + 20);
        const x = (hash(i, 5, 3) * VW + Math.sin(t * .8 + i) * 8) % VW, y = up ? VH + 10 - ph : ph - 10;
        c.globalAlpha = .3 + .5 * Math.abs(Math.sin(t + i)); c.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      c.globalAlpha = 1;
    };
    const mountains = (y: number, ox: number, col: string, amp: number, seed: number) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(-10, VH);
      for (let x = -10; x <= VW + 10; x += 6) {
        const gx = (x + ox) / 40, i = Math.floor(gx), f = gx - i;
        const h = hash(i, seed, 7) * (1 - f) + hash(i + 1, seed, 7) * f;
        c.lineTo(x, y - h * amp);
      }
      c.lineTo(VW + 10, VH); c.fill();
    };
    const bigTree = (x: number, y: number, size: number, pulse: number, alpha = 1) => {
      glow(x, y - size * .55, size * .9, "rgba(170,255,190,.9)", (.25 + pulse * .25) * alpha);
      if (ok(trees)) { c.globalAlpha = alpha; c.drawImage(trees, 2 * 128, 0, 128, 128, Math.round(x - size / 2), Math.round(y - size), size, size); c.globalAlpha = 1; }
    };
    const ring = (x: number, y: number, r: number, col: string, a: number, sq = .45) => {
      if (a <= 0) return; c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = 2;
      c.beginPath(); c.ellipse(x, y, r, r * sq, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    };
    const fade = (a: number, col = "#050308") => { if (a <= 0) return; c.globalAlpha = Math.min(1, a); c.fillStyle = col; c.fillRect(-20, -20, VW + 40, VH + 40); c.globalAlpha = 1; };
    const grey = (a: number) => { if (a <= 0) return; c.globalCompositeOperation = "saturation"; c.fillStyle = `rgba(128,128,128,${Math.min(1, a)})`; c.fillRect(0, 0, VW, VH); c.globalCompositeOperation = "source-over"; };
    const shake = (amt: number, t: number) => { if (amt > 0) c.translate(Math.round(Math.sin(t * 61) * amt), Math.round(Math.cos(t * 47) * amt)); };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (slow && now - last < 30) return; last = now;
      const t = (now - startRef.current) / 1000, s = sceneRef.current;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, VW, VH);

      if (s === 0) {
        // O Vazio: uma única nota acende no escuro e vira semente.
        sky([[0, "#020108"], [1, "#0a0820"]]);
        stars(t, Math.min(140, Math.floor(t * 30)), .9, VH);
        const seed = ease(t / 6);
        for (let i = 0; i < 6; i++) ring(192, 108, 10 + ((t * 30 + i * 22) % 130), "#f6d18b", (1 - ((t * 30 + i * 22) % 130) / 130) * seed * .6, 1);
        rays(192, 108, 14, 40 + seed * 220, t, "#fff3c8", seed * .5);
        glow(192, 108, 20 + seed * 70, "rgba(255,240,190,1)", .4 + seed * .6);
        c.fillStyle = "#fffbe6"; c.fillRect(190, 104, 4, 6); c.fillRect(194, 98, 2, 10);
        notes(t, 192, 160, Math.floor(seed * 20), "#f6d18b", 120);
        if (t > 9) fade((t - 9) * 1.5, "#fff8e0");
      } else if (s === 1) {
        // A Canção cria o mundo: travelling por campos, mares, picos, desertos e florestas.
        const pan = t * 34;
        const band = Math.floor(pan / 160) % 5;
        const skies: [number, string][][] = [
          [[0, "#4a7ac0"], [1, "#f0d8a0"]], [[0, "#2a5a9a"], [1, "#9ad0f0"]], [[0, "#6a8ac8"], [1, "#e8f0ff"]], [[0, "#c87a3a"], [1, "#f8d890"]], [[0, "#2a4a3a"], [1, "#8ac080"]],
        ];
        sky(skies[band]!);
        mountains(110, pan * .2, "rgba(60,80,120,.5)", 50, 1);
        mountains(130, pan * .45, "rgba(40,70,70,.7)", 40, 2);
        const pick = (x: number, y: number) => {
          const b = Math.floor((x * TS) / 160) % 5;
          if (b === 0) return hash(x, y, 2) < .2 ? T.FLOWER : T.MEADOW;
          if (b === 1) return y > 11 ? T.WATER : T.SAND;
          if (b === 2) return hash(x, y, 3) < .15 ? T.ICE : T.SNOW;
          if (b === 3) return hash(x, y, 4) < .3 ? T.DUNE : T.SAND;
          return hash(x, y, 5) < .3 ? T.MOSS : T.GRASS;
        };
        ground(pick, 144, pan);
        for (let i = 0; i < 12; i++) {
          const wx = i * 48 + 20, x = ((wx - pan) % 576 + 576) % 576 - 40;
          const b = Math.floor((wx + Math.floor(pan / 576) * 576) / 160) % 5;
          const idx = [0, 3, 6, 4, 1][b] ?? 0;
          sprite(trees, idx, x, 172 + (i % 3) * 12, 44 + (i % 2) * 10, ease((x + 40) / 120));
        }
        notes(t, 192, 120, 22, "#fff3c8", 160);
        motes(t, 50, "#fff3c8");
        glow(VW + 20 - (t * 3), 30, 80, "rgba(255,230,160,1)", .45);
      } else if (s === 2) {
        // Os dezessete Ecos orbitando a Árvore.
        sky([[0, "#060418"], [.6, "#1a2050"], [1, "#2a5a4a"]]); stars(t, 90, 1, 120);
        const rise = ease(t / 4);
        ground((x, y) => (hash(x, y, 2) < .14 ? T.FLOWER : T.GRASS), 160);
        bigTree(192, 186, 130, (Math.sin(t * 2) + 1) / 2);
        rays(192, 110, 18, 260, t, "#c8ffd8", .25 * rise);
        for (let i = 0; i < 17; i++) {
          const a = i / 17 * Math.PI * 2 + t * .45, r = 40 + rise * 100;
          const x = 192 + Math.cos(a) * r, y = 100 + Math.sin(a) * r * .38;
          const col = ECO_COLORS[i]!;
          glow(x, y, 12, col, .9 * rise);
          c.fillStyle = col; c.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 4);
          c.globalAlpha = .25 * rise; c.strokeStyle = col; c.beginPath(); c.moveTo(192, 100); c.lineTo(x, y); c.stroke(); c.globalAlpha = 1;
        }
        motes(t, 40, "#f6d18b");
      } else if (s === 3) {
        // Dois meninos sob a Árvore: Vael e Gorm.
        sky([[0, "#f0a070"], [.5, "#f8d0a0"], [1, "#f6e8c0"]]);
        mountains(140, 0, "rgba(160,90,90,.4)", 40, 3);
        ground((x, y) => (hash(x, y, 9) < .12 ? T.FLOWER : T.MEADOW), 144);
        bigTree(192, 176, 150, .5);
        for (let i = 0; i < 30; i++) {
          const ph = (t * .12 + hash(i, 1, 4)) % 1;
          c.fillStyle = i % 2 ? "#ffb0c8" : "#ffe0e8"; c.globalAlpha = Math.sin(ph * Math.PI);
          c.fillRect(Math.round(hash(i, 2, 4) * VW + Math.sin(t + i) * 20), Math.round(ph * VH), 2, 1);
        }
        c.globalAlpha = 1;
        const walk = Math.min(1, t / 4);
        drawChar(c, 120 + walk * 46, 178, VAEL, walk < 1 ? 3 : 0, walk < 1 ? Math.floor(t * 6) : 0);
        drawChar(c, 264 - walk * 46, 178, GORM_YOUNG, walk < 1 ? 2 : 0, walk < 1 ? Math.floor(t * 6) : 0);
        if (t > 4.5) { notes(t, 192, 170, 10, "#fffbe6", 40); glow(192, 165, 30, "rgba(255,230,180,1)", .4); }
        // a dor da Canção: notas escuras começam a cair sobre Vael
        if (t > 7) for (let i = 0; i < 12; i++) { const ph = (t * .4 + i / 12) % 1; c.fillStyle = "#3a3a4a"; c.globalAlpha = (1 - ph) * ease((t - 7) / 2); c.fillRect(166 + Math.sin(i) * 14, 110 + ph * 70, 2, 3); }
        c.globalAlpha = 1;
        grey(t > 8 ? (t - 8) * .15 : 0);
      } else if (s === 4) {
        // O Silêncio: uma onda cinza devora a cor, Vael caminha sem som.
        const pan = t * 8;
        shake(t > 6 ? Math.min(2, (t - 6) * .6) : 0, t);
        sky([[0, "#3a2a4a"], [1, "#c87a5a"]]);
        mountains(120, pan * .3, "rgba(40,30,50,.7)", 40, 4);
        ground((x, y) => (hash(x, y, 4) < .25 ? T.RUINS : hash(x, y, 5) < .5 ? T.ASH : T.COBBLE), 128, pan);
        for (let i = 0; i < 9; i++) { const x = i * 60 - (pan % 60) + 20; sprite(i % 3 ? trees : props, 5, x, 140 + (i % 2) * 40, i % 3 ? 54 : 32, .9); }
        const mx = 30 + t * 18;
        drawChar(c, mx, 176, GREY, 3, Math.floor(t * 4));
        // anel de silêncio em volta de Vael
        ring(mx, 172, 14 + (t * 20) % 40, "#c8c8d8", 1 - ((t * 20) % 40) / 40, .4);
        for (let i = 0; i < 5; i++) drawEnemy(c, "shade", 230 + i * 28 + Math.sin(t + i) * 6, 140 + (i % 3) * 22, t + i, 1, false, 1 + (i % 2) * .3, "#4a4a5a");
        for (let i = 0; i < 50; i++) { const x = (hash(i, 7, 1) * VW + t * 14) % VW, y = 110 + hash(i, 8, 1) * 110; c.globalAlpha = .16; c.fillStyle = "#c8c8d0"; c.fillRect(x, y, 22, 2); }
        c.globalAlpha = 1;
        // onda de cinza varrendo da esquerda
        const front = -40 + t * 46;
        c.save(); c.beginPath(); c.rect(-20, -20, Math.max(0, front + 20), VH + 40); c.clip(); grey(1); fade(.25, "#20202a"); c.restore();
        glow(front, 108, 60, "rgba(200,200,220,1)", .25);
      } else if (s === 5) {
        // Potos: a vila adormecida, estátua de Mana e o Ancião Gorm acordando.
        const dawn = Math.min(1, t / 9);
        sky([[0, dawn > .5 ? "#3a3a7a" : "#141838"], [1, dawn > .5 ? "#e8a070" : "#2a3a5a"]]); stars(t, 50, 1 - dawn);
        const zoom = 1 + Math.min(.18, t * .02); c.translate(VW / 2, VH / 2); c.scale(zoom, zoom); c.translate(-VW / 2, -VH / 2);
        ground((x, y) => (x >= 11 && x <= 13 ? T.COBBLE : y === 10 ? T.PATH : T.GRASS), 112);
        const house = (hx: number, hy: number, w: number) => {
          for (let x = 0; x < w; x++) { for (let y = 0; y < 2; y++) c.drawImage(tiles[T.ROOF]![x % 4]!, (hx + x) * TS, (hy + y) * TS); c.drawImage(tiles[T.WALL]![x === 1 ? 0 : 1]!, (hx + x) * TS, (hy + 2) * TS); }
          glow((hx + 1.5) * TS, (hy + 2.5) * TS, 16, "rgba(255,200,90,1)", .55 * (1 - dawn) + .2);
        };
        house(2, 7, 4); house(17, 7, 4); house(6, 8, 3);
        for (const [x, i] of [[20, 0], [370, 1], [150, 3], [250, 0]] as const) sprite(trees, i, x, 130, 50);
        drawStatue(c, 192, 150, true, t);
        bigTree(192, 116, 90, .3 + (t > 6 ? .4 * Math.sin(t * 3) : 0));
        drawChar(c, 172, 186, GORM, 0, t > 5 ? Math.floor(t * 2) % 2 : 0);
        if (t < 5) { c.fillStyle = "#fffbe6"; c.font = "8px monospace"; c.fillText("z", 180 + Math.sin(t * 3) * 2, 166 - (t * 6) % 12); }
        else { c.fillStyle = "#ffd040"; c.fillRect(170, 160, 3, 6); c.fillRect(170, 168, 3, 2); }
        VILLAGER.forEach((p, i) => drawChar(c, 80 + i * 112, 192, p, 0, 0));
        // fogo-fátuo de cada casa
        motes(t, 24, "#ffd27a");
        c.setTransform(1, 0, 0, 1, 0, 0);
        fade(.35 * (1 - dawn), "#0a1030");
      } else if (s === 6) {
        // A jornada: o herói atravessa colinas ao entardecer, a Árvore ao longe.
        const pan = t * 28;
        sky([[0, "#2a3a7a"], [.55, "#e88a6a"], [1, "#f8d090"]]);
        glow(300, 120, 90, "rgba(255,200,120,1)", .7);
        bigTree(320 - t * 2, 130, 70, .5, .7);
        mountains(140, pan * .25, "rgba(90,50,80,.75)", 34, 5);
        mountains(160, pan * .55, "rgba(50,40,60,.85)", 26, 6);
        ground((x, y) => (y === 12 ? T.PATH : hash(x, y, 9) < .1 ? T.FLOWER : T.GRASS), 160, pan);
        for (let i = 0; i < 8; i++) { const x = ((i * 70 - pan) % 560 + 560) % 560 - 40; sprite(trees, i % 2 ? 0 : 3, x, 178, 52); }
        drawChar(c, 140, 180, HERO, 3, Math.floor(t * 8), { kind: "bow", color: "#ffd040" });
        // capa de vento
        for (let i = 0; i < 30; i++) { const x = (hash(i, 3, 2) * VW - t * 80) % VW; c.globalAlpha = .22; c.fillStyle = "#fff3d8"; c.fillRect((x + VW) % VW, hash(i, 4, 2) * 170, 14, 1); }
        c.globalAlpha = 1;
        motes(t, 30, "#ffe0a0");
      } else {
        // O Último Acorde: o herói diante da Árvore. Uma flecha dourada desperta o mundo.
        const shot = 3.2, burst = 4.2;
        shake(t > burst && t < burst + 1.2 ? (burst + 1.2 - t) * 3 : 0, t);
        const day = ease((t - burst) / 2);
        sky([[0, day > 0 ? "#4a7ac0" : "#1a1838"], [.6, day > 0 ? "#f0c890" : "#4a3a6a"], [1, "#f6e0a0"]]);
        if (day < 1) stars(t, 60, 1 - day);
        mountains(140, 0, "rgba(80,110,150,.6)", 36, 8);
        ground((x, y) => (y === 11 || y === 12 ? T.PATH : hash(x, y, 9) < .1 ? T.FLOWER : T.GRASS), 128);
        for (const [x, i, sz] of [[24, 0, 56], [70, 3, 50], [320, 1, 58], [366, 0, 52]] as const) sprite(trees, i, x, 150, sz);
        const pulse = t > burst ? (Math.sin((t - burst) * 4) + 1) / 2 : .2;
        if (t > burst) rays(250, 90, 22, 320, t, "#fff0b8", .45 * day + .2);
        bigTree(250, 168, 140, pulse);
        if (t > burst) for (let r = 0; r < 4; r++) { const rr = ((t - burst) * 50 + r * 40) % 160; ring(250, 110, rr * 1.4, "#f6d18b", 1 - rr / 160); }
        const hx = Math.min(180, -10 + t * 70);
        const aiming = t > 2.6 && t < shot + .3;
        drawChar(c, hx, 182, HERO, hx < 180 ? 3 : 1, hx < 180 ? Math.floor(t * 8) : 0, { kind: "bow", color: "#ffd040" }, aiming ? 1 : 0);
        drawChar(c, 300, 182, GORM, 2, 0);
        if (t > shot && t < burst) {
          const k = (t - shot) / (burst - shot), ax = hx + 6 + k * (250 - hx - 6), ay = 168 - k * 90 - Math.sin(k * Math.PI) * 30;
          glow(ax, ay, 18, "rgba(255,220,120,1)", 1);
          c.strokeStyle = "#ffd040"; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax - 10, ay + 7); c.stroke();
          for (let i = 1; i < 8; i++) { c.globalAlpha = 1 - i / 8; c.fillStyle = "#fff3c8"; c.fillRect(ax - i * 6, ay + i * 4 + Math.sin(i + t * 20), 2, 2); }
          c.globalAlpha = 1;
        }
        if (t > burst) { notes(t, 250, 90, 30, "#fffbe6", 150); motes(t, 60, "#fff3c8"); }
        fade(1 - Math.min(1, t / 1.2));
        if (t > burst && t < burst + .5) fade(1 - (t - burst) * 2, "#fffbe6");
      }
      c.setTransform(1, 0, 0, 1, 0, 0);
      // Acabamento cinematográfico: bloom largo, tonalização, poeira de luz, halo e grão.
      if (!slow) softBloom(c, cv, VW, VH, s === 0 ? .35 : .24);
      splitTone(c, VW, VH, .16, .16);
      if (s >= 5) lensGlow(c, VW, VH, t, .8);
      lightMotes(c, VW, VH, t, slow ? 10 : 22, s === 0 || s === 4 ? [190, 210, 255] : [255, 224, 160], t * 4, 0, .7);
      // Vinheta
      const v = c.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .7);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(5,3,8,.7)"); c.fillStyle = v; c.fillRect(0, 0, VW, VH);
      if (!slow) filmGrain(c, VW, VH, t, .05);
      // Transição suave entre cenas
      fade(1 - Math.min(1, t / .9));
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={VW} height={VH} className="cut-canvas" aria-hidden />;
}
