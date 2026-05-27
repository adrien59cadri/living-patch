/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Species, Symbiosis } from '../types';
import {
  transformToNodesEdges,
  getFormColor,
  getNodeSizeByDepth,
  getNodeOpacityByDepth,
  getLinkStrokeWidth,
  getRelationshipColor,
} from '../lib/bubbleTreeUtils';

interface RelationshipBubbleTreeProps {
  /** ID of focal (center) species */
  focalId: string;
  /** Species data map */
  speciesById: Map<string, Species>;
  /** Symbiosis relationships indexed by species ID */
  symbiosisBySpeciesId: Map<string, Symbiosis[]>;
  /** Callback when a species node is clicked */
  onNodeClick?: (speciesId: string) => void;
  /** Width in pixels (auto-detects container if not provided) */
  width?: number;
  /** Height in pixels (auto-detects container if not provided) */
  height?: number;
  /** Maximum depth to display (1 for detail page, 3 for full diagram) */
  maxDepth?: number;
}

/**
 * D3 Radial bubble tree displaying species and their relationships.
 *
 * Uses a flat nodes-edges model where:
 * - Focal species at center (80px, bold text)
 * - Depth-1 species in circle (35px)
 * - Depth-2/3 species radiating out (25px, 50% opacity)
 * - All nodes colored by form (bird, plant, insect, mammal, etc.)
 * - Links styled by type (arrows for predation/parasitism, colors by relationship type)
 * - Link stroke weight indicates obligate (3px) vs non-obligate (1.5px)
 * - Zoom/pan available only when maxDepth=3 (full diagram page)
 */
export const RelationshipBubbleTree: React.FC<RelationshipBubbleTreeProps> = ({
  focalId,
  speciesById,
  symbiosisBySpeciesId,
  onNodeClick,
  width: providedWidth,
  height: providedHeight,
  maxDepth = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Auto-detect container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = providedWidth || Math.max(rect.width, 400);
        const newHeight = providedHeight || Math.max(rect.height, 400);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [providedWidth, providedHeight]);

  // D3 rendering effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    try {
      // Transform data to nodes and edges
      const { nodes, links } = transformToNodesEdges(focalId, speciesById, symbiosisBySpeciesId, maxDepth);

      const margin = 40;
      const width = Math.max(dimensions.width - margin * 2, 300);
      const height = Math.max(dimensions.height - margin * 2, 300);
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const maxRadius = Math.min(width, height) / 2 - 20;

      // Clear and setup SVG
      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3
        .select(svgRef.current)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      // Add defs for arrow markers
      const defs = svg.append('defs');
      
      // Predation arrow (red)
      defs
        .append('marker')
        .attr('id', 'arrowPredation')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', '#e74c3c');

      // Parasitism arrow (orange)
      defs
        .append('marker')
        .attr('id', 'arrowParasitism')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', '#f39c12');

      // Create main group
      const mainGroup = svg.append('g');

      // ===== POSITION NODES =====
      // Manually calculate radial positions
      const nodePositions = new Map<string, { x: number; y: number; depth: number }>();

      // Focal node at center
      const focalNode = nodes.find(n => n.depth === 0);
      if (focalNode) {
        nodePositions.set(focalNode.id, { x: centerX, y: centerY, depth: 0 });
      }

      // Depth-1 nodes: prioritize above/below to minimize text overlap
      const depth1Nodes = nodes.filter(n => n.depth === 1);
      const depth1Count = depth1Nodes.length;
      const depth1Radius = Math.min(150, maxRadius * 0.4);
      
      // Better balanced distribution: alternate left-right from top/bottom
      // This ensures left-right symmetry and reduces text overlap
      const angleStep = 2 * Math.PI / Math.max(1, depth1Count);
      
      depth1Nodes.forEach((node, i) => {
        let angle;
        if (i === 0) {
          // First node at top
          angle = -Math.PI / 2;
        } else {
          // Alternate sides: odd indices go right, even go left
          const offset = Math.ceil(i / 2) * angleStep;
          angle = i % 2 === 1 ? -Math.PI / 2 + offset : -Math.PI / 2 - offset;
        }
        const x = centerX + depth1Radius * Math.cos(angle);
        const y = centerY + depth1Radius * Math.sin(angle);
        nodePositions.set(node.id, { x, y, depth: 1 });
      });

      // Depth-2+ nodes radiating further out
      const deeperNodes = nodes.filter(n => n.depth >= 2);
      const depth2Radius = Math.min(250, maxRadius * 0.7);
      deeperNodes.forEach((node, i) => {
        const angle = (i / Math.max(1, deeperNodes.length)) * 2 * Math.PI;
        const x = centerX + depth2Radius * Math.cos(angle);
        const y = centerY + depth2Radius * Math.sin(angle);
        nodePositions.set(node.id, { x, y, depth: node.depth });
      });

      // ===== RENDER LINKS =====
      const linkGroup = mainGroup.append('g').attr('class', 'links');

      linkGroup
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('x1', (d: any) => {
          const sourcePos = nodePositions.get(d.source);
          const targetPos = nodePositions.get(d.target);
          if (!sourcePos || !targetPos) return 0;
          
          // Calculate direction vector
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance === 0) return sourcePos.x;
          
          // Get source node radius and move toward target by that amount
          const sourceNodeData = nodes.find(n => n.id === d.source);
          const sourceRadius = sourceNodeData ? getNodeSizeByDepth(sourceNodeData.depth) : 0;
          
          return sourcePos.x + (dx / distance) * sourceRadius;
        })
        .attr('y1', (d: any) => {
          const sourcePos = nodePositions.get(d.source);
          const targetPos = nodePositions.get(d.target);
          if (!sourcePos || !targetPos) return 0;
          
          // Calculate direction vector
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance === 0) return sourcePos.y;
          
          // Get source node radius and move toward target by that amount
          const sourceNodeData = nodes.find(n => n.id === d.source);
          const sourceRadius = sourceNodeData ? getNodeSizeByDepth(sourceNodeData.depth) : 0;
          
          return sourcePos.y + (dy / distance) * sourceRadius;
        })
        .attr('x2', (d: any) => {
          const sourcePos = nodePositions.get(d.source);
          const targetPos = nodePositions.get(d.target);
          if (!sourcePos || !targetPos) return 0;
          
          // Calculate direction vector
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance === 0) return targetPos.x;
          
          // Get target node radius and move toward source by that amount
          const targetNodeData = nodes.find(n => n.id === d.target);
          const targetRadius = targetNodeData ? getNodeSizeByDepth(targetNodeData.depth) : 0;
          
          return targetPos.x - (dx / distance) * targetRadius;
        })
        .attr('y2', (d: any) => {
          const sourcePos = nodePositions.get(d.source);
          const targetPos = nodePositions.get(d.target);
          if (!sourcePos || !targetPos) return 0;
          
          // Calculate direction vector
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance === 0) return targetPos.y;
          
          // Get target node radius and move toward source by that amount
          const targetNodeData = nodes.find(n => n.id === d.target);
          const targetRadius = targetNodeData ? getNodeSizeByDepth(targetNodeData.depth) : 0;
          
          return targetPos.y - (dy / distance) * targetRadius;
        })
        .attr('stroke', (d: any) => {
          if (['predation', 'parasitism'].includes(d.type)) {
            return getRelationshipColor(d.type);
          }
          return getRelationshipColor(d.type);
        })
        .attr('stroke-width', (d: any) => getLinkStrokeWidth(d.obligate))
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', (d: any) => {
          if (d.type === 'parasitism') return '4,2';
          return 'none';
        })
        .attr('marker-end', (d: any) => {
          if (d.type === 'predation') return 'url(#arrowPredation)';
          if (d.type === 'parasitism') return 'url(#arrowParasitism)';
          return 'none';
        })
        .attr('opacity', 0.7);

      // ===== RENDER NODES =====
      const nodeGroup = mainGroup.append('g').attr('class', 'nodes');

      const nodeElements = nodeGroup
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', (d: any) => `node node-${d.id}`)
        .attr('transform', (d: any) => {
          const pos = nodePositions.get(d.id);
          return `translate(${pos?.x ?? 0},${pos?.y ?? 0})`;
        });

      // Node circles
      nodeElements
        .append('circle')
        .attr('r', (d: any) => getNodeSizeByDepth(d.depth))
        .attr('fill', (d: any) => {
          // Use bolder color for focal node
          if (d.depth === 0) return '#cc8800';
          return getFormColor(d.form);
        })
        .attr('stroke', (d: any) => (d.depth === 0 ? '#333' : '#666'))
        .attr('stroke-width', (d: any) => (d.depth === 0 ? 3 : 2))
        .attr('opacity', (d: any) => getNodeOpacityByDepth(d.depth))
        .style('cursor', 'pointer');

      // Helper function for smart text wrapping
      const wrapText = (text: string, maxCharsPerLine: number = 10): string[] => {
        if (text.length <= maxCharsPerLine) {
          return [text];
        }

        // Try to split at word boundaries
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);

        // If still only 1 line, force split at maxCharsPerLine
        if (lines.length === 1) {
          const line = lines[0];
          if (line.length > maxCharsPerLine) {
            return [line.substring(0, maxCharsPerLine), line.substring(maxCharsPerLine)];
          }
        }

        return lines.slice(0, 2); // Max 2 lines
      };

      // Node labels with smart wrapping
      nodeElements
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', (d: any) => {
          if (d.depth === 0) return '0.9em';
          if (d.depth === 1) return '0.75em';
          return '0.6em';
        })
        .attr('font-weight', (d: any) => (d.depth === 0 ? 'bold' : 'normal'))
        .attr('fill', '#333')
        .attr('pointer-events', 'none')
        .each(function (d: any) {
          const textElement = d3.select(this);
          const lines = wrapText(d.name || '');

          // Vertical line spacing in em units
          const lineHeightEm = 1.4;
          // Position first line at vertical offset
          const startOffset = (lines.length - 1) * lineHeightEm * -0.5;

          lines.forEach((line, i) => {
            if (i === 0) {
              // First tspan gets explicit y position in em
              textElement
                .append('tspan')
                .attr('x', 0)
                .attr('y', startOffset + 'em')
                .text(line);
            } else {
              // Subsequent tspans use dy for relative positioning
              textElement
                .append('tspan')
                .attr('x', 0)
                .attr('dy', lineHeightEm + 'em')
                .text(line);
            }
          });
        });

      // ===== INTERACTIONS =====
      nodeElements
        .on('click', (_event: any, d: any) => {
          if (onNodeClick && d.depth > 0) {
            // Only allow clicking on non-focal species nodes
            onNodeClick(d.id);
          }
        })
        .on('mouseenter', function (this: SVGGElement) {
          d3.select(this)
            .selectAll('circle')
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('filter', 'drop-shadow(0 0 4px rgba(0,0,0,0.3))');
        } as any)
        .on('mouseleave', function (this: SVGGElement, d: any) {
          d3.select(this)
            .selectAll('circle')
            .transition()
            .duration(200)
            .attr('opacity', getNodeOpacityByDepth(d.depth))
            .attr('filter', 'none');
        } as any);

      // Ensure nodes are rendered on top of links
      nodeGroup.raise();

      // ===== ZOOM/PAN (only for maxDepth=3) =====
      if (maxDepth === 3) {
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .on('zoom', (event: any) => {
            mainGroup.attr('transform', event.transform);
          });

        svg.call(zoom);
      }
    } catch (error) {
      console.error('Error rendering RelationshipBubbleTree:', error);
    }
  }, [focalId, speciesById, symbiosisBySpeciesId, dimensions, maxDepth, onNodeClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: providedWidth ? `${providedWidth}px` : '100%',
        height: providedHeight ? `${providedHeight}px` : '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <svg
        ref={svgRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

export default RelationshipBubbleTree;
