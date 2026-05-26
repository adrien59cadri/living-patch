import type { Species, LifeStage, Symbiosis } from '../types';
import type { RelatedEntry } from '../lib/relationships';

// ── Species fixtures ────────────────────────────────────────────────────────

export const mockPlantSpecies: Species = {
  id: 'plant_common-milkweed',
  common_name: 'Common Milkweed',
  latin_name: 'Asclepias syriaca',
  form: 'wildflower',
  habitat: ['field', 'meadow'],
  diet: [],
  behavior: ['nectar_source'],
  season: ['summer'],
  functional_description: 'Primary milkweed for Monarch in NE PA.',
  life_stages: ['mature', 'flowering'],
  region: 'northeast_pa',
  is_keystone: false,
  keystone_type: null,
  keystone_description: null,
  active_months: ['Jun-Sep'],
};

export const mockBirdSpecies: Species = {
  id: 'bird_american-robin',
  common_name: 'American Robin',
  latin_name: 'Turdus migratorius',
  form: 'songbird',
  habitat: ['garden', 'woodland'],
  diet: ['fruit_eater', 'insect_eater'],
  behavior: ['ground_forager'],
  season: ['spring', 'summer'],
  functional_description: 'Common lawn thrush.',
  life_stages: [],
  region: 'northeast_pa',
  is_keystone: false,
  keystone_type: null,
  keystone_description: null,
  active_months: ['Mar-Nov'],
};

export const mockGroupSpecies: Species = {
  id: 'group_other-milkweeds',
  common_name: 'Other Native Milkweeds',
  form: 'wildflower',
  habitat: ['field'],
  diet: [],
  behavior: [],
  season: ['summer'],
  functional_description: 'Group placeholder.',
  life_stages: [],
  region: 'northeast_pa',
  is_group: true,
};

const mockLifeStages: LifeStage[] = [
  { icon: '🥚', name: 'Egg',        description: 'Tiny egg', months: ['Jun-Aug'] },
  { icon: '🐛', name: 'Caterpillar', description: 'Striped larva', months: ['Jun-Sep'] },
  { icon: '🫘', name: 'Chrysalis',  description: 'Jade green', months: ['Jul-Sep'] },
  { icon: '🦋', name: 'Adult',      description: 'Orange and black', months: ['May-Oct'] },
];

export const mockMonarch: Species = {
  id: 'insect_monarch-butterfly',
  common_name: 'Monarch Butterfly',
  latin_name: 'Danaus plexippus',
  form: 'butterfly',
  habitat: ['field', 'meadow', 'garden'],
  diet: ['nectar_feeder'],
  behavior: ['long_distance_migrant'],
  season: ['spring', 'summer', 'fall_migrant'],
  functional_description:
    'Orange and black butterfly obligate on milkweed. Iconic migrant.',
  life_stages: mockLifeStages,
  region: 'northeast_pa',
  ecological_role: 'herbivore',
  is_keystone: true,
  keystone_type: 'mutualist',
  keystone_description: 'Obligate on milkweed — cannot breed without genus Asclepias.',
  active_months: ['May-Oct'],
};

export const mockMonarchYearRound: Species = {
  ...mockMonarch,
  id: 'mock_year-round',
  common_name: 'Year-Round Species',
  active_months: ['Jan-Dec'],
};

export const mockNoLifeStages: Species = {
  ...mockMonarch,
  id: 'mock_no-stages',
  common_name: 'No Stages Species',
  life_stages: ['mature', 'flowering'], // string-only, should be ignored
};

// ── Symbiosis fixtures ───────────────────────────────────────────────────────

export const mockObligateSymbiosis: Symbiosis = {
  type: 'parasitism',
  members: ['insect_monarch-butterfly', 'plant_common-milkweed'],
  impacted_species: 'insect_monarch-butterfly',
  obligate: true,
  notes: 'Monarch caterpillars obligate on Asclepias syriaca.',
};

export const mockMutualismSymbiosis: Symbiosis = {
  type: 'mutualism',
  members: ['insect_monarch-butterfly', 'bird_american-robin'],
  obligate: false,
  notes: 'Robin and Monarch share meadow habitat.',
};

// ── RelatedEntry fixtures ────────────────────────────────────────────────────

export const mockObligateEntry: RelatedEntry = {
  species: mockPlantSpecies,
  symbiosis: mockObligateSymbiosis,
  role: 'parasitism',
  obligate: true,
  notes: mockObligateSymbiosis.notes,
  isImpacted: true,
};

export const mockBirdEntry: RelatedEntry = {
  species: mockBirdSpecies,
  symbiosis: mockMutualismSymbiosis,
  role: 'mutualism',
  obligate: false,
  notes: mockMutualismSymbiosis.notes,
  isImpacted: false,
};

export const mockGroupEntry: RelatedEntry = {
  species: mockGroupSpecies,
  symbiosis: mockObligateSymbiosis,
  role: 'parasitism',
  obligate: true,
  notes: 'Group placeholder entry.',
  isImpacted: true,
};
