import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Species } from '../types';
import {
  HABITAT_DEFINITIONS,
  HABITAT_HIERARCHY,
  getHabitatExamples,
  type HabitatHierarchyNode,
} from '../lib/learnContent';
import { habitatIcon, habitatLabel } from '../lib/labels';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface Props {
  speciesById: Map<string, Species>;
}

function getHabitatSpeciesCount(habitatKey: string, speciesById: Map<string, Species>): number {
  return Array.from(speciesById.values()).filter(
    s => Array.isArray(s.habitat) && s.habitat.includes(habitatKey),
  ).length;
}

function getGroupSpeciesCount(
  node: HabitatHierarchyNode,
  speciesById: Map<string, Species>,
): number {
  const childKeys = node.children?.map(c => c.key) ?? [];
  const seen = new Set<string>();
  Array.from(speciesById.values()).forEach(s => {
    if (Array.isArray(s.habitat) && s.habitat.some(h => childKeys.includes(h))) {
      seen.add(s.id);
    }
  });
  return seen.size;
}

function HabitatNodeItem({
  node,
  speciesById,
  expandedNodes,
  onToggleNode,
}: {
  node: HabitatHierarchyNode;
  speciesById: Map<string, Species>;
  expandedNodes: Set<string>;
  onToggleNode: (key: string) => void;
}) {
  const definition = HABITAT_DEFINITIONS[node.key];
  if (!definition) return null;

  const isExpanded = expandedNodes.has(node.key);
  const hasChildren = node.children && node.children.length > 0;
  const displayCount = hasChildren
    ? getGroupSpeciesCount(node, speciesById)
    : getHabitatSpeciesCount(node.key, speciesById);

  return (
    <div>
      <button
        onClick={() => onToggleNode(node.key)}
        className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
      >
        <span className="text-base flex-shrink-0">{habitatIcon(node.key)}</span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-stone-800">
          {definition.label}
        </span>
        {displayCount > 0 && (
          <span className="text-xs text-stone-400 flex-shrink-0">{displayCount}</span>
        )}
        <span className="text-xs text-stone-300 flex-shrink-0">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-8 pr-3 pb-1.5">
          <p className="text-xs text-stone-500 leading-relaxed">{definition.description}</p>

          {hasChildren && (
            <div className="mt-2 space-y-1">
              {node.children!.map(child => {
                const childDef = HABITAT_DEFINITIONS[child.key];
                const childExamples = getHabitatExamples(child.key, speciesById);
                const childCount = getHabitatSpeciesCount(child.key, speciesById);
                if (!childDef) return null;
                return (
                  <details key={child.key} className="group">
                    <summary className="flex items-center gap-1.5 cursor-pointer list-none py-0.5 hover:text-stone-900">
                      <span className="text-xs text-stone-300 group-open:hidden">▸</span>
                      <span className="text-xs text-stone-300 hidden group-open:inline">▾</span>
                      <span className="text-xs font-medium text-stone-700">
                        {habitatLabel(child.key)}
                      </span>
                      {childCount > 0 && (
                        <span className="text-xs text-stone-400">({childCount})</span>
                      )}
                    </summary>
                    <div className="pl-4 pb-1">
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {childDef.description}
                      </p>
                      {childExamples.length > 0 && (
                        <p className="text-xs text-stone-500 mt-1">
                          <span className="font-medium">e.g.</span>{' '}
                          {childExamples.map((sp, idx) => (
                            <span key={sp.id}>
                              <ExampleSpeciesLink species={sp} />
                              {idx < childExamples.length - 1 && (
                                <span className="text-stone-400">, </span>
                              )}
                            </span>
                          ))}
                          {' · '}
                          <Link
                            to={`/?habitat=${child.key}`}
                            className="text-emerald-600 hover:underline"
                          >
                            see all
                          </Link>
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HabitatHierarchySection({ speciesById }: Props) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (key: string) => {
    const next = new Set(expandedNodes);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setExpandedNodes(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Habitat Types</h2>
        <p className="text-sm text-stone-600 mt-1">
          Habitats grouped by broad environment type. Click to expand and explore.
        </p>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {HABITAT_HIERARCHY.map(node => (
          <div key={node.key} className="px-2 py-1">
            <HabitatNodeItem
              node={node}
              speciesById={speciesById}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
