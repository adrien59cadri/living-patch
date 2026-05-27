import {
  getFormIcon,
  getKeystoneLabel,
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

// Label maps
const FORM_LABELS: Record<string, string> = {
  woodpecker: 'Woodpecker',
  raptor: 'Raptor',
  owl: 'Owl',
  songbird: 'Songbird',
  warbler: 'Warbler',
  hummingbird: 'Hummingbird',
  wading_bird: 'Wading Bird',
  mammal: 'Mammal',
  tree: 'Tree',
  wildflower: 'Wildflower',
  shrub: 'Shrub',
  butterfly: 'Butterfly',
  beetle: 'Beetle',
  bug: 'Bug',
  bee: 'Bee',
  frog: 'Frog',
};

const SEASON_LABELS: Record<string, string> = {
  year_round: 'Year-round',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  fall_migrant: 'Fall migrant',
  late_summer: 'Late summer',
  winter: 'Winter',
};

const HABITAT_LABELS: Record<string, string> = {
  forest: 'Forest',
  woodland: 'Woodland',
  forest_edge: 'Forest edge',
  field: 'Field',
  field_edge: 'Field edge',
  meadow: 'Meadow',
  garden: 'Garden',
  wetland: 'Wetland',
  marsh: 'Marsh',
  pond: 'Pond',
  riparian: 'Riparian',
  streamside: 'Streamside',
  dry_meadow: 'Dry meadow',
  beaver_pond: 'Beaver pond',
  rocky_slope: 'Rocky slope',
  open_woodland: 'Open woodland',
  wet_meadow: 'Wet meadow',
};

const DIET_LABELS: Record<string, string> = {
  insect_eater: 'Insect eater',
  predator: 'Predator',
  fruit_eater: 'Fruit eater',
  nectar_feeder: 'Nectar feeder',
  herbivore: 'Herbivore',
  pollen_eater: 'Pollen eater',
};

const SYMBIOSIS_LABELS: Record<string, string> = {
  mutualism: 'Mutualism',
  parasitism: 'Parasitism & Hosting',
  predation: 'Predation',
  competition: 'Competition',
  commensalism: 'Commensalism',
  related: 'Related Species',
};

const KEYSTONE_TYPE_LABELS: Record<string, string> = {
  ecosystem_engineer: 'Ecosystem Engineer',
  predator: 'Predator',
  mutualist: 'Mutualist',
};

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
