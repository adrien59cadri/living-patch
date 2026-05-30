import { useLifeListStore } from '../stores/lifeList';
import { useShallow } from 'zustand/react/shallow';
import type { FamiliarityTier, Sighting } from '../types';

/** Full store access */
export function useLifeList() {
  return useLifeListStore();
}

/** Just the tier for a specific species */
export function useSpeciesTier(speciesId: string): FamiliarityTier | null {
  return useLifeListStore(state => state.entries.find(e => e.speciesId === speciesId)?.tier ?? null);
}

/** Just the sightings for a specific species */
export function useSpeciesSightings(speciesId: string): Sighting[] {
  return useLifeListStore(
    useShallow(state => state.sightings.filter(s => s.speciesId === speciesId))
  );
}

/** Sighting count for a specific species */
export function useSpeciesSightingCount(speciesId: string): number {
  return useLifeListStore(
    state => state.entries.find(e => e.speciesId === speciesId)?.sightingCount ?? 0
  );
}
