/**
 * Unit tests for the species_id@stage_id reference syntax and life-stage
 * validation added to SpeciesSchema / SymbiosisSchema / RelationSchema.
 */
import { describe, it, expect } from 'vitest';
import { SpeciesSchema, SymbiosisSchema, RelationSchema, LifeStageSchema } from '../../lib/schema.js';

describe('LifeStageSchema', () => {
  it('accepts a stage with no id (backward compatible)', () => {
    const result = LifeStageSchema.safeParse({ name: 'Egg', description: 'A tiny egg' });
    expect(result.success).toBe(true);
  });

  it('accepts a stage with a valid lowercase-slug id', () => {
    const result = LifeStageSchema.safeParse({ id: 'larva', name: 'Larva', description: 'Aphid lion' });
    expect(result.success).toBe(true);
  });

  it('rejects an id with uppercase characters', () => {
    const result = LifeStageSchema.safeParse({ id: 'Larva', name: 'Larva', description: 'x' });
    expect(result.success).toBe(false);
  });

  it('rejects an id starting with a digit', () => {
    const result = LifeStageSchema.safeParse({ id: '2nd-instar', name: 'Instar', description: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('SymbiosisSchema — species_id@stage_id references', () => {
  const base = { type: 'predation', strength: 'important' as const, notes: 'test' };

  it('accepts a plain species id as source', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: 'insect_x', targets: ['insect_y'] });
    expect(result.success).toBe(true);
  });

  it('accepts a stage-qualified source', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: 'insect_x@larva', targets: ['insect_y'] });
    expect(result.success).toBe(true);
  });

  it('accepts a stage-qualified target', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: 'insect_x', targets: ['insect_y@adult'] });
    expect(result.success).toBe(true);
  });

  it('rejects a source with an uppercase stage id', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: 'insect_x@Larva', targets: ['insect_y'] });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed reference with no species id before "@"', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: '@larva', targets: ['insect_y'] });
    expect(result.success).toBe(false);
  });

  it('still rejects a source that is not a valid species id shape at all', () => {
    const result = SymbiosisSchema.safeParse({ ...base, source: 'Not A Valid Id', targets: ['insect_y'] });
    expect(result.success).toBe(false);
  });
});

describe('RelationSchema — species_id@stage_id references', () => {
  it('accepts stage-qualified members', () => {
    const result = RelationSchema.safeParse({
      type: 'taxonomic_group',
      members: ['insect_x@larva', 'insect_y'],
      notes: 'test',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed member reference', () => {
    const result = RelationSchema.safeParse({
      type: 'taxonomic_group',
      members: ['insect_x@LARVA!', 'insect_y'],
      notes: 'test',
    });
    expect(result.success).toBe(false);
  });
});

describe('SpeciesSchema — duplicate life_stages ids', () => {
  const baseSpecies = {
    id: 'insect_test-species',
    form: 'insect',
    functional_description: 'test',
    region: 'northeast_pa',
  };

  it('accepts life_stages with unique ids', () => {
    const result = SpeciesSchema.safeParse({
      ...baseSpecies,
      life_stages: [
        { id: 'larva', name: 'Larva', description: 'x' },
        { id: 'adult', name: 'Adult', description: 'x' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('flags duplicate stage ids within the same species', () => {
    const result = SpeciesSchema.safeParse({
      ...baseSpecies,
      life_stages: [
        { id: 'larva', name: 'Larva', description: 'x' },
        { id: 'larva', name: 'Pupa', description: 'y' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('duplicate stage id'))).toBe(true);
    }
  });

  it('does not flag stages that simply omit id', () => {
    const result = SpeciesSchema.safeParse({
      ...baseSpecies,
      life_stages: [
        { name: 'Larva', description: 'x' },
        { name: 'Adult', description: 'y' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('does not choke on plain string-array life_stages (no ids possible)', () => {
    const result = SpeciesSchema.safeParse({
      ...baseSpecies,
      life_stages: ['seedling', 'mature'],
    });
    expect(result.success).toBe(true);
  });
});
