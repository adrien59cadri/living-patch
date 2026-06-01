import type { FamiliarityBadge } from '../types';
import {
  computeFamiliarityBadges,
  deriveTier,
  BADGE_LABELS,
  BADGE_ICONS,
  TIER_LABELS,
  TIER_COLORS,
} from '../lib/lifeListUtils';
import { useSpeciesSightings } from '../hooks/useLifeList';

interface Props {
  speciesId: string;
}

const ALL_BADGES: FamiliarityBadge[] = ['seen', 'recurring', 'long-term', 'wide-ranging'];

export function FamiliarityBadgesRow({ speciesId }: Props) {
  const sightings = useSpeciesSightings(speciesId);
  if (sightings.length === 0) return null;

  const earned = computeFamiliarityBadges(sightings);
  const earnedSet = new Set(earned);
  const tier = deriveTier(earned);
  const tierColors = TIER_COLORS[tier];

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
        Familiarity
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        {ALL_BADGES.map(badge => {
          const isEarned = earnedSet.has(badge);
          return (
            <div
              key={badge}
              className={[
                'flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium',
                isEarned
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-stone-50 text-stone-300 border-stone-200',
              ].join(' ')}
              title={isEarned ? `${BADGE_LABELS[badge]} — earned` : `${BADGE_LABELS[badge]} — not yet earned`}
            >
              <span aria-hidden="true">{BADGE_ICONS[badge]}</span>
              <span>{BADGE_LABELS[badge]}</span>
            </div>
          );
        })}
      </div>
      <div
        className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
        aria-label={`Familiarity tier: ${TIER_LABELS[tier]}`}
      >
        {TIER_LABELS[tier]}
      </div>
    </div>
  );
}
