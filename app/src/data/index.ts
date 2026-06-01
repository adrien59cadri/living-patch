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

const datasetWithPacks = rawDataset as unknown as DatasetWithPacks;

export const loadedPacks = datasetWithPacks.packs;

export interface Dataset {
  species: Species[];
  taxonomicGroups: Species[];
  symbiosis: Symbiosis[];
  relations: Relation[];
  taxonomicGroupIds: Set<string>;
  speciesById: Map<string, Species>;
  symbiosisBySpeciesId: Map<string, Symbiosis[]>;
  relationsBySpeciesId: Map<string, Relation[]>;
}

function buildDataset(disabledPackIds: string[] = []): Dataset {
  const species: Species[] = [];
  const taxonomicGroups: Species[] = [];
  const symbiosis: Symbiosis[] = [];
  const relations: Relation[] = [];

  const enabledPacks = loadedPacks.filter(p => !disabledPackIds.includes(p.metadata.id));

  for (const pack of enabledPacks) {
    if (pack.data.species) species.push(...pack.data.species);
    if (pack.data.taxonomic_groups) taxonomicGroups.push(...pack.data.taxonomic_groups);
    if (pack.data.symbiosis) symbiosis.push(...pack.data.symbiosis);
    if (pack.data.relations) relations.push(...pack.data.relations);
  }

  const taxonomicGroupIds = new Set<string>(taxonomicGroups.map(g => g.id));
  const speciesById = new Map<string, Species>(
    [...species, ...taxonomicGroups].map(s => [s.id, s])
  );

  const symbiosisBySpeciesId = new Map<string, Symbiosis[]>();
  for (const sym of symbiosis) {
    for (const id of [sym.source, ...sym.targets]) {
      const existing = symbiosisBySpeciesId.get(id) ?? [];
      existing.push(sym);
      symbiosisBySpeciesId.set(id, existing);
    }
  }

  const relationsBySpeciesId = new Map<string, Relation[]>();
  for (const rel of relations) {
    for (const memberId of rel.members) {
      const existing = relationsBySpeciesId.get(memberId) ?? [];
      existing.push(rel);
      relationsBySpeciesId.set(memberId, existing);
    }
  }

  if (import.meta.env.DEV) {
    for (const sym of symbiosis) {
      if (!sym.strength) {
        console.warn(`[symbiosis] missing strength on entry: source=${sym.source}`);
      }
      if (!speciesById.has(sym.source)) {
        console.warn(`[symbiosis] unknown source id "${sym.source}"`);
      }
      for (const targetId of sym.targets) {
        if (!speciesById.has(targetId)) {
          console.warn(`[symbiosis] unknown target id "${targetId}"`);
        }
      }
      if (sym.fulfillment !== undefined && sym.targets.length === 1) {
        console.warn(`[symbiosis] fulfillment set on single-target entry (source: ${sym.source}) — ignored`);
      }
    }
  }

  return {
    species,
    taxonomicGroups,
    symbiosis,
    relations,
    taxonomicGroupIds,
    speciesById,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
  };
}

// Default dataset with all packs enabled
const defaultDataset = buildDataset();

export { buildDataset };
export const species = defaultDataset.species;
export const taxonomicGroups = defaultDataset.taxonomicGroups;
export const symbiosis = defaultDataset.symbiosis;
export const relations = defaultDataset.relations;
export const taxonomicGroupIds = defaultDataset.taxonomicGroupIds;
export const speciesById = defaultDataset.speciesById;
export const symbiosisBySpeciesId = defaultDataset.symbiosisBySpeciesId;
export const relationsBySpeciesId = defaultDataset.relationsBySpeciesId;
