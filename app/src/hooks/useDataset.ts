import {
  nonGroupSpecies,
  groupSpecies,
  speciesById,
  symbiosisBySpeciesId,
  relationsBySpeciesId,
} from '../data';

export function useDataset() {
  return {
    species: nonGroupSpecies,
    groups: groupSpecies,
    speciesById,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
  };
}
