import { T, TS, hash } from "./world";
import { FRONTIER } from './frontier';
import { paintDetailed, TILE_VARIANTS } from './tile-art';
import type { EnemyKind, Palette, WeaponKind } from "./data";

type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

/** Builds TILE_VARIANTS variants per tile type as 16x16 canvases. */
export function buildTiles(): HTMLCanvasElement[][] {
  const out: HTMLCanvasElement[][] = [];
  for (let t = 0; t <= 51; t++) {
    const vars: HTMLCanvasElement[] = [];
    for (let v = 0; v < TILE_VARIANTS; v++) {
      const cv = document.createElement("canvas");
      cv.width = TS; cv.height = TS;
      const c = cv.getContext("2d");
      if (!c) continue;
      drawTile(c, t, v & 3);
      paintDetailed(c, t, v);
      vars.push(cv);
    }
    out.push(vars);
  }
  return out;
}

function speckle(c: Ctx, base: string, cols: string[], v: number, density = 0.15) {
  px(c, 0, 0, TS, TS, base);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    const r = hash(x, y, v * 31 + base.length);
    if (r < density) px(c, x, y, 1, 1, cols[Math.floor(hash(x, y, v + 9) * cols.length)]);
  }
}
function treeShape(c: Ctx, leaf: string, dark: string, light: string, trunk: string, ground: string, gdark: string, v: number) {
  speckle(c, ground, [gdark], v, 0.1);
  px(c, 3, 12, 12, 4, "#214f35");
  px(c, 6, 11, 4, 5, trunk); px(c, 7, 11, 1, 5, "#ab7b46");
  px(c, 2, 2, 12, 9, leaf); px(c, 4, 0, 8, 2, leaf); px(c, 1, 4, 14, 5, leaf);
  px(c, 2, 8, 12, 3, dark); px(c, 4, 2, 4, 2, light); px(c, 3, 4, 2, 2, light);
  if (v % 2) px(c, 10, 4, 2, 2, light);
  for (let i=0;i<18;i++) { const x=2+Math.floor(hash(i, v, 8)*12), y=2+Math.floor(hash(i,v,9)*8); px(c,x,y,2,1,i%3?light:dark); }
  px(c, 5, 1, 5, 1, light); px(c, 2, 5, 1, 3, dark);
}

function drawTile(c: Ctx, t: number, v: number) {
  const terrain=Object.values(FRONTIER).find(d=>d.ground===t);
  if(terrain){speckle(c,terrain.base,[...terrain.flecks],v,.22);return;}
  switch (t) {
    case T.AUTUMN: speckle(c,"#98a15d",["#d2ad66","#bb8a54","#719055"],v,.28);break;
    case T.AUTUMN_TREE: treeShape(c,"#c37a4d","#8a5144","#e8b66c","#665247","#98a15d","#819252",v);break;
    case T.MOSS: speckle(c,"#448b76",["#367768","#61a084","#73a978"],v,.2);break;
    case T.PALM: speckle(c,"#75a16a",["#60945f"],v,.18);px(c,7,5,3,11,"#b29364");for(let i=0;i<5;i++){px(c,1+i*2,1+Math.abs(i-2),5,3,i%2?"#3d8a66":"#68ae79");}break;
    case T.LAVA: speckle(c,"#d56f4c",["#efab64","#f9d188","#bd4f48"],v,.4);px(c,(v*3)%12,5,5,2,"#ffdf94");break;
    case T.ASH: speckle(c,"#716a72",["#8d7c7c","#5a5666","#b78a75"],v,.3);break;
    case T.MUSHROOM: speckle(c,"#448b76",["#367768"],v,.2);px(c,6,9,4,7,"#d9c7b6");px(c,2,4,12,6,"#a984b8");px(c,4,2,8,3,"#d0a6ce");px(c,4,5,2,2,"#e6d7ca");px(c,10,6,2,2,"#e6d7ca");break;
    case T.MEADOW: speckle(c,"#85ad74",["#709b68","#9bc287"],v,.15);for(let i=0;i<3;i++){px(c,2+i*5,7+i*2,1,4,"#548559");px(c,1+i*5,6+i*2,3,2,["#edb9c7","#f2e19e","#c7d6ef"][i]);}break;
    case T.RUINS: speckle(c,"#9fa69b",["#b9bdae","#7c8d88"],v,.3);px(c,0,7,16,1,"#657b73");px(c,6,0,1,7,"#657b73");break;
    case T.FLOOR:
      px(c,0,0,16,16,"#a4754c"); for(let y=0;y<4;y++){px(c,0,y*4+3,16,1,"#735039");px(c,(y%2)*8,y*4,1,3,"#735039");px(c,2,y*4,5,1,"#bd9262");} break;
    case T.PANEL:
      px(c,0,0,16,16,"#ddd4b1");px(c,0,0,2,16,"#654b39");px(c,0,12,16,4,"#654b39");px(c,3,2,11,1,"#f1e7c6");break;
    case T.DOOR:
      px(c,0,0,16,16,"#553b32");px(c,2,0,12,16,"#272a32");px(c,0,14,16,2,"#c4ad7d");px(c,2,1,1,13,"#d0b07b");break;
    case T.FURNITURE: px(c,0,0,16,16,"#a4754c");break;
    case T.GRASS:
      speckle(c, "#519650", ["#4b8d49", "#60a45a", "#488b48"], v, 0.13);
      if(v<3){px(c,3+v*3,10,1,3,"#397341");px(c,2+v*3,9,1,2,"#6dac62");px(c,4+v*3,8,1,3,"#78b46b");} break;
    case T.FLOWER: speckle(c, "#4ca33a", ["#3d8a2e"], v, 0.15); px(c, 4, 5, 2, 2, ["#ff6080", "#ffe040", "#ffffff", "#80a0ff"][v]); px(c, 11, 10, 2, 2, ["#ffe040", "#ff6080", "#c080ff", "#ffffff"][v]); px(c, 5, 7, 1, 2, "#2d6a20"); break;
    case T.PATH: speckle(c, "#c8a468", ["#b08c50", "#d8b880", "#a07c44"], v, 0.25); break;
    case T.WATER: px(c, 0, 0, TS, TS, "#2a6ad0"); px(c, (v * 4) % 12, 4, 4, 1, "#6aa8ff"); px(c, (v * 5 + 6) % 12, 11, 5, 1, "#5090f0"); px(c, 2, 8, 2, 1, "#1a50b0"); break;
    case T.BRIDGE: px(c, 0, 0, TS, TS, "#2a6ad0"); for (let i = 0; i < 4; i++) { px(c, 0, i * 4, TS, 3, "#9a6a3a"); px(c, 0, i * 4 + 3, TS, 1, "#5a3a1a"); } break;
    case T.TREE: treeShape(c, "#2f8a2a", "#1e5e1c", "#52b23e", "#6a4020", "#4ca33a", "#3d8a2e", v); break;
    case T.DTREE: treeShape(c, "#1e5a40", "#123828", "#2f8060", "#3a2a1a", "#3a7a30", "#2a5a24", v); px(c, 7, 6, 1, 1, "#a0ffd0"); break;
    case T.PINE:
      speckle(c, "#eef4ff", ["#d0dcf0"], v, 0.12);
      px(c, 7, 12, 2, 4, "#5a3a20");
      for (let i = 0; i < 6; i++) px(c, 7 - i, 1 + i * 2, 2 + i * 2, 2, i % 2 ? "#1f5a3a" : "#2a7048");
      px(c, 5, 3, 2, 1, "#ffffff"); px(c, 3, 7, 3, 1, "#ffffff"); break;
    case T.SAND: speckle(c, "#e6c87a", ["#d4b460", "#f0d890"], v, 0.2); break;
    case T.DUNE: speckle(c, "#dcb868", ["#c8a050", "#ecd088"], v, 0.2); px(c, 2, 6 + v, 10, 1, "#c09048"); break;
    case T.CACTUS: speckle(c, "#e6c87a", ["#d4b460"], v, 0.15); px(c, 6, 3, 4, 13, "#3a9a40"); px(c, 2, 6, 3, 2, "#3a9a40"); px(c, 2, 4, 2, 3, "#3a9a40"); px(c, 11, 8, 3, 2, "#3a9a40"); px(c, 12, 5, 2, 4, "#3a9a40"); px(c, 7, 3, 1, 13, "#5aba60"); break;
    case T.BUSH: speckle(c, v < 2 ? "#4ca33a" : "#e6c87a", ["#3d8a2e"], v, 0.1); px(c, 3, 7, 10, 7, "#6a8a30"); px(c, 5, 5, 6, 3, "#7a9a40"); px(c, 6, 8, 2, 2, "#a0c060"); break;
    case T.ROCK: speckle(c, "#7a7a86", ["#6a6a76", "#8a8a96"], v, 0.2); px(c, 1, 3, 14, 12, "#8a8a96"); px(c, 2, 2, 10, 2, "#a0a0ac"); px(c, 1, 12, 14, 3, "#5a5a66"); px(c, 5, 6, 4, 1, "#5a5a66"); break;
    case T.PILLAR: speckle(c, "#e6c87a", ["#d4b460"], v, 0.15); px(c, 4, 0, 8, 16, "#c8b8a0"); px(c, 3, 0, 10, 2, "#e0d0b8"); px(c, 3, 14, 10, 2, "#a89880"); px(c, 6, 2, 1, 12, "#a89880"); px(c, 9, 2, 1, 12, "#a89880"); break;
    case T.SNOW: speckle(c, "#eef4ff", ["#d0dcf0", "#ffffff", "#c0d0ea"], v, 0.2); break;
    case T.ICE: px(c, 0, 0, TS, TS, "#a8d8f0"); px(c, 2, 3, 6, 1, "#e0f8ff"); px(c, 8, 9, 5, 1, "#e0f8ff"); px(c, 11, 2, 1, 4, "#80b8d8"); break;
    case T.CAVE: speckle(c, "#3a3050", ["#2e2640", "#463c60", "#4a3a6a"], v, 0.25); break;
    case T.CWALL: speckle(c, "#1a1428", ["#241c36", "#120c1e"], v, 0.3); px(c, 0, 13, TS, 3, "#2a2040"); break;
    case T.CRYSTAL:
      speckle(c, "#3a3050", ["#2e2640"], v, 0.2);
      px(c, 6, 2, 4, 12, "#b070ff"); px(c, 3, 6, 3, 8, "#9050e0"); px(c, 10, 5, 3, 9, "#d090ff"); px(c, 7, 3, 1, 8, "#f0d0ff"); px(c, 11, 6, 1, 4, "#ffffff"); break;
    case T.COBBLE:
      px(c, 0, 0, TS, TS, "#a09080");
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) px(c, x * 4 + (y % 2) * 2, y * 4, 3, 3, hash(x, y, v) < 0.5 ? "#b8a898" : "#c4b4a4");
      break;
    case T.WALL: px(c, 0, 0, TS, TS, "#e8dcc0"); px(c, 0, 0, TS, 1, "#806040"); px(c, 0, 8, TS, 1, "#c8b8a0"); if (v === 0) { px(c, 5, 6, 6, 10, "#6a4020"); px(c, 9, 11, 1, 1, "#ffd040"); } else { px(c, 4, 4, 8, 6, "#5a8ad0"); px(c, 7, 4, 1, 6, "#806040"); px(c, 4, 7, 8, 1, "#806040"); } break;
    case T.ROOF: px(c, 0, 0, TS, TS, "#c04830"); for (let y = 0; y < 4; y++) px(c, 0, y * 4 + 3, TS, 1, "#902818"); for (let x = 0; x < 4; x++) px(c, x * 4 + (v % 2) * 2, 0, 1, TS, "#a83820"); break;
  }
}

export function drawChar(c: Ctx, x: number, y: number, pal: Palette, dir: number, frame: number, weapon?: { kind: WeaponKind; color: string } | null, attack = 0) {
  // x,y = feet center. 12x18 sprite.
  const ox = Math.round(x - 6), oy = Math.round(y - 18);
  const step = frame % 4 === 1 ? 1 : frame % 4 === 3 ? -1 : 0;
  px(c, ox + 2, oy + 17, 8, 2, "rgba(0,0,0,0.3)");
  // legs
  px(c, ox + 3, oy + 13, 2, 4 - step, pal.legs);
  px(c, ox + 7, oy + 13, 2, 3 + step, pal.legs);
  px(c, ox + 3, oy + 16 - step, 2, 1, "#2a1a10"); px(c, ox + 7, oy + 15 + step, 2, 1, "#2a1a10");
  // body
  px(c, ox + (dir === 1 ? 8 : 0), oy + 8, 4, 7, "#31464e");
  px(c, ox + 2, oy + 8, 8, 6, pal.body);
  px(c, ox + 2, oy + 12, 8, 1, "rgba(0,0,0,0.25)");
  px(c, ox + 1, oy + 9, 1, 4, pal.body); px(c, ox + 10, oy + 9, 1, 4, pal.body);
  px(c, ox + 1, oy + 12, 1, 1, pal.skin); px(c, ox + 10, oy + 12, 1, 1, pal.skin);
  // head
  px(c, ox + 2, oy + 2, 8, 7, pal.skin);
  px(c, ox + 1, oy + 1, 10, 3, pal.hair);
  if (dir === 0) { // down
    px(c, ox + 1, oy + 4, 1, 3, pal.hair); px(c, ox + 10, oy + 4, 1, 3, pal.hair);
    px(c, ox + 4, oy + 5, 1, 2, "#202030"); px(c, ox + 7, oy + 5, 1, 2, "#202030");
  } else if (dir === 3) { // up
    px(c, ox + 2, oy + 2, 8, 6, pal.hair);
  } else {
    const f = dir === 2 ? 1 : -1;
    px(c, ox + (f > 0 ? 1 : 7), oy + 2, 4, 5, pal.hair);
    px(c, ox + (f > 0 ? 7 : 4), oy + 5, 1, 2, "#202030");
  }
  px(c,ox+3,oy+9,2,3,"#ffffff30");
  px(c,ox+3,oy+1,5,1,"#ffffff45");
  if (pal.accent) px(c, ox + 2, oy + 8, 8, 1, pal.accent);
  if (weapon) drawWeapon(c, x, y - 8, dir, weapon, attack);
}

function drawWeapon(c: Ctx, x: number, y: number, dir: number, w: { kind: WeaponKind; color: string }, attack: number) {
  const dx = [0, -1, 1, 0][dir], dy = [1, 0, 0, -1][dir];
  const base = Math.atan2(dy, dx);
  const swing = attack > 0 ? (w.kind === "sword" ? (attack - 0.5) * 2.4 : 0) : 0.9;
  const ang = base + swing;
  const len = w.kind === "spear" ? 16 + (attack > 0 && w.kind === "spear" ? 6 : 0) : w.kind === "bow" ? 7 : 11;
  c.save();
  c.translate(Math.round(x + dx * 4), Math.round(y + dy * 2));
  c.rotate(ang);
  if (w.kind === "bow") {
    c.strokeStyle = w.color; c.lineWidth = 2;
    c.beginPath(); c.arc(2, 0, 6, -1.2, 1.2); c.stroke();
    c.strokeStyle = "#ffffff"; c.lineWidth = 1; c.beginPath(); c.moveTo(4.5, -5.5); c.lineTo(4.5, 5.5); c.stroke();
  } else {
    px(c, 0, -1, 3, 2, "#5a3a20");
    px(c, 3, -1, len - 3, 2, w.kind === "staff" ? "#8a6a3a" : w.color);
    if (w.kind === "sword") { px(c, 2, -3, 1, 6, "#d0b040"); px(c, 4, -1, len - 4, 1, "#ffffff"); }
    if (w.kind === "spear") { px(c, len - 1, -2, 4, 4, w.color); px(c, len + 3, -1, 2, 2, "#ffffff"); }
    if (w.kind === "staff") { px(c, len - 1, -3, 4, 6, w.color); px(c, len, -2, 2, 2, "#ffffff"); }
  }
  c.restore();
}

export function drawEnemy(c: Ctx, kind: EnemyKind, x: number, y: number, t: number, dir: number, flash: boolean, scale = 1, tint?: string) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (scale !== 1) c.scale(scale, scale);
  const bob = Math.round(Math.sin(t * 8) * 1);
  const F = (col: string) => (flash ? "#ffffff" : col);
  px(c, -6, -1, 12, 3, "rgba(0,0,0,0.3)");
  const fx = dir === 1 ? -1 : 1;
  switch (kind) {
    case "mushroom": {
      const cap = tint ?? "#e04040";
      px(c, -3, -7 + bob, 6, 7 - bob, F("#f0e0c0"));
      px(c, -7, -13 + bob, 14, 6, F(cap)); px(c, -5, -15 + bob, 10, 2, F(cap));
      px(c, -4, -12 + bob, 2, 2, F("#ffffff")); px(c, 2, -13 + bob, 3, 2, F("#ffffff"));
      px(c, -2, -5 + bob, 1, 2, "#202020"); px(c, 1, -5 + bob, 1, 2, "#202020");
      break;
    }
    case "goblin": {
      const sk = tint ?? "#6ab040";
      px(c, -3, -6, 2, 6, F("#4a3020")); px(c, 1, -6, 2, 6, F("#4a3020"));
      px(c, -4, -11 + bob, 8, 6, F("#8a5a30"));
      px(c, -4, -17 + bob, 8, 6, F(sk)); px(c, -7, -16 + bob, 3, 2, F(sk)); px(c, 4, -16 + bob, 3, 2, F(sk));
      px(c, -2, -15 + bob, 1, 1, "#ff2020"); px(c, 1, -15 + bob, 1, 1, "#ff2020");
      px(c, 4 * fx, -10 + bob, 2 * fx, 7, F("#a0a0a0"));
      break;
    }
    case "sporeling": {
      const g = tint ?? "#8040b0";
      px(c, -5, -8 + bob, 10, 8, F("#50a050")); px(c, -6, -4, 2, 4, F("#408040")); px(c, 4, -4, 2, 4, F("#408040"));
      px(c, -6, -14 + bob, 12, 7, F(g));
      for (let i = 0; i < 3; i++) px(c, -5 + i * 4, -13 + bob, 2, 2, F("#ffe060"));
      px(c, -2, -6 + bob, 1, 1, "#000"); px(c, 1, -6 + bob, 1, 1, "#000");
      break;
    }
    case "scorpion": {
      const b = tint ?? "#5a3a6a";
      px(c, -6, -6, 12, 5, F(b)); px(c, -8, -4, 2, 3, F(b)); px(c, 6, -4, 2, 3, F(b));
      for (let i = 0; i < 3; i++) { px(c, -8, -2 + i, 1, 1, F("#3a2a4a")); px(c, 7, -2 + i, 1, 1, F("#3a2a4a")); }
      px(c, -10 * fx - (fx < 0 ? 3 : 0), -8, 3, 3, F(b));
      px(c, 4 * -fx, -10 + bob, 2, 5, F(b)); px(c, 3 * -fx, -14 + bob, 2, 4, F(b)); px(c, 1 * -fx, -15 + bob, 3, 2, F("#ff3060"));
      px(c, -1 + 3 * fx, -5, 1, 1, "#ff4040");
      break;
    }
    case "golem": {
      const r = tint ?? "#8a8070";
      px(c, -5, -6, 4, 6, F(r)); px(c, 1, -6, 4, 6, F(r));
      px(c, -8, -16 + bob, 16, 11, F(r)); px(c, -10, -14 + bob, 3, 9, F(r)); px(c, 7, -14 + bob, 3, 9, F(r));
      px(c, -5, -20 + bob, 10, 5, F(r));
      px(c, -3, -18 + bob, 2, 2, "#60f0ff"); px(c, 1, -18 + bob, 2, 2, "#60f0ff");
      px(c, -6, -12 + bob, 4, 1, "#5a5040"); px(c, 2, -9 + bob, 4, 1, "#5a5040");
      px(c, -1, -12 + bob, 2, 3, F("#60f0ff"));
      break;
    }
    case "wolf": {
      const f = tint ?? "#e8eef8";
      const leg = Math.round(Math.sin(t * 14) * 1);
      px(c, -7, -9, 13, 6, F(f));
      px(c, -6, -4, 2, 4 + leg, F(f)); px(c, 3, -4, 2, 4 - leg, F(f));
      const hx = fx > 0 ? 4 : -10;
      px(c, hx, -13, 6, 6, F(f)); px(c, hx + (fx > 0 ? 5 : -2), -11, 3, 3, F(f));
      px(c, hx + 1, -15, 2, 2, F(f)); px(c, hx + 4, -15, 2, 2, F(f));
      px(c, hx + (fx > 0 ? 4 : 1), -11, 1, 1, "#40a0ff");
      px(c, fx > 0 ? -10 : 6, -10, 4, 2, F(f));
      px(c, -6, -9, 11, 1, F("#b0c0d0"));
      break;
    }
    case "shade": {
      c.globalAlpha = 0.85;
      const s = tint ?? "#302048";
      px(c, -5, -18 + bob, 10, 14, F(s)); px(c, -7, -14 + bob, 14, 8, F(s));
      for (let i = 0; i < 4; i++) px(c, -6 + i * 3, -4 + bob + (i % 2), 2, 3, F(s));
      px(c, -3, -15 + bob, 2, 2, "#ff40ff"); px(c, 1, -15 + bob, 2, 2, "#ff40ff");
      c.globalAlpha = 1;
      break;
    }
    case "slime": {
      const g = tint ?? "#50c050";
      const sq = Math.round(Math.sin(t * 6) * 2);
      px(c, -6, -6 + sq, 12, 6 - sq, F(g)); px(c, -4, -8 + sq, 8, 3, F(g));
      px(c, -3, -5 + sq, 2, 2, "#103010"); px(c, 1, -5 + sq, 2, 2, "#103010");
      px(c, -2, -7 + sq, 3, 1, F("#a0f0a0"));
      break;
    }
    case "rat": {
      const f = tint ?? "#8a7a6a";
      const leg = Math.round(Math.sin(t * 16) * 1);
      px(c, -7, -6, 12, 5, F(f)); px(c, -6, -2, 2, 2 + leg, F(f)); px(c, 2, -2, 2, 2 - leg, F(f));
      const hx = fx > 0 ? 5 : -9;
      px(c, hx, -8, 4, 4, F(f)); px(c, hx + (fx > 0 ? 1 : 2), -10, 2, 2, F("#d0a0a0"));
      px(c, hx + (fx > 0 ? 3 : 0), -6, 1, 1, "#ff4040");
      px(c, fx > 0 ? -11 : 5, -4, 4, 1, F("#c09090"));
      break;
    }
    case "bat": {
      const b = tint ?? "#5a4a7a";
      const flap = Math.round(Math.sin(t * 12) * 3);
      px(c, -2, -14 + bob, 4, 5, F(b)); px(c, -1, -16 + bob, 2, 2, F(b));
      px(c, -9, -15 + bob - flap, 7, 3, F(b)); px(c, 2, -15 + bob - flap, 7, 3, F(b));
      px(c, -1, -13 + bob, 1, 1, "#ff3030"); px(c, 1, -13 + bob, 1, 1, "#ff3030");
      break;
    }
    case "spider": {
      const b = tint ?? "#3a2a4a";
      px(c, -4, -8 + bob, 8, 6, F(b)); px(c, -2, -11 + bob, 4, 3, F(b));
      for (let i = 0; i < 4; i++) { px(c, -8, -8 + i * 2, 4, 1, F(b)); px(c, 4, -8 + i * 2, 4, 1, F(b)); }
      px(c, -2, -10 + bob, 1, 1, "#ff2020"); px(c, 1, -10 + bob, 1, 1, "#ff2020");
      px(c, -1, -13 + bob, 2, 1, F("#e0e0e0"));
      break;
    }
    case "skeleton": {
      const b = tint ?? "#e0dcd0";
      px(c, -3, -6, 2, 6, F(b)); px(c, 1, -6, 2, 6, F(b));
      px(c, -4, -12 + bob, 8, 7, F(b)); px(c, -3, -11 + bob, 6, 1, "#00000040"); px(c, -3, -8 + bob, 6, 1, "#00000040");
      px(c, -3, -17 + bob, 6, 5, F(b));
      px(c, -2, -16 + bob, 1, 2, "#202020"); px(c, 1, -16 + bob, 1, 2, "#202020");
      px(c, 4 * fx, -11 + bob, 2 * fx, 6, F("#b0a890"));
      break;
    }
    case "crow": {
      const b = tint ?? "#282828";
      const flap = Math.round(Math.sin(t * 10) * 2);
      px(c, -4, -10 + bob, 8, 5, F(b)); px(c, -8, -11 + bob - flap, 4, 3, F(b)); px(c, 4, -11 + bob - flap, 4, 3, F(b));
      const hx = fx > 0 ? 3 : -6;
      px(c, hx, -13 + bob, 3, 3, F(b)); px(c, hx + (fx > 0 ? 3 : -2), -12 + bob, 2, 1, F("#e0a020"));
      px(c, hx + 1, -12 + bob, 1, 1, "#ffffff");
      break;
    }
    case "frog": {
      const g = tint ?? "#40a040";
      const hop = Math.max(0, Math.round(Math.sin(t * 5) * 2));
      px(c, -6, -7 - hop, 12, 7, F(g)); px(c, -7, -3, 3, 3, F(g)); px(c, 4, -3, 3, 3, F(g));
      px(c, -4, -11 - hop, 3, 4, F(g)); px(c, 1, -11 - hop, 3, 4, F(g));
      px(c, -3, -10 - hop, 1, 1, "#ffd020"); px(c, 2, -10 - hop, 1, 1, "#ffd020");
      px(c, -2, -4 - hop, 4, 2, F("#c0e080"));
      break;
    }
    case "crab": {
      const b = tint ?? "#e06050";
      px(c, -7, -7, 14, 6, F(b)); px(c, -5, -9, 10, 2, F(b));
      px(c, -11, -8 + bob, 4, 4, F(b)); px(c, 7, -8 + bob, 4, 4, F(b));
      for (let i = 0; i < 3; i++) { px(c, -9 + i, -2 + i, 1, 2, F(b)); px(c, 8 - i, -2 + i, 1, 2, F(b)); }
      px(c, -3, -8, 1, 1, "#202020"); px(c, 2, -8, 1, 1, "#202020");
      break;
    }
    case "boar": {
      const f = tint ?? "#7a5a3a";
      const leg = Math.round(Math.sin(t * 12) * 1);
      px(c, -8, -9, 15, 7, F(f)); px(c, -7, -3, 2, 3 + leg, F("#5a4030")); px(c, 3, -3, 2, 3 - leg, F("#5a4030"));
      const hx = fx > 0 ? 6 : -11;
      px(c, hx, -10, 5, 5, F(f)); px(c, hx + (fx > 0 ? 4 : -1), -7, 2, 2, F("#e8e0d0"));
      px(c, hx + (fx > 0 ? 3 : 1), -9, 1, 1, "#ff3030");
      px(c, -6, -11, 10, 2, F("#5a4030"));
      break;
    }
    case "pixie": {
      const p = tint ?? "#ff9ae0";
      const flap = Math.round(Math.sin(t * 14) * 2);
      c.globalAlpha = 0.6; px(c, -6, -13 + bob - flap, 4, 5, F("#c0e8ff")); px(c, 2, -13 + bob - flap, 4, 5, F("#c0e8ff")); c.globalAlpha = 1;
      px(c, -2, -12 + bob, 4, 8, F(p)); px(c, -2, -15 + bob, 4, 3, F("#f0d0b0"));
      px(c, -1, -14 + bob, 1, 1, "#202020"); px(c, 1, -14 + bob, 1, 1, "#202020");
      px(c, -1, -17 + bob, 2, 2, F("#ffe060"));
      break;
    }
    case "wisp": {
      const w = tint ?? "#80e0ff";
      c.globalAlpha = 0.35 + Math.sin(t * 4) * 0.1; px(c, -6, -16 + bob, 12, 13, F(w)); c.globalAlpha = 0.9;
      px(c, -3, -13 + bob, 6, 8, F(w)); px(c, -2, -15 + bob, 4, 3, F("#e0f8ff"));
      px(c, -1, -11 + bob, 1, 1, "#103040"); px(c, 1, -11 + bob, 1, 1, "#103040");
      c.globalAlpha = 1;
      break;
    }
    case "treant": {
      const b = tint ?? "#6a4a2a";
      px(c, -5, -6, 4, 6, F(b)); px(c, 1, -6, 4, 6, F(b));
      px(c, -6, -16 + bob, 12, 11, F(b));
      px(c, -10, -14 + bob, 4, 3, F(b)); px(c, 6, -14 + bob, 4, 3, F(b));
      px(c, -7, -22 + bob, 14, 7, F("#3a7a3a")); px(c, -4, -25 + bob, 8, 3, F("#4a8a3a"));
      px(c, -3, -13 + bob, 2, 2, "#ffd040"); px(c, 1, -13 + bob, 2, 2, "#ffd040");
      px(c, -1, -10 + bob, 2, 3, "#00000060");
      break;
    }
    case "mummy": {
      const b = tint ?? "#d8d0b8";
      px(c, -3, -6, 2, 6, F(b)); px(c, 1, -6, 2, 6, F(b));
      px(c, -4, -12 + bob, 8, 7, F(b)); px(c, -4, -10 + bob, 8, 1, "#a09878"); px(c, -4, -7 + bob, 8, 1, "#a09878");
      px(c, -3, -17 + bob, 6, 5, F(b)); px(c, -3, -15 + bob, 6, 1, "#a09878");
      px(c, -2, -16 + bob, 1, 1, "#60f0ff"); px(c, 1, -16 + bob, 1, 1, "#60f0ff");
      px(c, -6 * fx, -11 + bob, 3 * fx, 2, F(b));
      break;
    }
    case "gargoyle": {
      const g = tint ?? "#7a7a8a";
      px(c, -4, -5, 3, 5, F(g)); px(c, 1, -5, 3, 5, F(g));
      px(c, -5, -13 + bob, 10, 9, F(g));
      px(c, -9, -14 + bob, 4, 7, F("#5a5a6a")); px(c, 5, -14 + bob, 4, 7, F("#5a5a6a"));
      px(c, -3, -17 + bob, 6, 4, F(g)); px(c, -4, -19 + bob, 2, 2, F(g)); px(c, 2, -19 + bob, 2, 2, F(g));
      px(c, -2, -16 + bob, 1, 1, "#ff8020"); px(c, 1, -16 + bob, 1, 1, "#ff8020");
      break;
    }
    case "serpent": {
      const s = tint ?? "#c0a050";
      const w1 = Math.round(Math.sin(t * 8) * 2), w2 = Math.round(Math.sin(t * 8 + 2) * 2);
      px(c, -8 + w2, -3, 8, 3, F(s)); px(c, -2 + w1, -5, 7, 3, F(s));
      px(c, 2 * fx, -10 + bob, 5, 6, F(s)); px(c, 3 * fx, -12 + bob, 3, 2, F(s));
      px(c, 3 * fx, -10 + bob, 1, 1, "#ff3020");
      px(c, 5 * fx, -8 + bob, 2 * fx, 1, F("#ff6060"));
      break;
    }
    case "beetle": {
      const b = tint ?? "#3a4a2a";
      px(c, -6, -8, 12, 7, F(b)); px(c, -5, -9, 10, 2, F("#5a6a3a"));
      px(c, -1, -8, 2, 7, "#00000050");
      const hx = fx > 0 ? 5 : -8;
      px(c, hx, -7, 3, 3, F(b)); px(c, hx + (fx > 0 ? 2 : -1), -10, 1, 3, F("#8a9a5a"));
      for (let i = 0; i < 3; i++) { px(c, -7, -6 + i * 2, 1, 1, F(b)); px(c, 6, -6 + i * 2, 1, 1, F(b)); }
      break;
    }
    case "jelly": {
      const j = tint ?? "#c080ff";
      c.globalAlpha = 0.75;
      const sq = Math.round(Math.sin(t * 5) * 1);
      px(c, -5, -16 + bob + sq, 10, 7 - sq, F(j)); px(c, -6, -11 + bob, 12, 2, F(j));
      for (let i = 0; i < 4; i++) px(c, -5 + i * 3, -9 + bob, 1, 6 + (i % 2) * 2, F(j));
      px(c, -2, -14 + bob, 1, 1, "#301040"); px(c, 1, -14 + bob, 1, 1, "#301040");
      c.globalAlpha = 1;
      break;
    }
    case "imp": {
      const r = tint ?? "#c04030";
      px(c, -3, -5, 2, 5, F(r)); px(c, 1, -5, 2, 5, F(r));
      px(c, -4, -11 + bob, 8, 7, F(r));
      px(c, -3, -15 + bob, 6, 4, F(r)); px(c, -4, -17 + bob, 2, 3, F("#802020")); px(c, 2, -17 + bob, 2, 3, F("#802020"));
      px(c, -2, -14 + bob, 1, 1, "#ffe040"); px(c, 1, -14 + bob, 1, 1, "#ffe040");
      px(c, -6 * fx, -8 + bob, 2 * fx, 1, F(r)); px(c, -7 * fx, -9 + bob, 1, 1, F("#802020"));
      break;
    }
    case "salamander": {
      const s = tint ?? "#e05020";
      const leg = Math.round(Math.sin(t * 10) * 1);
      px(c, -8, -6, 14, 5, F(s)); px(c, -7, -2, 2, 2 + leg, F(s)); px(c, 3, -2, 2, 2 - leg, F(s));
      const hx = fx > 0 ? 5 : -10;
      px(c, hx, -8, 5, 4, F(s)); px(c, hx + (fx > 0 ? 3 : 1), -7, 1, 1, "#ffe040");
      px(c, fx > 0 ? -12 : 6, -5, 4, 2, F("#a03010"));
      px(c, -6, -8, 2, 2, F("#ffb040")); px(c, -1, -8, 2, 2, F("#ffb040")); px(c, 3, -8, 2, 2, F("#ffb040"));
      break;
    }
    case "sprite": {
      const s = tint ?? "#a0e8ff";
      px(c, -3, -6, 2, 6, F("#6090b0")); px(c, 1, -6, 2, 6, F("#6090b0"));
      px(c, -4, -12 + bob, 8, 7, F(s));
      px(c, -3, -16 + bob, 6, 4, F("#e0f4ff")); px(c, -4, -18 + bob, 3, 2, F(s)); px(c, 1, -18 + bob, 3, 2, F(s));
      px(c, -2, -15 + bob, 1, 1, "#104060"); px(c, 1, -15 + bob, 1, 1, "#104060");
      px(c, 4 * fx, -11 + bob, 2 * fx, 5, F("#d0f0ff"));
      break;
    }
    case "wraith": {
      const w = tint ?? "#4a3a6a";
      c.globalAlpha = 0.7;
      px(c, -5, -19 + bob, 10, 12, F(w)); px(c, -7, -15 + bob, 14, 6, F(w));
      for (let i = 0; i < 5; i++) px(c, -7 + i * 3, -7 + bob + (i % 2), 2, 4, F(w));
      px(c, -3, -16 + bob, 2, 3, "#a0f0ff"); px(c, 1, -16 + bob, 2, 3, "#a0f0ff");
      px(c, -1, -11 + bob, 2, 2, "#a0f0ff");
      c.globalAlpha = 1;
      break;
    }
    case "mimic": {
      const open = Math.sin(t * 2) > 0.3;
      px(c, -7, -9, 14, 9, F("#8a5a2a")); px(c, -7, -9, 14, 2, F("#a0703a"));
      px(c, -1, -9, 2, 9, F("#d0b040"));
      if (open) {
        px(c, -7, -13 + bob, 14, 4, F("#a0703a"));
        px(c, -5, -8, 10, 2, "#401010");
        px(c, -4, -8, 1, 2, F("#f0e0c0")); px(c, -1, -8, 1, 2, F("#f0e0c0")); px(c, 2, -8, 1, 2, F("#f0e0c0"));
        px(c, -2, -6, 4, 1, "#ff3040");
      } else {
        px(c, -1, -7, 2, 3, F("#f0d060"));
      }
      break;
    }
  }
  c.restore();
}

export function drawStatue(c: Ctx, x: number, y: number, active: boolean, t: number) {
  px(c, x - 7, y - 3, 14, 4, "#707080");
  px(c, x - 5, y - 18, 10, 15, "#a0a0b8");
  px(c, x - 4, y - 24, 8, 6, "#b8b8d0");
  px(c, x - 8, y - 16, 3, 6, "#a0a0b8"); px(c, x + 5, y - 16, 3, 6, "#a0a0b8");
  const g = active ? `hsl(${190 + Math.sin(t * 3) * 20},100%,${65 + Math.sin(t * 4) * 10}%)` : "#506070";
  px(c, x - 2, y - 14, 4, 4, g);
  px(c, x - 1, y - 22, 2, 2, active ? "#ffffff" : "#808090");
}

export function drawNode(c: Ctx, item: string, x: number, y: number, t: number) {
  const sh = Math.sin(t * 3 + x) > 0.8;
  switch (item) {
    case "herb": case "frost_herb": {
      const col = item === "herb" ? "#40c040" : "#a0f0ff";
      px(c, x - 1, y - 8, 2, 8, "#2a7a2a"); px(c, x - 5, y - 6, 4, 2, col); px(c, x + 1, y - 9, 4, 2, col); px(c, x - 3, y - 11, 3, 2, col);
      break;
    }
    case "desert_rose": px(c, x - 1, y - 6, 2, 6, "#3a8a3a"); px(c, x - 3, y - 10, 6, 4, "#ff6090"); px(c, x - 1, y - 9, 2, 2, "#ffd0e0"); break;
    case "wood": px(c, x - 7, y - 5, 14, 5, "#8a5a2a"); px(c, x - 7, y - 5, 3, 5, "#c09060"); px(c, x - 6, y - 4, 1, 3, "#8a5a2a"); break;
    case "stone": case "copper_ore": case "coal": case "iron_ore": {
      // Shaded boulder with faceted highlights and glinting mineral veins.
      const V: Record<string, [string, string, string]> = { stone: ["#9a9aa6", "#c9c9d2", "#7b7b88"], copper_ore: ["#e08a4a", "#ffc28a", "#a8562c"], coal: ["#2a2630", "#5a5466", "#141218"], iron_ore: ["#c7ccd8", "#ffffff", "#8a90a0"] };
      const [vein, glint, deep] = V[item];
      px(c, x - 9, y - 1, 18, 3, "#00000033");
      px(c, x - 7, y - 9, 14, 9, "#5e6170"); px(c, x - 8, y - 6, 16, 6, "#5e6170"); px(c, x - 5, y - 11, 9, 3, "#6f7383");
      px(c, x - 6, y - 10, 6, 4, "#8a8ea0"); px(c, x - 7, y - 6, 4, 3, "#7a7e90"); px(c, x + 3, y - 4, 5, 4, "#4a4c5a"); px(c, x - 8, y - 1, 16, 1, "#3d3f4b");
      px(c, x - 4, y - 7, 3, 2, deep); px(c, x - 3, y - 8, 2, 1, vein); px(c, x + 1, y - 9, 3, 2, vein); px(c, x + 2, y - 10, 1, 1, glint);
      px(c, x + 2, y - 4, 3, 2, vein); px(c, x + 3, y - 5, 1, 1, glint); px(c, x - 6, y - 4, 2, 2, vein);
      if (item === "coal") { px(c, x - 1, y - 6, 2, 1, "#7a6c84"); }
      if (Math.sin(t * 2.5 + x * 0.7) > 0.6) { px(c, x + 2, y - 11, 1, 3, glint); px(c, x + 1, y - 10, 3, 1, glint); }
      break;
    }
    case "crystal_ore": {
      const pulse = 0.25 + (Math.sin(t * 2 + x) + 1) * 0.12;
      c.globalAlpha = pulse; px(c, x - 9, y - 16, 18, 16, "#b98cff"); c.globalAlpha = 1;
      px(c, x - 8, y - 2, 16, 3, "#4f4a66");
      px(c, x - 6, y - 10, 4, 9, "#7d4fd8"); px(c, x - 5, y - 12, 2, 2, "#9d6ff0");
      px(c, x - 2, y - 15, 5, 14, "#a979ff"); px(c, x - 1, y - 17, 3, 2, "#c9a6ff"); px(c, x + 1, y - 14, 2, 12, "#7d4fd8");
      px(c, x + 3, y - 9, 4, 8, "#c597ff"); px(c, x + 4, y - 11, 2, 2, "#e4cfff");
      px(c, x - 1, y - 13, 1, 8, "#ffffff"); px(c, x + 4, y - 8, 1, 4, "#ffffff");
      if (sh) { px(c, x - 4, y - 18, 1, 3, "#ffffff"); px(c, x - 5, y - 17, 3, 1, "#ffffff"); }
      break;
    }
    case "mana_shard": {
      const b = Math.round(Math.sin(t * 3) * 1.5);
      c.globalAlpha = 0.3 + Math.sin(t * 4) * 0.1; px(c, x - 6, y - 15 + b, 12, 13, "#60f0ff"); c.globalAlpha = 1;
      px(c, x - 4, y - 1, 8, 2, "#00000030");
      px(c, x - 1, y - 14 + b, 2, 2, "#c8fbff"); px(c, x - 3, y - 12 + b, 6, 6, "#4fd6f0"); px(c, x - 2, y - 6 + b, 4, 2, "#2fa8d0"); px(c, x - 1, y - 4 + b, 2, 1, "#2fa8d0");
      px(c, x - 2, y - 11 + b, 1, 4, "#ffffff"); px(c, x + 1, y - 10 + b, 1, 2, "#a6f6ff");
      const o = t * 2; px(c, x + Math.round(Math.cos(o) * 7), y - 9 + Math.round(Math.sin(o) * 3), 1, 1, "#ffffff"); px(c, x + Math.round(Math.cos(o + 3) * 7), y - 9 + Math.round(Math.sin(o + 3) * 3), 1, 1, "#b8f8ff");
      break;
    }
  }
  if (sh) px(c, x + 3, y - 10, 1, 1, "#ffffff");
}

export function drawItemIcon(c: Ctx, id: string, color: string, type: string, x: number, y: number, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  switch (type) {
    case "weapon": px(c, 3, 11, 3, 3, "#5a3a20"); for (let i = 0; i < 9; i++) px(c, 5 + i, 10 - i, 2, 2, color); px(c, 2, 9, 5, 1, "#d0b040"); break;
    case "armor": px(c, 3, 3, 10, 10, color); px(c, 1, 3, 3, 5, color); px(c, 12, 3, 3, 5, color); px(c, 6, 3, 4, 2, "#00000040"); px(c, 3, 11, 10, 2, "#00000040"); break;
    case "ring": c.strokeStyle = "#d0b040"; c.lineWidth = 2; c.beginPath(); c.arc(8, 9, 4, 0, Math.PI * 2); c.stroke(); px(c, 6, 3, 4, 3, color); break;
    case "amulet": c.strokeStyle = "#d0b040"; c.lineWidth = 1; c.beginPath(); c.arc(8, 5, 5, 0.2, Math.PI - 0.2); c.stroke(); px(c, 5, 8, 6, 6, color); px(c, 7, 9, 2, 2, "#fff"); break;
    case "potion": px(c, 6, 2, 4, 3, "#c0a080"); px(c, 4, 5, 8, 9, "#e0e8f0"); px(c, 5, 8, 6, 5, color); px(c, 6, 9, 1, 2, "#ffffff"); break;
    default: px(c, 3, 4, 10, 9, color); px(c, 4, 4, 3, 3, "#ffffff80"); px(c, 3, 11, 10, 2, "#00000040");
  }
  c.restore();
  void id;
}
