import type { Species } from '../types';
import { KEYSTONE_DEFINITIONS, getKeystonesByType } from '../lib/learnContent';
import ExampleSpeciesLink from './ExampleSpeciesLink';

const KEYSTONE_ICONS: Record<string, string> = {
  ecosystem_engineer: '⚙️',
  predator:           '🦅',
  mutualist:          '🤝',
  pollinator:         '🐝',
  host_plant:         '🌿',
  prey:               '🐭',
  structural:         '🌳',
};

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
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Keystone Characteristics</h2>
        <p className="text-sm text-stone-600 mt-1">
          Keystone species have outsized importance to their ecosystems. Click to learn what makes
          each type special.
        </p>
      </div>

      <div>
        {keystoneTypes.map(([typeKey, definition]) => {
          const keystoneSpecies = getKeystonesByType(typeKey, speciesById);
          const isExpanded = expanded === typeKey;
          const icon = KEYSTONE_ICONS[typeKey] ?? '⭐';

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
                {keystoneSpecies.length > 0 && (
                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {keystoneSpecies.length}
                  </span>
                )}
                <span className="text-xs text-stone-300 flex-shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-9 pr-3 pb-1.5">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {definition.description}
                  </p>
                  {keystoneSpecies.length > 0 && (
                    <p className="text-xs text-stone-500 mt-1">
                      {keystoneSpecies.map((species, idx) => (
                        <span key={species.id}>
                          <ExampleSpeciesLink species={species} />
                          {idx < keystoneSpecies.length - 1 && (
                            <span className="text-stone-400">, </span>
                          )}
                        </span>
                      ))}
                    </p>
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
