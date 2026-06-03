import { useMemo } from 'react';
import { buildIndexes } from '../data';
import { usePacksStore } from '../stores/packs';

export function useDataset() {
  const loadedPacks = usePacksStore(s => s.loadedPacks);

  return useMemo(() => {
    const indexes = buildIndexes(loadedPacks);

    return {
      species: indexes.species,
      groups: indexes.taxonomicGroups,
      taxonomicGroupIds: indexes.taxonomicGroupIds,
      speciesById: indexes.speciesById,
      symbiosisBySpeciesId: indexes.symbiosisBySpeciesId,
      relationsBySpeciesId: indexes.relationsBySpeciesId,
      symbiosis: indexes.symbiosis,
    };
  }, [loadedPacks]);
}
