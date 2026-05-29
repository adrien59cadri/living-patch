import type { Species, Symbiosis, Relation, SymbiosisStrength } from '../types';
import { formLabel, formIcon } from './labels';
import {
  BIRD_FORMS,
  PLANT_FORMS,
  INSECT_FORMS,
  WILDLIFE_FORMS,
} from './designTokens';

export type SymbiosisRole = string;

export interface RelatedEntry {
  species: Species;
  symbiosis?: Symbiosis;
  relation?: Relation;
  role: SymbiosisRole;
  strength: SymbiosisStrength;
  grp?: string | null;
  notes: string;
  isImpacted: boolean;
  isGroup?: boolean;
}

export function getRelatedEntries(
  speciesId: string,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>,
  relationsBySpeciesId: Map<string, Relation[]>,
  speciesById: Map<string, Species>,
  taxonomicGroupIds?: Set<string>
): RelatedEntry[] {
  const groupIds = taxonomicGroupIds || new Set<string>();
  const entries: RelatedEntry[] = [];

  for (const sym of symbiosisBySpeciesId.get(speciesId) ?? []) {
    const partnerId = sym.members.find(id => id !== speciesId);
    if (!partnerId) continue;
    const partner = speciesById.get(partnerId);
    if (!partner) continue;
    
    // Determine if current species is negatively impacted
    const isImpacted = (sym.type === 'predation' || sym.type === 'parasitism') &&
      sym.impacted_species === speciesId;
    
    entries.push({
      species: partner,
      symbiosis: sym,
      role: sym.type,
      strength: sym.strength,
      grp: sym.grp ?? null,
      notes: sym.notes,
      isImpacted,
      isGroup: groupIds.has(partnerId),
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
        strength: 'incidental',
        grp: null,
        notes: rel.notes,
        isImpacted: false,
        isGroup: groupIds.has(memberId),
      });
    }
  }

  return entries;
}

const STRENGTH_ORDER: Record<SymbiosisStrength, number> = {
  critical: 0,
  important: 1,
  incidental: 2,
};

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
    // Initialize group if it doesn't exist (for new predation subtypes, etc.)
    if (!groups[entry.role]) {
      groups[entry.role] = [];
    }
    groups[entry.role].push(entry);
  }
  for (const role of Object.keys(groups)) {
    // Sort by: isImpacted (true first), then strength (critical < important < incidental)
    groups[role].sort((a, b) => {
      if (a.isImpacted !== b.isImpacted) {
        return Number(b.isImpacted) - Number(a.isImpacted);
      }
      return STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength];
    });
  }
  return groups;
}

// ─── Neighbor categories ────────────────────────────────────────────────────

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
  return entries.find(e => e.strength === 'critical') ?? null;
}

// ─── Key relationship grouping ──────────────────────────────────────────────

const KEY_ROLES: SymbiosisRole[] = ['mutualism', 'parasitism', 'predation'];

export function getKeyRoleEntries(entries: RelatedEntry[]): RelatedEntry[] {
  return entries.filter(e => KEY_ROLES.includes(e.role));
}

export type KeyRoleGroupedRelations = Record<SymbiosisRole, RelatedEntry[]>;

export function groupKeyRolesByObligation(
  entries: RelatedEntry[]
): KeyRoleGroupedRelations {
  const keyEntries = getKeyRoleEntries(entries);
  const groups = Object.fromEntries(
    KEY_ROLES.map(r => [r, [] as RelatedEntry[]])
  ) as KeyRoleGroupedRelations;

  for (const entry of keyEntries) {
    groups[entry.role].push(entry);
  }

  for (const role of KEY_ROLES) {
    groups[role].sort((a, b) => STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength]);
  }

  return groups;
}

// ─── Taxonomy relations ─────────────────────────────────────────────────────

export function getTaxonomyRelations(entries: RelatedEntry[]): RelatedEntry[] {
  return entries.filter(e => e.role === 'related');
}

export interface TaxonomyGroup {
  label: string;
  icon: string;
  entries: RelatedEntry[];
}

export function groupTaxonomyRelations(entries: RelatedEntry[]): TaxonomyGroup[] {
  const taxonomyEntries = getTaxonomyRelations(entries);

  if (taxonomyEntries.length === 0) {
    return [];
  }

  const grouped: Map<string, RelatedEntry[]> = new Map();

  for (const entry of taxonomyEntries) {
    const label = formLabel(entry.species.form);
    if (!grouped.has(label)) {
      grouped.set(label, []);
    }
    grouped.get(label)!.push(entry);
  }

  const groups: TaxonomyGroup[] = [];
  for (const [label, relEntries] of grouped) {
    const firstForm = relEntries[0]?.species.form;
    groups.push({
      label,
      icon: firstForm ? formIcon(firstForm) : '🔗',
      entries: relEntries,
    });
  }

  return groups;
}

// ─── Symbiotes and habitat neighbors ────────────────────────────────────────

export function getSymbiotes(
  speciesId: string,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>,
  speciesById: Map<string, Species>
): RelatedEntry[] {
  const entries: RelatedEntry[] = [];

  for (const sym of symbiosisBySpeciesId.get(speciesId) ?? []) {
    const partnerId = sym.members.find(id => id !== speciesId);
    if (!partnerId) continue;
    const partner = speciesById.get(partnerId);
    if (!partner) continue;
    
    // Determine if current species is negatively impacted
    const isImpacted = (sym.type === 'predation' || sym.type === 'parasitism') &&
      sym.impacted_species === speciesId;
    
    entries.push({
      species: partner,
      symbiosis: sym,
      role: sym.type,
      strength: sym.strength,
      grp: sym.grp ?? null,
      notes: sym.notes,
      isImpacted,
    });
  }

  return entries;
}

export function getHabitatNeighbors(
  speciesId: string,
  species: Species[],
  speciesById: Map<string, Species>,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>
): Species[] {
  const focal = speciesById.get(speciesId);
  if (!focal || !focal.habitat || focal.habitat.length === 0) {
    return [];
  }

  const focalHabitats = new Set(focal.habitat);

  // Get all symbiote IDs to exclude them
  const symbiotesSet = new Set<string>();
  for (const sym of symbiosisBySpeciesId.get(speciesId) ?? []) {
    for (const memberId of sym.members) {
      if (memberId !== speciesId) {
        symbiotesSet.add(memberId);
      }
    }
  }

  // Find species sharing habitat but not symbiotes
  const neighbors: Species[] = [];
  for (const other of species) {
    if (other.id === speciesId) continue;
    if (symbiotesSet.has(other.id)) continue;
    if (!other.habitat || other.habitat.length === 0) continue;

    // Check if they share at least one habitat
    const hasSharedHabitat = other.habitat.some(h => focalHabitats.has(h));
    if (hasSharedHabitat) {
      neighbors.push(other);
    }
  }

  // Sort by shared habitat count (descending)
  neighbors.sort((a, b) => {
    const aShared = a.habitat!.filter(h => focalHabitats.has(h)).length;
    const bShared = b.habitat!.filter(h => focalHabitats.has(h)).length;
    return bShared - aShared;
  });

  return neighbors;
}

// Helper to get category slug for a Species (not RelatedEntry)
function getSpeciesCategorySlug(species: Species): NeighborCategorySlug | null {
  const form = species.form;
  if (BIRD_FORMS.has(form))    return 'birds';
  if (PLANT_FORMS.has(form))   return 'plants';
  if (INSECT_FORMS.has(form))  return 'insects';
  if (WILDLIFE_FORMS.has(form)) return 'wildlife';
  return null;
}

export interface HabitatNeighborCategory {
  slug: NeighborCategorySlug;
  label: string;
  icon: string;
  species: Species[];
}

export function getHabitatNeighborsByCategory(neighbors: Species[]): HabitatNeighborCategory[] {
  const map = new Map<NeighborCategorySlug, Species[]>();
  
  for (const species of neighbors) {
    const slug = getSpeciesCategorySlug(species);
    if (!slug) continue;
    const list = map.get(slug) ?? [];
    list.push(species);
    map.set(slug, list);
  }

  const categories: HabitatNeighborCategory[] = [];
  // Order by birds, plants, insects, wildlife
  const order: NeighborCategorySlug[] = ['birds', 'plants', 'insects', 'wildlife'];
  
  for (const slug of order) {
    const catSpecies = map.get(slug);
    if (catSpecies && catSpecies.length > 0) {
      categories.push({
        slug,
        ...CATEGORY_META[slug],
        species: catSpecies,
      });
    }
  }

  return categories;
}

// ─── Relation group resolution ───────────────────────────────────────────────

export interface RelationGroupEntry {
  isRelationGroup: true;
  groupSlug: string;
  entries: RelatedEntry[];
  strength: SymbiosisStrength;
  role: SymbiosisRole;
}

export type RenderableEntry = RelatedEntry | RelationGroupEntry;

/**
 * Resolves a list of RelatedEntry (within a single role/type section) into
 * RenderableEntry[]: entries sharing a grp slug are collapsed into one
 * RelationGroupEntry tile; ungrouped entries pass through as-is.
 *
 * Validation:
 * - Mixed strength within a group → warn, use lowest (most permissive)
 * - Mixed type within a group → warn, disable grouping for that slug
 */
export function resolveRelationGroups(entries: RelatedEntry[]): RenderableEntry[] {
  const grouped = new Map<string, RelatedEntry[]>();
  const ungrouped: RelatedEntry[] = [];

  for (const entry of entries) {
    if (entry.grp) {
      const list = grouped.get(entry.grp) ?? [];
      list.push(entry);
      grouped.set(entry.grp, list);
    } else {
      ungrouped.push(entry);
    }
  }

  const result: RenderableEntry[] = [...ungrouped];

  for (const [slug, groupEntries] of grouped) {
    // Validate: mixed type → disable grouping
    const types = new Set(groupEntries.map(e => e.role));
    if (types.size > 1) {
      if (import.meta.env.DEV) {
        console.warn(`[symbiosis] grp "${slug}" spans multiple types — grouping disabled for this group`);
      }
      result.push(...groupEntries);
      continue;
    }

    // Validate: mixed strength → warn, use lowest
    const strengths = groupEntries.map(e => e.strength);
    const uniqueStrengths = new Set(strengths);
    let resolvedStrength: SymbiosisStrength = groupEntries[0]?.strength ?? 'incidental';
    if (uniqueStrengths.size > 1) {
      if (import.meta.env.DEV) {
        console.warn(`[symbiosis] grp "${slug}" has mixed strength values — using lowest`);
      }
      const lowestOrder = Math.max(...strengths.map(s => STRENGTH_ORDER[s]));
      resolvedStrength = (Object.keys(STRENGTH_ORDER) as SymbiosisStrength[]).find(
        k => STRENGTH_ORDER[k] === lowestOrder
      ) ?? 'incidental';
    }

    result.push({
      isRelationGroup: true,
      groupSlug: slug,
      entries: groupEntries,
      strength: resolvedStrength,
      role: groupEntries[0]?.role ?? 'mutualism',
    });
  }

  // Re-sort: groups by their resolved strength alongside individual entries
  result.sort((a, b) => {
    const aStrength = 'isRelationGroup' in a ? a.strength : a.strength;
    const bStrength = 'isRelationGroup' in b ? b.strength : b.strength;
    return STRENGTH_ORDER[aStrength] - STRENGTH_ORDER[bStrength];
  });

  return result;
}
