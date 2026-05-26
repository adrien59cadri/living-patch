import rawDataset from './dataset.json';
import type { Dataset, Species, Symbiosis, Relation } from '../types';

const dataset = rawDataset as unknown as Dataset;

export const species: Species[] = dataset.species;
export const taxonomicGroups: Species[] = dataset.taxonomic_groups || [];

export const taxonomicGroupIds = new Set<string>(
  (dataset.taxonomic_groups || []).map(g => g.id)
);

export const speciesById = new Map<string, Species>(
  [...(dataset.species || []), ...(dataset.taxonomic_groups || [])].map(s => [s.id, s])
);

export const symbiosisBySpeciesId = new Map<string, Symbiosis[]>();
for (const sym of dataset.symbiosis) {
  for (const memberId of sym.members) {
    const existing = symbiosisBySpeciesId.get(memberId) ?? [];
    existing.push(sym);
    symbiosisBySpeciesId.set(memberId, existing);
  }
}

export const relationsBySpeciesId = new Map<string, Relation[]>();
for (const rel of dataset.relations) {
  for (const memberId of rel.members) {
    const existing = relationsBySpeciesId.get(memberId) ?? [];
    existing.push(rel);
    relationsBySpeciesId.set(memberId, existing);
  }
}
