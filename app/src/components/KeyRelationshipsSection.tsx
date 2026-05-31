import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RelatedEntry, SymbiosisRole } from '../lib/relationships';
import { groupByRole, resolveRelationGroups } from '../lib/relationships';
import { SpeciesTile } from './SpeciesTile';
import { RelationGroupTile } from './RelationGroupTile';
import { symbiosisLabel } from '../lib/labels';

interface Props {
  related: RelatedEntry[];
}

const PRIMARY_ROLES: SymbiosisRole[] = ['mutualism', 'predation', 'parasitism'];
const SECONDARY_ROLES: SymbiosisRole[] = ['commensalism', 'competition'];

export function KeyRelationshipsSection({ related }: Props) {
  const groups = groupByRole(related);
  const [expandedRole, setExpandedRole] = useState<SymbiosisRole | null>(PRIMARY_ROLES[0] ?? null);
  const [showSecondary, setShowSecondary] = useState(false);

  const primaryRelations = PRIMARY_ROLES.map(role => ({
    role,
    entries: groups[role] ?? [],
  })).filter(({ entries }) => entries.length > 0);

  const secondaryRelations = SECONDARY_ROLES.map(role => ({
    role,
    entries: groups[role] ?? [],
  })).filter(({ entries }) => entries.length > 0);

  if (primaryRelations.length === 0 && secondaryRelations.length === 0) {
    return null;
  }

  const renderRoleRow = (role: SymbiosisRole, entries: RelatedEntry[]) => {
    const isExpanded = expandedRole === role;
    const resolved = resolveRelationGroups(entries);
    const firstTwo = resolved.slice(0, 2);
    const remainingCount = Math.max(0, resolved.length - 2);
    const criticalCount = entries.filter(e => e.strength === 'critical').length;
    const impactedCount = entries.filter(e => e.isImpacted).length;

    return (
      <div key={role}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpandedRole(isExpanded ? null : role)}
            className="text-left flex-1"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs font-semibold text-stone-500">
                {symbiosisLabel(role)}: {entries.length} {entries.length === 1 ? 'species' : 'species'}
              </div>
              {criticalCount > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                  Critical
                </span>
              )}
              {impactedCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                  Impacted
                </span>
              )}
            </div>
            <div className="text-sm text-stone-700 mt-1">
              {firstTwo.map((item, idx) => {
                const name = 'isRelationGroup' in item
                  ? item.entries.slice(0, 2).map(e => e.species.common_name).join(', ') +
                    (item.entries.length > 2 ? ` (+${item.entries.length - 2})` : '')
                  : item.species.common_name;
                const linkTo = 'isRelationGroup' in item ? null : `/species/${item.species.id}`;
                return (
                  <span key={idx}>
                    {linkTo ? (
                      <Link
                        to={linkTo}
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-600 hover:text-emerald-700 underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className="text-emerald-600">{name}</span>
                    )}
                    {idx < firstTwo.length - 1 && <span>, </span>}
                  </span>
                );
              })}
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
            {resolved.map((item, idx) =>
              'isRelationGroup' in item ? (
                <RelationGroupTile key={`${role}-grp-${idx}`} groupEntry={item} />
              ) : (
                <SpeciesTile key={`${role}-${idx}`} species={item.species} related={item} />
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Relationships
      </div>
      <div className="space-y-4">
        {primaryRelations.map(({ role, entries }) => renderRoleRow(role, entries))}

        {secondaryRelations.length > 0 && (
          <>
            <button
              onClick={() => setShowSecondary(s => !s)}
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
            >
              <span>{showSecondary ? '▾' : '▸'}</span>
              <span>
                {showSecondary
                  ? 'Hide'
                  : `${secondaryRelations.reduce((n, r) => n + r.entries.length, 0)} more: ${secondaryRelations.map(r => symbiosisLabel(r.role)).join(', ')}`}
              </span>
            </button>
            {showSecondary && secondaryRelations.map(({ role, entries }) => renderRoleRow(role, entries))}
          </>
        )}
      </div>
    </div>
  );
}
