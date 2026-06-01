import { useActiveDataset } from './useActiveDataset';

export function useDataset() {
  const dataset = useActiveDataset();
  return {
    species: dataset.species,
    groups: dataset.taxonomicGroups,
    taxonomicGroupIds: dataset.taxonomicGroupIds,
    speciesById: dataset.speciesById,
    symbiosisBySpeciesId: dataset.symbiosisBySpeciesId,
    relationsBySpeciesId: dataset.relationsBySpeciesId,
    symbiosis: dataset.symbiosis,
  };
}
