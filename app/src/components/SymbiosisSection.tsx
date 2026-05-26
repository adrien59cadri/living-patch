import type { Species, Symbiosis } from '../types';
import { SYMBIOSIS_DEFINITIONS, getSymbiosisByType, getSymbiosisExample } from '../lib/learnContent';
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Symbiotic Relations</h2>
        <p className="text-sm text-stone-600 mt-1">
          Species interact in different ways. Click to learn about each type of relationship.
        </p>
      </div>

      <div className="space-y-2">
        {symbiosisTypes.map(([typeKey, definition]) => {
          const relationships = getSymbiosisByType(typeKey, symbiosis);
          const example = getSymbiosisExample(typeKey, symbiosis);
          const isExpanded = expanded === typeKey;

          return (
            <div
              key={typeKey}
              className="border border-stone-200 rounded-lg p-4 bg-white"
            >
              <button
                onClick={() => onToggle(isExpanded ? null : typeKey)}
                className="w-full flex items-start justify-between hover:bg-stone-50 rounded p-2 -m-2"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-stone-800">{definition.label}</h3>
                  <p className="text-xs text-stone-500">
                    {relationships.length}{' '}
                    {relationships.length === 1 ? 'relationship' : 'relationships'}
                  </p>
                </div>
                <span className="text-stone-400 text-xl flex-shrink-0">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {definition.explanation}
                  </p>

                  {example && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Example from our region
                      </p>
                      <div className="text-sm space-y-1">
                        {example.members.map((memberId, index) => {
                          const member = speciesById.get(memberId);
                          return (
                            <div key={memberId}>
                              {member && <ExampleSpeciesLink species={member} />}
                              {index < example.members.length - 1 && (
                                <span className="text-stone-400 mx-1">↔</span>
                              )}
                            </div>
                          );
                        })}
                        {example.notes && (
                          <p className="text-xs text-stone-600 italic mt-2">
                            {example.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {relationships.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        All relationships ({relationships.length})
                      </p>
                      <details className="text-xs text-stone-600">
                        <summary className="cursor-pointer hover:text-stone-700">
                          Expand to see all
                        </summary>
                        <div className="mt-2 space-y-1 ml-2 pl-2 border-l border-stone-200">
                          {relationships.map((rel, idx) => (
                            <div key={idx} className="text-xs text-stone-600">
                              {rel.members.map((m) => speciesById.get(m)?.common_name).join(' ↔ ')}
                              {rel.obligate && ' (obligate)'}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
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
