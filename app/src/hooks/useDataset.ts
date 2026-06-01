import { useMemo } from 'react';
import { loadedPacks, buildIndexes } from '../data';
import { usePacksStore } from '../stores/packs';

export function useDataset() {
  const disabledPackIds = usePacksStore(s => s.disabledPackIds);

  return useMemo(() => {
    const activePacks = disabledPackIds.length === 0
      ? loadedPacks
      : loadedPacks.filter(p => !disabledPackIds.includes(p.metadata.id));

    const indexes = buildIndexes(activePacks);

    return {
      species: indexes.species,
      groups: indexes.taxonomicGroups,
      taxonomicGroupIds: indexes.taxonomicGroupIds,
      speciesById: indexes.speciesById,
      symbiosisBySpeciesId: indexes.symbiosisBySpeciesId,
      relationsBySpeciesId: indexes.relationsBySpeciesId,
      symbiosis: indexes.symbiosis,
    };
  }, [disabledPackIds]);
}
