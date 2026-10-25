import { describe, expect, it } from 'vitest';
import { QUESTS, NPCS, BOSSES } from './data';
import { objectiveWaypoint } from './waypoint';
import { STORY_QUESTS } from './story';

const q = (id: string) => QUESTS.find(x => x.id === id)!;
describe('indicador de objetivo', () => {
  it('missão disponível aponta para quem a oferece', () => {
    const w = objectiveWaypoint(q('m1'), 'available', false, { x: 0, y: 0 }, [])!;
    const elder = NPCS.find(n => n.id === 'elder')!;
    expect([w.tx, w.ty]).toEqual([elder.tx, elder.ty]);
  });
  it('missão de chefe aponta para o chefe', () => {
    const w = objectiveWaypoint(q('m2'), 'active', false, { x: 0, y: 0 }, [])!;
    const b = BOSSES.find(x => x.id === 'king_mush')!;
    expect([w.tx, w.ty]).toEqual([b.tx, b.ty]);
  });
  it('missão de caça aponta para a criatura certa mais próxima', () => {
    const w = objectiveWaypoint(q('m1'), 'active', false, { x: 0, y: 0 }, [{ kind: 'goblin', tx: 1, ty: 1 }, { kind: 'mushroom', tx: 5, ty: 5 }, { kind: 'mushroom', tx: 30, ty: 30 }])!;
    expect([w.tx, w.ty]).toEqual([5, 5]);
  });
  it('missão pronta aponta de volta para quem a deu', () => {
    const w = objectiveWaypoint(q('m2'), 'active', true, { x: 0, y: 0 }, [])!;
    expect(w.label).toBe('Ancião Gorm');
  });
  it('cada região ganhou missões de memória e oferenda', () => {
    expect(STORY_QUESTS.filter(x => /_(5|6)$/.test(x.id)).length).toBe(34);
  });
});
