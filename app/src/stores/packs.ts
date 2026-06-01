import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PacksState {
  disabledPackIds: string[];
  togglePack: (packId: string) => void;
  isPackEnabled: (packId: string) => boolean;
}

export const usePacksStore = create<PacksState>()(
  persist(
    (set, get) => ({
      disabledPackIds: [],

      togglePack(packId: string) {
        set(state => ({
          disabledPackIds: state.disabledPackIds.includes(packId)
            ? state.disabledPackIds.filter(id => id !== packId)
            : [...state.disabledPackIds, packId],
        }));
      },

      isPackEnabled(packId: string) {
        return !get().disabledPackIds.includes(packId);
      },
    }),
    {
      name: 'living-patch-packs-v1',
    }
  )
);
