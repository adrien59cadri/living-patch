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

if (import.meta.env.DEV) {
  const grpStrengths = new Map<string, string>();
  const grpTypes = new Map<string, string>();
  for (const sym of symbiosis) {
    const [a, b] = sym.members;
    if (!sym.strength) {
      console.warn(`[symbiosis] missing strength on entry between ${a} and ${b}`);
    }
    for (const memberId of sym.members) {
      if (!speciesById.has(memberId)) {
        console.warn(`[symbiosis] unknown species id "${memberId}"`);
      }
    }
    if (sym.grp) {
      const prevStrength = grpStrengths.get(sym.grp);
      if (prevStrength && prevStrength !== sym.strength) {
        console.warn(`[symbiosis] grp "${sym.grp}" has mixed strength values — using lowest`);
      } else {
        grpStrengths.set(sym.grp, sym.strength);
      }
      const prevType = grpTypes.get(sym.grp);
      if (prevType && prevType !== sym.type) {
        console.warn(`[symbiosis] grp "${sym.grp}" spans multiple types — grouping disabled for this group`);
      } else {
        grpTypes.set(sym.grp, sym.type);
      }
    }
  }
}
