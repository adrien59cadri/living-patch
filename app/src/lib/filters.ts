import type { Species } from '../types';
import { getCommonName } from './labels';
import {
  getTopLevelForms,
  getAllDescendantForms,
  getTopLevelHabitats,
  getAllDescendantHabitats,
  CONSERVATION_ORDERED,
} from './taxonomies';

export interface FilterState {
  search: string;
  forms: string[];
  seasons: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];
  conservation_statuses: string[];
}

export function filterSpecies(species: Species[], filters: FilterState): Species[] {
  const { search, forms, seasons, habitats, keystone_types, areas, conservation_statuses } = filters;
  const q = search.toLowerCase().trim().replace(/-/g, ' ');

  return species.filter(s => {
    if (q) {
      const haystack = [
        getCommonName(s.common_name),
        s.latin_name ?? '',
        s.functional_description ?? '',
        s.form ?? '',
        ...(s.habitat ?? []),
        ...(s.diet ?? []),
        ...(s.behavior ?? []),
        ...(s.season ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .replace(/-/g, ' ');
      if (!haystack.includes(q)) return false;
    }

    if (forms.length > 0) {
      const expandedForms = expandKeys(forms, getTopLevelForms(), k => getAllDescendantForms(k));
      if (!expandedForms.includes(s.form)) return false;
    }
    if (seasons.length > 0 && !seasons.some(f => s.season?.includes(f))) return false;
    if (habitats.length > 0) {
      const expandedHabitats = expandKeys(habitats, getTopLevelHabitats(), k => getAllDescendantHabitats(k));
      if (!expandedHabitats.some(h => s.habitat?.includes(h))) return false;
    }
    if (keystone_types.length > 0) {
      if (!s.is_keystone || !s.keystone_type || !keystone_types.includes(s.keystone_type)) return false;
    }
    if (areas.length > 0 && !areas.includes(s.region)) return false;
    if (conservation_statuses.length > 0) {
      if (!s.conservation_status || !conservation_statuses.includes(s.conservation_status)) return false;
    }

    return true;
  });
}

/** Expand any top-level category keys to their leaf descendants. */
function expandKeys(
  keys: string[],
  topLevelSet: string[],
  getDescendants: (k: string) => string[],
): string[] {
  const tl = new Set(topLevelSet);
  return keys.flatMap(k => (tl.has(k) ? [k, ...getDescendants(k)] : [k]));
}

export function getFilterOptions(species: Species[]) {
  const forms = [...new Set(species.map(s => s.form))].sort();
  const seasons = [...new Set(species.flatMap(s => s.season ?? []))].sort();
  const habitats = [...new Set(species.flatMap(s => s.habitat ?? []))].sort();
  const keystone_types = [
    ...new Set(
      species
        .filter(s => s.is_keystone && s.keystone_type)
        .map(s => s.keystone_type as string),
    ),
  ].sort();
  const areas = [...new Set(species.map(s => s.region).filter(Boolean))].sort();
  const presentStatuses = new Set(
    species.map(s => s.conservation_status).filter((s): s is string => Boolean(s)),
  );
  const conservation_statuses = CONSERVATION_ORDERED.filter(code => presentStatuses.has(code));
  return { forms, seasons, habitats, keystone_types, areas, conservation_statuses };
}
