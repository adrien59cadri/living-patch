import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CytoscapeWrapper } from './CytoscapeWrapper';
import { buildForceGraphData, buildCytoscapeStyles } from '../lib/diagramUtils';
import { useDataset } from '../hooks/useDataset';

interface Props {
  speciesId: string;
}

export function DiagramCard({ speciesId }: Props) {
  const navigate = useNavigate();
  const { speciesById, symbiosisBySpeciesId } = useDataset();

  const graphData = useMemo(
    () => buildForceGraphData(speciesId, 1, speciesById, symbiosisBySpeciesId),
    [speciesId, speciesById, symbiosisBySpeciesId]
  );

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

  const stylesheet = useMemo(() => buildCytoscapeStyles(speciesId), [speciesId]);

  const handleNodeTap = useCallback((evt: any) => {
    const node = evt.target;
    if (node.isNode()) {
      navigate(`/species/${node.id()}`);
    }
  }, [navigate]);

  const onHandlers = useMemo(() => ({ tap: handleNodeTap }), [handleNodeTap]);

  if (!graphData) return null;

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

      <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50" style={{ height: '400px', width: '100%' }}>
        <CytoscapeWrapper
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={{
            name: 'cose',
            nodeSpacing: 10,
            animate: true,
            animationDuration: 500,
            spacingFactor: 1.2,
          }}
          wheelSensitivity={0.1}
          boxSelectionEnabled={false}
          autounselectify={true}
          on={onHandlers}
        />
      </div>
    </div>
  );
}
