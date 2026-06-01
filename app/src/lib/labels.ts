import {
  getFormIcon,
  getKeystoneLabel,
  FORM_LABELS,
  SEASON_LABELS,
  HABITAT_LABELS,
  DIET_LABELS,
  SYMBIOSIS_LABELS,
  KEYSTONE_TYPE_LABELS,
} from './designTokens';

/**
 * Format a slug string to a human-readable label.
 * Replaces underscores with spaces and title-cases.
 */
export function formatSlugToLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Convert snake_case to space-separated words (no title case).
 */
export function snakeToSpaceCase(slug: string): string {
  return slug.replace(/_/g, ' ');
}

/**
 * Create a label map with fallback to slug formatting.
 */
function createLabelMap(map: Record<string, string>) {
  return (key: string): string => map[key] ?? formatSlugToLabel(key);
}

// Label functions using factory pattern
const formLabelImpl = createLabelMap(FORM_LABELS);
const seasonLabelImpl = createLabelMap(SEASON_LABELS);
const habitatLabelImpl = createLabelMap(HABITAT_LABELS);
const dietLabelImpl = createLabelMap(DIET_LABELS);
const keystoneTypeLabelImpl = createLabelMap(KEYSTONE_TYPE_LABELS);

export function formLabel(form: string): string {
  return formLabelImpl(form);
}

export function seasonLabel(season: string): string {
  return seasonLabelImpl(season);
}

export function habitatLabel(habitat: string): string {
  return habitatLabelImpl(habitat);
}

export function dietLabel(diet: string): string {
  return dietLabelImpl(diet);
}

export function behaviorLabel(behavior: string): string {
  return formatSlugToLabel(behavior);
}

export function symbiosisLabel(type: string): string {
  return SYMBIOSIS_LABELS[type] ?? type;
}

export function formIcon(form: string): string {
  return getFormIcon(form);
}

export function keystoneTypeLabel(type: string): string {
  return keystoneTypeLabelImpl(type);
}

// Re-export designTokens for convenience
export function keystoneLabel(type: string): string {
  return getKeystoneLabel(type);
}

export function activeMonthsLabel(active_months?: string[] | null): string | null {
  if (!active_months || active_months.length === 0) return null;
  const first = active_months[0];
  return first === 'Jan-Dec' ? 'Year-round' : first;
}

export function areaLabel(region: string): string {
  const map: Record<string, string> = {
    northeast_pa: 'Northeast PA',
    france: 'France',
  };
  return map[region] ?? region;
}
