import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PacksState {
  disabledPackIds: string[];
  togglePack: (packId: string) => void;
}

export const usePacksStore = create<PacksState>()(
  persist(
    (set) => ({
      disabledPackIds: [],
      togglePack: (packId: string) =>
        set((state) => ({
          disabledPackIds: state.disabledPackIds.includes(packId)
            ? state.disabledPackIds.filter((id) => id !== packId)
            : [...state.disabledPackIds, packId],
        })),
    }),
    {
      name: 'living-patch-packs-v1',
    }
  )
);
