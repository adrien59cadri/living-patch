import basePack from '../../../../pack-tools/packs/0-base.json';
import type { LoadedPack } from '../../data';

const state = {
  loadedPacks: [basePack as unknown as LoadedPack],
  isInitialized: true,
  initializePacks: () => Promise.resolve(),
};

const selectorFn = (selector?: (s: typeof state) => unknown) =>
  selector ? selector(state) : state;

export const usePacksStore = Object.assign(selectorFn, {
  getState: () => state,
});
