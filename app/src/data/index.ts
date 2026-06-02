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

/** Entry in manifest.json — metadata + counts, no species data. */
export interface PackManifestEntry extends PackMetadata {
  speciesCount: number;
  groupCount: number;
  symbiosisCount: number;
  relationsCount: number;
}

export interface LoadedPack {
  metadata: PackMetadata;
  data: {
    species?: Species[];
    taxonomic_groups?: Species[];
    symbiosis?: Symbiosis[];
    relations?: Relation[];
  };
}

export interface DatasetIndexes {
  species: Species[];
  taxonomicGroups: Species[];
  symbiosis: Symbiosis[];
  taxonomicGroupIds: Set<string>;
  speciesById: Map<string, Species>;
  symbiosisBySpeciesId: Map<string, Symbiosis[]>;
  relationsBySpeciesId: Map<string, Relation[]>;
}

/**
 * Build dataset indexes from a filtered list of packs.
 * Called at startup (all packs) and reactively when the user toggles a pack.
 */
export function buildIndexes(packs: LoadedPack[]): DatasetIndexes {
  const species: Species[] = [];
  const taxonomicGroups: Species[] = [];
  const symbiosis: Symbiosis[] = [];
  const relations: Relation[] = [];

  for (const pack of packs) {
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

  return { species, taxonomicGroups, symbiosis, taxonomicGroupIds, speciesById, symbiosisBySpeciesId, relationsBySpeciesId };
}
