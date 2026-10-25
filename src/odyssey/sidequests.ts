// Histórias paralelas: NPCs com cadeias de missões longas, com falas próprias em cada etapa.
import type { NpcDef, QuestDef } from './data';

export const SIDE_NPCS: NpcDef[] = [
  { id: 'cartographer', name: 'Odessa Vane', title: 'Cartógrafa Errante', tx: 133, ty: 128,
    pal: { skin: '#e8c0a0', hair: '#2a2a40', body: '#3a5a8a', legs: '#202838', accent: '#ffd040' },
    lines: ['Todo mapa mente um pouco. O meu mente menos.', 'Meu irmão Teo desenhou o primeiro mapa de Potos. Depois sumiu.', 'As estradas mudam quando ninguém está olhando.'] },
  { id: 'bard', name: 'Fennick', title: 'Bardo sem Canção', tx: 116, ty: 129,
    pal: { skin: '#f0d0b0', hair: '#d06030', body: '#8a2a5a', legs: '#3a1a2a', accent: '#60f0ff' },
    lines: ['Eu tinha uma canção. Alguém a roubou enquanto eu dormia.', 'Cada monstro guarda uma nota perdida, sabia?', 'Se ouvir um zumbido nas cavernas... sou eu tentando lembrar.'] },
  { id: 'widow', name: 'Senhora Maelis', title: 'Viúva do Farol', tx: 136, ty: 121,
    pal: { skin: '#f4dcc4', hair: '#c8c8d0', body: '#2a2a2a', legs: '#181818', accent: '#c78bff' },
    lines: ['Acendo uma vela por noite. Ele prometeu voltar da montanha.', 'Meu marido, Aldren, era guarda do Santuário Nevado.', 'Não tenho medo do escuro. Tenho medo de esquecer.'] },
  { id: 'twins', name: 'Ilo e Ina', title: 'Gêmeos Aprendizes', tx: 110, ty: 120,
    pal: { skin: '#e0b090', hair: '#f0e080', body: '#40a060', legs: '#205030', accent: '#ff7ae0' },
    lines: ['Ilo: Vamos ser os maiores alquimistas do mundo!', 'Ina: ...depois de pararmos de explodir coisas.', 'Ilo: A Lira não sabe que pegamos o livro dela. Shh!'] },
  { id: 'exile', name: 'Durn Pedra-Negra', title: 'Anão Exilado', tx: 186, ty: 61,
    pal: { skin: '#c89070', hair: '#5a3020', body: '#5a5a6a', legs: '#2a2a30', accent: '#ff6a20' },
    lines: ['Fui expulso do meu clã por uma dívida que não era minha.', 'O Colosso? Fomos nós que o construímos. Que vergonha.', 'Pedra lembra. Pedra sempre lembra.'] },
  { id: 'fisher', name: 'Nereo das Redes', title: 'Pescador da Costa', tx: 288, ty: 200,
    pal: { skin: '#c89070', hair: '#404050', body: '#2a5a7a', legs: '#1a3040', accent: '#80f0e0' },
    lines: ['O mar devolve tudo que a terra esquece. Com juros.', 'Ontem pesquei uma bota. Dentro dela, um mapa. Dentro do mapa, outra bota.', 'As medusas de mana brilham mais quando vai chover.'] },
  { id: 'beekeeper', name: 'Brisa do Apiário', title: 'Apicultora da Pradaria', tx: 136, ty: 198,
    pal: { skin: '#f0d0b0', hair: '#f0e080', body: '#d0a020', legs: '#604010', accent: '#ffe060' },
    lines: ['Minhas abelhas fazem mel de névoa. Não pergunte.', 'As fadas travessas roubam mel. Roubam com elegância, pelo menos.', 'Um enxame inteiro sumiu rumo ao Abismo. Abelhas não descem lá. Não sozinhas.'] },
  { id: 'gravedigger', name: 'Anselmo Campo-Santo', title: 'Coveiro das Ruínas', tx: 186, ty: 200,
    pal: { skin: '#d8b090', hair: '#b0b0b0', body: '#3a3a44', legs: '#22222a', accent: '#c0c0d0' },
    lines: ['Enterro os que ninguém mais quer enterrar. Alguém tem que querer.', 'Os esqueletos das ruínas não são meus. Os meus ficam quietos.', 'Um baú me acenou outro dia. Fingi que não vi.'] },
  { id: 'stormcaller', name: 'Iseo Cata-Ventos', title: 'Pastor de Tempestades', tx: 124, ty: 44,
    pal: { skin: '#e0b090', hair: '#e8e8e8', body: '#4a6a9a', legs: '#2a3a50', accent: '#60c0ff' },
    lines: ['Trovões são ovelhas teimosas do céu. Eu as conduzo.', 'Os duendes do gelo roubam meus raios para fazer agulhas.', 'Há uma tempestade presa no Abismo. Eu a ouço zumbir nas noites frias.'] },
  { id: 'mushroomkeeper', name: 'Odete dos Fungos', title: 'Fungicultora', tx: 26, ty: 164,
    pal: { skin: '#f4dcc4', hair: '#d06030', body: '#7a4a8a', legs: '#3a2050', accent: '#e090ff' },
    lines: ['Cogumelos conversam entre si pelo chão. Fofocam horrores.', 'As gosmas verdes são primas distantes. Não as convido para jantar.', 'Tem um cogumelo no fundo do Abismo que sonha em ser árvore.'] },
  { id: 'sandsage', name: 'Rahim das Dunas', title: 'Sábio do Deserto', tx: 192, ty: 130,
    pal: { skin: '#a87048', hair: '#202020', body: '#c09030', legs: '#604010', accent: '#ffd040' },
    lines: ['A areia aqui já foi um mar. Os peixes viraram serpentes de puro tédio.', 'As múmias guardam a biblioteca enterrada. Elas emprestam livros. Cobram caro.', 'Cada besouro carrega um mapa nas costas. Saber ler é outra história.'] },
];

type Q = QuestDef;
const chain = (giver: string, prefix: string, steps: Omit<Q, 'id' | 'giver' | 'main' | 'requires'>[]): Q[] =>
  steps.map((s, i) => ({ ...s, id: `${prefix}${i + 1}`, giver, main: false, ...(i ? { requires: `${prefix}${i}` } : {}) }));

export const SIDE_QUESTS: QuestDef[] = [
  ...chain('cartographer', 'map', [
    { title: 'O Mapa Rasgado', intro: ['Ah, um aventureiro! Preciso de olhos e pernas.', 'O mapa do meu irmão Teo foi rasgado. Os goblins usam os pedaços como lenço!'], desc: 'Derrote 6 Goblins e recupere os fragmentos do mapa de Teo.', outro: 'Olhe esta caligrafia... é dele. Há uma marca na floresta que eu nunca vi.', goal: { kind: 'kill', target: 'goblin', n: 6 }, reward: { xp: 80, gold: 50, items: ['potion'] } },
    { title: 'Tinta de Raiz', intro: ['Para restaurar o mapa, preciso de tinta feita de madeira dos espíritos.', 'Teo dizia que só ela não desbota sob a luz da lua.'], desc: 'Traga 6 Madeiras Ancestrais da Floresta dos Espíritos.', outro: 'A tinta revelou uma trilha escondida... ela leva ao deserto. Teo esteve lá!', goal: { kind: 'collect', item: 'wood', n: 6 }, reward: { xp: 160, gold: 90, items: ['hi_potion'] } },
    { title: 'Pegadas na Areia', intro: ['Kassim, o nômade, viu um homem de capa azul há anos.', 'Ele foi atacado por escorpiões e deixou cair sua bússola.'], desc: 'Derrote 8 Escorpiões Sombrios para achar a bússola de Teo.', outro: 'A bússola não aponta para o norte... aponta para as montanhas. Para ele.', goal: { kind: 'kill', target: 'scorpion', n: 8 }, reward: { xp: 320, gold: 160, items: ['sun_amulet'] } },
    { title: 'O Último Desenho', intro: ['A bússola indica o covil de Fenrir.', 'Se Teo está vivo, está além do gelo. Se não... quero ao menos o último mapa dele.'], desc: 'Derrote Fenrir Glacial e procure os pertences de Teo no covil.', outro: 'Um caderno congelado... o último mapa mostra o mundo inteiro, além das fronteiras. Teo não se perdeu. Ele foi explorar. Obrigada, de verdade.', goal: { kind: 'boss', target: 'fenrir' }, reward: { xp: 900, gold: 500, items: ['elixir', 'wolf_ring'] } },
  ]),
  ...chain('bard', 'song', [
    { title: 'A Primeira Nota', intro: ['Minha canção foi roubada pelos esporos. Juro!', 'Quando os cogumelos morrem, soltam um zumbido. É minha melodia, presa neles.'], desc: 'Derrote 10 Cogumelos para libertar a primeira nota.', outro: '♪ Lá... ♪ Eu lembrei! Era uma canção de ninar. Mas de quem?', goal: { kind: 'kill', target: 'mushroom', n: 10 }, reward: { xp: 60, gold: 30, items: ['ether'] } },
    { title: 'Ecos da Floresta', intro: ['Os Esporitos cantam à noite. Cantam a MINHA canção, desafinada.'], desc: 'Derrote 8 Esporitos na floresta.', outro: '♪ Lá, mi, ré... ♪ Minha mãe cantava isto. Antes do Ent enlouquecer.', goal: { kind: 'kill', target: 'sporeling', n: 8 }, reward: { xp: 180, gold: 80, items: ['herb_amulet'] } },
    { title: 'Cordas de Pele', intro: ['Meu alaúde quebrou de tristeza. Literalmente.', 'Cordas de pele de lobo vibram com a melodia certa.'], desc: 'Traga 4 Peles de Lobo para refazer o alaúde.', outro: 'Ouça! Ainda falta o refrão. Ele está... na escuridão.', goal: { kind: 'collect', item: 'wolf_pelt', n: 4 }, reward: { xp: 350, gold: 150 } },
    { title: 'O Refrão das Sombras', intro: ['Os Espíritos Sombrios guardam o refrão.', 'Dizem que eram músicos que esqueceram como cantar. Liberte-os.'], desc: 'Derrote 8 Espíritos Sombrios nas Cavernas de Cristal.', outro: '♪ A canção inteira! ♪ Não era para mim... era para todos que perderam algo. Vou tocá-la em cada vila do mundo.', goal: { kind: 'kill', target: 'shade', n: 8 }, reward: { xp: 800, gold: 400, items: ['mana_ring', 'elixir'] } },
  ]),
  ...chain('widow', 'vigil', [
    { title: 'Velas para Aldren', intro: ['Minhas velas acabaram. Sem elas, ele não acha o caminho de volta.', 'Pelo menos é o que conto a mim mesma.'], desc: 'Traga 5 Esporos para fazer cera de vela.', outro: 'Obrigada. A chama hoje dançou diferente... como se respondesse.', goal: { kind: 'collect', item: 'goo', n: 5 }, reward: { xp: 50, gold: 40, items: ['potion', 'potion'] } },
    { title: 'A Carta Não Enviada', intro: ['Achei uma carta dele no baú. Nunca foi enviada.', 'Diz: "Os lobos não são o perigo. O gelo fala."'], desc: 'Traga 4 Ervas Gélidas para que eu possa ir ao santuário sem congelar.', outro: 'Não... eu não consigo subir. Vá você. Pergunte ao Eremita Yorn sobre Aldren.', goal: { kind: 'collect', item: 'frost_herb', n: 4 }, reward: { xp: 260, gold: 120, items: ['frost_mail'] } },
    { title: 'O Gelo que Fala', intro: ['Yorn disse que Aldren enfrentou lobos para proteger o santuário.', 'Os lobos ainda rondam o lugar onde ele caiu.'], desc: 'Derrote 10 Lobos da Neve nos Picos Sagrados.', outro: 'Você trouxe o broche dele... estava sob a neve. Então é verdade.', goal: { kind: 'kill', target: 'wolf', n: 10 }, reward: { xp: 500, gold: 250 } },
    { title: 'A Última Vela', intro: ['Esta noite acenderei a última vela. Não para ele voltar...', '...mas para eu poder seguir em frente. Preciso de luz pura para isso.'], desc: 'Traga 3 Fragmentos de Mana para a vela final.', outro: 'A chama ficou azul. Acho que ele está em paz. E eu também. Leve isto, era dele.', goal: { kind: 'collect', item: 'mana_shard', n: 3 }, reward: { xp: 600, gold: 300, items: ['mana_sword'] } },
  ]),
  ...chain('twins', 'twin', [
    { title: 'Experimento nº 1', intro: ['Ilo: Psiu! Queremos fazer uma poção que faz voar!', 'Ina: Ou pelo menos uma que não exploda.'], desc: 'Traga 6 Ervas Medicinais para os gêmeos.', outro: 'BUM! ...Ina: Bom, nossas sobrancelhas voaram. É um começo.', goal: { kind: 'collect', item: 'herb', n: 6 }, reward: { xp: 40, gold: 20, items: ['ether'] } },
    { title: 'A Rosa Impossível', intro: ['Ina: O livro da Lira diz que a Rosa do Deserto estabiliza misturas.', 'Ilo: E que ela morde. Talvez.'], desc: 'Traga 3 Rosas do Deserto.', outro: 'Ilo: Funcionou! Flutuei dois centímetros! Ina: Por um segundo.', goal: { kind: 'collect', item: 'desert_rose', n: 3 }, reward: { xp: 220, gold: 100, items: ['hi_potion', 'hi_potion'] } },
    { title: 'Coração de Pedra', intro: ['Ina: Precisamos de algo que pese MENOS que nada.', 'Ilo: Os golens têm cristais que flutuam dentro do peito!'], desc: 'Derrote 6 Golens de Pedra.', outro: 'Ina: Os cristais dentro deles... estavam chorando? Ilo: Cristais não choram. ...Né?', goal: { kind: 'kill', target: 'golem', n: 6 }, reward: { xp: 450, gold: 200 } },
    { title: 'A Confissão', intro: ['Ilo: Temos que contar à Lira que pegamos o livro.', 'Ina: Leve um presente para ela não nos transformar em sapos.'], desc: 'Traga 2 Cristais de Mana como pedido de desculpas.', outro: 'Lira riu e nos aceitou como aprendizes oficiais! Fizemos isto para você — sem explosões. Quase.', goal: { kind: 'collect', item: 'crystal_ore', n: 2 }, reward: { xp: 500, gold: 250, items: ['elemental_staff'] } },
  ]),
  ...chain('exile', 'exile', [
    { title: 'Dívida de Pedra', intro: ['Meu clã construiu o Colosso para guardar o Coração de Mana.', 'Quando ele enlouqueceu, me culparam. Preciso provar que não fui eu.'], desc: 'Traga 8 Minérios de Ferro para forjar ferramentas de escavação.', outro: 'Bom ferro. Com isto, posso abrir as câmaras antigas.', goal: { kind: 'collect', item: 'iron_ore', n: 8 }, reward: { xp: 300, gold: 150 } },
    { title: 'As Runas Apagadas', intro: ['As runas de controle estão cobertas de sombra.', 'Os espíritos sombrios se alimentam delas.'], desc: 'Derrote 6 Espíritos Sombrios perto das cavernas.', outro: 'As runas dizem... "ordem do Mestre Kael". Kael! Meu próprio irmão me traiu.', goal: { kind: 'kill', target: 'shade', n: 6 }, reward: { xp: 550, gold: 250, items: ['iron_armor'] } },
    { title: 'Prova Viva', intro: ['O clã não vai acreditar em runas. Precisa ver com os próprios olhos.', 'Traga o núcleo de cristal do Colosso. A marca de Kael está nele.'], desc: 'Derrote o Colosso de Cristal.', outro: 'A marca de Kael, gravada no núcleo. Vou voltar para casa de cabeça erguida. Você restaurou a honra de Pedra-Negra.', goal: { kind: 'boss', target: 'crystal_golem' }, reward: { xp: 2000, gold: 800, items: ['crystal_spear', 'elixir'] } },
  ]),
];
