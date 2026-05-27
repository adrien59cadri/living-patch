import type { Species, Symbiosis, ForceGraphData, DiagramNode, DiagramLink } from '../types';

export function getNodeColor(relationshipType?: string): string {
  switch (relationshipType) {
    case 'mutualism':
      return '#22c55e'; // green
    case 'predation':
      return '#ef4444'; // red
    case 'parasitism':
      return '#a855f7'; // purple
    case 'competition':
      return '#f97316'; // orange
    case 'commensalism':
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
}

export function getNodeOpacity(depth: number): number {
  switch (depth) {
    case 0:
      return 1.0; // focal node
    case 1:
      return 1.0;
    case 2:
      return 0.5;
    case 3:
      return 0.25;
    default:
      return 1.0;
  }
}

export function getNodeSize(depth: number): number {
  switch (depth) {
    case 0:
      return 10; // focal node, slightly larger
    case 1:
      return 8;
    case 2:
      return 6;
    case 3:
      return 4;
    default:
      return 8;
  }
}

export function buildForceGraphData(
  focalSpeciesId: string,
  maxDepth: number,
  speciesById: Map<string, Species>,
  symbiosisBySpeciesId: Map<string, Symbiosis[]>
): ForceGraphData {
  const nodes = new Map<string, DiagramNode>();
  const links = new Map<string, DiagramLink>();
  const visited = new Set<string>();

  const addNode = (speciesId: string, depth: number, relationshipType?: string) => {
    if (visited.has(speciesId) || depth > maxDepth) return;

    const species = speciesById.get(speciesId);
    if (!species) return;

    nodes.set(speciesId, {
      id: speciesId,
      name: species.common_name,
      depth,
      relationshipType,
      val: getNodeSize(depth),
    });
  };

  const addLink = (sourceId: string, targetId: string, symbiosis: Symbiosis) => {
    const linkKey = [sourceId, targetId].sort().join('→');
    if (links.has(linkKey)) return;

    const isDirectional = symbiosis.type === 'predation' || symbiosis.type === 'parasitism';

    links.set(linkKey, {
      source: sourceId,
      target: targetId,
      relationshipType: symbiosis.type,
      obligate: symbiosis.obligate ?? false,
      directional: isDirectional,
    });
  };

  const traverse = (speciesId: string, depth: number) => {
    if (visited.has(speciesId) || depth > maxDepth) return;
    visited.add(speciesId);

    addNode(speciesId, depth);

    const symbioses = symbiosisBySpeciesId.get(speciesId) ?? [];

    for (const symbiosis of symbioses) {
      const partnerId = symbiosis.members.find(id => id !== speciesId);
      if (!partnerId) continue;

      addNode(partnerId, depth + 1, symbiosis.type);
      addLink(speciesId, partnerId, symbiosis);

      if (depth < maxDepth) {
        traverse(partnerId, depth + 1);
      }
    }
  };

  // Start traversal from focal species at depth 0
  traverse(focalSpeciesId, 0);

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
}

export function buildCytoscapeStyles(focalSpeciesId: string) {
  return [
    {
      selector: 'node',
      style: {
        'background-color': (ele: Record<string, unknown>) => getNodeColor((ele as Record<string, (key: string) => unknown>).data('relationshipType') as string),
        'width': (ele: Record<string, unknown>) => getNodeSize((ele as Record<string, (key: string) => unknown>).data('depth') as number) * 2.5,
        'height': (ele: Record<string, unknown>) => getNodeSize((ele as Record<string, (key: string) => unknown>).data('depth') as number) * 2.5,
        'opacity': (ele: Record<string, unknown>) => getNodeOpacity((ele as Record<string, (key: string) => unknown>).data('depth') as number),
        'label': 'data(name)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 10,
        'color': '#000',
        'text-opacity': 0.9,
      },
    },
    {
      selector: 'node[id = "' + focalSpeciesId + '"]',
      style: {
        'background-color': '#10b981',
        'border-color': '#10b981',
        'border-width': 2,
        'opacity': 1.0,
      },
    },
    {
      selector: 'node:hover',
      style: {
        'background-color': '#059669',
        'opacity': 1.0,
      },
    },
    {
      selector: 'edge',
      style: {
        'line-color': (ele: Record<string, unknown>) => getNodeColor((ele as Record<string, (key: string) => unknown>).data('relationshipType') as string),
        'width': (ele: Record<string, unknown>) => (ele as Record<string, (key: string) => unknown>).data('obligate') as boolean ? 2 : 1,
        'opacity': 0.5,
        'line-style': (ele: Record<string, unknown>) => {
          const el = ele as Record<string, () => Record<string, (key: string) => unknown>>;
          const sourceDepth = (el.source().data('depth') as number);
          const targetDepth = (el.target().data('depth') as number);
          if (sourceDepth === 1 && targetDepth === 1) return 'solid';
          if (sourceDepth === 2 || targetDepth === 2) return 'dashed';
          return 'dotted';
        },
      },
    },
    {
      selector: 'edge:hover',
      style: {
        'opacity': 1,
        'width': (ele: Record<string, unknown>) => (ele as Record<string, (key: string) => unknown>).data('obligate') as boolean ? 2.5 : 1.5,
      },
    },
  ];
}
