// A Grande Crônica — a história 100x maior: 6 facções, 60 missões principais com escolhas,
// 3 finais, ~2.250 moradores, ~2.600 histórias paralelas, ~9.250 missões e ~1.700 cenas.
// Tudo é dado puro e determinístico (gerado por índice, sob demanda) para não pesar no download
// nem travar aparelhos fracos: nada é montado até alguém pedir.
import type { Palette } from './data';
import { BIOME_LIST } from './world';
import { BIOME_NAMES } from './data';

/* ───────── utilidades determinísticas ───────── */
export function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const pick = <T,>(r: () => number, a: readonly T[]): T => a[Math.floor(r() * a.length)]!;

/* ───────── Facções ───────── */
export type FactionId = 'coro' | 'raiz' | 'mare' | 'forja' | 'veu' | 'silencio';
export interface Faction { id: FactionId; name: string; motto: string; leader: string; color: string; desc: string; pal: Palette; rival: FactionId }
export const FACTIONS: Faction[] = [
  { id: 'coro', name: 'Coro da Árvore', motto: 'Toda nota merece voltar.', leader: 'Matriarca Lírien', color: '#f0d060', desc: 'Guardiões da Canção, sacerdotes da Árvore de Mana.', pal: { skin: '#f0c8a0', hair: '#f8f0d0', body: '#d0a030', legs: '#6a4a10' }, rival: 'silencio' },
  { id: 'raiz', name: 'Círculo das Raízes', motto: 'O que cresce devagar, cresce fundo.', leader: 'Druida Oaken', color: '#70c060', desc: 'Druidas e lavradores que ouvem a terra.', pal: { skin: '#d8a878', hair: '#405020', body: '#3a7a30', legs: '#2a3a18' }, rival: 'forja' },
  { id: 'mare', name: 'Liga da Maré', motto: 'Todo porto é uma promessa.', leader: 'Almirante Nerys', color: '#50b0e0', desc: 'Marujos, mercadores e cartógrafos do arquipélago.', pal: { skin: '#c89070', hair: '#202838', body: '#2a5a90', legs: '#1a2a40' }, rival: 'veu' },
  { id: 'forja', name: 'Irmandade da Forja', motto: 'Ferro não esquece.', leader: 'Mestra Brunhild', color: '#e07040', desc: 'Ferreiros, mineiros e engenheiros das montanhas.', pal: { skin: '#e0a880', hair: '#c04020', body: '#6a3a20', legs: '#302018' }, rival: 'raiz' },
  { id: 'veu', name: 'Ordem do Véu', motto: 'Há verdades que só a sombra guarda.', leader: 'Oráculo Sefira', color: '#a080e0', desc: 'Estudiosos dos segredos e dos Reinos Ocultos.', pal: { skin: '#e8d0c0', hair: '#302050', body: '#4a3080', legs: '#201838' }, rival: 'mare' },
  { id: 'silencio', name: 'Filhos do Silêncio', motto: 'O silêncio também é uma canção.', leader: 'Vael, o Cinzento', color: '#9098a8', desc: 'Os que acreditam que esquecer é uma bondade.', pal: { skin: '#c8c8d0', hair: '#606870', body: '#383c48', legs: '#202228' }, rival: 'coro' },
];
export const FACTION_BY_ID = Object.fromEntries(FACTIONS.map((f) => [f.id, f])) as Record<FactionId, Faction>;

/* ───────── Finais ───────── */
export type EndingId = 'cancao' | 'silencio' | 'harmonia';
export const ENDINGS: Record<EndingId, { title: string; lines: string[] }> = {
  cancao: { title: 'Final — A Canção Inteira', lines: ['Você toca a última nota e o mundo inteiro responde.', 'Vael chora ao ouvir a voz da mãe de novo, dentro da Canção.', 'O Coro canta por sete dias. Nada mais é esquecido — nem a dor.', 'FIM — A Canção Inteira.'] },
  silencio: { title: 'Final — O Silêncio Gentil', lines: ['Você abaixa o arco. Algumas notas merecem descansar.', 'Vael segura sua mão: — Obrigado por me ouvir.', 'O mundo esquece suas feridas mais antigas, e com elas, alguns nomes.', 'FIM — O Silêncio Gentil.'] },
  harmonia: { title: 'Final — A Harmonia dos Seis', lines: ['Seis vozes, seis bandeiras, uma só melodia.', 'Coro e Silêncio dividem o mesmo palco pela primeira vez.', 'A Canção não volta igual: volta com espaço para o silêncio entre as notas.', 'FIM — A Harmonia dos Seis.'] },
};

/* ───────── Objetivos (usam contadores que o jogo já acompanha) ───────── */
export type Objective =
  | { kind: 'kills'; n: number }
  | { kind: 'biomes'; n: number }
  | { kind: 'level'; n: number }
  | { kind: 'gold'; n: number }
  | { kind: 'visit'; biome: string };
export function objectiveText(o: Objective): string {
  switch (o.kind) {
    case 'kills': return `Derrote ${o.n} inimigos`;
    case 'biomes': return `Visite ${o.n} biomas diferentes`;
    case 'level': return `Alcance o nível ${o.n}`;
    case 'gold': return `Entregue ${o.n} de ouro`;
    case 'visit': return `Vá até ${BIOME_NAMES[o.biome as keyof typeof BIOME_NAMES] ?? o.biome}`;
  }
}

/* ───────── Cenas (cutscenes) ───────── */
export type StageFx = 'none' | 'flash' | 'rain' | 'embers' | 'stars' | 'quake' | 'petals';
export interface SceneActor { name: string; pal: Palette }
export interface EpicScene { id: string; title: string; lines: string[]; actors: SceneActor[]; fx: StageFx; sky: string; ground: string }
const HERO: SceneActor = { name: 'Você', pal: { skin: '#f0c8a0', hair: '#f0d040', body: '#3070c0', legs: '#2a3050' } };
const SKIES = ['#1a2440', '#3a2050', '#402818', '#103040', '#202830', '#4a2a40', '#183828'];
const GROUNDS = ['#3a6a30', '#7a6a40', '#305a70', '#5a4a3a', '#6a6a78', '#4a3050', '#2a4a28'];

/* ───────── Missões principais (60) ───────── */
export interface MainChoice { label: string; result: string; rep: Partial<Record<FactionId, number>>; ending: EndingId }
export interface MainQuest { idx: number; act: number; id: string; title: string; giver: FactionId; desc: string; obj: Objective; choices: [MainChoice, MainChoice]; intro: EpicScene; outro: [EpicScene, EpicScene] }
const ACT_TITLES = ['Ecos Distantes', 'As Bandeiras Erguidas', 'O Mar de Vozes', 'Ferro e Raiz', 'O Véu Rasgado', 'A Última Nota'];
const PLACES = ['o farol quebrado', 'a ponte de ossos', 'o mercado flutuante', 'a mina cantante', 'o templo submerso', 'a torre sem sombra', 'o bosque das lanternas', 'a cidadela de vidro', 'o deserto de sinos', 'a ilha dos relógios'];
const THREATS = ['um coro de sombras', 'um dragão sem voz', 'um exército de espantalhos', 'uma maré negra', 'um eclipse cantado', 'um golem esquecido', 'uma praga de silêncio', 'um rei que não lembra o nome'];
const VERBS = ['proteger', 'investigar', 'resgatar', 'reconstruir', 'escoltar', 'purificar', 'negociar em', 'defender'];

function mainQuest(i: number): MainQuest {
  const r = rng(9000 + i), act = Math.floor(i / 10) + 1;
  const giver = FACTIONS[i % 6]!, other = FACTION_BY_ID[giver.rival];
  const place = pick(r, PLACES), threat = pick(r, THREATS), verb = pick(r, VERBS);
  const biome = BIOME_LIST[(i * 7) % BIOME_LIST.length]!;
  const objs: Objective[] = [{ kind: 'kills', n: 8 + i * 3 }, { kind: 'visit', biome }, { kind: 'biomes', n: Math.min(30, 2 + Math.floor(i / 2)) }, { kind: 'level', n: 2 + Math.floor(i * 0.9) }, { kind: 'gold', n: 60 + i * 25 }];
  const obj = objs[i % objs.length]!;
  const title = `${['I', 'II', 'III', 'IV', 'V', 'VI'][act - 1]}.${(i % 10) + 1} — ${verb[0]!.toUpperCase()}${verb.slice(1)} ${place}`;
  const desc = `${giver.leader} pede ajuda: ${threat} ameaça ${place}. ${objectiveText(obj)}.`;
  const endA: EndingId = giver.id === 'silencio' ? 'silencio' : 'cancao';
  const choices: [MainChoice, MainChoice] = [
    { label: `Ficar com ${giver.name}`, result: `${giver.leader} agradece. ${other.name} não esquece a escolha.`, rep: { [giver.id]: 3, [other.id]: -2 }, ending: endA },
    { label: `Buscar um acordo com ${other.name}`, result: `As duas facções se olham pela primeira vez sem armas.`, rep: { [giver.id]: 1, [other.id]: 2 }, ending: i % 3 === 0 ? 'silencio' : 'harmonia' },
  ];
  const sky = SKIES[i % SKIES.length]!, ground = GROUNDS[(i * 3) % GROUNDS.length]!;
  const fxs: StageFx[] = ['stars', 'embers', 'rain', 'petals', 'quake', 'flash'];
  const leader: SceneActor = { name: giver.leader, pal: giver.pal }, rival: SceneActor = { name: other.leader, pal: other.pal };
  const intro: EpicScene = { id: `epic_m${i}_in`, title: `${ACT_TITLES[act - 1]} — ${title}`, actors: [HERO, leader], fx: fxs[i % fxs.length]!, sky, ground, lines: [
    `${giver.leader} aparece sob a luz de ${place}.`, `— ${threat[0]!.toUpperCase()}${threat.slice(1)} chegou. ${giver.motto}`, `— Precisamos de você. ${objectiveText(obj)}.`, `Ao longe, ${other.leader} observa em silêncio.` ] };
  const outro: [EpicScene, EpicScene] = [
    { id: `epic_m${i}_a`, title: `${title} — Lealdade`, actors: [HERO, leader], fx: 'flash', sky, ground, lines: [`Você escolhe ${giver.name}.`, `— Eu sabia que podia contar com você — diz ${giver.leader}.`, choices[0].result] },
    { id: `epic_m${i}_b`, title: `${title} — Acordo`, actors: [leader, HERO, rival], fx: 'stars', sky, ground, lines: [`Você chama ${other.leader} para a mesa.`, `— Você é corajoso ou tolo — diz ${other.leader}. — Talvez os dois.`, choices[1].result] },
  ];
  return { idx: i, act, id: `epic_m${i}`, title, giver: giver.id, desc, obj, choices, intro, outro };
}
export const MAIN_COUNT = 60;
const mainCache = new Map<number, MainQuest>();
export const getMain = (i: number) => { let q = mainCache.get(i); if (!q) { q = mainQuest(i); mainCache.set(i, q); } return q; };

/* ───────── Moradores (~2.250) ───────── */
export const RESIDENT_COUNT = 2250;
const FIRST = ['Ana', 'Bento', 'Cora', 'Davi', 'Elis', 'Fábio', 'Gaia', 'Heitor', 'Iara', 'João', 'Kiara', 'Lino', 'Maya', 'Nuno', 'Olga', 'Pedro', 'Quira', 'Rui', 'Sol', 'Tito', 'Uma', 'Vera', 'Wado', 'Xena', 'Yuri', 'Zaya', 'Aurora', 'Bruno', 'Cecília', 'Dante', 'Estela', 'Flora', 'Gael', 'Helena', 'Ícaro', 'Jade', 'Leda', 'Marco', 'Noa', 'Otto'];
const LAST = ['das Dunas', 'do Vale', 'Pedraluz', 'Ventoleve', 'da Maré', 'Ferrobravo', 'Raizfunda', 'Sinobranco', 'do Farol', 'Lua-Mansa', 'Cinzafria', 'Brasaviva', 'do Moinho', 'Orvalhado', 'Estrelado'];
const JOBS = ['pescador', 'tecelã', 'ferreiro', 'cartógrafa', 'pastor', 'curandeira', 'mineiro', 'bardo', 'padeira', 'guarda', 'eremita', 'mercadora', 'apicultor', 'vidraceira', 'lenhador'];
export interface Resident { idx: number; id: string; name: string; job: string; biome: string; faction: FactionId; pal: Palette; line: string }
export function resident(i: number): Resident {
  const r = rng(30000 + i);
  const f = FACTIONS[Math.floor(r() * 6)]!;
  const biome = BIOME_LIST[i % BIOME_LIST.length]!;
  const name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
  const hue = Math.floor(r() * 360);
  return { idx: i, id: `res_${i}`, name, job: pick(r, JOBS), biome, faction: f.id, line: `${pick(r, ['Dizem que', 'Minha avó jurava que', 'Ouvi no mercado que', 'Ninguém acredita, mas'])} ${pick(r, THREATS)} passou por ${pick(r, PLACES)}.`,
    pal: { skin: pick(r, ['#f0c8a0', '#d8a878', '#a87050', '#704830', '#e8d0c0']), hair: `hsl(${hue} 40% 30%)`, body: `hsl(${(hue + 140) % 360} 45% 40%)`, legs: `hsl(${(hue + 200) % 360} 30% 22%)` } };
}

/* ───────── Histórias paralelas (~2.600) e missões (~9.250) ───────── */
export const SIDE_STORY_COUNT = 2600;
export const MISSION_COUNT = 9250;
export interface SideStory { idx: number; id: string; title: string; resident: number; faction: FactionId; missions: number[]; scene: EpicScene | null }
const STORY_HOOKS = ['A carta que nunca chegou', 'O sino roubado', 'A filha do faroleiro', 'O mapa rasgado', 'A dívida do ferreiro', 'O lobo que fala', 'A festa interrompida', 'O poço sem fundo', 'A canção da avó', 'O barco fantasma', 'A semente de prata', 'O juramento quebrado', 'O espelho que lembra', 'A trilha das lanternas'];
// 9250 missões repartidas: as primeiras 1450 histórias têm 4 missões, as outras 1150 têm 3 (1450*4 + 1150*3 = 9250).
const missionStart = (s: number) => (s < 1450 ? s * 4 : 1450 * 4 + (s - 1450) * 3);
const missionCountOf = (s: number) => (s < 1450 ? 4 : 3);
// ~1.700 cenas no total: 60 abertura + 120 desfechos + 6 facções + 3 finais = 189; as 1.511 primeiras histórias têm cena própria.
export const STORY_SCENES = 1511;
export const SCENE_COUNT = MAIN_COUNT * 3 + FACTIONS.length + 3 + STORY_SCENES;
export function sideStory(s: number): SideStory {
  const r = rng(50000 + s), res = resident((s * 13) % RESIDENT_COUNT);
  const title = `${pick(r, STORY_HOOKS)} de ${res.name.split(' ')[0]}`;
  const start = missionStart(s);
  const missions = Array.from({ length: missionCountOf(s) }, (_, k) => start + k);
  const scene: EpicScene | null = s < STORY_SCENES ? { id: `epic_s${s}`, title, actors: [HERO, { name: res.name, pal: res.pal }], fx: pick(r, ['none', 'rain', 'stars', 'petals', 'embers'] as const), sky: pick(r, SKIES), ground: pick(r, GROUNDS),
    lines: [`${res.name}, ${res.job} de ${BIOME_NAMES[res.biome as keyof typeof BIOME_NAMES] ?? res.biome}, segura seu braço.`, `— ${res.line}`, `— Se você me ajudar, conto o resto. É uma história de ${FACTION_BY_ID[res.faction].name}.`] } : null;
  return { idx: s, id: `side_${s}`, title, resident: res.idx, faction: res.faction, missions, scene };
}
export interface Mission { idx: number; id: string; story: number; step: number; title: string; obj: Objective; reward: { gold: number; xp: number; rep: number } }
export function storyOfMission(m: number) { return m < 1450 * 4 ? Math.floor(m / 4) : 1450 + Math.floor((m - 1450 * 4) / 3); }
export function mission(m: number): Mission {
  const s = storyOfMission(m), step = m - missionStart(s), r = rng(80000 + m);
  const tier = 1 + Math.floor(s / 100);
  const objs: Objective[] = [{ kind: 'kills', n: 3 + (tier % 10) + step }, { kind: 'visit', biome: BIOME_LIST[(s + step * 5) % BIOME_LIST.length]! }, { kind: 'gold', n: 20 + tier * 10 }, { kind: 'kills', n: 5 + step * 2 }];
  const obj = objs[Math.floor(r() * objs.length)]!;
  return { idx: m, id: `mis_${m}`, story: s, step, title: `${sideStory(s).title} · parte ${step + 1}`, obj, reward: { gold: 15 + tier * 6, xp: 20 + tier * 10, rep: 1 } };
}

/* ───────── Cenas de facção ───────── */
export const factionScene = (f: Faction): EpicScene => ({ id: `epic_f_${f.id}`, title: `${f.name}`, actors: [HERO, { name: f.leader, pal: f.pal }], fx: f.id === 'silencio' ? 'rain' : 'stars', sky: '#1a1830', ground: '#3a3448',
  lines: [`A bandeira de ${f.name} tremula ao vento.`, `${f.leader}: — ${f.motto}`, f.desc, `— Nossa porta está aberta para você, viajante.`] });
export const endingScene = (e: EndingId): EpicScene => ({ id: `epic_end_${e}`, title: ENDINGS[e].title, actors: e === 'harmonia' ? [HERO, ...FACTIONS.slice(0, 2).map((f) => ({ name: f.leader, pal: f.pal }))] : [HERO, { name: FACTION_BY_ID.silencio.leader, pal: FACTION_BY_ID.silencio.pal }], fx: e === 'silencio' ? 'rain' : e === 'cancao' ? 'flash' : 'petals', sky: '#100820', ground: '#304028', lines: ENDINGS[e].lines });

/* ───────── Regras ───────── */
export const REP_MIN = -20, REP_MAX = 30;
export const clampRep = (v: number) => Math.max(REP_MIN, Math.min(REP_MAX, v));
/** Preço multiplicado pela reputação com a facção: +30 → 20% de desconto, −20 → 20% mais caro. */
export function repPriceMult(rep: number) { return rep >= 0 ? 1 - Math.min(0.2, rep / 150) : 1 + Math.min(0.2, -rep / 100); }
/** O final é o que tiver mais pontos; empate favorece Harmonia, depois Canção. */
export function decideEnding(points: Record<EndingId, number>): EndingId {
  const order: EndingId[] = ['harmonia', 'cancao', 'silencio'];
  return order.reduce((best, e) => (points[e] > points[best] ? e : best), order[0]!);
}
