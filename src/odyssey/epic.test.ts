import { describe, it, expect } from 'vitest';
import { FACTIONS, MAIN_COUNT, RESIDENT_COUNT, SIDE_STORY_COUNT, MISSION_COUNT, SCENE_COUNT, sideStory, mission, storyOfMission, getMain, decideEnding, repPriceMult, resident } from './epic';
import { dirKeys } from '../components/Joystick';
import { LOADOUT_SIZE, SKILLS, shopBooks } from './skills';

describe('Grande Crônica', () => {
  it('tem 6 facções e 60 missões principais com 2 escolhas', () => {
    expect(FACTIONS).toHaveLength(6);
    expect(MAIN_COUNT).toBe(60);
    for (let i = 0; i < 60; i++) expect(getMain(i).choices).toHaveLength(2);
  });
  it('soma ~9.250 missões em ~2.600 histórias e ~1.700 cenas', () => {
    expect(SIDE_STORY_COUNT).toBe(2600);
    expect(RESIDENT_COUNT).toBe(2250);
    expect(sideStory(SIDE_STORY_COUNT - 1).missions.at(-1)).toBe(MISSION_COUNT - 1);
    expect(storyOfMission(MISSION_COUNT - 1)).toBe(SIDE_STORY_COUNT - 1);
    expect(mission(5000).story).toBe(storyOfMission(5000));
    expect(SCENE_COUNT).toBe(1700);
  });
  it('é determinística', () => { expect(resident(77)).toEqual(resident(77)); expect(sideStory(9).title).toBe(sideStory(9).title); });
  it('escolhe o final com mais pontos; empate vai para Harmonia', () => {
    expect(decideEnding({ cancao: 5, silencio: 2, harmonia: 1 })).toBe('cancao');
    expect(decideEnding({ cancao: 3, silencio: 9, harmonia: 3 })).toBe('silencio');
    expect(decideEnding({ cancao: 4, silencio: 0, harmonia: 4 })).toBe('harmonia');
  });
  it('reputação muda preços até 20%', () => { expect(repPriceMult(30)).toBeCloseTo(0.8); expect(repPriceMult(-20)).toBeCloseTo(1.2); expect(repPriceMult(0)).toBe(1); });
});
describe('Grimório e controles', () => {
  it('6 espaços, 30 livros, 8 na loja', () => { expect(LOADOUT_SIZE).toBe(6); expect(SKILLS).toHaveLength(30); expect(shopBooks()).toHaveLength(8); });
  it('joystick vira teclas', () => { expect(dirKeys(0, -1)).toEqual(['KeyW']); expect(dirKeys(1, 1).sort()).toEqual(['KeyD', 'KeyS']); expect(dirKeys(0.1, 0)).toEqual([]); });
});
