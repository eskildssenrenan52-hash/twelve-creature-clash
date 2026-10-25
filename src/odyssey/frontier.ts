// Shared, browser-safe frontier catalog. Legacy biome IDs remain unchanged.
export const FRONTIER = {
  sakura: { name: 'Vale das Cerejeiras', ground: 35, base: '#83b997', flecks: ['#e8a6bf','#b4d8b1'], obstacle: 4, art: 1, tier: 2, enemies: ['goblin','sporeling','pixie','crow'], resource: 'wood' },
  moonwood: { name: 'Floresta da Lua Prateada', ground: 36, base: '#528c9e', flecks: ['#83b7bd','#a9cdd0'], obstacle: 20, art: 1, tier: 3, enemies: ['shade','sporeling','wisp','sprite'], resource: 'moonflower' },
  prism: { name: 'Campos de Cristal Prismático', ground: 37, base: '#80afb5', flecks: ['#ade2da','#d5b4df'], obstacle: 12, art: 0, tier: 4, enemies: ['golem','shade','gargoyle','wisp'], resource: 'crystal_ore' },
  coral: { name: 'Jardins de Coral de Nereida', ground: 38, base: '#b0cebe', flecks: ['#efb0b2','#d9deaa'], obstacle: 29, art: 4, tier: 2, enemies: ['scorpion','goblin','crab','jelly'], resource: 'desert_rose' },
  bamboo: { name: 'Bosque dos Ventos de Jade', ground: 39, base: '#71a985', flecks: ['#a2c883','#458b73'], obstacle: 29, art: 4, tier: 3, enemies: ['goblin','sporeling','treant','crow'], resource: 'wood' },
  thunder: { name: 'Planalto das Tempestades', ground: 40, base: '#89959f', flecks: ['#b8bcc2','#c3cda2'], obstacle: 12, art: 0, tier: 5, enemies: ['golem','shade','gargoyle','bat'], resource: 'iron_ore' },
  obsidian: { name: 'Fendas de Obsidiana', ground: 41, base: '#645d70', flecks: ['#938295','#d18b74'], obstacle: 7, art: 5, tier: 5, enemies: ['golem','scorpion','imp','salamander'], resource: 'coal' },
  sunflower: { name: 'Campinas do Sol Dourado', ground: 42, base: '#9caf64', flecks: ['#f5d178','#d3ba62'], obstacle: 27, art: 6, tier: 1, enemies: ['mushroom','goblin','slime','rat','boar'], resource: 'wheat' },
  lavender: { name: 'Colinas de Lavanda de Lira', ground: 43, base: '#8eaa8b', flecks: ['#c7a6db','#b4b9d7'], obstacle: 32, art: 2, tier: 2, enemies: ['mushroom','sporeling','pixie','frog'], resource: 'herb' },
  mangrove: { name: 'Manguezais de Esmeralda', ground: 44, base: '#468d83', flecks: ['#71b8a3','#3a766c'], obstacle: 29, art: 4, tier: 3, enemies: ['sporeling','scorpion','frog','serpent'], resource: 'wood' },
  aurora: { name: 'Tundra das Auroras', ground: 45, base: '#b9d3df', flecks: ['#e4f1ee','#91b5d1'], obstacle: 16, art: 7, tier: 4, enemies: ['wolf','shade','sprite','wisp'], resource: 'frost_herb' },
  amber: { name: 'Cânions de Âmbar Vivo', ground: 46, base: '#c7a16e', flecks: ['#e7c98a','#aa8166'], obstacle: 27, art: 6, tier: 3, enemies: ['scorpion','golem','beetle','serpent'], resource: 'copper_ore' },
  spores: { name: 'Floresta dos Esporos Estelares', ground: 47, base: '#688f8e', flecks: ['#d0badf','#99bca8'], obstacle: 32, art: 2, tier: 4, enemies: ['mushroom','shade','pixie','wisp'], resource: 'mana_shard' },
  lotus: { name: 'Pântano dos Lótus Celestes', ground: 48, base: '#70aab2', flecks: ['#d8bbdb','#a0d1b6'], obstacle: 4, art: 1, tier: 2, enemies: ['sporeling','mushroom','frog','jelly'], resource: 'moonflower' },
  marble: { name: 'Ruínas de Mármore de Lumina', ground: 49, base: '#ced1be', flecks: ['#e7e6d8','#a8bfb5'], obstacle: 18, art: 3, tier: 4, enemies: ['golem','shade','skeleton','gargoyle','mimic'], resource: 'stone' },
  crimson: { name: 'Bosque das Folhas Carmesins', ground: 50, base: '#a2a070', flecks: ['#d58c88','#e2b486'], obstacle: 27, art: 6, tier: 3, enemies: ['wolf','goblin','crow','spider'], resource: 'wood' },
  oasis: { name: 'Oásis das Mil Estrelas', ground: 51, base: '#d5c08a', flecks: ['#ece0b4','#adc997'], obstacle: 29, art: 4, tier: 2, enemies: ['scorpion','goblin','mummy','serpent'], resource: 'desert_rose' },
} as const;
export type FrontierBiome = keyof typeof FRONTIER;
export const FRONTIER_KEYS = Object.keys(FRONTIER) as FrontierBiome[];
export const LEGACY_W = 320;
export const LEGACY_H = 240;
export const WORLD_SCALE = 10;
export const FRONTIER_GATES = FRONTIER_KEYS.map((biome,i) => ({ id: `frontier-${biome}`, biome, name: FRONTIER[biome].name, tx: (i%9+1)*LEGACY_W+160, ty: Math.floor(i/9)*LEGACY_H+120 }));
export function frontierBiomeAt(x:number,y:number): FrontierBiome {
  const column=Math.floor(x/LEGACY_W), row=Math.floor(y/LEGACY_H);
  const sector=row*10+column;
  // First two rows feature every unique region; later rows are deterministic mosaics.
  const i=row<2&&column>0 ? row*9+column-1 : sector*7+Math.floor(x/80)+Math.floor(y/60)*3;
  return FRONTIER_KEYS[i%FRONTIER_KEYS.length];
}