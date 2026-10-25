// Bestiário do Abismo do Cântico: 100 criaturas únicas (uma nova por andar) e as
// Crônicas das Profundezas, dez histórias paralelas que se ligam à trama de Ømnia.
// Dado puro e determinístico: sem canvas, para que os testes validem tudo.
import type { EnemyKind } from './data';

export type Archetype =
  | 'wisp' | 'serpent' | 'spider' | 'jelly' | 'knight' | 'eye' | 'moth' | 'crab'
  | 'shard' | 'hound' | 'mask' | 'treant' | 'bell' | 'hand' | 'worm';

export interface Beast {
  id: number; floor: number; stratum: number; name: string; lore: string; arch: Archetype;
  body: string; accent: string; glow: string;
  eyes: number; horns: number; aura: number; limbs: number;
  kind: EnemyKind; hp: number; atk: number; speed: number;
}

type Row = [string, Archetype, string, string, string, string];

/** Dez estratos × dez criaturas. A criatura N aparece pela primeira vez no andar N. */
const ROWS: Row[][] = [
  [ // I · Criptas da Raiz
    ['Lume-de-Seiva', 'wisp', '#4a2a7a', '#b58aff', '#e8d0ff', 'Uma gota de seiva que ainda lembra ter sido luz da Árvore de Mana.'],
    ['Rastejante Radicular', 'worm', '#5a3a2a', '#9a6a3a', '#ffb86a', 'Cava túneis seguindo o pulso das raízes, como quem segue um coração.'],
    ['Tecelã de Xilema', 'spider', '#2a1a3a', '#8a6aff', '#c0a0ff', 'Tece fios de seiva cristalizada. Cada teia toca uma nota grave.'],
    ['Cavaleiro Enraizado', 'knight', '#3a2a1a', '#7a5a3a', '#a8ff80', 'Um guarda do Conselho que adormeceu de pé. As raízes fizeram o resto.'],
    ['Olho do Cerne', 'eye', '#3a1a2a', '#e0a040', '#ffe080', 'A Árvore abriu um olho aqui embaixo para ver quem desce.'],
    ['Mariposa de Âmbar', 'moth', '#6a3a10', '#ffb030', '#fff0a0', 'Suas asas guardam insetos de dez mil anos, ainda zumbindo.'],
    ['Broto Rancoroso', 'treant', '#2a3a1a', '#6aa040', '#d0ff70', 'Nasceu de uma semente que caiu no escuro e nunca perdoou o sol.'],
    ['Mão do Enterrado', 'hand', '#4a3a3a', '#a08070', '#ff9a8a', 'Só a mão saiu da terra. O resto ainda está procurando a saída.'],
    ['Sino de Raiz', 'bell', '#3a2a4a', '#c0a0e0', '#f0e0ff', 'Badala sozinho quando alguém esquece um nome lá em cima.'],
    ['Vigia Nodosa', 'mask', '#2a2030', '#d0b0ff', '#ffffff', 'Uma máscara de casca. Vael a pendurou aqui para avisar: “não desça”.'],
  ],
  [ // II · Galerias Fúngicas
    ['Esporo-Lanterna', 'jelly', '#5a1a6a', '#e070ff', '#ffc0ff', 'Flutua iluminando o caminho, só para ver você se perder melhor.'],
    ['Micélio Rastejador', 'worm', '#4a2a4a', '#c080c0', '#ffe0ff', 'Tem mil quilômetros de comprimento. Esta é só a pontinha.'],
    ['Aranha-Chapéu', 'spider', '#6a2030', '#ff6080', '#ffe0a0', 'Carrega um cogumelo nas costas que sonha por ela.'],
    ['Cão de Bolor', 'hound', '#3a4a2a', '#90c050', '#e0ff90', 'Fareja lembranças podres. Adora as suas.'],
    ['Cantor Lamelar', 'bell', '#4a1a5a', '#d090ff', '#f0d0ff', 'Suas lamelas vibram com o coro de tudo que morreu nas galerias.'],
    ['Traça Bioluminescente', 'moth', '#1a3a4a', '#40ffd0', '#c0fff0', 'Seu pó de asa faz você ver cores que não existem lá em cima.'],
    ['Anciã de Píleo', 'treant', '#5a3a5a', '#ff90c0', '#ffd0e0', 'Lembra de Fungaroth quando ele era só um esporo tímido.'],
    ['Olho Fúngico', 'eye', '#4a3a1a', '#e0e040', '#ffffa0', 'Brotou de uma pupila perdida. Ainda pisca por hábito.'],
    ['Cavaleira Infestada', 'knight', '#3a2a3a', '#b060d0', '#f0a0ff', 'Os fungos vestem a armadura dela melhor do que ela vestia.'],
    ['Rosto de Mil Esporos', 'mask', '#5a2a5a', '#ffb0ff', '#ffffff', 'Mil vozes, um rosto. Todas dizem a mesma palavra: “volte”.'],
  ],
  [ // III · Catacumbas do Conselho
    ['Escriba Espectral', 'wisp', '#3a3a2a', '#e8d8b0', '#fff8e0', 'Ainda anota as sentenças do Conselho, mesmo sem réus.'],
    ['Gárgula Sentinela', 'shard', '#4a4a4a', '#c0b090', '#ffe0a0', 'Foi esculpida para chorar. Agora só observa.'],
    ['Lacaio do Selo', 'knight', '#2a2a3a', '#d0c080', '#fff0b0', 'Jurou guardar o selo de Vael por mil anos. Faltam doze.'],
    ['Cão Ossário', 'hound', '#d8d0c0', '#8a7a6a', '#ff6040', 'Feito dos ossos de todos os cães que esperaram donos que não voltaram.'],
    ['Máscara do Juramento', 'mask', '#3a3020', '#ffd060', '#fff8d0', 'Os conselheiros a usavam para mentir sem que o rosto soubesse.'],
    ['Sineira Fúnebre', 'bell', '#2a2a2a', '#b0a0a0', '#e0d0ff', 'Toca uma vez por cada nome riscado do Livro do Conselho.'],
    ['Mão do Veredito', 'hand', '#3a3a4a', '#e0d0a0', '#ffffff', 'Assinou a condenação de Vael. Nunca parou de tremer.'],
    ['Aracnídeo Relicário', 'spider', '#4a3a2a', '#e8c060', '#fff0a0', 'Esconde relíquias roubadas dentro do próprio abdômen.'],
    ['Olho do Tribunal', 'eye', '#2a2a3a', '#8080ff', '#d0d0ff', 'Viu o julgamento inteiro. Sabe quem realmente traiu.'],
    ['Serpente de Lacre', 'serpent', '#6a1a1a', '#ff4040', '#ffc0a0', 'É feita de cera de lacre derretida. Sela tudo o que morde.'],
  ],
  [ // IV · Lagos Subterrâneos
    ['Medusa Sem Reflexo', 'jelly', '#1a4a4a', '#60e0d0', '#d0fff8', 'Na água sem reflexo, ela é o único espelho. Não olhe por muito tempo.'],
    ['Enguia Murmurante', 'serpent', '#1a3a3a', '#40c0a0', '#a0ffe0', 'Repete em voz baixa as últimas palavras de quem se afogou.'],
    ['Caranguejo Abissal', 'crab', '#2a3a5a', '#6090e0', '#c0e0ff', 'Carrega na carapaça a concha onde Morgwyn nasceu.'],
    ['Lula Coral', 'hand', '#5a2a3a', '#ff8090', '#ffd0d0', 'Seus tentáculos escrevem poemas na água que somem antes de terminar.'],
    ['Cão das Marés Mortas', 'hound', '#1a2a3a', '#4080a0', '#80e0ff', 'Uiva quando a maré de cima muda, mesmo sem nunca tê-la visto.'],
    ['Olho do Poço', 'eye', '#0a2a3a', '#30d0ff', '#e0ffff', 'Quem jogou uma moeda no poço de Potos, foi visto por ele.'],
    ['Sereia de Lodo', 'mask', '#2a3a2a', '#80c0a0', '#e0fff0', 'Cantava para os pescadores. Agora canta para ninguém.'],
    ['Sino Submerso', 'bell', '#1a3a4a', '#70b0c0', '#c0f0ff', 'Afundou com a capela da vila velha. Ainda chama para a missa.'],
    ['Aranha-d’Água', 'spider', '#1a2a2a', '#50e0b0', '#c0fff0', 'Caminha sobre a água que não reflete, por isso é invisível.'],
    ['Leviatãzinho Errante', 'worm', '#2a4a5a', '#70d0e0', '#e0ffff', 'Filhote de Morgwyn. Ainda acha que você é um brinquedo.'],
  ],
  [ // V · Areias Engolidas
    ['Soldado de Areia', 'knight', '#8a6a3a', '#e8c070', '#fff0b0', 'Patrulha um império que afundou há mil anos. Não sabe que acabou.'],
    ['Escaravelho Solar', 'crab', '#5a3a10', '#ffc030', '#fff090', 'Empurra um sol pequeno pelos corredores, para que nunca anoiteça.'],
    ['Djinn Engarrafado', 'wisp', '#3a2a5a', '#ffb060', '#ffe0c0', 'Concedeu três desejos a Anketh. Os três foram “mais tempo”.'],
    ['Serpente de Duna', 'serpent', '#a07a40', '#ffe0a0', '#ffffff', 'Nada na areia como na água. Seu rastro forma palavras antigas.'],
    ['Máscara Mortuária', 'mask', '#4a3a10', '#ffd040', '#40e0ff', 'Ouro sobre o rosto de um faraó que nunca teve rosto.'],
    ['Chacal Sepulcral', 'hound', '#3a2a1a', '#d0a050', '#ffe060', 'Guia as almas até a balança. Nunca as traz de volta.'],
    ['Mão da Ampulheta', 'hand', '#7a5a30', '#e0c080', '#fff8d0', 'Segura o último grão de areia do império, para que ele não caia.'],
    ['Mariposa do Deserto', 'moth', '#8a5a2a', '#ffa040', '#ffe0a0', 'Atraída por miragens. Morreu mil vezes em fogos que não existiam.'],
    ['Obelisco Vivo', 'shard', '#6a5a3a', '#ffd070', '#ffffff', 'Cada hieróglifo nele é uma nota da Canção, escrita para não ser esquecida.'],
    ['Aranha de Vidro Fundido', 'spider', '#4a3a2a', '#ff8040', '#ffe0a0', 'Nasceu quando um raio caiu na areia. Brilha por dentro.'],
  ],
  [ // VI · Geleiras Profundas
    ['Lobo de Gelo Cantante', 'hound', '#a0c0e0', '#e0f0ff', '#80e0ff', 'Uiva em acordes perfeitos. A matilha inteira é um coro.'],
    ['Fantasma da Avalanche', 'wisp', '#c0d8f0', '#ffffff', '#a0e0ff', 'Foi um alpinista. Ainda pede ajuda com a voz do vento.'],
    ['Golem de Geada', 'shard', '#80a0c0', '#c0e8ff', '#ffffff', 'Cada floco que o compõe é diferente. Ele também.'],
    ['Aldren Congelado', 'knight', '#4a6a8a', '#a0d0f0', '#ffd080', 'O marido da Senhora Maelis. Ainda segura a vela que ela lhe deu.'],
    ['Serpe Aurora', 'serpent', '#2a4a6a', '#60ffc0', '#e0a0ff', 'Roubou um pedaço da aurora e a escondeu nas próprias escamas.'],
    ['Medusa de Neve', 'jelly', '#b0d0f0', '#ffffff', '#c0f0ff', 'Flutua no ar gelado como se o frio fosse um oceano.'],
    ['Sino de Gelo', 'bell', '#90b8e0', '#e0f8ff', '#ffffff', 'Se tocar, racha. Se rachar, a geleira inteira desaba.'],
    ['Olho Glacial', 'eye', '#5a7a9a', '#a0f0ff', '#ffffff', 'Ficou preso no gelo olhando para cima por mil anos.'],
    ['Caranguejo-Iceberg', 'crab', '#6a8aaa', '#d0f0ff', '#80c0ff', 'Só um décimo dele aparece. O resto está embaixo de você.'],
    ['Traça Polar', 'moth', '#d0e0f0', '#80b0ff', '#ffffff', 'Suas asas são finas como a respiração num dia de inverno.'],
  ],
  [ // VII · Forjas de Kaore
    ['Centelha Errante', 'wisp', '#6a1a0a', '#ff6020', '#ffe060', 'Fugiu da bigorna de Kael antes de virar espada.'],
    ['Autômato Pedra-Negra', 'knight', '#2a2a2a', '#ff7030', '#ffc060', 'Os anões o fizeram para servir. Kael o ensinou a odiar.'],
    ['Salamandra de Escória', 'serpent', '#3a1a0a', '#ff4010', '#ffd040', 'Banha-se em metal derretido. Diz que é morno demais.'],
    ['Cão-Fornalha', 'hound', '#4a2010', '#ff8020', '#fff080', 'Seu latido é o som de um fole. Sua mordida, o de uma forja.'],
    ['Mão do Ferreiro', 'hand', '#5a3a2a', '#ff9040', '#ffe0a0', 'A mão direita de Kael. Ele a cortou para fundir uma melhor.'],
    ['Aranha de Rebites', 'spider', '#3a3a3a', '#ffa030', '#ffe080', 'Monta-se sozinha toda manhã. Às vezes sobra uma perna.'],
    ['Fragmento do Colosso', 'shard', '#2a1a1a', '#ff5020', '#ffb060', 'Um pedaço do Colosso que ainda acha que é o Colosso inteiro.'],
    ['Máscara de Fundição', 'mask', '#3a2010', '#ffc040', '#ffffff', 'Os anões a usavam para não ver o que estavam construindo.'],
    ['Verme de Magma', 'worm', '#5a1a0a', '#ff6030', '#ffff80', 'Cava rios de lava que esfriam formando estradas.'],
    ['Sino da Bigorna', 'bell', '#4a3a2a', '#ffb040', '#fff0c0', 'Cada martelada de Kael ecoa nele. Ele nunca esquece uma.'],
  ],
  [ // VIII · Biblioteca Afogada
    ['Página Errante', 'moth', '#d8c8a0', '#6a4a2a', '#fff0c0', 'Fugiu de um livro que ninguém escreveu. Procura seu capítulo.'],
    ['Traça Devoradora', 'worm', '#8a7a5a', '#d0b080', '#ffe0a0', 'Comeu tantas histórias que agora fala em rimas.'],
    ['Leitor Afogado', 'knight', '#2a3a4a', '#d8b080', '#a0e0ff', 'Morreu lendo. Ainda não chegou ao fim do livro.'],
    ['Tinteiro Vivo', 'jelly', '#1a1a3a', '#4040ff', '#a0a0ff', 'Uma gota da tinta que Lira usou para escrever a Canção.'],
    ['Olho do Índice', 'eye', '#3a2a1a', '#e0c090', '#ffffff', 'Sabe onde está cada livro. Não diz onde está o seu.'],
    ['Máscara do Autor', 'mask', '#4a3a2a', '#ffe0b0', '#ffd040', 'O rosto de quem escreveu sua vida. Parece com você.'],
    ['Aranha-Marcador', 'spider', '#5a1a2a', '#d04060', '#ffc0d0', 'Marca a página em que cada pessoa parou de viver.'],
    ['Sino do Silêncio', 'bell', '#2a2a3a', '#a0a0c0', '#e0e0ff', 'Quando toca, todos ficam quietos. Inclusive o tempo.'],
    ['Estante Ambulante', 'treant', '#4a2a1a', '#c08040', '#ffe0a0', 'Carrega mil livros nas costas. Quer que você leia todos.'],
    ['Mão da Bibliotecária', 'hand', '#d8c0a0', '#806040', '#ffffff', 'Arrancou o próprio nome com estes dedos. Ainda sente a tinta.'],
  ],
  [ // IX · Coração de Cristal
    ['Nota Cristalizada', 'shard', '#5a2a8a', '#d090ff', '#ffffff', 'Uma nota que o Silêncio arrancou. Ela ainda vibra baixinho.'],
    ['Lumen Prismático', 'wisp', '#3a1a6a', '#80ffff', '#ffffff', 'Divide a luz em sete. Divide você em sete também.'],
    ['Aranha de Quartzo', 'spider', '#6a4a8a', '#ffc0ff', '#ffffff', 'Suas teias são cordas de harpa. Tocam quando você passa.'],
    ['Cavaleiro Facetado', 'knight', '#3a2a5a', '#c0a0ff', '#e0ffff', 'Guarda Vel-Ara há tanto tempo que virou parte do cristal.'],
    ['Serpente Geodo', 'serpent', '#4a2a6a', '#ff80ff', '#ffffff', 'Por fora, pedra. Por dentro, uma galáxia inteira.'],
    ['Medusa de Ametista', 'jelly', '#5a1a7a', '#d060ff', '#ffd0ff', 'Cada tentáculo é um tom da escala que ninguém mais canta.'],
    ['Olho Refratário', 'eye', '#2a1a4a', '#ff60c0', '#ffffff', 'Vê todas as versões do mundo. Odeia esta.'],
    ['Mariposa Espectral', 'moth', '#3a3a6a', '#a0c0ff', '#ffffff', 'Suas asas mostram reflexos de quem você poderia ter sido.'],
    ['Cão Ressonante', 'hound', '#4a3a6a', '#e0a0ff', '#ffffff', 'Late em frequências que racham vidro e corações.'],
    ['Coroa Sem Rei', 'mask', '#6a5a2a', '#ffe060', '#e0c0ff', 'Era de Gorm. Ele a deixou aqui quando desceu para cantar Ømnia.'],
  ],
  [ // X · O Vazio Sem Eco
    ['Silhueta Muda', 'wisp', '#1a1a2a', '#6a6a8a', '#e0e0ff', 'A forma de alguém que foi esquecido. Não lembra de quem.'],
    ['Eco Invertido', 'jelly', '#2a2a3a', '#9a9ab8', '#ffffff', 'Repete o que você vai dizer, antes de você dizer.'],
    ['Devorador de Notas', 'worm', '#0a0a1a', '#5a5a7a', '#ff60a0', 'Engoliu tantas canções que só consegue arrotar silêncio.'],
    ['Arauto de Ømnia', 'knight', '#1a1a2a', '#e0e0ff', '#a0a0ff', 'Anuncia a Nota Final. Não tem boca, mas todos o ouvem.'],
    ['Mão do Vazio', 'hand', '#1a1a1a', '#3a3a5a', '#c0c0ff', 'Puxa para baixo tudo o que tenta subir.'],
    ['Sino Rachado', 'bell', '#2a2a2a', '#8a8aa0', '#ffffff', 'O primeiro sino do mundo. Ømnia o rachou com um sussurro.'],
    ['Olho do Fim', 'eye', '#0a0a1a', '#ffffff', '#ff80c0', 'Já viu o fim de tudo. Está esperando o seu.'],
    ['Aranha do Nada', 'spider', '#1a1a2a', '#7070a0', '#e0e0ff', 'Tece teias de silêncio. Prendem sons, não corpos.'],
    ['Vael Fragmentado', 'mask', '#2a1a3a', '#c080ff', '#ffffff', 'O que sobrou de Vael depois de tentar calar Ømnia. Ainda pede perdão.'],
    ['Primeira Nota', 'shard', '#f0f0ff', '#a0a0ff', '#ffffff', 'Antes de Ømnia ser fome, ela era isto: uma nota sozinha, com medo.'],
  ],
];

const KIND_OF: Record<Archetype, EnemyKind> = {
  wisp: 'shade', jelly: 'shade', eye: 'shade', moth: 'shade', bell: 'shade', mask: 'shade',
  hound: 'wolf', serpent: 'wolf', spider: 'wolf', worm: 'scorpion', crab: 'scorpion', hand: 'scorpion',
  knight: 'golem', shard: 'golem', treant: 'golem',
};
const STAT: Record<Archetype, [number, number, number]> = {
  wisp: [0.8, 1, 1.1], jelly: [0.9, 1, 0.8], eye: [0.85, 1.2, 0.7], moth: [0.75, 1, 1.3], bell: [1.2, 1.1, 0.6], mask: [1, 1.25, 0.9],
  hound: [1, 1.1, 1.4], serpent: [1.05, 1.15, 1.2], spider: [0.95, 1.1, 1.3], worm: [1.3, 1, 0.8], crab: [1.5, 0.95, 0.75], hand: [1.1, 1.3, 1],
  knight: [1.6, 1.15, 0.8], shard: [1.8, 1.05, 0.65], treant: [1.7, 1, 0.6],
};

export const BEASTS: Beast[] = ROWS.flatMap((rows, s) => rows.map(([name, arch, body, accent, glow, lore], k) => {
  const id = s * 10 + k;
  const [hp, atk, speed] = STAT[arch];
  return {
    id, floor: id + 1, stratum: s, name, lore, arch, body, accent, glow,
    eyes: 1 + ((id * 7 + s) % 5), horns: (id * 3 + k) % 4, aura: (id * 5 + s) % 4, limbs: 2 + ((id + s) % 4),
    kind: KIND_OF[arch], hp: hp * (1 + s * 0.04), atk, speed,
  };
}));

export const beastKey = (id: number) => `beast:${id}`;

/** Fauna de um andar do Abismo: a criatura-assinatura do andar domina, as anteriores do estrato completam. */
export function floorBeasts(floor: number): number[] {
  const sig = Math.max(1, Math.min(100, floor)) - 1;
  const base = Math.floor(sig / 10) * 10;
  const out: number[] = [];
  for (let i = base; i <= sig; i++) out.push(i);
  return out;
}
export function pickBeast(floor: number, r: number): number {
  const pool = floorBeasts(floor), sig = pool[pool.length - 1]!;
  if (r < 0.45 || pool.length === 1) return sig;
  return pool[Math.floor(((r - 0.45) / 0.55) * (pool.length - 1))]!;
}

/* ───────────── Crônicas das Profundezas ───────────── */
export interface Chronicle { stratum: number; title: string; hero: string; chapters: string[] }
/** Cada capítulo abre a cada duas criaturas registradas no estrato. */
export const CHRONICLES: Chronicle[] = [
  { stratum: 0, title: 'A Jardineira das Raízes', hero: 'Ysmé, a primeira jardineira de Potos', chapters: [
    'Antes de Potos ter muros, Ysmé plantou a Árvore de Mana com uma semente que cantava. Ela jurou cuidar de cada raiz, até das que descessem ao escuro.',
    'As raízes desceram demais. Ysmé as seguiu e encontrou, no fundo, um som que não era da Árvore: uma nota faminta, chamando as raízes para baixo.',
    'Ela entendeu tarde que a Árvore não crescia para o céu. Crescia para longe de algo. Ygdrasa, a raiz mais velha, foi a primeira a ouvir Ømnia.',
    'Ysmé pendurou máscaras de casca pelas criptas para avisar os que viessem depois. Vael encontrou uma delas, séculos mais tarde, e a usou.',
    'No último bilhete de Ysmé, preso a uma raiz: “Ømnia não odeia a Canção. Ela tem fome dela. Alimentar a fome não é o mesmo que acabar com ela.”',
  ] },
  { stratum: 1, title: 'O Coro que Apodreceu', hero: 'Os Trinta Cantores perdidos', chapters: [
    'O Coro dos Trinta não nasceu completo. Antes eram trinta e três. Três desceram às galerias para gravar o eco da Árvore e não voltaram.',
    'Os fungos guardaram suas vozes. Fungaroth cresceu ouvindo hinos — e aprendeu a imitá-los para atrair outros cantores.',
    'Um dos três, Brennick, deixou rabiscos nas paredes: “Ømnia fala através do micélio. Ela quer aprender a cantar. Ela quer ser a Canção.”',
    'O segundo, Lyss, se deixou consumir para que sua voz ficasse presa num esporo. Fennick, o Bardo sem Canção, é seu neto. A canção roubada dele está aqui.',
    'O terceiro nunca morreu: virou o Rosto de Mil Esporos. Quando você o vence, ele diz, com uma voz só: “Obrigado. Diga ao Coro que eram trinta e três.”',
  ] },
  { stratum: 2, title: 'O Julgamento de Vael', hero: 'Vael, o Conselheiro Condenado', chapters: [
    'Vael era o mais jovem do Conselho. Foi ele quem primeiro desceu ao Abismo e ouviu Ømnia. Voltou pálido e pediu que a Canção fosse calada, por um tempo.',
    'O Conselho riu. Calar a Canção seria matar o mundo. Vael foi chamado de traidor e julgado no tribunal destas catacumbas.',
    'O Olho do Tribunal viu tudo: a assinatura que condenou Vael foi falsificada. Quem assinou de verdade foi Gorm, o Maestro, seu melhor amigo.',
    'Gorm temia que Vael estivesse certo. Se a Canção alimentava Ømnia, então o próprio Gorm, que a regia, era culpado. Era mais fácil culpar Vael.',
    'Sentenor ainda espera o réu porque o julgamento nunca terminou. Você é o novo réu: quem desce, carrega a pergunta de Vael. Calar ou cantar?',
  ] },
  { stratum: 3, title: 'A Capela Afundada', hero: 'Padre Oren e a vila velha', chapters: [
    'Sob Potos havia outra Potos, mais antiga. Quando o Abismo se abriu, a vila velha afundou com capela, sino e tudo.',
    'Padre Oren continuou tocando o sino debaixo d’água, para que os afogados soubessem a hora da missa. A água parou de refletir para não ver a tristeza dele.',
    'Morgwyn não nasceu monstro. Era a enguia de estimação das crianças da vila. Ømnia a fez crescer com a fome de todos os que não foram salvos.',
    'Oren escreveu no último banco da capela: “A água que não reflete é a água que esqueceu. Ømnia se alimenta de esquecimento.”',
    'Quando o Leviatãzinho Errante cai, ele não morre: nada até a capela e toca o sino uma última vez. Lá em cima, em Potos, alguém sente vontade de rezar.',
  ] },
  { stratum: 4, title: 'Os Três Desejos de Anketh', hero: 'Anketh, o Faraó Sepulto', chapters: [
    'Anketh governava um império de areia acima de onde hoje fica o deserto de Sahr. Ouviu dizer que no fundo do mundo havia uma nota que dava vida eterna.',
    'Ele cavou. O império inteiro cavou. Quando chegaram perto de Ømnia, a areia cedeu e o império desceu com eles.',
    'O Djinn concedeu três desejos. Anketh pediu mais tempo, três vezes. Ømnia achou graça: tempo era exatamente o que ela come.',
    'Os soldados ainda patrulham porque Anketh nunca deu a ordem de descansar. O Obelisco Vivo guarda essa ordem escrita, esperando um leitor.',
    'Ao derrotar a Mão da Ampulheta, o último grão cai. Os soldados de areia param, se curvam e se desfazem. Pela primeira vez em mil anos, o império dorme.',
  ] },
  { stratum: 5, title: 'A Vela de Maelis', hero: 'Aldren, guarda do Santuário Nevado', chapters: [
    'Aldren saiu de casa prometendo voltar antes do inverno. A Senhora Maelis lhe deu uma vela, para que ele achasse o caminho no escuro.',
    'Ele não subiu a montanha. Desceu. Seguiu um lobo que uivava em acordes perfeitos — a matilha de Hrimfax, que caça pela Canção.',
    'Nas geleiras, Aldren encontrou o diário de um alpinista que viu Ømnia de perto: “Ela não é escura. É branca. Branca como uma página antes da primeira palavra.”',
    'Aldren decidiu ficar. Enquanto a vela queimasse, o gelo não avançaria rumo a Potos. Ele congelou de pé, de guarda, com a chama acesa.',
    'Quando você liberta Aldren Congelado, a vela apaga. Ele sorri e diz: “Diga a ela que eu não esqueci. Diga que foi por ela.” Maelis, lá em cima, apaga a vela dela também.',
  ] },
  { stratum: 6, title: 'Os Irmãos da Forja', hero: 'Kael e Durn Pedra-Negra', chapters: [
    'Kael e Durn eram gêmeos, os melhores ferreiros do clã. Juntos construíram o Colosso para proteger a Canção.',
    'Kael ouviu Ømnia nas brasas. Ela prometeu que, se ele forjasse um corpo para ela, ele jamais seria esquecido.',
    'Kael começou a fundir pedaços de si mesmo nas máquinas. Primeiro a mão direita. Depois a voz. Depois o nome do irmão.',
    'A dívida pela qual Durn foi exilado era de Kael: o clã descobriu o pacto, mas Durn assumiu a culpa para que o irmão não fosse executado.',
    'O Sino da Bigorna lembra cada martelada. Na última, Kael escreveu no metal: “Durn, me perdoe. Eu só queria que alguém lembrasse de mim.”',
  ] },
  { stratum: 7, title: 'O Nome Apagado', hero: 'A Bibliotecária Sem Rosto', chapters: [
    'Ela se chamava Lira, como a fundadora de Lira, a cidade dos perfumes. Era a guardiã dos nomes: cada pessoa nascida no mundo tinha um livro aqui.',
    'Ømnia começou a comer os livros. Cada página comida era uma pessoa que o mundo esquecia, como se nunca tivesse existido.',
    'Lira descobriu que Ømnia não consegue comer o que não tem nome. Então ela apagou o próprio nome, para se tornar imune e continuar guardando.',
    'Os Ilo e Ina de Potos roubaram o livro errado da alquimista: era uma cópia do catálogo de Lira. Por isso as explosões — os nomes reagem ao fogo.',
    'Ao reencontrar a Mão da Bibliotecária, ela escreve seu nome numa página em branco e entrega a você. “Se eu cair, você lembra por mim.”',
  ] },
  { stratum: 8, title: 'A Coroa de Gorm', hero: 'Gorm, o Maestro', chapters: [
    'Gorm regia a Canção desde antes de Potos. Quando Vael foi condenado, Gorm não dormiu por um ano. Sabia que o amigo tinha razão.',
    'Ele desceu sozinho. Pensou que, se cantasse para Ømnia a canção mais bonita do mundo, ela ficaria saciada e voltaria a dormir.',
    'Vel-Ara, o Prisma, guarda o momento: Gorm cantou por sete dias. Ømnia ouviu, e ficou maior. A beleza a alimentava ainda mais.',
    'Gorm tirou a coroa e a deixou aqui. Não era mais maestro de nada. Desceu ao Vazio para pedir perdão a Vael, que já estava lá.',
    'A Coroa Sem Rei, vencida, revela a última partitura de Gorm. Não tem notas. Só uma instrução: “Nem calar, nem cantar. Escutar.”',
  ] },
  { stratum: 9, title: 'A Primeira Nota', hero: 'Ømnia, antes da fome', chapters: [
    'No princípio havia silêncio. Então soou uma nota: a primeira. Ela estava sozinha, e o silêncio ao redor era imenso.',
    'Para não ficar só, a nota cantou o mundo. Árvores, mares, pessoas. Cada coisa era uma nota nova para lhe fazer companhia.',
    'Mas as novas notas cantavam entre si e esqueceram da primeira. Ela afundou, sozinha, e a solidão virou fome. A fome virou Ømnia.',
    'Vael tentou calá-la. Gorm tentou saciá-la. Ninguém tentou ouvi-la. Vael Fragmentado, no fim, entende isso e pede perdão por todos.',
    'A Primeira Nota, vencida, não ataca mais. Treme. Diante de Ømnia, lembre: ela não quer o fim de toda Canção. Quer, só uma vez, ser ouvida até o fim.',
  ] },
];
export const EPILOGUE = [
  'Cem criaturas, cem notas. Cada uma era um pedaço do que o mundo esqueceu.',
  'Ysmé, Lyss, Vael, Oren, Anketh, Aldren, Kael, Lira e Gorm desceram antes de você. Cada um tentou uma resposta.',
  'Você é o primeiro a descer lembrando de todos eles.',
  'Quando Ømnia cair, não haverá silêncio. Haverá, pela primeira vez, uma canção que inclui a primeira nota.',
];

export function chaptersUnlocked(found: Set<string>, stratum: number) {
  let n = 0; for (let i = stratum * 10; i < stratum * 10 + 10; i++) if (found.has(beastKey(i))) n++;
  return Math.floor(n / 2);
}
export const beastsFound = (found: Set<string>) => BEASTS.filter((b) => found.has(beastKey(b.id))).length;
