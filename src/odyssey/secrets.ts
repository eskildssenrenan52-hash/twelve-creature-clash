// Os Segredos do Cântico Oculto: 300 enigmas em várias etapas e 13 biomas secretos (Reinos Ocultos).
// Dado puro e determinístico (sem canvas) para que os testes validem todas as cadeias.
import type { Biome, EnemyKind } from './data';
import { T } from './world';

export type StepKind = 'touch' | 'night' | 'day' | 'rain' | 'offer' | 'riddle' | 'depth';
export interface Riddle { q: string; options: string[]; correct: number }
export interface SecretStep {
  kind: StepKind;
  /** Índice do templo-âncora (TEMPLES) e deslocamento em tiles. Ausente em etapas de profundeza. */
  anchor?: number; dx?: number; dy?: number;
  item?: string; qty?: number; floor?: number; riddle?: Riddle;
}
export interface SecretChain { id: string; circle: number; name: string; steps: SecretStep[]; reward: { gold: number; xp: number; item: string; qty: number }; lore: string }
export interface RealmDef {
  id: string; name: string; short: string; color: string; lore: string; need: number; level: number;
  floor: number; wall: number; deco: number; biome: Biome; enemies: EnemyKind[]; relic: string; relicName: string;
  /** Âncora do portal (índice de templo) e deslocamento. */
  anchor: number; dx: number; dy: number;
}

export const SECRETS_PER_CIRCLE = 25;
/** Cadeias concluídas de um círculo necessárias para revelar o portal do Reino Oculto. */
export const REALM_NEED = 8;

export const REALMS: RealmDef[] = [
  { id: 'veu_estelar', name: 'Véu Estelar', short: 'Estelar', color: '#9ab8ff', lore: 'Um céu que caiu e aprendeu a ser chão. Cada passo acende uma constelação.', floor: T.ICE, wall: T.CWALL, deco: T.CRYSTAL, biome: 'cave', enemies: ['shade', 'wolf'] },
  { id: 'jardim_ossos', name: 'Jardim dos Ossos Floridos', short: 'Ossos', color: '#f0d8e8', lore: 'Flores brotam de costelas antigas. Elas cantam baixinho o nome de quem foram.', floor: T.MEADOW, wall: T.ROCK, deco: T.MUSHROOM, biome: 'meadow', enemies: ['sporeling', 'shade'] },
  { id: 'mar_vidro', name: 'Mar de Vidro', short: 'Vidro', color: '#80f0e0', lore: 'Ondas congeladas em vidro. Embaixo delas, peixes de luz esperam o degelo.', floor: T.ICE, wall: T.ROCK, deco: T.WATER, biome: 'coast', enemies: ['scorpion', 'shade'] },
  { id: 'forja_aurora', name: 'Forja da Aurora', short: 'Aurora', color: '#ffb070', lore: 'Onde o sol é martelado todas as manhãs antes de nascer.', floor: T.ASH, wall: T.ROCK, deco: T.LAVA, biome: 'volcanic', enemies: ['golem', 'scorpion'] },
  { id: 'biblioteca_raizes', name: 'Biblioteca das Raízes', short: 'Raízes', color: '#b0e080', lore: 'Livros crescem em galhos. Arrancar uma página dói na árvore.', floor: T.MOSS, wall: T.PANEL, deco: T.FURNITURE, biome: 'forest', enemies: ['mushroom', 'goblin'] },
  { id: 'deserto_relogios', name: 'Deserto dos Relógios', short: 'Relógios', color: '#f0d070', lore: 'Cada grão de areia é um segundo que alguém desperdiçou.', floor: T.SAND, wall: T.PILLAR, deco: T.CACTUS, biome: 'desert', enemies: ['scorpion', 'golem'] },
  { id: 'catedral_fungos', name: 'Catedral Micélica Invertida', short: 'Invertida', color: '#e090ff', lore: 'O teto é o chão de outro mundo. Às vezes alguém lá em cima pisa forte.', floor: T.MOSS, wall: T.CWALL, deco: T.MUSHROOM, biome: 'mushroom', enemies: ['sporeling', 'mushroom'] },
  { id: 'cidade_afogada', name: 'Cidade Afogada de Lir', short: 'Lir', color: '#60b0e0', lore: 'Os sinos ainda tocam debaixo d’água, na hora em que a cidade afundou.', floor: T.COBBLE, wall: T.WALL, deco: T.WATER, biome: 'swamp', enemies: ['shade', 'scorpion'] },
  { id: 'pico_silencio', name: 'Pico do Silêncio Branco', short: 'Branco', color: '#f4f8ff', lore: 'Neve que não faz barulho ao cair. Nem ao derreter. Nem ao lembrar.', floor: T.SNOW, wall: T.ROCK, deco: T.CRYSTAL, biome: 'mountain', enemies: ['wolf', 'golem'] },
  { id: 'ruinas_eco', name: 'Ruínas do Primeiro Eco', short: 'Eco', color: '#e8d8b0', lore: 'Aqui a primeira palavra foi dita. As paredes ainda repetem.', floor: T.RUINS, wall: T.WALL, deco: T.PILLAR, biome: 'ruins', enemies: ['golem', 'shade'] },
  { id: 'bosque_lunar', name: 'Bosque da Lua Partida', short: 'Lunar', color: '#c0c8ff', lore: 'Metade da lua caiu aqui. A outra metade ainda procura por ela.', floor: T.AUTUMN, wall: T.CWALL, deco: T.CRYSTAL, biome: 'autumn', enemies: ['wolf', 'shade'] },
  { id: 'abismo_cores', name: 'Abismo das Cores Roubadas', short: 'Cores', color: '#ff80c0', lore: 'Todas as cores que o Silêncio apagou do mundo vieram parar aqui.', floor: T.CAVE, wall: T.CWALL, deco: T.CRYSTAL, biome: 'cave', enemies: ['shade', 'golem', 'sporeling'] },
  { id: 'jardim_ecos', name: 'Jardim dos Ecos Suspensos', short: 'Ecos', color: '#a0ffc0', lore: 'Cada flor guarda uma frase que alguém não teve coragem de dizer.', floor: T.MOSS, wall: T.PANEL, deco: T.MUSHROOM, biome: 'forest', enemies: ['treant', 'pixie', 'wisp'] },
  { id: 'mare_sonhos', name: 'Maré dos Sonhos Perdidos', short: 'Sonhos', color: '#80c8ff', lore: 'Os sonhos que as pessoas esqueceram ao acordar boiam aqui, esperando dono.', floor: T.ICE, wall: T.WALL, deco: T.WATER, biome: 'coast', enemies: ['jelly', 'wisp', 'wraith'] },
].map((r, i) => ({
  ...r, need: REALM_NEED, level: 18 + i * 9,
  relic: `realm_relic_${r.id}`, relicName: `Relíquia do ${r.short}`,
  anchor: (i * 5 + 2) % 30, dx: (i % 2 ? 1 : -1) * (9 + (i % 4) * 3), dy: (i % 3 - 1) * 9 + 8,
})) as RealmDef[];

/** O 13º reino: só abre quando as 12 relíquias ocultas foram honradas. */
export const HEART_REALM: RealmDef = {
  id: 'coracao_oculto', name: 'Coração do Cântico Oculto', short: 'Coração', color: '#fff0a0', need: 12, level: 140,
  lore: 'Lírien guardou aqui a décima nona nota. Ninguém sabia que existia. Agora você sabe.',
  floor: T.FLOOR, wall: T.CWALL, deco: T.CRYSTAL, biome: 'ruins', enemies: ['shade', 'golem', 'wolf', 'scorpion'],
  relic: 'realm_relic_coracao', relicName: 'Décima Nona Nota', anchor: 0, dx: 0, dy: 0,
};
export const ALL_REALMS = [...REALMS, HEART_REALM];

const RIDDLES: Riddle[] = [
  { q: 'Quanto mais eu seco, mais molhada fico. O que sou?', options: ['Toalha', 'Esponja', 'Chuva'], correct: 0 },
  { q: 'Tenho cidades sem casas, rios sem água e florestas sem árvores.', options: ['Sonho', 'Mapa', 'Pintura'], correct: 1 },
  { q: 'Quanto mais você tira, maior eu fico.', options: ['Buraco', 'Dívida', 'Sombra'], correct: 0 },
  { q: 'Falo sem boca e ouço sem ouvidos. Ganho vida com o vento.', options: ['Sino', 'Eco', 'Flauta'], correct: 1 },
  { q: 'Sempre à sua frente, mas nunca pode ser vista.', options: ['O futuro', 'O nariz', 'O horizonte'], correct: 0 },
  { q: 'Tenho chaves, mas não abro portas.', options: ['Piano', 'Carcereiro', 'Mapa'], correct: 0 },
  { q: 'Some quando você diz o meu nome.', options: ['Segredo', 'Silêncio', 'Sombra'], correct: 1 },
  { q: 'Nasço grande e morro pequena, choro enquanto queimo.', options: ['Vela', 'Tocha', 'Brasa'], correct: 0 },
  { q: 'Corro sem pernas e tenho leito, mas nunca durmo.', options: ['Rio', 'Vento', 'Tempo'], correct: 0 },
  { q: 'Quem me faz não precisa, quem compra não usa, quem usa não vê.', options: ['Caixão', 'Máscara', 'Venda'], correct: 0 },
  { q: 'Tem dentes, mas não morde.', options: ['Pente', 'Serra', 'Engrenagem'], correct: 0 },
  { q: 'Quebro sem ser tocado, basta você falar.', options: ['Vidro', 'Promessa', 'Silêncio'], correct: 2 },
  { q: 'Leve como pena, mas ninguém me segura por muito tempo.', options: ['Fôlego', 'Fumaça', 'Pluma'], correct: 0 },
  { q: 'Subo e desço, mas nunca saio do lugar.', options: ['Escada', 'Maré', 'Balanço'], correct: 0 },
  { q: 'Tenho um olho, mas não enxergo.', options: ['Agulha', 'Furacão', 'Ciclope'], correct: 0 },
  { q: 'Quanto mais seca, mais pesa a lembrança dela. Qual nota a Cantora deixou nas fontes?', options: ['Lágrima', 'Riso', 'Grito'], correct: 0 },
  { q: 'Quantos guardiões tinha o Conselho?', options: ['Dezessete', 'Trinta', 'Cem'], correct: 1 },
  { q: 'Quantas notas sustentavam o mundo antes do Silêncio?', options: ['Dezessete', 'Dezoito', 'Doze'], correct: 0 },
  { q: 'Qual o nome verdadeiro da Cantora?', options: ['Ømnia', 'Lírien', 'Morgwyn'], correct: 1 },
  { q: 'Quem traiu o próprio irmão nas forjas?', options: ['Kael', 'Vael', 'Anketh'], correct: 0 },
  { q: 'Em que andar Vael foi selado?', options: ['Dez', 'Trinta', 'Noventa'], correct: 1 },
  { q: 'O que a Bibliotecária apagou para guardar todos os nomes?', options: ['O próprio nome', 'O mapa', 'A chave'], correct: 0 },
  { q: 'Tenho folhas, mas não sou árvore. Tenho lombada, mas não sou bicho.', options: ['Livro', 'Repolho', 'Montanha'], correct: 0 },
  { q: 'Durmo de dia, acordo à noite e vivo pendurada no céu.', options: ['Estrela', 'Coruja', 'Lua'], correct: 2 },
  { q: 'Quanto mais quente, mais fresca eu fico.', options: ['Pão', 'Brasa', 'Areia'], correct: 0 },
  { q: 'Tem cabeça e cauda, mas não tem corpo.', options: ['Moeda', 'Cometa', 'Serpente'], correct: 0 },
  { q: 'Pode ser cheio, mas nunca transborda.', options: ['Lua', 'Copo', 'Rio'], correct: 0 },
  { q: 'Todos me perdem, ninguém me encontra de volta.', options: ['Tempo', 'Chave', 'Juízo'], correct: 0 },
  { q: 'O que o Silêncio come primeiro?', options: ['Canções de ninar', 'Trovões', 'Passos'], correct: 0 },
  { q: 'Quem deixou páginas em cada andar do Abismo?', options: ['A Cantora', 'O homem de manto cinza', 'Kael'], correct: 0 },
  { q: 'Ando de joelhos e de pé, mas nunca me levanto.', options: ['Escada', 'Caminho', 'Raiz'], correct: 1 },
  { q: 'Quanto mais de mim existe, menos você enxerga.', options: ['Névoa', 'Escuridão', 'Multidão'], correct: 1 },
  { q: 'Tenho pescoço, mas não tenho cabeça.', options: ['Garrafa', 'Girafa', 'Camisa'], correct: 0 },
  { q: 'Nado sem água e canto sem voz, preso no pulso de quem me carrega.', options: ['Relógio', 'Coração', 'Peixe de vidro'], correct: 0 },
  { q: 'Caio sem nunca ter subido.', options: ['Chuva', 'Noite', 'Neve'], correct: 1 },
  { q: 'Sou de todos, mas ninguém me pode guardar.', options: ['Amanhã', 'Vento', 'Silêncio'], correct: 0 },
  { q: 'Qual flor guarda frases não ditas?', options: ['A do Jardim dos Ecos', 'A rosa do deserto', 'A flor da lua'], correct: 0 },
  { q: 'Onde boiam os sonhos esquecidos?', options: ['No Mar de Vidro', 'Na Maré dos Sonhos', 'No Véu Estelar'], correct: 1 },
  { q: 'O que a Maré devolve quando a lua está cheia?', options: ['Sonhos', 'Sal', 'Espuma'], correct: 0 },
  { q: 'Quantos Reinos Ocultos cercam o Coração?', options: ['Doze', 'Catorze', 'Dez'], correct: 1 },
  { q: 'O que o Baú Falso guarda de verdade?', options: ['Fome', 'Ouro', 'Chaves'], correct: 0 },
  { q: 'Quem martela o sol todas as manhãs?', options: ['A Forja da Aurora', 'O Colosso', 'Gorm'], correct: 0 },
];
const OFFERS: [string, number][] = [['mana_shard', 1], ['herb', 2], ['wood', 3], ['stone', 3], ['coal', 1], ['potion', 1], ['ether', 1], ['crystal_ore', 1], ['iron_ore', 2], ['hi_potion', 1]];
const ADJ = ['Sussurrante', 'Partido', 'Esquecido', 'Velado', 'Do Avesso', 'Sem Nome', 'Em Brasa', 'Afogado', 'Dourado', 'Noturno', 'De Cinzas', 'Silente', 'Luminoso', 'Errante', 'Profundo', 'Da Maré', 'Do Orvalho', 'De Vidro', 'Estelar', 'Torto', 'Antigo', 'Dormente', 'Vivo', 'Último', 'Primeiro'];
const NOUN = ['Enigma', 'Selo', 'Verso', 'Mapa', 'Juramento', 'Pacto', 'Canto', 'Rastro', 'Sino', 'Espelho', 'Relógio', 'Coração'];
const LORE = [
  'Alguém deixou estes sinais para que só os pacientes encontrassem.',
  'As pedras lembram. Você só precisava perguntar na ordem certa.',
  'Cada etapa era uma nota. Juntas, formam um verso do Cântico Oculto.',
  'O homem de manto cinza passou por aqui. Desta vez deixou pegadas.',
  'Lírien escondeu este verso antes de descer ao Abismo.',
];

function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function buildChain(circle: number, n: number): SecretChain {
  const r = rng(circle * 104729 + n * 7919 + 17), idx = circle * SECRETS_PER_CIRCLE + n;
  const len = 3 + Math.floor(r() * 4); // 3 a 6 etapas
  const steps: SecretStep[] = [];
  let anchor = Math.floor(r() * 30);
  for (let s = 0; s < len; s++) {
    const roll = r(), last = s === len - 1;
    if (s > 0 && roll < 0.12) { steps.push({ kind: 'depth', floor: 1 + Math.floor(r() * Math.min(100, 10 + circle * 8)) }); continue; }
    if (s > 0 && r() < 0.45) anchor = Math.floor(r() * 30);
    const dist = 10 + Math.floor(r() * 50), ang = Math.floor(r() * 8) * Math.PI / 4;
    const base: SecretStep = { kind: 'touch', anchor, dx: Math.round(Math.cos(ang) * dist), dy: Math.round(Math.sin(ang) * dist) };
    if (last || roll > 0.82) { base.kind = 'riddle'; base.riddle = RIDDLES[Math.floor(r() * RIDDLES.length)]!; }
    else if (roll > 0.66) { const [item, qty] = OFFERS[Math.floor(r() * OFFERS.length)]!; base.kind = 'offer'; base.item = item; base.qty = qty + Math.floor(circle / 4); }
    else if (roll > 0.5) base.kind = 'night';
    else if (roll > 0.4) base.kind = 'day';
    else if (roll > 0.33) base.kind = 'rain';
    steps.push(base);
  }
  if (steps[0]!.kind === 'depth') steps[0] = { kind: 'touch', anchor, dx: 14, dy: 0 };
  const lvl = 18 + circle * 9;
  const items = ['hi_potion', 'ether', 'elixir', 'mana_shard', 'crystal_ore'];
  return {
    id: `s${idx}`, circle, name: `${NOUN[idx % NOUN.length]} ${ADJ[(idx * 7 + circle) % ADJ.length]}`, steps,
    reward: { gold: 60 + lvl * 12 * len, xp: 40 + lvl * lvl * len, item: items[(idx + len) % items.length]!, qty: 1 + Math.floor(len / 2) },
    lore: LORE[idx % LORE.length]!,
  };
}

export const SECRETS: SecretChain[] = REALMS.flatMap((_, c) => Array.from({ length: SECRETS_PER_CIRCLE }, (_, n) => buildChain(c, n)));
export const TOTAL_STEPS = SECRETS.reduce((n, s) => n + s.steps.length, 0);

/* ───────────── Progresso (chaves salvas em discoveries) ───────────── */
export const stepKey = (chain: SecretChain, step: number) => `sec:${chain.id}:${step}`;
export function stepOf(chain: SecretChain, has: (k: string) => boolean) { let s = 0; while (s < chain.steps.length && has(stepKey(chain, s))) s++; return s; }
export const chainDone = (chain: SecretChain, has: (k: string) => boolean) => stepOf(chain, has) >= chain.steps.length;
export function circleDone(circle: number, has: (k: string) => boolean) { let n = 0; for (const c of SECRETS) if (c.circle === circle && chainDone(c, has)) n++; return n; }
export const realmOpen = (r: RealmDef, has: (k: string) => boolean, relicDone: (id: string) => boolean) =>
  r === HEART_REALM ? REALMS.every((x) => relicDone(`realm_${x.id}-relic`)) : circleDone(REALMS.indexOf(r), has) >= r.need;

const DIRS = ['leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste', 'norte', 'nordeste'];
export function direction(dx: number, dy: number) { const a = Math.atan2(dy, dx); return DIRS[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8]!; }

const CONDITION: Record<StepKind, string> = {
  touch: 'Toque a runa.', night: 'A runa só responde de noite.', day: 'A runa só acorda sob o sol do meio-dia (entre 9h e 16h).',
  rain: 'A runa só fala quando chove.', offer: '', riddle: 'Uma voz fará uma pergunta. Erre, e ela se cala até você voltar.', depth: '',
};
/** Texto da pista que leva a uma etapa. anchorName traduz o índice do templo. */
export function clueFor(step: SecretStep, anchorName: (i: number) => string, itemName: (id: string) => string) {
  if (step.kind === 'depth') return `Desça ao Abismo do Cântico, andar ${step.floor}. Uma runa brilha na segunda sala.`;
  const dist = Math.round(Math.hypot(step.dx!, step.dy!));
  const where = `A ${dist} passos a ${direction(step.dx!, step.dy!)} do templo de ${anchorName(step.anchor!)}.`;
  const cond = step.kind === 'offer' ? `Ela pede uma oferenda: ${step.qty}× ${itemName(step.item!)}.` : CONDITION[step.kind];
  return `${where} ${cond}`;
}
