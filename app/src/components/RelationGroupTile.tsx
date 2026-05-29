import { useState } from 'react';
import type { RelationGroupEntry } from '../lib/relationships';
import { SpeciesTile } from './SpeciesTile';

interface Props {
  groupEntry: RelationGroupEntry;
}

export function RelationGroupTile({ groupEntry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { entries, strength, groupSlug } = groupEntry;

  const displayNames = entries
    .slice(0, 2)
    .map(e => e.species.common_name)
    .join(', ');
  const overflow = entries.length > 2 ? ` (+${entries.length - 2})` : '';

  return (
    <div
      className={[
        'rounded-lg border transition-all',
        strength === 'critical' ? 'border-l-2 border-l-amber-400' : 'border-stone-200',
      ].join(' ')}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-stone-50 rounded-lg"
        aria-expanded={expanded}
        aria-label={`${groupSlug} group — ${displayNames}${overflow}`}
      >
        <span className="text-stone-400 text-xs" aria-hidden>⊞</span>
        <span className="flex-1 min-w-0 text-sm font-medium text-stone-800 truncate">
          {displayNames}
          {overflow && <span className="text-stone-500 font-normal">{overflow}</span>}
        </span>
        {strength === 'critical' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium leading-tight shrink-0">
            Critical
          </span>
        )}
        {strength === 'important' && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium leading-tight shrink-0">
            Important
          </span>
        )}
        <span className="text-stone-400 text-xs shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {entries.map((entry, idx) => (
            <SpeciesTile key={`${groupSlug}-${idx}`} species={entry.species} related={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
