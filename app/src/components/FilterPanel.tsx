import type { FilterState } from '../lib/filters';
import { formLabel, habitatLabel, keystoneTypeLabel, areaLabel } from '../lib/labels';

interface FilterOptions {
  forms: string[];
  seasons: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];
}

interface Props {
  options: FilterOptions;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded border-stone-300 text-emerald-600 accent-emerald-600"
      />
      <span className="text-xs text-stone-600 group-hover:text-stone-900">{label}</span>
    </label>
  );
}

export function FilterPanel({ options, filters, onChange }: Props) {
  const hasActive =
    filters.forms.length > 0 ||
    filters.seasons.length > 0 ||
    filters.habitats.length > 0 ||
    filters.keystone_types.length > 0 ||
    filters.areas.length > 0;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">

      {/* Form */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
          Form
        </label>
        <select
          value={filters.forms[0] ?? ''}
          onChange={e =>
            onChange({ ...filters, forms: e.target.value ? [e.target.value] : [] })
          }
          className="w-full text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">All forms</option>
          {options.forms.map(form => (
            <option key={form} value={form}>
              {formLabel(form)}
            </option>
          ))}
        </select>
      </div>

      {/* Habitat */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
          Habitat
        </span>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {options.habitats.map(h => (
            <CheckboxItem
              key={h}
              label={habitatLabel(h)}
              checked={filters.habitats.includes(h)}
              onChange={() => onChange({ ...filters, habitats: toggle(filters.habitats, h) })}
            />
          ))}
        </div>
      </div>

      {/* Area */}
      {options.areas.length > 1 && (
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Area
          </span>
          <div className="flex flex-col gap-1.5">
            {options.areas.map(a => (
              <CheckboxItem
                key={a}
                label={areaLabel(a)}
                checked={filters.areas.includes(a)}
                onChange={() => onChange({ ...filters, areas: toggle(filters.areas, a) })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keystone type */}
      {options.keystone_types.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Keystone type
          </span>
          <div className="flex flex-col gap-1.5">
            {options.keystone_types.map(kt => (
              <CheckboxItem
                key={kt}
                label={keystoneTypeLabel(kt)}
                checked={filters.keystone_types.includes(kt)}
                onChange={() =>
                  onChange({
                    ...filters,
                    keystone_types: toggle(filters.keystone_types, kt),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {hasActive && (
        <button
          onClick={() =>
            onChange({
              search: filters.search,
              forms: [],
              seasons: [],
              habitats: [],
              keystone_types: [],
              areas: [],
            })
          }
          className="text-xs text-stone-400 hover:text-stone-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

