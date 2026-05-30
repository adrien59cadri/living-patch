import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLifeList } from '../../hooks/useLifeList';
import { useDataset } from '../../hooks/useDataset';
import { TIER_ORDER, TIER_LABELS, TIER_COLORS, formatDate } from '../../lib/lifeListUtils';
import { SpeciesTierBadge } from '../SpeciesTierBadge';
import type { FamiliarityTier } from '../../types';

type SortKey = 'name' | 'date' | 'count';

export function AllSpeciesTab() {
  const { entries } = useLifeList();
  const { species } = useDataset();
  const [tierFilter, setTierFilter] = useState<FamiliarityTier | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('date');

  const speciesById = useMemo(() => new Map(species.map(s => [s.id, s])), [species]);

  const filtered = useMemo(() => {
    const list = tierFilter === 'all' ? entries : entries.filter(e => e.tier === tierFilter);
    return [...list].sort((a, b) => {
      if (sort === 'name') {
        const an = speciesById.get(a.speciesId)?.common_name ?? '';
        const bn = speciesById.get(b.speciesId)?.common_name ?? '';
        return an.localeCompare(bn);
      }
      if (sort === 'count') return b.sightingCount - a.sightingCount;
      // date: most recent first
      return b.lastUpdated - a.lastUpdated;
    });
  }, [entries, tierFilter, sort, speciesById]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-3">🌿</div>
        <p className="text-sm">No species logged yet.</p>
        <p className="text-xs mt-1">Visit a species page and log your first sighting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tier filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setTierFilter('all')}
            className={[
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
              tierFilter === 'all'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300',
            ].join(' ')}
          >
            All ({entries.length})
          </button>
          {TIER_ORDER.map(tier => {
            const count = entries.filter(e => e.tier === tier).length;
            if (count === 0) return null;
            const colors = TIER_COLORS[tier];
            const active = tierFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={[
                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                  active
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300',
                ].join(' ')}
              >
                {TIER_LABELS[tier]} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-stone-400">Sort:</span>
          {(['date', 'count', 'name'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={[
                'text-xs px-2 py-1 rounded border transition-colors',
                sort === s
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300',
              ].join(' ')}
            >
              {s === 'date' ? 'Recent' : s === 'count' ? 'Count' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Species list */}
      <ul className="space-y-2">
        {filtered.map(entry => {
          const sp = speciesById.get(entry.speciesId);
          if (!sp) return null;
          return (
            <li key={entry.speciesId}>
              <Link
                to={`/species/${entry.speciesId}`}
                className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2.5 hover:border-emerald-300 hover:shadow-sm transition-all no-underline"
              >
                {sp.image?.url && (
                  <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-stone-100">
                    <img src={sp.image.url} alt={sp.common_name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-stone-800 text-sm">{sp.common_name}</span>
                    <SpeciesTierBadge tier={entry.tier} />
                    {entry.sightingCount > 0 && (
                      <span className="text-xs text-stone-400">{entry.sightingCount}× seen</span>
                    )}
                  </div>
                  {entry.firstSightedDate && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      First seen {formatDate(entry.firstSightedDate)}
                    </p>
                  )}
                </div>
                <span className="text-stone-300 shrink-0">›</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
