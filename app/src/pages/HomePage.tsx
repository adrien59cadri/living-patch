import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { filterSpecies, getFilterOptions } from '../lib/filters';
import type { FilterState } from '../lib/filters';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SpeciesList } from '../components/SpeciesList';
import { LifeListStats } from '../components/LifeListStats';

export default function HomePage() {
  const { species, groups } = useDataset();
  const [searchParams] = useSearchParams();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() => !!searchParams.get('form'));

  const [filters, setFilters] = useState<FilterState>(() => {
    const formParam = searchParams.get('form');
    return {
      search: '',
      forms: formParam ? [formParam] : [],
      seasons: [],
      habitats: [],
      keystone_types: [],
    };
  });

  const options = useMemo(() => getFilterOptions(species), [species]);
  const filteredSpecies = useMemo(() => filterSpecies(species, filters), [species, filters]);
  const filteredGroups = useMemo(() => filterSpecies(groups, filters), [groups, filters]);

  const activeFilterCount =
    filters.forms.length + filters.habitats.length + filters.keystone_types.length;

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

      {isAdvancedOpen && (
        <FilterPanel options={options} filters={filters} onChange={setFilters} />
      )}

      <p className="text-xs text-stone-400">
        {filteredSpecies.length}
        {filteredSpecies.length !== species.length ? ` of ${species.length}` : ''} species
      </p>
      <SpeciesList species={filteredSpecies} groups={filteredGroups} />
    </div>
  );
}

