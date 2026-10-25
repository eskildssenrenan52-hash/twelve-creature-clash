// A Saga dos Oito Céus — a grande campanha além dos Ecos.
// Dado puro e determinístico: oito reinos de saga, cada um com várias zonas únicas,
// um chefe por zona, capítulos de história e histórias paralelas em várias etapas.
import type { Biome, EnemyKind } from './data';
import { T } from './world';

export type SagaFx = 'embers' | 'ash' | 'bubbles' | 'spray' | 'leaves' | 'fireflies' | 'spores' | 'snow' | 'clouds' | 'sparkles' | 'ghosts' | 'sand' | 'rain' | 'petals' | 'void' | 'stars' | 'feathers' | 'gears';

export interface SagaBoss { name: string; kind: EnemyKind; tint: string; scale: number; intro: string; victory: string[] }
export interface SagaZone {
  name: string; lore: string; biome: Biome; floor: number; wall: number; deco: number; enemies: EnemyKind[];
  fx: SagaFx; fx2?: SagaFx | undefined; color: string; light: number; tint: [number, number, number, number]; boss: SagaBoss;
}
export interface SagaRealm {
  id: string; name: string; subtitle: string; level: number; color: string; portal: string;
  prologue: string[]; epilogue: string[]; zones: SagaZone[]; reward: { item: string; name: string; desc: string; slot: 'weapon' | 'armor' | 'ring' | 'amulet' };
}

const z = (name: string, lore: string, biome: Biome, tiles: [number, number, number], enemies: EnemyKind[], fx: SagaFx, color: string, light: number, tint: [number, number, number, number], boss: SagaBoss, fx2?: SagaFx): SagaZone =>
  ({ name, lore, biome, floor: tiles[0], wall: tiles[1], deco: tiles[2], enemies, fx, fx2, color, light, tint, boss });
const b = (name: string, kind: EnemyKind, tint: string, scale: number, intro: string, ...victory: string[]): SagaBoss => ({ name, kind, tint, scale, intro, victory });

export const SAGA_REALMS: SagaRealm[] = [
  /* ═════════════ I — A ILHA DA DEUSA ═════════════ */
  {
    id: 'aeloria', name: 'Ilha de Aeloria', subtitle: 'Arco I — A Deusa Acorrentada', level: 14, color: '#6fe0d0', portal: '#7fffe8',
    prologue: [
      'A Oráculo Seraphine fecha os olhos e o vento para de soprar sobre Potos.',
      '— Há uma ilha que não aparece em nenhum mapa. Aeloria. Foi lá que a Deusa Lyria, mãe da Árvore de Mana, foi acorrentada.',
      '— Quem a prendeu foi Azrakel, o Rei Demônio. Ele quer a voz dela para rasgar o véu entre o Inferno e o nosso mundo.',
      '— A ilha está viva. As praias engolem navios, a selva sussurra mentiras, o vulcão sonha com fogo.',
      '— Sete guardiões vigiam as sete correntes da Deusa. Quebre todas, e ela poderá abençoar a Lança da Aurora — a única arma que abre os Portões do Inferno.',
      'O portal turquesa se abre. Cheira a sal, enxofre e flores que nunca existiram.',
    ],
    epilogue: [
      'A última corrente se parte com um som de sino.',
      'Lyria abre os olhos. São da cor exata da primeira manhã do mundo.',
      'Lyria: — Cem anos olhando o mar. Cem anos ouvindo Azrakel prometer que ninguém viria.',
      'Lyria: — Você veio. Então ainda há Canção no mundo.',
      'Ela toca sua testa e um brilho dourado escorre pelos seus braços: a Bênção da Aurora.',
      'Lyria: — A Lança da Aurora está partida em seis reinos. Junte o que puder. E então desça. Ele vai estar esperando.',
    ],
    reward: { item: 'saga_aeloria', name: 'Lágrima de Lyria', desc: 'A primeira lágrima livre da Deusa em cem anos.', slot: 'amulet' },
    zones: [
      z('Praia dos Mil Naufrágios', 'Cascos de mil navios apodrecem na areia branca. Alguns ainda tocam o sino.', 'coast', [T.SAND, T.ROCK, T.PALM], ['crab', 'jelly', 'serpent'], 'spray', '#9ff0ff', 0.1, [80, 220, 230, 0.18],
        b('Capitão Afogado Morrow', 'skeleton', '#7ad0d0', 2.8, 'O capitão do primeiro navio ainda procura a tripulação. Ele acha que é você.', 'Morrow se desfaz em água salgada e deixa cair um sino.', 'Em algum lugar no mar, mil sinos respondem.'), 'sparkles'),
      z('Selva dos Sussurros', 'As árvores falam com a sua voz. Dizem coisas que você nunca disse.', 'jungle', [T.MOSS, T.TREE, T.BUSH], ['spider', 'frog', 'pixie', 'serpent'], 'fireflies', '#90ff90', 0.35, [40, 170, 80, 0.24],
        b('Mãe-Cipó Verdália', 'treant', '#4ac060', 3, 'Verdália enrola raízes em seus pés: — Fique. Aqui ninguém nunca precisa ir embora.', 'Os cipós afrouxam. A selva, pela primeira vez, fica em silêncio.', 'Um sussurro final: — Ela canta à noite. A Deusa. Ainda canta.'), 'leaves'),
      z('Pântano da Febre Verde', 'A névoa tem gosto de metal. Quem respira demais esquece o próprio nome.', 'swamp', [T.MOSS, T.CWALL, T.MUSHROOM], ['slime', 'frog', 'wisp', 'beetle'], 'spores', '#b0ff70', 0.45, [80, 140, 60, 0.28],
        b('Rainha-Sapo Bulbagrah', 'frog', '#80c040', 3.2, 'Uma rã do tamanho de uma casa abre um olho amarelo. A febre do pântano vem dela.', 'Bulbagrah afunda, borbulhando.', 'A névoa se desfaz e revela, ao longe, uma torre presa ao céu por correntes.'), 'fireflies'),
      z('Cânion dos Ventos Uivantes', 'O vento aqui tem dentes. As harpias fazem ninho em ossos de gigantes.', 'mountain', [T.ROCK, T.CWALL, T.PILLAR], ['crow', 'gargoyle', 'wolf'], 'feathers', '#d0e8ff', 0.15, [180, 210, 255, 0.2],
        b('Harpia-Matriarca Skyrra', 'crow', '#a0b0ff', 3, 'Skyrra mergulha das alturas gritando: — A Deusa é nossa! Ela canta para os nossos filhotes!', 'Skyrra cai e, ferida, sussurra: — Ele nos prometeu a voz dela... mentiu.', 'As harpias recuam. Elas também eram prisioneiras.'), 'clouds'),
      z('Vulcão Adormecido de Kharos', 'A montanha ronca. Cada ronco é um terremoto. Cada terremoto, uma lembrança de fogo.', 'volcanic', [T.ASH, T.ROCK, T.LAVA], ['salamander', 'imp', 'golem'], 'embers', '#ff8040', 0.5, [255, 90, 40, 0.28],
        b('Dragão do Sono Ignivar', 'salamander', '#ff5020', 3.6, 'Ignivar abre um olho do tamanho de um lago: — Quem me acorda paga com cinzas.', 'Ignivar volta a dormir — desta vez, sem pesadelos.', 'No coração do vulcão brilha uma corrente de fogo. Ela se rompe.'), 'ash'),
      z('Ruínas Afogadas de Merith', 'Uma cidade inteira sob a maré. Os sinos dos templos ainda tocam debaixo d\'água.', 'coral', [T.RUINS, T.WALL, T.WATER], ['jelly', 'serpent', 'crab', 'wraith'], 'bubbles', '#70d8ff', 0.55, [40, 140, 220, 0.3],
        b('Sacerdotisa Abissal Nereth', 'serpent', '#3090c0', 3.2, 'Nereth ergue um tridente de coral: — Fui a última sacerdotisa de Lyria. Fui a primeira a traí-la.', 'Nereth chora água do mar: — Diga a ela... que eu sinto muito.', 'A sexta corrente se rompe nas profundezas.'), 'sparkles'),
      z('Prisão Celeste de Lyria', 'Uma torre presa ao céu por sete correntes. No topo, uma luz que canta baixinho.', 'aurora', [T.FLOOR, T.WALL, T.CRYSTAL], ['wraith', 'gargoyle', 'sprite', 'shade'], 'stars', '#ffe9a0', 0.2, [255, 230, 170, 0.2],
        b('Carcereiro Thalgor, Mão de Azrakel', 'golem', '#c08060', 3.6, 'Thalgor arrasta mil chaves: — O Rei Demônio me fez de ferro para que eu nunca sentisse pena. Funcionou.', 'Thalgor ajoelha. Dentro da armadura, só uma chama pequena e cansada.', 'Thalgor: — Obrigado... era pesado ser só correntes.'), 'feathers'),
    ],
  },
  /* ═════════════ II — O BOSQUE FEÉRICO ═════════════ */
  {
    id: 'ylvenna', name: 'Bosque Feérico de Ylvenna', subtitle: 'Arco II — A Corte das Mil Máscaras', level: 24, color: '#e080ff', portal: '#f0a0ff',
    prologue: [
      'Lyria aponta para um anel de cogumelos que brilha no chão de Potos.',
      '— O primeiro fragmento da Lança está com a Corte Feérica. As fadas não mentem. Mas também nunca dizem a verdade inteira.',
      '— A Rainha Titânia desapareceu. Duas cortes, a do Verão e a do Inverno, disputam o trono vazio.',
      '— Cuidado com promessas. Lá, uma promessa é uma corrente que não se vê.',
    ],
    epilogue: [
      'A máscara do Rei Sem Rosto cai, e por trás dela está... Titânia.',
      'Titânia: — Eu me escondi atrás da guerra para que Azrakel não me achasse. Ele queria minha coroa para enfeitiçar os reis dos homens.',
      'Titânia: — Leve o Fragmento do Verão. E lembre: o Rei Demônio também já foi alguém que amou.',
    ],
    reward: { item: 'saga_ylvenna', name: 'Fragmento do Verão Eterno', desc: 'Primeiro pedaço da Lança da Aurora. Cheira a mel.', slot: 'ring' },
    zones: [
      z('Anel dos Cogumelos Dançantes', 'Quem entra no anel dança por um ano. Ou por um segundo. Lá, dá no mesmo.', 'mushroom', [T.MOSS, T.CWALL, T.MUSHROOM], ['pixie', 'sporeling', 'mushroom'], 'sparkles', '#ffb0ff', 0.4, [220, 120, 255, 0.24],
        b('Arlequim das Mil Danças', 'pixie', '#ff80d0', 2.6, 'O Arlequim faz uma reverência: — Uma dança? Se perder, fica para sempre.', 'O Arlequim ri e some num redemoinho de confete.', '— Você dança mal, mortal. Gostei.'), 'spores'),
      z('Jardins da Corte do Verão', 'Flores do tamanho de casas. O sol nunca se põe. O calor tem cheiro de rosas.', 'sunflower', [T.MEADOW, T.BUSH, T.FLOWER], ['sprite', 'beetle', 'pixie'], 'petals', '#ffe070', 0.05, [255, 210, 120, 0.2],
        b('Duque Solar Oberyn', 'sprite', '#ffd040', 3, 'Oberyn: — A Rainha morreu! O trono é do Verão! Ajoelhe-se ou queime.', 'Oberyn cai de joelhos: — Eu só queria que alguém sentasse naquele trono...', 'Uma pétala dourada cai: tem escrito "ela vive".'), 'sparkles'),
      z('Salões Gelados da Corte do Inverno', 'Lustres de gelo que tocam música quando o vento passa. O frio aqui é educado.', 'aurora', [T.ICE, T.ROCK, T.CRYSTAL], ['wisp', 'wolf', 'wraith'], 'snow', '#c0f0ff', 0.3, [170, 220, 255, 0.24],
        b('Condessa Glacial Mabh', 'wraith', '#a0e8ff', 3, 'Mabh: — O Verão mente. O Inverno apenas cala. Fique calado também.', 'Mabh derrete numa lágrima perfeita.', 'Dentro dela, um bilhete: "As duas cortes lutam porque ele as fez lutar."'), 'sparkles'),
      z('Lago dos Espelhos Falsos', 'Cada reflexo mostra uma vida que você poderia ter tido. Alguns são mais felizes.', 'lotus', [T.MOSS, T.CWALL, T.WATER], ['frog', 'jelly', 'mimic', 'sprite'], 'fireflies', '#a0ffe0', 0.45, [120, 230, 210, 0.24],
        b('Seu Reflexo Invertido', 'shade', '#8080ff', 2.6, 'Do lago sai alguém com o seu rosto: — Eu sou você, se você tivesse ficado em casa.', 'O reflexo sorri, triste, e volta para a água.', '— Vá. Uma de nós precisa ser corajosa.'), 'stars'),
      z('Labirinto de Espinhos Cantores', 'Os espinhos tocam notas quando cortam. Algumas formam canções antigas.', 'crimson', [T.AUTUMN, T.CWALL, T.BUSH], ['spider', 'treant', 'imp'], 'leaves', '#ff7060', 0.4, [220, 80, 70, 0.26],
        b('Jardineiro de Espinhos Thornwick', 'treant', '#a03040', 3.2, 'Thornwick: — Eu podo os que se perdem. É uma gentileza.', 'Thornwick se transforma numa roseira simples.', 'As rosas apontam para o centro: para o trono.'), 'petals'),
      z('Trono da Rainha Vazia', 'Uma clareira de luz. Um trono de galhos vivos. Alguém de máscara está sentado nele.', 'sakura', [T.FLOWER, T.WALL, T.PILLAR], ['pixie', 'sprite', 'wraith', 'gargoyle'], 'petals', '#ffc0e0', 0.25, [255, 190, 220, 0.24],
        b('O Rei Sem Rosto', 'shade', '#ffffff', 3.4, 'O Rei Sem Rosto não fala. Mil máscaras giram ao redor dele.', 'As máscaras caem uma por uma.', 'A última revela um rosto conhecido.'), 'sparkles'),
    ],
  },
  /* ═════════════ III — O REINO SUBMERSO ═════════════ */
  {
    id: 'thalassa', name: 'Reino Submerso de Thalassa', subtitle: 'Arco III — A Coroa sob as Ondas', level: 34, color: '#40a0ff', portal: '#60c0ff',
    prologue: [
      'Lyria toca a superfície de um poço em Potos e a água vira uma janela para o fundo do mar.',
      '— Thalassa já foi o maior reino do mundo. Afundou numa noite, por vontade própria, para fugir de Azrakel.',
      '— O Rei-Tritão Okeanos guarda o segundo fragmento. Mas a cidade está em guerra civil: os que querem voltar à superfície contra os que querem afundar mais.',
      'Lyria coloca uma bolha de ar em suas mãos. — Ela dura enquanto você tiver esperança.',
    ],
    epilogue: [
      'Okeanos tira a coroa e a entrega a uma criança tritão.',
      'Okeanos: — Afundamos por medo. Vamos subir por coragem. Um dia.',
      'Okeanos: — O fragmento da Maré é seu. Azrakel tem medo do mar: o mar lembra de tudo, até do que ele foi.',
    ],
    reward: { item: 'saga_thalassa', name: 'Fragmento da Maré Funda', desc: 'Segundo pedaço da Lança da Aurora. Nunca seca.', slot: 'armor' },
    zones: [
      z('Recife dos Corais Cantores', 'Cada coral canta uma nota. Juntos, cantam a história de Thalassa.', 'coral', [T.SAND, T.ROCK, T.WATER], ['crab', 'jelly', 'serpent'], 'bubbles', '#ff9fb0', 0.35, [240, 130, 160, 0.24],
        b('Caranguejo-Fortaleza Krabbos', 'crab', '#ff6050', 3.4, 'Uma montanha de coral se levanta. Era um caranguejo o tempo todo.', 'Krabbos recolhe as pinças e volta a ser montanha.', 'Atrás dele, os portões de Thalassa brilham.'), 'sparkles'),
      z('Floresta de Algas Gigantes', 'Algas mais altas que torres balançam como se dançassem para ninguém.', 'mangrove', [T.MOSS, T.TREE, T.BUSH], ['serpent', 'jelly', 'frog'], 'bubbles', '#70ffa0', 0.5, [60, 200, 140, 0.28],
        b('Enguia-Elétrica Voltaris', 'serpent', '#e0ff60', 3.2, 'Raios azuis iluminam as algas. Voltaris dá voltas ao seu redor.', 'Voltaris se apaga devagar.', 'A floresta volta à escuridão calma.'), 'fireflies'),
      z('Cidade Afundada de Thalassa', 'Ruas de mármore, praças com peixes no lugar de pombos. Ninguém sai de casa.', 'ruins', [T.RUINS, T.WALL, T.PILLAR], ['crab', 'wraith', 'gargoyle', 'mimic'], 'bubbles', '#9fe0ff', 0.4, [120, 200, 255, 0.24],
        b('General Rebelde Scylla', 'serpent', '#40c0a0', 3.3, 'Scylla: — O Rei quer nos manter no escuro para sempre! Saia do caminho!', 'Scylla baixa o tridente: — Talvez... possamos conversar.', 'Pela primeira vez em um século, os dois lados se sentam à mesma mesa.'), 'sparkles'),
      z('Fossa da Luz Morta', 'Tão fundo que a luz do sol nunca chegou. Os peixes aqui fazem a própria luz.', 'obsidian', [T.CAVE, T.CWALL, T.CRYSTAL], ['jelly', 'wisp', 'shade'], 'fireflies', '#80a0ff', 0.85, [40, 60, 160, 0.3],
        b('Pescador Abissal Lumen', 'jelly', '#80ffff', 3.4, 'Uma luzinha bonita balança no escuro. Atrás dela, dentes.', 'A isca de Lumen se apaga.', 'Na boca dele, presa por cem anos, a chave do palácio.'), 'stars'),
      z('Palácio de Pérola de Okeanos', 'Paredes de madrepérola refletem mil luas que não existem.', 'lotus', [T.FLOOR, T.WALL, T.WATER], ['serpent', 'gargoyle', 'wraith', 'crab'], 'sparkles', '#e0f0ff', 0.25, [210, 230, 255, 0.2],
        b('Kraken Real Leviath', 'serpent', '#6040a0', 3.8, 'O palácio treme. O guardião do Rei, Leviath, foi corrompido por Azrakel.', 'Os tentáculos de Leviath relaxam.', 'Uma marca de chifre queimada na pele dele mostra quem o enlouqueceu.'), 'bubbles'),
    ],
  },
  /* ═════════════ IV — A CIDADELA NAS NUVENS ═════════════ */
  {
    id: 'aerith', name: 'Cidadela nas Nuvens de Aerith', subtitle: 'Arco IV — Os Anjos Sem Asas', level: 44, color: '#fff0c0', portal: '#ffffff',
    prologue: [
      'Uma escada de luz desce do céu bem no meio de Potos.',
      'Lyria: — Aerith é a cidade dos anjos. Ou era. Azrakel cortou as asas de todos eles numa só noite.',
      'Lyria: — Sem asas, eles não podem descer. Sem esperança, eles não querem.',
      'Lyria: — O terceiro fragmento está na Torre do Sol. Para chegar lá, você vai ter que andar sobre nuvens que esqueceram que são chão.',
    ],
    epilogue: [
      'O Serafim Caído Uriel ergue os olhos para o sol pela primeira vez em séculos.',
      'Uriel: — Fui eu que abri as portas para Azrakel. Ele era meu irmão. Antes de ser rei. Antes de ser demônio.',
      'Uriel: — O nome dele era Azariel. E ele chorava quando via o mundo de cima, porque era bonito demais para durar.',
      'Uriel: — Leve o Fragmento do Sol. E se puder... salve-o, não só derrote-o.',
    ],
    reward: { item: 'saga_aerith', name: 'Fragmento do Sol Alto', desc: 'Terceiro pedaço da Lança da Aurora. Aquece sem queimar.', slot: 'ring' },
    zones: [
      z('Escadaria das Nuvens Partidas', 'Degraus de nuvem que somem se você hesitar. Lá embaixo, o mundo inteiro.', 'aurora', [T.SNOW, T.ROCK, T.PILLAR], ['crow', 'gargoyle', 'sprite'], 'clouds', '#ffffff', 0.05, [230, 240, 255, 0.2],
        b('Grifo-Sentinela Aquilon', 'crow', '#ffd080', 3.2, 'Aquilon abre asas douradas: — Ninguém sobe sem asas!', 'Aquilon pousa e abaixa a cabeça.', 'Ele deixa você subir nas costas dele até o próximo nível.'), 'feathers'),
      z('Jardins Suspensos de Aerith', 'Árvores com raízes no vazio. Frutas que tocam música quando caem.', 'meadow', [T.MEADOW, T.TREE, T.FLOWER], ['pixie', 'sprite', 'beetle'], 'petals', '#ffe0f0', 0.05, [255, 230, 230, 0.18],
        b('Jardineiro Mecânico Hortus', 'golem', '#a0e080', 3, 'Hortus continua podando um jardim que ninguém visita há trezentos anos.', 'Hortus para. — Pode... regar as rosas por mim?', 'As rosas abrem. Elas lembravam de você.'), 'clouds'),
      z('Biblioteca dos Ventos', 'Livros que voam como pássaros. Alguns bicam quem tenta lê-los.', 'marble', [T.FLOOR, T.WALL, T.PILLAR], ['crow', 'mimic', 'wraith', 'sprite'], 'feathers', '#fff0c8', 0.15, [255, 240, 200, 0.2],
        b('Grimório Voador Codexa', 'mimic', '#e0c080', 3, 'Codexa abre as páginas e mil palavras viram facas.', 'Codexa se fecha, manso.', 'Na última página: a história de dois irmãos anjos.'), 'sparkles'),
      z('Forjas de Relâmpago', 'Os anjos forjavam o trovão aqui. As bigornas ainda soltam faíscas.', 'thunder', [T.COBBLE, T.ROCK, T.PILLAR], ['golem', 'gargoyle', 'imp'], 'rain', '#a0c0ff', 0.4, [140, 170, 255, 0.26],
        b('Titã de Bronze Talos', 'golem', '#e0a040', 3.6, 'Talos: — FORJAR. PROTEGER. FORJAR.', 'Talos cai com o barulho de mil sinos.', 'Do peito dele sai uma pena dourada: a última pena de anjo.'), 'gears'),
      z('Catedral das Asas Cortadas', 'Milhares de asas penduradas nas paredes como bandeiras de luto.', 'ruins', [T.FLOOR, T.WALL, T.CRYSTAL], ['wraith', 'gargoyle', 'shade'], 'feathers', '#ffe0a0', 0.35, [255, 220, 160, 0.24],
        b('Inquisidor Sem Asas Malachar', 'wraith', '#c0a060', 3.3, 'Malachar: — Asas são orgulho. Eu ajudei a cortá-las. Vou cortar as suas também.', 'Malachar chora: — Eu só queria que todos fossem iguais a mim...', 'As asas na parede tremem, como se lembrassem de voar.'), 'stars'),
      z('Torre do Sol', 'O ponto mais alto do mundo. O sol está tão perto que dá para ouvir ele cantar.', 'sunflower', [T.FLOOR, T.WALL, T.PILLAR], ['sprite', 'gargoyle', 'crow', 'wraith'], 'sparkles', '#fff8b0', 0.0, [255, 240, 170, 0.24],
        b('Serafim Caído Uriel', 'sprite', '#fff0a0', 3.6, 'Uriel ergue uma espada de luz: — Se você está aqui, é porque quer matar meu irmão. Não vou deixar.', 'Uriel abaixa a espada.', '— Você não quer matá-lo. Você quer libertá-lo. Então... vá.'), 'clouds'),
    ],
  },
  /* ═════════════ V — A NECRÓPOLE ═════════════ */
  {
    id: 'mortaveu', name: 'Necrópole de Mortavéu', subtitle: 'Arco V — Onde os Mortos Esperam', level: 54, color: '#a0ffb0', portal: '#80ffa0',
    prologue: [
      'A Oráculo Seraphine empalidece: — O quarto fragmento está com a Senhora dos Mortos.',
      '— Mortavéu é onde as almas esperam antes de partir. Mas Azrakel fechou a saída. Ninguém parte há cem anos.',
      '— Os mortos estão cansados. Alguns ficaram com raiva. Outros esqueceram que morreram.',
      '— Você vai encontrar gente que conhece lá dentro. Não deixe que eles te convençam a ficar.',
    ],
    epilogue: [
      'Hela, a Senhora dos Mortos, abre a porta final. Uma luz suave entra.',
      'Milhares de almas atravessam, uma a uma, sorrindo. Algumas acenam para você.',
      'Hela: — Azrakel trancou esta porta porque tem medo de passar por ela. Ele sabe quem está esperando do outro lado.',
      'Hela: — Leve o Fragmento do Crepúsculo. E quando chegar ao trono dele, diga: "Ela te perdoou."',
    ],
    reward: { item: 'saga_mortaveu', name: 'Fragmento do Crepúsculo', desc: 'Quarto pedaço da Lança da Aurora. Frio como uma despedida.', slot: 'amulet' },
    zones: [
      z('Campo das Lápides Sem Nome', 'Milhares de túmulos. Nenhum nome. Quem foram ninguém lembra.', 'ruins', [T.ASH, T.ROCK, T.PILLAR], ['skeleton', 'crow', 'rat'], 'ghosts', '#c0ffc0', 0.6, [140, 200, 150, 0.28],
        b('Coveiro Eterno Grimsby', 'skeleton', '#a0a080', 3, 'Grimsby apoia-se na pá: — Mais um para enterrar? Ah, você ainda está vivo. Por enquanto.', 'Grimsby deita no próprio túmulo, satisfeito.', '— Finalmente posso descansar. Obrigado.'), 'ash'),
      z('Rio das Almas Esquecidas', 'Um rio de luz verde. Cada gota é uma lembrança que alguém perdeu.', 'swamp', [T.MOSS, T.CWALL, T.WATER], ['wisp', 'wraith', 'frog'], 'ghosts', '#80ffd0', 0.6, [80, 220, 180, 0.3],
        b('Barqueiro Kharon', 'wraith', '#40a080', 3.3, 'Kharon estende a mão: — Uma moeda para atravessar. Ou uma lembrança.', 'Kharon guarda a foice e oferece o barco.', '— Você é o primeiro em cem anos que eu levo para o lado de lá e de volta.'), 'fireflies'),
      z('Catacumbas dos Reis Antigos', 'Reis que nunca aceitaram a morte ainda governam reinos de ossos.', 'cave', [T.CAVE, T.CWALL, T.PILLAR], ['skeleton', 'mummy', 'bat', 'spider'], 'ghosts', '#e0d090', 0.85, [200, 180, 120, 0.3],
        b('Rei-Esqueleto Ossarius', 'skeleton', '#f0e0a0', 3.5, 'Ossarius: — Eu fui o maior rei da Terra! Ajoelhe-se diante da minha coroa!', 'A coroa de Ossarius rola pelo chão.', '— Era só... um chapéu. Por que eu me importei tanto?'), 'ash'),
      z('Vila dos Que Esqueceram', 'Uma vila perfeita. As pessoas tomam chá, conversam, riem. Ninguém tem sombra.', 'meadow', [T.COBBLE, T.WALL, T.BUSH], ['wraith', 'mimic', 'shade'], 'ghosts', '#d0d0ff', 0.4, [190, 190, 240, 0.24],
        b('Prefeita Lúgubre Mirela', 'wraith', '#c0c0ff', 3, 'Mirela sorri: — Fique para o jantar. Fique para sempre. Aqui ninguém sente dor.', 'Mirela se olha num espelho e finalmente vê que não tem reflexo.', '— Ah. Então é isso. Já está na hora.'), 'stars'),
      z('Jardim das Flores de Ossos', 'Flores brancas que crescem de costelas. Elas florescem com lágrimas.', 'lavender', [T.FLOWER, T.CWALL, T.MUSHROOM], ['sporeling', 'wisp', 'skeleton'], 'petals', '#f0f0ff', 0.5, [220, 210, 255, 0.24],
        b('Jardineira Morta Belladona', 'treant', '#f0e0ff', 3.2, 'Belladona: — Cada flor é um nome que ninguém chora mais.', 'Belladona colhe a última flor e a entrega a você.', 'É uma flor da sua vila. Alguém lembrava de você.'), 'ghosts'),
      z('Salão da Última Porta', 'Uma porta gigante, trancada com correntes negras. Do outro lado, luz.', 'obsidian', [T.FLOOR, T.WALL, T.PILLAR], ['wraith', 'skeleton', 'shade', 'gargoyle'], 'void', '#a0ffa0', 0.55, [120, 200, 140, 0.3],
        b('Cão de Três Cabeças Kerberos', 'wolf', '#402040', 3.8, 'Kerberos rosna com três bocas. Ele foi acorrentado aqui por Azrakel, contra a vontade de Hela.', 'As correntes de Kerberos caem. Ele abana três rabos.', 'Hela aparece atrás da porta: — Bom garoto. Bom humano.'), 'ghosts'),
    ],
  },
  /* ═════════════ VI — O DESERTO DO TEMPO ═════════════ */
  {
    id: 'khronn', name: 'Deserto do Tempo Partido', subtitle: 'Arco VI — As Areias que Voltam', level: 64, color: '#ffc060', portal: '#ffd080',
    prologue: [
      'Uma ampulheta gigante aparece no céu de Potos. A areia cai para cima.',
      'Seraphine: — Khronn é o deserto onde o tempo quebrou. Ontem fica ao lado de amanhã. Você pode encontrar a si mesmo, velho.',
      'Seraphine: — O quinto fragmento está na Esfinge do Agora. Mas para chegar até ela você vai atravessar o passado do Rei Demônio.',
      'Seraphine: — Vai ver o que ele foi. E talvez entenda por que ele virou o que é.',
    ],
    epilogue: [
      'A Esfinge mostra a última cena: um anjo, Azariel, tentando salvar uma vila de uma praga.',
      'Ele falha. Todos morrem. Inclusive a mulher que ele amava: Elowen.',
      'Azariel desce ao Inferno para trazê-la de volta. Lá dentro, o fogo o transforma em Azrakel.',
      'Esfinge: — Ele não odeia o mundo. Ele odeia ter falhado com ele. Leve o Fragmento do Agora.',
    ],
    reward: { item: 'saga_khronn', name: 'Fragmento do Agora', desc: 'Quinto pedaço da Lança da Aurora. Bate como um coração.', slot: 'ring' },
    zones: [
      z('Dunas das Ampulhetas Quebradas', 'Ampulhetas do tamanho de torres, todas quebradas. A areia escorre em todas as direções.', 'desert', [T.SAND, T.ROCK, T.CACTUS], ['scorpion', 'mummy', 'beetle'], 'sand', '#ffd080', 0.05, [255, 200, 120, 0.24],
        b('Escaravelho do Tempo Scarabos', 'beetle', '#e0a020', 3.3, 'Scarabos rola uma bola de horas roubadas.', 'A bola se quebra e mil horas perdidas voltam para seus donos.', 'Em algum lugar, alguém termina uma conversa interrompida há cem anos.'), 'gears'),
      z('Oásis do Ontem', 'A água mostra o passado. A vila de Azariel, viva, antes da praga.', 'oasis', [T.SAND, T.ROCK, T.PALM], ['frog', 'serpent', 'pixie'], 'sparkles', '#a0ffe0', 0.15, [180, 240, 210, 0.2],
        b('Guardião da Memória Mnemos', 'golem', '#80e0c0', 3.2, 'Mnemos: — Você quer ver o passado dele? O passado não gosta de ser visto.', 'Mnemos se abre como uma porta.', 'Lá dentro: Azariel rindo com Elowen sob uma tamareira.'), 'fireflies'),
      z('Cidade da Praga Eterna', 'A vila de Azariel, presa no dia da praga. A cena se repete para sempre.', 'ruins', [T.RUINS, T.WALL, T.PILLAR], ['rat', 'mummy', 'wraith', 'skeleton'], 'ash', '#c0a060', 0.5, [200, 170, 100, 0.3],
        b('A Praga Vermelha', 'slime', '#c03030', 3.6, 'A doença que matou a vila tem forma. Ela pulsa, vermelha e faminta.', 'A Praga se desfaz em pó.', 'A cena para de se repetir. A vila, enfim, pode descansar.'), 'ghosts'),
      z('Labirinto das Engrenagens', 'Engrenagens do tamanho de montanhas. Se elas pararem, o tempo para.', 'amber', [T.COBBLE, T.ROCK, T.PILLAR], ['golem', 'beetle', 'mimic'], 'gears', '#ffb040', 0.3, [255, 180, 80, 0.26],
        b('Relojoeiro Louco Tik-Tak', 'golem', '#c0c0c0', 3.3, 'Tik-Tak: — Atrasado! Adiantado! Você está fora do horário!', 'Tik-Tak para. Pela primeira vez, silêncio.', 'As engrenagens voltam a girar no ritmo certo.'), 'sand'),
      z('Areias do Amanhã', 'O futuro: Potos em ruínas, o céu vermelho. É o que acontece se você falhar.', 'volcanic', [T.ASH, T.ROCK, T.LAVA], ['imp', 'salamander', 'shade'], 'embers', '#ff6040', 0.45, [255, 100, 60, 0.3],
        b('Você, Daqui a Cem Anos', 'shade', '#ffa060', 3, 'Uma versão velha e amarga de você: — Eu falhei. Você vai falhar. Desista agora.', 'Seu eu futuro sorri: — Talvez você seja melhor que eu.', 'O futuro vermelho treme, e fica menos certo.'), 'ash'),
      z('Câmara da Esfinge do Agora', 'Uma esfinge de ouro guarda o único momento que importa: este.', 'marble', [T.SAND, T.WALL, T.PILLAR], ['mummy', 'scorpion', 'gargoyle', 'sprite'], 'sand', '#fff0a0', 0.25, [255, 230, 150, 0.24],
        b('Esfinge do Agora', 'gargoyle', '#ffd040', 3.8, 'A Esfinge: — Responda com a espada. É a única pergunta que sobrou.', 'A Esfinge ri, satisfeita.', '— Boa resposta. Agora, assista ao que ele foi.'), 'sparkles'),
    ],
  },
  /* ═════════════ VII — O INFERNO E O CASTELO DO REI DEMÔNIO ═════════════ */
  {
    id: 'gehenna', name: 'Inferno de Gehenna', subtitle: 'Arco VII — O Castelo do Rei Demônio', level: 74, color: '#ff4020', portal: '#ff3010',
    prologue: [
      'Lyria junta os cinco fragmentos. Eles derretem um no outro e formam a Lança da Aurora.',
      'Lyria: — Agora sim. Os Portões do Inferno vão abrir para você. E nunca mais vão fechar, se você perder.',
      'Lyria: — Gehenna tem oito círculos. No último, o castelo de Azrakel, maior que qualquer cidade do mundo.',
      'Lyria: — As muralhas são feitas dos gritos de quem tentou entrar. O trono fica no alto da Torre Negra.',
      'Lyria: — Não vá com ódio. Ódio é a língua dele. Lá dentro, ele vai entender cada palavra.',
      'O portal vermelho se abre com um rugido. O calor queima suas sobrancelhas.',
    ],
    epilogue: [
      'Azrakel cai de joelhos. A coroa de chifres racha.',
      'Por trás das chamas, um anjo cansado: Azariel.',
      'Você repete as palavras de Hela: — Ela te perdoou.',
      'Azariel chora. As lágrimas apagam o fogo do castelo inteiro.',
      'Azariel: — Cem anos tentando trazê-la de volta. E ela só queria que eu deixasse ir.',
      'Mas no fundo do trono, uma risada que não é de Azariel. Uma voz sem som: — Obrigado por libertá-lo. Agora ele não me serve mais.',
      'O Primeiro Silêncio, aquele que sussurrou em Azariel por cem anos, abre os olhos.',
    ],
    reward: { item: 'saga_gehenna', name: 'Coroa Partida de Azrakel', desc: 'A coroa do Rei Demônio. Ainda quente. Ainda pesada.', slot: 'armor' },
    zones: [
      z('Portões de Cinza', 'Portões de ferro negro do tamanho de montanhas. A cinza cai como neve.', 'obsidian', [T.ASH, T.ROCK, T.PILLAR], ['imp', 'salamander', 'skeleton'], 'ash', '#ff8060', 0.45, [255, 80, 40, 0.3],
        b('Porteiro Demoníaco Baalgor', 'imp', '#ff4020', 3.6, 'Baalgor: — Ninguém entra vivo! Ninguém sai! É a regra!', 'Baalgor cai e os portões rangem, abertos.', 'Do outro lado, um rio de fogo.'), 'embers'),
      z('Rio de Fogo Flegetonte', 'Um rio de lava que corre para cima. Almas nadam nele, tentando lembrar quem eram.', 'volcanic', [T.ASH, T.ROCK, T.LAVA], ['salamander', 'imp', 'serpent'], 'embers', '#ff6020', 0.5, [255, 90, 30, 0.32],
        b('Serpente de Lava Phlegyas', 'serpent', '#ff8020', 3.8, 'Phlegyas emerge do rio: — Atravessar meu rio custa uma alma. A sua serve.', 'Phlegyas afunda no próprio fogo.', 'O rio desacelera. As almas, aos poucos, saem nadando.'), 'ash'),
      z('Cidade de Dis', 'Uma cidade de torres de ferro onde demônios burocratas carimbam sentenças eternas.', 'ruins', [T.COBBLE, T.WALL, T.PILLAR], ['imp', 'gargoyle', 'mimic', 'skeleton'], 'ash', '#ff9060', 0.45, [220, 90, 60, 0.28],
        b('Juiz Infernal Minos', 'gargoyle', '#a02020', 3.5, 'Minos enrola a cauda: — Culpado. De quê? Não importa. Culpado.', 'O martelo de Minos se quebra.', 'Mil sentenças eternas se apagam de uma vez.'), 'embers'),
      z('Campos de Ossos de Gehenna', 'Ossos de exércitos inteiros que tentaram invadir o castelo antes de você.', 'obsidian', [T.ASH, T.CWALL, T.PILLAR], ['skeleton', 'wraith', 'bat', 'wolf'], 'ash', '#e0c0a0', 0.55, [200, 120, 80, 0.3],
        b('Senhor da Guerra Morto Gorrath', 'skeleton', '#d04030', 3.8, 'Gorrath levanta um exército de ossos: — Eu também vim salvar alguém. Fiquei aqui para sempre.', 'Gorrath crava a espada no chão e descansa.', '— O castelo fica logo ali. Faça o que eu não consegui.'), 'void'),
      z('Muralhas do Castelo de Azrakel', 'Muralhas feitas de gritos solidificados. Quem encosta ouve todos de uma vez.', 'obsidian', [T.COBBLE, T.WALL, T.LAVA], ['gargoyle', 'imp', 'golem', 'salamander'], 'embers', '#ff5030', 0.5, [255, 60, 40, 0.32],
        b('Gárgula Colossal Vorthax', 'gargoyle', '#604040', 4, 'A torre de vigia ganha vida. Vorthax era a muralha o tempo todo.', 'Vorthax desaba e abre uma brecha nas muralhas.', 'Dentro, o pátio do castelo. E o cheiro de rosas queimadas.'), 'ash'),
      z('Pátio Infernal', 'Um jardim de rosas negras que queimam sem nunca virar cinza. Azariel plantou para Elowen.', 'crimson', [T.ASH, T.WALL, T.BUSH], ['imp', 'spider', 'treant', 'wraith'], 'petals', '#ff4060', 0.5, [220, 40, 70, 0.3],
        b('Lilith, Rainha das Rosas Negras', 'wraith', '#c02060', 3.6, 'Lilith: — Ele plantou estas rosas para uma morta. Eu cuido delas para ele. Ninguém mais vai cuidar.', 'Lilith deixa cair uma rosa negra.', '— Diga a ele que as rosas estão bem. Por favor.'), 'embers'),
      z('Salões do Trono Infinito', 'Corredores que nunca terminam, decorados com quadros de Elowen. Mil quadros. Mil sorrisos.', 'marble', [T.FLOOR, T.WALL, T.PILLAR], ['gargoyle', 'mimic', 'shade', 'imp'], 'void', '#ff7050', 0.6, [200, 60, 60, 0.3],
        b('Guarda-Real Asmodeus', 'golem', '#401020', 3.8, 'Asmodeus: — Eu sou a última porta. Atrás de mim, apenas ele. E a dor dele.', 'Asmodeus abre caminho em silêncio.', 'Ele também queria que alguém chegasse.'), 'embers'),
      z('Torre Negra do Rei Demônio', 'O topo do castelo. Um trono de chifres. Uma figura imensa, de costas, olhando um retrato.', 'obsidian', [T.FLOOR, T.WALL, T.LAVA], ['imp', 'gargoyle', 'wraith', 'salamander'], 'embers', '#ff2010', 0.5, [255, 30, 20, 0.34],
        b('Azrakel, o Rei Demônio', 'imp', '#ff1010', 4.4, 'Azrakel se vira. Asas de fogo, coroa de chifres, olhos de anjo. — Você veio tirar o que me resta? Então tire.', 'Azrakel cai. O fogo dele vira luz.', 'O Rei Demônio está derrotado. O anjo Azariel, livre.'), 'ash'),
    ],
  },
  /* ═════════════ VIII — O PRIMEIRO SILÊNCIO ═════════════ */
  {
    id: 'vazio', name: 'O Céu Quebrado', subtitle: 'Arco VIII — O Primeiro Silêncio', level: 86, color: '#c0a0ff', portal: '#b080ff',
    prologue: [
      'O céu de Potos racha como vidro. Do outro lado, nada. Um nada que olha de volta.',
      'Azariel, sem chifres e sem asas, ajoelha diante de você: — Foi ele quem sussurrou para mim. Por cem anos. Eu achava que era a minha própria voz.',
      'Lyria: — O Primeiro Silêncio existia antes da Canção. Ele quer que o mundo volte a ser nada. Quieto. Sem dor. Sem nada.',
      'Lyria: — Vael ouviu a voz dele. Ømnia é o eco dele. Azrakel era a mão dele. Agora ele vai vir pessoalmente.',
      'Todos os que você salvou estão aqui: Titânia, Okeanos, Uriel, Hela, a Esfinge, Azariel. — Vamos com você.',
    ],
    epilogue: [
      'O Primeiro Silêncio se desfaz, não em barulho, mas em música.',
      'Uma nota. Depois outra. O nada vira canção.',
      'Lyria: — Ele não queria destruir. Ele só nunca tinha ouvido nada bonito. Você foi a primeira coisa bonita que ele ouviu.',
      'O céu se fecha, inteiro, mais azul que antes.',
      'Em Potos, a Árvore de Mana floresce de uma vez. Pétalas douradas caem sobre todos os reinos.',
      'Azariel planta uma rosa branca ao lado da árvore. — Para Elowen. E para você.',
      'FIM DA SAGA DOS OITO CÉUS. Mas toda Canção, um dia, recomeça.',
    ],
    reward: { item: 'saga_vazio', name: 'Lança da Aurora Desperta', desc: 'A Lança inteira, desperta. Canta enquanto golpeia.', slot: 'weapon' },
    zones: [
      z('Ruínas do Mundo que Não Foi', 'Pedaços de mundos que o Silêncio apagou antes de existirem. Flutuam no nada.', 'prism', [T.CAVE, T.CWALL, T.CRYSTAL], ['shade', 'wisp', 'gargoyle'], 'void', '#c0a0ff', 0.5, [150, 110, 255, 0.3],
        b('Arquiteto do Nada Nullus', 'golem', '#8060c0', 3.8, 'Nullus apaga o chão sob seus pés: — Por que existir? É tão barulhento.', 'Nullus se espanta ao sentir algo: dor. E depois, alívio.', 'Ele se desfaz em estrelas pequenas.'), 'stars'),
      z('Mar de Estrelas Mortas', 'Um oceano de estrelas que se apagaram. Cada uma era um mundo.', 'moonwood', [T.ICE, T.CWALL, T.CRYSTAL], ['wisp', 'jelly', 'wraith'], 'stars', '#a0c0ff', 0.55, [120, 150, 255, 0.3],
        b('Baleia Estelar Astraeon', 'serpent', '#c0d0ff', 4, 'Uma baleia de constelações canta a última música das estrelas mortas.', 'Astraeon termina a música.', 'As estrelas, uma a uma, voltam a brilhar.'), 'void'),
      z('Eco de Vael', 'Uma Potos cinzenta, sem cor, sem som. Vael está sentado no lugar da Árvore.', 'marble', [T.COBBLE, T.WALL, T.PILLAR], ['shade', 'wraith', 'mimic'], 'ghosts', '#e0e0e0', 0.45, [200, 200, 210, 0.3],
        b('Sombra de Vael', 'shade', '#9a9ab8', 3.8, 'A sombra de Vael: — Eu calei o mundo para ele não sofrer. E você? O que vai fazer com a dor?', 'A sombra sorri pela primeira vez: — Cantar. Claro. Por que eu não pensei nisso?', 'Vael some numa nota longa e bonita.'), 'void'),
      z('Coração do Ømnia', 'O lugar onde a nota que engoliu o mundo nasceu. Pulsa como um coração enorme.', 'obsidian', [T.ASH, T.CWALL, T.LAVA], ['shade', 'wisp', 'salamander', 'gargoyle'], 'void', '#ffffff', 0.6, [230, 220, 255, 0.3],
        b('Fragmento de Ømnia', 'shade', '#f0f0ff', 4, 'Um pedaço de Ømnia guarda o caminho: — Nós somos o mesmo silêncio. Você não pode nos separar.', 'O fragmento se quebra como vidro.', 'Atrás dele, o trono vazio.'), 'stars'),
      z('Trono do Primeiro Silêncio', 'Nada. Nenhum chão, nenhum céu. Só um trono vazio e alguém que nunca teve forma.', 'aurora', [T.FLOOR, T.WALL, T.CRYSTAL], ['shade', 'wraith', 'gargoyle', 'wisp', 'imp'], 'void', '#d0b0ff', 0.55, [170, 130, 255, 0.34],
        b('O Primeiro Silêncio', 'shade', '#000010', 4.8, 'O Silêncio não fala. Ele apaga. Primeiro a cor, depois o som, depois você.', 'O Silêncio ouve, pela primeira vez, uma nota.', 'E chora. Silêncios também choram.'), 'stars'),
    ],
  },
];

export const ZONE_COUNT = SAGA_REALMS.reduce((n, r) => n + r.zones.length, 0);
export const zoneLevel = (r: SagaRealm, i: number) => r.level + i * 2;
export const sagaBossId = (r: SagaRealm, i: number) => `saga_${r.id}_${i}`;
export const realmDone = (r: SagaRealm, done: (id: string) => boolean) => done(sagaBossId(r, r.zones.length - 1));
/** Reino i abre quando o chefe final do reino anterior cai. */
export const realmUnlocked = (i: number, done: (id: string) => boolean) => i === 0 || realmDone(SAGA_REALMS[i - 1]!, done);
/** Zona k abre quando o chefe da zona k-1 cai. */
export const zoneUnlocked = (r: SagaRealm, k: number, done: (id: string) => boolean) => k === 0 || done(sagaBossId(r, k - 1));
export function bossStats(r: SagaRealm, i: number) {
  const lvl = zoneLevel(r, i) + 6, last = i === r.zones.length - 1, mult = last ? 1.8 : 1;
  return { hp: Math.round((3200 + lvl * lvl * 30) * mult), atk: Math.round((20 + lvl * 2.7) * (last ? 1.15 : 1)), xp: Math.round((500 + lvl * lvl * 10) * mult), gold: Math.round(lvl * 70 * mult), level: lvl };
}

/* ═════════════ Histórias paralelas ═════════════ */
export type SideStepKind = 'talk' | 'kill' | 'bring' | 'boss' | 'choice';
export interface SideStep { kind: SideStepKind; zone: number; text: string; hint: string; n?: number; item?: string; options?: [string, string] }
export interface SideStory { id: string; realm: string; name: string; npc: { name: string; title: string; pal: { skin: string; hair: string; body: string; legs: string; accent?: string } }; steps: SideStep[]; ending: [string, string]; reward: { gold: number; xp: number; item: string; qty: number } }

const P = (skin: string, hair: string, body: string, legs: string, accent?: string) => (accent ? { skin, hair, body, legs, accent } : { skin, hair, body, legs });
const talk = (zone: number, text: string, hint: string): SideStep => ({ kind: 'talk', zone, text, hint });
const kill = (zone: number, n: number, text: string, hint: string): SideStep => ({ kind: 'kill', zone, n, text, hint });
const bring = (zone: number, item: string, n: number, text: string, hint: string): SideStep => ({ kind: 'bring', zone, item, n, text, hint });
const boss = (zone: number, text: string, hint: string): SideStep => ({ kind: 'boss', zone, text, hint });
const choice = (zone: number, text: string, a: string, bb: string): SideStep => ({ kind: 'choice', zone, text, hint: 'Uma decisão espera por você.', options: [a, bb] });

export const SIDE_STORIES: SideStory[] = [
  // ── Aeloria ──
  { id: 'nau', realm: 'aeloria', name: 'O Grumete do Navio Fantasma', npc: { name: 'Pip Salgado', title: 'Grumete Perdido', pal: P('#e0c0a0', '#a06030', '#3060a0', '#203040') },
    steps: [talk(0, 'Sou o grumete do Capitão Morrow. Ou era. Morri há oitenta anos, mas ninguém me contou. Pode me ajudar a achar meu navio?', 'Fale com Pip na Praia dos Mil Naufrágios.'),
      kill(0, 12, 'Os caranguejos roubaram as tábuas do casco. Pegue-as de volta!', 'Derrote 12 criaturas em Aeloria.'),
      boss(0, 'Se o capitão descansar, eu também posso. Mas ele é teimoso.', 'Derrote o Capitão Afogado Morrow.'),
      talk(1, 'Achei o mapa do capitão na selva! Ele queria voltar para casa, em Potos.', 'Encontre Pip na Selva dos Sussurros.'),
      choice(1, 'Você leva o sino do navio para Potos ou deixa ele tocando no mar para os outros fantasmas?', 'Levar o sino para Potos', 'Deixar o sino no mar')],
    ending: ['Pip abraça o sino e some sorrindo. Em Potos, um sino novo toca ao meio-dia.', 'O sino toca no mar. Mil fantasmas, enfim, sabem para onde ir.'], reward: { gold: 1500, xp: 6000, item: 'hi_potion', qty: 5 } },
  { id: 'harpia', realm: 'aeloria', name: 'O Ovo da Harpia', npc: { name: 'Kiri', title: 'Filhote de Harpia', pal: P('#f0e0c0', '#c0c0ff', '#a0b0ff', '#606090') },
    steps: [talk(3, 'Minha mãe, Skyrra, está brava com todo mundo. Mas meu irmão ainda está no ovo, perdido no vulcão!', 'Fale com Kiri no Cânion dos Ventos.'),
      boss(3, 'Desculpa pedir... mas ela não vai ouvir ninguém enquanto não perder uma luta.', 'Derrote a Harpia-Matriarca Skyrra.'),
      kill(4, 15, 'O ovo está no ninho dos salamandras. São muitas!', 'Derrote 15 criaturas em Aeloria.'),
      bring(4, 'mana_shard', 3, 'O ovo está frio! Fragmentos de mana podem aquecê-lo.', 'Traga 3 Fragmentos de Mana.'),
      talk(3, 'Ele nasceu! Mamãe chorou. Harpias nunca choram.', 'Volte até Kiri no Cânion.')],
    ending: ['As harpias juram proteger Aeloria para sempre.', 'As harpias juram proteger Aeloria para sempre.'], reward: { gold: 2000, xp: 8000, item: 'elixir', qty: 2 } },
  { id: 'nereth', realm: 'aeloria', name: 'O Perdão da Sacerdotisa', npc: { name: 'Irmã Coralina', title: 'Noviça Afogada', pal: P('#c0e0f0', '#40a0c0', '#2080a0', '#105070') },
    steps: [talk(5, 'Nereth me ensinou tudo. E depois traiu a Deusa. Eu preciso saber por quê.', 'Fale com Coralina nas Ruínas Afogadas.'),
      kill(5, 18, 'Os servos de Azrakel guardam o diário dela nas ruínas.', 'Derrote 18 criaturas em Aeloria.'),
      talk(5, 'O diário diz: "Ele prometeu devolver minha irmã." Azrakel faz a mesma promessa a todos.', 'Leia o diário com Coralina.'),
      boss(6, 'Thalgor guarda a irmã dela, transformada em corrente. Liberte-a.', 'Derrote o Carcereiro Thalgor.'),
      choice(6, 'A irmã de Nereth está livre. Coralina pergunta: devemos contar a Lyria sobre a traição?', 'Contar toda a verdade', 'Deixar o passado no fundo do mar')],
    ending: ['Lyria escuta e perdoa. "Medo não é traição. É só medo."', 'O segredo afunda com as ruínas. Coralina reza por Nereth toda noite.'], reward: { gold: 3000, xp: 12000, item: 'elixir', qty: 3 } },
  // ── Ylvenna ──
  { id: 'nome', realm: 'ylvenna', name: 'O Nome Roubado', npc: { name: '???', title: 'Alguém Sem Nome', pal: P('#f0d0f0', '#202020', '#8040a0', '#402050') },
    steps: [talk(0, 'O Arlequim roubou meu nome numa aposta. Agora ninguém lembra de mim. Nem eu.', 'Fale com a pessoa sem nome no Anel dos Cogumelos.'),
      boss(0, 'Ganhe dele. Fadas sempre pagam dívidas de jogo.', 'Derrote o Arlequim das Mil Danças.'),
      talk(2, 'O Arlequim vendeu meu nome para a Condessa Mabh! Ela coleciona nomes.', 'Encontre-a nos Salões Gelados.'),
      boss(2, 'Mabh guarda os nomes em gelo. Quebre o gelo.', 'Derrote a Condessa Glacial Mabh.'),
      choice(2, 'Há mil nomes congelados. Você só pode carregar um. Leva o dela ou liberta todos, sem saber qual é qual?', 'Levar só o nome dela', 'Libertar todos os nomes')],
    ending: ['Ela se lembra: "Eu me chamo Rosamund!" e dança de alegria.', 'Mil nomes voam pela corte. Um deles pousa nela: "Rosamund". Que sorte.'], reward: { gold: 4000, xp: 16000, item: 'elixir', qty: 3 } },
  { id: 'paz', realm: 'ylvenna', name: 'A Paz entre as Cortes', npc: { name: 'Embaixador Puck', title: 'Mensageiro das Duas Cortes', pal: P('#e0f0c0', '#80c040', '#609030', '#304818') },
    steps: [talk(1, 'Verão e Inverno lutam há cem anos e ninguém lembra por quê. Quero levar uma proposta de paz.', 'Fale com Puck nos Jardins do Verão.'),
      bring(1, 'herb', 6, 'Um presente para o Verão: ervas raras.', 'Traga 6 Ervas Medicinais.'),
      bring(2, 'frost_herb', 4, 'Um presente para o Inverno: ervas gélidas.', 'Traga 4 Ervas Gélidas.'),
      kill(4, 20, 'Os espinhos do labirinto atacam os mensageiros. Abra caminho.', 'Derrote 20 criaturas em Ylvenna.'),
      talk(5, 'Ambas aceitaram se encontrar no trono. É um começo.', 'Encontre Puck no Trono da Rainha Vazia.')],
    ending: ['Verão e Inverno assinam a paz com tinta de orvalho.', 'Verão e Inverno assinam a paz com tinta de orvalho.'], reward: { gold: 4500, xp: 18000, item: 'eco_shard', qty: 2 } },
  // ── Thalassa ──
  { id: 'surface', realm: 'thalassa', name: 'A Menina que Queria Ver o Sol', npc: { name: 'Marina', title: 'Criança Tritão', pal: P('#a0e0d0', '#ff8060', '#40a0a0', '#207070') },
    steps: [talk(2, 'Todos dizem que o sol é amarelo. Eu nunca vi. Você já viu?', 'Fale com Marina na Cidade Afundada.'),
      bring(2, 'moonflower', 3, 'Dizem que flores da lua brilham igual ao sol. Pode trazer algumas?', 'Traga 3 Flores da Lua.'),
      kill(3, 22, 'Os peixes da fossa roubaram a luz dela. Pegue de volta!', 'Derrote 22 criaturas em Thalassa.'),
      boss(4, 'Se o Kraken voltar ao normal, o Rei vai deixar a gente subir.', 'Derrote o Kraken Real Leviath.'),
      choice(4, 'Okeanos deixa só uma criança subir para ver o sol. Marina ou o irmão dela, que está doente?', 'Marina sobe', 'O irmão doente sobe')],
    ending: ['Marina volta e descreve o sol para todo mundo. Ninguém dorme naquela noite.', 'O irmão volta curado pela luz. Marina diz: "Ver ele sorrir foi meu sol."'], reward: { gold: 6000, xp: 26000, item: 'elixir', qty: 4 } },
  { id: 'scylla', realm: 'thalassa', name: 'Os Dois Irmãos da Maré', npc: { name: 'Caríbdis', title: 'Irmão de Scylla', pal: P('#90c0b0', '#204040', '#305050', '#182828') },
    steps: [talk(1, 'Minha irmã Scylla lidera a rebelião. Eu sirvo ao Rei. Não nos falamos há trinta anos.', 'Fale com Caríbdis na Floresta de Algas.'),
      boss(1, 'Voltaris guarda a carta que ela me mandou e que nunca chegou.', 'Derrote a Enguia-Elétrica Voltaris.'),
      talk(2, 'A carta diz: "Sinto saudade." Só isso. Trinta anos e só isso.', 'Leve a carta à Cidade Afundada.'),
      boss(2, 'Se ela perder, talvez aceite conversar.', 'Derrote a General Rebelde Scylla.')],
    ending: ['Scylla e Caríbdis se abraçam no meio da praça. A guerra civil termina naquela noite.', ''], reward: { gold: 6500, xp: 28000, item: 'eco_shard', qty: 3 } },
  // ── Aerith ──
  { id: 'asa', realm: 'aerith', name: 'A Última Pena', npc: { name: 'Seraphiel', title: 'Anjo Aprendiz', pal: P('#fff0e0', '#ffe080', '#ffffff', '#d0d0e0', '#ffd040') },
    steps: [talk(0, 'Nasci sem asas, depois que Azrakel cortou as de todos. Dizem que existe uma última pena de anjo.', 'Fale com Seraphiel na Escadaria das Nuvens.'),
      kill(2, 25, 'Os livros voadores sabem onde ela está, mas só contam para quem os vence.', 'Derrote 25 criaturas em Aerith.'),
      boss(3, 'A pena está dentro de Talos, o titã das forjas.', 'Derrote o Titã de Bronze Talos.'),
      bring(3, 'iron_ingot', 4, 'Para fazer asas da pena, preciso de uma armação de ferro.', 'Traga 4 Lingotes de Ferro.'),
      choice(5, 'As asas estão prontas. Seraphiel pode voar, ou pode desmanchar a pena e devolver um pouco de asa para cada anjo.', 'Seraphiel voa', 'Dividir entre todos')],
    ending: ['Seraphiel voa até o sol e volta rindo. Os outros anjos sonham com o dia deles.', 'Mil anjos ganham um pedacinho de asa. Nenhum voa. Todos planam juntos.'], reward: { gold: 9000, xp: 40000, item: 'elixir', qty: 5 } },
  { id: 'jardim', realm: 'aerith', name: 'As Rosas de Hortus', npc: { name: 'Hortus', title: 'Jardineiro Mecânico', pal: P('#a0c0a0', '#808080', '#60a060', '#405040') },
    steps: [talk(1, 'Minha mestra plantou estas rosas antes de partir. Eu cuido delas há trezentos anos. Ela vai voltar?', 'Fale com Hortus nos Jardins Suspensos.'),
      bring(1, 'herb', 8, 'As rosas estão murchando. Preciso de ervas para o adubo.', 'Traga 8 Ervas Medicinais.'),
      talk(4, 'Encontrei o nome da minha mestra na catedral, entre as asas cortadas.', 'Procure Hortus na Catedral.'),
      talk(1, 'Ela não vai voltar. Mas as rosas... as rosas são ela. Vou continuar cuidando.', 'Volte aos Jardins Suspensos.')],
    ending: ['Hortus planta uma rosa nova. É a primeira que ele plantou sozinho.', ''], reward: { gold: 8000, xp: 36000, item: 'eco_shard', qty: 3 } },
  // ── Mortavéu ──
  { id: 'mae', realm: 'mortaveu', name: 'A Mãe que Esperava', npc: { name: 'Dona Aurélia', title: 'Alma que Espera', pal: P('#d0e0d0', '#c0c0c0', '#608070', '#304038') },
    steps: [talk(0, 'Morri esperando meu filho voltar da guerra. Ainda espero. Você o viu?', 'Fale com Aurélia no Campo das Lápides.'),
      kill(2, 25, 'Ele lutou nos exércitos de Ossarius. Procure entre os mortos das catacumbas.', 'Derrote 25 criaturas em Mortavéu.'),
      boss(2, 'O Rei-Esqueleto mantém os soldados presos. Liberte-os.', 'Derrote o Rei-Esqueleto Ossarius.'),
      talk(3, 'Ele está na Vila dos Que Esqueceram. Mas não lembra de mim!', 'Encontre Aurélia na Vila.'),
      choice(3, 'O filho não a reconhece. Você pode forçar a lembrança, que vai doer, ou deixá-la conhecê-lo de novo, devagar.', 'Forçar a lembrança', 'Começar do zero')],
    ending: ['Ele grita, chora, e diz "mãe". Os dois atravessam a Última Porta juntos.', 'Aurélia se apresenta. Ele sorri. Eles têm a eternidade para se conhecer.'], reward: { gold: 12000, xp: 56000, item: 'elixir', qty: 5 } },
  { id: 'kerb', realm: 'mortaveu', name: 'O Melhor Amigo de Hela', npc: { name: 'Pequeno Bóris', title: 'Fantasma de Menino', pal: P('#e0f0e0', '#604020', '#4060a0', '#203050') },
    steps: [talk(1, 'Meu cachorro morreu antes de mim. Eu achava que ia encontrar ele aqui, mas só tem um monstro de três cabeças.', 'Fale com Bóris no Rio das Almas.'),
      bring(1, 'herb', 4, 'Kerberos ficaria mais calmo com ervas calmantes. Até cães do inferno gostam de cheiro de campo.', 'Traga 4 Ervas Medicinais.'),
      kill(4, 20, 'As flores de ossos sabem para onde os animais vão. Vença os guardiões.', 'Derrote 20 criaturas em Mortavéu.'),
      boss(5, 'Liberte Kerberos das correntes. Por favor, não machuque muito.', 'Derrote Kerberos.')],
    ending: ['Uma das cabeças de Kerberos lambe Bóris. "Rex?!" Era ele, o tempo todo.', ''], reward: { gold: 11000, xp: 52000, item: 'eco_shard', qty: 4 } },
  // ── Khronn ──
  { id: 'elowen', realm: 'khronn', name: 'A Carta de Elowen', npc: { name: 'Eco de Elowen', title: 'Lembrança no Oásis', pal: P('#f8e0c8', '#c06040', '#e0e0a0', '#806040', '#ffd080') },
    steps: [talk(1, 'Sou só uma lembrança. Mas antes de morrer eu escrevi uma carta para Azariel. Ele nunca leu.', 'Fale com o Eco de Elowen no Oásis do Ontem.'),
      boss(2, 'A carta está no coração da Praga. A doença guardou tudo que ela tocou.', 'Derrote A Praga Vermelha.'),
      kill(3, 30, 'As engrenagens moeram a carta em mil pedaços. Recupere-os.', 'Derrote 30 criaturas em Khronn.'),
      talk(5, 'A carta está inteira. Leve-a até ele, por favor. Ele precisa ouvir.', 'Encontre o Eco na Câmara da Esfinge.')],
    ending: ['Você guarda a carta. Ela diz: "Não venha me buscar. Viva por nós dois."', ''], reward: { gold: 15000, xp: 70000, item: 'elixir', qty: 6 } },
  { id: 'eumesmo', realm: 'khronn', name: 'Conversa com o Futuro', npc: { name: 'Viajante Encapuzado', title: 'Alguém de Amanhã', pal: P('#c0a080', '#e0e0e0', '#504060', '#282030') },
    steps: [talk(0, 'Eu vim do futuro para te avisar. Mas o tempo aqui está tão quebrado que esqueci o aviso.', 'Fale com o viajante nas Dunas.'),
      bring(3, 'crystal_ore', 6, 'Cristais podem consertar meu relógio. Talvez eu lembre.', 'Traga 6 Cristais de Mana.'),
      boss(4, 'Lembrei! O aviso era sobre... você. O você do futuro.', 'Derrote Você, Daqui a Cem Anos.'),
      choice(4, 'O viajante tira o capuz. É você, mais velho e gentil. "Quer saber como termina?"', 'Quero saber', 'Prefiro descobrir')],
    ending: ['Ele sorri: "Termina bem. Mas só porque você não desistiu." E some.', 'Ele ri: "Era a resposta certa." E some, contente.'], reward: { gold: 16000, xp: 75000, item: 'eco_shard', qty: 4 } },
  // ── Gehenna ──
  { id: 'resgate', realm: 'gehenna', name: 'Os Prisioneiros de Dis', npc: { name: 'Sir Galahar', title: 'Cavaleiro Condenado', pal: P('#e0b090', '#a08040', '#a0a0b0', '#505060', '#ff4020') },
    steps: [talk(0, 'Viemos invadir o castelo há quarenta anos. Fomos capturados. Meus homens ainda estão presos em Dis.', 'Fale com Sir Galahar nos Portões de Cinza.'),
      kill(2, 30, 'Os carcereiros demoníacos estão por toda a cidade.', 'Derrote 30 criaturas em Gehenna.'),
      boss(2, 'Minos guarda as chaves de todas as celas.', 'Derrote o Juiz Infernal Minos.'),
      choice(2, 'As celas abertas. Os cavaleiros querem lutar com você até o castelo, ou voltar para casa.', 'Lutem comigo', 'Voltem para casa'),
      talk(4, 'Chegamos às muralhas. A partir daqui é com você.', 'Encontre Galahar nas Muralhas.')],
    ending: ['Os cavaleiros seguram as hordas na muralha enquanto você entra no castelo.', 'Os cavaleiros voltam para casa. Quarenta famílias reencontram seus pais.'], reward: { gold: 22000, xp: 100000, item: 'elixir', qty: 8 } },
  { id: 'lilith', realm: 'gehenna', name: 'As Rosas Negras', npc: { name: 'Rosa Pequena', title: 'Diabrete Jardineira', pal: P('#ff8080', '#401010', '#802030', '#401018') },
    steps: [talk(5, 'Lilith cuida das rosas do Rei. Eu ajudo. Ninguém pede para diabretes ajudarem, sabia?', 'Fale com Rosa Pequena no Pátio Infernal.'),
      bring(5, 'herb', 10, 'As rosas negras estão morrendo pela primeira vez. Ervas do mundo de cima podem salvá-las.', 'Traga 10 Ervas Medicinais.'),
      boss(5, 'Lilith não deixa ninguém tocar nas rosas. Mas, se ela perder, talvez ouça.', 'Derrote Lilith, Rainha das Rosas Negras.'),
      talk(6, 'As rosas mudaram de cor! Estão ficando brancas. Como as de Elowen.', 'Encontre Rosa Pequena nos Salões do Trono.')],
    ending: ['Uma rosa branca brota no meio do Inferno. Rosa Pequena chora de alegria.', ''], reward: { gold: 20000, xp: 95000, item: 'eco_shard', qty: 5 } },
  { id: 'azariel', realm: 'gehenna', name: 'O Coração do Rei Demônio', npc: { name: 'Lembrança de Azariel', title: 'O Anjo que Ele Foi', pal: P('#fff0e0', '#ffe8a0', '#f0f0ff', '#c0c0d0', '#ffd040') },
    steps: [talk(6, 'Sou o que restou do anjo dentro do Rei Demônio. Eu ainda lembro de Elowen.', 'Fale com a lembrança nos Salões do Trono.'),
      kill(7, 25, 'O fogo dele é feito de culpa. Apague um pouco.', 'Derrote 25 criaturas em Gehenna.'),
      boss(7, 'Não o odeie. Ele vai se perder se você o odiar.', 'Derrote Azrakel, o Rei Demônio.'),
      choice(7, 'Azariel está livre e fraco. Você o leva para Potos ou o deixa no Inferno, para reconstruí-lo como um lugar de cura?', 'Levar a Potos', 'Ficar e reconstruir')],
    ending: ['Azariel vive em Potos como jardineiro. As crianças nem imaginam quem ele foi.', 'Azariel transforma o Inferno num hospital de almas. As chamas viram lareiras.'], reward: { gold: 40000, xp: 180000, item: 'void_essence', qty: 3 } },
  // ── Vazio ──
  { id: 'coro', realm: 'vazio', name: 'O Coro dos Salvos', npc: { name: 'Seraphine', title: 'Oráculo de Potos', pal: P('#f0d8c8', '#e0e0ff', '#6040a0', '#302050', '#c0a0ff') },
    steps: [talk(0, 'Todos que você salvou querem cantar com você na batalha final. Mas precisam ouvir sua voz primeiro.', 'Fale com Seraphine nas Ruínas do Mundo que Não Foi.'),
      kill(1, 40, 'Cada criatura do Silêncio que cai devolve uma nota ao mundo.', 'Derrote 40 criaturas no Céu Quebrado.'),
      bring(2, 'eco_shard', 3, 'Os fragmentos dos Ecos vão afinar o coro.', 'Traga 3 Fragmentos de Eco.'),
      boss(3, 'Quando o Fragmento de Ømnia cair, o coro poderá entrar.', 'Derrote o Fragmento de Ømnia.'),
      talk(4, 'Estamos prontos. Quando você erguer a Lança, cantaremos.', 'Encontre Seraphine no Trono do Silêncio.')],
    ending: ['Mil vozes cantam com você. Pela primeira vez, o Silêncio escuta.', ''], reward: { gold: 60000, xp: 300000, item: 'void_essence', qty: 5 } },
];

export const sideKey = (s: SideStory, i: number) => `side:${s.id}:${i}`;
export const sideChoiceKey = (s: SideStory, opt: number) => `side:${s.id}:choice${opt}`;
export const sideStepOf = (s: SideStory, has: (k: string) => boolean) => { let i = 0; while (i < s.steps.length && has(sideKey(s, i))) i++; return i; };
export const sideDone = (s: SideStory, has: (k: string) => boolean) => sideStepOf(s, has) >= s.steps.length;
export const sidesOf = (realmId: string) => SIDE_STORIES.filter((s) => s.realm === realmId);
export const SAGA_BEAT_COUNT = SAGA_REALMS.reduce((n, r) => n + 2 + r.zones.length, 0);
