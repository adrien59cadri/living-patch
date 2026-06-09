import { vi } from 'vitest';

export const useLifeList = () => ({
  addSighting: vi.fn(),
  setTier: vi.fn(),
  getTier: () => null,
  entries: [],
  sightings: [],
});
export const useSpeciesTier = () => null;
export const useSpeciesSightings = () => [];
export const useSpeciesSightingCount = () => 0;
