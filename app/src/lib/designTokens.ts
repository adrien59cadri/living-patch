/**
 * Centralized design tokens: colors, icons, labels, and categorization
 * Single source of truth for branding, form classification, and UI elements
 */

// ============================================================================
// FORM COLORS - Map species form to hex color
// ============================================================================

export const FORM_COLORS: Record<string, string> = {
  bird: '#FFB366',           // pastel orange
  plant: '#C8E6A0',          // pastel chartreuse (yellow-green)
  insect: '#FF9999',         // pastel red/coral
  mammal: '#87CEEB',         // pastel blue (sky blue)
  amphibian: '#A0E7E5',      // pastel turquoise (cyan)
  frog: '#A0E7E5',           // pastel turquoise (cyan)
  reptile: '#D8B8FF',        // pastel purple/lavender
  default: '#D3D3D3',        // pastel gray
};

// ============================================================================
// RELATIONSHIP COLORS - Map symbiosis type to hex color
// ============================================================================

export const RELATIONSHIP_COLORS: Record<string, string> = {
  mutualism: '#C8E6A0',      // pastel chartreuse (cooperation/plants)
  predation: '#FF9999',      // pastel red
  parasitism: '#FFB366',     // pastel orange
  competition: '#D3D3D3',    // pastel gray
  commensalism: '#87CEEB',   // pastel blue
};

// Saturated relationship colors for critical strength (full intensity)
export const RELATIONSHIP_COLORS_CRITICAL: Record<string, string> = {
  mutualism: '#3a9e1a',      // deep green
  predation: '#cc1111',      // deep red
  parasitism: '#cc6600',     // deep orange
  competition: '#555555',    // dark gray
  commensalism: '#0077bb',   // deep blue
};

// Medium-saturation relationship colors for important strength
export const RELATIONSHIP_COLORS_IMPORTANT: Record<string, string> = {
  mutualism: '#6dc040',      // medium green
  predation: '#e03333',      // medium red
  parasitism: '#e08800',     // medium amber
  competition: '#999999',    // medium gray
  commensalism: '#2299dd',   // medium blue
};

// ============================================================================
// FORM ICONS - Emoji representation for each form type
// ============================================================================

export const FORM_ICONS: Record<string, string> = {
  bird: '🐦',
  woodpecker: '🪵',
  raptor: '🦅',
  owl: '🦉',
  songbird: '🐦',
  warbler: '🐦',
  hummingbird: '🐦',
  wading_bird: '🦢',
  mammal: '🦫',
  bat: '🦇',
  plant: '🌱',
  tree: '🌳',
  wildflower: '🌸',
  shrub: '🌿',
  insect: '🐜',
  butterfly: '🦋',
  beetle: '🪲',
  bug: '🐛',
  bee: '🐝',
  dragonfly: '🦟',
  frog: '🐸',
};

// ============================================================================
// SYMBIOSIS ICONS - Emoji representation for relationship types
// ============================================================================

export const SYMBIOSIS_ICONS: Record<string, string> = {
  mutualism: '🤝',
  parasitism: '🪱',
  predation: '🦅',
  'predation-grazing': '🌾',
  'predation-seed_eating': '🌱',
  'predation-fruit_eating': '🍒',
  'predation-nectar_feeding': '🌼',
  competition: '⚡',
  commensalism: '↗️',
};

// ============================================================================
// KEYSTONE ICONS - Emoji representation for keystone types
// ============================================================================

export const KEYSTONE_ICONS: Record<string, string> = {
  // Top-level categories
  ecosystem_engineer: '⚙️',
  predator: '🦅',
  mutualist: '🤝',
  resource_provider: '🌰',
  // Subtypes: ecosystem_engineer
  foundation_species: '🌳',
  // Subtypes: predator
  aerial_insect_suppression: '🪶',
  // Subtypes: mutualist
  pollinator: '🐝',
  seed_disperser: '🐿️',
  // Subtypes: resource_provider
  host_plant: '🌿',
  mast_producer: '🍂',
  prey_base: '🐭',
};

// ============================================================================
// KEYSTONE LABELS - Full label + icon for keystone badges
// ============================================================================

export const KEYSTONE_LABELS: Record<string, string> = {
  // Top-level categories
  ecosystem_engineer: '⚙️ Ecosystem Engineer',
  predator: '🦅 Keystone Predator',
  mutualist: '🤝 Keystone Mutualist',
  resource_provider: '🌰 Resource Provider',
  // Subtypes: ecosystem_engineer
  foundation_species: '🌳 Foundation Species',
  // Subtypes: predator
  aerial_insect_suppression: '🪶 Aerial Insect Suppression',
  // Subtypes: mutualist
  pollinator: '🐝 Keystone Pollinator',
  seed_disperser: '🐿️ Seed Disperser',
  // Subtypes: resource_provider
  host_plant: '🌿 Host Plant',
  mast_producer: '🍂 Mast Producer',
  prey_base: '🐭 Prey Base',
};

// ============================================================================
// FORM CATEGORIZATION - Group specific forms into base categories
// ============================================================================

export const BIRD_FORMS = new Set([
  'woodpecker',
  'raptor',
  'owl',
  'songbird',
  'warbler',
  'hummingbird',
  'wading_bird',
]);

export const PLANT_FORMS = new Set(['tree', 'wildflower', 'shrub', 'plant']);

export const INSECT_FORMS = new Set(['butterfly', 'beetle', 'bug', 'bee', 'insect', 'dragonfly']);

export const WILDLIFE_FORMS = new Set(['frog', 'amphibian', 'mammal', 'reptile', 'bat']);

// ============================================================================
// LABEL MAPS - Human-readable labels for all categorical data
// ============================================================================

export const FORM_LABELS: Record<string, string> = {
  woodpecker: 'Woodpecker',
  raptor: 'Raptor',
  owl: 'Owl',
  songbird: 'Songbird',
  warbler: 'Warbler',
  hummingbird: 'Hummingbird',
  wading_bird: 'Wading Bird',
  bat: 'Bat',
  mammal: 'Mammal',
  tree: 'Tree',
  wildflower: 'Wildflower',
  shrub: 'Shrub',
  butterfly: 'Butterfly',
  beetle: 'Beetle',
  bug: 'Bug',
  bee: 'Bee',
  dragonfly: 'Dragonfly',
  frog: 'Frog',
  salamander: 'Salamander',
  turtle: 'Turtle',
  amphibian: 'Amphibian',
  reptile: 'Reptile',
};

export const SEASON_LABELS: Record<string, string> = {
  year_round: 'Year-round',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  fall_migrant: 'Fall migrant',
  late_summer: 'Late summer',
  winter: 'Winter',
};

export const HABITAT_LABELS: Record<string, string> = {
  // Parent / group keys
  wooded: 'Forest & Woodland',
  aquatic: 'Wetland & Water',
  open: 'Open Land',
  scrub: 'Scrub & Rocky',
  urban: 'Garden & Urban',
  // Forest & Woodland
  forest: 'Forest',
  deciduous_forest: 'Deciduous forest',
  mixed_forest: 'Mixed forest',
  woodland: 'Woodland',
  open_woodland: 'Open woodland',
  forest_edge: 'Forest edge',
  woodland_edge: 'Woodland edge',
  forest_understory: 'Forest understory',
  // Wetland & Water
  wetland: 'Wetland',
  wetland_edge: 'Wetland edge',
  marsh: 'Marsh',
  pond: 'Pond',
  beaver_pond: 'Beaver pond',
  vernal_pool: 'Vernal pool',
  stream: 'Stream',
  streamside: 'Streamside',
  stream_edge: 'Stream edge',
  riparian: 'Riparian',
  water: 'Water',
  // Open Land
  field: 'Field',
  open_field: 'Open field',
  field_edge: 'Field edge',
  meadow: 'Meadow',
  dry_meadow: 'Dry meadow',
  wet_meadow: 'Wet meadow',
  grassland: 'Grassland',
  farmland: 'Farmland',
  // Scrub & Rocky
  shrubland: 'Shrubland',
  rocky_slope: 'Rocky slope',
  north_facing_slope: 'North-facing slope',
  ravine: 'Ravine',
  dead_trees: 'Dead trees',
  disturbed_site: 'Disturbed site',
  roadside: 'Roadside',
  // Garden & Urban
  garden: 'Garden',
  park: 'Park',
  suburban: 'Suburban',
};

export const HABITAT_ICONS: Record<string, string> = {
  wooded: '🌲',
  aquatic: '💧',
  open: '🌾',
  scrub: '🪨',
  urban: '🌻',
};

export const DIET_LABELS: Record<string, string> = {
  insect_eater: 'Insect eater',
  predator: 'Predator',
  fruit_eater: 'Fruit eater',
  nectar_feeder: 'Nectar feeder',
  herbivore: 'Herbivore',
  pollen_eater: 'Pollen eater',
};

export const SYMBIOSIS_LABELS: Record<string, string> = {
  mutualism: 'Mutualism',
  parasitism: 'Parasitism & Hosting',
  predation: 'Predation',
  competition: 'Competition',
  commensalism: 'Commensalism',
  related: 'Related Species',
};

export const KEYSTONE_TYPE_LABELS: Record<string, string> = {
  // Top-level categories
  ecosystem_engineer: 'Ecosystem Engineer',
  predator: 'Predator',
  mutualist: 'Mutualist',
  resource_provider: 'Resource Provider',
  // Subtypes: ecosystem_engineer
  foundation_species: 'Foundation Species',
  // Subtypes: predator
  aerial_insect_suppression: 'Aerial Insect Suppression',
  // Subtypes: mutualist
  pollinator: 'Pollinator',
  seed_disperser: 'Seed Disperser',
  // Subtypes: resource_provider
  host_plant: 'Host Plant',
  mast_producer: 'Mast Producer',
  prey_base: 'Prey Base',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map form (e.g., "bird", "woodpecker") to base form for color lookup.
 * Specific forms like "woodpecker" → "bird", "shrub" → "plant"
 */
export function getFormBase(form: string): string {
  if (BIRD_FORMS.has(form)) return 'bird';
  if (PLANT_FORMS.has(form)) return 'plant';
  if (INSECT_FORMS.has(form)) return 'insect';
  if (WILDLIFE_FORMS.has(form)) {
    if (form === 'frog' || form === 'amphibian') return 'amphibian';
    if (form === 'bat') return 'mammal';
    return form;
  }
  return form;
}

/**
 * Get color for a species form (hex).
 */
export function getFormColor(form: string): string {
  const baseForm = getFormBase(form);
  return FORM_COLORS[baseForm] || FORM_COLORS.default;
}

/**
 * Get color for a relationship/symbiosis type (hex).
 */
export function getRelationshipColor(category?: string): string {
  return RELATIONSHIP_COLORS[category || ''] || RELATIONSHIP_COLORS.competition;
}

/**
 * Get icon for a form.
 */
export function getFormIcon(form: string): string {
  return FORM_ICONS[form] ?? FORM_ICONS.plant;
}

/**
 * Get icon for a symbiosis type.
 */
export function getSymbiosisIcon(type: string): string {
  return SYMBIOSIS_ICONS[type] ?? '🔗';
}

/**
 * Get icon for a keystone type.
 */
export function getKeystoneIcon(type: string): string {
  return KEYSTONE_ICONS[type] ?? '⭐';
}

/**
 * Get keystone label (icon + text) for a keystone type.
 */
export function getKeystoneLabel(type: string): string {
  return KEYSTONE_LABELS[type] ?? '⭐ Keystone';
}
