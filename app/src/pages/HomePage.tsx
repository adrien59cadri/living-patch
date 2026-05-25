import { useState, useMemo } from 'react';
import { useDataset } from '../hooks/useDataset';
import { filterSpecies, getFilterOptions } from '../lib/filters';
import type { FilterState } from '../lib/filters';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SpeciesList } from '../components/SpeciesList';

export default function HomePage() {
  const { species, groups } = useDataset();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    forms: [],
    seasons: [],
    habitats: [],
  });

  const options = useMemo(() => getFilterOptions(species), [species]);
  const filteredSpecies = useMemo(() => filterSpecies(species, filters), [species, filters]);
  const filteredGroups = useMemo(() => filterSpecies(groups, filters), [groups, filters]);

  return (
    <div className="space-y-4">
      <SearchBar
        value={filters.search}
        onChange={search => setFilters(f => ({ ...f, search }))}
      />
      <FilterPanel options={options} filters={filters} onChange={setFilters} />
      <p className="text-xs text-stone-400">
        {filteredSpecies.length}
        {filteredSpecies.length !== species.length ? ` of ${species.length}` : ''} species
      </p>
      <SpeciesList species={filteredSpecies} groups={filteredGroups} />
    </div>
  );
}
