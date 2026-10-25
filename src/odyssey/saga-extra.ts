// Conteúdo extra da Saga dos Oito Céus: provações de zona (caçada, relíquias e campeão),
// estrelas por reino e as Grandes Jornadas — histórias paralelas longas, em vários atos.
// Dado puro e determinístico; o progresso vive no conjunto `discoveries` do save.
import { SAGA_REALMS, SIDE_STORIES, type SagaRealm, type SideStep, type SideStory } from './saga';

/* ───────────── Provações de zona ───────────── */
export const RELICS_PER_ZONE = 5;
/** Abates pedidos pela Caçada de cada zona: cresce por reino e por zona. */
export const huntGoal = (ri: number, zi: number) => 40 + ri * 5 + zi * 6;
export const zoneKillPrefix = (r: SagaRealm, zi: number) => `sagazk:${r.id}:${zi}=`;
export const relicKey = (r: SagaRealm, zi: number, k: number) => `sagarelic:${r.id}:${zi}:${k}`;
export const relicSetKey = (r: SagaRealm, zi: number) => `sagarelics:${r.id}:${zi}`;
export const huntKey = (r: SagaRealm, zi: number) => `sagahunt:${r.id}:${zi}`;
export const champKey = (r: SagaRealm, zi: number) => `sagachamp:${r.id}:${zi}`;
export const starChestKey = (r: SagaRealm) => `sagastars:${r.id}`;

/** Estrelas de uma zona (0–3): campeão vencido, caçada entregue, relíquias completas. */
export function zoneStars(r: SagaRealm, zi: number, has: (k: string) => boolean) {
  return (has(champKey(r, zi)) ? 1 : 0) + (has(huntKey(r, zi)) ? 1 : 0) + (has(relicSetKey(r, zi)) ? 1 : 0);
}
export const realmStarGoal = (r: SagaRealm) => r.zones.length * 3;
export const realmStars = (r: SagaRealm, has: (k: string) => boolean) => r.zones.reduce((n, _, i) => n + zoneStars(r, i, has), 0);
export const relicsFound = (r: SagaRealm, zi: number, has: (k: string) => boolean) => Array.from({ length: RELICS_PER_ZONE }, (_, k) => has(relicKey(r, zi, k))).filter(Boolean).length;

/** Campeões: um guerreiro de elite por zona, com título próprio do reino. */
const CHAMPS: Record<string, string[]> = {
  aeloria: ['Contramestre Coral-Negro', 'Caçador de Ecos Sibilante', 'Arauto da Febre', 'Garra-de-Vento Rasgada', 'Brasa Errante Kael', 'Afogado Que Reza', 'Elo Partido Vigilante'],
  ylvenna: ['Bobo da Corte Sem Riso', 'Cavaleiro do Solstício', 'Lâmina de Geada Fina', 'Espelho Que Morde', 'Espinheiro Andante'],
  thalassa: ['Lança-Coral Hydros', 'Serpente das Algas Velhas', 'Sentinela de Mármore Molhado', 'Olho-Lanterna da Fossa'],
  aerith: ['Pena-de-Ferro Celestial', 'Podador Sem Mestre', 'Leitor Proibido', 'Martelo do Trovão Velho', 'Penitente das Asas'],
  mortaveu: ['Vigia dos Sem-Nome', 'Remador Sem Moeda', 'Cavaleiro de Ossos Leais', 'Anfitrião Sem Sombra', 'Colhedora Pálida', 'Cão-Sentinela Menor'],
  khronn: ['Escaravelho do Ontem', 'Miragem Armada', 'Pregoeiro da Praga', 'Ponteiro Enlouquecido', 'Soldado do Futuro Vermelho', 'Pergunta Sem Resposta'],
  gehenna: ['Carrasco dos Portões', 'Barqueiro do Fogo', 'Escrivão das Sentenças', 'Capitão Sem Exército', 'Pedreiro de Gritos', 'Espinho de Lilith', 'Camareiro do Trono', 'Sombra Coroada'],
  vazio: ['Arquiteto Menor', 'Estrela Que Esqueceu', 'Eco Cinzento', 'Batida de Ømnia', 'Primeira Pausa'],
};
export const championName = (r: SagaRealm, zi: number) => CHAMPS[r.id]?.[zi] ?? `Campeão de ${r.zones[zi]!.name}`;
export const championStats = (ri: number, zi: number, level: number) => ({ hpMult: 7 + ri * 0.6 + zi * 0.3, atkMult: 1.55, xpMult: 12, goldMult: 10, level: level + 3 });

/** Nomes e textos das relíquias (5 por zona, com o nome da zona entrelaçado). */
const RELIC: Record<string, [string, (z: string) => string][]> = {
  aeloria: [
    ['Concha Gravada', (z) => `Alguém riscou um nome numa concha de ${z}. A maré apagou metade; a outra metade ainda chama.`],
    ['Elo de Corrente', (z) => `Um elo das correntes de Lyria, caído em ${z}. Ainda está morno, como mão de quem soltou agora.`],
    ['Pena de Harpia Branca', (z) => `As harpias deixam penas brancas onde ouviram a Deusa cantar. Esta veio de ${z}.`],
    ['Diário Salgado', (z) => `"Dia 40. Em ${z} as noites cantam. Acho que é ela. Acho que não estou sozinho."`],
    ['Lágrima de Sal Cristalizada', (z) => `Uma gota de choro que virou pedra. Em ${z}, até o choro espera ser encontrado.`],
  ],
  ylvenna: [
    ['Máscara Rachada', (z) => `Uma máscara feérica partida ao meio em ${z}. Por dentro, alguém escreveu: "eu também tenho medo".`],
    ['Promessa Engarrafada', (z) => `Uma promessa feérica presa em vidro. Ela sussurra o nome de quem a fez em ${z}.`],
    ['Fio de Orvalho', (z) => `As fadas de ${z} tecem mapas com orvalho. Este aponta para o trono vazio.`],
    ['Carta de Titânia', (z) => `"Se a guerra durar, ninguém procura a rainha." Escrita às pressas, esquecida em ${z}.`],
    ['Semente de Riso', (z) => `Plantada em ${z}, esta semente dá flores que riem baixinho quando alguém chora.`],
  ],
  thalassa: [
    ['Moeda de Thalassa', (z) => `Uma moeda com o rosto jovem de Okeanos. Em ${z}, ainda vale um pedido de desculpas.`],
    ['Bolha de Memória', (z) => `Dentro desta bolha de ${z}, uma criança ri na superfície. Foi a última vez que alguém viu o sol.`],
    ['Escama de Leviath', (z) => `Uma escama queimada com a marca de um chifre. O Rei Demônio também tocou ${z}.`],
    ['Partitura de Coral', (z) => `Os corais de ${z} guardam um trecho da canção do reino. Faltam muitas notas.`],
    ['Bilhete Rebelde', (z) => `"Subir não é traição. Ficar no escuro é." Assinado por Scylla, encontrado em ${z}.`],
  ],
  aerith: [
    ['Pena Dourada Partida', (z) => `Uma pena de anjo cortada rente. Em ${z}, mil penas assim foram varridas para debaixo das nuvens.`],
    ['Página de Azariel', (z) => `"Hoje vi o mundo de cima e chorei. É bonito demais para durar." Arrancada de um livro em ${z}.`],
    ['Engrenagem Celeste', (z) => `Uma peça das máquinas que seguravam ${z} no céu. Ainda gira devagar, por teimosia.`],
    ['Vela de Vigília', (z) => `Os anjos de ${z} acendiam velas pelos que caíam. Esta nunca foi apagada.`],
    ['Retrato de Dois Irmãos', (z) => `Uriel e Azariel, crianças, rindo. Escondido atrás de uma parede em ${z}.`],
  ],
  mortaveu: [
    ['Nome Sem Túmulo', (z) => `Um nome escrito num pedaço de osso, achado em ${z}. Ao lê-lo em voz alta, alguém suspira aliviado.`],
    ['Moeda do Barqueiro', (z) => `Uma moeda que nunca foi paga. Em ${z}, alguém ainda espera para atravessar.`],
    ['Brinquedo Pequeno', (z) => `Um cavalinho de madeira em ${z}. Os mortos param quando você passa com ele.`],
    ['Lágrima de Hela', (z) => `A Senhora dos Mortos chorou em ${z} quando Azrakel trancou a porta. A lágrima não secou.`],
    ['Carta Para os Vivos', (z) => `"Diga a eles que não doeu." Deixada sobre uma pedra em ${z}.`],
  ],
  khronn: [
    ['Areia que Sobe', (z) => `Um punhado de areia de ${z} que cai para cima. Cheira a amanhã.`],
    ['Relógio de Bolso Parado', (z) => `Parou na hora exata da praga. Encontrado em ${z}, ainda quente.`],
    ['Tâmara de Elowen', (z) => `Uma tâmara que nunca apodrece, do pé onde Azariel e Elowen sentavam. Esquecida em ${z}.`],
    ['Ponteiro Torto', (z) => `Um ponteiro de ${z} que aponta sempre para o momento que você mais quis mudar.`],
    ['Rabisco do Futuro', (z) => `Alguém de amanhã escreveu na pedra de ${z}: "Não desista. Eu já vi o fim."`],
  ],
  gehenna: [
    ['Grito Solidificado', (z) => `Um grito virou pedra em ${z}. Encostar o ouvido nele dói, mas também conta quem gritou.`],
    ['Sentença Rasgada', (z) => `"Culpado de amar demais." Assinada por Minos, rasgada por alguém em ${z}.`],
    ['Pétala Negra', (z) => `Uma pétala das rosas de Elowen voou até ${z}. Ela queima e não vira cinza.`],
    ['Espada de Cavaleiro', (z) => `Uma espada fincada no chão de ${z}. No cabo: "Para quem vier depois de mim."`],
    ['Retrato de Elowen', (z) => `Um dos mil retratos do castelo, caído em ${z}. Este é o único em que ela não sorri.`],
  ],
  vazio: [
    ['Nota Perdida', (z) => `Uma nota da Canção original, flutuando em ${z}. Ela treme quando você respira.`],
    ['Estrela Apagada', (z) => `Uma estrela que se apagou antes de ter nome. Em ${z}, ela quer ser chamada de algo.`],
    ['Cor Roubada', (z) => `O Silêncio roubou esta cor de Potos. Em ${z}, ela ainda lembra do céu.`],
    ['Lembrança de Vael', (z) => `"Eu só queria que ninguém sofresse." Escrito no nada de ${z}.`],
    ['Primeiro Som', (z) => `Em ${z} existe um som tão pequeno que só se ouve com o coração. Foi o primeiro do mundo.`],
  ],
};
export function relicInfo(r: SagaRealm, zi: number, k: number) {
  const [name, text] = RELIC[r.id]![k % RELICS_PER_ZONE]!;
  return { name, text: text(r.zones[zi]!.name) };
}

/* ───────────── Grandes Jornadas (histórias longas, em atos) ───────────── */
const P = (skin: string, hair: string, body: string, legs: string, accent?: string) => (accent ? { skin, hair, body, legs, accent } : { skin, hair, body, legs });
const talk = (zone: number, text: string, hint: string): SideStep => ({ kind: 'talk', zone, text, hint });
const kill = (zone: number, n: number, text: string, hint: string): SideStep => ({ kind: 'kill', zone, n, text, hint });
const bring = (zone: number, item: string, n: number, text: string, hint: string): SideStep => ({ kind: 'bring', zone, item, n, text, hint });
const boss = (zone: number, text: string, hint: string): SideStep => ({ kind: 'boss', zone, text, hint });
const choice = (zone: number, text: string, a: string, b: string): SideStep => ({ kind: 'choice', zone, text, hint: 'Uma decisão espera por você.', options: [a, b] });

export const GRAND_STORIES: SideStory[] = [
  { id: 'g_farol', realm: 'aeloria', name: 'Grande Jornada · O Faroleiro de Aeloria', npc: { name: 'Velho Tobias', title: 'Faroleiro Sem Farol', pal: P('#e8c8a8', '#f0f0f0', '#405870', '#283848', '#ffd040') },
    steps: [
      talk(0, 'Eu acendia o farol que guiava os navios para longe desta ilha. Azrakel o apagou, e os mil navios vieram dar aqui. A culpa é minha.', 'Fale com Tobias na Praia dos Mil Naufrágios.'),
      kill(0, 60, 'A lente do farol se partiu em pedaços. Os caranguejos guardam cada caco como joia.', 'Derrote 60 criaturas em Aeloria.'),
      bring(1, 'wood', 12, 'A torre precisa de vigas novas. A selva tem madeira boa, se você aguentar os sussurros.', 'Traga 12 Madeiras.'),
      talk(2, 'A névoa do pântano apaga qualquer chama. Preciso saber de onde ela vem.', 'Encontre Tobias no Pântano da Febre Verde.'),
      boss(2, 'A febre é Bulbagrah. Sem ela, a névoa se vai.', 'Derrote a Rainha-Sapo Bulbagrah.'),
      bring(3, 'iron_ingot', 6, 'O vento do cânion vai derrubar a torre. Ferro, muito ferro.', 'Traga 6 Lingotes de Ferro.'),
      kill(4, 70, 'O fogo para o farol tem que vir do vulcão. Mas Kharos não dá nada de graça.', 'Derrote 70 criaturas em Aeloria.'),
      bring(4, 'coal', 15, 'Carvão vulcânico queima por cem anos. Traga o que conseguir.', 'Traga 15 Carvões.'),
      bring(5, 'mana_shard', 8, 'A chama precisa de uma alma. Fragmentos de mana servem.', 'Traga 8 Fragmentos de Mana.'),
      talk(6, 'Está pronto. Daqui da prisão de Lyria dá para ver o farol inteiro. Vamos acendê-lo juntos?', 'Encontre Tobias na Prisão Celeste.'),
      choice(6, 'O farol pode guiar navios para longe da ilha, como antes, ou guiar os fantasmas dos naufrágios para casa.', 'Afastar os navios vivos', 'Guiar os fantasmas para casa'),
    ],
    ending: ['Nenhum navio naufraga em Aeloria de novo. Tobias dorme em paz pela primeira vez em cem anos.', 'Mil luzinhas sobem do mar e seguem o farol. Tobias acena para cada uma.'], reward: { gold: 9000, xp: 40000, item: 'elixir', qty: 6 } },
  { id: 'g_baile', realm: 'ylvenna', name: 'Grande Jornada · O Baile das Duas Estações', npc: { name: 'Madame Sylphine', title: 'Mestra de Cerimônias Feérica', pal: P('#f8e0f0', '#ff90d0', '#a050c0', '#502860', '#ffe070') },
    steps: [
      talk(0, 'Não há baile na corte há cem anos! Sem baile, as fadas esquecem como se dança. E fada que não dança, murcha.', 'Fale com Sylphine no Anel dos Cogumelos.'),
      bring(0, 'goo', 15, 'Para o salão, preciso de cola de cogumelo. Muita.', 'Traga 15 Gosmas.'),
      kill(1, 55, 'As vespas do Verão picaram todos os músicos. Afaste-as.', 'Derrote 55 criaturas em Ylvenna.'),
      bring(1, 'moonflower', 5, 'Flores da lua para os cabelos das damas do Inverno.', 'Traga 5 Flores da Lua.'),
      bring(2, 'frost_herb', 8, 'Ponche gelado para as damas do Verão. Elas fingem não gostar.', 'Traga 8 Ervas Gélidas.'),
      talk(3, 'Os convites! Esqueci os convites! O Lago dos Espelhos copia tudo. Talvez copie os convites também.', 'Encontre Sylphine no Lago dos Espelhos.'),
      boss(3, 'Seu Reflexo guarda a tinta mágica dos convites.', 'Derrote Seu Reflexo Invertido.'),
      kill(4, 65, 'O labirinto se fechou ao redor do salão. Abra o caminho para os convidados.', 'Derrote 65 criaturas em Ylvenna.'),
      bring(4, 'crystal_ore', 6, 'Lustres de cristal. Um baile sem lustres é só uma reunião.', 'Traga 6 Cristais de Mana.'),
      talk(5, 'Todos vieram. Até o Rei Sem Rosto, de máscara nova. A música começa!', 'Encontre Sylphine no Trono da Rainha Vazia.'),
      choice(5, 'A primeira dança é de honra. Você dança com o Duque do Verão ou com a Condessa do Inverno?', 'Dançar com o Verão', 'Dançar com o Inverno'),
    ],
    ending: ['O Verão gira com você e o sol fica mais macio. As fadas dançam até o amanhecer que nunca vem.', 'O Inverno dança com você e neva flores. Ninguém sente frio naquela noite.'], reward: { gold: 14000, xp: 62000, item: 'eco_shard', qty: 4 } },
  { id: 'g_coroa', realm: 'thalassa', name: 'Grande Jornada · A Coroa de Coral', npc: { name: 'Pequeno Nerio', title: 'Herdeiro de Okeanos', pal: P('#a0e0d8', '#60d0ff', '#3070c0', '#183860', '#ffe0a0') },
    steps: [
      talk(0, 'Meu avô vai me dar a coroa um dia. Mas eu não sei nada sobre o meu reino. Me mostra Thalassa?', 'Fale com Nerio no Recife dos Corais Cantores.'),
      kill(0, 60, 'Os corais só cantam a história do reino quando não há monstros por perto.', 'Derrote 60 criaturas em Thalassa.'),
      talk(1, 'Os corais cantaram sobre uma floresta onde os reis aprendiam a nadar no escuro.', 'Encontre Nerio na Floresta de Algas.'),
      bring(1, 'chitin', 10, 'Para nadar no escuro, preciso de uma armadura de carapaça. Dizem que dá coragem.', 'Traga 10 Quitinas.'),
      kill(2, 70, 'A cidade tem medo. Mostre que dá para andar pelas ruas de novo.', 'Derrote 70 criaturas em Thalassa.'),
      bring(2, 'herb', 12, 'O povo da cidade está doente de tristeza. Ervas para chá.', 'Traga 12 Ervas Medicinais.'),
      boss(3, 'Na fossa mora quem roubou a luz do reino. Eu quero ver você vencer.', 'Derrote o Pescador Abissal Lumen.'),
      bring(3, 'mana_shard', 10, 'Com a luz de volta, falta a coroa. Ela é feita de mana e coral.', 'Traga 10 Fragmentos de Mana.'),
      talk(4, 'A coroa está pronta. Vamos ao palácio. Vou falar com meu avô.', 'Encontre Nerio no Palácio de Pérola.'),
      choice(4, 'Nerio pergunta: um bom rei deve ser obedecido ou ouvido?', 'Obedecido, para proteger', 'Ouvido, para entender'),
    ],
    ending: ['Nerio será um rei firme. Thalassa dorme segura sob o olhar dele.', 'Nerio abre o palácio para todos. Pela primeira vez, o povo entra cantando.'], reward: { gold: 20000, xp: 90000, item: 'elixir', qty: 8 } },
  { id: 'g_relogio', realm: 'aerith', name: 'Grande Jornada · O Sino que Ensinava a Voar', npc: { name: 'Irmã Clarion', title: 'Sineira da Cidadela', pal: P('#fff0e8', '#e0c080', '#e8e8ff', '#a0a0c0', '#ffd040') },
    steps: [
      talk(0, 'Havia um sino em Aerith que tocava quando um anjinho aprendia a voar. Ele está mudo desde a noite das asas.', 'Fale com Clarion na Escadaria das Nuvens.'),
      kill(0, 60, 'Os grifos selvagens espalharam o bronze do sino pelas nuvens.', 'Derrote 60 criaturas em Aerith.'),
      bring(1, 'copper_ore', 15, 'Bronze é cobre e coragem. A coragem eu tenho; traga o cobre.', 'Traga 15 Minérios de Cobre.'),
      talk(2, 'A Biblioteca dos Ventos guarda a partitura do sino.', 'Encontre Clarion na Biblioteca dos Ventos.'),
      boss(2, 'Codexa engoliu a partitura. Faça ele devolver.', 'Derrote o Grimório Voador Codexa.'),
      bring(3, 'coal', 18, 'As forjas de relâmpago precisam de carvão para fundir o sino.', 'Traga 18 Carvões.'),
      kill(3, 75, 'Os golens das forjas não deixam ninguém usar as bigornas.', 'Derrote 75 criaturas em Aerith.'),
      bring(4, 'iron_ingot', 8, 'O badalo tem que ser de ferro, pesado como uma promessa.', 'Traga 8 Lingotes de Ferro.'),
      talk(5, 'O sino está pendurado na Torre do Sol. Pronto para tocar.', 'Encontre Clarion na Torre do Sol.'),
      choice(5, 'Quem toca o sino primeiro? Você, que o refez, ou Seraphiel, o anjinho que nasceu sem asas?', 'Eu toco', 'Seraphiel toca'),
    ],
    ending: ['O sino toca e, por um instante, todos os anjos sentem o vento nas costas.', 'Seraphiel toca o sino e flutua um palmo do chão. Ninguém para de chorar por uma hora.'], reward: { gold: 26000, xp: 120000, item: 'eco_shard', qty: 5 } },
  { id: 'g_vela', realm: 'mortaveu', name: 'Grande Jornada · As Mil Velas de Mortavéu', npc: { name: 'Frei Ossian', title: 'Acendedor de Velas', pal: P('#d8e0d0', '#404040', '#3a4a40', '#1a2420', '#a0ffb0') },
    steps: [
      talk(0, 'Cada vela que eu acendo ajuda uma alma a lembrar o caminho. Mas Azrakel roubou o fogo. Tenho mil velas apagadas.', 'Fale com Frei Ossian no Campo das Lápides.'),
      bring(0, 'goo', 20, 'Cera. Preciso de muita cera. Gosma serve, se você não contar a ninguém.', 'Traga 20 Gosmas.'),
      kill(1, 70, 'O rio das almas está cheio de sombras que apagam velas.', 'Derrote 70 criaturas em Mortavéu.'),
      boss(1, 'Kharon guarda o fogo roubado no barco dele.', 'Derrote o Barqueiro Kharon.'),
      talk(2, 'O fogo do barco é fraco. Precisa de um rei para reacendê-lo. Os reis antigos estão nas catacumbas.', 'Encontre Ossian nas Catacumbas.'),
      kill(2, 80, 'Os soldados de ossos não deixam ninguém passar com fogo.', 'Derrote 80 criaturas em Mortavéu.'),
      bring(3, 'herb', 15, 'Na Vila dos Que Esqueceram, o cheiro de ervas faz os mortos lembrarem.', 'Traga 15 Ervas Medicinais.'),
      bring(4, 'moonflower', 8, 'Flores da lua para cada vela do jardim.', 'Traga 8 Flores da Lua.'),
      talk(5, 'Mil velas acesas. Diante da Última Porta.', 'Encontre Ossian no Salão da Última Porta.'),
      choice(5, 'A última vela é a de Ossian. Ele pode acendê-la e partir, ou ficar e cuidar das velas para sempre.', 'Deixe-o partir', 'Peça que fique'),
    ],
    ending: ['Ossian sorri, acende a própria vela e atravessa. A chama dele nunca apaga.', 'Ossian fica. Agora Mortavéu tem sempre uma luz acesa para quem chega.'], reward: { gold: 34000, xp: 160000, item: 'elixir', qty: 10 } },
  { id: 'g_ampulheta', realm: 'khronn', name: 'Grande Jornada · A Ampulheta de Azariel', npc: { name: 'Mestra Sabah', title: 'Relojoeira do Deserto', pal: P('#c89870', '#202020', '#c08040', '#604020', '#ffd080') },
    steps: [
      talk(0, 'Azariel tinha uma ampulheta que podia voltar um único dia. Ele nunca a usou. Quero saber por quê.', 'Fale com Sabah nas Dunas das Ampulhetas.'),
      kill(0, 75, 'As areias se mexem quando há escaravelhos demais. Precisamos de calma.', 'Derrote 75 criaturas em Khronn.'),
      bring(0, 'desert_rose', 8, 'Rosas do deserto marcam onde o tempo dobrou. Traga oito.', 'Traga 8 Rosas do Deserto.'),
      talk(1, 'O oásis mostra o passado. A ampulheta estava aqui, no dia antes da praga.', 'Encontre Sabah no Oásis do Ontem.'),
      kill(2, 80, 'Na cidade da praga, a ampulheta foi enterrada sob a casa de Elowen.', 'Derrote 80 criaturas em Khronn.'),
      bring(3, 'iron_ingot', 10, 'O vidro está inteiro, mas a armação quebrou. Ferro.', 'Traga 10 Lingotes de Ferro.'),
      boss(3, 'Tik-Tak roubou a areia. Ele acha que o tempo é dele.', 'Derrote o Relojoeiro Louco Tik-Tak.'),
      bring(4, 'crystal_ore', 10, 'Para a areia não escapar, cristais no gargalo.', 'Traga 10 Cristais de Mana.'),
      talk(5, 'A ampulheta está pronta. Ela pode voltar um dia. Um só.', 'Encontre Sabah na Câmara da Esfinge.'),
      choice(5, 'Sabah pergunta: você quebra a ampulheta, como Azariel deveria ter feito, ou a guarda para um dia de muita necessidade?', 'Quebrar a ampulheta', 'Guardar para depois'),
    ],
    ending: ['A areia voa e vira estrelas. Sabah entende: Azariel não a usou porque Elowen pediu.', 'Você guarda a ampulheta. Ela pesa, mas não tanto quanto pesava para ele.'], reward: { gold: 42000, xp: 200000, item: 'eco_shard', qty: 6 } },
  { id: 'g_legiao', realm: 'gehenna', name: 'Grande Jornada · A Legião dos Arrependidos', npc: { name: 'Demônio Grishnak', title: 'Desertor do Rei', pal: P('#c06050', '#200808', '#602020', '#300c0c', '#ffb040') },
    steps: [
      talk(0, 'Eu sou um demônio. E estou cansado. Há outros como eu. Queremos deixar de ser o que Azrakel fez de nós.', 'Fale com Grishnak nos Portões de Cinza.'),
      kill(0, 80, 'Os carrascos caçam desertores. Proteja quem quer mudar.', 'Derrote 80 criaturas em Gehenna.'),
      bring(1, 'frost_herb', 12, 'Ervas gélidas acalmam o fogo que queima dentro de nós.', 'Traga 12 Ervas Gélidas.'),
      boss(1, 'Phlegyas devora quem tenta nadar para longe.', 'Derrote a Serpente de Lava Phlegyas.'),
      talk(2, 'Em Dis, cada demônio tem uma sentença. Precisamos queimar os registros.', 'Encontre Grishnak na Cidade de Dis.'),
      kill(2, 90, 'Os burocratas de Dis protegem as sentenças com unhas e carimbos.', 'Derrote 90 criaturas em Gehenna.'),
      bring(3, 'void_essence', 2, 'Essência do vazio apaga qualquer contrato. Até os do Inferno.', 'Traga 2 Essências do Vazio.'),
      bring(4, 'iron_ingot', 12, 'Vamos precisar de escudos para atravessar as muralhas.', 'Traga 12 Lingotes de Ferro.'),
      kill(5, 90, 'No pátio, os guardas de Lilith não sabem que somos amigos.', 'Derrote 90 criaturas em Gehenna.'),
      talk(6, 'Chegamos aos salões do trono. Daqui em diante, lutamos ao seu lado.', 'Encontre Grishnak nos Salões do Trono.'),
      choice(6, 'A legião pergunta: devem lutar como demônios, com fogo, ou largar as armas e lutar como gente, com escudos?', 'Lutem com fogo', 'Larguem o fogo'),
    ],
    ending: ['A legião queima um caminho até a Torre Negra. Fogo contra fogo, e o seu vence.', 'Os demônios largam as chamas. Sem elas, são só pessoas cansadas. E muito corajosas.'], reward: { gold: 60000, xp: 280000, item: 'void_essence', qty: 4 } },
  { id: 'g_cancao', realm: 'vazio', name: 'Grande Jornada · A Última Canção do Mundo', npc: { name: 'Lyria', title: 'Deusa Libertada', pal: P('#fff4e8', '#7fffe8', '#e8fff8', '#a0d0c8', '#ffe9a0') },
    steps: [
      talk(0, 'O Silêncio só pode ser vencido por uma canção que nunca foi cantada. Vamos escrevê-la juntos, com pedaços de todos os reinos.', 'Fale com Lyria nas Ruínas do Mundo que Não Foi.'),
      kill(0, 90, 'Cada criatura do Silêncio guarda uma nota roubada.', 'Derrote 90 criaturas no Céu Quebrado.'),
      bring(1, 'eco_shard', 4, 'Os Ecos do mundo formam o ritmo.', 'Traga 4 Fragmentos de Eco.'),
      bring(1, 'moonflower', 10, 'Flores da lua formam a melodia.', 'Traga 10 Flores da Lua.'),
      talk(2, 'Vael também deve cantar. A sombra dele está no eco cinzento de Potos.', 'Encontre Lyria no Eco de Vael.'),
      boss(2, 'A sombra precisa ser vencida antes de ser ouvida.', 'Derrote a Sombra de Vael.'),
      kill(3, 100, 'O coração de Ømnia bate contra nós. Silencie suas batidas.', 'Derrote 100 criaturas no Céu Quebrado.'),
      bring(3, 'void_essence', 3, 'Até o vazio deve fazer parte da canção. Sem pausa, não há música.', 'Traga 3 Essências do Vazio.'),
      talk(4, 'Está escrita. A Última Canção. Agora, só falta cantá-la diante dele.', 'Encontre Lyria no Trono do Primeiro Silêncio.'),
      choice(4, 'Lyria pergunta: a canção deve terminar, ou continuar para sempre, mesmo baixinho?', 'Que ela termine', 'Que nunca termine'),
    ],
    ending: ['A canção termina numa nota perfeita. E o silêncio depois dela é, finalmente, bonito.', 'A canção nunca termina. Em cada canto do mundo, alguém sempre está cantarolando.'], reward: { gold: 90000, xp: 420000, item: 'void_essence', qty: 6 } },
];

// As jornadas originais ficam mais longas: abates em dobro.
const scaled = new WeakSet<SideStory>();
for (const s of SIDE_STORIES) if (!scaled.has(s)) { scaled.add(s); for (const st of s.steps) if (st.kind === 'kill' && st.n) st.n *= 2; }
for (const s of GRAND_STORIES) if (!SIDE_STORIES.some((x) => x.id === s.id)) SIDE_STORIES.push(s);

export const realmIndex = (id: string) => SAGA_REALMS.findIndex((r) => r.id === id);
