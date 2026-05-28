import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SpeciesBubbleTree from './SpeciesBubbleTree';
import { useDataset } from '../hooks/useDataset';

interface Props {
  speciesId: string;
}

export function DiagramCard({ speciesId }: Props) {
  const navigate = useNavigate();
  const { species, symbiosis } = useDataset();

  const handleNodeClick = useCallback((speciesNodeId: string) => {
    navigate(`/species/${speciesNodeId}`);
  }, [navigate]);

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
        <SpeciesBubbleTree
          focalId={speciesId}
          data={{ species, symbiosis }}
          onNodeClick={handleNodeClick}
          height={550}
          maxDepth={1}
        />
      </div>
    </div>
  );
}
