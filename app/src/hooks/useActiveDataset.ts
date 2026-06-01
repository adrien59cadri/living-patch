import { useMemo } from 'react';
import { buildDataset, type Dataset, loadedPacks } from '../data';
import { usePacksStore } from '../stores/packs';

export function useActiveDataset(): Dataset {
  const disabledPackIds = usePacksStore((state) => state.disabledPackIds);

  const dataset = useMemo(() => {
    return buildDataset(disabledPackIds);
  }, [disabledPackIds]);

  return dataset;
}

export function useEnabledPacks() {
  const disabledPackIds = usePacksStore((state) => state.disabledPackIds);

  return useMemo(() => {
    return loadedPacks.map((pack) => ({
      ...pack,
      enabled: !disabledPackIds.includes(pack.metadata.id),
    }));
  }, [disabledPackIds]);
}
