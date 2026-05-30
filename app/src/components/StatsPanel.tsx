import { useMemo } from 'react';
import { useLifeList } from '../hooks/useLifeList';
import { useDataset } from '../hooks/useDataset';
import { TIER_ORDER, TIER_LABELS, TIER_ICONS, TIER_COLORS, sightingsByMonth } from '../lib/lifeListUtils';
import type { FamiliarityTier } from '../types';

export function StatsPanel() {
  const { entries, sightings } = useLifeList();
  const { species } = useDataset();

  const speciesById = useMemo(() => new Map(species.map(s => [s.id, s])), [species]);

  const tierCounts = useMemo(() => {
    const counts: Record<FamiliarityTier, number> = {
      noticed: 0, familiar: 0, 'know-it-well': 0, steward: 0,
    };
    for (const e of entries) counts[e.tier]++;
    return counts;
  }, [entries]);

  const maxTierCount = Math.max(...Object.values(tierCounts), 1);

  const monthlyData = useMemo(() => {
    const byMonth = sightingsByMonth(sightings);
    const keys = Object.keys(byMonth).sort().slice(-12); // last 12 months
    const max = Math.max(...Object.values(byMonth), 1);
    return keys.map(k => ({ key: k, count: byMonth[k], pct: (byMonth[k] / max) * 100 }));
  }, [sightings]);

  const topSpecies = useMemo(() => {
    return [...entries]
      .sort((a, b) => b.sightingCount - a.sightingCount)
      .slice(0, 5)
      .map(e => ({ entry: e, sp: speciesById.get(e.speciesId) }))
      .filter(({ sp }) => sp !== undefined);
  }, [entries, speciesById]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm">No data yet.</p>
        <p className="text-xs mt-1">Log some sightings to see statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={entries.length} label="Species observed" />
        <StatCard value={sightings.length} label="Total sightings" />
        <StatCard value={tierCounts.steward} label="Steward tier" />
        <StatCard value={tierCounts['know-it-well'] + tierCounts.steward} label="Know It Well+" />
      </div>

      {/* Tier distribution */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
          Familiarity distribution
        </h3>
        <div className="space-y-2">
          {TIER_ORDER.map(tier => {
            const count = tierCounts[tier as FamiliarityTier];
            const colors = TIER_COLORS[tier as FamiliarityTier];
            const pct = Math.round((count / maxTierCount) * 100);
            return (
              <div key={tier} className="flex items-center gap-3">
                <div className="w-28 shrink-0 flex items-center gap-1.5 text-xs text-stone-600">
                  <span>{TIER_ICONS[tier as FamiliarityTier]}</span>
                  <span>{TIER_LABELS[tier as FamiliarityTier]}</span>
                </div>
                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${colors.bg} border-r ${colors.border} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-stone-500 w-6 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sightings per month */}
      {monthlyData.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Sightings per month
          </h3>
          <div className="flex items-end gap-1 h-20">
            {monthlyData.map(({ key, count, pct }) => {
              const [, mm] = key.split('-');
              const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mm) - 1];
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-emerald-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                    aria-label={`${key}: ${count} sighting${count > 1 ? 's' : ''}`}
                  />
                  <span className="text-[9px] text-stone-400 leading-none">{monthAbbr}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top species */}
      {topSpecies.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Most-sighted species
          </h3>
          <ol className="space-y-2">
            {topSpecies.map(({ entry, sp }, idx) => (
              <li key={entry.speciesId} className="flex items-center gap-3 text-sm">
                <span className="text-stone-400 w-4 shrink-0 text-xs">{idx + 1}.</span>
                <span className="flex-1 text-stone-800 font-medium">{sp!.common_name}</span>
                <span className="text-stone-500 text-xs">{entry.sightingCount}×</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-center">
      <div className="text-2xl font-bold text-stone-800">{value}</div>
      <div className="text-xs text-stone-500 mt-0.5">{label}</div>
    </div>
  );
}
