import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';
import { buildForceGraphData, getNodeColor, getNodeSize, getNodeOpacity } from '../lib/diagramUtils';
import { useDataset } from '../hooks/useDataset';

interface Props {
  speciesId: string;
}

export function DiagramCard({ speciesId }: Props) {
  const navigate = useNavigate();
  const { speciesById, symbiosisBySpeciesId } = useDataset();
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const data = buildForceGraphData(speciesId, 1, speciesById, symbiosisBySpeciesId);
    setGraphData(data);
  }, [speciesId, speciesById, symbiosisBySpeciesId]);

  useEffect(() => {
    if (fgRef.current && graphData) {
      fgRef.current.d3Force('charge')?.strength(-300);
      fgRef.current.d3Force('link')?.distance(100);
      fgRef.current.zoomToFit(400, { padding: 0.5 });
    }
  }, [graphData]);

  if (!graphData) return null;

  const handleNodeClick = (node: any) => {
    navigate(`/species/${node.id}`);
  };

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
          nodeColor={(node: any) => {
            const isHovered = hoveredNode === node.id;
            const isFocal = node.id === speciesId;
            const baseColor = getNodeColor(node.relationshipType);

            if (isFocal) return '#10b981'; // Emerald for focal species
            if (isHovered) return '#059669'; // Darker emerald on hover
            return baseColor;
          }}
          nodeVal={(node: any) => getNodeSize(node.depth)}
          nodeLabel={(node: any) => node.name}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D) => {
            const size = getNodeSize(node.depth);
            const isFocal = node.id === speciesId;

            ctx.fillStyle = getNodeColor(node.relationshipType);
            ctx.globalAlpha = getNodeOpacity(node.depth);
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            ctx.fill();

            if (isFocal) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            ctx.globalAlpha = 1;
          }}
          linkColor={(link: any) => {
            const isConnected =
              hoveredNode === null ||
              (link.source.id === hoveredNode || link.target.id === hoveredNode);
            const color = getNodeColor(link.relationshipType);
            return isConnected ? color : '#d1d5db';
          }}
          linkWidth={(link: any) => {
            const isConnected =
              hoveredNode === null ||
              (link.source.id === hoveredNode || link.target.id === hoveredNode);
            return link.obligate ? (isConnected ? 2 : 1) : isConnected ? 1 : 0.5;
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
