import type { Species, Symbiosis, Relation } from '../types';

export type SymbiosisRole =
  | 'mutualism'
  | 'parasitism'
  | 'predation'
  | 'competition'
  | 'commensalism'
  | 'related';

export interface RelatedEntry {
  species: Species;
  symbiosis?: Symbiosis;
  relation?: Relation;
  role: SymbiosisRole;
  obligate: boolean;
  notes: string;
}

export function getRelatedEntries(
  speciesId: string,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>,
  relationsBySpeciesId: Map<string, Relation[]>,
  speciesById: Map<string, Species>
): RelatedEntry[] {
  const entries: RelatedEntry[] = [];

  for (const sym of symbiosisBySpeciesId.get(speciesId) ?? []) {
    const partnerId = sym.members.find(id => id !== speciesId);
    if (!partnerId) continue;
    const partner = speciesById.get(partnerId);
    if (!partner) continue;
    entries.push({
      species: partner,
      symbiosis: sym,
      role: sym.type,
      obligate: sym.obligate ?? false,
      notes: sym.notes,
    });
  }

  for (const rel of relationsBySpeciesId.get(speciesId) ?? []) {
    for (const memberId of rel.members) {
      if (memberId === speciesId) continue;
      const partner = speciesById.get(memberId);
      if (!partner) continue;
      entries.push({
        species: partner,
        relation: rel,
        role: 'related',
        obligate: false,
        notes: rel.notes,
      });
    }
  }

  return entries;
}

export type GroupedRelations = Record<SymbiosisRole, RelatedEntry[]>;

const ROLES: SymbiosisRole[] = [
  'mutualism',
  'parasitism',
  'predation',
  'competition',
  'commensalism',
  'related',
];

export function groupByRole(entries: RelatedEntry[]): GroupedRelations {
  const groups = Object.fromEntries(ROLES.map(r => [r, []])) as GroupedRelations;
  for (const entry of entries) {
    groups[entry.role].push(entry);
  }
  for (const role of ROLES) {
    groups[role].sort((a, b) => Number(b.obligate) - Number(a.obligate));
  }
  return groups;
}
