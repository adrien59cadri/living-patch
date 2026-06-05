import type { Species } from '../types';
import { CONSERVATION_DEFINITIONS, CONSERVATION_ORDERED } from '../lib/taxonomies';
import { CONSERVATION_STATUS_ICONS } from '../lib/designTokens';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface Props {
  expanded: string | null;
  onToggle: (status: string | null) => void;
  speciesById: Map<string, Species>;
}

function getSpeciesWithStatus(status: string, speciesById: Map<string, Species>): Species[] {
  const result: Species[] = [];
  speciesById.forEach(s => {
    if (s.conservation_status === status) result.push(s);
  });
  return result.sort((a, b) => {
    const na = typeof a.common_name === 'string' ? a.common_name : a.common_name.en;
    const nb = typeof b.common_name === 'string' ? b.common_name : b.common_name.en;
    return na.localeCompare(nb);
  });
}

export default function ConservationStatusSection({ expanded, onToggle, speciesById }: Props) {
  const presentStatuses = CONSERVATION_ORDERED.filter(code => {
    let found = false;
    speciesById.forEach(s => { if (s.conservation_status === code) found = true; });
    return found;
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Conservation Status</h2>
        <p className="text-sm text-stone-600 mt-1">
          IUCN Red List categories used to assess the extinction risk of each species. Click a tier
          to learn more and see which species in this dataset carry that status.
        </p>
      </div>

      <div>
        {CONSERVATION_ORDERED.map(code => {
          const def = CONSERVATION_DEFINITIONS[code];
          const icon = CONSERVATION_STATUS_ICONS[code] ?? '●';
          const isExpanded = expanded === code;
          const matchingSpecies = getSpeciesWithStatus(code, speciesById);
          const inDataset = matchingSpecies.length > 0;

          return (
            <div key={code}>
              <button
                onClick={() => onToggle(isExpanded ? null : code)}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                <span className="flex-1 min-w-0 text-sm font-medium text-stone-800">
                  {def?.label ?? code}
                </span>
                <span className="text-xs text-stone-400 flex-shrink-0 italic">
                  {def?.shortDescription}
                </span>
                {inDataset && (
                  <span className="text-xs text-stone-400 flex-shrink-0 ml-1">
                    {matchingSpecies.length}
                  </span>
                )}
                <span className="text-xs text-stone-300 flex-shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-4 pb-1.5">
                  <p className="text-xs text-stone-500 leading-relaxed px-2 pb-2">
                    {def?.description}
                  </p>
                  {matchingSpecies.length > 0 && (
                    <p className="text-xs text-stone-500 px-2 pb-1.5">
                      {matchingSpecies.map((s, idx) => (
                        <span key={s.id}>
                          <ExampleSpeciesLink species={s} />
                          {idx < matchingSpecies.length - 1 && (
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

      <p className="text-xs text-stone-400 px-2">
        Status data sourced from the{' '}
        <span className="font-medium">IUCN Red List of Threatened Species</span> via Wikipedia.
      </p>
    </div>
  );
}
