/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Species, Symbiosis } from '../types';
import {
  transformToNodesEdges,
  getFormColor,
  getNodeSizeByDepth,
  getNodeOpacityByDepth,
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
      
      // Predation arrow (pastel coral)
      defs
        .append('marker')
        .attr('id', 'arrowPredation')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('refX', 6)
        .attr('refY', 2)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,4 L6,2 z')
        .attr('fill', '#FF9999');

      // Parasitism arrow (pastel orange)
      defs
        .append('marker')
        .attr('id', 'arrowParasitism')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('refX', 6)
        .attr('refY', 2)
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,4 L6,2 z')
        .attr('fill', '#FFB366');

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

      // Depth-1 nodes: assign to sectors (quadrants) for hierarchical layout
      const depth1Nodes = nodes.filter(n => n.depth === 1);
      const depth1Count = depth1Nodes.length;
      const depth1Radius = Math.min(150, maxRadius * 0.4);
      const depth2Radius = Math.min(250, maxRadius * 0.7);
      
      // Divide circle into sectors for hierarchy: each depth-1 node gets a sector
      const sectorAngle = (2 * Math.PI) / Math.max(1, depth1Count);
      
      // Build parent->children map for hierarchical positioning
      const childrenByParent = new Map<string, typeof nodes>();
      links.forEach((link: any) => {
        const sourceId: string = typeof link.source === 'string' ? link.source : (link.source?.id || '');
        const targetId: string = typeof link.target === 'string' ? link.target : (link.target?.id || '');
        
        if (!childrenByParent.has(sourceId)) {
          childrenByParent.set(sourceId, []);
        }
        const childNode = nodes.find(n => n.id === targetId);
        if (childNode && childNode.depth >= 1) {
          childrenByParent.get(sourceId)!.push(childNode);
        }
      });
      
      // Position depth-1 nodes at sector centers, and their children within sectors
      depth1Nodes.forEach((node, i) => {
        // Place parent at center of sector
        const sectorCenterAngle = i * sectorAngle;
        const x = centerX + depth1Radius * Math.cos(sectorCenterAngle);
        const y = centerY + depth1Radius * Math.sin(sectorCenterAngle);
        nodePositions.set(node.id, { x, y, depth: 1 });
        
        // Position children within the parent's sector
        const children = childrenByParent.get(node.id) || [];
        const childCount = Math.max(1, children.length);
        const sectorWidth = sectorAngle * 0.75; // Use 75% of sector for children to avoid overlap
        
        children.forEach((child, childIndex) => {
          // Distribute children evenly within sector
          const childAngleOffset = (childIndex / childCount) * sectorWidth - (sectorWidth / 2);
          const childAngle = sectorCenterAngle + childAngleOffset;
          const childX = centerX + depth2Radius * Math.cos(childAngle);
          const childY = centerY + depth2Radius * Math.sin(childAngle);
          nodePositions.set(child.id, { x: childX, y: childY, depth: child.depth });
        });
      });
      
      // Handle any unpositioned deeper nodes (depth 3+)
      const unpositionedDeeper = nodes.filter(n => n.depth >= 2 && !nodePositions.has(n.id));
      const deeperCount = unpositionedDeeper.length;
      const deeperRadius = Math.min(300, maxRadius * 0.85);
      
      unpositionedDeeper.forEach((node, i) => {
        const angle = (i / Math.max(1, deeperCount)) * 2 * Math.PI;
        const x = centerX + deeperRadius * Math.cos(angle);
        const y = centerY + deeperRadius * Math.sin(angle);
        nodePositions.set(node.id, { x, y, depth: node.depth });
      });

      // ===== CALCULATE LINK ENDPOINTS =====
      interface LinkEndpoints {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      }

      const calculateLinkEndpoints = (link: any): LinkEndpoints => {
        const sourcePos = nodePositions.get(link.source);
        const targetPos = nodePositions.get(link.target);
        if (!sourcePos || !targetPos) return { x1: 0, y1: 0, x2: 0, y2: 0 };

        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return { x1: sourcePos.x, y1: sourcePos.y, x2: targetPos.x, y2: targetPos.y };

        const sourceNodeData = nodes.find(n => n.id === link.source);
        const targetNodeData = nodes.find(n => n.id === link.target);
        const sourceRadius = sourceNodeData ? getNodeSizeByDepth(sourceNodeData.depth) : 0;
        const targetRadius = targetNodeData ? getNodeSizeByDepth(targetNodeData.depth) : 0;

        return {
          x1: sourcePos.x + (dx / distance) * sourceRadius,
          y1: sourcePos.y + (dy / distance) * sourceRadius,
          x2: targetPos.x - (dx / distance) * targetRadius,
          y2: targetPos.y - (dy / distance) * targetRadius,
        };
      };

      // Pre-calculate all link endpoints
      const linkEndpointMap = new Map(links.map(link => [link, calculateLinkEndpoints(link)]));

      // ===== RENDER LINKS =====
      const linkGroup = mainGroup.append('g').attr('class', 'links');

      linkGroup
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'diagram-link')
        .attr('x1', (d: any) => linkEndpointMap.get(d)?.x1 ?? 0)
        .attr('y1', (d: any) => linkEndpointMap.get(d)?.y1 ?? 0)
        .attr('x2', (d: any) => linkEndpointMap.get(d)?.x2 ?? 0)
        .attr('y2', (d: any) => linkEndpointMap.get(d)?.y2 ?? 0)
        .attr('stroke', (d: any) => {
          if (['predation', 'parasitism'].includes(d.type)) {
            return getRelationshipColor(d.type);
          }
          return getRelationshipColor(d.type);
        })
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
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
        .attr('class', 'diagram-node')
        .attr('r', (d: any) => getNodeSizeByDepth(d.depth))
        .attr('fill', (d: any) => getFormColor(d.form))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .attr('opacity', (d: any) => getNodeOpacityByDepth(d.depth))
        .style('cursor', 'pointer');

      // Helper function for balanced text wrapping
      // Tries to split at word boundaries for natural breaks and balanced line lengths
      const wrapText = (text: string, maxCharsPerLine: number = 14): string[] => {
        if (text.length <= maxCharsPerLine) {
          return [text];
        }

        const words = text.split(' ');
        if (words.length === 1) {
          // Single word longer than max chars - force split
          return [text.substring(0, maxCharsPerLine), text.substring(maxCharsPerLine)];
        }

        // Try to find the best split point for balanced wrapping
        let bestSplit = 1;
        let bestBalance = Infinity;
        
        for (let i = 1; i < words.length; i++) {
          const line1 = words.slice(0, i).join(' ');
          const line2 = words.slice(i).join(' ');
          
          // Both lines must fit within maxCharsPerLine
          if (line1.length <= maxCharsPerLine && line2.length <= maxCharsPerLine) {
            // Prefer split that minimizes difference in line lengths (balanced)
            const balance = Math.abs(line1.length - line2.length);
            if (balance < bestBalance) {
              bestBalance = balance;
              bestSplit = i;
            }
          }
        }
        
        return [
          words.slice(0, bestSplit).join(' '),
          words.slice(bestSplit).join(' ')
        ];
      };

      // Node labels with smart wrapping
      nodeElements
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '0.75em')
        .attr('font-weight', (d: any) => (d.depth === 0 ? 'bold' : '500'))
        .attr('fill', '#333333')
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
        });

      // Ensure nodes are rendered on top of links
      nodeGroup.raise();

      // ===== LEGEND (bottom left) =====
      const formColors = Object.fromEntries(
        ['bird', 'plant', 'insect', 'mammal', 'amphibian', 'reptile']
          .map(form => [form, getFormColor(form)])
      );

      const relationshipColors = Object.fromEntries(
        ['mutualism', 'predation', 'parasitism', 'competition', 'commensalism']
          .map(rel => [rel, getRelationshipColor(rel)])
      );

      const legendGroup = svg.append('g').attr('class', 'legend');
      const legendX = 10;
      const legendY = dimensions.height - 50;

      // Helper to render legend section with items and dynamic spacing
      const renderLegendSection = (
        config: {
          label: string;
          items: Record<string, string>;
          y: number;
          isCircle: boolean;
        },
        startX: number
      ): number => {
        let x = startX;

        // Label
        legendGroup
          .append('text')
          .attr('x', x)
          .attr('y', config.y)
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(config.label);

        x += config.label.length * 6 + 5;

        // Items
        Object.entries(config.items).forEach(([name, color]) => {
          if (config.isCircle) {
            // Render circle for forms
            legendGroup
              .append('circle')
              .attr('class', 'legend-item')
              .attr('cx', x + 5)
              .attr('cy', config.y - 4)
              .attr('r', 4)
              .attr('fill', color);

            legendGroup
              .append('text')
              .attr('x', x + 12)
              .attr('y', config.y)
              .attr('font-size', '10px')
              .text(name);

            x += 10 + name.length * 5.5 + 8;
          } else {
            // Render line for relationships
            legendGroup
              .append('line')
              .attr('x1', x)
              .attr('y1', config.y - 3)
              .attr('x2', x + 10)
              .attr('y2', config.y - 3)
              .attr('stroke', color)
              .attr('stroke-width', 2);

            legendGroup
              .append('text')
              .attr('x', x + 15)
              .attr('y', config.y)
              .attr('font-size', '10px')
              .text(name);

            x += 10 + 5 + name.length * 5.5 + 8;
          }
        });

        return x;
      };

      // Render form legend (line 1)
      renderLegendSection(
        { label: 'form: ', items: formColors, y: legendY, isCircle: true },
        legendX
      );

      // Render relationship legend (line 2)
      renderLegendSection(
        { label: 'relation: ', items: relationshipColors, y: legendY + 15, isCircle: false },
        legendX
      );

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
