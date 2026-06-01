import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamiliarityTier, Sighting, LifeListEntry } from '../types';
import { computeFamiliarityBadges, deriveTier } from '../lib/lifeListUtils';

interface LifeListState {
  entries: LifeListEntry[];
  sightings: Sighting[];

  // Actions
  addSighting: (sighting: Omit<Sighting, 'id' | 'createdAt'>) => void;
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

      restoreFromBackup(entries, sightings) {
        set({ entries, sightings });
      },

      getTier(speciesId) {
        const sightings = get().sightings.filter(s => s.speciesId === speciesId);
        if (sightings.length === 0) return null;
        return deriveTier(computeFamiliarityBadges(sightings));
      },

      getSightings(speciesId) {
        return get().sightings.filter(s => s.speciesId === speciesId);
      },

      getSightingCount(speciesId) {
        return get().entries.find(e => e.speciesId === speciesId)?.sightingCount ?? 0;
      },

      getEntriesForTier(tier) {
        const { entries, sightings } = get();
        return entries.filter(e => {
          const s = sightings.filter(sg => sg.speciesId === e.speciesId);
          if (s.length === 0) return false;
          return deriveTier(computeFamiliarityBadges(s)) === tier;
        });
      },

      getTierProgress() {
        const counts: Record<FamiliarityTier, number> = {
          noticed: 0,
          familiar: 0,
          'know-it-well': 0,
          steward: 0,
        };
        const { entries, sightings } = get();
        for (const entry of entries) {
          const s = sightings.filter(sg => sg.speciesId === entry.speciesId);
          if (s.length === 0) continue;
          counts[deriveTier(computeFamiliarityBadges(s))]++;
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
