import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SpeciesBubbleTree from '../components/SpeciesBubbleTree';
import { useDataset } from '../hooks/useDataset';

export function RelationshipDiagramPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { species, speciesById, symbiosis } = useDataset();

  const focalSpeciesId = searchParams.get('focal');

  const handleNodeClick = useCallback((speciesNodeId: string) => {
    setSearchParams({ focal: speciesNodeId });
  }, [setSearchParams]);

  // Check for early return after all hooks
  useEffect(() => {
    if (!focalSpeciesId) {
      navigate('/');
    }
  }, [focalSpeciesId, navigate]);

  if (!focalSpeciesId) return null;

  const focalSpecies = speciesById.get(focalSpeciesId);

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-stone-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/species/${focalSpeciesId}`)}
            className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-700 hover:bg-stone-100 rounded transition"
          >
            ← Back to Species
          </button>
          {focalSpecies && (
            <div>
              <h1 className="text-xl font-bold text-stone-800">{focalSpecies.common_name}</h1>
              <p className="text-xs text-stone-500">Depth: 1–2 relationships (scroll/pinch to zoom/pan)</p>
            </div>
          )}
        </div>
      </div>

      {/* Main diagram area */}
      <div className="flex-1 overflow-hidden relative">
        <SpeciesBubbleTree
          focalId={focalSpeciesId}
          data={{ species, symbiosis }}
          onNodeClick={handleNodeClick}
          maxDepth={2}
        />
      </div>
    </div>
  );
}
