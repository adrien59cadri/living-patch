import {
  species,
  taxonomicGroups,
  taxonomicGroupIds,
  speciesById,
  symbiosisBySpeciesId,
  relationsBySpeciesId,
  symbiosis,
} from '../data';

export function useDataset() {
  return {
    species,
    groups: taxonomicGroups,
    taxonomicGroupIds,
    speciesById,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
    symbiosis,
  };
}
