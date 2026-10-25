import { describe, it, expect } from 'vitest';
import { BUILDINGS, TREASURES, ROOM, createInterior, doorOf, prepareExploration, canClaimTreasure } from './exploration';
import { generateWorld, W, H, T, SOLID, TS } from './world';
import { ITEMS } from './data';
describe('Casas acessíveis como Pokémon',()=>{
  it('oferece uma porta acessível em cada casa',()=>{
    const world=generateWorld();prepareExploration(world);
    for(const b of BUILDINGS){const d=doorOf(b);expect(world.tiles[d.ty*W+d.tx]).toBe(T.DOOR);expect(SOLID.has(world.tiles[(d.ty+1)*W+d.tx])).toBe(false);}
  });
  it('permite caminhar da entrada até a saída em todos os interiores',()=>{
    for(const b of BUILDINGS){const world=createInterior(b);const start=[Math.floor(ROOM.spawnX/TS),Math.floor(ROOM.spawnY/TS)];const queue=[start];const seen=new Set<string>();while(queue.length){const p=queue.shift();if(!p)break;const [x,y]=p;const key=x+','+y;if(seen.has(key)||x<0||y<0||x>=W||y>=H||SOLID.has(world.tiles[y*W+x]))continue;seen.add(key);queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}expect(seen.has(ROOM.exitX+','+ROOM.exitY)).toBe(true);}
  });
});
describe('Muitos segredos',()=>{
  it('inclui santuários escondidos e dezenas de tesouros válidos',()=>{expect(BUILDINGS.filter(b=>b.secret).length).toBeGreaterThanOrEqual(4);expect(TREASURES.length).toBeGreaterThanOrEqual(30);for(const t of TREASURES){expect(ITEMS[t.item]).toBeDefined();expect(t.tx).toBeLessThan(W);expect(t.ty).toBeLessThan(H);}});
  it('não permite receber o mesmo tesouro duas vezes',()=>{const opened=new Set<string>();expect(canClaimTreasure(opened,'village-well')).toBe(true);opened.add('village-well');expect(canClaimTreasure(opened,'village-well')).toBe(false);});
});
