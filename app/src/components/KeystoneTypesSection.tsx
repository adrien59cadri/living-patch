import type { Species } from '../types';
import { KEYSTONE_DEFINITIONS, KEYSTONE_HIERARCHY, getKeystonesByType } from '../lib/taxonomies';
import { getKeystoneIcon } from '../lib/designTokens';
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
        {KEYSTONE_HIERARCHY.map(parentNode => {
          const parentDef = KEYSTONE_DEFINITIONS[parentNode.key];
          const isExpanded = expanded === parentNode.key;
          const icon = getKeystoneIcon(parentNode.key);
          const allSpecies = getKeystonesByType(parentNode.key, speciesById);

          return (
            <div key={parentNode.key}>
              <button
                onClick={() => onToggle(isExpanded ? null : parentNode.key)}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                <span className="flex-1 min-w-0 text-sm font-medium text-stone-800">
                  {parentDef?.label ?? parentNode.key}
                </span>
                {allSpecies.length > 0 && (
                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {allSpecies.length}
                  </span>
                )}
                <span className="text-xs text-stone-300 flex-shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-4 pb-1.5">
                  <p className="text-xs text-stone-500 leading-relaxed px-2 pb-2">
                    {parentDef?.description}
                  </p>

                  {/* Subtypes */}
                  {parentNode.children?.map(childNode => {
                    const childDef = KEYSTONE_DEFINITIONS[childNode.key];
                    const childSpecies = speciesById
                      ? Array.from(speciesById.values()).filter(
                          s => s.keystone_type === childNode.key && s.is_keystone,
                        )
                      : [];
                    const childIcon = getKeystoneIcon(childNode.key);

                    return (
                      <div key={childNode.key} className="pl-3 border-l-2 border-stone-100 ml-2 mb-1">
                        <div className="flex items-center gap-1.5 py-1 px-2">
                          <span className="text-sm flex-shrink-0">{childIcon}</span>
                          <span className="text-xs font-medium text-stone-700">
                            {childDef?.label ?? childNode.key}
                          </span>
                          {childSpecies.length > 0 && (
                            <span className="text-xs text-stone-400 ml-auto">{childSpecies.length}</span>
                          )}
                        </div>
                        {childDef?.description && (
                          <p className="text-xs text-stone-500 leading-relaxed px-2 pb-1">
                            {childDef.description}
                          </p>
                        )}
                        {childSpecies.length > 0 && (
                          <p className="text-xs text-stone-500 px-2 pb-1.5">
                            {childSpecies.map((species, idx) => (
                              <span key={species.id}>
                                <ExampleSpeciesLink species={species} />
                                {idx < childSpecies.length - 1 && (
                                  <span className="text-stone-400">, </span>
                                )}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

