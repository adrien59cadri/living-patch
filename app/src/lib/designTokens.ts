/**
 * Centralized design tokens: colors, icons, labels, and categorization
 * Single source of truth for branding, form classification, and UI elements
 */

// ============================================================================
// FORM COLORS - Map species form to hex color
// ============================================================================

export const FORM_COLORS: Record<string, string> = {
  bird: '#f39c12',           // orange
  plant: '#27ae60',          // green
  insect: '#e74c3c',         // red
  mammal: '#3498db',         // blue
  amphibian: '#1abc9c',      // teal
  frog: '#1abc9c',           // teal
  reptile: '#9b59b6',        // purple
  default: '#95a5a6',        // gray
};

// ============================================================================
// RELATIONSHIP COLORS - Map symbiosis type to hex color
// ============================================================================

export const RELATIONSHIP_COLORS: Record<string, string> = {
  mutualism: '#27ae60',      // green
  predation: '#e74c3c',      // red
  parasitism: '#f39c12',     // orange/gold
  competition: '#95a5a6',    // gray
  commensalism: '#3b82f6',   // blue
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
  plant: '🌱',
  tree: '🌳',
  wildflower: '🌸',
  shrub: '🌿',
  insect: '🐜',
  butterfly: '🦋',
  beetle: '🪲',
  bug: '🐛',
  bee: '🐝',
  frog: '🐸',
};

// ============================================================================
// SYMBIOSIS ICONS - Emoji representation for relationship types
// ============================================================================

export const SYMBIOSIS_ICONS: Record<string, string> = {
  mutualism: '🤝',
  parasitism: '🪱',
  predation: '🦅',
  competition: '⚡',
  commensalism: '↗️',
};

// ============================================================================
// KEYSTONE ICONS - Emoji representation for keystone types
// ============================================================================

export const KEYSTONE_ICONS: Record<string, string> = {
  ecosystem_engineer: '⚙️',
  predator: '🦅',
  mutualist: '🤝',
  pollinator: '🐝',
  host_plant: '🌿',
  prey: '🐭',
  structural: '🌳',
};

// ============================================================================
// KEYSTONE LABELS - Full label + icon for keystone badges
// ============================================================================

export const KEYSTONE_LABELS: Record<string, string> = {
  ecosystem_engineer: '⚙️ Ecosystem Engineer',
  predator: '🦅 Keystone Predator',
  structural: '🌳 Structural Keystone',
  host_plant: '🌿 Host Plant',
  pollinator: '🐝 Keystone Pollinator',
  mutualist: '🤝 Keystone Mutualist',
  prey: '🍒 Keystone Prey',
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

export const INSECT_FORMS = new Set(['butterfly', 'beetle', 'bug', 'bee', 'insect']);

export const WILDLIFE_FORMS = new Set(['frog', 'amphibian', 'mammal', 'reptile']);

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
  if (WILDLIFE_FORMS.has(form)) return form === 'frog' || form === 'amphibian' ? 'amphibian' : form;
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
