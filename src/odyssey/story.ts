// A Crônica do Cântico Partido — a campanha de Golden Arrow Odyssey.
// Tudo aqui é dado puro (sem canvas), gerado de forma determinística a partir de FRONTIER,
// para que os testes consigam validar a campanha inteira sem abrir o jogo.
import type { BossDef, EnemyKind, ItemDef, NpcDef, Palette, QuestDef, Recipe } from './data';
import { FRONTIER, FRONTIER_GATES, type FrontierBiome } from './frontier';
import { BIOME_LEVEL } from './levels';
import { CHRONICLE_BEATS } from './chronicle';

/* ───────────────────────────── Atos ───────────────────────────── */
export interface Act { id: number; name: string; subtitle: string; biomes: FrontierBiome[] }
export const ACTS: Act[] = [
  { id: 1, name: 'Ato I — O Despertar da Mana', subtitle: 'Potos e as terras antigas', biomes: [] },
  { id: 2, name: 'Ato II — Os Ecos Mansos', subtitle: 'Seis notas ainda lembram como cantar', biomes: ['sunflower', 'sakura', 'coral', 'lavender', 'lotus', 'oasis'] },
  { id: 3, name: 'Ato III — Os Ecos Inquietos', subtitle: 'Onde a mana já começou a gritar', biomes: ['moonwood', 'bamboo', 'mangrove', 'amber', 'crimson'] },
  { id: 4, name: 'Ato IV — Os Ecos Perdidos', subtitle: 'Notas que ninguém lembra de ter ouvido', biomes: ['prism', 'aurora', 'spores', 'marble'] },
  { id: 5, name: 'Ato V — O Silêncio', subtitle: 'Os dois últimos Ecos e o fim da Canção', biomes: ['thunder', 'obsidian'] },
  { id: 6, name: 'Ato VI — Ciclos do Eco', subtitle: 'A Canção recomeça, mais funda', biomes: [] },
];

/* ───────────────────────────── Os 17 Ecos ───────────────────────────── */
interface EcoDef {
  biome: FrontierBiome; eco: string;
  vigia: { name: string; title: string; line: string };
  boss: { name: string; kind: EnemyKind; tint: string; scale: number };
  lore: string; collect: { item: string; n: number; itemName: string };
  victory: string[];
}
export const ECOS: EcoDef[] = [
  { biome: 'sunflower', eco: 'Eco da Colheita', vigia: { name: 'Dona Marta', title: 'Colhedora das Campinas', line: 'O trigo apodrece em pé, forasteiro. Nunca vi nada igual.' },
    boss: { name: 'Espantalho-Rei Gorlak', kind: 'goblin', tint: '#d9a520', scale: 2.8 },
    lore: 'Cada grão aqui guarda a nota mais antiga da Canção: a gratidão.', collect: { item: 'wheat', n: 8, itemName: 'Trigo' },
    victory: ['Gorlak desmorona em palha dourada.', 'Os girassóis se viram, todos de uma vez, para a Árvore de Mana.', 'O Eco da Colheita soa pela primeira vez em um século.'] },
  { biome: 'sakura', eco: 'Eco do Florescer', vigia: { name: 'Mestre Haruki', title: 'Jardineiro das Cerejeiras', line: 'As pétalas caem de baixo para cima. As árvores estão chorando ao contrário.' },
    boss: { name: 'Cerejeira-Mãe Sakuya', kind: 'sporeling', tint: '#e58aa8', scale: 3 },
    lore: 'Florescer é lembrar-se, a cada primavera, de que se pode recomeçar.', collect: { item: 'wood', n: 14, itemName: 'Madeira Ancestral' },
    victory: ['Sakuya sussurra um nome antigo antes de se desfazer em pétalas.', '— Ele disse que lembrar dói demais. Que o silêncio era uma bondade.', 'Quem é “ele”? A tempestade rosa não responde.'] },
  { biome: 'coral', eco: 'Eco da Maré', vigia: { name: 'Capitã Nerina', title: 'Faroleira de Nereida', line: 'O mar parou de respirar. Nenhuma onda em três luas.' },
    boss: { name: 'Leviatã de Coral Brachys', kind: 'scorpion', tint: '#ef7f8e', scale: 2.8 },
    lore: 'A maré é a memória do mundo indo e voltando.', collect: { item: 'desert_rose', n: 4, itemName: 'Rosa do Deserto' },
    victory: ['Brachys afunda e o oceano finalmente exala.', 'Ondas voltam à praia, uma, duas, mil.', 'Nerina acende o farol. A luz alcança mais longe do que deveria.'] },
  { biome: 'lavender', eco: 'Eco do Aroma', vigia: { name: 'Irmã Lavínia', title: 'Perfumista de Lira', line: 'Perdi o olfato de repente. Todas nós perdemos. Como se o mundo tivesse esquecido o próprio cheiro.' },
    boss: { name: 'Bruxa-das-Névoas Ysolde', kind: 'sporeling', tint: '#a98ad4', scale: 2.7 },
    lore: 'O cheiro é a memória mais teimosa: volta inteira, sem pedir licença.', collect: { item: 'herb', n: 12, itemName: 'Erva Medicinal' },
    victory: ['Ysolde se dissolve numa névoa que cheira a infância.', 'Você sente o cheiro de pão quente de uma casa que nunca teve.', 'O Eco do Aroma retorna, e Lavínia chora sem saber por quê.'] },
  { biome: 'lotus', eco: 'Eco do Orvalho', vigia: { name: 'Sábio Bhuvan', title: 'Monge dos Lótus', line: 'Os lótus fecharam. Nenhum abriu ao amanhecer. Algo roubou a manhã.' },
    boss: { name: 'Rã-Imperatriz Padmara', kind: 'mushroom', tint: '#6fc7c0', scale: 3 },
    lore: 'Uma gota de orvalho carrega o céu inteiro dentro de si.', collect: { item: 'moonflower', n: 6, itemName: 'Flor da Lua' },
    victory: ['Padmara ri, coaxa, e some em mil gotas.', 'Os lótus se abrem juntos, brilhando como lanternas.', 'Bhuvan sorri: — A manhã estava apenas escondida.'] },
  { biome: 'oasis', eco: 'Eco da Miragem', vigia: { name: 'Zahra', title: 'Contadora de Estrelas', line: 'As estrelas deste oásis eram mil. Contei, noite após noite. Agora restam nove.' },
    boss: { name: 'Djinn Esquecido Ifrit-Ur', kind: 'scorpion', tint: '#e8c15a', scale: 2.9 },
    lore: 'Toda miragem é um desejo que o deserto não conseguiu apagar.', collect: { item: 'chitin', n: 8, itemName: 'Quitina de Escorpião' },
    victory: ['O djinn se curva, livre, e murmura um desejo que nunca fez.', 'O céu acende. Zahra recomeça a contar, e as estrelas voltam uma a uma.', 'Seis Ecos cantam. O Silêncio recua... e parece furioso.'] },

  { biome: 'moonwood', eco: 'Eco do Luar', vigia: { name: 'Selene Argêntea', title: 'Guardiã da Lua Prateada', line: 'A lua desapareceu daqui. Só a luz dela ficou, órfã, pendurada nos galhos.' },
    boss: { name: 'Coruja-Sombra Nyxara', kind: 'shade', tint: '#8fb6d9', scale: 3 },
    lore: 'O luar é o jeito que a noite tem de dizer “eu ainda estou aqui”.', collect: { item: 'moonflower', n: 10, itemName: 'Flor da Lua' },
    victory: ['Nyxara abre as asas e a lua atravessa suas penas, inteira.', 'Nas poças, o reflexo prateado volta a tremer.', 'Em cada árvore caída, a mesma pegada sem eco: alguém passou por aqui.'] },
  { biome: 'bamboo', eco: 'Eco do Sopro', vigia: { name: 'Mestre Ren', title: 'Monge dos Ventos de Jade', line: 'O bambu não balança. Nunca vi um vento morrer.' },
    boss: { name: 'Dragão-Tigre Hakuryu', kind: 'goblin', tint: '#58b87a', scale: 3 },
    lore: 'O vento não tem forma, mas dá forma a tudo que toca.', collect: { item: 'wood', n: 30, itemName: 'Madeira Ancestral' },
    victory: ['Hakuryu ruge, e o rugido vira brisa.', 'O bosque inteiro balança em uníssono: uma respiração.', 'Ren sussurra: — Nos antigos pergaminhos, há um nome. Vael.'] },
  { biome: 'mangrove', eco: 'Eco da Raiz Salgada', vigia: { name: 'Velho Tomás', title: 'Barqueiro dos Manguezais', line: 'Remo há sessenta anos. A água nunca ficou parada assim.' },
    boss: { name: 'Hidra de Raízes Mangala', kind: 'sporeling', tint: '#2f8f78', scale: 3 },
    lore: 'Raiz e maré: uma segura, a outra leva. Juntas, plantam florestas dentro do mar.', collect: { item: 'goo', n: 15, itemName: 'Esporo' },
    victory: ['As cabeças de Mangala se desatam como cordas.', 'A água se move, empurrando os barcos para a margem certa.', 'Tomás tira o chapéu: — Obrigado, jovem. Meu barco lembrou como navegar.'] },
  { biome: 'amber', eco: 'Eco do Brilho Antigo', vigia: { name: 'Karum', title: 'Cartógrafo dos Cânions', line: 'Desenhei este cânion mil vezes. Hoje o mapa e a terra discordam.' },
    boss: { name: 'Colosso de Âmbar Tharok', kind: 'golem', tint: '#d49a3c', scale: 3 },
    lore: 'O âmbar guarda insetos, folhas e instantes: tempo preso numa lágrima de pedra.', collect: { item: 'iron_ore', n: 15, itemName: 'Minério de Ferro' },
    victory: ['O âmbar de Tharok racha. Dentro, um instante: um homem de manto cinza, rindo, de mãos dadas com Gorm.', 'Os dois parecem jovens. Os dois parecem felizes.', 'Karum desenha o mapa de novo. Agora a terra concorda.'] },
  { biome: 'crimson', eco: 'Eco da Queda', vigia: { name: 'Ayame', title: 'Colhedora de Folhas Carmesins', line: 'As folhas caem, mas nunca chegam ao chão. Ficam no ar, esperando.' },
    boss: { name: 'Lobo-Rubro Garmr', kind: 'wolf', tint: '#c0453f', scale: 2.9 },
    lore: 'Cair é uma forma de voar, quando se aceita o chão no fim.', collect: { item: 'wolf_pelt', n: 10, itemName: 'Pele de Lobo' },
    victory: ['Garmr uiva uma última vez e as folhas, enfim, tocam o chão.', 'O vento as leva em espiral até a Árvore de Mana.', 'Onze Ecos cantam. O nome “Vael” já corre de boca em boca.'] },

  { biome: 'prism', eco: 'Eco do Prisma', vigia: { name: 'Prisma, a Lapidária', title: 'Lapidária dos Campos de Cristal', line: 'Os cristais pararam de refratar. Só refletem. Só mostram o que já se é.' },
    boss: { name: 'Quimera Prismática Iridia', kind: 'golem', tint: '#b9a0f0', scale: 3 },
    lore: 'Um prisma não cria cores. Ele liberta as que a luz escondia.', collect: { item: 'crystal_ore', n: 10, itemName: 'Cristal de Mana' },
    victory: ['Iridia se parte em sete cores que dançam pelo campo.', 'Em cada cristal, por um instante, você vê um rosto diferente: todos seus.', '— Não é a primeira vez, diz a Lapidária. — Os cristais lembram de heróis anteriores.'] },
  { biome: 'aurora', eco: 'Eco da Aurora', vigia: { name: 'Anciã Skadi', title: 'Xamã da Tundra', line: 'Antes, o céu dançava. Agora a noite é só noite.' },
    boss: { name: 'Serpente-Aurora Vindalf', kind: 'wolf', tint: '#7be0c8', scale: 3.1 },
    lore: 'A aurora é a Canção, visível, escrita no céu para quem sabe ler.', collect: { item: 'frost_herb', n: 10, itemName: 'Erva Gélida' },
    victory: ['Vindalf sobe, em espirais verdes, até se tornar o próprio céu.', 'A aurora estoura sobre a tundra, ondas de verde e violeta.', 'Skadi: — Os antigos diziam que cada cor é uma nota. Agora eu ouço.'] },
  { biome: 'spores', eco: 'Eco do Esporo', vigia: { name: 'Micólogo Brumo', title: 'Estudioso da Floresta Estelar', line: 'Os esporos pensam em conjunto, sabia? Agora pensam uma única coisa: silêncio.' },
    boss: { name: 'Mente-Colmeia Sporax', kind: 'mushroom', tint: '#d98be0', scale: 3.1 },
    lore: 'Da podridão nasce a floresta. Todo fim é, em segredo, um adubo.', collect: { item: 'mana_shard', n: 12, itemName: 'Fragmento de Mana' },
    victory: ['Sporax se desfaz em milhões de pontos de luz.', 'Os esporos, livres, pensam mil coisas diferentes ao mesmo tempo.', 'Brumo ri: — Que bagunça gloriosa.'] },
  { biome: 'marble', eco: 'Eco da Memória', vigia: { name: 'Arquivista Cássia', title: 'Guardiã das Ruínas de Lumina', line: 'Todas as inscrições foram apagadas. Menos uma, que não consigo ler: está escrita na minha letra.' },
    boss: { name: 'Estátua Viva Aurelius', kind: 'golem', tint: '#e9e5d0', scale: 3 },
    lore: 'Lembrar é construir, pedra por pedra, o que o tempo quer derrubar.', collect: { item: 'stone', n: 40, itemName: 'Pedra' },
    victory: ['Aurelius ajoelha, e as inscrições voltam à pedra, letra por letra.', 'A última frase, finalmente legível: “O Guardião que esquece sou eu.”', 'Dezesseis Ecos cantam. Falta só o mais fundo.'] },

  { biome: 'thunder', eco: 'Eco do Trovão', vigia: { name: 'Capitão Brontes', title: 'Vigia do Planalto', line: 'Já não há raios aqui. Só um zumbido, como um grito que ninguém ouve.' },
    boss: { name: 'Titã da Tempestade Raijin-Kal', kind: 'golem', tint: '#8fb2ff', scale: 3.2 },
    lore: 'O trovão é a Canção levantando a voz para não ser esquecida.', collect: { item: 'iron_ingot', n: 10, itemName: 'Lingote de Ferro' },
    victory: ['Raijin-Kal ergue os braços e o céu inteiro responde.', 'O trovão rola por cem léguas, e cada eco do planalto repete: “Ainda estamos aqui.”', 'Brontes, rouco: — Vá. O último está no abismo.'] },
  { biome: 'obsidian', eco: 'Eco do Abismo', vigia: { name: 'Nox', title: 'Eremita das Fendas', line: 'Eu o esperava, viajante. Fui a única que ficou para ouvir o último acorde.' },
    boss: { name: 'Guardião do Abismo Umbrathos', kind: 'scorpion', tint: '#4a3a5a', scale: 3.2 },
    lore: 'No fundo do abismo, a Canção descansa. Não morre: espera.', collect: { item: 'crystal_ore', n: 15, itemName: 'Cristal de Mana' },
    victory: ['Umbrathos cai e as fendas se iluminam de dentro para fora.', 'No fundo, uma figura de manto cinza, sem sombra, olha para você.', 'Dezessete Ecos cantam, e uma voz calma diz: — Então você chegou. Eu sou Vael.'] },
];

/* ───────────────────────────── Vael, o Sem-Eco ───────────────────────────── */
const OBSIDIAN_GATE = FRONTIER_GATES.find(g => g.biome === 'obsidian')!;
export const VAEL_ARENA = { tx: OBSIDIAN_GATE.tx - 16, ty: OBSIDIAN_GATE.ty - 14 };
const BOSS_OFFSET = { dx: 18, dy: 2 };
const VIGIA_OFFSET = { dx: -3, dy: 2 };

export const bossLevel = (biome: FrontierBiome) => BIOME_LEVEL[biome] + 6;
const xpFor = (lvl: number) => Math.floor(25 * Math.pow(lvl, 1.6));

/* ───────────────────────────── Geração: chefes, NPCs, missões ───────────────────────────── */
const PALS: Palette[] = [
  { skin: '#f0c8a0', hair: '#7a3a1a', body: '#c0803a', legs: '#503020' },
  { skin: '#e8c8a0', hair: '#d0a0b0', body: '#c05a8a', legs: '#502040' },
  { skin: '#d8a070', hair: '#203040', body: '#2a7a9a', legs: '#183040' },
  { skin: '#f8d8b8', hair: '#a080d0', body: '#6a4a9a', legs: '#302050' },
  { skin: '#e0b890', hair: '#304030', body: '#4a8a5a', legs: '#203820' },
  { skin: '#a87048', hair: '#e8e0d0', body: '#d0b060', legs: '#705020' },
  { skin: '#f0d0b0', hair: '#c0c8d0', body: '#6080a0', legs: '#283850' },
  { skin: '#c89868', hair: '#101010', body: '#7a3030', legs: '#401818' },
];
const gateOf = (b: FrontierBiome) => FRONTIER_GATES.find(g => g.biome === b)!;

export const STORY_BOSSES: BossDef[] = [
  ...ECOS.map((e): BossDef => {
    const g = gateOf(e.biome), lvl = bossLevel(e.biome), ft = FRONTIER[e.biome];
    return {
      id: `${e.biome}_boss`, name: e.boss.name, biome: e.biome, tx: g.tx + BOSS_OFFSET.dx, ty: g.ty + BOSS_OFFSET.dy,
      hp: Math.round(800 + lvl * lvl * 12 + lvl * 60), atk: Math.round(14 + lvl * 1.7),
      xp: Math.round(xpFor(lvl) * 1.1), gold: lvl * 30, color: e.boss.tint, minion: ft.enemies[1] as EnemyKind,
      reward: ['eco_shard', 'eco_shard', 'eco_shard', 'hi_potion', 'hi_potion'],
    };
  }),
  { id: 'vael', name: 'Vael, o Sem-Eco', biome: 'obsidian', tx: VAEL_ARENA.tx, ty: VAEL_ARENA.ty, hp: 60000, atk: 130, xp: 40000, gold: 6000, color: '#9a9ab8', minion: 'shade',
    reward: ['void_essence', 'void_essence', 'void_essence', 'void_essence', 'void_essence', 'eco_shard', 'eco_shard', 'eco_shard', 'elixir', 'elixir'] },
];
export const STORY_BOSS_LOOK: Record<string, { kind: EnemyKind; tint: string; scale: number }> = {
  ...Object.fromEntries(ECOS.map(e => [`${e.biome}_boss`, { kind: e.boss.kind, tint: e.boss.tint, scale: e.boss.scale }])),
  vael: { kind: 'shade', tint: '#c8c8f0', scale: 3.4 },
};

export const STORY_NPCS: NpcDef[] = ECOS.map((e, i): NpcDef => {
  const g = gateOf(e.biome);
  return {
    id: `vigia_${e.biome}`, name: e.vigia.name, title: e.vigia.title, tx: g.tx + VIGIA_OFFSET.dx, ty: g.ty + VIGIA_OFFSET.dy, pal: PALS[i % PALS.length],
    lines: [e.vigia.line, e.lore, `Aqui soa o ${e.eco}. Ou soava.`, 'Siga as estradas: toda região está ligada a outra.'],
    role: 'shop',
  };
});

const killN = (biome: FrontierBiome) => 8 + FRONTIER[biome].tier * 3;
export const ACT_OF_BIOME: Record<string, number> = Object.fromEntries(ACTS.flatMap(a => a.biomes.map(b => [b, a.id])));
const lastQuestOf = (b: FrontierBiome) => `${b}_3`;

/* ───────────── Expansão: Memórias de Vael e missões de cada região ───────────── */
/** Cada região guarda um pedaço da vida de Vael antes do Silêncio; juntas contam a história inteira. */
export const MEMORIAS: Record<FrontierBiome, { title: string; ask: string; lines: string[] }> = {
  sunflower: { title: 'O Menino do Trigo', ask: 'Encontrei um chapéu de palha de criança no campo. Ajude-me a limpar o caminho até o velho celeiro.', lines: ['No celeiro, rabiscos de criança: dois meninos de mãos dadas sob a Árvore.', 'Um nome está escrito com cuidado: “Vael”. O outro, apagado, termina em “orm”.', 'Dona Marta suspira: — Gorm sempre disse que nasceu sozinho.'] },
  sakura: { title: 'A Primeira Despedida', ask: 'Uma cerejeira guarda uma fita amarrada há um século. Traga madeira para eu alcançá-la.', lines: ['Na fita, uma carta: “Mãe, a Árvore me escolheu. Eu ouço todas as notas.”', '“Ouço também quando elas acabam. Cada flor que cai é um adeus.”', 'Haruki fecha os olhos: — Ouvir tudo... que dom terrível.'] },
  coral: { title: 'O Farol Apagado', ask: 'O antigo diário do farol foi levado pela maré. Recupere-o das criaturas do recife.', lines: ['“O aprendiz Vael pediu para ficar no farol. Diz que aqui o mar fala mais baixo.”', '“Ele não dorme. Passa as noites contando ondas, como quem conta os mortos.”', 'Nerina guarda o diário junto ao peito.'] },
  lavender: { title: 'O Perfume Esquecido', ask: 'Preciso de ervas para destilar o perfume de uma lembrança perdida.', lines: ['O perfume mostra uma cena: Vael e Gorm, adolescentes, fugindo da aula de canto.', '— Se a Canção dói tanto, por que cantamos? — pergunta Vael.', '— Porque o silêncio dói mais — responde Gorm. Vael não parece convencido.'] },
  lotus: { title: 'O Lago dos Reflexos', ask: 'Os reflexos do lago mostram o passado. Afaste as feras para eu meditar.', lines: ['No lago, Vael ajoelhado, tentando calar uma nota com as mãos.', 'Seus dedos ficam cinzentos onde tocam a água.', 'Bhuvan sussurra: — Foi aqui que o Silêncio nasceu. Não por maldade. Por dor.'] },
  oasis: { title: 'O Desejo do Djinn', ask: 'O djinn concedeu um desejo há cem anos. Descubra qual, entre as dunas.', lines: ['Zahra lê nas estrelas: “Desejo não ouvir mais nenhum adeus.”', 'O djinn obedeceu. Arrancou de Vael o próprio eco.', 'Desde então, ele não faz som. Nem ao chorar.'] },
  moonwood: { title: 'Pegadas Sem Eco', ask: 'Pegadas que não fazem barulho cruzam a floresta. Siga-as, enfrentando as sombras.', lines: ['As pegadas terminam num túmulo sem nome, coberto de flores da lua frescas.', 'Alguém visita este lugar todas as noites.', 'Selene: — É o túmulo da mãe dele. Vael ainda vem. Sempre vem.'] },
  bamboo: { title: 'O Pergaminho Proibido', ask: 'Os monges esconderam um pergaminho no bambuzal. Abra caminho até ele.', lines: ['“O Conselho votou: Vael será selado. A Canção precisa de um ouvinte que não sofra.”', '“Apenas um voto contra.” A assinatura é de Gorm.', 'Ren enrola o pergaminho devagar: — Então Gorm tentou salvá-lo.'] },
  mangrove: { title: 'O Barco de Dois Remos', ask: 'Um barco antigo está preso nas raízes. Liberte-o das criaturas do mangue.', lines: ['No casco, entalhado: “Para Vael, quando você quiser fugir. — G.”', 'O barco nunca foi usado. Vael ficou. Escolheu ficar.', 'Tomás tira o chapéu outra vez, em silêncio.'] },
  amber: { title: 'O Instante Preso', ask: 'Fragmentos de âmbar guardam instantes. Traga minério para eu lapidá-los.', lines: ['No âmbar: o dia do selamento. Gorm grita, Vael sorri, triste.', '— Não me esqueça — diz Vael. — Eu vou te esquecer primeiro, para doer menos.', 'O âmbar escurece. Karum desvia o olhar.'] },
  crimson: { title: 'As Folhas que Esperam', ask: 'As folhas que não caíam formam palavras no ar. Proteja-me enquanto as leio.', lines: ['As folhas dizem: “Gorm, eu sinto muito.”', 'Elas esperaram cem anos para chegar ao chão, como um pedido de desculpas.', 'Ayame recolhe uma e guarda para levar a Potos.'] },
  prism: { title: 'O Prisma da Verdade', ask: 'Um cristal mostra a verdade de quem o olha. Recupere-o dos guardiões.', lines: ['No prisma, Gorm velho e Vael jovem se encaram, separados por cem anos.', 'Vael não envelheceu: o Silêncio parou o tempo dele.', 'Prisma, a Lapidária: — Ele está preso no dia em que foi abandonado.'] },
  aurora: { title: 'As Luzes do Norte', ask: 'A aurora dança uma canção de ninar. Afaste as feras para eu ouvi-la.', lines: ['É a canção que a mãe de Vael cantava.', 'Vael ainda a cantarola, sem som, enquanto apaga os Ecos um a um.', 'Ele não quer destruir o mundo. Quer que o mundo pare de se despedir.'] },
  spores: { title: 'A Rede Viva', ask: 'Os fungos lembram tudo que tocaram. Traga esporos para despertar a rede.', lines: ['A rede sussurra o plano de Vael: calar o último Eco e, com ele, toda a dor.', '“Mas também toda a alegria”, a rede responde. Vael não ouviu essa parte.', 'Ou ouviu, e escolheu não lembrar.'] },
  marble: { title: 'O Salão das Estátuas', ask: 'Estátuas do Conselho antigo guardam suas últimas palavras. Abra caminho até elas.', lines: ['Uma estátua sem rosto tem a inscrição: “Nós o fizemos ouvir por nós.”', '“E quando ele pediu ajuda, fingimos não ouvir.”', 'O Silêncio, afinal, começou aqui: no silêncio de quem podia ter respondido.'] },
  thunder: { title: 'O Grito na Tempestade', ask: 'O trovão repete um grito antigo. Enfrente as criaturas para alcançar o pico.', lines: ['No pico, o grito se revela: é Gorm, cem anos atrás, chamando o nome de Vael.', 'O trovão guardou o chamado, esperando alguém levá-lo adiante.', 'Agora ele ecoa dentro de você.'] },
  obsidian: { title: 'O Espelho Negro', ask: 'A obsidiana reflete o que você teme. Traga cristais para encarar o reflexo.', lines: ['No espelho, você vê Vael. Depois, você mesmo, ouvindo todas as notas.', 'Você entende: a Árvore escolheu outro ouvinte. Você.', '— Desta vez — você promete — ninguém vai ouvir sozinho.'] },
};

export const STORY_QUESTS: QuestDef[] = [];
const pendingMemorias: { b: FrontierBiome; giver: string; xp: number; lvl: number; enemy: EnemyKind; resource: string; eco: string; act: number }[] = [];
for (const act of ACTS.filter(a => a.biomes.length)) {
  const prev = ACTS.find(a => a.id === act.id - 1)!;
  for (const b of act.biomes) {
    const e = ECOS.find(x => x.biome === b)!, ft = FRONTIER[b], lvl = BIOME_LEVEL[b], giver = `vigia_${b}`, xp = xpFor(lvl);
    const gate: Pick<QuestDef, 'requires' | 'requiresAll'> = act.id === 2 ? { requires: 'm6' } : { requiresAll: prev.biomes.map(lastQuestOf) };
    STORY_QUESTS.push(
      { id: `${b}_1`, title: `${e.eco}: Rastros`, main: true, act: act.id, giver, ...gate, desc: `${e.vigia.name}: “${e.lore}” Elimine as criaturas corrompidas para abrir caminho até o Eco.`,
        goal: { kind: 'kill', target: ft.enemies[0] as EnemyKind, n: killN(b) }, reward: { xp: Math.round(xp * 0.4), gold: lvl * 12, items: ['potion', 'potion', 'ether'] } },
      { id: `${b}_2`, title: `${e.eco}: Fragmentos`, main: true, act: act.id, giver, requires: `${b}_1`, desc: `Reúna ${e.collect.n} × ${e.collect.itemName} para que ${e.vigia.name} possa entoar o Eco outra vez.`,
        goal: { kind: 'collect', item: e.collect.item, n: e.collect.n }, reward: { xp: Math.round(xp * 0.4), gold: lvl * 12, items: ['hi_potion', 'hi_potion', 'eco_shard'] } },
      { id: `${b}_3`, title: `${e.eco}: ${e.boss.name}`, main: true, act: act.id, giver, requires: `${b}_2`, desc: `Enfrente ${e.boss.name} na arena a leste do portal e devolva a voz ao ${e.eco}.`,
        goal: { kind: 'boss', target: `${b}_boss` }, reward: { xp: Math.round(xp * 1.0), gold: lvl * 40, items: ['elixir', 'eco_shard'] } },
      { id: `${b}_4`, title: `Rumor de ${ft.name}`, main: false, act: act.id, giver, requires: `${b}_1`, desc: `Há mais criaturas rondando ${ft.name}. Elimine-as para os viajantes passarem em paz.`,
        goal: { kind: 'kill', target: ft.enemies[1] as EnemyKind, n: killN(b) + 4 }, reward: { xp: Math.round(xp * 0.5), gold: lvl * 15, items: ['hi_potion', 'eco_shard'] } },
    );
    pendingMemorias.push({ b, giver, xp, lvl, enemy: ft.enemies[0] as EnemyKind, resource: ft.resource, eco: e.eco, act: act.id });
  }
}
for (const m of pendingMemorias) {
  const mem = MEMORIAS[m.b];
  STORY_QUESTS.push(
    { id: `${m.b}_5`, title: `Memória: ${mem.title}`, main: false, act: m.act, giver: m.giver, requires: `${m.b}_3`, desc: `${mem.ask} (Elimine ${killN(m.b)} criaturas da região.)`,
      goal: { kind: 'kill', target: m.enemy, n: killN(m.b) }, reward: { xp: Math.round(m.xp * 0.6), gold: m.lvl * 20, items: ['hi_potion', 'eco_shard'] } },
    { id: `${m.b}_6`, title: `Oferenda ao ${m.eco}`, main: false, act: m.act, giver: m.giver, requires: `${m.b}_5`, desc: `A região renasce. Traga ${8 + m.lvl % 7} recursos locais para reconstruir o santuário do ${m.eco}.`,
      goal: { kind: 'collect', item: m.resource, n: 8 + m.lvl % 7 }, reward: { xp: Math.round(m.xp * 0.7), gold: m.lvl * 25, items: ['elixir', 'eco_shard', 'eco_shard'] } },
  );
}
const FINAL_GATE = ACTS[4].biomes.map(lastQuestOf);
STORY_QUESTS.push(
  { id: 'f1', title: 'O Coro dos Dezessete', main: true, act: 5, giver: 'elder', requiresAll: FINAL_GATE, desc: 'Gorm quer entoar a Canção completa. Traga 30 Fragmentos de Mana para o Coro.',
    goal: { kind: 'collect', item: 'mana_shard', n: 30 }, reward: { xp: 18000, gold: 3000, items: ['elixir', 'eco_shard', 'eco_shard'] } },
  { id: 'f2', title: 'A Procissão das Sombras', main: true, act: 5, giver: 'elder', requires: 'f1', desc: 'O Silêncio responde ao Coro enviando suas sombras. Destrua 30 Espíritos Sombrios.',
    goal: { kind: 'kill', target: 'shade', n: 30 }, reward: { xp: 24000, gold: 4000, items: ['elixir', 'eco_shard', 'eco_shard'] } },
  { id: 'f3', title: 'Vael, o Sem-Eco', main: true, act: 5, giver: 'elder', requires: 'f2', desc: 'Nas Fendas de Obsidiana, a noroeste do portal, Vael espera. Encerre a Canção partida — ou ouça-o.',
    goal: { kind: 'boss', target: 'vael' }, reward: { xp: 60000, gold: 8000, items: ['elixir', 'elixir', 'void_essence'] } },
  { id: 'f4', title: 'O Cântico Renascido', main: true, act: 5, giver: 'elder', requires: 'f3', desc: 'Prepare dois Elixires para a Árvore cantar a última nota: a sua.',
    goal: { kind: 'collect', item: 'elixir', n: 2 }, reward: { xp: 80000, gold: 12000, items: ['void_essence', 'void_essence'] } },
);


/* ───────────────────────────── Itens de fim de jogo ───────────────────────────── */
const it = (d: ItemDef) => d;
export const STORY_ITEMS: ItemDef[] = [
  it({ id: 'eco_shard', name: 'Fragmento de Eco', type: 'material', desc: 'Uma nota da Canção, cristalizada.', color: '#9ff0ff', price: 40 }),
  it({ id: 'void_essence', name: 'Essência do Vazio', type: 'material', desc: 'O que sobra quando um Eco é esquecido.', color: '#8a4fd0', price: 90 }),
  it({ id: 'echo_blade', name: 'Lâmina do Eco', type: 'weapon', weapon: 'sword', atk: 34, bonus: { str: 4, int: 4 }, desc: 'Ressoa a cada golpe.', color: '#9ff0ff', price: 1800 }),
  it({ id: 'echo_lance', name: 'Lança Ressonante', type: 'weapon', weapon: 'spear', atk: 36, bonus: { str: 4, dex: 3 }, desc: 'Perfura até o silêncio.', color: '#a0f0c0', price: 1900 }),
  it({ id: 'echo_bow', name: 'Arco do Cântico', type: 'weapon', weapon: 'bow', atk: 33, bonus: { dex: 8 }, desc: 'Cada flecha leva uma nota.', color: '#ffe08a', price: 1800 }),
  it({ id: 'echo_staff', name: 'Cajado da Harmonia', type: 'weapon', weapon: 'staff', atk: 35, bonus: { int: 9, mp: 50 }, desc: 'Afina a mana de quem o empunha.', color: '#ff9ae8', price: 2000 }),
  it({ id: 'echo_mail', name: 'Cota do Eco', type: 'armor', def: 32, bonus: { vit: 6, hp: 60 }, desc: 'Sussurra quando você fica parado.', color: '#8ad8f0', price: 2200 }),
  it({ id: 'echo_ring', name: 'Anel Ressonante', type: 'ring', bonus: { str: 5, dex: 5, int: 5 }, desc: '+5 For, Des, Int', color: '#9ff0ff', price: 1500 }),
  it({ id: 'echo_amulet', name: 'Amuleto da Harmonia', type: 'amulet', bonus: { vit: 6, wis: 6, hp: 80 }, desc: '+6 Vit, +6 Sab, +80 HP', color: '#b0ffd0', price: 1500 }),
  it({ id: 'void_blade', name: 'Lâmina do Vazio', type: 'weapon', weapon: 'sword', atk: 58, bonus: { str: 8, int: 6 }, desc: 'Corta a lembrança do próprio alvo.', color: '#8a4fd0', price: 6000 }),
  it({ id: 'void_lance', name: 'Lança do Abismo', type: 'weapon', weapon: 'spear', atk: 60, bonus: { str: 8, dex: 6 }, desc: 'Nada a detém.', color: '#6a3fb0', price: 6200 }),
  it({ id: 'void_bow', name: 'Arco do Último Acorde', type: 'weapon', weapon: 'bow', atk: 55, bonus: { dex: 14 }, desc: 'A flecha chega antes do som.', color: '#b08aff', price: 6000 }),
  it({ id: 'void_staff', name: 'Cajado do Silêncio Vivo', type: 'weapon', weapon: 'staff', atk: 58, bonus: { int: 15, mp: 100 }, desc: 'Transforma o silêncio em poder.', color: '#d070ff', price: 6500 }),
  it({ id: 'void_plate', name: 'Placa do Vazio', type: 'armor', def: 48, bonus: { vit: 12, hp: 150 }, desc: 'Nenhum golpe encontra eco.', color: '#6a4aa0', price: 7000 }),
  it({ id: 'void_ring', name: 'Anel do Último Acorde', type: 'ring', bonus: { str: 9, dex: 9, int: 9 }, desc: '+9 For, Des, Int', color: '#8a4fd0', price: 5000 }),
  it({ id: 'void_amulet', name: 'Amuleto do Fim da Canção', type: 'amulet', bonus: { vit: 10, wis: 10, hp: 200 }, desc: '+10 Vit, +10 Sab, +200 HP', color: '#c090ff', price: 5000 }),
];
const rc = (out: string, cost: Record<string, number>, gold: number): Recipe => ({ out, qty: 1, station: 'smith', cost, gold });
export const STORY_RECIPES: Recipe[] = [
  rc('echo_blade', { eco_shard: 6, crystal_ore: 6, iron_ingot: 4 }, 800), rc('echo_lance', { eco_shard: 6, crystal_ore: 6, iron_ingot: 4 }, 800),
  rc('echo_bow', { eco_shard: 6, crystal_ore: 4, wood: 10 }, 800), rc('echo_staff', { eco_shard: 6, mana_shard: 8, wood: 6 }, 900),
  rc('echo_mail', { eco_shard: 8, crystal_ore: 8, iron_ingot: 6 }, 1000), rc('echo_ring', { eco_shard: 5, mana_shard: 6 }, 600), rc('echo_amulet', { eco_shard: 5, frost_herb: 6 }, 600),
  rc('void_blade', { void_essence: 8, eco_shard: 10, iron_ingot: 8 }, 3000), rc('void_lance', { void_essence: 8, eco_shard: 10, iron_ingot: 8 }, 3000),
  rc('void_bow', { void_essence: 8, eco_shard: 10, wood: 20 }, 3000), rc('void_staff', { void_essence: 8, eco_shard: 10, mana_shard: 15 }, 3200),
  rc('void_plate', { void_essence: 12, eco_shard: 14, iron_ingot: 12 }, 4000), rc('void_ring', { void_essence: 6, eco_shard: 8 }, 2500), rc('void_amulet', { void_essence: 6, eco_shard: 8 }, 2500),
];

/* ───────────────────────────── Escalonamento por profundidade e ciclos ───────────────────────────── */
/** Bônus de nível por distância: as duas primeiras fileiras de regiões seguem BIOME_LEVEL; além delas o mundo fica cada vez mais selvagem. */
export function depthBonus(tx: number, ty: number) {
  const col = Math.floor(tx / 320), row = Math.floor(ty / 240);
  return row < 2 ? 0 : (row - 1) * 6 + Math.floor(col * 0.8);
}
export const CYCLE_LEVELS = 20;
export const cycleBonus = (cycle: number) => cycle * CYCLE_LEVELS;
export const cycleBossMult = (cycle: number) => ({ hp: 1 + cycle * 0.8, atk: 1 + cycle * 0.25 });
/** Chance de materiais de fim de jogo caírem de inimigos comuns, conforme o nível do monstro. */
export function endgameDrop(level: number): string | null {
  if (level >= 45 && Math.random() < 0.06) return 'void_essence';
  if (level >= 25 && Math.random() < 0.04) return 'eco_shard';
  return null;
}

/* ───────────────────────────── Cenas (cutscenes) ───────────────────────────── */
export interface Beat { id: string; trigger: string; title: string; lines: string[]; stage?: import('./epic').EpicScene }
const ecoBeats: Beat[] = ECOS.map(e => ({ id: `eco_${e.biome}`, trigger: `boss:${e.biome}_boss`, title: e.eco, lines: e.victory }));
const arrivalBeats: Beat[] = ECOS.map(e => ({ id: `chegada_${e.biome}`, trigger: `quest:${e.biome}_1`, title: `${FRONTIER[e.biome].name}`, lines: [
  `${e.vigia.name}, ${e.vigia.title}, observa você com esperança cansada.`, `— ${e.vigia.line}`, e.lore, `Dizem que ${e.boss.name} guarda o ${e.eco} a leste daqui. Siga a seta dourada.`] }));
const memoriaBeats: Beat[] = ECOS.map(e => ({ id: `memoria_${e.biome}`, trigger: `quest:${e.biome}_5`, title: `Memória — ${MEMORIAS[e.biome].title}`, lines: MEMORIAS[e.biome].lines }));
const act1Beats: Beat[] = [
  { id: 'a1_fungor', trigger: 'quest:m2', title: 'A Coroa de Esporos', lines: ['A coroa de Fungor se parte e libera uma nota fraca, quase esquecida.', 'Gorm a ouve de longe e para no meio da frase.', '— Faz cem anos que não ouço isso — murmura. — Continue, jovem.'] },
  { id: 'a1_morvak', trigger: 'quest:m3', title: 'Raízes Corrompidas', lines: ['Morvak, purificado, fala com voz de madeira velha:', '— As raízes sentiram um menino cinzento passar. Ele não deixava pegadas.', '— Ele pediu desculpas a cada árvore que silenciou.'] },
  { id: 'a1_sahr', trigger: 'quest:m4', title: 'O Ferrão das Areias', lines: ['Na carapaça de Sahr, um símbolo: uma nota musical riscada.', 'É o mesmo símbolo do medalhão que Gorm nunca tira do pescoço.', 'Quando você pergunta, ele muda de assunto.'] },
  { id: 'a1_fenrir', trigger: 'quest:m5', title: 'O Uivo Gelado', lines: ['O uivo de Fenrir se torna uma melodia antes de sumir na neve.', 'No pico, um nome gravado no gelo: “Vael”.', 'O vento leva o nome para longe, em direção às terras de fronteira.'] },
];
export const BEATS: Beat[] = [
  ...act1Beats, ...arrivalBeats, ...memoriaBeats, ...CHRONICLE_BEATS,
  { id: 'prologue', trigger: 'new', title: 'Prólogo — O Último Acorde', lines: [
    'Antes dos reinos, antes dos nomes, havia uma Canção.',
    'A Árvore de Mana a cantava, e cada nota virou um lugar: um campo, um mar, uma montanha.',
    'Dezessete notas — os Ecos — sustentavam o mundo inteiro.',
    'Então veio o Silêncio. Nota após nota, o mundo foi esquecendo como soar.',
    'Em Potos, a última vila sob a Árvore, o Ancião Gorm acordou de um sonho sem palavras.',
    'Você chegou na manhã seguinte. E a Árvore, pela primeira vez em cem anos, vibrou.',
  ] },
  { id: 'act1_end', trigger: 'quest:m6', title: 'Fim do Ato I — O Coração de Mana', lines: [
    'O Colosso de Cristal desaba. Mas a Árvore não se acalma: ela treme.',
    'Gorm abaixa a cabeça. — Ele era só um sintoma, jovem. O Silêncio nunca atacou Potos: ele apenas começou por aqui.',
    '— Existem dezessete Ecos, espalhados além dos Picos e das Areias. Cada um tem um Vigia. Cada um tem um guardião corrompido.',
    'O Atlas agora mostra as passagens para as terras de fronteira. Procure os Vigias.',
  ] },
  ...ecoBeats,
  { id: 'act2_end', trigger: 'act:2', title: 'Fim do Ato II — Os Ecos Mansos', lines: [
    'Seis Ecos cantam outra vez. Os Vigias acendem fogueiras em cada fronteira.',
    'Mas o Silêncio recua com fúria, e os relatos mudam de tom.',
    'Falam de um homem de manto cinza que caminha entre as ruínas, sem sombra, sem pegadas — ou melhor: com pegadas que não fazem som.',
  ] },
  { id: 'act3_end', trigger: 'act:3', title: 'Fim do Ato III — Os Ecos Inquietos', lines: [
    'Onze Ecos. Em cada arena derrotada, a mesma marca: uma pegada muda, um manto de cinza.',
    'O nome Vael passa de boca em boca, em sussurros.',
    'Quando você o diz diante de Gorm, o velho guardião empalidece e se senta, como se as pernas lhe faltassem.',
  ] },
  { id: 'act4_end', trigger: 'act:4', title: 'Fim do Ato IV — A Confissão de Gorm', lines: [
    '— Eu fui o primeiro Guardião, diz Gorm. — Vael foi meu irmão de Canção. Éramos jovens quando a Árvore começou a cantar tudo que doía.',
    '— Cada perda do mundo, cada despedida... a Canção guardava todas. Vael não suportou. Quis calar a Árvore para que o mundo parasse de lembrar a dor.',
    '— Eu o impedi. Ou achei que sim. Foi ele quem criou o Silêncio, e eu quem o deixei crescer, por covardia.',
    '— E você... Você não é a primeira a atravessar esse caminho. A Canção já recomeçou outras vezes. Mas é a primeira que chegou até aqui.',
  ] },
  { id: 'act5_end', trigger: 'act:5', title: 'O Último Passo', lines: [
    'Dezessete Ecos cantam, e o mundo, de repente, parece grande de novo.',
    'Mas Gorm balança a cabeça: falta uma nota, a décima oitava, a que nenhuma terra guarda.',
    '— Reúna os fragmentos. Eu entoarei o Coro. E o Silêncio responderá com tudo o que tem.',
  ] },
  { id: 'vael_defeat', trigger: 'boss:vael', title: 'Vael, o Sem-Eco', lines: [
    'Vael cai de joelhos. Não há ódio nos olhos dele: só cansaço.',
    '— Eu só queria que parasse de doer, diz ele. — Você consegue ouvir o que eu ouvia? Todas as despedidas do mundo, ao mesmo tempo, para sempre.',
    '— Não é a primeira vez que a Canção recomeça. Mas é a primeira vez que alguém me deixa terminar a frase.',
    'O manto cinza se desfaz. Por baixo, um jovem sorrindo, de mãos dadas com um amigo que nunca esqueceu.',
  ] },
  { id: 'epilogue', trigger: 'quest:f4', title: 'Epílogo — O Cântico Renascido', lines: [
    'Gorm, Vael e a Árvore cantam a última nota: a sua. Não é triunfo: é aceitação.',
    'O mundo continua a doer, e continua a soar. As duas coisas, ao mesmo tempo.',
    'O Ciclo 1 se completa. Mas a Canção nunca termina: recomeça, mais funda, mais forte. Os Ecos, agora, esperam por você de novo.',
    'Abra a Crônica e inicie um novo Ciclo quando estiver pronto.',
  ] },
];
export const beatsFor = (trigger: string) => BEATS.filter(b => b.trigger === trigger);

/* ───────────────────────────── Progresso ───────────────────────────── */
export const ALL_ECO_BOSSES = ECOS.map(e => `${e.biome}_boss`);
export const ACT_MAIN_QUESTS = (actId: number) => STORY_QUESTS.filter(q => q.act === actId && q.main).map(q => q.id);
/** Atos 2–4 terminam quando todas as missões principais dos seus biomas estão feitas; o Ato 5 termina quando os dois últimos Ecos caem. */
export const actChainQuests = (actId: number) => ACTS.find(a => a.id === actId)!.biomes.flatMap(b => [`${b}_1`, `${b}_2`, `${b}_3`]);
export const ECO_BIOME_OF_QUEST = (id: string) => id.replace(/_\d$/, '');
