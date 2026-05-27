import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cytoscape from 'cytoscape';
import { CytoscapeWrapper, type Element } from './CytoscapeWrapper';
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
      const sourceId = typeof link.source === 'string' ? link.source : String((link.source as Record<string, unknown>).id);
      const targetId = typeof link.target === 'string' ? link.target : String((link.target as Record<string, unknown>).id);
      
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

    return [...nodeElements, ...edgeElements] as unknown as Element[];
  }, [graphData]);

  const stylesheet = useMemo(() => buildCytoscapeStyles(speciesId), [speciesId]);

  const handleNodeTap = useCallback((evt: Record<string, unknown>) => {
    const node = evt.target as Record<string, () => unknown>;
    if ((node.isNode as () => boolean)()) {
      navigate(`/species/${(node.id as () => string)()}`);
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
          stylesheet={stylesheet as unknown as Cytoscape.StylesheetCSS[]}
          layout={{
            name: 'cose',
            animate: true,
            animationDuration: 500,
            spacingFactor: 1.2,
          } as Cytoscape.LayoutOptions}
          wheelSensitivity={0.1}
          boxSelectionEnabled={false}
          autounselectify={true}
          on={onHandlers as unknown as Record<string, (evt: Cytoscape.EventObject) => void>}
        />
      </div>
    </div>
  );
}
