import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RelatedEntry, SymbiosisRole } from '../lib/relationships';
import { groupByRole } from '../lib/relationships';
import { KeyRelationshipTile } from './KeyRelationshipTile';
import { symbiosisLabel } from '../lib/labels';

interface Props {
  related: RelatedEntry[];
}

const KEY_ROLES: SymbiosisRole[] = ['mutualism', 'parasitism', 'predation'];

export function KeyRelationshipsSection({ related }: Props) {
  const groups = groupByRole(related);
  const [expandedRole, setExpandedRole] = useState<SymbiosisRole | null>(null);

  const keyRelations = KEY_ROLES.map(role => ({
    role,
    entries: groups[role],
  })).filter(({ entries }) => entries.length > 0);

  if (keyRelations.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Key Relationships
      </div>
      <div className="space-y-4">
        {keyRelations.map(({ role, entries }) => {
          const isExpanded = expandedRole === role;
          const firstTwo = entries.slice(0, 2);
          const remainingCount = Math.max(0, entries.length - 2);

          return (
            <div key={role}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role)}
                  className="text-left flex-1"
                >
                  <div className="text-xs font-semibold text-stone-500">
                    {symbiosisLabel(role)}: {entries.length} {entries.length === 1 ? 'species' : 'species'}
                  </div>
                  <div className="text-sm text-stone-700 mt-1">
                    {firstTwo.map((entry, idx) => (
                      <span key={entry.species.id}>
                        <Link
                          to={`/species/${entry.species.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-600 hover:text-emerald-700 underline"
                        >
                          {entry.species.common_name}
                        </Link>
                        {idx < firstTwo.length - 1 && <span>, </span>}
                      </span>
                    ))}
                    {remainingCount > 0 && (
                      <span className="text-stone-500">…</span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role)}
                  className="ml-2 text-xs text-stone-500 hover:text-stone-700 font-medium whitespace-nowrap"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              </div>
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {entries.map((entry, idx) => (
                    <KeyRelationshipTile key={`${role}-${idx}`} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
