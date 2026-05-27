/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Species, Symbiosis } from '../types';
import {
  getFormColor as designGetFormColor,
  getRelationshipColor as designGetRelationshipColor,
} from './designTokens';

// ============================================================================
// Re-export from designTokens for backwards compatibility
// ============================================================================

export const getFormColor = designGetFormColor;
export const getRelationshipColor = designGetRelationshipColor;

// ============================================================================
// Nodes-Edges Model for D3 Refactor
// ============================================================================

export interface SpeciesNode {
  id: string;
  name: string;
  form: string;
  depth: number;
}

export interface SpeciesEdge {
  source: string;
  target: string;
  type: 'mutualism' | 'predation' | 'parasitism' | 'competition' | 'commensalism';
  obligate: boolean;
  direction?: 'inward' | 'outward'; // for directional relationships
}

export interface SpeciesNodesEdges {
  nodes: SpeciesNode[];
  links: SpeciesEdge[];
}

/**
 * Get node radius (px) by depth in the new nodes-edges model.
 */
export function getNodeSizeByDepth(depth: number): number {
  switch (depth) {
    case 0:
      return 40; // focal: 80px diameter
    case 1:
      return 17.5; // depth-1: 35px diameter
    default:
      return 12.5; // depth-2/3: 25px diameter
  }
}

/**
 * Get stroke width (px) for link based on obligate status.
 */
export function getLinkStrokeWidth(obligate: boolean): number {
  return obligate ? 3 : 1.5;
}

/**
 * Get opacity for node by depth.
 */
export function getNodeOpacityByDepth(depth: number): number {
  return depth === 0 ? 1.0 : depth === 1 ? 1.0 : 0.5;
}

/**
 * Darken a hex color by reducing RGB components.
 * Used for text stroke outline effects.
 */
export function darkenHexColor(hex: string, amount: number = 60): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 255) - amount);
  const b = Math.max(0, (num & 255) - amount);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Determine link direction based on impacted_species and relationship type.
 * - Predation/Parasitism: directional (arrow)
 *   - if impacted_species is the target → outward (source → target)
 *   - if impacted_species is the source → inward (target → source)
 * - Others: no arrow
 */
function getLinkDirection(
  sourceId: string,
  targetId: string,
  type: string,
  impactedSpeciesId?: string
): 'inward' | 'outward' | undefined {
  if (!['predation', 'parasitism'].includes(type)) {
    return undefined; // no direction for mutualism, competition, commensalism
  }
  // For directional types, if impacted is target, direction is outward
  if (impactedSpeciesId === targetId) {
    return 'outward';
  }
  if (impactedSpeciesId === sourceId) {
    return 'inward';
  }
  return 'outward'; // default
}

/**
 * Transform species + symbiosis data into flat nodes + edges model.
 * Uses BFS to calculate depth from focal species.
 *
 * @param focalSpeciesId - Root species ID
 * @param speciesById - Map of species by ID
 * @param symbiosisBySpeciesId - Map of symbiosis relationships by species ID
 * @param maxDepth - Maximum depth to include (1 for detail page, 3 for full diagram)
 * @returns Object with nodes array and links array
 */
export function transformToNodesEdges(
  focalSpeciesId: string,
  speciesById: Map<string, Species>,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>,
  maxDepth: number = 3
): SpeciesNodesEdges {
  const focalSpecies = speciesById.get(focalSpeciesId);
  if (!focalSpecies) {
    throw new Error(`Focal species not found: ${focalSpeciesId}`);
  }

  // Track visited nodes and their depth via BFS
  const visited = new Set<string>();
  const nodesByDepth: Map<number, SpeciesNode[]> = new Map();
  const links: SpeciesEdge[] = [];

  // Queue: [speciesId, depth]
  const queue: Array<[string, number]> = [[focalSpeciesId, 0]];
  visited.add(focalSpeciesId);
  nodesByDepth.set(0, [
    {
      id: focalSpeciesId,
      name: focalSpecies.common_name,
      form: focalSpecies.form,
      depth: 0,
    },
  ]);

  // BFS to find all connected species up to maxDepth
  while (queue.length > 0) {
    const [currentId, currentDepth] = queue.shift()!;

    // Only explore neighbors if we haven't reached maxDepth
    if (currentDepth < maxDepth) {
      const symbioses = symbiosisBySpeciesId.get(currentId) || [];

      for (const symbiosis of symbioses) {
        // Find the other species in this relationship
        const otherIds = symbiosis.members.filter(id => id !== currentId);

        for (const otherId of otherIds) {
          const otherSpecies = speciesById.get(otherId);
          if (!otherSpecies) continue;

          // Add link in both directions (symbiosis is bidirectional data-wise,
          // but we'll use direction field to indicate arrow direction)
          const linkDirection = getLinkDirection(
            currentId,
            otherId,
            symbiosis.type,
            symbiosis.impacted_species
          );

          links.push({
            source: currentId,
            target: otherId,
            type: symbiosis.type,
            obligate: symbiosis.obligate ?? false,
            direction: linkDirection,
          });

          // Add neighbor to queue if not visited
          if (!visited.has(otherId)) {
            visited.add(otherId);
            const nextDepth = currentDepth + 1;
            if (nextDepth <= maxDepth) {
              if (!nodesByDepth.has(nextDepth)) {
                nodesByDepth.set(nextDepth, []);
              }
              nodesByDepth.get(nextDepth)!.push({
                id: otherId,
                name: otherSpecies.common_name,
                form: otherSpecies.form,
                depth: nextDepth,
              });
              queue.push([otherId, nextDepth]);
            }
          }
        }
      }
    }
  }

  // Flatten nodes from all depths
  const nodes: SpeciesNode[] = [];
  const nodeDepthMap = new Map<string, number>();
  for (let d = 0; d <= maxDepth; d++) {
    nodes.push(...(nodesByDepth.get(d) || []));
    (nodesByDepth.get(d) || []).forEach(node => {
      nodeDepthMap.set(node.id, node.depth);
    });
  }

  // Filter links to only include "forward" edges in the BFS tree
  // (from lower depth to higher depth, ensuring we only show the core connection path to focal)
  const filteredLinks = links.filter(link => {
    const sourceDepth = nodeDepthMap.get(link.source) ?? -1;
    const targetDepth = nodeDepthMap.get(link.target) ?? -1;
    // Only include if target is deeper than source (following BFS tree structure)
    return targetDepth > sourceDepth;
  });

  return { nodes, links: filteredLinks };
}
