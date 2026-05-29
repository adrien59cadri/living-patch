import { describe, test, expect } from 'vitest';
import {
  getKeyRelationship,
  getCategoryGroups,
  getRelatedEntries,
} from '../relationships';
import type { RelatedEntry } from '../relationships';
import type { Species, Symbiosis, Relation } from '../../types';

// ── Minimal inline fixtures ──────────────────────────────────────────────────

function makeSpecies(id: string, form: string, extra: Partial<Species> = {}): Species {
  return {
    id,
    common_name: id,
    form,
    habitat: [],
    diet: [],
    behavior: [],
    season: [],
    functional_description: '',
    life_stages: [],
    region: 'northeast_pa',
    ...extra,
  };
}

function makeEntry(
  form: string,
  role: RelatedEntry['role'],
  strength: RelatedEntry['strength'] = 'incidental'
): RelatedEntry {
  return {
    species: makeSpecies(`species_${form}`, form),
    role,
    strength,
    notes: '',
    isImpacted: false,
  };
}

// ── getKeyRelationship ───────────────────────────────────────────────────────

describe('getKeyRelationship', () => {
  test('returns first critical entry', () => {
    const entries: RelatedEntry[] = [
      makeEntry('songbird', 'mutualism', 'incidental'),
      makeEntry('wildflower', 'parasitism', 'critical'),
      makeEntry('tree', 'parasitism', 'critical'),
    ];
    const result = getKeyRelationship(entries);
    expect(result).not.toBeNull();
    expect(result!.species.form).toBe('wildflower');
  });

  test('returns null when no critical entries', () => {
    const entries: RelatedEntry[] = [
      makeEntry('songbird', 'mutualism', 'incidental'),
      makeEntry('tree', 'predation', 'important'),
    ];
    expect(getKeyRelationship(entries)).toBeNull();
  });

  test('returns null for empty array', () => {
    expect(getKeyRelationship([])).toBeNull();
  });
});

// ── getCategoryGroups ────────────────────────────────────────────────────────

describe('getCategoryGroups', () => {
  test('classifies bird forms into birds category', () => {
    const entries = ['woodpecker', 'raptor', 'owl', 'songbird', 'warbler'].map(f =>
      makeEntry(f, 'predation')
    );
    const cats = getCategoryGroups(entries);
    const birds = cats.find(c => c.slug === 'birds');
    expect(birds).toBeDefined();
    expect(birds!.entries).toHaveLength(5);
  });

  test('classifies plant forms into plants category', () => {
    const entries = ['tree', 'wildflower', 'shrub'].map(f => makeEntry(f, 'mutualism'));
    const cats = getCategoryGroups(entries);
    const plants = cats.find(c => c.slug === 'plants');
    expect(plants).toBeDefined();
    expect(plants!.entries).toHaveLength(3);
  });

  test('classifies insect forms into insects category', () => {
    const entries = ['butterfly', 'beetle', 'bug', 'bee'].map(f =>
      makeEntry(f, 'mutualism')
    );
    const cats = getCategoryGroups(entries);
    const insects = cats.find(c => c.slug === 'insects');
    expect(insects).toBeDefined();
    expect(insects!.entries).toHaveLength(4);
  });

  test('classifies frog and mammal into wildlife category', () => {
    const entries = [makeEntry('frog', 'predation'), makeEntry('mammal', 'predation')];
    const cats = getCategoryGroups(entries);
    const wildlife = cats.find(c => c.slug === 'wildlife');
    expect(wildlife).toBeDefined();
    expect(wildlife!.entries).toHaveLength(2);
  });

  test('classifies related role into related category', () => {
    const entry = makeEntry('wildflower', 'related');
    const cats = getCategoryGroups([entry]);
    const related = cats.find(c => c.slug === 'related');
    expect(related).toBeDefined();
    expect(related!.entries).toHaveLength(1);
  });

  test('skips entries with unknown forms', () => {
    const entry = makeEntry('unknown_form_xyz', 'mutualism');
    const cats = getCategoryGroups([entry]);
    expect(cats).toHaveLength(0);
  });

  test('sorts categories by entry count descending', () => {
    const entries: RelatedEntry[] = [
      makeEntry('songbird', 'mutualism'),
      makeEntry('tree', 'mutualism'),
      makeEntry('wildflower', 'mutualism'),
      makeEntry('shrub', 'mutualism'),
    ];
    const cats = getCategoryGroups(entries);
    expect(cats[0].entries.length).toBeGreaterThanOrEqual(cats[cats.length - 1].entries.length);
    const plants = cats.find(c => c.slug === 'plants');
    expect(plants!.entries).toHaveLength(3);
  });

  test('returns empty array for empty input', () => {
    expect(getCategoryGroups([])).toHaveLength(0);
  });
});

// ── getRelatedEntries ────────────────────────────────────────────────────────

describe('getRelatedEntries', () => {
  const speciesA = makeSpecies('species_a', 'butterfly');
  const speciesB = makeSpecies('species_b', 'wildflower');
  const speciesC = makeSpecies('species_c', 'songbird');

  const symbiosis: Symbiosis = {
    type: 'mutualism',
    members: ['species_a', 'species_b'],
    strength: 'incidental',
    notes: 'Mutualism AB',
  };

  const relation: Relation = {
    type: 'taxonomic_group',
    members: ['species_a', 'species_c'],
    notes: 'Related AC',
  };

  const speciesById = new Map([
    ['species_a', speciesA],
    ['species_b', speciesB],
    ['species_c', speciesC],
  ]);

  const symbiosisBySpeciesId = new Map([
    ['species_a', [symbiosis]],
    ['species_b', [symbiosis]],
  ]);

  const relationsBySpeciesId = new Map([
    ['species_a', [relation]],
    ['species_c', [relation]],
  ]);

  test('returns symbiosis partners for species_a', () => {
    const result = getRelatedEntries(
      'species_a',
      symbiosisBySpeciesId,
      relationsBySpeciesId,
      speciesById
    );
    const partnerIds = result.map(e => e.species.id);
    expect(partnerIds).toContain('species_b');
    expect(partnerIds).toContain('species_c');
  });

  test('assigns strength from symbiosis', () => {
    const criticalSym: Symbiosis = { ...symbiosis, strength: 'critical' };
    const symMap = new Map([['species_a', [criticalSym]]]);
    const result = getRelatedEntries('species_a', symMap, new Map(), speciesById);
    expect(result[0].strength).toBe('critical');
  });

  test('relation entries use role "related"', () => {
    const result = getRelatedEntries(
      'species_a',
      new Map(),
      relationsBySpeciesId,
      speciesById
    );
    expect(result.every(e => e.role === 'related')).toBe(true);
  });

  test('skips entries for unknown partner ids', () => {
    const badSym: Symbiosis = {
      type: 'mutualism',
      members: ['species_a', 'nonexistent'],
      strength: 'incidental',
      notes: '',
    };
    const result = getRelatedEntries(
      'species_a',
      new Map([['species_a', [badSym]]]),
      new Map(),
      speciesById
    );
    expect(result).toHaveLength(0);
  });
});
