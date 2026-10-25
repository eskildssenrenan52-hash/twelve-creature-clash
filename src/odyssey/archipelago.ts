/**
 * Arquipélago de Ømnia — dados puros (sem DOM): barcos, física do velejar, mar, ilhas e missões.
 * Fase 1: 8 ilhas / 8 biomas novos. As coordenadas do mapa antigo não são tocadas: o mar vive
 * num espaço próprio e as ilhas são geradas numa região oceânica distante do mapa principal.
 */
import { ITEMS, type Recipe, type EnemyKind } from "./data";

// ---------------------------------------------------------------- itens
const M = (id: string, name: string, desc: string, color: string, price: number) => { ITEMS[id] = { id, name, type: "material", desc, color, price }; };
M("palm_rope", "Corda de Palmeira", "Fibra trançada que não apodrece no sal.", "#c8a868", 6);
M("linen_sail", "Vela de Linho", "Tecida com o Linho Celeste; segura o vento.", "#f2ecd8", 18);
M("forge_metal", "Metal das Forjas", "Liga escura dos Picos de Basalto.", "#7a7f8c", 22);
M("black_steel", "Aço Negro", "Aço temperado na maré gelada dos afogados.", "#3a3d4a", 60);
M("omnia_fragment", "Fragmento de Ømnia", "Um caco do mundo inteiro, antes de partir-se.", "#ffe9ff", 500);
M("coral_shard", "Lasca de Coral Rosado", "Cresce cantando nas marés rasas.", "#ff9ab8", 9);
M("raw_flax", "Linho Cru Celeste", "Fios azul-claros que lembram o céu.", "#bcd8ff", 7);
M("amber_resin", "Resina de Âmbar Cantante", "Guarda sons antigos dentro dela.", "#ffb040", 12);
M("glow_pearl", "Pérola-Vagalume", "Pisca no ritmo das ondas.", "#c8ffb0", 20);
M("obsidian_glass", "Vidro de Obsidiana", "Lâmina natural, quente ao toque.", "#4a2a5a", 16);
M("prism_dew", "Orvalho Prismático", "Cada gota decompõe a luz em sete.", "#a8f4ff", 18);
M("tide_iron", "Ferro de Maré", "Ferro que congela e degela com a lua.", "#9ab8d0", 15);
M("crown_dust", "Pó da Coroa", "Poeira dourada que flutua para cima.", "#ffe39a", 30);
M("boat_raft", "Jangada", "Barco simples: só costas e águas rasas.", "#b08850", 0);
M("boat_caravel", "Caravela à Vela", "Velas de linho, aproveita o vento: mar aberto.", "#e8dcc0", 0);
M("boat_carrack", "Carraca do Abismo", "Casco de aço negro: atravessa as fossas.", "#4a4458", 0);

// ---------------------------------------------------------------- barcos
export type BoatId = "raft" | "caravel" | "carrack";
export interface BoatDef {
  id: BoatId; name: string; tier: number;
  /** aceleração (px/s²), velocidade máx, giro (rad/s) */
  accel: number; maxSpeed: number; turn: number;
  /** 0..1 — quanto a velocidade lateral é preservada (derrapagem) */
  drift: number;
  /** quanto o vento soma à propulsão (0 = remo) */
  wind: number;
  /** 0..1 — quanto da corrente atua no casco */
  current: number;
  hull: number;
  /** profundidade máxima navegável: 1 = costas, 2 = mar aberto, 3 = fossas */
  maxDepth: number;
}
export const BOATS: Record<BoatId, BoatDef> = {
  raft: { id: "raft", name: "Jangada", tier: 1, accel: 46, maxSpeed: 95, turn: 2.6, drift: 0.9, wind: 0, current: 1, hull: 60, maxDepth: 1 },
  caravel: { id: "caravel", name: "Caravela à Vela", tier: 2, accel: 70, maxSpeed: 190, turn: 1.7, drift: 0.8, wind: 1, current: 0.55, hull: 140, maxDepth: 2 },
  carrack: { id: "carrack", name: "Carraca do Abismo", tier: 3, accel: 60, maxSpeed: 230, turn: 1.25, drift: 0.65, wind: 0.7, current: 0.2, hull: 320, maxDepth: 3 },
};
export const BOAT_ORDER: BoatId[] = ["raft", "caravel", "carrack"];

export const BOAT_RECIPES: Recipe[] = [
  { out: "palm_rope", qty: 2, station: "carpenter", cost: { wood: 1, herb: 1 }, gold: 0 },
  { out: "linen_sail", qty: 1, station: "carpenter", cost: { raw_flax: 3 }, gold: 5 },
  { out: "boat_raft", qty: 1, station: "carpenter", cost: { wood: 20, palm_rope: 10 }, gold: 0 },
  { out: "boat_caravel", qty: 1, station: "carpenter", cost: { wood: 40, linen_sail: 12, crystal_ore: 6 }, gold: 100 },
  { out: "boat_carrack", qty: 1, station: "carpenter", cost: { forge_metal: 20, black_steel: 8, omnia_fragment: 1 }, gold: 500 },
];
export const boatFromItem = (id: string): BoatId | null => (id.startsWith("boat_") ? (id.slice(5) as BoatId) : null);
/** Melhor barco que o jogador possui, lido das descobertas (`boat:<id>`). */
export function bestBoat(owned: ReadonlySet<string>): BoatDef | null {
  for (let i = BOAT_ORDER.length - 1; i >= 0; i--) { const id = BOAT_ORDER[i]!; if (owned.has(`boat:${id}`)) return BOATS[id]; }
  return null;
}

// ---------------------------------------------------------------- mar
export const SEA = 6000;
export const MAIN = { x: 3000, y: 3000, r: 420, name: "Ilha de Potos" };
export const SHALLOW = 150;
export const MID = 560;
export const TRENCH_R = 2350;

function h(n: number) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

export type IslandSize = "small" | "medium" | "large";
export interface IslandDef {
  id: string; name: string; biome: string; size: IslandSize;
  x: number; y: number; r: number; seed: number;
  /** barco mínimo (tier) */
  tier: number;
  origin: string;
  /** cor de grading [r,g,b,a] e cores do mapa marítimo */
  grade: [number, number, number, number];
  sand: string; land: string; accent: string;
  /** bioma-base reutilizado para música e inimigos */
  base: string;
  ground: number[]; obstacles: number[]; obstacleDensity: number;
  weather: { mode: "fall" | "rise" | "drift"; color: string; n: number; glow?: boolean };
  resources: { item: string; n: number }[];
  enemies: EnemyKind[];
  boss: { name: string; kind: EnemyKind; tint: string; scale: number; hp: number; drop: string; dropQty: number; lore: string };
  quests: { title: string; text: string }[];
  relic: { item: string; qty: number } | null;
}

// Índices dos tiles (iguais a world.T)
const G = { GRASS: 0, FLOWER: 1, PATH: 2, TREE: 4, SAND: 5, ROCK: 7, SNOW: 8, ICE: 9, CRYSTAL: 12, COBBLE: 13, PINE: 16, BUSH: 17, PILLAR: 18, DTREE: 20, AUTUMN: 26, AUTUMN_TREE: 27, MOSS: 28, PALM: 29, LAVA: 30, ASH: 31, MUSHROOM: 32, MEADOW: 33, RUINS: 34 };

const R_OF: Record<IslandSize, number> = { small: 170, medium: 280, large: 440 };
const isl = (d: Omit<IslandDef, "r" | "seed"> & { r?: number }, i: number): IslandDef => ({ ...d, r: d.r ?? R_OF[d.size], seed: 17 + i * 31 });

export const ISLANDS: IslandDef[] = [
  isl({ id: "coral", name: "Recife Rosado de Tamborim", biome: "Recife de Coral Cantante", size: "small", x: 3000, y: 2050, tier: 1,
    origin: "Quando o mundo de Ømnia se partiu, o primeiro caco a tocar o mar foi um tambor de festa. O mar, curioso, cobriu-o de coral — e até hoje o recife bate no ritmo da última celebração antes da Ruptura.",
    grade: [255, 120, 170, 0.14], sand: "#ffe2c8", land: "#f6b6c4", accent: "#ff7aa8", base: "coast",
    ground: [G.SAND, G.SAND, G.FLOWER], obstacles: [G.PALM, G.PALM, G.ROCK], obstacleDensity: 0.07,
    weather: { mode: "rise", color: "#ffd0e0", n: 40 }, resources: [{ item: "coral_shard", n: 22 }, { item: "palm_rope", n: 10 }],
    enemies: ["crab", "jelly", "frog"],
    boss: { name: "Caranguejo-Rei Tamborim", kind: "crab", tint: "#ff4a7a", scale: 2.4, hp: 9, drop: "coral_shard", dropQty: 12, lore: "Guarda o tambor afundado; bate as pinças no compasso dos mortos." },
    quests: [{ title: "O compasso do recife", text: "Colete 10 Lascas de Coral Rosado." }, { title: "A pinça que marca o tempo", text: "Derrote o Caranguejo-Rei Tamborim." }, { title: "A pedra do tambor", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "palm_rope", qty: 10 } }, 0),
  isl({ id: "flax", name: "Campos de Linho Celeste", biome: "Pradaria de Linho Azul", size: "medium", x: 2050, y: 3350, tier: 1,
    origin: "Uma tecelã do céu derrubou seu fuso na Ruptura. Os fios caíram como chuva azul e brotaram em campos que ondulam como um segundo mar. Toda vela do arquipélago nasce aqui.",
    grade: [140, 180, 255, 0.14], sand: "#efe6c8", land: "#a8c8f0", accent: "#e8f2ff", base: "meadow",
    ground: [G.MEADOW, G.MEADOW, G.FLOWER, G.GRASS], obstacles: [G.BUSH, G.TREE, G.BUSH], obstacleDensity: 0.05,
    weather: { mode: "drift", color: "#dfeaff", n: 50 }, resources: [{ item: "raw_flax", n: 34 }, { item: "herb", n: 10 }],
    enemies: ["crow", "boar", "sprite"],
    boss: { name: "Espantalho Tecelão", kind: "skeleton", tint: "#7aa8ff", scale: 2.3, hp: 10, drop: "linen_sail", dropQty: 4, lore: "Costurado com sobras do fuso celeste; ainda tenta terminar um manto para ninguém." },
    quests: [{ title: "Fios do céu", text: "Colete 15 Linhos Crus Celestes." }, { title: "O manto sem dono", text: "Derrote o Espantalho Tecelão." }, { title: "O fuso caído", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "linen_sail", qty: 3 } }, 1),
  isl({ id: "amber", name: "Bosque de Âmbar Cantante", biome: "Floresta de Resina Dourada", size: "medium", x: 3950, y: 3300, tier: 1,
    origin: "As árvores daqui engoliram os gritos da Ruptura e os transformaram em resina. Encoste o ouvido no âmbar e você ouvirá a última canção do Coro antes de o mundo se calar.",
    grade: [255, 170, 60, 0.18], sand: "#f2d9a0", land: "#d88a30", accent: "#ffcc60", base: "autumn",
    ground: [G.AUTUMN, G.AUTUMN, G.MOSS], obstacles: [G.AUTUMN_TREE, G.AUTUMN_TREE, G.BUSH], obstacleDensity: 0.11,
    weather: { mode: "fall", color: "#ffb84a", n: 45 }, resources: [{ item: "amber_resin", n: 24 }, { item: "wood", n: 24 }],
    enemies: ["treant", "beetle", "pixie"],
    boss: { name: "Velho Seiva-de-Mel", kind: "treant", tint: "#ffa020", scale: 2.6, hp: 11, drop: "amber_resin", dropQty: 10, lore: "A árvore mais velha; canta para dormir e acorda furiosa quando cortam seus filhos." },
    quests: [{ title: "Canções presas", text: "Colete 12 Resinas de Âmbar Cantante." }, { title: "O despertar do Seiva-de-Mel", text: "Derrote o Velho Seiva-de-Mel." }, { title: "A canção engolida", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "wood", qty: 20 } }, 2),
  isl({ id: "glow", name: "Atol dos Vagalumes Abissais", biome: "Lagoa Bioluminescente", size: "small", x: 4700, y: 1800, tier: 2,
    origin: "Um fragmento do céu noturno caiu no mar e não quis apagar. As estrelas viraram vagalumes, as constelações viraram pérolas, e a lagoa ficou com saudade da escuridão de cima.",
    grade: [60, 255, 200, 0.16], sand: "#cfe8d8", land: "#2f8a7a", accent: "#b0ffc0", base: "swamp",
    ground: [G.MOSS, G.MOSS, G.GRASS], obstacles: [G.MUSHROOM, G.PALM, G.BUSH], obstacleDensity: 0.08,
    weather: { mode: "drift", color: "#c8ff90", n: 70, glow: true }, resources: [{ item: "glow_pearl", n: 18 }, { item: "mana_shard", n: 6 }],
    enemies: ["jelly", "wisp", "frog"],
    boss: { name: "Medusa Lanterna", kind: "jelly", tint: "#60ffd0", scale: 2.7, hp: 12, drop: "glow_pearl", dropQty: 8, lore: "Acende-se para atrair navegantes perdidos, como a lua fazia antes de rachar." },
    quests: [{ title: "Constelação de bolso", text: "Colete 8 Pérolas-Vagalume." }, { title: "A lanterna das profundezas", text: "Derrote a Medusa Lanterna." }, { title: "O céu que caiu", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "glow_pearl", qty: 3 } }, 3),
  isl({ id: "basalt", name: "Picos de Basalto Fumegante", biome: "Forjas Vulcânicas Colunares", size: "large", x: 1350, y: 1600, tier: 2,
    origin: "Aqui ficava a bigorna do mundo. Quando Ømnia se partiu, a bigorna rachou junto e as forjas nunca mais esfriaram. Os anões-de-cinza ainda martelam, sem saber que o rei a quem serviam já não existe.",
    grade: [255, 80, 40, 0.18], sand: "#5a4a48", land: "#3a3036", accent: "#ff6a20", base: "volcanic",
    ground: [G.ASH, G.ASH, G.COBBLE], obstacles: [G.ROCK, G.ROCK, G.LAVA, G.PILLAR], obstacleDensity: 0.09,
    weather: { mode: "rise", color: "#ff7a3a", n: 60, glow: true }, resources: [{ item: "forge_metal", n: 30 }, { item: "obsidian_glass", n: 16 }, { item: "iron_ore", n: 12 }],
    enemies: ["salamander", "imp", "golem"],
    boss: { name: "Forjador Escamado", kind: "salamander", tint: "#ff3a10", scale: 2.8, hp: 14, drop: "forge_metal", dropQty: 10, lore: "Último ferreiro do rei; tem as escamas soldadas com o próprio martelo." },
    quests: [{ title: "Metal que não esfria", text: "Colete 20 Metais das Forjas." }, { title: "O martelo do rei morto", text: "Derrote o Forjador Escamado." }, { title: "A bigorna rachada", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "forge_metal", qty: 6 } }, 4),
  isl({ id: "prism", name: "Jardins de Névoa Prismática", biome: "Jardim de Cristais Arco-Íris", size: "medium", x: 1250, y: 4500, tier: 2,
    origin: "A luz do mundo também se partiu. Cada cor fugiu para um lado, e a névoa daqui é onde elas se escondem. Quem caminha nos jardins sai com a sombra de outra cor.",
    grade: [180, 140, 255, 0.16], sand: "#f0e8ff", land: "#b8a0f0", accent: "#80f0ff", base: "mushroom",
    ground: [G.FLOWER, G.GRASS, G.MEADOW], obstacles: [G.CRYSTAL, G.CRYSTAL, G.PILLAR], obstacleDensity: 0.08,
    weather: { mode: "drift", color: "#a0f0ff", n: 60, glow: true }, resources: [{ item: "prism_dew", n: 20 }, { item: "crystal_ore", n: 12 }],
    enemies: ["pixie", "sprite", "wisp"],
    boss: { name: "Rainha do Arco-Íris Partido", kind: "pixie", tint: "#ff80ff", scale: 2.5, hp: 12, drop: "prism_dew", dropQty: 8, lore: "Coleciona cores roubadas; perdeu a própria e veste as dos outros." },
    quests: [{ title: "Sete gotas", text: "Colete 10 Orvalhos Prismáticos." }, { title: "A coroa sem cor", text: "Derrote a Rainha do Arco-Íris Partido." }, { title: "A luz em fuga", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "crystal_ore", qty: 6 } }, 5),
  isl({ id: "tide", name: "Necrópole das Marés Geladas", biome: "Cemitério de Navios Congelado", size: "large", x: 4800, y: 4700, tier: 2,
    origin: "Toda frota que tentou fugir da Ruptura encalhou aqui. A maré congelou os navios no meio da fuga, e seus almirantes ainda dão ordens a tripulações de gelo.",
    grade: [140, 200, 255, 0.2], sand: "#dfe8f0", land: "#9ab0c8", accent: "#e8f8ff", base: "mountain",
    ground: [G.SNOW, G.SNOW, G.ICE, G.RUINS], obstacles: [G.PINE, G.PILLAR, G.ROCK], obstacleDensity: 0.08,
    weather: { mode: "fall", color: "#ffffff", n: 80 }, resources: [{ item: "tide_iron", n: 24 }, { item: "frost_herb", n: 10 }],
    enemies: ["skeleton", "wraith", "wolf"],
    boss: { name: "Almirante Afogado", kind: "wraith", tint: "#80c0ff", scale: 2.8, hp: 15, drop: "black_steel", dropQty: 8, lore: "Ordenou a fuga que matou a frota inteira; sua espada de aço negro nunca enferruja." },
    quests: [{ title: "Ferro que respira", text: "Colete 15 Ferros de Maré." }, { title: "A última ordem", text: "Derrote o Almirante Afogado." }, { title: "A frota congelada", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "omnia_fragment", qty: 1 } }, 6),
  isl({ id: "crown", name: "Coroa de Ømnia Fraturada", biome: "Ruínas Flutuantes Douradas", size: "large", r: 560, x: 450, y: 450, tier: 3,
    origin: "Este é o pedaço onde ficava o trono. Ømnia, a soberana que era o próprio mundo, partiu-se em ilhas para não morrer inteira. Cada ilha guarda um pedaço da memória dela — e a Coroa guarda a vontade.",
    grade: [255, 220, 120, 0.18], sand: "#f6ecc8", land: "#c8b070", accent: "#fff0a0", base: "ruins",
    ground: [G.RUINS, G.COBBLE, G.GRASS], obstacles: [G.PILLAR, G.CRYSTAL, G.DTREE], obstacleDensity: 0.07,
    weather: { mode: "rise", color: "#ffe39a", n: 55, glow: true }, resources: [{ item: "crown_dust", n: 20 }, { item: "mana_shard", n: 12 }],
    enemies: ["gargoyle", "golem", "wraith"],
    boss: { name: "Vontade Coroada", kind: "gargoyle", tint: "#ffd040", scale: 3, hp: 18, drop: "crown_dust", dropQty: 12, lore: "A vontade de Ømnia, sem corpo, que ainda protege o trono vazio." },
    quests: [{ title: "Poeira de rainha", text: "Colete 12 Pós da Coroa." }, { title: "O trono vazio", text: "Derrote a Vontade Coroada." }, { title: "Por que o mundo se partiu", text: "Leia o monólito de origem no centro da ilha." }],
    relic: { item: "elixir", qty: 3 } }, 7),
];

// ---------------------------------------------------------------- forma das ilhas
/** Raio da costa no ângulo a (mesma função para o mapa marítimo e para os tiles). */
export function coastRadius(r: number, seed: number, a: number) {
  return r * (1 + 0.16 * Math.sin(3 * a + seed) + 0.09 * Math.sin(5 * a + seed * 1.7) + 0.05 * Math.sin(9 * a + seed * 2.3));
}
const MAIN_SEED = 3.1;
export function landAt(x: number, y: number): { id: string | null; inside: boolean; coast: number } {
  let best = Infinity, id: string | null = null;
  const consider = (cx: number, cy: number, r: number, seed: number, key: string | null) => {
    const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), cr = coastRadius(r, seed, Math.atan2(dy, dx));
    const c = d - cr; if (c < best) { best = c; id = key; }
  };
  consider(MAIN.x, MAIN.y, MAIN.r, MAIN_SEED, "main");
  for (const i of ISLANDS) consider(i.x, i.y, i.r, i.seed, i.id);
  return { id, inside: best <= 0, coast: best };
}
/** 0 terra · 1 raso · 2 médio/costas · 3 mar aberto · 4 fossa abissal */
export function depthAt(x: number, y: number) {
  const { coast } = landAt(x, y);
  if (coast <= 0) return 0;
  if (coast < SHALLOW) return 1;
  if (coast < MID) return 2;
  return Math.hypot(x - MAIN.x, y - MAIN.y) > TRENCH_R ? 4 : 3;
}
/** Profundidade em "níveis de barco" (1 costas · 2 mar aberto · 3 fossas). */
export const depthTier = (d: number) => (d <= 2 ? 1 : d === 3 ? 2 : 3);

export interface Rock { x: number; y: number; r: number }
export const ROCKS: Rock[] = (() => {
  const out: Rock[] = [];
  for (let i = 0; out.length < 140 && i < 2000; i++) {
    const x = 200 + h(i * 2.1) * (SEA - 400), y = 200 + h(i * 3.7 + 9) * (SEA - 400), c = landAt(x, y).coast;
    if (c > 60 && c < 900) out.push({ x, y, r: 8 + h(i * 5.3) * 16 });
  }
  return out;
})();

export interface Current { x: number; y: number; r: number; vx: number; vy: number }
export const CURRENTS: Current[] = [
  { x: 3000, y: 1500, r: 420, vx: 55, vy: 0 }, { x: 4500, y: 3000, r: 380, vx: 0, vy: 60 },
  { x: 3000, y: 4500, r: 420, vx: -55, vy: 0 }, { x: 1500, y: 3000, r: 380, vx: 0, vy: -60 },
  { x: 1600, y: 900, r: 360, vx: -40, vy: -40 }, { x: 5200, y: 5200, r: 360, vx: 45, vy: 30 },
];
export function currentAt(x: number, y: number) {
  let vx = 0, vy = 0;
  for (const c of CURRENTS) { const d = Math.hypot(x - c.x, y - c.y); if (d < c.r) { const k = 1 - d / c.r; vx += c.vx * k; vy += c.vy * k; } }
  return { vx, vy };
}
/** Vento gira lentamente com o tempo. */
export function windAt(t: number) { const a = t * 0.05 + Math.sin(t * 0.013) * 1.4; return { a, s: 0.6 + 0.4 * Math.sin(t * 0.07) }; }

// ---------------------------------------------------------------- física do barco
export interface BoatState { x: number; y: number; a: number; vx: number; vy: number; hull: number; anchored: boolean }
export interface BoatInput { throttle: number; turn: number }
export interface StepResult { blocked: "deep" | "rock" | "land" | null; landId: string | null }

/** Um passo de física. Pura e determinística: usada no jogo e nos testes. */
export function stepBoat(s: BoatState, boat: BoatDef, inp: BoatInput, dt: number, t: number): StepResult {
  if (s.anchored) { s.vx *= 0.8; s.vy *= 0.8; return { blocked: null, landId: null }; }
  const speed = Math.hypot(s.vx, s.vy);
  s.a += inp.turn * boat.turn * dt * (0.35 + Math.min(1, speed / 60) * 0.65);
  const fx = Math.cos(s.a), fy = Math.sin(s.a);
  // propulsão: remo/vela; o vento soma quando sopra a favor do casco
  const w = windAt(t), windAlign = Math.max(0, Math.cos(w.a - s.a));
  const push = boat.accel * inp.throttle * (1 + boat.wind * w.s * (windAlign * 1.2 - 0.25));
  s.vx += fx * push * dt; s.vy += fy * push * dt;
  // derrapagem: separa a velocidade em frontal e lateral, amortece a lateral
  const fwd = s.vx * fx + s.vy * fy, lat = -s.vx * fy + s.vy * fx;
  const latK = Math.pow(boat.drift, dt * 10), drag = Math.pow(0.55, dt);
  let nf = fwd * drag, nl = lat * latK * drag;
  const max = boat.maxSpeed * (1 + boat.wind * w.s * windAlign * 0.35);
  if (Math.abs(nf) > max) nf = Math.sign(nf) * max;
  s.vx = fx * nf - fy * nl; s.vy = fy * nf + fx * nl;
  // correntes
  const cur = currentAt(s.x, s.y);
  const nx = s.x + (s.vx + cur.vx * boat.current) * dt, ny = s.y + (s.vy + cur.vy * boat.current) * dt;
  // limites do mar
  if (nx < 40 || ny < 40 || nx > SEA - 40 || ny > SEA - 40) { s.vx *= -0.4; s.vy *= -0.4; return { blocked: "deep", landId: null }; }
  // rochas
  for (const r of ROCKS) {
    const d = Math.hypot(nx - r.x, ny - r.y);
    if (d < r.r + 10) {
      const imp = Math.hypot(s.vx, s.vy);
      const ux = (nx - r.x) / (d || 1), uy = (ny - r.y) / (d || 1);
      s.vx = ux * imp * 0.5; s.vy = uy * imp * 0.5; s.x += ux * 2; s.y += uy * 2;
      if (imp > 40) s.hull = Math.max(0, s.hull - Math.round(imp / 12));
      return { blocked: "rock", landId: null };
    }
  }
  const depth = depthAt(nx, ny);
  if (depth === 0) { const id = landAt(nx, ny).id; s.vx *= -0.25; s.vy *= -0.25; return { blocked: "land", landId: id }; }
  if (depthTier(depth) > boat.maxDepth) { s.vx *= -0.5; s.vy *= -0.5; return { blocked: "deep", landId: null }; }
  s.x = nx; s.y = ny;
  return { blocked: null, landId: null };
}

/** Ilha (ou ilha principal) cuja praia está a até `reach` px. */
export function nearShore(x: number, y: number, reach = 40) {
  const l = landAt(x, y);
  return l.coast < reach ? l.id : null;
}
export const islandById = (id: string) => ISLANDS.find((i) => i.id === id) ?? null;
export const ISLAND_TILES_PER_PX = 0.22;
/** Tamanho (em tiles) do lado do quadrado que contém a ilha. */
export const islandTileSpan = (i: IslandDef) => Math.ceil(i.r * 1.35 * 2 * ISLAND_TILES_PER_PX) + 8;
