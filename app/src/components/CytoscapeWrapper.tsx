import { useEffect, useRef } from 'react';
import Cytoscape from 'cytoscape';

interface CytoscapeWrapperProps {
  elements: any[];
  style: React.CSSProperties;
  stylesheet: any[];
  layout: any;
  wheelSensitivity?: number;
  boxSelectionEnabled?: boolean;
  autounselectify?: boolean;
  on?: Record<string, (evt: any) => void>;
}

export function CytoscapeWrapper({
  elements,
  style,
  stylesheet,
  layout,
  wheelSensitivity = 0.1,
  boxSelectionEnabled = false,
  autounselectify = true,
  on = {},
}: CytoscapeWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Validate elements before passing to cytoscape
      const nodeIds = new Set<string>();
      const validElements: any[] = [];

      // First pass: collect all node IDs and add nodes
      for (const el of elements) {
        if (el.data.source === undefined) {
          // It's a node
          nodeIds.add(el.data.id);
          validElements.push(el);
        }
      }

      // Second pass: add edges only if both source and target nodes exist
      for (const el of elements) {
        if (el.data.source !== undefined) {
          // It's an edge
          const sourceId = typeof el.data.source === 'string' ? el.data.source : el.data.source.id;
          const targetId = typeof el.data.target === 'string' ? el.data.target : el.data.target.id;

          if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
            validElements.push(el);
          }
        }
      }

      // Initialize Cytoscape
      const cy = Cytoscape({
        container: containerRef.current,
        elements: validElements,
        style: stylesheet,
        layout,
        wheelSensitivity,
        boxSelectionEnabled,
        autounselectify,
      });

      cyRef.current = cy;

      // Attach event handlers
      Object.entries(on).forEach(([event, handler]) => {
        cy.on(event, handler);
      });

      return () => {
        cy.destroy();
      };
    } catch (error) {
      console.error('Error initializing Cytoscape:', error);
    }
  }, [elements, stylesheet, layout, wheelSensitivity, boxSelectionEnabled, autounselectify, on]);

  return <div ref={containerRef} style={style} />;
}
