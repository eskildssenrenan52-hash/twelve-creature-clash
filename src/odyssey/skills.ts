// Livros de Habilidade e o Grimório — dados puros (sem canvas), testáveis.
// As 5 magias dos espíritos continuam iguais; 25 novas vêm de livros com fontes diferentes.
import { SPIRITS } from './data';

export type SkillFamily = 'ataque' | 'defesa' | 'suporte' | 'mobilidade' | 'utilidade';
export type Rarity = 'comum' | 'raro' | 'épico' | 'lendário';
export type SkillEffect =
  | { kind: 'proj'; speed: number; dmg: number; count: number; spread: number; slow?: boolean; proj: 'fire' | 'ice' | 'orb' | 'arrow'; life?: number; drain?: number }
  | { kind: 'ring'; count: number; dmg: number; proj: 'fire' | 'ice' | 'orb'; slow?: boolean }
  | { kind: 'nova'; radius: number; dmg: number; push: number }
  | { kind: 'zone'; radius: number; dmg: number; count: number }
  | { kind: 'heal'; amount: number; mana?: number }
  | { kind: 'buff'; buff: BuffId; dur: number; heal?: number }
  | { kind: 'dash'; dist: number; trail?: number }
  | { kind: 'recall' }
  | { kind: 'slowAll'; radius: number; dur: number }
  | { kind: 'harvest' }
  | { kind: 'transmute' };
export type BuffId = 'shield' | 'stone' | 'regen' | 'might' | 'focus' | 'luck' | 'haste';

export type SkillSource =
  | { kind: 'spirit' }
  | { kind: 'shop'; price: number }
  | { kind: 'realm'; realm: string; where: string }
  | { kind: 'abyss'; floor: number }
  | { kind: 'saga'; realm: string; where: string }
  | { kind: 'island'; island: string; where: string };

export interface SkillDef {
  id: string; name: string; book: string; family: SkillFamily; rarity: Rarity;
  mp: number; cd: number; color: string; desc: string; lore: string;
  effect: SkillEffect; source: SkillSource;
}

const spirit = (id: string): Pick<SkillDef, 'id' | 'name' | 'mp' | 'cd' | 'color' | 'desc'> => {
  const s = SPIRITS.find((x) => x.id === id)!;
  return { id: s.id, name: s.spell, mp: s.mp, cd: s.cd, color: s.color, desc: s.desc };
};

export const SKILLS: SkillDef[] = [
  // ── Espíritos (já existiam) ──
  { ...spirit('salamando'), book: 'Pacto de Salamando', family: 'ataque', rarity: 'comum', lore: 'O primeiro espírito que confiou em você.', effect: { kind: 'proj', speed: 170, dmg: 3, count: 1, spread: 0, proj: 'fire', life: 1.2 }, source: { kind: 'spirit' } },
  { ...spirit('undine'), book: 'Pacto de Undine', family: 'ataque', rarity: 'comum', lore: 'Três lâminas de água que lembram a maré.', effect: { kind: 'proj', speed: 210, dmg: 1.8, count: 3, spread: 0.25, proj: 'ice', slow: true, life: 0.9 }, source: { kind: 'spirit' } },
  { ...spirit('sylph'), book: 'Pacto de Sylph', family: 'defesa', rarity: 'comum', lore: 'O vento empurra o que ameaça você.', effect: { kind: 'nova', radius: 60, dmg: 2, push: 260 }, source: { kind: 'spirit' } },
  { ...spirit('lumina'), book: 'Pacto de Lumina', family: 'ataque', rarity: 'comum', lore: 'A luz que cai do céu quando você pede.', effect: { kind: 'zone', radius: 48, dmg: 4, count: 1 }, source: { kind: 'spirit' } },
  { ...spirit('dryad'), book: 'Pacto de Dryad', family: 'suporte', rarity: 'comum', lore: 'A Árvore cura quem cuida dela.', effect: { kind: 'heal', amount: 6 }, source: { kind: 'spirit' } },

  // ── Loja (ouro do jogo) ──
  { id: 'faisca', name: 'Faísca Tripla', book: 'Manual da Faísca', family: 'ataque', rarity: 'comum', mp: 6, cd: 0.6, color: '#ffb040', desc: 'Três faíscas rápidas em leque.', lore: 'Vendido em toda feira de Potos. Funciona melhor do que parece.', effect: { kind: 'proj', speed: 240, dmg: 1.4, count: 3, spread: 0.18, proj: 'fire', life: 0.7 }, source: { kind: 'shop', price: 180 } },
  { id: 'egide', name: 'Égide', book: 'Tratado da Égide', family: 'defesa', rarity: 'comum', mp: 14, cd: 12, color: '#a0d0ff', desc: 'Escudo que reduz o dano recebido pela metade por 8 s.', lore: 'Escrito por um guarda que voltou de todas as batalhas.', effect: { kind: 'buff', buff: 'shield', dur: 8 }, source: { kind: 'shop', price: 260 } },
  { id: 'chuva_cura', name: 'Chuva Curativa', book: 'Cantigas da Chuva Mansa', family: 'suporte', rarity: 'comum', mp: 12, cd: 10, color: '#70e0b0', desc: 'Recupera HP aos poucos por 10 s.', lore: 'As avós de Potos cantavam isso nos dias de febre.', effect: { kind: 'buff', buff: 'regen', dur: 10 }, source: { kind: 'shop', price: 220 } },
  { id: 'vento_veloz', name: 'Vento Veloz', book: 'Guia do Mensageiro', family: 'mobilidade', rarity: 'comum', mp: 8, cd: 14, color: '#c0ffe0', desc: 'Corre 40% mais rápido por 10 s.', lore: 'Todo mensageiro de Potos aprende isso antes de aprender a ler.', effect: { kind: 'buff', buff: 'haste', dur: 10 }, source: { kind: 'shop', price: 200 } },
  { id: 'colheita', name: 'Canção da Colheita', book: 'Almanaque do Agricultor', family: 'utilidade', rarity: 'comum', mp: 20, cd: 60, color: '#b0e060', desc: 'Faz suas plantações crescerem 2 minutos de uma vez.', lore: 'Dona Marta jura que nunca usou. Os vizinhos duvidam.', effect: { kind: 'harvest' }, source: { kind: 'shop', price: 300 } },
  { id: 'canto_vigor', name: 'Canto do Vigor', book: 'Hinos de Guerra de Brunhild', family: 'suporte', rarity: 'raro', mp: 16, cd: 20, color: '#ff8060', desc: '+35% de dano por 12 s.', lore: 'A ferreira canta isso enquanto bate o martelo.', effect: { kind: 'buff', buff: 'might', dur: 12 }, source: { kind: 'shop', price: 650 } },
  { id: 'transmutar', name: 'Transmutação', book: 'Caderno Proibido de Lira', family: 'utilidade', rarity: 'raro', mp: 18, cd: 4, color: '#ffd040', desc: 'Transforma 3 pedras em ouro.', lore: 'Ilo e Ina queimaram metade das páginas. A outra metade funciona.', effect: { kind: 'transmute' }, source: { kind: 'shop', price: 900 } },
  { id: 'lanca_trovao', name: 'Lança do Trovão', book: 'Códice do Trovão', family: 'ataque', rarity: 'raro', mp: 18, cd: 1.6, color: '#fff060', desc: 'Um raio veloz de dano altíssimo.', lore: 'Comprado de um viajante que não tinha sombra.', effect: { kind: 'proj', speed: 360, dmg: 4.5, count: 1, spread: 0, proj: 'orb', life: 0.8 }, source: { kind: 'shop', price: 1200 } },

  // ── Reinos Ocultos (cadeias de segredos) ──
  { id: 'passo_sombra', name: 'Passo de Sombra', book: 'Diário do Véu Estelar', family: 'mobilidade', rarity: 'raro', mp: 10, cd: 3, color: '#9ab8ff', desc: 'Teleporta você para a frente.', lore: 'Encontrado sob uma constelação que só existe no chão.', effect: { kind: 'dash', dist: 70 }, source: { kind: 'realm', realm: 'veu_estelar', where: 'Relíquia do Véu Estelar' } },
  { id: 'pele_pedra', name: 'Pele de Pedra', book: 'Ossário dos Floridos', family: 'defesa', rarity: 'raro', mp: 16, cd: 18, color: '#c0b0a0', desc: 'Defesa muito maior por 12 s.', lore: 'As costelas floridas ensinam a não se quebrar.', effect: { kind: 'buff', buff: 'stone', dur: 12 }, source: { kind: 'realm', realm: 'jardim_ossos', where: 'Relíquia do Jardim dos Ossos' } },
  { id: 'estilhaco', name: 'Estilhaço de Gelo', book: 'Grimório Congelado', family: 'ataque', rarity: 'épico', mp: 22, cd: 3, color: '#b0f0ff', desc: 'Anel de 10 cristais que congelam.', lore: 'As páginas estalam de frio quando abertas.', effect: { kind: 'ring', count: 10, dmg: 2.2, proj: 'ice', slow: true }, source: { kind: 'realm', realm: '#2', where: 'Terceiro Reino Oculto' } },
  { id: 'tempo_lento', name: 'Ampulheta Parada', book: 'Tomo do Tempo Quieto', family: 'utilidade', rarity: 'épico', mp: 24, cd: 20, color: '#e0c0ff', desc: 'Deixa todos os inimigos próximos lentos por 6 s.', lore: 'Quem escreveu este livro ainda está escrevendo.', effect: { kind: 'slowAll', radius: 160, dur: 6 }, source: { kind: 'realm', realm: '#3', where: 'Quarto Reino Oculto' } },
  { id: 'foco_arcano', name: 'Foco Arcano', book: 'Meditações do Eremita', family: 'suporte', rarity: 'épico', mp: 14, cd: 20, color: '#c080ff', desc: '+50% de dano mágico por 12 s.', lore: 'Respire. Conte as notas. Lance.', effect: { kind: 'buff', buff: 'focus', dur: 12 }, source: { kind: 'realm', realm: '#4', where: 'Quinto Reino Oculto' } },
  { id: 'raio_estelar', name: 'Raio Estelar', book: 'Partitura da Décima Nona Nota', family: 'ataque', rarity: 'lendário', mp: 40, cd: 6, color: '#fff0a0', desc: 'Um astro lento e devastador.', lore: 'A nota que Lírien escondeu. Toca uma vez e o mundo escuta.', effect: { kind: 'proj', speed: 110, dmg: 9, count: 1, spread: 0, proj: 'orb', life: 2.2 }, source: { kind: 'realm', realm: 'coracao_oculto', where: 'Coração do Cântico Oculto' } },

  // ── Baús do Abismo (a cada 10 andares; os raros nos guardiões) ──
  { id: 'drenar', name: 'Drenar Vida', book: 'Folhas Úmidas do Andar 10', family: 'ataque', rarity: 'raro', mp: 12, cd: 1.2, color: '#d04070', desc: 'Projétil que devolve parte do dano como HP.', lore: 'As criaturas do Abismo aprenderam isso primeiro.', effect: { kind: 'proj', speed: 200, dmg: 2.4, count: 1, spread: 0, proj: 'orb', life: 1, drain: 0.3 }, source: { kind: 'abyss', floor: 10 } },
  { id: 'barreira', name: 'Barreira de Raízes', book: 'Herbário do Andar 30', family: 'defesa', rarity: 'raro', mp: 18, cd: 8, color: '#80a050', desc: 'Empurra tudo para longe e dá escudo curto.', lore: 'Raízes que cresceram sem nunca ver o sol.', effect: { kind: 'nova', radius: 80, dmg: 1.5, push: 360 }, source: { kind: 'abyss', floor: 30 } },
  { id: 'meteoros', name: 'Chuva de Meteoros', book: 'Crônica Queimada do Andar 50', family: 'ataque', rarity: 'épico', mp: 34, cd: 5, color: '#ff7030', desc: 'Três meteoros caem ao redor do alvo.', lore: 'O guardião do andar 50 dormia sobre este livro.', effect: { kind: 'zone', radius: 40, dmg: 3.5, count: 3 }, source: { kind: 'abyss', floor: 50 } },
  { id: 'salto_fenix', name: 'Salto da Fênix', book: 'Pena Cinzenta do Andar 70', family: 'mobilidade', rarity: 'épico', mp: 22, cd: 4, color: '#ff9040', desc: 'Avança deixando um rastro de fogo.', lore: 'Cai das cinzas, sempre para a frente.', effect: { kind: 'dash', dist: 90, trail: 2.5 }, source: { kind: 'abyss', floor: 70 } },
  { id: 'bencao_sorte', name: 'Bênção da Sorte', book: 'Testamento do Andar 100', family: 'utilidade', rarity: 'lendário', mp: 20, cd: 45, color: '#ffe080', desc: '+50% de ouro e XP por 30 s.', lore: 'O último explorador a chegar ao fundo deixou isto. E sorriu.', effect: { kind: 'buff', buff: 'luck', dur: 30 }, source: { kind: 'abyss', floor: 100 } },

  // ── Saga dos Oito Céus (relíquia ao vencer o reino) ──
  { id: 'lamina_vento', name: 'Lâmina de Vento', book: 'Sutra da Ilha da Deusa', family: 'ataque', rarity: 'raro', mp: 14, cd: 1, color: '#d0fff0', desc: 'Cinco lâminas em leque largo.', lore: 'Gravado no altar onde a Deusa dormia.', effect: { kind: 'proj', speed: 230, dmg: 1.6, count: 5, spread: 0.22, proj: 'arrow', life: 0.7 }, source: { kind: 'saga', realm: '#0', where: 'Primeiro reino da Saga' } },
  { id: 'elixir_luz', name: 'Elixir de Luz', book: 'Receitas Feéricas', family: 'suporte', rarity: 'raro', mp: 10, cd: 16, color: '#fff8c0', desc: 'Cura HP e recupera MP.', lore: 'As fadas ensinam, mas cobram em risadas.', effect: { kind: 'heal', amount: 4, mana: 30 }, source: { kind: 'saga', realm: '#1', where: 'Segundo reino da Saga' } },
  { id: 'recall', name: 'Retorno à Estátua', book: 'Mapa Dobrado das Nuvens', family: 'mobilidade', rarity: 'épico', mp: 30, cd: 60, color: '#80f0ff', desc: 'Volta à última Estátua de Mana (fora de masmorras).', lore: 'Dobre o mapa no lugar certo e o caminho encolhe.', effect: { kind: 'recall' }, source: { kind: 'saga', realm: '#3', where: 'Quarto reino da Saga' } },
  { id: 'santuario', name: 'Santuário', book: 'Litania da Necrópole', family: 'defesa', rarity: 'lendário', mp: 36, cd: 30, color: '#f0f0ff', desc: 'Escudo forte e cura contínua por 10 s.', lore: 'Os mortos da Necrópole pediram que alguém lembrasse disto.', effect: { kind: 'buff', buff: 'shield', dur: 10, heal: 1 }, source: { kind: 'saga', realm: '#4', where: 'Quinto reino da Saga' } },

  // ── Ilhas do arquipélago ──
  { id: 'pes_leves', name: 'Pés de Espuma', book: 'Canção dos Pescadores', family: 'mobilidade', rarity: 'raro', mp: 6, cd: 30, color: '#a0e8ff', desc: 'Corre mais rápido por 30 s.', lore: 'Para correr sobre a areia sem deixar pegadas.', effect: { kind: 'buff', buff: 'haste', dur: 30 }, source: { kind: 'island', island: 'coral', where: 'Relíquia do Recife Rosado' } },
  { id: 'olho_vidente', name: 'Olho Vidente', book: 'Diário do Faroleiro', family: 'utilidade', rarity: 'épico', mp: 12, cd: 25, color: '#80c0ff', desc: '+50% de ouro e XP por 15 s e revela inimigos ao redor.', lore: 'O farol vê o que o mar esconde.', effect: { kind: 'buff', buff: 'luck', dur: 15 }, source: { kind: 'island', island: '#1', where: 'Relíquia da segunda ilha' } },
];

export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const SPIRIT_IDS = SPIRITS.map((s) => s.id) as string[];
export const LOADOUT_SIZE = 6;
/** Saves antigos: as 5 magias atuais nas teclas 1–5, como sempre. */
export const defaultLoadout = (): string[] => [...SPIRIT_IDS, ''];
export const FAMILY_NAMES: Record<SkillFamily, string> = { ataque: 'Ataque', defesa: 'Defesa', suporte: 'Suporte', mobilidade: 'Mobilidade', utilidade: 'Utilidade' };
export const RARITY_COLOR: Record<Rarity, string> = { comum: '#d8d0c0', raro: '#60b0ff', 'épico': '#c070ff', 'lendário': '#ffc040' };
export const shopBooks = () => SKILLS.filter((s) => s.source.kind === 'shop');

/** Limpa um grimório salvo: tamanho fixo, sem ids desconhecidos ou repetidos. */
export function sanitizeLoadout(raw: unknown): string[] {
  const out: string[] = [];
  const src = Array.isArray(raw) ? raw : defaultLoadout();
  for (let i = 0; i < LOADOUT_SIZE; i++) {
    const id = typeof src[i] === 'string' ? (src[i] as string) : '';
    out.push(id && SKILL_BY_ID[id] && !out.includes(id) ? id : '');
  }
  return out;
}

export function sourceLabel(s: SkillDef): string {
  const src = s.source;
  switch (src.kind) {
    case 'spirit': return 'Vence o guardião do espírito';
    case 'shop': return `Loja · ${src.price} de ouro`;
    case 'realm': return `Reino Oculto · ${src.where}`;
    case 'abyss': return `Baú do Abismo · andar ${src.floor}`;
    case 'saga': return `Saga dos Oito Céus · ${src.where}`;
    case 'island': return `Ilha · ${src.where}`;
  }
}
