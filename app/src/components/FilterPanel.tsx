import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FilterState } from '../lib/filters';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { formLabel, habitatLabel, keystoneLabel, areaLabel, formIcon, conservationStatusLabel, ecologicalStatusLabel } from '../lib/labels';
import {
  getTopLevelForms, getChildForms,
  getTopLevelHabitats, getChildHabitats,
  getTopLevelKeystoneTypes, getChildKeystoneTypes,
} from '../lib/taxonomies';

interface FilterOptions {
  forms: string[];
  seasons: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];
  conservation_statuses: string[];
  ecological_statuses: string[];
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
  const { preferences } = useUserPreferences();
  const modeIsActive =
    preferences.ecologicalStatusMode !== 'all' && filters.ecological_statuses.length > 0;

  const [selectedFormTopLevel, setSelectedFormTopLevel] = useState<string | null>(null);
  const [selectedHabitatTopLevel, setSelectedHabitatTopLevel] = useState<string | null>(null);
  const [selectedKeystoneTopLevel, setSelectedKeystoneTopLevel] = useState<string | null>(null);

  const topLevelForms = getTopLevelForms();
  const topLevelHabitats = getTopLevelHabitats();
  const topLevelKeystoneTypes = getTopLevelKeystoneTypes();

  // Find which top-level form contains any of the selected forms
  const activeFormTopLevel = selectedFormTopLevel ||
    topLevelForms.find(tl => {
      const children = getChildForms(tl);
      return children.length > 0 && filters.forms.some(f => [tl, ...children].includes(f));
    });

  // Find which top-level habitat contains any of the selected habitats
  const activeHabitatTopLevel = selectedHabitatTopLevel ||
    topLevelHabitats.find(tl => {
      const children = getChildHabitats(tl);
      return children.some(h => filters.habitats.includes(h));
    });

  // Find which top-level keystone contains any of the selected keystone types
  const activeKeystoneTopLevel = selectedKeystoneTopLevel ||
    topLevelKeystoneTypes.find(tl => {
      const children = getChildKeystoneTypes(tl);
      return [tl, ...children].some(k => filters.keystone_types.includes(k));
    });

  // Only show habitat top-level groups that have children present in dataset
  const visibleHabitatTopLevels = topLevelHabitats.filter(tl =>
    getChildHabitats(tl).some(child => options.habitats.includes(child)),
  );

  // Only show keystone top-level groups that have subtypes present in dataset
  const visibleKeystoneTopLevels = topLevelKeystoneTypes.filter(tl => {
    const children = getChildKeystoneTypes(tl);
    return children.some(child => options.keystone_types.includes(child))
      || options.keystone_types.includes(tl);
  });

  const hasActive =
    filters.forms.length > 0 ||
    filters.seasons.length > 0 ||
    filters.habitats.length > 0 ||
    filters.keystone_types.length > 0 ||
    filters.areas.length > 0 ||
    filters.conservation_statuses.length > 0 ||
    filters.ecological_statuses.length > 0;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">

      {/* Form - Hierarchical Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
          Form
        </label>
        <div className="flex flex-wrap gap-1.5">
          {topLevelForms.map(form => {
            const childrenOfForm = getChildForms(form);
            const isActive =
              filters.forms.includes(form) ||
              childrenOfForm.some(c => filters.forms.includes(c));
            return (
              <button
                key={form}
                onClick={() => {
                  const preserved = filters.forms.filter(
                    f => f !== form && !childrenOfForm.includes(f),
                  );
                  if (isActive) {
                    if (selectedFormTopLevel === form) setSelectedFormTopLevel(null);
                    onChange({ ...filters, forms: preserved });
                  } else {
                    setSelectedFormTopLevel(form);
                    onChange({ ...filters, forms: [...preserved, form] });
                  }
                }}
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                ].join(' ')}
              >
                {`${formIcon(form)} ${formLabel(form)}`}
              </button>
            );
          })}
        </div>

        {/* Sub-category checkboxes */}
        {activeFormTopLevel && (
          <div className="space-y-1.5 pt-2 pl-2 border-l-2 border-stone-200">
            {getChildForms(activeFormTopLevel).map(form => (
              <CheckboxItem
                key={form}
                label={`└─ ${formIcon(form)} ${formLabel(form)}`}
                checked={filters.forms.includes(form)}
                onChange={() => {
                  const withoutParent = filters.forms.filter(f => f !== activeFormTopLevel);
                  onChange({ ...filters, forms: toggle(withoutParent, form) });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habitat - Hierarchical Selector */}
      {visibleHabitatTopLevels.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Habitat
          </label>
          <div className="flex flex-wrap gap-1.5">
            {visibleHabitatTopLevels.map(habitat => {
              const childrenOfHabitat = getChildHabitats(habitat);
              const isActive =
                filters.habitats.includes(habitat) ||
                childrenOfHabitat.some(c => filters.habitats.includes(c));
              return (
                <button
                  key={habitat}
                  onClick={() => {
                    const preserved = filters.habitats.filter(
                      h => h !== habitat && !childrenOfHabitat.includes(h),
                    );
                    if (isActive) {
                      if (selectedHabitatTopLevel === habitat) setSelectedHabitatTopLevel(null);
                      onChange({ ...filters, habitats: preserved });
                    } else {
                      setSelectedHabitatTopLevel(habitat);
                      onChange({ ...filters, habitats: [...preserved, habitat] });
                    }
                  }}
                  className={[
                    'text-xs px-2 py-0.5 rounded-full transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                  ].join(' ')}
                >
                  {habitatLabel(habitat)}
                </button>
              );
            })}
          </div>

          {/* Sub-category checkboxes */}
          {activeHabitatTopLevel && (
            <div className="space-y-1.5 pt-2 pl-2 border-l-2 border-stone-200">
              {getChildHabitats(activeHabitatTopLevel)
                .filter(child => options.habitats.includes(child))
                .map(habitat => (
                  <CheckboxItem
                    key={habitat}
                    label={`└─ ${habitatLabel(habitat)}`}
                    checked={filters.habitats.includes(habitat)}
                    onChange={() => {
                      const withoutParent = filters.habitats.filter(h => h !== activeHabitatTopLevel);
                      onChange({ ...filters, habitats: toggle(withoutParent, habitat) });
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

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

      {/* Keystone type - Hierarchical Selector */}
      {visibleKeystoneTopLevels.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Keystone type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {visibleKeystoneTopLevels.map(kt => {
              const childrenOfKt = getChildKeystoneTypes(kt);
              const isActive =
                filters.keystone_types.includes(kt) ||
                childrenOfKt.some(c => filters.keystone_types.includes(c));
              return (
                <button
                  key={kt}
                  onClick={() => {
                    const preserved = filters.keystone_types.filter(
                      k => k !== kt && !childrenOfKt.includes(k),
                    );
                    if (isActive) {
                      if (selectedKeystoneTopLevel === kt) setSelectedKeystoneTopLevel(null);
                      onChange({ ...filters, keystone_types: preserved });
                    } else {
                      setSelectedKeystoneTopLevel(kt);
                      onChange({ ...filters, keystone_types: [...preserved, kt] });
                    }
                  }}
                  className={[
                    'text-xs px-2 py-0.5 rounded-full transition-colors',
                    isActive
                      ? 'bg-stone-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                  ].join(' ')}
                >
                  {keystoneLabel(kt)}
                </button>
              );
            })}
          </div>

          {/* Sub-category checkboxes */}
          {activeKeystoneTopLevel && (
            <div className="space-y-1.5 pt-2 pl-2 border-l-2 border-stone-200">
              {getChildKeystoneTypes(activeKeystoneTopLevel)
                .filter(child => options.keystone_types.includes(child))
                .map(kt => (
                  <CheckboxItem
                    key={kt}
                    label={`└─ ${keystoneLabel(kt)}`}
                    checked={filters.keystone_types.includes(kt)}
                    onChange={() => {
                      const withoutParent = filters.keystone_types.filter(k => k !== activeKeystoneTopLevel);
                      onChange({ ...filters, keystone_types: toggle(withoutParent, kt) });
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Conservation status */}
      {options.conservation_statuses.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Conservation status
          </span>
          <div className="flex flex-col gap-1.5">
            {options.conservation_statuses.map(code => (
              <CheckboxItem
                key={code}
                label={conservationStatusLabel(code)}
                checked={filters.conservation_statuses.includes(code)}
                onChange={() =>
                  onChange({
                    ...filters,
                    conservation_statuses: filters.conservation_statuses.includes(code)
                      ? filters.conservation_statuses.filter(c => c !== code)
                      : [...filters.conservation_statuses, code],
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Ecological status */}
      {options.ecological_statuses.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            Ecological status
          </span>
          {modeIsActive && (
            <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded px-2 py-1">
              Pre-selected by your{' '}
              <Link to="/settings" className="underline hover:text-violet-900">
                global species view setting
              </Link>
              . Clear to override for this session.
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {options.ecological_statuses.map(code => (
              <CheckboxItem
                key={code}
                label={ecologicalStatusLabel(code)}
                checked={filters.ecological_statuses.includes(code)}
                onChange={() =>
                  onChange({
                    ...filters,
                    ecological_statuses: filters.ecological_statuses.includes(code)
                      ? filters.ecological_statuses.filter(c => c !== code)
                      : [...filters.ecological_statuses, code],
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
              conservation_statuses: [],
              ecological_statuses: [],
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

