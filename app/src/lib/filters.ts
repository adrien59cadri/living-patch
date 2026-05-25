import type { Species } from '../types';

export interface FilterState {
  search: string;
  forms: string[];
  seasons: string[];
  habitats: string[];
}

export function filterSpecies(species: Species[], filters: FilterState): Species[] {
  const { search, forms, seasons, habitats } = filters;
  const q = search.toLowerCase().trim();

  return species.filter(s => {
    if (q) {
      const haystack = [
        s.common_name,
        s.latin_name ?? '',
        s.functional_description,
        s.form,
        ...s.habitat,
        ...(s.diet ?? []),
        ...(s.behavior ?? []),
        ...(s.season ?? []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (forms.length > 0 && !forms.includes(s.form)) return false;
    if (seasons.length > 0 && !seasons.some(f => s.season?.includes(f))) return false;
    if (habitats.length > 0 && !habitats.some(h => s.habitat?.includes(h))) return false;

    return true;
  });
}

export function getFilterOptions(species: Species[]) {
  const forms = [...new Set(species.map(s => s.form))].sort();
  const seasons = [...new Set(species.flatMap(s => s.season ?? []))].sort();
  const habitats = [...new Set(species.flatMap(s => s.habitat ?? []))].sort();
  return { forms, seasons, habitats };
}
