import { useRef, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';
import type { DiagramNode } from '../types';
import { buildForceGraphData, getNodeColor, getNodeSize, getNodeOpacity } from '../lib/diagramUtils';
import { useDataset } from '../hooks/useDataset';

export function RelationshipDiagramPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { speciesById, symbiosisBySpeciesId } = useDataset();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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

  useEffect(() => {
    if (fgRef.current && graphData) {
      fgRef.current.d3Force('charge')?.strength(-500);
      fgRef.current.d3Force('link')?.distance(150);
      fgRef.current.zoomToFit(400, { padding: 0.5 });
    }
  }, [graphData]);

  if (!focalSpeciesId || !graphData) return null;

  const focalSpecies = speciesById.get(focalSpeciesId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (node: any) => {
    if (node.id === focalSpeciesId) return;
    setSearchParams({ focal: node.id });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = (node: any) => {
    setHoveredNode(node?.id ?? null);
  };

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
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeColor={(node: unknown) => {
            const n = node as DiagramNode;
            const isHovered = hoveredNode === n.id;
            const isFocal = n.id === focalSpeciesId;
            const baseColor = getNodeColor(n.relationshipType);

            if (isFocal) return '#10b981';
            if (isHovered) return '#059669';
            return baseColor;
          }}
          nodeVal={(node: unknown) => {
            const n = node as DiagramNode;
            return getNodeSize(n.depth);
          }}
          nodeLabel={(node: unknown) => {
            const n = node as DiagramNode;
            return n.name;
          }}
          nodeCanvasObject={(node: unknown, ctx: CanvasRenderingContext2D) => {
            const n = node as DiagramNode;
            const size = getNodeSize(n.depth);
            const isFocal = n.id === focalSpeciesId;
            const opacity = getNodeOpacity(n.depth);
            const x = n.x || 0;
            const y = n.y || 0;

            ctx.fillStyle = getNodeColor(n.relationshipType);
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();

            if (isFocal) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 3;
              ctx.globalAlpha = 1;
              ctx.stroke();
            }

            ctx.globalAlpha = 1;
          }}
          linkColor={(link: unknown) => {
            const l = link as Record<string, unknown>;
            const source = l.source as DiagramNode;
            const target = l.target as DiagramNode;
            const isConnected =
              hoveredNode === null ||
              (source.id === hoveredNode || target.id === hoveredNode);
            const color = getNodeColor(l.relationshipType as string);
            return isConnected ? color : '#d1d5db';
          }}
          linkWidth={(link: unknown) => {
            const l = link as Record<string, unknown>;
            const source = l.source as DiagramNode;
            const target = l.target as DiagramNode;
            const isConnected =
              hoveredNode === null ||
              (source.id === hoveredNode || target.id === hoveredNode);
            const obligate = l.obligate as boolean;
            return obligate ? (isConnected ? 2.5 : 1) : isConnected ? 1.5 : 0.5;
          }}
          linkLineDash={(link: unknown) => {
            const l = link as Record<string, unknown>;
            const source = l.source as DiagramNode;
            const target = l.target as DiagramNode;
            if (source.depth === 1 && target.depth === 1) return [];
            if (source.depth === 2 || target.depth === 2) return [5, 5];
            return [2, 2];
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          height={window.innerHeight - 60}
          width={window.innerWidth}
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
