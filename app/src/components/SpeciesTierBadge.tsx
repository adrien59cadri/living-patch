import type { FamiliarityTier } from '../types';
import { TIER_LABELS, TIER_ICONS, TIER_COLORS } from '../lib/lifeListUtils';

interface Props {
  tier: FamiliarityTier;
  size?: 'sm' | 'md';
}

export function SpeciesTierBadge({ tier, size = 'sm' }: Props) {
  const colors = TIER_COLORS[tier];
  const label = TIER_LABELS[tier];
  const icon = TIER_ICONS[tier];

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
      ].join(' ')}
      aria-label={`Familiarity: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
