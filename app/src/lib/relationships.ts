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
  const groups = Object.fromEntries(
    ROLES.map(r => [r, [] as RelatedEntry[]])
  ) as GroupedRelations;
  for (const entry of entries) {
    groups[entry.role].push(entry);
  }
  for (const role of ROLES) {
    groups[role].sort((a, b) => Number(b.obligate) - Number(a.obligate));
  }
  return groups;
}

// ─── Neighbor categories ────────────────────────────────────────────────────

const BIRD_FORMS = new Set([
  'woodpecker', 'raptor', 'owl', 'songbird', 'warbler', 'hummingbird', 'wading_bird',
]);
const PLANT_FORMS = new Set(['tree', 'wildflower', 'shrub']);
const INSECT_FORMS = new Set(['butterfly', 'beetle', 'bug', 'bee']);
const WILDLIFE_FORMS = new Set(['frog', 'mammal']);

export type NeighborCategorySlug = 'birds' | 'plants' | 'insects' | 'wildlife' | 'related';

export interface NeighborCategory {
  slug: NeighborCategorySlug;
  label: string;
  icon: string;
  entries: RelatedEntry[];
}

const CATEGORY_META: Record<NeighborCategorySlug, { label: string; icon: string }> = {
  birds:   { label: 'Birds',           icon: '🐦' },
  plants:  { label: 'Plants',          icon: '🌿' },
  insects: { label: 'Insects',         icon: '🦋' },
  wildlife:{ label: 'Wildlife',        icon: '🐸' },
  related: { label: 'Related Species', icon: '🔗' },
};

function getCategorySlug(entry: RelatedEntry): NeighborCategorySlug | null {
  if (entry.role === 'related') return 'related';
  const form = entry.species.form;
  if (BIRD_FORMS.has(form))    return 'birds';
  if (PLANT_FORMS.has(form))   return 'plants';
  if (INSECT_FORMS.has(form))  return 'insects';
  if (WILDLIFE_FORMS.has(form)) return 'wildlife';
  return null;
}

export function getCategoryGroups(entries: RelatedEntry[]): NeighborCategory[] {
  const map = new Map<NeighborCategorySlug, RelatedEntry[]>();
  for (const entry of entries) {
    const slug = getCategorySlug(entry);
    if (!slug) continue;
    const list = map.get(slug) ?? [];
    list.push(entry);
    map.set(slug, list);
  }
  const categories: NeighborCategory[] = [];
  for (const [slug, catEntries] of map) {
    categories.push({ slug, ...CATEGORY_META[slug], entries: catEntries });
  }
  categories.sort((a, b) => b.entries.length - a.entries.length);
  return categories;
}

export function getKeyRelationship(entries: RelatedEntry[]): RelatedEntry | null {
  return entries.find(e => e.obligate) ?? null;
}
