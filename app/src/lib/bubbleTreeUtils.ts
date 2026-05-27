/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Species, Symbiosis, HierarchyInput } from '../types';
import { getRelatedEntries, groupByRole } from './relationships';

/**
 * Build a 3-tier radial bubble tree hierarchy:
 * - Focal species (center)
 * - Relationship categories (middle ring)
 * - Related species (outer ring)
 */
export function buildBubbleTreeHierarchy(
  focalSpeciesId: string,
  speciesById: Map<string, Species>,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>,
  relationsBySpeciesId: Map<string, any[]>,
  maxDepth: number = 2,
  taxonomicGroupIds?: Set<string>
): HierarchyInput {
  // Note: maxDepth filtering happens at the component level, not here.
  // It's a parameter to maintain a consistent API, but depth limiting is applied
  // by RelationshipBubbleTree after hierarchy construction.
  void maxDepth;

  const focalSpecies = speciesById.get(focalSpeciesId);
  if (!focalSpecies) {
    throw new Error(`Focal species not found: ${focalSpeciesId}`);
  }

  // Get all relationships for this focal species
  const relatedEntries = getRelatedEntries(
    focalSpeciesId,
    symbiosisBySpeciesId,
    relationsBySpeciesId as any,
    speciesById,
    taxonomicGroupIds
  );

  // Group by relationship type
  const grouped = groupByRole(relatedEntries);

  // Category order (only include if there are entries)
  const categoryOrder: Array<'mutualism' | 'predation' | 'parasitism' | 'competition' | 'commensalism'> = [
    'mutualism',
    'predation',
    'parasitism',
    'competition',
    'commensalism',
  ];

  // Build category nodes
  const categoryChildren: HierarchyInput[] = [];
  for (const category of categoryOrder) {
    const entries = grouped[category] || [];
    if (entries.length === 0) continue;

    const speciesChildren: HierarchyInput[] = entries.map(entry => ({
      id: entry.species.id,
      name: entry.species.common_name,
      type: 'species',
      relationshipType: category,
    }));

    categoryChildren.push({
      id: `category-${category}`,
      name: categoryLabel(category),
      type: 'category',
      relationshipType: category,
      children: speciesChildren,
    });
  }

  // Build root hierarchy
  return {
    id: focalSpeciesId,
    name: focalSpecies.common_name,
    type: 'focal',
    children: categoryChildren,
  };
}

/**
 * Get human-readable label for relationship category
 */
export function categoryLabel(
  category: 'mutualism' | 'predation' | 'parasitism' | 'competition' | 'commensalism'
): string {
  const labels: Record<string, string> = {
    mutualism: 'Mutualism',
    predation: 'Predation',
    parasitism: 'Parasitism',
    competition: 'Competition',
    commensalism: 'Commensalism',
  };
  return labels[category] || category;
}

/**
 * Get color for relationship category
 */
export function getRelationshipColor(
  category?: string
): string {
  const colors: Record<string, string> = {
    mutualism: '#27ae60',      // green
    predation: '#e74c3c',      // red
    parasitism: '#f39c12',     // orange/gold
    competition: '#95a5a6',    // gray
    commensalism: '#3b82f6',   // blue
  };
  return colors[category || ''] || '#95a5a6';
}

/**
 * Get radius (px) for node by type
 */
export function getNodeRadius(type: 'focal' | 'category' | 'species'): number {
  const radii: Record<string, number> = {
    focal: 80,
    category: 50,
    species: 30,
  };
  return radii[type] || 30;
}

/**
 * Get opacity for node by type
 */
export function getNodeOpacity(type: 'focal' | 'category' | 'species'): number {
  const opacities: Record<string, number> = {
    focal: 1.0,
    category: 1.0,
    species: 0.8,
  };
  return opacities[type] || 0.8;
}

/**
 * Get text size (em) for node labels
 */
export function getLabelSize(type: 'focal' | 'category' | 'species'): number {
  const sizes: Record<string, number> = {
    focal: 1.1,
    category: 0.9,
    species: 0.7,
  };
  return sizes[type] || 0.7;
}

/**
 * Get font weight for node labels
 */
export function getLabelWeight(type: 'focal' | 'category' | 'species'): string {
  const weights: Record<string, string> = {
    focal: 'bold',
    category: '600',
    species: 'normal',
  };
  return weights[type] || 'normal';
}
