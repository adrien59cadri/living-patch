import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoadedPack, PackManifestEntry } from '../data';

interface PacksState {
  manifest: PackManifestEntry[];
  loadedPacks: LoadedPack[];
  /** Persisted: list of pack IDs to load on startup. Defaults to ['0-base']. */
  enabledPackIds: string[];
  loadingPackIds: string[];
  errorPackIds: string[];
  isInitialized: boolean;

  initializePacks: () => Promise<void>;
  togglePack: (packId: string) => Promise<void>;
  retryPack: (packId: string) => Promise<void>;
  isPackEnabled: (packId: string) => boolean;
  isPackLoading: (packId: string) => boolean;
}

const BASE_URL = import.meta.env.BASE_URL;

async function fetchPackById(id: string): Promise<LoadedPack> {
  const res = await fetch(`${BASE_URL}packs/${id}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<LoadedPack>;
}

async function fetchManifest(): Promise<PackManifestEntry[]> {
  const res = await fetch(`${BASE_URL}packs/manifest.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PackManifestEntry[]>;
}

export const usePacksStore = create<PacksState>()(
  persist(
    (set, get) => ({
      manifest: [],
      loadedPacks: [],
      enabledPackIds: ['0-base'],
      loadingPackIds: [],
      errorPackIds: [],
      isInitialized: false,

      async initializePacks() {
        if (get().isInitialized) return;

        // Fetch manifest
        let manifest: PackManifestEntry[] = [];
        try {
          manifest = await fetchManifest();
        } catch (err) {
          console.error('[packs] Failed to fetch manifest:', err);
        }
        set({ manifest });

        // Fetch all enabled packs in parallel
        const { enabledPackIds } = get();
        set({ loadingPackIds: [...enabledPackIds] });

        const results = await Promise.allSettled(
          enabledPackIds.map(id => fetchPackById(id))
        );

        const loadedPacks: LoadedPack[] = [];
        const errorPackIds: string[] = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === 'fulfilled') {
            loadedPacks.push(result.value);
          } else {
            errorPackIds.push(enabledPackIds[i]);
            console.error(`[packs] Failed to load pack ${enabledPackIds[i]}:`, result.reason);
          }
        }

        set({ loadedPacks, errorPackIds, loadingPackIds: [], isInitialized: true });
      },

      async togglePack(packId: string) {
        const { enabledPackIds, loadedPacks } = get();
        const isEnabled = enabledPackIds.includes(packId);

        if (isEnabled) {
          // Disable: remove from enabled + unload data from memory
          set({
            enabledPackIds: enabledPackIds.filter(id => id !== packId),
            loadedPacks: loadedPacks.filter(p => p.metadata.id !== packId),
          });
        } else {
          // Enable: add to enabled + fetch + load into memory
          set(state => ({
            enabledPackIds: [...state.enabledPackIds, packId],
            loadingPackIds: [...state.loadingPackIds, packId],
            errorPackIds: state.errorPackIds.filter(id => id !== packId),
          }));

          try {
            const pack = await fetchPackById(packId);
            set(state => ({
              loadedPacks: [...state.loadedPacks, pack],
              loadingPackIds: state.loadingPackIds.filter(id => id !== packId),
            }));
          } catch (err) {
            console.error(`[packs] Failed to fetch pack ${packId}:`, err);
            set(state => ({
              enabledPackIds: state.enabledPackIds.filter(id => id !== packId),
              loadingPackIds: state.loadingPackIds.filter(id => id !== packId),
              errorPackIds: [...state.errorPackIds, packId],
            }));
          }
        }
      },

      async retryPack(packId: string) {
        set(state => ({
          errorPackIds: state.errorPackIds.filter(id => id !== packId),
        }));
        await get().togglePack(packId);
      },

      isPackEnabled(packId: string) {
        return get().enabledPackIds.includes(packId);
      },

      isPackLoading(packId: string) {
        return get().loadingPackIds.includes(packId);
      },
    }),
    {
      name: 'living-patch-packs-v2',
      partialize: (state) => ({ enabledPackIds: state.enabledPackIds }),
    }
  )
);
