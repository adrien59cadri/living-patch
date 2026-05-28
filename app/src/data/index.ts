import rawDataset from './dataset.json';
import type { Species, Symbiosis, Relation } from '../types';

interface PackMetadata {
  id: string;
  status?: string;
  version: string;
  author: string;
  createdDate: string;
  schemaVersion: string;
  description?: string;
}

interface DatasetWithPacks {
  packs: Array<{
    metadata: PackMetadata;
    data: {
      species?: Species[];
      taxonomic_groups?: Species[];
      symbiosis?: Symbiosis[];
      relations?: Relation[];
    };
  }>;
}

/**
 * Enum shorthand mappings for expanding compressed data
 * These match the shorthands used during compact JSON generation
 */
const enumMappings = {
  form: {
    bee: 'bee', bet: 'beetle', bug: 'bug', but: 'butterfly', dck: 'duck', frg: 'frog',
    hmb: 'hummingbird', mam: 'mammal', mot: 'moth', owl: 'owl', rpt: 'raptor', shr: 'shrub',
    sbr: 'songbird', tre: 'tree', wad: 'wading_bird', wbr: 'warbler', wfl: 'wildflower', wpk: 'woodpecker'
  },
  habitat: {
    bvr: 'beaver_pond', drm: 'dry_meadow', fld: 'field', fle: 'field_edge', for: 'forest',
    fre: 'forest_edge', gar: 'garden', mar: 'marsh', med: 'meadow', owl: 'open_woodland',
    pnd: 'pond', rip: 'riparian', rds: 'roadside', rok: 'rocky_slope', stm: 'streamside',
    wet: 'wet_meadow', wtl: 'wetland', wld: 'woodland', wle: 'woodland_edge'
  },
  diet: {
    frt: 'fruit_eater', hrb: 'herbivore', ins: 'insect_eater', nct: 'nectar_feeder', pln: 'pollen_eater', prd: 'predator'
  },
  behavior: {
    apo: 'aposematic', aqt: 'aquatic', brs: 'browser', bzp: 'buzz_pollinator', cal: 'calling',
    cvx: 'cavity_excavator', cvn: 'cavity_nester', cvu: 'cavity_user', cln: 'colonial_nester',
    dam: 'dam_builder', ebl: 'early_bloomer', eng: 'engineer', fbl: 'fall_bloomer', flk: 'flocking',
    frg: 'frugivore', gal: 'gall_host', grz: 'grazer', grg: 'gregarious', gnd: 'ground_nester',
    hvr: 'hovering', ins: 'insectivore', ldm: 'long_distance_migrant', mca: 'mast_cacher',
    mho: 'mast_host', mpr: 'mast_producer', mgr: 'migratory', ncs: 'nectar_source', nct: 'nocturnal',
    prh: 'perch_hunter', pio: 'pioneer', pol: 'pollinator', pud: 'puddling', sed: 'seed_disperser',
    sor: 'soaring', soc: 'social', ssl: 'soil_stabilizer', sbl: 'spring_bloomer', tnt: 'tent_builder',
    tox: 'toxin_producer', wad: 'wader'
  },
  season: {
    fal: 'fall', fmg: 'fall_migrant', lsu: 'late_summer', spr: 'spring', sum: 'summer', yar: 'year_round'
  },
  symbiosis: {
    mut: 'mutualism', par: 'parasitism', pre: 'predation', prf: 'predation-fruit_eating',
    prg: 'predation-grazing', prn: 'predation-nectar_feeding', prs: 'predation-seed_eating'
  },
  status: {
    pub: 'published', drf: 'draft'
  }
} as const;

/**
 * Expand enum shorthands in a species record
 */
function expandSpeciesEnums(species: Species): Species {
  return {
    ...species,
    form: species.form ? (enumMappings.form as Record<string, string>)[species.form] || species.form : species.form,
    habitat: species.habitat?.map(h => (enumMappings.habitat as Record<string, string>)[h] || h),
    diet: species.diet?.map(d => (enumMappings.diet as Record<string, string>)[d] || d),
    behavior: species.behavior?.map(b => (enumMappings.behavior as Record<string, string>)[b] || b),
    season: species.season?.map(s => (enumMappings.season as Record<string, string>)[s] || s),
  };
}

/**
 * Expand enum shorthands in a symbiosis record
 */
function expandSymbiosisEnums(symbiosis: Symbiosis): Symbiosis {
  return {
    ...symbiosis,
    type: symbiosis.type ? (enumMappings.symbiosis as Record<string, string>)[symbiosis.type] || symbiosis.type : symbiosis.type,
  };
}

const datasetWithPacks = rawDataset as unknown as DatasetWithPacks;

/**
 * Expand all enum shorthands in loaded packs
 */
const loadedPacks = datasetWithPacks.packs.map(pack => ({
  ...pack,
  metadata: {
    ...pack.metadata,
    status: pack.metadata.status ? (enumMappings.status as Record<string, string>)[pack.metadata.status] || pack.metadata.status : pack.metadata.status,
  },
  data: {
    ...pack.data,
    species: pack.data.species?.map(expandSpeciesEnums),
    taxonomic_groups: pack.data.taxonomic_groups?.map(expandSpeciesEnums),
    symbiosis: pack.data.symbiosis?.map(expandSymbiosisEnums),
  },
}));

export { loadedPacks };

// Build indexes by iterating over packs
const species: Species[] = [];
const taxonomicGroups: Species[] = [];
const symbiosis: Symbiosis[] = [];
const relations: Relation[] = [];

for (const pack of loadedPacks) {
  if (pack.data.species) species.push(...pack.data.species);
  if (pack.data.taxonomic_groups) taxonomicGroups.push(...pack.data.taxonomic_groups);
  if (pack.data.symbiosis) symbiosis.push(...pack.data.symbiosis);
  if (pack.data.relations) relations.push(...pack.data.relations);
}

export { species, taxonomicGroups, symbiosis };

export const taxonomicGroupIds = new Set<string>(
  taxonomicGroups.map(g => g.id)
);

export const speciesById = new Map<string, Species>(
  [...species, ...taxonomicGroups].map(s => [s.id, s])
);

export const symbiosisBySpeciesId = new Map<string, Symbiosis[]>();
for (const sym of symbiosis) {
  for (const memberId of sym.members) {
    const existing = symbiosisBySpeciesId.get(memberId) ?? [];
    existing.push(sym);
    symbiosisBySpeciesId.set(memberId, existing);
  }
}

export const relationsBySpeciesId = new Map<string, Relation[]>();
for (const rel of relations) {
  for (const memberId of rel.members) {
    const existing = relationsBySpeciesId.get(memberId) ?? [];
    existing.push(rel);
    relationsBySpeciesId.set(memberId, existing);
  }
}
