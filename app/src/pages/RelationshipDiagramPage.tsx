import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CytoscapeWrapper } from '../components/CytoscapeWrapper';
import { buildForceGraphData, buildCytoscapeStyles } from '../lib/diagramUtils';
import { useDataset } from '../hooks/useDataset';

export function RelationshipDiagramPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { speciesById, symbiosisBySpeciesId } = useDataset();

  const focalSpeciesId = searchParams.get('focal');

  const graphData = useMemo(() => {
    if (!focalSpeciesId) return null;
    return buildForceGraphData(focalSpeciesId, 3, speciesById, symbiosisBySpeciesId);
  }, [focalSpeciesId, speciesById, symbiosisBySpeciesId]);

  useEffect(() => {
    if (!focalSpeciesId) {
      navigate('/');
    }
  }, [focalSpeciesId, navigate]);

  if (!focalSpeciesId || !graphData) return null;

  const focalSpecies = speciesById.get(focalSpeciesId);

  // Convert ForceGraphData to Cytoscape elements format
  const elements = useMemo(() => {
    if (!graphData) return [];
    
    const nodeElements = graphData.nodes.map(node => ({
      data: {
        id: node.id,
        name: node.name,
        depth: node.depth,
        relationshipType: node.relationshipType,
      },
    }));

    const edgeElements = graphData.links.map((link, idx) => {
      // Handle both string IDs and node objects (in case ForceGraph2D converts them)
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      
      return {
        data: {
          id: `${sourceId}-${targetId}-${idx}`,
          source: sourceId,
          target: targetId,
          relationshipType: link.relationshipType,
          obligate: link.obligate,
          directional: link.directional,
        },
      };
    });

    return [...nodeElements, ...edgeElements];
  }, [graphData]);

  const stylesheet = useMemo(() => buildCytoscapeStyles(focalSpeciesId), [focalSpeciesId]);

  const handleNodeTap = useCallback((evt: any) => {
    const node = evt.target;
    if (node.isNode()) {
      const nodeId = node.id();
      if (nodeId === focalSpeciesId) return;
      setSearchParams({ focal: nodeId });
    }
  }, [focalSpeciesId, setSearchParams]);

  const onHandlers = useMemo(() => ({ tap: handleNodeTap }), [handleNodeTap]);

  const relationshipTypeColors: Record<string, string> = {
    mutualism: '#22c55e',
    predation: '#ef4444',
    parasitism: '#a855f7',
    competition: '#f97316',
    commensalism: '#3b82f6',
  };

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
              <p className="text-xs text-stone-500">Depth: 1–3 relationships</p>
            </div>
          )}
        </div>
      </div>

      {/* Main diagram area */}
      <div className="flex-1 overflow-hidden relative">
        <CytoscapeWrapper
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={{
            name: 'cose',
            nodeSpacing: 15,
            animate: true,
            animationDuration: 500,
            spacingFactor: 1.3,
            gravity: 1,
            numIter: 1000,
          }}
          wheelSensitivity={0.1}
          boxSelectionEnabled={false}
          autounselectify={true}
          on={onHandlers}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow border border-stone-200 text-xs space-y-2">
        <div className="font-semibold text-stone-800 mb-3">Relationship Types</div>
        {Object.entries(relationshipTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-stone-600 capitalize">{type}</span>
          </div>
        ))}
        <div className="border-t border-stone-200 pt-2 mt-3">
          <div className="text-stone-600">Depth 1: Full opacity</div>
          <div className="text-stone-500">Depth 2: 50% opacity</div>
          <div className="text-stone-400">Depth 3: 25% opacity</div>
        </div>
      </div>
    </div>
  );
}
