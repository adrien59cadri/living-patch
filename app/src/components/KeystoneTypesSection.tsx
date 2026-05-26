import type { Species } from '../types';
import { KEYSTONE_DEFINITIONS, getKeystonesByType } from '../lib/learnContent';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface KeystoneTypesSectionProps {
  expanded: string | null;
  onToggle: (type: string | null) => void;
  speciesById: Map<string, Species>;
}

export default function KeystoneTypesSection({
  expanded,
  onToggle,
  speciesById,
}: KeystoneTypesSectionProps) {
  const keystoneTypes = Object.entries(KEYSTONE_DEFINITIONS);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Keystone Characteristics</h2>
        <p className="text-sm text-stone-600 mt-1">
          Keystone species have outsized importance to their ecosystems. Click to learn what makes
          each type special.
        </p>
      </div>

      <div className="space-y-2">
        {keystoneTypes.map(([typeKey, definition]) => {
          const keystoneSpecies = getKeystonesByType(typeKey, speciesById);
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
                    {keystoneSpecies.length} {keystoneSpecies.length === 1 ? 'species' : 'species'}
                  </p>
                </div>
                <span className="text-stone-400 text-xl flex-shrink-0">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {definition.description}
                  </p>

                  {keystoneSpecies.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Species
                      </p>
                      <div className="space-y-1">
                        {keystoneSpecies.map((species) => (
                          <div key={species.id} className="text-sm">
                            <ExampleSpeciesLink species={species} />
                          </div>
                        ))}
                      </div>
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
