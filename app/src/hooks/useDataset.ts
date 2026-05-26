import {
  nonGroupSpecies,
  groupSpecies,
  speciesById,
  symbiosisBySpeciesId,
  relationsBySpeciesId,
  allSymbiosis,
} from '../data';

export function useDataset() {
  return {
    species: nonGroupSpecies,
    groups: groupSpecies,
    speciesById,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
    symbiosis: allSymbiosis,
  };
}
