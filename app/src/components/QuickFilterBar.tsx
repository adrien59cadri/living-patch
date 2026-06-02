import { useState } from 'react';
import type { FilterState } from '../lib/filters';
import { formLabel, habitatLabel, keystoneTypeLabel, areaLabel } from '../lib/labels';
import { getTopLevelForms, getChildForms, getTopLevelHabitats, getChildHabitats } from '../lib/taxonomies';

interface FilterOptions {
  forms: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];
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
  const [expandedFormTopLevel, setExpandedFormTopLevel] = useState<string | null>(null);
  const [expandedHabitatTopLevel, setExpandedHabitatTopLevel] = useState<string | null>(null);

  const topLevelForms = getTopLevelForms();
  const topLevelHabitats = getTopLevelHabitats();

  // Determine which top-level form should be expanded
  const activeFormTopLevel = expandedFormTopLevel ||
    topLevelForms.find(tl => {
      const children = getChildForms(tl);
      return filters.forms.some(f => [tl, ...children].includes(f));
    });

  // Determine which top-level habitat should be expanded
  const activeHabitatTopLevel = expandedHabitatTopLevel ||
    topLevelHabitats.find(tl => {
      const children = getChildHabitats(tl);
      return filters.habitats.some(h => children.includes(h));
    });

  // Only show habitat top-level groups that have children present in dataset
  const visibleHabitatTopLevels = topLevelHabitats.filter(tl =>
    getChildHabitats(tl).some(child => options.habitats.includes(child)),
  );

  const hasForm = topLevelForms.length > 0;
  const hasHabitat = visibleHabitatTopLevels.length > 0;
  const hasKeystone = options.keystone_types.length > 0;
  const hasArea = options.areas.length > 1;

  if (!hasForm && !hasHabitat && !hasKeystone && !hasArea) return null;

  return (
    <div className="space-y-2">
      {/* Form chips – hierarchical */}
      {hasForm && (
        <div className="space-y-2">
          {/* Top-level form chips */}
          <div className="flex flex-wrap gap-1.5">
            {topLevelForms.map(form => {
              const isExpanded = activeFormTopLevel === form;
              const isActive = isExpanded ||
                (filters.forms.length > 0 &&
                 (filters.forms.includes(form) ||
                  getChildForms(form).some(child => filters.forms.includes(child))));
              return (
                <button
                  key={form}
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedFormTopLevel(null);
                      onChange({ ...filters, forms: [] });
                    } else {
                      setExpandedFormTopLevel(form);
                      onChange({ ...filters, forms: [form] });
                    }
                  }}
                  className={[
                    'text-xs px-2 py-0.5 rounded-full transition-colors',
                    isActive
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                  ].join(' ')}
                >
                  {formLabel(form)}
                </button>
              );
            })}
          </div>

          {/* Sub-category chips for expanded form */}
          {activeFormTopLevel && (
            <div className="flex flex-wrap gap-1.5 pl-2 border-l-2 border-amber-300">
              {getChildForms(activeFormTopLevel).map(form => {
                const active = filters.forms.includes(form);
                return (
                  <button
                    key={form}
                    onClick={() => {
                      const withoutParent = filters.forms.filter(f => f !== activeFormTopLevel);
                      onChange({ ...filters, forms: toggle(withoutParent, form) });
                    }}
                    className={[
                      'text-xs px-2 py-0.5 rounded-full transition-colors',
                      active
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
                    ].join(' ')}
                  >
                    {`└─ ${formLabel(form)}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Habitat chips – hierarchical */}
      {hasHabitat && (
        <div className="space-y-2">
          {/* Top-level habitat chips */}
          <div className="flex flex-wrap gap-1.5">
            {visibleHabitatTopLevels.map(habitat => {
              const isExpanded = activeHabitatTopLevel === habitat;
              const isActive = isExpanded ||
                (filters.habitats.length > 0 &&
                  getChildHabitats(habitat).some(child => filters.habitats.includes(child)));
              return (
                <button
                  key={habitat}
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedHabitatTopLevel(null);
                      onChange({ ...filters, habitats: [] });
                    } else {
                      setExpandedHabitatTopLevel(habitat);
                      onChange({ ...filters, habitats: [habitat] });
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

          {/* Sub-category chips for expanded habitat */}
          {activeHabitatTopLevel && (
            <div className="flex flex-wrap gap-1.5 pl-2 border-l-2 border-emerald-300">
              {getChildHabitats(activeHabitatTopLevel)
                .filter(child => options.habitats.includes(child))
                .map(habitat => {
                  const active = filters.habitats.includes(habitat);
                  return (
                    <button
                      key={habitat}
                      onClick={() => {
                        const withoutParent = filters.habitats.filter(h => h !== activeHabitatTopLevel);
                        onChange({ ...filters, habitats: toggle(withoutParent, habitat) });
                      }}
                      className={[
                        'text-xs px-2 py-0.5 rounded-full transition-colors',
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
                      ].join(' ')}
                    >
                      {`└─ ${habitatLabel(habitat)}`}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Area chips – multi-select */}
      {hasArea && (
        <div className="flex flex-wrap gap-1.5">
          {options.areas.map(area => {
            const active = filters.areas.includes(area);
            return (
              <button
                key={area}
                onClick={() => onChange({ ...filters, areas: toggle(filters.areas, area) })}
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  active
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-100 text-sky-800 hover:bg-sky-200',
                ].join(' ')}
              >
                {areaLabel(area)}
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
