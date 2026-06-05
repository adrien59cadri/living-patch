import type { Species } from '../types';
import { ECOLOGICAL_STATUS_DESCRIPTIONS } from '../lib/designTokens';
import { EcologicalStatusBadge } from './EcologicalStatusBadge';
import ExampleSpeciesLink from './ExampleSpeciesLink';

type EcologicalCode = 'i' | 'nb' | 'nnna';

const STATUS_ORDER: EcologicalCode[] = ['i', 'nb', 'nnna'];

const STATUS_SHORT: Record<EcologicalCode, string> = {
  i:    'Non-native species spreading aggressively or causing ecological damage.',
  nb:   'Native species that spreads aggressively and outcompetes other natives.',
  nnna: 'Introduced species that remain largely localized; low ecological threat.',
};

interface Props {
  expanded: string | null;
  onToggle: (status: string | null) => void;
  speciesById: Map<string, Species>;
}

function getSpeciesWithCode(code: EcologicalCode, speciesById: Map<string, Species>): Species[] {
  const result: Species[] = [];
  speciesById.forEach(s => { if (s.status === code) result.push(s); });
  return result.sort((a, b) => {
    const na = typeof a.common_name === 'string' ? a.common_name : a.common_name.en;
    const nb = typeof b.common_name === 'string' ? b.common_name : b.common_name.en;
    return na.localeCompare(nb);
  });
}

export default function EcologicalStatusSection({ expanded, onToggle, speciesById }: Props) {
  const presentCodes = STATUS_ORDER.filter(code => {
    let found = false;
    speciesById.forEach(s => { if (s.status === code) found = true; });
    return found;
  });

  if (presentCodes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Ecological Status</h2>
        <p className="text-sm text-stone-600 mt-1">
          Not all species occupy the same ecological role. Some natives spread aggressively;
          some non-native introductions are harmless. Click a category to see which species
          in this dataset carry that status.
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 space-y-1">
        <p><strong>Native (default)</strong> — Species that evolved in this region and fill a natural role.</p>
        <p><strong>Native Bully (NB)</strong> — Native but spreads aggressively, reducing local plant diversity.</p>
        <p><strong>Non-Native Non-Aggressive (NNNA)</strong> — Introduced by humans but not spreading; low threat.</p>
        <p><strong>Invasive (I)</strong> — Non-native AND spreading aggressively or damaging ecosystems.</p>
      </div>

      <div>
        {presentCodes.map(code => {
          const isExpanded = expanded === code;
          const matchingSpecies = getSpeciesWithCode(code, speciesById);

          return (
            <div key={code}>
              <button
                onClick={() => onToggle(isExpanded ? null : code)}
                className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
              >
                <EcologicalStatusBadge status={code} />
                <span className="flex-1 min-w-0 text-xs text-stone-500 italic">
                  {STATUS_SHORT[code]}
                </span>
                {matchingSpecies.length > 0 && (
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
                    {ECOLOGICAL_STATUS_DESCRIPTIONS[code]}
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
    </div>
  );
}
