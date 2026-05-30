import type { Species, Symbiosis, SymbiosisStrength } from '../types';
import {
  getFormColor as designGetFormColor,
  getRelationshipColor as designGetRelationshipColor,
  RELATIONSHIP_COLORS_CRITICAL,
  RELATIONSHIP_COLORS_IMPORTANT,
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
  type: string;
  strength: SymbiosisStrength;
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
 * Get stroke width (px) for link based on relationship strength.
 */
export function getLinkStrokeWidth(strength: SymbiosisStrength): number {
  if (strength === 'critical') return 3;
  if (strength === 'important') return 2;
  return 1.5; // incidental
}

/**
 * Get opacity for link based on relationship strength.
 * Critical relationships are most opaque, incidental are faint.
 */
export function getLinkOpacityByStrength(strength: SymbiosisStrength): number {
  if (strength === 'critical') return 0.9;
  if (strength === 'important') return 0.75;
  return 0.5; // incidental
}

/**
 * Get link color based on relationship type and strength.
 * Critical and important use saturated color palettes; incidental keeps the pastel base.
 */
export function getLinkColorByStrength(type: string, strength: SymbiosisStrength): string {
  if (strength === 'critical') return RELATIONSHIP_COLORS_CRITICAL[type] ?? getRelationshipColor(type);
  if (strength === 'important') return RELATIONSHIP_COLORS_IMPORTANT[type] ?? getRelationshipColor(type);
  return getRelationshipColor(type); // incidental: pastel
}

/**
 * Get opacity for node by depth.
 */
export function getNodeOpacityByDepth(depth: number): number {
  return depth <= 1 ? 1.0 : 0.5;
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
 * Determine link direction based on relationship type and the symbiosis source.
 * - Predation/Parasitism: directional (arrow)
 *   - if sym source is the edge source → outward (source → target)
 *   - if sym source is the edge target → inward (target → source)
 * - Others: no arrow
 */
function getLinkDirection(
  edgeSourceId: string,
  edgeTargetId: string,
  type: string,
  symSourceId: string
): 'inward' | 'outward' | undefined {
  const typeBase = type.split('-')[0];
  if (typeBase !== 'predation' && typeBase !== 'parasitism') {
    return undefined; // no direction for mutualism, competition, commensalism
  }
  // Direction is always sym.source → sym.targets
  if (symSourceId === edgeSourceId) {
    return 'outward';
  }
  return 'inward';
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
        const otherIds = symbiosis.source === currentId
          ? symbiosis.targets
          : [symbiosis.source];

        for (const otherId of otherIds) {
          const otherSpecies = speciesById.get(otherId);
          if (!otherSpecies) continue;

          const linkDirection = getLinkDirection(
            currentId,
            otherId,
            symbiosis.type,
            symbiosis.source
          );

          links.push({
            source: currentId,
            target: otherId,
            type: symbiosis.type,
            strength: symbiosis.strength,
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
