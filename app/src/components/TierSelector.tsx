import type { FamiliarityTier } from '../types';
import { TIER_ORDER, TIER_LABELS, TIER_ICONS, TIER_COLORS } from '../lib/lifeListUtils';
import { useLifeList } from '../hooks/useLifeList';

interface Props {
  speciesId: string;
}

export function TierSelector({ speciesId }: Props) {
  const { getTier, setTier } = useLifeList();
  const currentTier = getTier(speciesId);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
        Familiarity
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Familiarity tier">
        {TIER_ORDER.map(tier => {
          const isActive = currentTier === tier;
          const colors = TIER_COLORS[tier];
          return (
            <button
              key={tier}
              onClick={() => setTier(speciesId, tier as FamiliarityTier)}
              className={[
                'flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all',
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50',
              ].join(' ')}
              aria-pressed={isActive}
              aria-label={TIER_LABELS[tier]}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {TIER_ICONS[tier]}
              </span>
              <span className="leading-tight text-center">{TIER_LABELS[tier]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
