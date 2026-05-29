import type { Species, Symbiosis } from '../types';
import { SYMBIOSIS_DEFINITIONS, getSymbiosisByType, getSymbiosisExample } from '../lib/learnContent';
import { getSymbiosisIcon } from '../lib/designTokens';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface SymbiosisSectionProps {
  expanded: string | null;
  onToggle: (type: string | null) => void;
  speciesById: Map<string, Species>;
  symbiosis: Symbiosis[];
}

export default function SymbiosisSection({
  expanded,
  onToggle,
  speciesById,
  symbiosis,
}: SymbiosisSectionProps) {
  const symbiosisTypes = Object.entries(SYMBIOSIS_DEFINITIONS) as Array<
    [
      'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism',
      (typeof SYMBIOSIS_DEFINITIONS)[keyof typeof SYMBIOSIS_DEFINITIONS],
    ]
  >;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Symbiotic Relations</h2>
        <p className="text-sm text-stone-600 mt-1">
          Species interact in different ways. Click to learn about each type of relationship.
        </p>
      </div>

      <div>
        {symbiosisTypes.map(([typeKey, definition]) => {
          const relationships = getSymbiosisByType(typeKey, symbiosis);
          const example = getSymbiosisExample(typeKey, symbiosis);
          const isExpanded = expanded === typeKey;
          const icon = getSymbiosisIcon(typeKey);

          return (
            <div key={typeKey}>
              <button
                onClick={() => onToggle(isExpanded ? null : typeKey)}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                <span className="flex-1 min-w-0 text-sm font-medium text-stone-800">
                  {definition.label}
                </span>
                {relationships.length > 0 && (
                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {relationships.length}
                  </span>
                )}
                <span className="text-xs text-stone-300 flex-shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-9 pr-3 pb-1.5 space-y-1.5">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {definition.explanation}
                  </p>

                  {example && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-0.5">
                        Example from our region
                      </p>
                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-1">
                        {example.members.map((memberId, index) => {
                          const member = speciesById.get(memberId);
                          return (
                            <span key={memberId} className="flex items-center gap-x-1">
                              {member && <ExampleSpeciesLink species={member} />}
                              {index < example.members.length - 1 && (
                                <span className="text-stone-300">↔</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      {example.notes && (
                        <p className="text-xs text-stone-400 italic mt-0.5">
                          {example.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {relationships.length > 0 && (
                    <details className="text-xs text-stone-500">
                      <summary className="cursor-pointer text-stone-400 hover:text-stone-600 select-none">
                        All {relationships.length} relationships
                      </summary>
                      <div className="mt-1 space-y-0.5 ml-2 pl-2 border-l border-stone-200">
                        {relationships.map((rel, idx) => (
                          <div key={idx} className="text-xs text-stone-500">
                            {rel.members.map((m) => speciesById.get(m)?.common_name).join(' ↔ ')}
                            {rel.strength !== 'incidental' ? ` (${rel.strength})` : ''}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
