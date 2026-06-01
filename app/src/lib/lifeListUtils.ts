import type { FamiliarityBadge, FamiliarityTier, Sighting } from '../types';

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

// ── Familiarity Badges ────────────────────────────────────────────────────────

export const BADGE_LABELS: Record<FamiliarityBadge, string> = {
  seen: 'Seen',
  recurring: 'Recurring',
  'long-term': 'Long-term',
  'wide-ranging': 'Wide-ranging',
};

export const BADGE_ICONS: Record<FamiliarityBadge, string> = {
  seen: '👁',
  recurring: '📅',
  'long-term': '🗓',
  'wide-ranging': '🗺',
};

/** Returns the list of familiarity badges earned from a sighting history. */
export function computeFamiliarityBadges(sightings: Sighting[]): FamiliarityBadge[] {
  if (sightings.length === 0) return [];
  const badges: FamiliarityBadge[] = ['seen'];
  const months = new Set(sightings.map(s => s.date.slice(5, 7)));
  if (months.size >= 2) badges.push('recurring');
  const years = new Set(sightings.map(s => s.date.slice(0, 4)));
  if (years.size >= 2) badges.push('long-term');
  const habitats = new Set(
    sightings.map(s => s.habitatType).filter((h): h is string => h !== undefined)
  );
  if (habitats.size >= 2) badges.push('wide-ranging');
  return badges;
}

/**
 * Maps badge count to familiarity tier.
 * Assumes badges.length >= 1 (i.e. 'seen' is always the first badge).
 */
export function deriveTier(badges: FamiliarityBadge[]): FamiliarityTier {
  if (badges.length >= 4) return 'steward';
  if (badges.length === 3) return 'know-it-well';
  if (badges.length === 2) return 'familiar';
  return 'noticed';
}
