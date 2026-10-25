// Novas criaturas do mundo: dados puros (sem imports de valores) para evitar ciclos com data.ts.
// Cada uma tem visual animado próprio (foe-art.ts) e um comportamento único (foe-play.ts).

export type FoeKind =
  | 'lanternmoth' | 'thornback' | 'cogsentinel' | 'inkling' | 'geodecrab' | 'stormkite'
  | 'bonepiper' | 'emberfox' | 'mirrorshade' | 'bloomjaw' | 'frostwyrm' | 'dunewyrm';

/** blink = teleporta ao redor do herói · charge = investida · spread = tiros em leque · burrow = enterra e emerge · root = planta fixa · spiral = rajada em espiral */
export type FoeTrait = 'blink' | 'charge' | 'spread' | 'burrow' | 'root' | 'spiral' | 'shell';

export interface FoeDef {
  name: string; lore: string; hp: number; atk: number; def: number; speed: number; xp: number; gold: number;
  ranged?: boolean; drops: [string, number][]; size: number; level: number; trait: FoeTrait;
  shot?: { color: string; speed: number; n: number; spread: number; slow?: boolean };
  biomes: string[];
}

export const FOES: Record<FoeKind, FoeDef> = {
  lanternmoth: {
    name: 'Mariposa-Lanterna', lore: 'Carrega no abdômen uma chama roubada de um farol esquecido. Some e reaparece entre os clarões.',
    hp: 58, atk: 13, def: 1, speed: 46, xp: 30, gold: 12, ranged: true, size: 7, level: 2, trait: 'blink',
    shot: { color: '#ffd27a', speed: 120, n: 1, spread: 0 }, drops: [['mana_shard', 0.35], ['moonflower', 0.25], ['ether', 0.1]],
    biomes: ['moonwood', 'swamp', 'lotus', 'forest'],
  },
  thornback: {
    name: 'Ouriço-Espinheiro', lore: 'Enrola-se numa bola de espinhos e rola em disparada contra quem pisa no seu prado.',
    hp: 72, atk: 15, def: 4, speed: 30, xp: 30, gold: 10, size: 7, level: 2, trait: 'charge',
    drops: [['herb', 0.4], ['wood', 0.3], ['potion', 0.1]],
    biomes: ['meadow', 'sunflower', 'crimson', 'autumn', 'plains'],
  },
  cogsentinel: {
    name: 'Sentinela de Engrenagens', lore: 'Autômato da era de Artis que ainda patrulha ruínas vazias. Dispara rebites em leque.',
    hp: 150, atk: 22, def: 9, speed: 18, xp: 62, gold: 26, ranged: true, size: 9, level: 5, trait: 'spread',
    shot: { color: '#ffb347', speed: 115, n: 3, spread: 0.32 }, drops: [['iron_ore', 0.6], ['copper_ore', 0.4], ['hi_potion', 0.08]],
    biomes: ['ruins', 'marble', 'thunder'],
  },
  inkling: {
    name: 'Tinteiro Errante', lore: 'Mancha de tinta viva que escapou de um mapa. Mergulha nas sombras e surge às costas.',
    hp: 64, atk: 15, def: 2, speed: 40, xp: 32, gold: 12, size: 7, level: 3, trait: 'blink',
    drops: [['goo', 0.6], ['ether', 0.12], ['mana_shard', 0.15]],
    biomes: ['mangrove', 'swamp', 'coast'],
  },
  geodecrab: {
    name: 'Ermitão de Geodo', lore: 'Mora dentro de um geodo partido. Quando se fecha, quase nada atravessa sua casca de cristal.',
    hp: 175, atk: 20, def: 12, speed: 20, xp: 58, gold: 22, size: 9, level: 4, trait: 'shell',
    drops: [['crystal_ore', 0.55], ['stone', 0.5], ['mana_shard', 0.2]],
    biomes: ['prism', 'cave', 'coral'],
  },
  stormkite: {
    name: 'Pipa da Tempestade', lore: 'Arraia celeste que plana nas correntes de tempestade, arrastando uma cauda de relâmpagos.',
    hp: 88, atk: 19, def: 3, speed: 66, xp: 46, gold: 17, ranged: true, size: 8, level: 4, trait: 'spiral',
    shot: { color: '#bfe6ff', speed: 100, n: 6, spread: Math.PI * 2 / 6 }, drops: [['mana_shard', 0.4], ['iron_ore', 0.3], ['ether', 0.15]],
    biomes: ['thunder', 'mountain', 'aurora'],
  },
  bonepiper: {
    name: 'Flautista de Ossos', lore: 'Toca uma flauta feita da própria costela. Suas notas cortam o ar e entorpecem os passos.',
    hp: 110, atk: 20, def: 5, speed: 26, xp: 54, gold: 22, ranged: true, size: 8, level: 5, trait: 'spread',
    shot: { color: '#e8d0ff', speed: 90, n: 2, spread: 0.45, slow: true }, drops: [['stone', 0.3], ['desert_rose', 0.25], ['hi_potion', 0.1]],
    biomes: ['ruins', 'oasis', 'desert'],
  },
  emberfox: {
    name: 'Raposa de Brasa', lore: 'Três caudas de fogo vivo. Some num rastro de faíscas e investe antes que se ouça o estalo.',
    hp: 120, atk: 23, def: 4, speed: 58, xp: 56, gold: 20, size: 8, level: 4, trait: 'charge',
    drops: [['coal', 0.55], ['wolf_pelt', 0.3], ['hi_potion', 0.08]],
    biomes: ['volcanic', 'obsidian', 'amber'],
  },
  mirrorshade: {
    name: 'Reflexo Partido', lore: 'O que sobrou de quem se olhou demais num espelho de mana. Seus cacos orbitam e cortam.',
    hp: 130, atk: 25, def: 5, speed: 38, xp: 66, gold: 26, size: 8, level: 6, trait: 'blink',
    drops: [['crystal_ore', 0.4], ['mana_shard', 0.4], ['elixir', 0.02]],
    biomes: ['prism', 'marble', 'cave'],
  },
  bloomjaw: {
    name: 'Flor Carnívora', lore: 'Enraizada, imóvel e paciente. Cospe sementes ácidas e abocanha quem chega perto.',
    hp: 95, atk: 18, def: 3, speed: 0, xp: 40, gold: 14, ranged: true, size: 8, level: 3, trait: 'root',
    shot: { color: '#b6ff5a', speed: 105, n: 1, spread: 0 }, drops: [['herb', 0.5], ['goo', 0.4], ['moonflower', 0.1]],
    biomes: ['jungle', 'sakura', 'spores', 'mushroom'],
  },
  frostwyrm: {
    name: 'Filhote de Wyrm Glacial', lore: 'Ainda pequeno, já sopra uma névoa que congela o sangue. Ondula pela neve como um rio vivo.',
    hp: 140, atk: 22, def: 6, speed: 34, xp: 62, gold: 24, ranged: true, size: 9, level: 5, trait: 'spread',
    shot: { color: '#c8f4ff', speed: 95, n: 3, spread: 0.18, slow: true }, drops: [['frost_herb', 0.55], ['crystal_ore', 0.25], ['elixir', 0.02]],
    biomes: ['aurora', 'mountain'],
  },
  dunewyrm: {
    name: 'Verme das Dunas', lore: 'Nada sob a areia. Só se vê o montinho se aproximando — e então a boca de anéis.',
    hp: 135, atk: 24, def: 5, speed: 44, xp: 58, gold: 22, size: 9, level: 4, trait: 'burrow',
    drops: [['chitin', 0.55], ['desert_rose', 0.3], ['hi_potion', 0.1]],
    biomes: ['desert', 'oasis', 'amber'],
  },
};

export const FOE_KINDS = Object.keys(FOES) as FoeKind[];
export const isFoe = (k: string): k is FoeKind => k in FOES;
/** Lista de novas criaturas por bioma. */
export function foesIn(biome: string): FoeKind[] { return FOE_KINDS.filter((k) => FOES[k].biomes.includes(biome)); }
