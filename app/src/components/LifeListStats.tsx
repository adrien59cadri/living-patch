import { Link } from 'react-router-dom';
import { useLifeList } from '../hooks/useLifeList';
import { TIER_LABELS, TIER_ICONS } from '../lib/lifeListUtils';
import type { FamiliarityTier } from '../types';

export function LifeListStats() {
  const { entries } = useLifeList();

  if (entries.length === 0) return null;

  const tierCounts: Record<FamiliarityTier, number> = {
    noticed: 0,
    familiar: 0,
    'know-it-well': 0,
    steward: 0,
  };
  for (const e of entries) tierCounts[e.tier]++;

  const topTier = (
    ['steward', 'know-it-well', 'familiar', 'noticed'] as FamiliarityTier[]
  ).find(t => tierCounts[t] > 0);

  return (
    <Link
      to="/life-list"
      className="block no-underline rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
      aria-label={`Life list: ${entries.length} species observed. Go to life list.`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-semibold text-sm">
            {TIER_ICONS['noticed']} {entries.length} observed
          </span>
          {topTier && (
            <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              {TIER_ICONS[topTier]} {tierCounts[topTier]} {TIER_LABELS[topTier]}
            </span>
          )}
        </div>
        <span className="text-xs text-emerald-600 font-medium">View life list →</span>
      </div>
    </Link>
  );
}
