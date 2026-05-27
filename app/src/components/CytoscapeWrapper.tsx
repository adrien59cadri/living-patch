import { useEffect, useRef } from 'react';
import Cytoscape from 'cytoscape';

export interface ElementData {
  id?: string;
  source?: string | Record<string, unknown>;
  target?: string | Record<string, unknown>;
  [key: string]: unknown;
}

export interface Element {
  data: ElementData;
}

interface CytoscapeWrapperProps {
  elements: Element[];
  style: React.CSSProperties;
  stylesheet: Cytoscape.StylesheetCSS[];
  layout: Cytoscape.LayoutOptions;
  wheelSensitivity?: number;
  boxSelectionEnabled?: boolean;
  autounselectify?: boolean;
  on?: Record<string, (evt: Cytoscape.EventObject) => void>;
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
      const validElements: Element[] = [];

      // First pass: collect all node IDs and add nodes
      for (const el of elements) {
        if (el.data.source === undefined && el.data.id) {
          // It's a node
          nodeIds.add(el.data.id);
          validElements.push(el);
        }
      }

      // Second pass: add edges only if both source and target nodes exist
      for (const el of elements) {
        if (el.data.source !== undefined && el.data.target !== undefined) {
          // It's an edge
          const sourceId = typeof el.data.source === 'string' ? el.data.source : String((el.data.source as Record<string, unknown>).id);
          const targetId = typeof el.data.target === 'string' ? el.data.target : String((el.data.target as Record<string, unknown>).id);

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
