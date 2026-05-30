import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLifeList } from '../../hooks/useLifeList';
import { useDataset } from '../../hooks/useDataset';
import { TIER_ORDER, TIER_LABELS, TIER_ICONS, TIER_COLORS } from '../../lib/lifeListUtils';
import type { FamiliarityTier } from '../../types';

export function ByTierTab() {
  const { entries } = useLifeList();
  const { species } = useDataset();

  const speciesById = useMemo(() => new Map(species.map(s => [s.id, s])), [species]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-3">🌿</div>
        <p className="text-sm">No species logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {TIER_ORDER.slice().reverse().map(tier => {
        const tierEntries = entries.filter(e => e.tier === tier);
        if (tierEntries.length === 0) return null;
        const colors = TIER_COLORS[tier as FamiliarityTier];
        return (
          <section key={tier} aria-labelledby={`tier-heading-${tier}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" aria-hidden="true">{TIER_ICONS[tier as FamiliarityTier]}</span>
              <h2
                id={`tier-heading-${tier}`}
                className={`text-sm font-semibold ${colors.text}`}
              >
                {TIER_LABELS[tier as FamiliarityTier]}
              </h2>
              <span className={`text-xs ${colors.bg} ${colors.text} border ${colors.border} rounded-full px-2 py-0.5`}>
                {tierEntries.length}
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tierEntries.map(entry => {
                const sp = speciesById.get(entry.speciesId);
                if (!sp) return null;
                return (
                  <li key={entry.speciesId}>
                    <Link
                      to={`/species/${entry.speciesId}`}
                      className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 hover:border-emerald-300 transition-all no-underline"
                    >
                      {sp.image?.url && (
                        <div className="shrink-0 w-8 h-8 rounded overflow-hidden bg-stone-100">
                          <img src={sp.image.url} alt={sp.common_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="flex-1 text-sm text-stone-800 font-medium truncate">
                        {sp.common_name}
                      </span>
                      {entry.sightingCount > 0 && (
                        <span className="text-xs text-stone-400 shrink-0">{entry.sightingCount}×</span>
                      )}
                      <span className="text-stone-300 shrink-0 text-xs">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
