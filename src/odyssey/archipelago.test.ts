import { describe, it, expect } from "vitest";
import { BOATS, BOAT_RECIPES, ISLANDS, MAIN, bestBoat, depthAt, landAt, stepBoat, ROCKS, type BoatState } from "./archipelago";
import { ITEMS } from "./data";

const recipe = (out: string) => BOAT_RECIPES.find((r) => r.out === out)!;
const fresh = (x: number, y: number, a = 0): BoatState => ({ x, y, a, vx: 0, vy: 0, hull: 100, anchored: false });
// ponto de mar aberto (profundidade 3) longe de rochas
function openSea() {
  for (let x = 400; x < 5600; x += 37) for (let y = 400; y < 5600; y += 41)
    if (depthAt(x, y) === 3 && depthAt(x + 200, y) === 3 && ROCKS.every((r) => Math.hypot(r.x - x, r.y - y) > 300)) return { x, y };
  throw new Error("sem mar aberto");
}

describe("receitas dos barcos", () => {
  it("jangada custa 20 madeiras + 10 cordas de palmeira", () => { expect(recipe("boat_raft").cost).toEqual({ wood: 20, palm_rope: 10 }); });
  it("caravela custa 40 madeiras + 12 velas de linho + 6 cristais de mana", () => { expect(recipe("boat_caravel").cost).toEqual({ wood: 40, linen_sail: 12, crystal_ore: 6 }); });
  it("carraca precisa de metal das forjas, aço negro e 1 Fragmento de Ømnia", () => {
    const c = recipe("boat_carrack").cost; expect(c['omnia_fragment']).toBe(1); expect(c['black_steel']).toBeGreaterThan(0); expect(c['forge_metal']).toBeGreaterThan(0);
  });
  it("todos os ingredientes existem como itens", () => { for (const r of BOAT_RECIPES) for (const id of [r.out, ...Object.keys(r.cost)]) expect(ITEMS[id], id).toBeTruthy(); });
  it("o melhor barco vem das descobertas", () => {
    expect(bestBoat(new Set())).toBeNull();
    expect(bestBoat(new Set(["boat:raft", "boat:caravel"]))?.id).toBe("caravel");
  });
});

describe("ilhas da fase 1", () => {
  it("8 ilhas com 8 biomas distintos, história, recursos, mini-chefe e 3 missões", () => {
    expect(ISLANDS).toHaveLength(8);
    expect(new Set(ISLANDS.map((i) => i.biome)).size).toBe(8);
    for (const i of ISLANDS) { expect(i.origin.length).toBeGreaterThan(80); expect(i.resources.length).toBeGreaterThan(0); expect(i.boss.name).toBeTruthy(); expect(i.quests).toHaveLength(3); }
  });
  it("ilhas não se sobrepõem à principal nem entre si", () => {
    const all = [MAIN, ...ISLANDS];
    for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++)
      expect(Math.hypot(all[a]!.x - all[b]!.x, all[a]!.y - all[b]!.y)).toBeGreaterThan((all[a]!.r + all[b]!.r) * 1.3);
  });
  it("cada ilha é terra no centro", () => { for (const i of ISLANDS) expect(landAt(i.x, i.y)).toMatchObject({ id: i.id, inside: true }); });
  it("o Fragmento de Ømnia pode ser obtido numa ilha alcançável de caravela", () => {
    expect(ISLANDS.some((i) => i.tier <= 2 && i.relic?.item === "omnia_fragment")).toBe(true);
  });
});

describe("física do barco", () => {
  it("acelera ao abrir a vela", () => {
    const p = openSea(), s = fresh(p.x, p.y);
    for (let i = 0; i < 60; i++) stepBoat(s, BOATS.caravel, { throttle: 1, turn: 0 }, 1 / 60, 0);
    expect(Math.hypot(s.vx, s.vy)).toBeGreaterThan(20);
  });
  it("a jangada não entra em mar aberto", () => {
    const p = openSea(), s = fresh(p.x, p.y);
    const r = stepBoat(s, BOATS.raft, { throttle: 1, turn: 0 }, 1 / 60, 0);
    expect(r.blocked).toBe("deep");
  });
  it("bater numa rocha em alta velocidade danifica o casco", () => {
    const rock = ROCKS[0]!, s = fresh(rock.x - rock.r - 14, rock.y); s.vx = 200;
    const r = stepBoat(s, BOATS.carrack, { throttle: 0, turn: 0 }, 1 / 20, 0);
    expect(r.blocked).toBe("rock"); expect(s.hull).toBeLessThan(100);
  });
  it("ancorado o barco para", () => {
    const p = openSea(), s = fresh(p.x, p.y); s.vx = 100; s.anchored = true;
    for (let i = 0; i < 30; i++) stepBoat(s, BOATS.caravel, { throttle: 1, turn: 0 }, 1 / 60, 0);
    expect(Math.abs(s.vx)).toBeLessThan(1);
  });
});
