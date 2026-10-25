import { describe, it, expect } from 'vitest';
import { freshSettlement, growPlots, CROPS, STRUCTURES } from './settlement';
import { generateWorld, BIOME_LIST, T, SOLID, W, H, tileAt, biomeOf } from './world';
import { FRONTIER_GATES, FRONTIER, LEGACY_W, LEGACY_H } from './frontier';
import { ITEMS, BIOME_ENEMIES, BIOME_NAMES } from './data';

describe('Expanded living world',()=>{
  it('generates all 30 biomes with names and enemy pools',()=>{
    const world=generateWorld();const ids=new Set(world.biomes);
    expect(BIOME_LIST.length).toBe(30);
    for(const [i,b] of BIOME_LIST.entries()){expect(ids.has(i)).toBe(true);expect(BIOME_NAMES[b]).toBeTruthy();expect(BIOME_ENEMIES[b].length).toBeGreaterThan(0);}
    expect(world.tiles[130*W+143]).toBe(T.GRASS);
  },20000);
  it('expands the previous world to exactly 100 times its area',()=>{
    expect(W*H).toBe(320*240*100);
    expect(W).toBe(LEGACY_W*10);expect(H).toBe(LEGACY_H*10);
  });
  it('keeps each unique frontier destination walkable with its own terrain',()=>{
    const world=generateWorld();
    for(const g of FRONTIER_GATES){
      expect(biomeOf(world,g.tx*16,g.ty*16)).toBe(g.biome);
      expect(tileAt(world,g.tx,g.ty)).toBe(FRONTIER[g.biome].ground);
      expect(SOLID.has(tileAt(world,g.tx,g.ty+2))).toBe(false);
    }
  });
  it('generates stable terrain coordinates for saved settlements',()=>{
    const a=generateWorld(),b=generateWorld();
    for(const [x,y] of [[143,130],[480,120],[1650,650],[3000,2200]]){
      expect(tileAt(a,x,y)).toBe(tileAt(b,x,y));
    }
    expect(tileAt(a,143,130)).toBe(T.GRASS);
  },30000);
  it('grows only watered crops and rain irrigates planted crops',()=>{
    const s=freshSettlement();s.plots.push({x:140,y:130,crop:'carrot',growth:0,watered:false});
    growPlots(s,20,false);expect(s.plots[0].growth).toBe(0);
    growPlots(s,20,true);expect(s.plots[0].growth).toBe(.5);
    growPlots(s,100,false);expect(s.plots[0].growth).toBe(1);
  });
  it('uses real catalog materials for structures and seeds',()=>{
    for(const c of Object.values(CROPS)){expect(ITEMS[c.seed]).toBeDefined();expect(ITEMS[c.item]).toBeDefined();}
    for(const s of Object.values(STRUCTURES))for(const [id,n]of Object.entries(s.cost)){expect(ITEMS[id]).toBeDefined();expect(n).toBeGreaterThan(0);}
    expect(SOLID.has(T.LAVA)).toBe(true);
  });
});