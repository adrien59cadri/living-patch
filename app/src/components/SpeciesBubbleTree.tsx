import React from 'react';
import type { Species, Symbiosis } from '../types';
import RelationshipBubbleTree from './RelationshipBubbleTree';

interface SpeciesBubbleTreeProps {
  /** ID of focal (center) species */
  focalId: string;
  /** Data object with species and symbiosis arrays */
  data: {
    species: Species[];
    symbiosis: Symbiosis[];
  };
  /** Callback when a species node is clicked */
  onNodeClick?: (speciesId: string) => void;
  /** Width in pixels (auto-detects container if not provided) */
  width?: number;
  /** Height in pixels (auto-detects container if not provided) */
  height?: number;
  /** Maximum depth to display (1 for detail page, 3 for full diagram) */
  maxDepth?: 1 | 3;
}

/**
 * Clean wrapper for D3 species relationship diagram.
 *
 * Props simplified to match user spec:
 * - focalId: Root species to center the diagram on
 * - data: { species[], symbiosis[] } - matches dataset structure
 * - maxDepth: 1 for species detail page, 3 for full diagram page
 * - onNodeClick: Navigate to clicked species detail page
 *
 * Internally converts data to:
 * - speciesById Map
 * - symbiosisBySpeciesId Map
 * - Then passes to RelationshipBubbleTree
 */
export const SpeciesBubbleTree: React.FC<SpeciesBubbleTreeProps> = ({
  focalId,
  data,
  onNodeClick,
  width,
  height,
  maxDepth = 1,
}) => {
  // Build efficient lookups
  const speciesById = new Map(data.species.map(s => [s.id, s]));

  // Build symbiosis index: speciesId → [all symbioses involving that species]
  const symbiosisBySpeciesId = new Map<string, Symbiosis[]>();
  for (const symbiosis of data.symbiosis) {
    for (const memberId of symbiosis.members) {
      if (!symbiosisBySpeciesId.has(memberId)) {
        symbiosisBySpeciesId.set(memberId, []);
      }
      symbiosisBySpeciesId.get(memberId)!.push(symbiosis);
    }
  }

  return (
    <RelationshipBubbleTree
      focalId={focalId}
      speciesById={speciesById}
      symbiosisBySpeciesId={symbiosisBySpeciesId}
      onNodeClick={onNodeClick}
      width={width}
      height={height}
      maxDepth={maxDepth}
    />
  );
};

export default SpeciesBubbleTree;
