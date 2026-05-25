import { useState } from 'react';
import type { GroupedRelations, RelatedEntry, SymbiosisRole } from '../lib/relationships';
import { RelationshipTile } from './RelationshipTile';
import { symbiosisLabel } from '../lib/labels';

interface Props {
  grouped: GroupedRelations;
}

const SECTION_ORDER: SymbiosisRole[] = [
  'mutualism',
  'parasitism',
  'predation',
  'commensalism',
  'competition',
  'related',
];

const MAX_VISIBLE = 6;

function Section({ role, entries }: { role: SymbiosisRole; entries: RelatedEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) return null;

  const visible = expanded ? entries : entries.slice(0, MAX_VISIBLE);
  const overflow = entries.length - MAX_VISIBLE;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
        {symbiosisLabel(role)}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visible.map((entry, i) => (
          <RelationshipTile
            key={i}
            species={entry.species}
            obligate={entry.obligate}
            notes={entry.notes}
          />
        ))}
      </div>
      {overflow > 0 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-emerald-600 hover:text-emerald-800"
        >
          {expanded ? 'Show less' : `+ ${overflow} more`}
        </button>
      )}
    </div>
  );
}

export function RelationshipsPanel({ grouped }: Props) {
  const hasAny = SECTION_ORDER.some(role => grouped[role].length > 0);
  if (!hasAny) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-stone-700 border-t border-stone-100 pt-6">
        Ecological Relationships
      </h2>
      {SECTION_ORDER.map(role => (
        <Section key={role} role={role} entries={grouped[role]} />
      ))}
    </div>
  );
}
