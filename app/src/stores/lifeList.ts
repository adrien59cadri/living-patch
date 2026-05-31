import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamiliarityTier, Sighting, LifeListEntry } from '../types';

interface LifeListState {
  entries: LifeListEntry[];
  sightings: Sighting[];

  // Actions
  addSighting: (sighting: Omit<Sighting, 'id' | 'createdAt'>) => void;
  setTier: (speciesId: string, tier: FamiliarityTier) => void;
  restoreFromBackup: (entries: LifeListEntry[], sightings: Sighting[]) => void;

  // Selectors
  getTier: (speciesId: string) => FamiliarityTier | null;
  getSightings: (speciesId: string) => Sighting[];
  getSightingCount: (speciesId: string) => number;
  getEntriesForTier: (tier: FamiliarityTier) => LifeListEntry[];
  getTierProgress: () => Record<FamiliarityTier, number>;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useLifeListStore = create<LifeListState>()(
  persist(
    (set, get) => ({
      entries: [],
      sightings: [],

      addSighting(rawSighting) {
        const now = Date.now();
        const sighting: Sighting = {
          ...rawSighting,
          id: generateId(),
          createdAt: now,
        };
        set(state => {
          const existingEntry = state.entries.find(e => e.speciesId === rawSighting.speciesId);
          const updatedEntries: LifeListEntry[] = existingEntry
            ? state.entries.map(e =>
                e.speciesId === rawSighting.speciesId
                  ? { ...e, sightingCount: e.sightingCount + 1, lastUpdated: now }
                  : e
              )
            : [
                ...state.entries,
                {
                  speciesId: rawSighting.speciesId,
                  tier: 'noticed' as FamiliarityTier,
                  firstSightedDate: rawSighting.date,
                  sightingCount: 1,
                  lastUpdated: now,
                },
              ];
          return {
            sightings: [...state.sightings, sighting],
            entries: updatedEntries,
          };
        });
      },

      setTier(speciesId, tier) {
        const now = Date.now();
        set(state => {
          const exists = state.entries.some(e => e.speciesId === speciesId);
          return {
            entries: exists
              ? state.entries.map(e =>
                  e.speciesId === speciesId ? { ...e, tier, lastUpdated: now } : e
                )
              : [
                  ...state.entries,
                  {
                    speciesId,
                    tier,
                    sightingCount: 0,
                    lastUpdated: now,
                  },
                ],
          };
        });
      },

      restoreFromBackup(entries, sightings) {
        set({ entries, sightings });
      },

      getTier(speciesId) {
        return get().entries.find(e => e.speciesId === speciesId)?.tier ?? null;
      },

      getSightings(speciesId) {
        return get().sightings.filter(s => s.speciesId === speciesId);
      },

      getSightingCount(speciesId) {
        return get().entries.find(e => e.speciesId === speciesId)?.sightingCount ?? 0;
      },

      getEntriesForTier(tier) {
        return get().entries.filter(e => e.tier === tier);
      },

      getTierProgress() {
        const counts: Record<FamiliarityTier, number> = {
          noticed: 0,
          familiar: 0,
          'know-it-well': 0,
          steward: 0,
        };
        for (const entry of get().entries) {
          counts[entry.tier]++;
        }
        return counts;
      },
    }),
    {
      name: 'living-patch-life-list-v1',
      version: 1,
    }
  )
);
