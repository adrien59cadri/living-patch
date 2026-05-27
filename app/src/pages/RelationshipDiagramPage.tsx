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
              <p className="text-xs text-stone-500">Depth: 1–3 relationships (scroll/pinch to zoom/pan)</p>
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
          maxDepth={3}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow border border-stone-200 text-xs space-y-2">
        <div className="font-semibold text-stone-800 mb-3">Relationship Types</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27ae60' }} />
          <span className="text-stone-600">Mutualism (solid)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e74c3c' }} />
          <span className="text-stone-600">Predation (→ arrow)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f39c12' }} />
          <span className="text-stone-600">Parasitism (⠒ dashed →)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#95a5a6' }} />
          <span className="text-stone-600">Competition (solid)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-stone-600">Commensalism (solid)</span>
        </div>
        <div className="text-xs text-stone-500 mt-3">
          Bold lines = obligate | Thin lines = facultative
        </div>
      </div>
    </div>
  );
}
