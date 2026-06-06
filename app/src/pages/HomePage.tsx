import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { filterSpecies, getFilterOptions, convertGlobalFiltersToFilterState } from '../lib/filters';
import type { FilterState } from '../lib/filters';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { QuickFilterBar } from '../components/QuickFilterBar';
import { SpeciesList } from '../components/SpeciesList';
import { LifeListStats } from '../components/LifeListStats';

export default function HomePage() {
  const { species, groups } = useDataset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { preferences } = useUserPreferences();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [initData] = useState(() => {
    const options = getFilterOptions(species);
    const urlForms = searchParams.getAll('form');
    const urlAreas = searchParams.getAll('area');
    const urlEcologicalStatuses = searchParams.getAll('ecological_status');

    // Has any URL params for filters
    const hasUrlFilters = urlForms.length > 0 || urlAreas.length > 0 || urlEcologicalStatuses.length > 0 || searchParams.has('season') || searchParams.has('habitat') || searchParams.has('keystone_type') || searchParams.has('conservation_status');

    // Apply global filters only if no URL params present
    let globalDefaults: Partial<FilterState> = {};
    let isApplyingGlobal = false;
    if (!hasUrlFilters) {
      globalDefaults = convertGlobalFiltersToFilterState(preferences, options.forms, options.areas);
      // Check if any global filter is actually being applied
      isApplyingGlobal = ((globalDefaults.forms?.length ?? 0) !== options.forms.length) ||
                          ((globalDefaults.areas?.length ?? 0) !== options.areas.length) ||
                          ((globalDefaults.ecological_statuses?.length ?? 0) > 0);
    }

    return {
      filters: {
        search: '',
        forms: urlForms.length > 0 ? urlForms : (globalDefaults.forms ?? []),
        seasons: searchParams.getAll('season'),
        habitats: searchParams.getAll('habitat'),
        keystone_types: searchParams.getAll('keystone_type'),
        areas: urlAreas.length > 0 ? urlAreas : (globalDefaults.areas ?? []),
        conservation_statuses: searchParams.getAll('conservation_status'),
        ecological_statuses: urlEcologicalStatuses.length > 0 ? urlEcologicalStatuses : (globalDefaults.ecological_statuses ?? []),
      } as FilterState,
      isApplyingGlobal,
    };
  });

  const [filters, setFilters] = useState<FilterState>(initData.filters);
  const [usingGlobalFilters] = useState(initData.isApplyingGlobal);

  // Sync filters to URL when they change (but not on mount)
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Build URL params from new filters
    const params = new URLSearchParams();
    newFilters.forms.forEach(f => params.append('form', f));
    newFilters.habitats.forEach(h => params.append('habitat', h));
    newFilters.keystone_types.forEach(kt => params.append('keystone_type', kt));
    newFilters.areas.forEach(a => params.append('area', a));
    newFilters.conservation_statuses.forEach(cs => params.append('conservation_status', cs));
    newFilters.ecological_statuses.forEach(es => params.append('ecological_status', es));
    
    const queryString = params.toString();
    navigate(queryString ? `?${queryString}` : '/');
  };

  const options = useMemo(() => getFilterOptions(species), [species]);
  const filteredSpecies = useMemo(() => filterSpecies(species, filters), [species, filters]);
  const filteredGroups = useMemo(() => filterSpecies(groups, filters), [groups, filters]);

  const activeFilterCount =
    filters.forms.length + filters.habitats.length + filters.keystone_types.length +
    filters.areas.length + filters.conservation_statuses.length + filters.ecological_statuses.length;

  return (
    <div className="space-y-4">
      <LifeListStats />
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            value={filters.search}
            onChange={search => setFilters(f => ({ ...f, search }))}
          />
        </div>
        <button
          onClick={() => setIsAdvancedOpen(v => !v)}
          className={[
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
            isAdvancedOpen || activeFilterCount > 0
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-stone-500 border border-stone-200 hover:border-emerald-300',
          ].join(' ')}
        >
          Filters
          {activeFilterCount > 0 && !isAdvancedOpen && (
            <span className="bg-white text-emerald-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
          <span className="text-[10px]">{isAdvancedOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {usingGlobalFilters && (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600">
          🔒 Global filters applied
        </div>
      )}

      <QuickFilterBar options={options} filters={filters} onChange={handleFilterChange} />

      {isAdvancedOpen && (
        <FilterPanel options={options} filters={filters} onChange={handleFilterChange} />
      )}

      <p className="text-xs text-stone-400">
        {filteredSpecies.length}
        {filteredSpecies.length !== species.length ? ` of ${species.length}` : ''} species
      </p>
      <SpeciesList species={filteredSpecies} groups={filteredGroups} />
    </div>
  );
}

