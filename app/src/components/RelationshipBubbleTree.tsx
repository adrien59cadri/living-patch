/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { HierarchyInput } from '../types';
import {
  getRelationshipColor,
  getNodeRadius,
  getNodeOpacity,
  getLabelSize,
  getLabelWeight,
} from '../lib/bubbleTreeUtils';

interface RelationshipBubbleTreeProps {
  /** ID of focal (center) species */
  focalId: string;
  /** Hierarchy data from buildBubbleTreeHierarchy */
  data: HierarchyInput;
  /** Callback when a species node is clicked */
  onNodeClick?: (speciesId: string) => void;
  /** Width in pixels (auto-detects container if not provided) */
  width?: number;
  /** Height in pixels (auto-detects container if not provided) */
  height?: number;
  /** Maximum depth to display (default 2) */
  maxDepth?: number;
}

/**
 * D3 Radial bubble tree (mind-map style) displaying species and their relationships
 *
 * Structure:
 * - Center (80px): Focal species, gold color, large bold text
 * - Middle (50px): Relationship categories (Mutualism, Predation, etc.), type-colored
 * - Outer (30px): Related species, white with outline, smaller text
 *
 * All connected by radial curves from focal → category → species
 */
export const RelationshipBubbleTree: React.FC<RelationshipBubbleTreeProps> = ({
  focalId,
  data,
  onNodeClick,
  width: providedWidth,
  height: providedHeight,
  maxDepth = 2,
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
    if (!svgRef.current || !data || dimensions.width === 0 || dimensions.height === 0) return;

    const margin = 40;
    const width = Math.max(dimensions.width - margin * 2, 300);
    const height = Math.max(dimensions.height - margin * 2, 300);
    const radius = Math.min(width, height) / 2;

    // Build D3 hierarchy
    const hierarchy = d3.hierarchy<HierarchyInput>(data);

    // Create radial tree layout
    const treeLayout = d3.tree<HierarchyInput>().size([2 * Math.PI, radius]);

    const root = treeLayout(hierarchy);

    // Collect all nodes and links
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any[] = root.descendants().filter(d => !maxDepth || d.depth <= maxDepth);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links: any[] = root.links().filter(d => !maxDepth || d.target.depth <= maxDepth);

    // Clear and setup SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${dimensions.width / 2},${dimensions.height / 2})`);

    // ===== LINKS =====
    const linkGroup = svg.append('g').attr('class', 'links');

    // Use d3.linkRadial for polar coordinates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkRadial = d3.linkRadial<any, any>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .source((d: any) => [d.source.x, d.source.y])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .target((d: any) => [d.target.x, d.target.y]);

    linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', (d: any) => linkRadial(d) as string)
      .attr('fill', 'none')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('stroke', (d: any) => {
        const nodeType = d.target.data.type;
        if (nodeType === 'species') {
          return getRelationshipColor(d.target.data.relationshipType);
        }
        return '#ccc';
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('stroke-dasharray', (d: any) => {
        // Dashed line for outer links (species level)
        return d.target.data.type === 'species' ? '3,3' : 'none';
      });

    // ===== NODES =====
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeElements = nodeGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('class', (d: any) => `node node-${d.data.type}`);

    // Node circles
    nodeElements
      .append('circle')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('r', (d: any) => getNodeRadius(d.data.type))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('fill', (d: any) => {
        if (d.data.type === 'focal') return '#fbbf24'; // gold
        if (d.data.type === 'category') {
          return getRelationshipColor(d.data.relationshipType);
        }
        return '#ffffff'; // white for species
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('stroke', (d: any) => {
        if (d.data.type === 'species') return '#333'; // dark outline for species
        return 'none';
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('stroke-width', (d: any) => {
        return d.data.type === 'species' ? 2 : 0;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('opacity', (d: any) => getNodeOpacity(d.data.type))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .style('cursor', (d: any) => (d.data.type === 'species' ? 'pointer' : 'default'));

    // Node labels (text)
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('font-size', (d: any) => `${getLabelSize(d.data.type)}em`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('font-weight', (d: any) => getLabelWeight(d.data.type))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('fill', (d: any) => {
        // Dark text for light backgrounds (focal, species)
        if (d.data.type === 'focal' || d.data.type === 'species') return '#333';
        // Light text for dark category backgrounds
        return '#ffffff';
      })
      .attr('pointer-events', 'none')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .text((d: any) => {
        const text = d.data.name || '';
        // Truncate long names for smaller nodes
        if (d.data.type === 'species' && text.length > 15) {
          return text.substring(0, 12) + '...';
        }
        if (d.data.type === 'category' && text.length > 20) {
          return text.substring(0, 17) + '...';
        }
        return text;
      })
      .style('word-wrap', 'break-word')
      .style('white-space', 'normal');

    // ===== INTERACTIONS =====
    // Click handler for species nodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickHandler = (_event: any, d: any) => {
      if (onNodeClick && d.data.id) {
        onNodeClick(d.data.id);
      }
    };

    nodeElements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any) => d.data.type === 'species')
      .on('click', clickHandler as any);

    // Hover effects (subtle)
    nodeElements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any) => d.data.type === 'species')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('mouseenter', function (this: SVGGElement) {
        d3.select(this).selectAll('circle').attr('opacity', 1.0).attr('filter', 'drop-shadow(0 0 4px rgba(0,0,0,0.2))');
      } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('mouseleave', function (this: SVGGElement) {
        d3.select(this)
          .selectAll('circle')
          .attr('opacity', 0.8)
          .attr('filter', 'none');
      } as any);

    // ===== LEGEND (optional, positioned in corner) =====
    const legend = svg.append('g').attr('class', 'legend').attr('transform', `translate(-${radius - 60},-${radius - 100})`);

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '0.9em')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Relationships');

    const categories = [
      { label: 'Mutualism', color: '#27ae60' },
      { label: 'Predation', color: '#e74c3c' },
      { label: 'Parasitism', color: '#f39c12' },
      { label: 'Competition', color: '#95a5a6' },
      { label: 'Commensalism', color: '#3b82f6' },
    ];

    categories.forEach((cat, i) => {
      const legendY = 25 + i * 18;
      legend
        .append('circle')
        .attr('cx', 5)
        .attr('cy', legendY)
        .attr('r', 4)
        .attr('fill', cat.color);
      legend
        .append('text')
        .attr('x', 15)
        .attr('y', legendY)
        .attr('font-size', '0.75em')
        .attr('fill', '#333')
        .attr('dominant-baseline', 'central')
        .text(cat.label);
    });
  }, [data, dimensions, maxDepth, onNodeClick, focalId]);

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
