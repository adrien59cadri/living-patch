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
  fungus: '#D4A574',         // pastel brown (mushroom color)
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
  fungus: '🍄',
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
  predator: '🦅',
  ecosystem_engineer: '⚙️',
  foundation_species: '🌳',
  mutualist: '🤝',
  trophic_anchor: '🌰',
  // Subtypes: predator
  apex_predator: '🦅',
  insectivore: '🪶',
  // Subtypes: ecosystem_engineer
  cavity_creator: '🪵',
  habitat_modifier: '🦫',
  // Subtypes: mutualist
  pollinator: '🐝',
  seed_disperser: '🐿️',
  // Subtypes: trophic_anchor
  host_plant: '🌿',
  mast_producer: '🍂',
  forage_species: '🐭',
};

// ============================================================================
// KEYSTONE LABELS - Full label + icon for keystone badges
// ============================================================================

export const KEYSTONE_LABELS: Record<string, string> = {
  // Top-level categories
  predator: '🦅 Predator',
  ecosystem_engineer: '⚙️ Ecosystem Engineer',
  foundation_species: '🌳 Foundation Species',
  mutualist: '🤝 Mutualist',
  trophic_anchor: '🌰 Trophic Anchor',
  // Subtypes: predator
  apex_predator: '🦅 Apex Predator',
  insectivore: '🪶 Insectivore',
  // Subtypes: ecosystem_engineer
  cavity_creator: '🪵 Cavity Creator',
  habitat_modifier: '🦫 Habitat Modifier',
  // Subtypes: mutualist
  pollinator: '🐝 Pollinator',
  seed_disperser: '🐿️ Seed Disperser',
  // Subtypes: trophic_anchor
  host_plant: '🌿 Host Plant',
  mast_producer: '🍂 Mast Producer',
  forage_species: '🐭 Forage Species',
};

// ============================================================================
// CONSERVATION STATUS - IUCN Red List tier tokens
// ============================================================================

export const CONSERVATION_STATUS_COLORS: Record<string, string> = {
  EX: '#1a1a1a',
  EW: '#542344',
  CR: '#CC0000',
  EN: '#CC6600',
  VU: '#997700',
  NT: '#006666',
  LC: '#006600',
  DD: '#888888',
};

export const CONSERVATION_STATUS_ICONS: Record<string, string> = {
  EX: '💀',
  EW: '🏚️',
  CR: '🔴',
  EN: '🟠',
  VU: '🟡',
  NT: '🔵',
  LC: '🟢',
  DD: '⬜',
};

export const CONSERVATION_STATUS_LABELS: Record<string, string> = {
  EX: '💀 Extinct',
  EW: '🏚️ Extinct in the Wild',
  CR: '🔴 Critically Endangered',
  EN: '🟠 Endangered',
  VU: '🟡 Vulnerable',
  NT: '🔵 Near Threatened',
  LC: '🟢 Least Concern',
  DD: '⬜ Data Deficient',
};

// ============================================================================
// ECOLOGICAL STATUS - Regional standing of a species (native bully / non-native / invasive)
// ============================================================================

export const ECOLOGICAL_STATUS_LABELS: Record<string, string> = {
  n:    'Native',
  nb:   '⚠️ Native Bully',
  nnna: '🌍 Non-Native',
  i:    '🚫 Invasive',
};

export const ECOLOGICAL_STATUS_COLORS: Record<string, string> = {
  n:    '#16a34a', // green-600  — native, no concern
  nb:   '#b45309', // amber-700  — native concern
  nnna: '#0369a1', // sky-700    — introduced, low threat
  i:    '#7c3aed', // violet-700 — active ecological threat (distinct from conservation red)
};

export const ECOLOGICAL_STATUS_DESCRIPTIONS: Record<string, string> = {
  n:    'Native species that occurred naturally in this region before European contact. No management action needed.',
  nb:   'Native species that spreads aggressively and outcompetes other natives, reducing local diversity.',
  nnna: 'Non-native species introduced by humans but not spreading aggressively. Remains largely localized.',
  i:    'Non-native species spreading aggressively and causing significant ecological damage. Requires management.',
};

export function getEcologicalStatusLabel(status: string): string {
  return ECOLOGICAL_STATUS_LABELS[status] ?? status;
}

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

export const FUNGI_FORMS = new Set(['fungus']);

// ============================================================================
// LABEL MAPS - Human-readable labels for all categorical data
// ============================================================================

export const FORM_LABELS: Record<string, string> = {
  bird: 'Bird',
  woodpecker: 'Woodpecker',
  raptor: 'Raptor',
  owl: 'Owl',
  songbird: 'Songbird',
  warbler: 'Warbler',
  hummingbird: 'Hummingbird',
  wading_bird: 'Wading Bird',
  duck: 'Duck',
  bat: 'Bat',
  mammal: 'Mammal',
  plant: 'Plant',
  tree: 'Tree',
  wildflower: 'Wildflower',
  shrub: 'Shrub',
  insect: 'Insect',
  butterfly: 'Butterfly',
  beetle: 'Beetle',
  bug: 'Bug',
  bee: 'Bee',
  dragonfly: 'Dragonfly',
  grasshopper: 'Grasshopper',
  moth: 'Moth',
  spider: 'Spider',
  frog: 'Frog',
  salamander: 'Salamander',
  turtle: 'Turtle',
  amphibian: 'Amphibian',
  reptile: 'Reptile',
  fungus: 'Fungus',
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
  woodland: 'Woodland',
  open_woodland: 'Open woodland',
  forest_edge: 'Forest edge',
  woodland_edge: 'Woodland edge',
  // Wetland & Water
  wetland: 'Wetland',
  wetland_edge: 'Wetland edge',
  marsh: 'Marsh',
  pond: 'Pond',
  streamside: 'Streamside',
  stream_edge: 'Stream edge',
  riparian: 'Riparian',
  // Open Land
  field: 'Field',
  field_edge: 'Field edge',
  meadow: 'Meadow',
  dry_meadow: 'Dry meadow',
  wet_meadow: 'Wet meadow',
  farmland: 'Farmland',
  // Scrub & Rocky
  shrubland: 'Shrubland',
  rocky_slope: 'Rocky slope',
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
  insectivore: 'Insectivore',
  predator: 'Predator',
  frugivore: 'Frugivore',
  nectarivore: 'Nectarivore',
  herbivore: 'Herbivore',
  granivore: 'Granivore',
  omnivore: 'Omnivore',
  piscivore: 'Piscivore',
  sap_feeder: 'Sap feeder',
  invertivore: 'Invertivore',
  carnivore: 'Carnivore',
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
  predator: 'Predator',
  ecosystem_engineer: 'Ecosystem Engineer',
  foundation_species: 'Foundation Species',
  mutualist: 'Mutualist',
  trophic_anchor: 'Trophic Anchor',
  // Subtypes: predator
  apex_predator: 'Apex Predator',
  insectivore: 'Insectivore',
  // Subtypes: ecosystem_engineer
  cavity_creator: 'Cavity Creator',
  habitat_modifier: 'Habitat Modifier',
  // Subtypes: mutualist
  pollinator: 'Pollinator',
  seed_disperser: 'Seed Disperser',
  // Subtypes: trophic_anchor
  host_plant: 'Host Plant',
  mast_producer: 'Mast Producer',
  forage_species: 'Forage Species',
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

/**
 * Get conservation status label (icon + text) for an IUCN status code.
 */
export function getConservationStatusLabel(status: string): string {
  return CONSERVATION_STATUS_LABELS[status] ?? status;
}
