import type { Species } from '../types';
import {
  formLabel,
  habitatLabel,
  dietLabel,
  behaviorLabel,
  activeMonthsLabel,
} from '../lib/labels';

interface TagProps {
  label: string;
  variant?: 'form' | 'habitat' | 'diet' | 'behavior' | 'season';
}

function Tag({ label, variant = 'season' }: TagProps) {
  const variantStyles = {
    form: 'bg-amber-100 text-amber-800',
    habitat: 'bg-emerald-100 text-emerald-700',
    diet: 'bg-orange-100 text-orange-700',
    behavior: 'bg-cyan-100 text-cyan-700',
    season: 'bg-stone-100 text-stone-600',
  };

  return (
    <span className={`inline-block text-xs ${variantStyles[variant]} px-2 py-0.5 rounded-full`}>
      {label}
    </span>
  );
}

interface TagRowProps {
  species: Species;
}

export function TagRow({ species }: TagRowProps) {
  const seasonChip = activeMonthsLabel(species.active_months);

  return (
    <div className="flex flex-wrap gap-1.5">
      <Tag label={formLabel(species.form)} variant="form" />
      {(species.habitat ?? []).map(h => (
        <Tag key={h} label={habitatLabel(h)} variant="habitat" />
      ))}
      {(species.diet ?? []).map(d => (
        <Tag key={d} label={dietLabel(d)} variant="diet" />
      ))}
      {(species.behavior ?? []).map(b => (
        <Tag key={b} label={behaviorLabel(b)} variant="behavior" />
      ))}
      {seasonChip && <Tag label={seasonChip} variant="season" />}
    </div>
  );
}
