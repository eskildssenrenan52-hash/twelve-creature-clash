// Mobília, segredos e a história escondida nas profundezas (Abismo do Cântico e Templos Profundos).
import propsSheet from '@/assets/art/dungeon-props.png';
import type { Game } from './engine';
import type { NpcDef } from './data';
import type { DungeonFloor } from './dungeon';
import { TS } from './world';

/** Índices na folha dungeon-props: sarcófago, altar, estante, esqueleto, estátua, fonte, braseiro, tábua. */
export type PropKind = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface DepthProp { kind: PropKind; tx: number; ty: number; id: string; page?: number }
const SIZE: Record<PropKind, number> = { 0: 30, 1: 36, 2: 34, 3: 28, 4: 36, 5: 36, 6: 26, 7: 30 };

/** A Crônica do Cântico Perdido: 30 páginas espalhadas pelos andares, contadas na ordem em que foram escritas. */
export const CHRONICLE: string[] = [
  'I. No começo, a Árvore de Mana não falava: cantava. Cada folha era uma sílaba, cada raiz uma nota grave que segurava a terra.',
  'II. Os primeiros povos aprenderam a ouvir. Chamaram de Cântico aquilo que fazia o rio correr e o fogo lembrar de esquentar.',
  'III. Dezessete notas sustentavam tudo. Os sábios as chamaram de Ecos e as guardaram em templos, um para cada canto do mundo.',
  'IV. Formou-se o Conselho dos Trinta, um guardião para cada bioma. Juraram jamais cantar sozinhos: o Cântico pertence a todos.',
  'V. Vael era o mais jovem do Conselho, e o único que ouvia uma décima oitava nota. Ninguém mais conseguia escutá-la.',
  'VI. “Ela está embaixo”, dizia Vael. “Abaixo das raízes. Uma nota que canta o contrário.” O Conselho riu. Depois, parou de rir.',
  'VII. Os anões de Pedra-Negra cavaram em busca da nota. Kael, o mais hábil, construiu forjas que ardiam com o calor do fundo.',
  'VIII. A cada andar escavado, o mundo lá em cima ficava um pouco mais quieto. Os pássaros erravam a melodia. Ninguém ligou os fatos.',
  'IX. No andar trinta, o Conselho julgou Vael por heresia e o selou numa sala de mármore. O juiz Sentenor jogou fora a chave.',
  'X. Mas Vael não estava errado. A nota existia. E agora, sem ninguém para ouvi-la, ela começou a ouvir a si mesma.',
  'XI. Chamaram aquilo de Silêncio. Não era ausência de som: era um som que devorava os outros. Começou pelas canções de ninar.',
  'XII. Kael Pedra-Negra traiu o próprio irmão para alimentar as forjas com o Silêncio. Acreditava que poderia forjar uma nova Canção.',
  'XIII. O que ele forjou foi o Colosso. E depois, o próprio corpo, fundido ao metal. Os anões fecharam as forjas por fora e choraram.',
  'XIV. A Bibliotecária do andar oitenta copiou cada nome do mundo antes que o Silêncio os apagasse. Para caber todos, apagou o seu.',
  'XV. Um império inteiro desceu com as areias. O faraó Anketh preferiu dormir mil anos a ouvir o seu povo calar.',
  'XVI. Nos lagos que não refletem, Morgwyn cresceu bebendo os ecos afogados. Ela não é má: só está com sede de som.',
  'XVII. O homem de manto cinza apareceu pela primeira vez neste ponto da história. Ninguém sabe de onde veio. Ele não deixa pegadas.',
  'XVIII. Ele visitou cada templo e tocou cada Eco com a ponta dos dedos. Os Ecos rachavam, mas não quebravam. Ainda não.',
  'XIX. A Cantora sem nome desceu ao Abismo com uma harpa e nenhuma luz. Cantou em cada andar para que o caminho não esquecesse.',
  'XX. Onde ela chorou, nasceram fontes. Dizem que a água ainda cura quem carrega uma pergunta honesta.',
  'XXI. Suas estátuas foram esculpidas depois, por quem a seguiu. Todas choram. Ninguém esculpiu lágrimas: elas apareceram sozinhas.',
  'XXII. Os braseiros azuis queimam com o fogo que ela acendeu. Não consomem lenha. Consomem a escuridão, um pouco por vez.',
  'XXIII. Os sarcófagos guardam os que desceram antes de você. Alguns levaram tesouros. Todos levaram arrependimento.',
  'XXIV. A Cantora chegou ao fundo, ao andar cem. Lá encontrou Vael — ou o que sobrou dele. O Silêncio tinha um rosto agora.',
  'XXV. Vael tinha se tornado Ømnia: tudo e nada, a nota que canta o contrário. Ela ofereceu a ele a última estrofe do Cântico.',
  'XXVI. Ømnia aceitou e se partiu ao meio. Metade dormiu. A outra metade esperou alguém com coragem de terminar a canção.',
  'XXVII. A Cantora não voltou. Seu último verso foi gravado nas tábuas douradas: “Quem ouvir isto, desça cantando.”',
  'XXVIII. Cem anos depois, a Árvore de Mana vibrou pela primeira vez. Alguém chegou a Potos com passos que faziam som.',
  'XXIX. Você. O Cântico não escolhe heróis. Ele escolhe ouvidos. E você ouviu cada página até aqui.',
  'XXX. O verdadeiro nome da Cantora é o mesmo da décima oitava nota: Lírien. Diga-o diante de Ømnia, e ele lembrará quem era.',
];
const HINTS = [
  'Um diário na estante: “Contei os passos entre as tochas. Há um sarcófago que ninguém abriu neste andar.”',
  'Anotações rabiscadas: “A Cantora deixou páginas em cada andar. Recolha todas e o nome dela aparece.”',
  'Um livro de cânticos: “Toque o altar e ele devolve a nota que você esqueceu.”',
  'Um mapa rasgado mostra fontes marcadas com lágrimas. Ao lado: “bebe, que cura”.',
  'Um tomo sobre o Conselho dos Trinta. Metade das páginas foi arrancada com cuidado.',
  'Um bestiário: “Os guardiões não odeiam você. Eles só não lembram mais de outra coisa.”',
];
const TEMPLE_LINES: Record<string, string> = {
  forest: 'Gravado na raiz: “Aqui a Árvore deixou crescer o primeiro Eco. Raízes também cantam, só que devagar.”',
  desert: 'Hieróglifos: “O império afundou de pé, cantando. Nenhum soldado largou a lança.”',
  ice: 'Escrito no gelo: “O frio guarda as notas como guarda a carne: inteiras, mas imóveis.”',
  fire: 'Marcas de martelo: “Kael jurou aqui que forjaria uma Canção melhor. O metal ainda lembra.”',
  crystal: 'Riscado no cristal: “Cada pedra brilhante é uma nota roubada. Ilumine e ela devolve um pouco.”',
  water: 'Musgo formando letras: “A água sussurra os nomes dos afogados. Escute antes de beber.”',
  marble: 'Inscrição real: “Aos deuses que esquecemos — vocês ainda vigiam, e nós ainda pedimos perdão.”',
  mushroom: 'Esporos desenham: “Tudo o que morre aqui vira memória. Tudo o que é memória vira fungo.”',
};

const SCRIBE: NpcDef = { id: 'chronicle', name: 'Crônica do Cântico', title: 'Página perdida', tx: 0, ty: 0, pal: { skin: '#e8d8b0', hair: '#c8a060', body: '#806040', legs: '#403020', accent: '#ffd070' }, lines: [] };

function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const cache = new WeakMap<DungeonFloor, DepthProp[]>();
const used = new WeakMap<DungeonFloor, Set<string>>();

const prefixOf = (g: Game) => g.depth!.kind === 'abyss' ? `abyss${g.depth!.floor}` : g.depth!.temple!.id;

/** Distribui os objetos pelas salas, sempre encostados na parede de cima, longe das escadas e dos baús. */
export function propsFor(g: Game): DepthProp[] {
  const d = g.depth!, data = d.data; const hit = cache.get(data); if (hit) return hit;
  const pre = prefixOf(g), r = rng(data.floor * 3301 + pre.length * 97 + (d.temple ? d.temple.tx : 0));
  const out: DepthProp[] = [], taken = new Set<string>();
  const free = (x: number, y: number) => !taken.has(`${x},${y}`) && !data.chests.some((c) => Math.abs(c.tx - x) < 2 && Math.abs(c.ty - y) < 2)
    && Math.hypot(data.start.tx - x, data.start.ty - y) > 3 && Math.hypot(data.stairs.tx - x, data.stairs.ty - y) > 3;
  const put = (kind: PropKind, room: { x: number; y: number; w: number; h: number }, extra: Partial<DepthProp> = {}) => {
    for (let tries = 0; tries < 8; tries++) {
      const x = room.x + 1 + Math.floor(r() * Math.max(1, room.w - 2)), y = room.y;
      if (!free(x, y)) continue;
      for (let k = -1; k <= 1; k++) taken.add(`${x + k},${y}`);
      out.push({ kind, tx: x, ty: y, id: `${pre}-p${out.length}`, ...extra }); return true;
    }
    return false;
  };
  const rooms = data.rooms;
  rooms.forEach((room, i) => {
    if (room.w < 6) return;
    if (i % 2 === 0) { const a = { ...room, w: 3 }, b = { ...room, x: room.x + room.w - 3, w: 3 }; put(6, a); put(6, b); }
    const roll = r();
    if (roll < .18) put(2, room); else if (roll < .3) put(4, room); else if (roll < .38) put(5, room); else if (roll < .46) put(1, room); else if (roll < .52) put(3, room);
  });
  // Uma página da Crônica por andar; os templos guardam uma inscrição própria.
  const page = d.kind === 'abyss' ? (data.floor - 1) % CHRONICLE.length : -1;
  if (rooms.length > 1) put(page >= 0 && data.floor % 2 ? 3 : 7, rooms[Math.floor(rooms.length / 2)]!, { page });
  // Sarcófago secreto: um a cada três andares e em todo templo.
  if ((d.kind === 'temple' || data.floor % 3 === 0) && rooms.length > 2) put(0, rooms[rooms.length - 2]!);
  cache.set(data, out); return out;
}

let sheet: HTMLImageElement | null = null;
function art() { if (!sheet && typeof Image !== 'undefined') { sheet = new Image(); sheet.src = propsSheet; } return sheet; }

export function drawDepthProps(g: Game, c: CanvasRenderingContext2D, draws: { y: number; f: () => void }[], x0: number, y0: number, x1: number, y1: number, wt: number) {
  const img = art(); if (!img || !img.complete || !img.naturalWidth || !g.depth) return;
  for (const p of propsFor(g)) {
    if (p.tx < x0 - 2 || p.tx > x1 + 2 || p.ty < y0 - 2 || p.ty > y1 + 3) continue;
    const s = SIZE[p.kind], x = p.tx * TS + 8, y = p.ty * TS + 18;
    draws.push({ y: y - 2, f: () => {
      c.save(); c.globalAlpha = .35; c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y - 1, s * .36, s * .12, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      const bob = p.kind === 6 ? Math.sin(wt * 2 + p.tx) * .4 : 0;
      c.drawImage(img, p.kind * 128, 0, 128, 128, Math.round(x - s / 2), Math.round(y - s + bob), s, s);
      const read = g.discoveries.has(p.id) || (p.page !== undefined && p.page >= 0 && g.discoveries.has(`page_${p.page}`));
      if ((p.kind === 3 || p.kind === 7 || p.kind === 0) && !read && !g.openedChests.has(p.id)) {
        c.globalAlpha = .55 + Math.sin(wt * 4 + p.tx) * .35; c.fillStyle = '#ffe9a0'; c.fillRect(x - 1, y - s - 5 + Math.sin(wt * 3) * 1.5, 2, 2);
      }
      c.restore();
    } });
  }
  // Poeira luminosa flutuando na escuridão.
  draws.push({ y: 1e9, f: () => {
    c.save(); c.fillStyle = g.depth?.data.theme.color ?? '#c8b8ff';
    for (let i = 0; i < 26; i++) {
      const px = (x0 + ((i * 53.7 + wt * 6) % (x1 - x0 + 1))) * TS, py = (y0 + ((i * 31.3 + Math.sin(wt * .5 + i) * 3) % (y1 - y0 + 1))) * TS;
      c.globalAlpha = .12 + Math.sin(wt * 1.3 + i) * .1; c.fillRect(px, py, i % 4 ? 1 : 2, i % 4 ? 1 : 2);
    }
    c.restore();
  } });
}

/** Luz própria de braseiros, fontes, altares e tábuas douradas. */
export function propLights(g: Game, hole: (x: number, y: number, r: number, a?: number) => void, glows: { x: number; y: number; r: number; col: string }[], wt: number) {
  if (!g.depth) return;
  for (const p of propsFor(g)) {
    const x = p.tx * TS + 8, y = p.ty * TS + 6, f = Math.sin(wt * 6 + p.tx) * 3;
    if (p.kind === 6) { hole(x, y, 58 + f, .9); glows.push({ x, y: y - 4, r: 30, col: 'rgba(90,160,255,0.35)' }); }
    else if (p.kind === 5) { hole(x, y, 42, .75); glows.push({ x, y, r: 26, col: 'rgba(80,200,255,0.3)' }); }
    else if (p.kind === 1) { hole(x, y, 36, .7); glows.push({ x, y, r: 22, col: 'rgba(80,255,220,0.28)' }); }
    else if (p.kind === 7) { hole(x, y, 24, .55); glows.push({ x, y, r: 16, col: 'rgba(255,210,100,0.3)' }); }
  }
}

const pagesFound = (g: Game) => CHRONICLE.reduce((n, _, i) => n + (g.discoveries.has(`page_${i}`) ? 1 : 0), 0);

/** Interação com os objetos. Retorna o texto do aviso; com run=true executa. */
export function propAction(g: Game, run: boolean): string {
  if (!g.depth) return '';
  const d = g.depth, data = d.data, fresh = used.get(data) ?? new Set<string>(); used.set(data, fresh);
  for (const p of propsFor(g)) {
    if (Math.hypot(g.p.x - p.tx * TS - 8, g.p.y - (p.ty + 1) * TS - 4) > 20) continue;
    switch (p.kind) {
      case 0: {
        if (run) g.claimChest(p.id, 80 + data.floor * 25, data.floor > 60 ? 'elixir' : data.floor > 25 ? 'hi_potion' : 'ether', 2, 'Sarcófago esquecido');
        return g.openedChests.has(p.id) ? 'Sarcófago vazio' : 'E · Abrir o sarcófago';
      }
      case 1: {
        if (run) {
          if (fresh.has(p.id)) g.toast('O altar ainda vibra com a nota que você tocou.');
          else { fresh.add(p.id); g.p.mp = g.maxMp(); g.toast('🎵 Uma nota esquecida volta para você. MP restaurado.', '#80ffe0'); if (!g.discoveries.has(p.id)) { g.discoveries.add(p.id); g.addItem('mana_shard', 1); } g.save(); }
        }
        return 'E · Tocar a nota do altar';
      }
      case 2: { if (run) g.dialog = { npc: SCRIBE, text: HINTS[(data.floor + p.tx) % HINTS.length]!, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] }; return 'E · Ler a estante'; }
      case 4: {
        if (run) {
          const text = fresh.has(p.id) ? 'A estátua da Cantora chora em silêncio.' : 'A estátua da Cantora chora. Uma lágrima toca sua mão: sua vida volta inteira.';
          if (!fresh.has(p.id)) { fresh.add(p.id); g.p.hp = g.maxHp(); }
          g.dialog = { npc: SCRIBE, text, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
        }
        return 'E · Tocar a estátua chorosa';
      }
      case 5: { if (run) { g.p.hp = g.maxHp(); g.p.mp = g.maxMp(); g.toast('💧 A fonte da Cantora cura todas as feridas.', '#80d0ff'); } return 'E · Beber da fonte'; }
      case 3: case 7: {
        if (run) {
          let text: string;
          if (p.page !== undefined && p.page >= 0) {
            const key = `page_${p.page}`, isNew = !g.discoveries.has(key);
            g.discoveries.add(key); g.discoveries.add(p.id);
            const n = pagesFound(g);
            text = `${CHRONICLE[p.page]}\n\n— Página ${p.page + 1} da Crônica · ${n}/${CHRONICLE.length} encontradas`;
            if (isNew && n % 10 === 0) { g.p.gold += n * 40; g.addItem('elixir', 1); g.toast(`📜 ${n} páginas da Crônica! +${n * 40} ouro e um Elixir.`, '#ffe080'); }
            if (isNew && n === CHRONICLE.length) g.toast('✨ A Crônica está completa. Você agora sabe o nome da Cantora: Lírien.', '#fff0a0');
          } else {
            g.discoveries.add(p.id);
            text = TEMPLE_LINES[d.temple?.family ?? 'marble'] ?? TEMPLE_LINES['marble']!;
          }
          g.dialog = { npc: SCRIBE, text, choices: [{ label: 'Fechar', act: () => { g.dialog = null; } }] };
          g.save();
        }
        return p.kind === 3 ? 'E · Ler o pergaminho do esqueleto' : 'E · Ler a tábua dourada';
      }
    }
  }
  return '';
}
