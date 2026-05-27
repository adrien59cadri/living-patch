import { useState } from 'react';
import { Link } from 'react-router-dom';
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

function getTotalDescendantCount(
  node: FormHierarchyNode,
  speciesById: Map<string, Species>,
  taxonomicGroupIds: Set<string>,
): number {
  let total = 0;

  const countForm = (formKey: string) => {
    return Array.from(speciesById.values()).filter(
      (s) => s.form === formKey && !taxonomicGroupIds.has(s.id),
    ).length;
  };

  total += countForm(node.key);

  if (node.children) {
    for (const child of node.children) {
      total += getTotalDescendantCount(child, speciesById, taxonomicGroupIds);
    }
  }

  return total;
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

  const displayCount = hasChildren
    ? getTotalDescendantCount(node, speciesById, taxonomicGroupIds)
    : exampleCount;

  const indent = level * 1.25;

  return (
    <div>
      <button
        onClick={() => onToggleNode(node.key)}
        style={{ paddingLeft: `${indent + 0.5}rem` }}
        className="w-full flex items-center gap-2 py-1.5 pr-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
      >
        <span className="text-base flex-shrink-0">{formIcon(node.key)}</span>
        <span className={`flex-1 min-w-0 text-sm ${level === 0 ? 'font-semibold' : 'font-medium'} text-stone-800`}>
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
        <div
          style={{ paddingLeft: `${indent + 2.25}rem` }}
          className="pr-3 pb-1.5"
        >
          <p className="text-xs text-stone-500 leading-relaxed">
            {definition.description}
          </p>
          {examples.length > 0 && (
            <p className="text-xs text-stone-500 mt-1">
              <span className="font-medium">e.g.</span>{' '}
              {examples.map((species, idx) => (
                <span key={species.id}>
                  <ExampleSpeciesLink species={species} />
                  {idx < examples.length - 1 && <span className="text-stone-400">, </span>}
                </span>
              ))}
              {' · '}
              <Link
                to={`/?form=${node.key}`}
                className="text-emerald-600 hover:underline"
              >
                see all
              </Link>
            </p>
          )}
        </div>
      )}

      {isExpanded && hasChildren && (
        <div>
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
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Form Hierarchy</h2>
        <p className="text-sm text-stone-600 mt-1">
          Species are classified by their biological form. Click to expand and learn more.
        </p>
      </div>

      <div>
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
