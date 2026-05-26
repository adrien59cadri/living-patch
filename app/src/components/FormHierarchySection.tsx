import { useState } from 'react';
import type { Species } from '../types';
import { FORM_DEFINITIONS, getFormExamples, FORM_HIERARCHY, type FormHierarchyNode } from '../lib/learnContent';
import { formIcon } from '../lib/labels';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface FormHierarchySectionProps {
  expanded: string | null;
  onToggle: (form: string | null) => void;
  speciesById: Map<string, Species>;
  taxonomicGroupIds?: Set<string>;
}

function FormNodeItem({
  node,
  speciesById,
  taxonomicGroupIds,
  expandedNodes,
  onToggleNode,
  level = 0,
}: {
  node: FormHierarchyNode;
  speciesById: Map<string, Species>;
  taxonomicGroupIds: Set<string>;
  expandedNodes: Set<string>;
  onToggleNode: (key: string) => void;
  level?: number;
}) {
  const definition = FORM_DEFINITIONS[node.key];
  if (!definition) return null;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.key);
  const examples = getFormExamples(node.key, speciesById);
  const exampleCount = Array.from(speciesById.values()).filter(
    (s) => s.form === node.key && !taxonomicGroupIds.has(s.id),
  ).length;

  return (
    <div key={node.key} className="space-y-2">
      <div
        style={{ paddingLeft: `${level * 1.5}rem` }}
        className="border border-stone-200 rounded-lg p-4 bg-white hover:bg-stone-50 transition-colors"
      >
        <button
          onClick={() => onToggleNode(node.key)}
          className="w-full flex items-start justify-between"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {hasChildren && (
              <span className="text-stone-400 text-lg flex-shrink-0 pt-0.5">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            {!hasChildren && <span className="text-lg flex-shrink-0 pt-0.5 w-6" />}
            <span className="text-2xl flex-shrink-0">{formIcon(node.key)}</span>
            <div className="text-left min-w-0">
              <h3 className="font-semibold text-stone-800">{definition.label}</h3>
              {exampleCount > 0 && (
                <p className="text-xs text-stone-500">
                  {exampleCount} {exampleCount === 1 ? 'species' : 'species'}
                </p>
              )}
            </div>
          </div>
        </button>

        {isExpanded && !hasChildren && (
          <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
            <p className="text-sm text-stone-600 leading-relaxed">
              {definition.description}
            </p>

            {examples.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Examples
                </p>
                <div className="space-y-1">
                  {examples.map((species) => (
                    <div key={species.id} className="text-sm">
                      <ExampleSpeciesLink species={species} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isExpanded && hasChildren && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {definition.description}
            </p>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {node.children!.map((child) => (
            <FormNodeItem
              key={child.key}
              node={child}
              speciesById={speciesById}
              taxonomicGroupIds={taxonomicGroupIds}
              expandedNodes={expandedNodes}
              onToggleNode={onToggleNode}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FormHierarchySection({
  speciesById,
  taxonomicGroupIds = new Set(),
}: Omit<FormHierarchySectionProps, 'expanded' | 'onToggle'>) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (key: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedNodes(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Form Hierarchy</h2>
        <p className="text-sm text-stone-600 mt-1">
          Species are classified by their biological form. Click to expand and learn more.
        </p>
      </div>

      <div className="space-y-2">
        {FORM_HIERARCHY.map((node) => (
          <FormNodeItem
            key={node.key}
            node={node}
            speciesById={speciesById}
            taxonomicGroupIds={taxonomicGroupIds}
            expandedNodes={expandedNodes}
            onToggleNode={toggleNode}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
