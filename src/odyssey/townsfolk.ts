// Povo do Mundo: mais de 200 moradores espalhados por todas as 30 regiões e por Potos.
// Cada morador tem uma história própria em 4 etapas, entrelaçada com vizinhos, com outras
// regiões e com o Abismo do Cântico. Tudo é gerado de forma determinística (testável).
import type { BossDef, EnemyKind, ItemDef, NpcDef, Palette, QuestDef, QuestGoal } from './data';
import { FRONTIER_GATES, type FrontierBiome } from './frontier';

export type FolkGoal = QuestGoal | { kind: 'talk'; npc: string; line: string } | { kind: 'floor'; n: number };
export type FolkQuest = Omit<QuestDef, 'goal'> & { goal: FolkGoal };
export type FolkNpc = NpcDef & { hub?: { tx: number; ty: number } | undefined };
export interface TownsfolkContext {
  biomeNames: Record<string, string>;
  biomeEnemies: Record<string, EnemyKind[]>;
  enemyNames: Record<string, string>;
  bosses: BossDef[];
  items: Record<string, ItemDef>;
  biomeLevel: Record<string, number>;
  frontierResource: Record<string, string>;
}

/* ───────────── Regiões ───────────── */
interface Region { key: string; hub: { tx: number; ty: number }; resource: string; frontier: boolean }
const LEGACY_REGIONS: Region[] = [
  { key: 'plains', hub: { tx: 122, ty: 160 }, resource: 'herb', frontier: false },
  { key: 'forest', hub: { tx: 46, ty: 110 }, resource: 'wood', frontier: false },
  { key: 'desert', hub: { tx: 196, ty: 124 }, resource: 'desert_rose', frontier: false },
  { key: 'mountain', hub: { tx: 118, ty: 38 }, resource: 'frost_herb', frontier: false },
  { key: 'cave', hub: { tx: 184, ty: 60 }, resource: 'crystal_ore', frontier: false },
  { key: 'meadow', hub: { tx: 140, ty: 202 }, resource: 'herb', frontier: false },
  { key: 'ruins', hub: { tx: 190, ty: 204 }, resource: 'stone', frontier: false },
  { key: 'volcanic', hub: { tx: 245, ty: 205 }, resource: 'coal', frontier: false },
  { key: 'coast', hub: { tx: 290, ty: 205 }, resource: 'copper_ore', frontier: false },
  { key: 'swamp', hub: { tx: 92, ty: 202 }, resource: 'goo', frontier: false },
  { key: 'jungle', hub: { tx: 48, ty: 202 }, resource: 'wood', frontier: false },
  { key: 'autumn', hub: { tx: 48, ty: 160 }, resource: 'wood', frontier: false },
  { key: 'mushroom', hub: { tx: 24, ty: 160 }, resource: 'goo', frontier: false },
];
/** Construções fora de Potos que nenhum morador pode ocupar. */
const AVOID = [[51, 108, 5, 4], [201, 120, 6, 4], [124, 34, 6, 5], [30, 151, 5, 4], [258, 156, 7, 5], [72, 23, 5, 4], [144, 190, 7, 5]];

/* ───────────── Nomes e ofícios ───────────── */
const FIRST = ['Aldo', 'Bryn', 'Cael', 'Dara', 'Elian', 'Fiora', 'Galen', 'Hesper', 'Ione', 'Jorah', 'Kaia', 'Lucan', 'Mira', 'Nilo', 'Orla', 'Perrin', 'Quill', 'Rhea', 'Soren', 'Talia', 'Ulric', 'Vesna', 'Wren', 'Xan', 'Ysolt', 'Zeno', 'Amara', 'Bento', 'Cora', 'Davi', 'Elba', 'Faro', 'Gema', 'Hugo', 'Iara', 'Joca', 'Kira', 'Lino', 'Maia', 'Nara', 'Otto', 'Pia', 'Rui', 'Sara', 'Tito', 'Uma', 'Vito', 'Yara', 'Zuri', 'Arin', 'Bela', 'Ciro', 'Dina', 'Enzo', 'Flor', 'Gil', 'Hana', 'Ivo', 'Lia', 'Mauro'];
const LAST = ['da Bruma', 'Pé-de-Vento', 'Cinzaluz', 'das Marés', 'Mão-de-Ferro', 'Folhaverde', 'do Poente', 'Sem-Sono', 'Brasa-Fria', 'das Dunas', 'Olho-de-Lua', 'Raiz-Funda', 'Canto-Baixo', 'do Farol', 'Pedra-Lisa', 'Vela-Rubra', 'das Cinzas', 'Nó-de-Pinho', 'Lume-Azul', 'Fio-de-Prata', 'Meia-Noite', 'do Orvalho', 'Asa-Parda', 'Passo-Leve'];
const JOBS = ['Tecelã de Redes', 'Pastor de Vagalumes', 'Afinadora de Sinos', 'Coveiro Poeta', 'Contadora de Histórias', 'Ferreiro Ambulante', 'Caçadora de Ecos', 'Herbalista', 'Mensageiro', 'Cartógrafa', 'Lenhador', 'Pescadora', 'Monge Errante', 'Mineiro', 'Oleira', 'Boticário', 'Guarda de Estrada', 'Peregrina', 'Apicultor', 'Vidraceira', 'Escriba', 'Caçador de Relíquias', 'Domadora de Feras', 'Bardo de Taverna', 'Fazendeira', 'Curandeiro', 'Sineira', 'Mercador de Especiarias', 'Astrônoma', 'Ladra Arrependida', 'Ex-Soldado', 'Viúva do Mar', 'Aprendiz de Alquimia', 'Guardião de Túmulos', 'Construtora de Pontes', 'Colecionador de Sons', 'Parteira', 'Cozinheiro de Estrada', 'Sentinela Aposentada', 'Desenhista de Mapas'];

/* ───────────── Sementes de história ───────────── */
// Cada semente tem quatro etapas. Marcadores: {place} região, {to} destinatário, {toPlace} região do destinatário,
// {item} recurso, {enemy} inimigo, {boss} chefe da região, {floor} andar do Abismo, {npc} o próprio morador.
type StepKind = 'talk' | 'collect' | 'kill' | 'finale';
interface Step { kind: StepKind; title: string; intro: string[]; desc: string; outro: string; reply?: string }
interface Seed { id: string; hook: string; steps: Step[] }
const SEEDS: Seed[] = [
  { id: 'letter', hook: 'Escrevo cartas que nunca envio. Talvez hoje seja diferente.', steps: [
    { kind: 'talk', title: 'A Carta Selada', intro: ['Tenho uma carta para {to}, em {toPlace}.', 'Há vinte anos não tenho coragem de entregá-la.'], desc: 'Entregue a carta de {npc} para {to} ({toPlace}).', reply: '{to}: Esta letra... eu conheço. Diga que eu li. Diga que eu ainda espero.', outro: 'Ela leu? Então ainda há tempo para nós dois.' },
    { kind: 'collect', title: 'Tinta que Não Desbota', intro: ['Vou responder, mas com tinta que dure mais que o meu medo.'], desc: 'Traga {n} {item} de {place} para a tinta.', outro: 'Escrevi três páginas. Rasguei duas. A terceira é verdade.' },
    { kind: 'kill', title: 'Estrada Limpa', intro: ['Vou atravessar o mundo para entregar a resposta em pessoa.', 'Mas os {enemy} tomaram a estrada.'], desc: 'Derrote {n} {enemy} na estrada de {place}.', outro: 'A estrada está livre. Meu coração, não. Ainda.' },
    { kind: 'finale', title: 'O Que o Silêncio Guardou', intro: ['Descobri por que nunca enviei a carta: o Silêncio a apagava toda noite.', 'A tinta vinha do Abismo sob Potos. Preciso de uma nota de lá.'], desc: '{finale}', outro: 'Com a nota, a tinta não some mais. Obrigado por me devolver a coragem.' },
  ] },
  { id: 'sibling', hook: 'Meu irmão desceu ao Abismo do Cântico. Nunca voltou.', steps: [
    { kind: 'kill', title: 'Rastros de Garras', intro: ['Os {enemy} carregam coisas brilhantes para os ninhos.', 'Talvez algo do meu irmão esteja lá.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Um botão de casaco. Azul. É dele.' },
    { kind: 'talk', title: 'O Último a Vê-lo', intro: ['Dizem que {to} viu meu irmão por último.', 'Vá até {toPlace}, por favor. Eu não consigo.'], desc: 'Pergunte a {to} ({toPlace}) sobre o irmão de {npc}.', reply: '{to}: Sim, ele passou por aqui. Disse que ouvia uma nota no fundo da terra, chamando o nome dele.', outro: 'Uma nota chamando... Ele sempre teve ouvido bom demais.' },
    { kind: 'collect', title: 'Lanterna para o Fundo', intro: ['Vou preparar uma lanterna que não apague no escuro sem eco.'], desc: 'Traga {n} {item} para a lanterna.', outro: 'Pronta. Mas quem vai carregá-la é você.' },
    { kind: 'finale', title: 'Desça Por Ele', intro: ['Leve a lanterna. Desça o quanto conseguir.', 'Se encontrar o nome dele gravado na parede, volte e me conte.'], desc: '{finale}', outro: 'O nome dele, riscado na pedra, e embaixo: “estou bem, ouço a Canção inteira”. Posso dormir de novo.' },
  ] },
  { id: 'debt', hook: 'Devo uma fortuna a alguém que já morreu. A dívida não morreu com ele.', steps: [
    { kind: 'collect', title: 'Pagamento em Espécie', intro: ['O cobrador aceita {item}. Ele diz que é para os herdeiros.'], desc: 'Traga {n} {item} de {place}.', outro: 'Paguei uma parte. O cobrador sorriu de um jeito estranho.' },
    { kind: 'talk', title: 'O Herdeiro Verdadeiro', intro: ['Descobri que o herdeiro real é {to}, de {toPlace}.', 'O cobrador é um impostor!'], desc: 'Avise {to} ({toPlace}) sobre o cobrador falso.', reply: '{to}: Herança? Eu nem sabia que ele me deixou algo. Diga a {npc} que a dívida está perdoada.', outro: 'Perdoada... Eu carreguei isso por quinze anos.' },
    { kind: 'kill', title: 'Os Capangas', intro: ['O impostor contratou {enemy}. Vieram buscar o resto.'], desc: 'Derrote {n} {enemy} enviados pelo cobrador.', outro: 'Eles fugiram. Mas o chefe deles ainda manda nesta região.' },
    { kind: 'finale', title: 'O Verdadeiro Credor', intro: ['O impostor trabalhava para algo maior.', 'Tudo que ele recolhia ia para o fundo da terra. Para alimentar o Silêncio.'], desc: '{finale}', outro: 'Sem quem os alimente, os cobradores somem como névoa. Estou livre.' },
  ] },
  { id: 'song', hook: 'Eu cantava no coro de Potos. Agora só sai ar.', steps: [
    { kind: 'kill', title: 'Notas Roubadas', intro: ['Os {enemy} engoliram minha voz. Juro, escuto ela dentro deles.'], desc: 'Derrote {n} {enemy} em {place} e liberte as notas.', outro: '♪ ...Lá. ♪ Uma nota só. Mas é minha.' },
    { kind: 'collect', title: 'Chá de Garganta', intro: ['Para a voz voltar inteira, preciso de um chá forte.'], desc: 'Traga {n} {item}.', outro: 'Melhor. Minha voz sai rouca, mas sai.' },
    { kind: 'talk', title: 'O Antigo Regente', intro: ['{to}, em {toPlace}, regia o coro antes do Silêncio.', 'Pergunte se ele ainda lembra da partitura.'], desc: 'Fale com {to} ({toPlace}) sobre a partitura perdida.', reply: '{to}: A partitura? Ela foi enterrada no Abismo junto com os Ecos que o Conselho escondeu.', outro: 'Enterrada no Abismo... claro. Tudo que dói acaba lá.' },
    { kind: 'finale', title: 'A Partitura do Fundo', intro: ['Se você descer, procure folhas de papel que cantam sozinhas.'], desc: '{finale}', outro: '♪ A canção inteira! ♪ Vou ensiná-la às crianças. Assim ela nunca mais se perde.' },
  ] },
  { id: 'curse', hook: 'Herdei um anel que sussurra. Não consigo tirá-lo.', steps: [
    { kind: 'collect', title: 'Óleo para Dedos Inchados', intro: ['Talvez com {item} o anel deslize.'], desc: 'Traga {n} {item}.', outro: 'Não saiu. E agora ele sussurra mais alto: “desça”.' },
    { kind: 'kill', title: 'O Anel Tem Fome', intro: ['O anel se acalma quando algo morre perto dele. Isso me assusta.', 'Mas se ele não comer, sou eu quem ele morde.'], desc: 'Derrote {n} {enemy} para saciar o anel.', outro: 'Ele dormiu. Por enquanto.' },
    { kind: 'talk', title: 'A Joalheira que Sabe', intro: ['{to} ({toPlace}) entende de joias amaldiçoadas.'], desc: 'Leve a descrição do anel até {to} ({toPlace}).', reply: '{to}: Esse anel foi forjado nas Forjas de Kaore, no Abismo. Ele quer voltar para casa.', outro: 'Para casa... Então é só devolvê-lo.' },
    { kind: 'finale', title: 'Devolver ao Fundo', intro: ['Leve o anel. Ele vai se soltar quando sentir o calor de casa.'], desc: '{finale}', outro: 'Meu dedo! Meu dedo livre! Pegue isto. É o mínimo.' },
  ] },
  { id: 'apprentice', hook: 'Quero ser aventureiro. Meus pais acham que é loucura.', steps: [
    { kind: 'kill', title: 'Primeira Caçada', intro: ['Me ensina? Vou só olhar, prometo.'], desc: 'Mostre como se faz: derrote {n} {enemy} em {place}.', outro: 'Uau! Anotei tudo. Bom, quase tudo. Você é rápido demais.' },
    { kind: 'collect', title: 'Equipamento de Iniciante', intro: ['Preciso de material para minha primeira armadura.'], desc: 'Traga {n} {item}.', outro: 'Ficou torta, mas é minha!' },
    { kind: 'talk', title: 'Uma Palavra aos Meus Pais', intro: ['Meu pai, {to}, mora em {toPlace}. Ele ouve você, não a mim.'], desc: 'Convença {to} ({toPlace}) de que {npc} tem talento.', reply: '{to}: Talento? ...Eu também quis ser aventureiro, sabe. Diga que tem minha bênção.', outro: 'Ele disse isso? Mesmo? Vou chorar. Não conta pra ninguém.' },
    { kind: 'finale', title: 'O Teste do Abismo', intro: ['Todo aventureiro de verdade já desceu ao Abismo.', 'Desça na frente. Me conte como é. Um dia eu vou também.'], desc: '{finale}', outro: 'Você voltou inteiro! Quando eu crescer, vou ser igual a você.' },
  ] },
  { id: 'memory', hook: 'Esqueço um rosto por dia. Hoje esqueci o da minha mãe.', steps: [
    { kind: 'talk', title: 'Quem Ela Era', intro: ['{to}, em {toPlace}, conheceu minha mãe.', 'Pergunte como ela era. Eu anoto antes que suma.'], desc: 'Pergunte a {to} ({toPlace}) sobre a mãe de {npc}.', reply: '{to}: Ela ria alto e cantava fora do tom. E sempre levava pão para quem chegava cansado.', outro: 'Ria alto... sim! Eu lembro agora. Por enquanto.' },
    { kind: 'collect', title: 'Ervas da Lembrança', intro: ['Um velho remédio segura memórias por mais tempo.'], desc: 'Traga {n} {item}.', outro: 'O chá ajudou. Mas o esquecimento vem de outro lugar.' },
    { kind: 'kill', title: 'Os Que Bebem Memórias', intro: ['Os {enemy} desta região ficam mais fortes quando alguém esquece.', 'Eles estão bebendo de mim.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Lembrei de três rostos de uma vez! Mas ainda sinto o puxão, lá de baixo.' },
    { kind: 'finale', title: 'A Raiz do Esquecimento', intro: ['O puxão vem do Abismo. Alguém lá embaixo coleciona lembranças.'], desc: '{finale}', outro: 'Todas voltaram. Todas. Até as que doem. Prefiro assim.' },
  ] },
  { id: 'feud', hook: 'Minha família e a de {to} brigam há três gerações. Ninguém lembra por quê.', steps: [
    { kind: 'talk', title: 'Uma Trégua', intro: ['Leve uma proposta de trégua a {to}, em {toPlace}.'], desc: 'Leve a proposta de {npc} até {to} ({toPlace}).', reply: '{to}: Trégua? ...Eu aceito. Na verdade, sempre quis aceitar.', outro: 'Aceitou? Depois de três gerações? Os avós vão se revirar.' },
    { kind: 'kill', title: 'O Pomo da Discórdia', intro: ['A briga começou por causa de um campo. Hoje ele está cheio de {enemy}.'], desc: 'Limpe o campo disputado: derrote {n} {enemy}.', outro: 'O campo está livre. Vamos dividi-lo. Meio a meio.' },
    { kind: 'collect', title: 'Banquete da Paz', intro: ['Paz se sela à mesa. Preciso de {item} para o banquete.'], desc: 'Traga {n} {item}.', outro: 'Comemos juntos. Rimos. Choramos. Descobrimos que somos primos.' },
    { kind: 'finale', title: 'A Verdadeira Causa', intro: ['Nos papéis antigos, a briga foi plantada por um forasteiro de manto cinza.', 'Ele semeava discórdia para que ninguém cantasse junto.'], desc: '{finale}', outro: 'Então era isso. O Silêncio nos queria separados. Não mais.' },
  ] },
  { id: 'relic', hook: 'Sou caçador de relíquias. A melhor de todas está no fundo da terra.', steps: [
    { kind: 'collect', title: 'Ferramentas de Escavação', intro: ['Primeiro, ferramentas. Boas ferramentas.'], desc: 'Traga {n} {item}.', outro: 'Com isso, abro qualquer selo. Quase qualquer.' },
    { kind: 'talk', title: 'O Mapa do Rival', intro: ['{to}, de {toPlace}, tem metade do mapa.', 'Somos rivais. Mas rivais podem negociar.'], desc: 'Negocie a metade do mapa com {to} ({toPlace}).', reply: '{to}: Metade do mapa? Dou, se ele dividir a glória. Diga que aceito sociedade.', outro: 'Sociedade! Que audácia. ...Aceito.' },
    { kind: 'kill', title: 'Guardiões da Entrada', intro: ['O mapa marca um ninho de {enemy} sobre a passagem.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'A passagem leva direto ao Abismo. Claro que leva.' },
    { kind: 'finale', title: 'A Relíquia Sem Nome', intro: ['A relíquia está em um andar profundo. Vá e veja se é verdade.'], desc: '{finale}', outro: 'Era uma caixinha de música. Toca uma nota que ninguém ouvia há mil anos. Valeu cada passo.' },
  ] },
  { id: 'healer', hook: 'Uma febre cinzenta se espalha. Os doentes param de sonhar.', steps: [
    { kind: 'collect', title: 'Remédio de Campo', intro: ['Preciso de {item} para os primeiros doentes.'], desc: 'Traga {n} {item}.', outro: 'Baixou a febre de dois. Os outros pioram.' },
    { kind: 'kill', title: 'Os Portadores', intro: ['A febre vem dos {enemy}. Os doentes foram arranhados por eles.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Menos portadores, menos febre. Mas a origem continua.' },
    { kind: 'talk', title: 'Segunda Opinião', intro: ['{to}, em {toPlace}, já viu uma febre assim.'], desc: 'Consulte {to} ({toPlace}) sobre a febre cinzenta.', reply: '{to}: Febre cinzenta é o Silêncio entrando pelo corpo. Só uma nota pura do Abismo cura.', outro: 'Uma nota pura... então é lá que preciso que você vá.' },
    { kind: 'finale', title: 'A Nota que Cura', intro: ['Desça e traga a nota pura. Os doentes esperam.'], desc: '{finale}', outro: 'Eles sonharam esta noite! Todos! Você salvou uma região inteira.' },
  ] },
  { id: 'lighthouse', hook: 'Cuido de um farol em terra firme. Ele aponta para baixo.', steps: [
    { kind: 'collect', title: 'Combustível de Luz', intro: ['O farol queima {item}. Está apagando.'], desc: 'Traga {n} {item}.', outro: 'Aceso. E a luz desce pelo chão, como raiz.' },
    { kind: 'kill', title: 'Mariposas da Sombra', intro: ['Os {enemy} atacam o farol à noite. Odeiam a luz.'], desc: 'Derrote {n} {enemy} perto do farol.', outro: 'Sossego. A luz desce mais fundo agora.' },
    { kind: 'talk', title: 'Quem Construiu', intro: ['{to}, de {toPlace}, sabe quem ergueu este farol.'], desc: 'Pergunte a {to} ({toPlace}) sobre o farol.', reply: '{to}: Foi Gorm, ainda jovem. Disse que era para Vael achar o caminho de volta.', outro: 'Para Vael... O farol nunca foi para navios. Era para um amigo.' },
    { kind: 'finale', title: 'Até Onde a Luz Vai', intro: ['A luz aponta para um andar específico do Abismo.', 'Siga-a por mim.'], desc: '{finale}', outro: 'Lá embaixo, um farol gêmeo, aceso há cem anos. Alguém respondia. Sempre respondeu.' },
  ] },
  { id: 'deserter', hook: 'Fugi da guarda do Conselho. Eles ainda me procuram.', steps: [
    { kind: 'kill', title: 'Caçadores de Desertores', intro: ['O Conselho morreu, mas seus cães não sabem.', 'Os {enemy} usam o brasão antigo.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Menos cães. Posso respirar um pouco.' },
    { kind: 'talk', title: 'Meu Antigo Capitão', intro: ['{to}, de {toPlace}, era meu capitão.', 'Preciso saber se ele me perdoa.'], desc: 'Fale com {to} ({toPlace}) por {npc}.', reply: '{to}: Perdoar? Ele fugiu porque se recusou a selar um inocente. Eu deveria ter fugido junto.', outro: 'Ele disse isso... Então eu não fui covarde.' },
    { kind: 'collect', title: 'Um Novo Uniforme', intro: ['Quero queimar o velho e vestir algo meu.'], desc: 'Traga {n} {item}.', outro: 'Pronto. Pela primeira vez, me reconheço no espelho.' },
    { kind: 'finale', title: 'As Ordens Seladas', intro: ['As ordens originais do Conselho estão no Abismo.', 'Elas provam o que fizeram com Vael. Encontre-as.'], desc: '{finale}', outro: 'Está tudo aqui. Assinado. O mundo vai saber.' },
  ] },
  { id: 'twins', hook: 'Tenho uma irmã gêmea que só existe nos espelhos.', steps: [
    { kind: 'collect', title: 'Polir o Espelho', intro: ['Com {item} o espelho fica nítido e ela fala mais claro.'], desc: 'Traga {n} {item}.', outro: 'Ela disse “oi”. Ela nunca tinha dito “oi”.' },
    { kind: 'talk', title: 'O Outro Espelho', intro: ['Ela diz que existe outro espelho, com {to}, em {toPlace}.'], desc: 'Procure {to} ({toPlace}) e o espelho gêmeo.', reply: '{to}: Este espelho? Às vezes aparece uma moça nele, dizendo um nome... {npc}.', outro: 'Ela me procura também! Dos dois lados!' },
    { kind: 'kill', title: 'Os Reflexos Famintos', intro: ['Os {enemy} quebram espelhos. Eles não podem quebrar o meu.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'O espelho está seguro. Ela está sorrindo.' },
    { kind: 'finale', title: 'O Espelho do Fundo', intro: ['Ela diz que está presa num espelho no Abismo.', 'Desça. Quebre o vidro por dentro.'], desc: '{finale}', outro: 'Ela... está aqui. Do meu lado. Real. Não sei como agradecer.' },
  ] },
  { id: 'baker', hook: 'Asso pão para o mundo todo. Hoje o fermento não cresce.', steps: [
    { kind: 'collect', title: 'Farinha de Viagem', intro: ['Preciso de {item}. O moinho daqui parou.'], desc: 'Traga {n} {item}.', outro: 'Cheiroso! Mas ainda não cresce direito.' },
    { kind: 'talk', title: 'Fermento Antigo', intro: ['{to}, em {toPlace}, guarda um fermento de cem anos.'], desc: 'Peça a {to} ({toPlace}) um pouco do fermento antigo.', reply: '{to}: Fermento de cem anos? Leve. Ele cresce melhor quando alguém canta.', outro: 'Quando alguém canta... então era isso! Ninguém canta mais na cozinha.' },
    { kind: 'kill', title: 'Ratos do Celeiro', intro: ['Os {enemy} estão comendo meus grãos!'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'O celeiro está salvo. E eu canto enquanto amasso.' },
    { kind: 'finale', title: 'O Pão do Abismo', intro: ['Quero assar um pão para os que lutam lá embaixo.', 'Leve uma cesta até o fundo e veja se alguém come.'], desc: '{finale}', outro: 'Comeram? Fantasmas comendo pão? ...Que bom. Ninguém deveria ter fome, nem os mortos.' },
  ] },
  { id: 'astronomer', hook: 'Conto estrelas. Uma delas está caindo há cem anos, devagar.', steps: [
    { kind: 'kill', title: 'Noite Limpa', intro: ['Os {enemy} fazem barulho demais. Preciso de silêncio bom para observar.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Agora vejo. A estrela não cai para o céu. Cai para dentro da terra.' },
    { kind: 'collect', title: 'Lentes de Cristal', intro: ['Minhas lentes rachadas não alcançam tão fundo.'], desc: 'Traga {n} {item}.', outro: 'Novas lentes. A estrela tem forma de nota musical!' },
    { kind: 'talk', title: 'Cálculos Cruzados', intro: ['{to}, em {toPlace}, observa a mesma estrela.', 'Compare os cálculos comigo.'], desc: 'Leve os cálculos de {npc} para {to} ({toPlace}).', reply: '{to}: Os números batem. A estrela vai tocar o fundo do Abismo. Quando tocar, a Canção termina ou recomeça.', outro: 'Termina ou recomeça... depende de quem estiver lá.' },
    { kind: 'finale', title: 'Onde a Estrela Cai', intro: ['Esteja lá quando ela tocar o fundo. Por favor.'], desc: '{finale}', outro: 'Recomeçou. Eu vi daqui. A estrela subiu de volta, cantando.' },
  ] },
  { id: 'gardener', hook: 'Plantei uma semente da Árvore de Mana. Ela cresce para baixo.', steps: [
    { kind: 'collect', title: 'Adubo Mágico', intro: ['Preciso de {item} para fortalecer a muda.'], desc: 'Traga {n} {item}.', outro: 'Ela cresceu um palmo. Para baixo, de novo.' },
    { kind: 'kill', title: 'Pragas de Raiz', intro: ['Os {enemy} roem as raízes à noite.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'As raízes estão a salvo. E escutei: elas cantam.' },
    { kind: 'talk', title: 'A Velha Jardineira', intro: ['{to}, em {toPlace}, cuidou da Árvore quando eu era criança.'], desc: 'Pergunte a {to} ({toPlace}) sobre árvores que crescem para baixo.', reply: '{to}: Ela procura o Abismo. As raízes da Árvore de Mana vão até lá. Sempre foram.', outro: 'Então minha muda quer encontrar a mãe dela, lá embaixo.' },
    { kind: 'finale', title: 'Raízes Até o Fundo', intro: ['Desça e veja se as raízes se encontraram.'], desc: '{finale}', outro: 'Se encontraram. A muda floresceu esta manhã. Flores azuis, como as da Árvore.' },
  ] },
  { id: 'mimic_hunter', hook: 'Um Baú Falso engoliu minha mochila. Com minha casa dentro. É uma longa história.', steps: [
    { kind: 'kill', title: 'Mordidas de Madeira', intro: ['Os {enemy} daqui viraram isca dos baús falsos.', 'Corte o suprimento deles e os baús ficam sozinhos.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Pronto. Agora os baús falsos vão ter que caçar sozinhos.' },
    { kind: 'collect', title: 'Cadeado de Mentira', intro: ['Vou forjar um cadeado falso para trocar pelo meu.', 'O Baú Falso não resiste a uma fechadura brilhante.'], desc: 'Traga {n} {item} para o cadeado-isca.', outro: 'Brilha que é uma beleza. Até eu abriria.' },
    { kind: 'talk', title: 'O Especialista em Baús', intro: ['{to}, de {toPlace}, já foi engolido três vezes.', 'Pergunte como ele escapou.'], desc: 'Pergunte a {to} ({toPlace}) como escapar de um Baú Falso.', reply: '{to}: Três vezes, sim. O segredo é cócegas na dobradiça esquerda. Eles riem e abrem.', outro: 'Cócegas na dobradiça... genial. Vou anotar.' },
    { kind: 'finale', title: 'A Mochila no Fundo', intro: ['O Baú que me engoliu fugiu para o Abismo.', 'Dizem que baús falsos descem lá para digerir em paz.'], desc: '{finale}', outro: 'Minha mochila! Minha casa! Cheira a estômago de baú, mas é minha!' },
  ] },
  { id: 'storm_diary', hook: 'Encontrei o diário de um caçador de tempestades. A última página está em branco.', steps: [
    { kind: 'collect', title: 'Tinta de Raio', intro: ['O diário só aceita tinta feita de {item}.', 'Papel comum queima com o que ele escrevia.'], desc: 'Traga {n} {item}.', outro: 'A tinta faisca no frasco. Ele escrevia com tempestade engarrafada.' },
    { kind: 'talk', title: 'O Discípulo', intro: ['{to}, em {toPlace}, foi discípulo do caçador.', 'Talvez saiba por que a última página ficou em branco.'], desc: 'Fale com {to} ({toPlace}) sobre o diário.', reply: '{to}: Ele dizia que a última página só se escreve no olho da maior tempestade. Ou no fundo da terra. Ele não sabia qual.', outro: 'No fundo da terra... até as tempestades caem para lá?' },
    { kind: 'kill', title: 'Nuvens com Dentes', intro: ['Os {enemy} se alimentam da eletricidade que sobra das nuvens.', 'Sem eles, consigo ler as anotações sem levar choque.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'O ar parou de estalar. Consigo ler: “a tempestade maior não está no céu”.' },
    { kind: 'finale', title: 'A Última Página', intro: ['A última página espera no Abismo.', 'Desça e escreva o fim da história dele.'], desc: '{finale}', outro: 'A página se escreveu sozinha quando você desceu: “a tempestade maior era o Silêncio. E alguém a venceu”.' },
  ] },
  { id: 'glass_blower', hook: 'Sopro vidro. Minha melhor peça foi um peixe que nadou para longe.', steps: [
    { kind: 'collect', title: 'Areia Fina', intro: ['Vidro bom nasce de {item} bem escolhido.'], desc: 'Traga {n} {item}.', outro: 'Areia perfeita. O forno já ronrona.' },
    { kind: 'kill', title: 'Olhos na Forja', intro: ['Os {enemy} ficam hipnotizados pelo brilho do vidro quente.', 'E derrubam tudo.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'A forja está em paz. Soprei três peixes novos só hoje.' },
    { kind: 'talk', title: 'O Peixe Fugitivo', intro: ['{to}, de {toPlace}, jurou ter visto meu peixe de vidro.', 'Nadando. Num rio. De verdade.'], desc: 'Pergunte a {to} ({toPlace}) sobre o peixe de vidro.', reply: '{to}: Vi sim! Ele nadava contra a correnteza, brilhando. Descia o rio em direção ao mar... ou ao buraco onde o mar some.', outro: 'Ele está vivo. Meu peixe está vivo e foi para o fundo de tudo.' },
    { kind: 'finale', title: 'O Aquário do Abismo', intro: ['Se o peixe desceu ao Abismo, talvez tenha encontrado o Mar de Vidro.', 'Desça e procure um brilho que nada.'], desc: '{finale}', outro: 'Ele tem uma família agora? Peixinhos de vidro?! ...Deixe-os lá. Algumas obras de arte merecem liberdade.' },
  ] },
  { id: 'bell_tower', hook: 'O sino da minha torre não toca há dez anos. Ele se recusa.', steps: [
    { kind: 'kill', title: 'Ninhos no Campanário', intro: ['Os {enemy} fizeram ninho no campanário.', 'O sino não toca com medo de machucar os filhotes. Ele é gentil assim.'], desc: 'Derrote {n} {enemy} perto da torre.', outro: 'Realoquei os ninhos no telhado da capela. O sino agradeceu com um... quase-toque.' },
    { kind: 'collect', title: 'Corda Nova', intro: ['A corda apodreceu de tanto esperar.'], desc: 'Traga {n} {item} para a corda nova.', outro: 'Corda firme. Mas o sino ainda emperra no meio do balanço.' },
    { kind: 'talk', title: 'O Último Sineiro', intro: ['{to}, em {toPlace}, foi o último sineiro antes de mim.', 'Pergunte por que o sino se calou.'], desc: 'Pergunte a {to} ({toPlace}) sobre o sino calado.', reply: '{to}: O sino tocou no dia em que o Conselho selou Vael. Tocou sozinho, de luto. Nunca mais quis tocar para um mundo que faz aquilo.', outro: 'De luto... O sino tem mais coração que muita gente.' },
    { kind: 'finale', title: 'Um Motivo para Tocar', intro: ['O sino só volta a tocar por um motivo grande.', 'Desça ao Abismo e traga uma nota verdadeira. O sino vai ouvir.'], desc: '{finale}', outro: 'TOCOU! A vila inteira ouviu! Dez anos de silêncio, quebrados por você!' },
  ] },
  { id: 'puppeteer', hook: 'Faço teatro de marionetes. Uma delas começou a escrever as próprias falas.', steps: [
    { kind: 'collect', title: 'Cordas de Marionete', intro: ['Preciso de {item} para as cordas novas.', 'As velhas... ela cortou sozinha.'], desc: 'Traga {n} {item}.', outro: 'Cordas novas. Ela olhou para elas e... sorriu? Marionetes não sorriem.' },
    { kind: 'talk', title: 'O Bonequeiro Ancião', intro: ['{to}, de {toPlace}, fez marionetes a vida inteira.', 'Pergunte se isso já aconteceu com ele.'], desc: 'Fale com {to} ({toPlace}) sobre a marionete que escreve.', reply: '{to}: Aconteceu uma vez. A marionete escrevia coisas que aconteceram de verdade, no fundo da terra. Queimei a minha. Você deveria ouvir a sua.', outro: 'Ouvir... ela escreveu ontem: “o escuro lá embaixo tem plateia”.' },
    { kind: 'kill', title: 'Plateia Indesejada', intro: ['Os {enemy} invadem as apresentações.', 'A marionete diz que eles não vêm pelo teatro. Vêm por ela.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Ela escreveu um agradecimento. E um aviso: “eles mandaram os pequenos primeiro”.' },
    { kind: 'finale', title: 'A Última Apresentação', intro: ['Ela quer fazer uma apresentação no Abismo.', 'Para a plateia que espera lá embaixo. Leve-a.'], desc: '{finale}', outro: 'Ela se apresentou e voltou em paz. A última fala que escreveu: “agora posso ser só madeira”. Obrigado.' },
  ] },
  { id: 'cartographer2', hook: 'Desenho mapas de lugares que não existem. Ontem, um deles apareceu.', steps: [
    { kind: 'kill', title: 'Bússola Enlouquecida', intro: ['Minha bússola enlouqueceu perto dos {enemy}.', 'Eles mascaram o norte. Limpe a área.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'A bússola voltou a apontar... para baixo. Sempre para baixo.' },
    { kind: 'collect', title: 'Papel que Não Mente', intro: ['Mapas de lugares novos exigem papel especial.'], desc: 'Traga {n} {item}.', outro: 'Papel perfeito. Já desenhei três vales que juro não existir. Ainda.' },
    { kind: 'talk', title: 'A Rival Cartógrafa', intro: ['{to}, em {toPlace}, também desenha lugares que não existem.', 'Compare nossos mapas.'], desc: 'Compare mapas com {to} ({toPlace}).', reply: '{to}: Nossos mapas se encaixam! Os lugares que ele desenha são os que eu não consigo ver. Juntos, temos o mapa de um mundo inteiro... escondido.', outro: 'Um mundo escondido, desenhado por duas pessoas que nunca saíram de casa. Onde será que ele fica?' },
    { kind: 'finale', title: 'O Mapa Completo', intro: ['O mapa aponta para o Abismo. Claro que aponta.', 'Desça e confira se o que desenhamos existe.'], desc: '{finale}', outro: 'Existe. Tudo existe. Nós não inventamos nada — nós lembramos. De onde, eu não sei.' },
  ] },
  { id: 'lantern_keeper', hook: 'Coleciono lanternas apagadas. Cada uma pertenceu a alguém que desceu.', steps: [
    { kind: 'collect', title: 'Óleo de Vagalume', intro: ['Lanternas antigas só acendem com {item}.'], desc: 'Traga {n} {item}.', outro: 'Três lanternas acesas! Os nomes dos donos aparecem no vidro quando acendem.' },
    { kind: 'talk', title: 'A Lista dos que Desceram', intro: ['{to}, de {toPlace}, guarda a lista de todos que desceram ao Abismo.', 'Quero cruzar com os nomes das lanternas.'], desc: 'Peça a lista a {to} ({toPlace}).', reply: '{to}: A lista é longa e triste. Mas olhe: alguns nomes estão riscados. Riscados por quem voltou. Poucos. Mas voltaram.', outro: 'Alguns voltaram... Então há esperança para os donos das minhas lanternas.' },
    { kind: 'kill', title: 'Apagadores de Luz', intro: ['Os {enemy} apagam lanternas. É o que eles fazem.', 'Minhas lanternas acesas estão em perigo.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'Nenhuma lanterna se apagou esta noite. Primeira vez em anos.' },
    { kind: 'finale', title: 'Acender no Fundo', intro: ['Leve a lanterna mais antiga ao Abismo.', 'Se o dono dela ainda estiver lá embaixo, ela vai guiá-lo para casa.'], desc: '{finale}', outro: 'A lanterna ficou lá, acesa, apontando para cima. Se alguém a seguir... vai encontrar o caminho de volta.' },
  ] },
  { id: 'dream_weaver', hook: 'Teço cobertores que dão bons sonhos. Ultimamente, eles dão pesadelos.', steps: [
    { kind: 'kill', title: 'Fiapos Corrompidos', intro: ['Os {enemy} sujam meu tear com fiapos cinzentos.', 'É deles que vêm os pesadelos.'], desc: 'Derrote {n} {enemy} em {place}.', outro: 'O tear está limpo. Teci um cobertor de teste: sonhei com chuva de pétalas.' },
    { kind: 'collect', title: 'Lã de Ovelha da Lua', intro: ['A melhor lã vem de ovelhas que pastam sob a lua.', 'Preciso de {item} para a trama.'], desc: 'Traga {n} {item}.', outro: 'Lã macia como nuvem. Os cobertores já cheiram a sono bom.' },
    { kind: 'talk', title: 'A Avó que Sonha Acordada', intro: ['{to}, em {toPlace}, sonha acordada desde menina.', 'Ela pode saber de onde vêm os pesadelos.'], desc: 'Consulte {to} ({toPlace}) sobre os pesadelos.', reply: '{to}: Pesadelos não nascem, são fabricados. Alguém no fundo da terra tece o avesso dos sonhos. Um tear gigante, de teias cinzentas.', outro: 'Um tear de pesadelos no Abismo... alguém precisa desmanchá-lo.' },
    { kind: 'finale', title: 'O Tear do Avesso', intro: ['Desça e desfaça o tear de pesadelos.', 'Leve esta agulha. Ela desmancha qualquer trama.'], desc: '{finale}', outro: 'Os cobertores voltaram a dar bons sonhos. A vila inteira dormiu bem esta noite. Até eu.' },
  ] },
];

/* ───────────── Arautos de região (o 7º morador) ───────────── */
const HERALD_TITLES = ['Arauto', 'Guardiã do Selo', 'Sentinela do Eco', 'Vidente', 'Custódio'];

const PALETTE_POOL = {
  skin: ['#f0c8a0', '#e0a880', '#c89070', '#a87048', '#f4dcc4', '#d8a070', '#8a5a3a'],
  hair: ['#202020', '#5a3020', '#c04020', '#f0e080', '#e8e8e8', '#2a2a40', '#40a060', '#d06030', '#8040a0'],
  body: ['#3a5a8a', '#8a2a5a', '#2a6a2a', '#d0b080', '#5a4030', '#6a3a9a', '#2a7a8a', '#a03030', '#c09030', '#406070'],
  legs: ['#202838', '#3a1a2a', '#1a3a1a', '#806040', '#302018', '#3a2050', '#1a4050', '#602020'],
  accent: ['#ffd040', '#60f0ff', '#c78bff', '#ff7ae0', '#ff6a20', '#80ff90'],
};
function h32(a: number, b: number) { let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; return (x >>> 0); }
const pick = <T,>(arr: readonly T[], a: number, b: number): T => arr[h32(a, b) % arr.length]!;

function fill(s: string, v: Record<string, string>) { return s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? `{${k}}`); }

export interface Townsfolk { npcs: FolkNpc[]; quests: FolkQuest[]; heralds: string[]; choirQuest: string }

export function buildTownsfolk(ctx: TownsfolkContext): Townsfolk {
  const regions: Region[] = [
    ...LEGACY_REGIONS,
    ...FRONTIER_GATES.map(g => ({ key: g.biome as string, hub: { tx: g.tx, ty: g.ty + 2 }, resource: ctx.frontierResource[g.biome] ?? 'stone', frontier: true })),
  ];
  const npcs: FolkNpc[] = [], quests: FolkQuest[] = [], heralds: string[] = [];
  const used = new Set<string>();
  const nameFor = (i: number) => {
    for (let k = 0; ; k++) { const n = `${pick(FIRST, i, 3 + k)} ${pick(LAST, i, 7 + k * 5)}`; if (!used.has(n)) { used.add(n); return n; } }
  };
  const pal = (i: number): Palette => ({ skin: pick(PALETTE_POOL.skin, i, 11), hair: pick(PALETTE_POOL.hair, i, 12), body: pick(PALETTE_POOL.body, i, 13), legs: pick(PALETTE_POOL.legs, i, 14), accent: pick(PALETTE_POOL.accent, i, 15) });
  const bossOf = (key: string) => ctx.bosses.find(b => b.biome === key && (b.id === `${key}_boss` || !b.id.includes('_boss')));
  const placeName = (key: string) => ctx.biomeNames[key] ?? key;

  // 1) Posições: 7 moradores por região, em anel ao redor do ponto central, ligados por trilhas.
  type Slot = { id: string; region: Region; idx: number; tx: number; ty: number; hub?: { tx: number; ty: number } };
  const slots: Slot[] = [];
  regions.forEach((rg, ri) => {
    const boss = bossOf(rg.key);
    for (let k = 0, tries = 0; k < 7 && tries < 80; tries++) {
      const a = (h32(ri, tries) % 360) * Math.PI / 180, d = 7 + (h32(ri + 99, tries) % 16);
      const tx = Math.round(rg.hub.tx + Math.cos(a) * d), ty = Math.round(rg.hub.ty + Math.sin(a) * d * 0.8);
      if (boss && Math.hypot(boss.tx - tx, boss.ty - ty) < 12) continue;
      if (AVOID.some(([x, y, w, h]) => tx >= x! - 3 && tx <= x! + w! + 3 && ty >= y! - 3 && ty <= y! + h! + 3)) continue;
      if (!rg.frontier && Math.hypot(tx - 122, ty - 126) < 40 && rg.key !== 'plains') continue;
      if (rg.key === 'plains' && Math.hypot(tx - 122, ty - 126) < 37) continue;
      if (slots.some(s => Math.hypot(s.tx - tx, s.ty - ty) < 4)) continue;
      slots.push({ id: `folk_${rg.key}_${k}`, region: rg, idx: k, tx, ty, hub: rg.hub }); k++;
    }
  });
  // Moradores extras dentro das ruas de Potos.
  const POTOS: [number, number][] = [[88, 126], [96, 126], [150, 126], [156, 126], [103, 118], [103, 134], [140, 118], [110, 108], [132, 108], [150, 108], [96, 140], [114, 140], [150, 140], [122, 100]];
  const potos: Region = { key: 'plains', hub: { tx: 122, ty: 126 }, resource: 'herb', frontier: false };
  POTOS.forEach(([tx, ty], k) => slots.push({ id: `folk_potos_${k}`, region: potos, idx: 100 + k, tx, ty }));

  const regionName = (s: Slot) => s.id.startsWith('folk_potos') ? 'Vila de Potos' : placeName(s.region.key);
  slots.forEach((s, i) => {
    const herald = s.idx === 6;
    const name = nameFor(i), job = herald ? `${pick(HERALD_TITLES, i, 21)} de ${regionName(s)}` : pick(JOBS, i, 22);
    const seed = SEEDS[h32(i, 31) % SEEDS.length]!;
    npcs.push({ id: s.id, name, title: job, tx: s.tx, ty: s.ty, pal: pal(i), hub: s.hub,
      lines: [fill(seed.hook, { to: '' }).replace(' e a de ', ' e outra '), `Moro em ${regionName(s)} desde que a Canção ainda soava.`, herald ? 'Os sete de cada região guardam um pedaço do Selo do Abismo.' : 'Dizem que sob Potos há cem andares de escuridão. E algo no fundo.'] });
  });

  // 2) Missões: cada morador recebe 4 etapas; vizinhos e regiões distantes se entrelaçam.
  const byRegion = new Map<string, Slot[]>();
  for (const s of slots) { const k = s.id.startsWith('folk_potos') ? 'potos' : s.region.key; byRegion.set(k, [...(byRegion.get(k) ?? []), s]); }
  const npcById = new Map(npcs.map(n => [n.id, n]));
  slots.forEach((s, i) => {
    const npc = npcById.get(s.id)!;
    const seed = SEEDS[h32(i, 31) % SEEDS.length]!;
    const key = s.region.key, lvl = s.id.startsWith('folk_potos') ? 3 + (i % 12) : (ctx.biomeLevel[key] ?? 5);
    const enemies = ctx.biomeEnemies[key] ?? ['goblin'];
    const enemy = enemies[h32(i, 41) % enemies.length]!;
    // Destinatário: alterna entre vizinho da mesma região e alguém do outro lado do mundo.
    const target = h32(i, 51) % 3 === 0 ? slots[(i + 1 + (h32(i, 53) % 6)) % slots.length]! : slots[(i + 17 + (h32(i, 52) % 40)) % slots.length]!;
    const to = npcById.get(target.id === s.id ? slots[(i + 1) % slots.length]!.id : target.id)!;
    const toSlot = slots.find(x => x.id === to.id)!;
    const floor = Math.max(3, Math.min(95, Math.round(lvl * 2.2 + (h32(i, 61) % 9))));
    const boss = bossOf(key);
    const useBoss = !!boss && h32(i, 71) % 3 === 0;
    const vars: Record<string, string> = {
      npc: npc.name, to: to.name, toPlace: regionName(toSlot), place: regionName(s), item: ctx.items[s.region.resource]?.name ?? s.region.resource,
      enemy: ctx.enemyNames[enemy] ?? enemy, boss: boss?.name ?? '', floor: String(floor),
    };
    const rewardItems = lvl < 8 ? ['potion', 'ether', 'herb_amulet', 'copper_ring'] : lvl < 16 ? ['hi_potion', 'mana_ring', 'wolf_ring', 'ether'] : lvl < 25 ? ['elixir', 'sun_amulet', 'hi_potion'] : ['elixir', 'eco_shard', 'hi_potion'];
    const prev = byRegion.get(s.id.startsWith('folk_potos') ? 'potos' : key)!;
    const myPos = prev.indexOf(s);
    const neighbour = myPos > 0 ? prev[myPos - 1] : undefined;
    seed.steps.forEach((st, k) => {
      const id = `${s.id}_${k + 1}`;
      let goal: FolkGoal, n = 0;
      if (st.kind === 'talk') goal = { kind: 'talk', npc: to.id, line: fill(st.reply ?? '', vars) };
      else if (st.kind === 'collect') { n = 4 + (h32(i, k) % 6) + Math.floor(lvl / 6); goal = { kind: 'collect', item: s.region.resource, n }; }
      else if (st.kind === 'kill') { n = 5 + (h32(i, k + 9) % 6) + Math.floor(lvl / 5); goal = { kind: 'kill', target: enemy, n }; }
      else goal = useBoss && boss ? { kind: 'boss', target: boss.id } : { kind: 'floor', n: floor };
      const finale = goal.kind === 'boss' ? `Derrote ${boss?.name} em ${vars['place']}.` : `Alcance o andar ${floor} do Abismo do Cântico (entrada em Potos).`;
      const v = { ...vars, n: String(n), finale };
      const requiresAll = k === 2 && neighbour ? [`${neighbour.id}_2`] : undefined;
      quests.push({
        id, giver: s.id, main: false, title: fill(st.title, v), desc: fill(st.desc, v), intro: st.intro.map(l => fill(l, v)), outro: fill(st.outro, v),
        goal, ...(k ? { requires: `${s.id}_${k}` } : {}), ...(requiresAll ? { requiresAll } : {}),
        reward: { xp: Math.round((40 + lvl * lvl * 3) * (1 + k * 0.6)), gold: Math.round((20 + lvl * 8) * (1 + k * 0.5)), ...(k === 3 ? { items: [rewardItems[h32(i, 81) % rewardItems.length]!, 'hi_potion'] } : k === 1 ? { items: ['potion'] } : {}) },
      });
    });
  });

  // 3) Selos regionais: o arauto de cada região reúne as histórias dos vizinhos.
  for (const [key, list] of byRegion) {
    if (key === 'potos') continue;
    const herald = list.find(s => s.idx === 6) ?? list[list.length - 1]!;
    const others = list.filter(s => s !== herald);
    const lvl = ctx.biomeLevel[key] ?? 5, place = placeName(key);
    const floor = Math.max(10, Math.min(99, Math.round(lvl * 3)));
    const id = `${herald.id}_seal`;
    heralds.push(id);
    quests.push({
      id, giver: herald.id, main: false, title: `O Selo de ${place}`, requires: `${herald.id}_4`, requiresAll: others.map(o => `${o.id}_4`),
      intro: [`Os sete moradores de ${place} guardam, sem saber, um fragmento do Selo do Abismo.`, 'Cada história que você resolveu aqui reacendeu uma linha do Selo.', `Falta o último traço: descer ao andar ${floor} e tocar a pedra com a luz de ${place}.`],
      desc: `Com as histórias de ${place} resolvidas, alcance o andar ${floor} do Abismo do Cântico.`,
      outro: `O Selo de ${place} brilha. No fundo do Abismo, algo enorme acordou e sabe o seu nome.`,
      goal: { kind: 'floor', n: floor }, reward: { xp: Math.round(800 + lvl * lvl * 20), gold: 300 + lvl * 40, items: ['elixir', 'eco_shard'] },
    });
  }
  // 4) O Coro dos Trinta: a Regente do Coro em Potos reúne todos os Selos e aponta para Ømnia.
  const choirNpc: FolkNpc = { id: 'folk_choir', name: 'Regente Ilyra', title: 'Maestra do Coro dos Trinta', tx: 128, ty: 140, pal: { skin: '#f4dcc4', hair: '#e8e8e8', body: '#3a2a6a', legs: '#1a1430', accent: '#ffd040' },
    lines: ['Trinta regiões, trinta selos, uma única Canção.', 'Quando todos os selos brilharem, o Coro poderá cantar contra o que dorme no fundo.', 'Ouça os moradores. Toda história pequena é uma nota da grande.'] };
  npcs.push(choirNpc);
  const choirQuest = 'folk_choir_1';
  quests.push({
    id: choirQuest, giver: 'folk_choir', main: false, title: 'O Coro dos Trinta', requiresAll: heralds,
    intro: ['Você reacendeu os trinta Selos. O Coro está pronto.', 'Mas o Coro não basta. No andar 100 do Abismo, Ømnia, a Nota que Engoliu o Mundo, aguarda.', 'Vael tentou calá-la. Gorm tentou cantá-la. Você terá de vencê-la.'],
    desc: 'Desça ao andar 100 do Abismo do Cântico e derrote Ømnia, a Nota que Engoliu o Mundo.',
    outro: 'O Coro dos Trinta canta e, pela primeira vez em mil anos, o Abismo responde com música. Você é a última nota da Canção.',
    goal: { kind: 'boss', target: 'abyss_100' }, reward: { xp: 200000, gold: 30000, items: ['choir_halo', 'elixir', 'elixir'] },
  });
  return { npcs, quests, heralds, choirQuest };
}
export type { FrontierBiome };
