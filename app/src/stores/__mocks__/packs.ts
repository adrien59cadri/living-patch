import basePack from '../../../../pack-tools/packs/0-base.json';
import type { LoadedPack } from '../../data';

export const usePacksStore = (selector?: (s: { loadedPacks: LoadedPack[] }) => unknown) => {
  const state = { loadedPacks: [basePack as unknown as LoadedPack] };
  return selector ? selector(state) : state;
};
