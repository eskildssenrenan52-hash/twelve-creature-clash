import type { World } from './world';
import { W, H, TS, T, SOLID, hash } from './world';
import { LEGACY_W, LEGACY_H, FRONTIER_GATES } from './frontier';

export interface Building { id: string; name: string; x: number; y: number; w: number; h: number; kind: 'home' | 'inn' | 'smith' | 'alchemy' | 'library' | 'ruin'; resident?: string; secret?: boolean; note: string }
export const BUILDINGS: Building[] = [
  { id: 'forge', name: 'Forja de Brunhild', x: 109, y: 119, w: 5, h: 4, kind: 'smith', resident: 'smith', note: 'O calor da forja nunca se apaga. Há um compartimento atrás das caixas.' },
  { id: 'lira', name: 'Ateliê de Lira', x: 130, y: 119, w: 5, h: 4, kind: 'alchemy', resident: 'alchemist', note: 'As flores azuis crescem perto de lugares onde a mana ainda é pura.' },
  { id: 'archive', name: 'Arquivo de Potos', x: 116, y: 112, w: 7, h: 5, kind: 'library', resident: 'elder', note: '“Sob a biblioteca, as raízes guardam o primeiro segredo. Examine a estante do fundo.”' },
  { id: 'inn', name: 'Pousada do Vagalume', x: 109, y: 130, w: 5, h: 4, kind: 'inn', note: 'Uma cama macia e uma refeição quente. Os viajantes contam sobre portais esquecidos.' },
  { id: 'pip', name: 'Empório do Pip', x: 131, y: 130, w: 5, h: 4, kind: 'home', resident: 'merchant', note: 'Pip esconde suas economias entre os vasos. Não conte a ninguém.' },
  { id: 'ranger', name: 'Cabana das Folhas', x: 51, y: 108, w: 5, h: 4, kind: 'home', resident: 'ranger', note: 'Siga os cogumelos luminosos para encontrar o Jardim Esquecido.' },
  { id: 'oasis', name: 'Refúgio das Areias', x: 201, y: 120, w: 6, h: 4, kind: 'inn', resident: 'nomad', note: 'A leste, a areia engoliu um templo. Sua entrada ainda respira luz.' },
  { id: 'monastery', name: 'Mosteiro da Aurora', x: 124, y: 34, w: 6, h: 5, kind: 'library', resident: 'hermit', note: 'O cristal azul aponta para a cripta. Nem tudo que dorme no gelo está morto.' },
  { id: 'bakery', name: 'Padaria Mel & Trigo', x: 107, y: 99, w: 5, h: 4, kind: 'home', note: 'Cheiro de pão quente. A padeira jura que o trigo das Campinas do Sol cresce mais doce.' },
  { id: 'weaver', name: 'Casa do Tecelão', x: 114, y: 99, w: 5, h: 4, kind: 'home', note: 'Teares cheios de fios coloridos. Um tapete ainda inacabado mostra um mapa do continente.' },
  { id: 'academy', name: 'Escola de Magia de Potos', x: 126, y: 99, w: 6, h: 4, kind: 'library', note: 'Monstros têm níveis fixos: cada bioma tem seu perigo, e cada espécie soma sua própria força.' },
  { id: 'watch', name: 'Torre da Guarda', x: 144, y: 101, w: 5, h: 4, kind: 'home', note: 'O capitão anota: “Planícies nível 1. Cavernas, nível 18. Obsidiana... só os tolos vão sem nível 30.”' },
  { id: 'tavern', name: 'Taverna do Javali Dourado', x: 92, y: 113, w: 6, h: 4, kind: 'inn', note: 'Música, risadas e sopa quente. Aqui todo aventureiro descansa.' },
  { id: 'armory', name: 'Armaria de Garrick', x: 92, y: 130, w: 6, h: 4, kind: 'smith', note: 'Espadas penduradas em fileiras. Garrick diz que minério de cristal faz as melhores lâminas.' },
  { id: 'herbalist', name: 'Herbanário da Vovó Fen', x: 94, y: 144, w: 5, h: 4, kind: 'alchemy', note: 'Potes de ervas secas até o teto. Um bilhete: “Ervas da geada curam o que o frio feriu.”' },
  { id: 'fishers', name: 'Casa dos Pescadores', x: 107, y: 144, w: 5, h: 4, kind: 'home', note: 'Redes, varas e histórias sobre peixes que brilham nos lagos da fronteira.' },
  { id: 'moss', name: 'Casa da Família Moss', x: 114, y: 144, w: 5, h: 4, kind: 'home', note: 'Desenhos de crianças nas paredes mostram o herói enfrentando um golem gigante.' },
  { id: 'cathedral', name: 'Catedral da Árvore de Mana', x: 126, y: 144, w: 8, h: 6, kind: 'library', note: 'Vitrais contam a história da Árvore de Mana e dos oito espíritos.' },
  { id: 'stable', name: 'Estábulo do Caravaneiro', x: 144, y: 113, w: 5, h: 4, kind: 'home', note: 'Caravanas partem daqui para as fronteiras. Feno, selas e mapas rabiscados.' },
  { id: 'garden', name: 'Jardim Esquecido', x: 30, y: 151, w: 5, h: 4, kind: 'ruin', secret: true, note: 'Entre raízes e estrelas, alguém ainda cuida deste jardim.' },
  { id: 'temple', name: 'Templo do Sol Afogado', x: 258, y: 156, w: 7, h: 5, kind: 'ruin', secret: true, note: 'O império caiu. A luz permaneceu.' },
  { id: 'crypt', name: 'Cripta da Aurora', x: 72, y: 23, w: 5, h: 4, kind: 'ruin', secret: true, note: 'Os guardiões gravaram seus nomes em cristais de gelo.' },
  { id: 'roots', name: 'Santuário das Raízes', x: 144, y: 190, w: 7, h: 5, kind: 'ruin', secret: true, note: 'A Árvore de Mana se estende muito além do que os olhos alcançam.' },
];
export const doorOf = (b: Building) => ({ tx: b.x + Math.floor(b.w / 2), ty: b.y + b.h - 1 });
export interface Treasure { id: string; tx: number; ty: number; gold: number; item: string; qty: number; name: string }
export const TREASURES: Treasure[] = [
  { id: 'village-well', tx: 127, ty: 136, gold: 25, item: 'potion', qty: 2, name: 'O presente do viajante' },
  ...Array.from({ length: 35 }, (_, i) => ({ id: `wild-${i}`, tx: 15 + Math.floor(hash(i, 7, 81) * (LEGACY_W - 35)), ty: 12 + Math.floor(hash(i, 3, 42) * (LEGACY_H - 30)), gold: 35 + i * 7, item: ['ether', 'hi_potion', 'mana_shard', 'crystal_ore', 'elixir'][i % 5], qty: i % 3 + 1, name: ['Cache dos peregrinos', 'Herança dos antigos', 'Relíquia entre raízes', 'Tesouro da lua', 'O segredo do explorador'][i % 5] })),
  ...FRONTIER_GATES.map((g,i)=>({id:`cache-${g.id}`,tx:g.tx+6,ty:g.ty+5,gold:75+i*15,item:'mana_shard',qty:3,name:`Relíquia: ${g.name}`})),
];
export const ROOM = { left: 106, top: 94, width: 27, height: 17, spawnX: 119 * TS + 8, spawnY: 108 * TS + 8, exitX: 119, exitY: 110 };
export function createInterior(b: Building): World {
  const tiles = new Uint8Array(W * H).fill(T.CWALL);
  const biomes = new Uint8Array(W * H).fill(b.kind === 'ruin' ? 3 : 0);
  for (let y = ROOM.top; y <= ROOM.exitY; y++) for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++) tiles[y * W + x] = y < ROOM.top + 2 ? T.PANEL : b.kind === 'ruin' ? T.CAVE : T.FLOOR;
  for (let x = ROOM.left; x < ROOM.left + ROOM.width; x++) tiles[ROOM.exitY * W + x] = x === ROOM.exitX ? T.DOOR : T.PANEL;
  for (let y = ROOM.top + 2; y < ROOM.exitY; y++) { tiles[y * W + ROOM.left] = T.PANEL; tiles[y * W + ROOM.left + ROOM.width - 1] = T.PANEL; }
  // Furniture collision, with clear walking lanes and an unobstructed exit.
  for (const [x,y,w,h] of [[108,96,4,2],[126,96,4,2],[114,101,4,2],[126,103,3,3]]) for (let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++) tiles[(y+dy)*W+x+dx]=T.FURNITURE;
  return { tiles, biomes, nodes: [] };
}
export function prepareExploration(world: World) {
  for (const b of BUILDINGS) {
    for(let y=b.y-2;y<=b.y+b.h+2;y++) for(let x=b.x-2;x<=b.x+b.w+2;x++) if(x>=0&&y>=0&&x<W&&y<H) world.tiles[y*W+x]=T.GRASS;
    for(let y=0;y<b.h;y++) for(let x=0;x<b.w;x++) world.tiles[(b.y+y)*W+b.x+x]=y<b.h-2?T.ROOF:T.WALL;
    const d=doorOf(b); world.tiles[d.ty*W+d.tx]=T.DOOR;
    for(let y=d.ty+1;y<d.ty+4;y++) world.tiles[y*W+d.tx]=T.PATH;
  }
  for(const t of TREASURES) for(let y=-1;y<=1;y++) for(let x=-1;x<=1;x++) { const i=(t.ty+y)*W+t.tx+x; if(SOLID.has(world.tiles[i])) world.tiles[i]=world.biomes[i]===3?T.CAVE:world.biomes[i]===4?T.SNOW:world.biomes[i]===2?T.SAND:T.GRASS; }
}
export function canClaimTreasure(opened: ReadonlySet<string>, id: string) { return !opened.has(id); }
