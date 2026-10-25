// Crônicas extras da campanha: mais cenas por região, contadas em três camadas.
// "fragmento" (missão _2): o que o Eco lembra; "rumor" (_4): as vozes do povo;
// "santuario" (_6): o diário de Vael encontrado no santuário reconstruído.
// Dado puro, sem dependências de runtime, para que story.ts junte tudo em BEATS.
import type { FrontierBiome } from './frontier';

export interface ChronicleBeat { id: string; trigger: string; title: string; lines: string[] }
type Trio = { fragmento: string[]; rumor: string[]; santuario: string[] };

const C: Record<FrontierBiome, Trio> = {
  sunflower: {
    fragmento: ['O trigo reunido canta baixinho nas suas mãos.', 'Dona Marta escuta: — É a canção da colheita. Minha avó cantava isso pra chamar a chuva.', 'Por um instante, você vê um campo dourado sem fim, e dois meninos correndo nele.'],
    rumor: ['Os lavradores contam que os espantalhos andam à noite.', '— Não fazem mal — diz um deles. — Só ficam olhando para Potos, como quem espera alguém voltar.', 'Um deles carrega um chapéu de palha pequeno demais para ele.'],
    santuario: ['No santuário da Colheita, uma página do diário de Vael, presa sob uma pedra:', '“Hoje Gorm me ensinou a assobiar com uma folha de trigo. Eu errei mil vezes.”', '“Ele disse que a Canção não liga para notas erradas. Só para quem continua tentando.”', 'A letra é de criança. O papel tem cem anos.'] },
  sakura: {
    fragmento: ['A madeira ancestral range como uma porta antiga.', 'Haruki encosta o ouvido no tronco: — Ela está contando quantas primaveras perdeu.', '— Cento e duas. Ela se lembra de cada uma que não aconteceu.'],
    rumor: ['Os aldeões dizem que as pétalas, ao subir, formam um rosto no céu.', 'É o rosto de uma mulher sorrindo. Ninguém sabe quem é.', 'Haruki sabe, mas não diz. Apenas acende um incenso.'],
    santuario: ['Diário de Vael, página dois:', '“Mamãe ficou doente quando as cerejeiras floresceram. Ela disse que era bonito ir embora na primavera.”', '“Eu ouvi a nota dela se apagando. Ninguém mais ouviu. Só eu.”', '“Por que a Árvore me deu esse ouvido, se não me deu um jeito de consertar?”'] },
  coral: {
    fragmento: ['As rosas do deserto, molhadas, soltam uma nota grave como uma baleia.', 'Nerina fecha os olhos: — O mar está tentando lembrar o próprio fundo.', 'Lá embaixo, algo enorme se mexe pela primeira vez em décadas.'],
    rumor: ['Pescadores juram ter visto um farol aceso em alto-mar, onde não existe farol.', '— É o farol que o aprendiz construiu — diz uma velha. — Feito de luz, sem pedra.', '— Ele fez para os barcos que nunca voltaram. Para eles acharem o caminho.'],
    santuario: ['Diário de Vael, página três, manchada de sal:', '“Contei 40.312 ondas esta noite. Cada uma é um adeus da praia.”', '“Gorm veio me buscar. Disse que eu não preciso contar tudo sozinho.”', '“Eu menti. Disse que estava bem. A Canção ouviu a mentira, e guardou.”'] },
  lavender: {
    fragmento: ['As ervas destiladas exalam um aroma impossível: o de uma casa que não existe mais.', 'Lavínia cai de joelhos: — É o cheiro do orfanato de Lira. Foi demolido antes de eu nascer.', 'O Eco do Aroma lembra até do que ninguém viveu.'],
    rumor: ['As irmãs do convento falam de um menino que vinha toda semana comprar lavanda.', '— Ele colocava os ramos na janela de uma casa vazia, em Potos.', '— Dizia que era para a mãe não esquecer o caminho de volta.'],
    santuario: ['Diário de Vael, página quatro:', '“Gorm me deu um frasco de lavanda. Disse que quando a dor for alta demais, é só cheirar e lembrar de hoje.”', '“Hoje foi um dia bom. Fugimos da aula e ficamos rindo no campo.”', 'O frasco está ao lado da página. Ainda tem perfume.'] },
  lotus: {
    fragmento: ['As flores da lua flutuam no lago e cada uma reflete um céu diferente.', 'Bhuvan aponta: — Esse é o céu de cem anos atrás. Repare: a Árvore tinha o dobro de folhas.', '— O Silêncio não tirou só som. Tirou tamanho do mundo.'],
    rumor: ['Os monges dizem que o lago às vezes fica completamente cinza.', 'Quando isso acontece, um homem aparece na margem e põe as mãos na água.', '— Ele não está calando o lago — sussurra um noviço. — Está tentando aquecê-lo.'],
    santuario: ['Diário de Vael, página cinco, escrita com tinta trêmula:', '“Toquei a água do lago e a nota parou. Só por um momento. E doeu menos.”', '“Se eu consigo calar uma nota... consigo calar todas?”', '“Não. Não posso pensar nisso. Gorm ficaria triste.”'] },
  oasis: {
    fragmento: ['A quitina reunida brilha como se tivesse estrelas dentro.', 'Zahra conta: — Dez. Onze. Doze... As estrelas estão voltando para quem as procura.', 'No céu, uma constelação nova se forma: um arco, apontado para o norte.'],
    rumor: ['Caravanas contam sobre uma lâmpada enterrada sob a maior duna.', '— Quem a esfrega ouve uma voz pedindo desculpas — diz o mercador. — Por ter obedecido.', 'O djinn, ao que parece, se arrepende do desejo que realizou.'],
    santuario: ['Diário de Vael, página seis. A letra já é de adulto:', '“O djinn me perguntou o que eu mais queria. Eu disse: não ouvir mais nenhum adeus.”', '“Ele arrancou meu eco. Agora ninguém ouve os meus passos. Nem eu.”', '“Gorm me chamou três vezes antes de perceber que eu estava ao lado dele.”'] },
  moonwood: {
    fragmento: ['As flores da lua, juntas, acendem uma trilha prateada.', 'Selene segue a trilha com os olhos: — Vai até o túmulo. Sempre vai até o túmulo.', 'Sobre a lápide, alguém deixou um frasco vazio de lavanda.'],
    rumor: ['Os caçadores evitam a clareira do túmulo à meia-noite.', '— Não por medo — explica um deles. — Por respeito. Tem alguém ali que precisa ficar sozinho.', '— Às vezes ele canta. Sem som. Mas as corujas param pra escutar.'],
    santuario: ['Diário de Vael, página sete:', '“Visitei mamãe. Contei que o Conselho quer me selar. Que acham que eu ouço demais.”', '“Ela não respondeu, claro. Mas a lua brilhou mais forte. Gosto de pensar que foi ela.”'] },
  bamboo: {
    fragmento: ['A madeira reunida vibra quando o vento passa: virou uma flauta gigante.', 'Mestre Ren sopra uma vez, e o bosque inteiro responde em coro.', '— O Sopro lembra de tudo que já soprou — diz ele. — Inclusive de um voto.'],
    rumor: ['Os noviços contam que Gorm treinou aqui na juventude.', '— Era o pior aluno de meditação — ri Ren. — Não conseguia ficar parado. Sempre queria ir buscar alguém.', '— Um dia ele foi buscar, e não voltou o mesmo.'],
    santuario: ['Diário de Vael, página oito:', '“O Conselho votou. Gorm foi o único contra. Ele gritou tão alto que o bambu se curvou.”', '“Não adiantou. Mas eu nunca vou esquecer que ele gritou.”', '“Mesmo quando eu esquecer todo o resto.”'] },
  mangrove: {
    fragmento: ['Os esporos se juntam e formam um mapa vivo das raízes.', 'Tomás traça uma rota com o dedo: — Esse caminho leva para fora do mundo conhecido.', '— Foi o caminho que Gorm preparou para os dois fugirem. Ninguém nunca usou.'],
    rumor: ['Barqueiros falam de um segundo remo, sempre molhado, no barco abandonado.', '— Alguém rema nele à noite — diz uma menina. — Até o meio do mangue. E depois volta.', '— Como se não tivesse coragem de ir até o fim.'],
    santuario: ['Diário de Vael, página nove:', '“Gorm me deu um barco. Disse: vamos embora, só nós dois, longe da Árvore.”', '“Mas se eu for, quem vai ouvir as notas que doem? Elas vão ficar sozinhas.”', '“Fiquei. Escolhi ficar. Ele chorou. Eu não consegui, já não tinha eco pra isso.”'] },
  amber: {
    fragmento: ['O minério reunido derrete num âmbar morno.', 'Karum o ergue contra o sol: dentro, um instante preso, Gorm segurando a mão de Vael.', '— Esse foi o último segundo em que os dois estiveram juntos — diz ele, baixinho.'],
    rumor: ['Os mineiros encontram, às vezes, âmbares com uma pena cinza dentro.', '— Dá sorte — diz um. — Dá azar — diz outro.', 'Karum guarda todos numa caixa. Diz que um dia vai devolvê-los ao dono.'],
    santuario: ['Diário de Vael, página dez, rasgada ao meio:', '“Amanhã é o selamento. Escrevo pra não esquecer: eu amei este mundo.”', '“Amei tanto que não aguentei ouvir ele se despedindo de si mesmo, todos os dias.”', 'A outra metade da página nunca foi encontrada.'] },
  crimson: {
    fragmento: ['As peles de lobo aquecem um velho altar e as folhas no ar se ajeitam em fila.', 'Ayame lê a fila de folhas como um verso: “Quem fica, também vai embora um pouco.”', 'É a caligrafia de Gorm.'],
    rumor: ['Contam que Garmr não nasceu fera: era o cão de dois meninos de Potos.', '— Ficou esperando eles voltarem do Conselho — diz Ayame. — Um voltou. O outro, não.', '— Ele esperou tanto que virou lobo de tanto uivar.'],
    santuario: ['Diário de Vael, página onze, escrita depois do selamento:', '“Acordei sem som, no fundo das fendas. O Conselho achou que eu ia dormir para sempre.”', '“Mas eu ainda ouço tudo. Só que agora, quando eu toco uma nota, ela se apaga.”', '“Eu virei o que eles temiam. Fui eu que deixei.”'] },
  prism: {
    fragmento: ['Os cristais de mana se alinham e projetam sete sombras de você.', 'A Lapidária reconhece cada uma: — Heróis dos ciclos anteriores. Todos chegaram até aqui.', '— E todos pararam diante de Vael. Nenhum o deixou terminar a frase.'],
    rumor: ['Viajantes dizem que o campo de cristais mostra a pessoa que você seria sem dor.', '— Eu vi uma versão de mim que nunca chorou — conta um guerreiro. — Ela parecia vazia.', '— Preferi a minha.'],
    santuario: ['Diário de Vael, página doze:', '“Outro herói veio hoje. Arco dourado, olhos cansados. Igual aos outros.”', '“Ela me atacou antes que eu falasse. A Canção recomeçou. De novo. De novo.”', '“Será que algum dia alguém vai só... perguntar?”'] },
  aurora: {
    fragmento: ['As ervas gélidas soltam vapor verde que sobe até o céu.', 'A aurora o recebe e desenha uma cena: uma mulher ninando um menino de cabelo claro.', 'Skadi tira o gorro: — A canção de ninar. É a mesma que eu cantava para os meus filhos.'],
    rumor: ['Na tundra dizem que, nas noites de aurora, uma voz cantarola sem som.', '— Dá pra ver — explica uma criança. — As luzes se mexem no ritmo, mesmo sem música.', '— É alguém que esqueceu como cantar, mas lembra da melodia.'],
    santuario: ['Diário de Vael, página treze:', '“Calei a aurora. Me arrependi no mesmo instante. Era a canção dela.”', '“Tentei desfazer. Não sei mais fazer nada soar. Só apagar.”', '“Se você está lendo isso, herói: por favor, devolva a cor ao céu.”'] },
  spores: {
    fragmento: ['Os fragmentos de mana acordam a rede de fungos, e milhões de vozes falam juntas.', '— ELE NÃO É MAU — diz a rede. — ELE É SÓ. SÓ É PIOR QUE MAU.', 'Brumo anota tudo, emocionado: — Nunca ouvi a floresta ter uma opinião.'],
    rumor: ['Brumo jura que a rede tem saudade de alguém.', '— Ela repete um padrão: dois pontos de luz que se aproximam e depois se separam.', '— Repete há cem anos. Como uma criança desenhando a mesma coisa.'],
    santuario: ['Diário de Vael, página catorze:', '“Os fungos me mostraram meu plano por inteiro. Calar o último Eco. Acabar com toda dor.”', '“Eles me perguntaram: e a alegria? Eu fingi que não ouvi.”', '“Já fiz isso antes. Com o Conselho. Agora entendo como eles se sentiram.”'] },
  marble: {
    fragmento: ['As pedras reunidas se encaixam numa estátua sem rosto.', 'Cássia passa a mão na base: “Vael, Guardião da Escuta. Selado pelo bem de todos.”', 'Embaixo, arranhado com faca, um acréscimo: “Mentira. — G.”'],
    rumor: ['Os estudiosos de Lumina debatem há décadas se o Conselho estava certo.', '— Um ouvinte que sofre por todos — diz um. — Era um preço justo.', 'Cássia responde sem levantar os olhos: — Justo para quem não pagava.'],
    santuario: ['Diário de Vael, página quinze:', '“Visitei o salão do Conselho. Todas as estátuas viraram as costas para mim.”', '“Menos a de Gorm. Ele não tem estátua. Recusou.”', '“Disse que só aceitaria uma quando a minha também tivesse rosto.”'] },
  thunder: {
    fragmento: ['Os lingotes de ferro atraem os raios e cada trovão traz uma palavra.', '“VAEL.” “VOLTA.” “EU.” “ESTOU.” “AQUI.”', 'Brontes, pálido: — É o grito de Gorm. O planalto guardou por cem anos.'],
    rumor: ['Os vigias contam que um velho subia o planalto toda tempestade.', '— Gritava um nome até perder a voz — diz Brontes. — Depois descia, sem falar com ninguém.', '— Parou de vir quando ficou velho demais. Mas o trovão continuou gritando por ele.'],
    santuario: ['Diário de Vael, página dezesseis:', '“Ouvi um trovão chamando meu nome. Era a voz de Gorm, de cem anos atrás.”', '“Corri até o pico, mas lá só tinha o eco. Eu não tenho eco para responder.”', '“Então escrevi aqui, onde ele talvez leia: eu ouvi. Eu sempre ouvi.”'] },
  obsidian: {
    fragmento: ['Os cristais refletem a obsidiana, e o espelho negro mostra você no lugar de Vael.', 'Nox se aproxima: — A Árvore escolheu você para ouvir tudo também. Você sente?', 'Você sente. Mil despedidas ao mesmo tempo. E, no meio delas, mil reencontros.'],
    rumor: ['Nox conta que Vael construiu um jardim no fundo das fendas.', '— Com flores de pedra — diz ela. — Pedra não murcha. Pedra não se despede.', '— É o lugar mais triste que eu já vi. E o mais cuidado.'],
    santuario: ['Diário de Vael, última página:', '“Se você chegou até aqui, herói, você ouviu tudo que eu ouvi.”', '“Não vou pedir que me perdoe. Vou pedir só uma coisa: quando a gente lutar, me deixe terminar a frase.”', '“E diga a Gorm... diga que eu nunca esqueci primeiro. Menti sobre isso também.”'] },
};

const ACT1: ChronicleBeat[] = [
  { id: 'c_m1', trigger: 'quest:m1', title: 'O Medalhão de Gorm', lines: ['Gorm guarda a recompensa e, por um instante, segura um medalhão gasto no pescoço.', 'Dentro, um desenho a carvão: dois meninos, uma Árvore, e uma nota musical riscada.', '— Coisas de velho — ele diz, guardando depressa. — Vá, a Árvore está esperando.'] },
];

const FINALE: ChronicleBeat[] = [
  { id: 'c_f1', trigger: 'quest:f1', title: 'O Coro dos Dezessete', lines: ['Os dezessete Vigias chegam a Potos, um a um, cada um trazendo a nota da sua terra.', 'Dona Marta, Haruki, Nerina, Zahra, Skadi, Nox... todos de mãos dadas em volta da Árvore.', 'Gorm ergue os braços. Pela primeira vez em cem anos, o Coro canta completo.', 'E, no horizonte das fendas, uma figura de cinza se levanta para ouvir.'] },
  { id: 'c_f2', trigger: 'quest:f2', title: 'A Última Sombra', lines: ['A trigésima sombra cai e não some: ela fala, com a voz de Vael criança.', '— Por que vocês cantam, se dói?', 'Você responde o que Gorm respondeu, cem anos atrás: — Porque o silêncio dói mais.', 'A sombra sorri, pela primeira vez, e se apaga. O caminho até as Fendas está aberto.'] },
  { id: 'c_f4', trigger: 'quest:f4', title: 'Duas Estátuas', lines: ['Semanas depois, Potos inaugura duas estátuas lado a lado sob a Árvore.', 'Uma de Gorm. Outra de Vael. As duas com rosto.', 'Na base, uma única frase: “Ninguém deve ouvir sozinho.”', 'E, nas noites claras, dá para ouvir dois velhos amigos assobiando com folhas de trigo.'] },
];

export const CHRONICLE_BEATS: ChronicleBeat[] = [
  ...ACT1,
  ...(Object.entries(C) as [FrontierBiome, Trio][]).flatMap(([b, tr]) => [
    { id: `frag_${b}`, trigger: `quest:${b}_2`, title: 'Fragmento do Eco', lines: tr.fragmento },
    { id: `rumor_${b}`, trigger: `quest:${b}_4`, title: 'O que o povo conta', lines: tr.rumor },
    { id: `diario_${b}`, trigger: `quest:${b}_6`, title: 'Diário de Vael', lines: tr.santuario },
  ]),
  ...FINALE,
];
