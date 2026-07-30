import { describe, test, expect } from 'vitest';
import { parseSpeciesRef, resolveStage } from '../speciesRef';
import { makeSpecies } from '../../test/fixtures';

describe('parseSpeciesRef', () => {
  test('returns plain id with no stageId for an unqualified reference', () => {
    expect(parseSpeciesRef('insect_green-lacewing')).toEqual({
      speciesId: 'insect_green-lacewing',
    });
  });

  test('splits a stage-qualified reference on "@"', () => {
    expect(parseSpeciesRef('insect_green-lacewing@larva')).toEqual({
      speciesId: 'insect_green-lacewing',
      stageId: 'larva',
    });
  });

  test('only splits on the first "@" if somehow more than one is present', () => {
    expect(parseSpeciesRef('insect_x@larva@extra')).toEqual({
      speciesId: 'insect_x',
      stageId: 'larva@extra',
    });
  });
});

describe('resolveStage', () => {
  const speciesWithStages = makeSpecies('insect_green-lacewing', 'insect', {
    life_stages: [
      { id: 'egg', icon: '🥚', name: 'Egg', description: '', months: [] },
      { id: 'larva', icon: '🐛', name: 'Larva (Aphid Lion)', description: '', months: [] },
    ],
  });

  test('finds the matching stage by id', () => {
    const stage = resolveStage(speciesWithStages, 'larva');
    expect(stage?.name).toBe('Larva (Aphid Lion)');
  });

  test('returns undefined when stageId is undefined', () => {
    expect(resolveStage(speciesWithStages, undefined)).toBeUndefined();
  });

  test('returns undefined when species is undefined', () => {
    expect(resolveStage(undefined, 'larva')).toBeUndefined();
  });

  test('returns undefined when no stage matches the id', () => {
    expect(resolveStage(speciesWithStages, 'pupa')).toBeUndefined();
  });

  test('returns undefined when life_stages is a plain string array (no ids possible)', () => {
    const plant = makeSpecies('plant_x', 'wildflower', { life_stages: ['mature', 'flowering'] });
    expect(resolveStage(plant, 'mature')).toBeUndefined();
  });

  test('returns undefined when species has no life_stages at all', () => {
    const noStages = makeSpecies('insect_y', 'insect', { life_stages: undefined });
    expect(resolveStage(noStages, 'larva')).toBeUndefined();
  });
});
