import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RelationshipBubbleTree from './RelationshipBubbleTree';
import { buildBubbleTreeHierarchy } from '../lib/bubbleTreeUtils';
import { useDataset } from '../hooks/useDataset';

interface Props {
  speciesId: string;
}

export function DiagramCard({ speciesId }: Props) {
  const navigate = useNavigate();
  const { speciesById, symbiosisBySpeciesId } = useDataset();

  const hierarchyData = useMemo(
    () => {
      try {
        return buildBubbleTreeHierarchy(
          speciesId,
          speciesById,
          symbiosisBySpeciesId,
          new Map(),
          2
        );
      } catch (error) {
        console.error('Error building bubble tree hierarchy:', error);
        return null;
      }
    },
    [speciesId, speciesById, symbiosisBySpeciesId]
  );

  const handleNodeClick = useCallback((speciesNodeId: string) => {
    navigate(`/species/${speciesNodeId}`);
  }, [navigate]);

  if (!hierarchyData) return null;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Relationship Diagram
        </div>
        <button
          onClick={() => navigate(`/diagram?focal=${speciesId}`)}
          className="px-3 py-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
        >
          🔗 Full Diagram
        </button>
      </div>

      <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
        <RelationshipBubbleTree
          focalId={speciesId}
          data={hierarchyData}
          onNodeClick={handleNodeClick}
          height={550}
        />
      </div>
    </div>
  );
}
