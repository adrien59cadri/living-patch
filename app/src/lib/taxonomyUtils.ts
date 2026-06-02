import type { Species } from '../types';
import { getCommonName } from './labels';

/**
 * Taxonomy tree node for hierarchical display of species by taxonomic groups
 */
export interface TaxonomyNode {
  id: string;
  name: string;
  type: 'group' | 'species';
  children: TaxonomyNode[];
  speciesCount: number;
  depth: number;
}

/**
 * Build a taxonomy tree from species and relations
 * Groups species by their taxonomic_group field
 */
export function buildTaxonomyTree(
  species: Species[],
  taxonomicGroups: Species[],
): TaxonomyNode[] {
  const groupMap = new Map<string, Species>();
  const groupChildren = new Map<string, string[]>();

  // Index taxonomic groups
  taxonomicGroups.forEach(group => {
    groupMap.set(group.id, group);
    groupChildren.set(group.id, []);
  });

  // Map species to their groups
  species.forEach(s => {
    const groupId = (s as any).taxonomic_group;
    if (groupId && groupChildren.has(groupId)) {
      groupChildren.get(groupId)!.push(s.id);
    }
  });

  // Build tree nodes for each group
  const nodes: TaxonomyNode[] = [];
  const speciesById = new Map(species.map(s => [s.id, s]));

  taxonomicGroups.forEach(group => {
    const childSpeciesIds = groupChildren.get(group.id) || [];
    const speciesNodes: TaxonomyNode[] = childSpeciesIds.map(speciesId => {
      const sp = speciesById.get(speciesId);
      return {
        id: speciesId,
        name: sp ? getCommonName(sp.common_name) : speciesId,
        type: 'species' as const,
        children: [],
        speciesCount: 0,
        depth: 1,
      };
    });

    nodes.push({
      id: group.id,
      name: getCommonName(group.common_name) || group.id,
      type: 'group' as const,
      children: speciesNodes.sort((a, b) => a.name.localeCompare(b.name)),
      speciesCount: speciesNodes.length,
      depth: 0,
    });
  });

  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build a taxonomy tree for a specific organism type (e.g., fungi)
 * Filters species by form and groups by taxonomic_group
 */
export function buildFormTaxonomyTree(
  species: Species[],
  taxonomicGroups: Species[],
  form: string,
): TaxonomyNode[] {
  const filteredSpecies = species.filter(s => s.form === form);
  const filteredGroups = taxonomicGroups.filter(
    g => filteredSpecies.some(s => (s as any).taxonomic_group === g.id),
  );
  return buildTaxonomyTree(filteredSpecies, filteredGroups);
}

/**
 * Get species by taxonomic group
 */
export function getSpeciesByGroup(
  speciesId: string,
  species: Species[],
): Species[] {
  const s = species.find(sp => sp.id === speciesId);
  if (!s) return [];

  const groupId = (s as any).taxonomic_group;
  if (!groupId) return [];

  return species.filter(sp => (sp as any).taxonomic_group === groupId);
}

/**
 * Get all species in a taxonomic group
 */
export function getSpeciesInGroup(
  groupId: string,
  species: Species[],
): Species[] {
  return species.filter(s => (s as any).taxonomic_group === groupId);
}

/**
 * Filter taxonomy tree nodes by a predicate
 */
export function filterTaxonomyTree(
  nodes: TaxonomyNode[],
  predicate: (node: TaxonomyNode) => boolean,
): TaxonomyNode[] {
  return nodes
    .map(node => ({
      ...node,
      children: filterTaxonomyTree(node.children, predicate),
    }))
    .filter(node => predicate(node) || node.children.length > 0);
}
