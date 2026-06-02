import { useState } from 'react';
import type { TaxonomyNode } from '../lib/taxonomyUtils';

interface Props {
  nodes: TaxonomyNode[];
  onSelectSpecies?: (speciesId: string) => void;
  expandedByDefault?: boolean;
}

function TaxonomyTreeNode({
  node,
  onSelectSpecies,
  defaultExpanded,
}: {
  node: TaxonomyNode;
  onSelectSpecies?: (speciesId: string) => void;
  defaultExpanded: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && node.children.length > 0);
  const hasChildren = node.children.length > 0;
  const paddingLeft = `${node.depth * 1.5}rem`;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-stone-100 rounded cursor-pointer group"
        style={{ paddingLeft }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900"
          >
            <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
        {!hasChildren && <span className="w-5" />}

        <button
          onClick={() => {
            if (node.type === 'species' && onSelectSpecies) {
              onSelectSpecies(node.id);
            }
          }}
          className={`flex-1 text-left ${
            node.type === 'species'
              ? 'text-stone-700 hover:text-stone-900 underline'
              : 'font-medium text-stone-900'
          }`}
        >
          {node.name}
        </button>

        {node.speciesCount > 0 && node.type === 'group' && (
          <span className="text-xs text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full flex-shrink-0">
            {node.speciesCount} species
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TaxonomyTreeNode
              key={child.id}
              node={child}
              onSelectSpecies={onSelectSpecies}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaxonomyTree({ nodes, onSelectSpecies, expandedByDefault = false }: Props) {
  if (nodes.length === 0) {
    return <p className="text-sm text-stone-500">No taxonomy data available</p>;
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-1">
      {nodes.map(node => (
        <TaxonomyTreeNode
          key={node.id}
          node={node}
          onSelectSpecies={onSelectSpecies}
          defaultExpanded={expandedByDefault}
        />
      ))}
    </div>
  );
}
