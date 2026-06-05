import { useState } from 'react';
import type { FilterState } from '../lib/filters';
import { formLabel, habitatLabel, keystoneLabel, areaLabel, formIcon, conservationStatusLabel } from '../lib/labels';
import {
  getTopLevelForms, getChildForms,
  getTopLevelHabitats, getChildHabitats,
  getTopLevelKeystoneTypes, getChildKeystoneTypes,
} from '../lib/taxonomies';

interface FilterOptions {
  forms: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];
  conservation_statuses: string[];
}

interface Props {
  options: FilterOptions;
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

interface HierarchicalFilterChipsProps {
  items: string[];
  getLabel: (key: string) => string;
  getChildren: (parent: string) => string[];
  availableItems: string[];
  selectedItems: string[];
  onSelectedChange: (items: string[]) => void;
  colors: {
    active: string;
    inactive: string;
    subActive: string;
    subInactive: string;
    border: string;
  };
}

function HierarchicalFilterChips({
  items,
  getLabel,
  getChildren,
  availableItems,
  selectedItems,
  onSelectedChange,
  colors,
}: HierarchicalFilterChipsProps) {
  const [expandedTopLevel, setExpandedTopLevel] = useState<string | null>(null);

  const activeTopLevel = expandedTopLevel ||
    items.find(tl => {
      const children = getChildren(tl);
      return selectedItems.some(item => [tl, ...children].includes(item));
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
          const isExpanded = activeTopLevel === item;
          const isActive = isExpanded ||
            (selectedItems.length > 0 &&
              (selectedItems.includes(item) ||
                getChildren(item).some(child => selectedItems.includes(child))));
          return (
            <button
              key={item}
              onClick={() => {
                if (isExpanded) {
                  setExpandedTopLevel(null);
                  onSelectedChange([]);
                } else {
                  setExpandedTopLevel(item);
                  onSelectedChange([item]);
                }
              }}
              className={[
                'text-xs px-2 py-0.5 rounded-full transition-colors',
                isActive ? colors.active : colors.inactive,
              ].join(' ')}
            >
              {getLabel(item)}
            </button>
          );
        })}
      </div>

      {activeTopLevel && getChildren(activeTopLevel).length > 0 && (
        <div className={`flex flex-wrap gap-1.5 pl-2 border-l-2 ${colors.border}`}>
          {getChildren(activeTopLevel)
            .filter(child => availableItems.includes(child))
            .map(child => {
              const active = selectedItems.includes(child);
              return (
                <button
                  key={child}
                  onClick={() => {
                    const withoutParent = selectedItems.filter(k => k !== activeTopLevel);
                    onSelectedChange(toggle(withoutParent, child));
                  }}
                  className={[
                    'text-xs px-2 py-0.5 rounded-full transition-colors',
                    active ? colors.subActive : colors.subInactive,
                  ].join(' ')}
                >
                  {`└─ ${getLabel(child)}`}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

export function QuickFilterBar({ options, filters, onChange }: Props) {
  const topLevelForms = getTopLevelForms();
  const topLevelHabitats = getTopLevelHabitats();

  const visibleHabitatTopLevels = topLevelHabitats.filter(tl =>
    getChildHabitats(tl).some(child => options.habitats.includes(child)),
  );

  const visibleKeystoneTopLevels = getTopLevelKeystoneTypes().filter(tl => {
    const children = getChildKeystoneTypes(tl);
    return children.some(child => options.keystone_types.includes(child))
      || options.keystone_types.includes(tl);
  });

  // All possible sub-forms (unfiltered by dataset — form taxonomy is always fully browsable)
  const allSubForms = topLevelForms.flatMap(f => getChildForms(f));

  const hasForm = topLevelForms.length > 0;
  const hasHabitat = visibleHabitatTopLevels.length > 0;
  const hasKeystone = visibleKeystoneTopLevels.length > 0;
  const hasArea = options.areas.length > 1;
  const hasConservation = options.conservation_statuses.length > 0;

  if (!hasForm && !hasHabitat && !hasKeystone && !hasArea && !hasConservation) return null;

  return (
    <div className="space-y-2">
      {/* Form chips – hierarchical with icons */}
      {hasForm && (
        <HierarchicalFilterChips
          items={topLevelForms}
          getLabel={form => `${formIcon(form)} ${formLabel(form)}`}
          getChildren={getChildForms}
          availableItems={allSubForms}
          selectedItems={filters.forms}
          onSelectedChange={forms => onChange({ ...filters, forms })}
          colors={{
            active: 'bg-amber-600 text-white',
            inactive: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
            subActive: 'bg-amber-500 text-white',
            subInactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
            border: 'border-amber-300',
          }}
        />
      )}

      {/* Habitat chips – hierarchical */}
      {hasHabitat && (
        <HierarchicalFilterChips
          items={visibleHabitatTopLevels}
          getLabel={habitatLabel}
          getChildren={getChildHabitats}
          availableItems={options.habitats}
          selectedItems={filters.habitats}
          onSelectedChange={habitats => onChange({ ...filters, habitats })}
          colors={{
            active: 'bg-emerald-600 text-white',
            inactive: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            subActive: 'bg-emerald-500 text-white',
            subInactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
            border: 'border-emerald-300',
          }}
        />
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

      {/* Keystone type chips – hierarchical with icons */}
      {hasKeystone && (
        <HierarchicalFilterChips
          items={visibleKeystoneTopLevels}
          getLabel={keystoneLabel}
          getChildren={getChildKeystoneTypes}
          availableItems={options.keystone_types}
          selectedItems={filters.keystone_types}
          onSelectedChange={keystone_types => onChange({ ...filters, keystone_types })}
          colors={{
            active: 'bg-stone-600 text-white',
            inactive: 'bg-stone-100 text-stone-600 hover:bg-stone-200',
            subActive: 'bg-stone-500 text-white',
            subInactive: 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200',
            border: 'border-stone-300',
          }}
        />
      )}

      {/* Conservation status chips – flat multi-select */}
      {hasConservation && (
        <div className="flex flex-wrap gap-1.5">
          {options.conservation_statuses.map(code => {
            const active = filters.conservation_statuses.includes(code);
            return (
              <button
                key={code}
                onClick={() =>
                  onChange({
                    ...filters,
                    conservation_statuses: active
                      ? filters.conservation_statuses.filter(c => c !== code)
                      : [...filters.conservation_statuses, code],
                  })
                }
                className={[
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  active
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200',
                ].join(' ')}
              >
                {conservationStatusLabel(code)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
