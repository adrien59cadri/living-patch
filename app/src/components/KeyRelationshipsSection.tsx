import { useState } from 'react';
import type { RelatedEntry, SymbiosisRole } from '../lib/relationships';
import { groupKeyRolesByObligation } from '../lib/relationships';
import { KeyRelationshipTile } from './KeyRelationshipTile';
import { symbiosisLabel } from '../lib/labels';

interface Props {
  related: RelatedEntry[];
}

export function KeyRelationshipsSection({ related }: Props) {
  const groups = groupKeyRolesByObligation(related);
  const [expandedRoles, setExpandedRoles] = useState<Set<SymbiosisRole>>(new Set());

  const rolesWithRelations = (Object.keys(groups) as SymbiosisRole[]).filter(
    role => groups[role].length > 0
  );

  if (rolesWithRelations.length === 0) {
    return null;
  }

  const toggleRole = (role: SymbiosisRole) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Key Relationships
      </div>
      <div className="space-y-4">
        {rolesWithRelations.map(role => {
          const entries = groups[role];
          const obligateEntries = entries.filter(e => e.obligate);
          const facultativeEntries = entries.filter(e => !e.obligate);
          const isExpanded = expandedRoles.has(role);
          const hasMore = facultativeEntries.length > 0;

          return (
            <div key={role}>
              <div className="text-xs font-semibold text-stone-500 mb-2">
                {symbiosisLabel(role)}
              </div>
              <div className="space-y-2">
                {obligateEntries.map((entry, idx) => (
                  <KeyRelationshipTile key={`${role}-obligate-${idx}`} entry={entry} />
                ))}
                {isExpanded && facultativeEntries.map((entry, idx) => (
                  <KeyRelationshipTile key={`${role}-facultative-${idx}`} entry={entry} />
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => toggleRole(role)}
                  className="text-xs text-stone-500 hover:text-stone-700 mt-2 py-1"
                >
                  {isExpanded ? '−' : '+'} Show {facultativeEntries.length} more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
