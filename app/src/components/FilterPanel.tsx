import type { FilterState } from '../lib/filters';
import { formLabel, seasonLabel, habitatLabel } from '../lib/labels';

interface FilterOptions {
  forms: string[];
  seasons: string[];
  habitats: string[];
}

interface Props {
  options: FilterOptions;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function FilterPanel({ options, filters, onChange }: Props) {
  const hasActive =
    filters.forms.length > 0 ||
    filters.seasons.length > 0 ||
    filters.habitats.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-stone-400 mr-1">Form</span>
        {options.forms.map(form => (
          <Chip
            key={form}
            label={formLabel(form)}
            active={filters.forms.includes(form)}
            onClick={() => onChange({ ...filters, forms: toggle(filters.forms, form) })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-stone-400 mr-1">Season</span>
        {options.seasons.map(s => (
          <Chip
            key={s}
            label={seasonLabel(s)}
            active={filters.seasons.includes(s)}
            onClick={() => onChange({ ...filters, seasons: toggle(filters.seasons, s) })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-stone-400 mr-1">Habitat</span>
        {options.habitats.map(h => (
          <Chip
            key={h}
            label={habitatLabel(h)}
            active={filters.habitats.includes(h)}
            onClick={() =>
              onChange({ ...filters, habitats: toggle(filters.habitats, h) })
            }
          />
        ))}
        {hasActive && (
          <button
            onClick={() =>
              onChange({ search: filters.search, forms: [], seasons: [], habitats: [] })
            }
            className="text-xs text-stone-400 hover:text-stone-600 ml-1 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
