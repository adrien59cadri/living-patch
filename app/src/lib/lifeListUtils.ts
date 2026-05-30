import type { FamiliarityTier, Sighting } from '../types';

export const TIER_ORDER: FamiliarityTier[] = ['noticed', 'familiar', 'know-it-well', 'steward'];

export const TIER_LABELS: Record<FamiliarityTier, string> = {
  noticed: 'Noticed',
  familiar: 'Familiar',
  'know-it-well': 'Know It Well',
  steward: 'Steward',
};

export const TIER_ICONS: Record<FamiliarityTier, string> = {
  noticed: '👁',
  familiar: '🌿',
  'know-it-well': '📚',
  steward: '🌳',
};

/** Tailwind text + background colors for each tier */
export const TIER_COLORS: Record<FamiliarityTier, { bg: string; text: string; border: string }> = {
  noticed: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300' },
  familiar: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  'know-it-well': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  steward: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400' },
};

/** Today's date in YYYY-MM-DD format */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Format a YYYY-MM-DD date for display */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Group sightings by YYYY-MM-DD date */
export function groupSightingsByDate(sightings: Sighting[]): Record<string, Sighting[]> {
  const groups: Record<string, Sighting[]> = {};
  for (const s of sightings) {
    if (!groups[s.date]) groups[s.date] = [];
    groups[s.date].push(s);
  }
  return groups;
}

/** Get sightings per month as { 'YYYY-MM': count } */
export function sightingsByMonth(sightings: Sighting[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of sightings) {
    const key = s.date.slice(0, 7); // 'YYYY-MM'
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

/** Most recent N sightings across all species, sorted newest-first */
export function recentSightings(sightings: Sighting[], limit = 5): Sighting[] {
  return [...sightings].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}
