import { useRef, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';
import type { DiagramNode } from '../types';
import { buildForceGraphData, getNodeColor, getNodeSize, getNodeOpacity } from '../lib/diagramUtils';
import { useDataset } from '../hooks/useDataset';

interface Props {
  speciesId: string;
}

export function DiagramCard({ speciesId }: Props) {
  const navigate = useNavigate();
  const { speciesById, symbiosisBySpeciesId } = useDataset();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const graphData = useMemo(
    () => buildForceGraphData(speciesId, 1, speciesById, symbiosisBySpeciesId),
    [speciesId, speciesById, symbiosisBySpeciesId]
  );

  useEffect(() => {
    if (fgRef.current && graphData) {
      fgRef.current.d3Force('charge')?.strength(-300);
      fgRef.current.d3Force('link')?.distance(100);
      fgRef.current.zoomToFit(400, { padding: 0.5 });
    }
  }, [graphData]);

  if (!graphData) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = (node: any) => {
    navigate(`/species/${node.id}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = (node: any) => {
    setHoveredNode(node?.id ?? null);
  };

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
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeColor={(node: unknown) => {
            const n = node as DiagramNode;
            const isHovered = hoveredNode === n.id;
            const isFocal = n.id === speciesId;
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
            const isFocal = n.id === speciesId;
            const x = n.x || 0;
            const y = n.y || 0;

            ctx.fillStyle = getNodeColor(n.relationshipType);
            ctx.globalAlpha = getNodeOpacity(n.depth);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();

            if (isFocal) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2;
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
            return obligate ? (isConnected ? 2 : 1) : isConnected ? 1 : 0.5;
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          height={400}
          width={600}
        />
      </div>
    </div>
  );
}
