import { useState } from 'react';
import { getCommonName } from '../lib/labels';
import type { RelationGroupEntry } from '../lib/relationships';
import { SpeciesTile } from './SpeciesTile';

interface Props {
  groupEntry: RelationGroupEntry;
}

export function RelationGroupTile({ groupEntry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { entries, strength, fulfillment, symbiosis, groupSpecies } = groupEntry;
  const groupKey = symbiosis.source;

  const fulfillmentLabel = fulfillment === 'any' ? 'any of:' : fulfillment === 'all' ? 'all of:' : null;

  // When merged from a group proxy, show the group label; otherwise list member names
  const groupLabel = groupSpecies
    ? (groupSpecies as { label?: string }).label ?? getCommonName(groupSpecies.common_name)
    : null;

  const displayNames = groupLabel ?? (
    entries
      .slice(0, 2)
      .map(e => getCommonName(e.species.common_name))
      .join(', ')
  );
  const overflow = !groupLabel && entries.length > 2 ? ` (+${entries.length - 2})` : '';
  const memberCount = groupLabel ? ` · ${entries.length} in dataset` : '';

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
        aria-label={`${groupKey} group — ${displayNames}${overflow}`}
      >
        <span className="text-stone-400 text-xs" aria-hidden>⊞</span>
        <span className="flex-1 min-w-0 text-sm font-medium text-stone-800 truncate">
          {fulfillmentLabel && (
            <span className="text-stone-400 font-normal mr-1">{fulfillmentLabel}</span>
          )}
          {displayNames}
          {overflow && <span className="text-stone-500 font-normal">{overflow}</span>}
          {memberCount && <span className="text-stone-400 font-normal text-xs">{memberCount}</span>}
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
            <SpeciesTile key={`${groupKey}-${idx}`} species={entry.species} related={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
