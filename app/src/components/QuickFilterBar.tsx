import type { FilterState } from '../lib/filters';
import { formLabel, habitatLabel, keystoneTypeLabel } from '../lib/labels';

interface FilterOptions {
  forms: string[];
  habitats: string[];
  keystone_types: string[];
}

interface Props {
  options: FilterOptions;
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

export function QuickFilterBar({ options, filters, onChange }: Props) {
  const hasForm = options.forms.length > 0;
  const hasHabitat = options.habitats.length > 0;
  const hasKeystone = options.keystone_types.length > 0;

  if (!hasForm && !hasHabitat && !hasKeystone) return null;

  return (
    <div className="space-y-2">
      {/* Form chips – single-select */}
      {hasForm && (
        <div className="flex flex-wrap gap-1.5">
          {options.forms.map(form => {
            const active = filters.forms.includes(form);
            return (
              <button
                key={form}
                onClick={() => onChange({ ...filters, forms: active ? [] : [form] })}
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  active
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                ].join(' ')}
              >
                {formLabel(form)}
              </button>
            );
          })}
        </div>
      )}

      {/* Habitat chips – multi-select */}
      {hasHabitat && (
        <div className="flex flex-wrap gap-1.5">
          {options.habitats.map(habitat => {
            const active = filters.habitats.includes(habitat);
            return (
              <button
                key={habitat}
                onClick={() =>
                  onChange({ ...filters, habitats: toggle(filters.habitats, habitat) })
                }
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                ].join(' ')}
              >
                {habitatLabel(habitat)}
              </button>
            );
          })}
        </div>
      )}

      {/* Keystone type chips – multi-select */}
      {hasKeystone && (
        <div className="flex flex-wrap gap-1.5">
          {options.keystone_types.map(kt => {
            const active = filters.keystone_types.includes(kt);
            return (
              <button
                key={kt}
                onClick={() =>
                  onChange({
                    ...filters,
                    keystone_types: toggle(filters.keystone_types, kt),
                  })
                }
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  active
                    ? 'bg-stone-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                ].join(' ')}
              >
                {keystoneTypeLabel(kt)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
