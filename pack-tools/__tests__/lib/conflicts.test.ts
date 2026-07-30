/**
 * Unit tests for checkInternalConflicts, focused on the orphaned_reference /
 * orphaned_stage_reference checks (no prior test coverage existed for this
 * module before the species_id@stage_id reference feature was added).
 */
import { describe, it, expect } from 'vitest';
import { checkInternalConflicts } from '../../lib/conflicts.js';
import type { DataPack } from '../../lib/schema.js';

function makePack(overrides: Partial<DataPack['data']>): DataPack {
  return {
    metadata: {
      id: 'test-pack',
      createdDate: '2024-05-26T12:00:00Z',
      author: 'Test Author',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      status: 'published',
      description: 'Test pack',
    },
    data: {
      species: [],
      symbiosis: [],
      relations: [],
      ...overrides,
    },
  } as DataPack;
}

const predator = {
  id: 'insect_predator',
  form: 'insect',
  functional_description: 'test',
  region: 'northeast_pa',
  life_stages: [
    { id: 'larva', name: 'Larva', description: 'x' },
    { id: 'adult', name: 'Adult', description: 'x' },
  ],
};

const prey = {
  id: 'insect_prey',
  form: 'insect',
  functional_description: 'test',
  region: 'northeast_pa',
};

describe('checkInternalConflicts — species_id@stage_id references', () => {
  it('reports no conflicts for a valid stage-qualified reference', () => {
    const pack = makePack({
      species: [predator, prey],
      symbiosis: [
        { type: 'predation', source: 'insect_predator@larva', targets: ['insect_prey'], strength: 'important', notes: 'x' },
      ],
    });
    const report = checkInternalConflicts(pack);
    expect(report.hasConflicts).toBe(false);
  });

  it('still reports orphaned_reference for a nonexistent species, stage suffix or not', () => {
    const pack = makePack({
      species: [predator],
      symbiosis: [
        { type: 'predation', source: 'insect_predator@larva', targets: ['insect_ghost'], strength: 'important', notes: 'x' },
      ],
    });
    const report = checkInternalConflicts(pack);
    expect(report.hasConflicts).toBe(true);
    expect(report.conflicts.some(c => c.type === 'orphaned_reference')).toBe(true);
  });

  it('reports orphaned_stage_reference when the species exists but the stage id does not', () => {
    const pack = makePack({
      species: [predator, prey],
      symbiosis: [
        { type: 'predation', source: 'insect_predator@nonexistent-stage', targets: ['insect_prey'], strength: 'important', notes: 'x' },
      ],
    });
    const report = checkInternalConflicts(pack);
    expect(report.hasConflicts).toBe(true);
    const conflict = report.conflicts.find(c => c.type === 'orphaned_stage_reference');
    expect(conflict).toBeDefined();
    expect(conflict?.message).toContain('nonexistent-stage');
    expect(conflict?.message).toContain('insect_predator');
  });

  it('reports orphaned_stage_reference when the species has no life_stages at all', () => {
    const pack = makePack({
      species: [predator, prey],
      symbiosis: [
        { type: 'predation', source: 'insect_prey@larva', targets: ['insect_predator'], strength: 'important', notes: 'x' },
      ],
    });
    const report = checkInternalConflicts(pack);
    expect(report.conflicts.some(c => c.type === 'orphaned_stage_reference')).toBe(true);
  });

  it('checks stage references inside relation members too', () => {
    const pack = makePack({
      species: [predator, prey],
      relations: [
        { type: 'taxonomic_group', members: ['insect_predator@bogus-stage', 'insect_prey'], notes: 'x' },
      ],
    });
    const report = checkInternalConflicts(pack);
    expect(report.conflicts.some(c => c.type === 'orphaned_stage_reference')).toBe(true);
  });
});
