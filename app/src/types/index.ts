export interface LifeStage {
  icon: string;
  name: string;
  description: string;
  months: string[];
}

/**
 * A species common name. Either a plain English string, or an object
 * with a required `en` key and optional additional language keys (e.g. `fr`).
 */
export type CommonName = string | { en: string; [lang: string]: string | undefined };

export interface Species {
  id: string;
  common_name: CommonName;
  latin_name?: string | null;
  form: string;
  habitat: string[];
  diet: string[];
  behavior: string[];
  season: string[];
  functional_description: string;
  life_stages: LifeStage[] | string[];
  region: string;
  ecological_role?: string | null;
  is_keystone?: boolean;
  keystone_type?: string | null;
  keystone_description?: string | null;
  active_months?: string[] | null;
  /** Wikipedia image if available */
  image?: {
    url: string;
    author: string;
  };
}

export type SymbiosisStrength = 'critical' | 'important' | 'incidental';

export interface Symbiosis {
  type: string;
  source: string;
  targets: string[];
  fulfillment?: 'any' | 'all';
  strength: SymbiosisStrength;
  notes: string;
}

export interface Relation {
  type: string;
  members: string[];
  notes: string;
}

export interface Dataset {
  species: Species[];
  taxonomic_groups: Species[];
  symbiosis: Symbiosis[];
  relations: Relation[];
}

export interface DiagramNode {
  id: string;
  name: string;
  depth: number;
  relationshipType?: string;
  val?: number;
  x?: number;
  y?: number;
}

export interface DiagramLink {
  source: string;
  target: string;
  relationshipType: string;
  directional?: boolean;
}

export interface ForceGraphData {
  nodes: DiagramNode[];
  links: DiagramLink[];
}

export interface BubbleTreeNode {
  id: string;
  name: string;
  type: 'focal' | 'category' | 'species';
  relationshipType?: string;
  children?: BubbleTreeNode[];
}

export interface HierarchyInput {
  id: string;
  name: string;
  type: 'focal' | 'category' | 'species';
  relationshipType?: string;
  children?: HierarchyInput[];
}

// ── Life List ────────────────────────────────────────────────────────────────

export type FamiliarityTier = 'noticed' | 'familiar' | 'know-it-well' | 'steward';

export type FamiliarityBadge = 'seen' | 'recurring' | 'long-term' | 'wide-ranging';

export interface Sighting {
  id: string;
  speciesId: string;
  date: string; // ISO 8601: YYYY-MM-DD
  location?: string;
  habitatType?: string; // habitat context for Wide-ranging badge (Feature 7)
  notes?: string;
  conditions?: {
    weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    time?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  createdAt: number; // timestamp
}

export interface LifeListEntry {
  speciesId: string;
  tier: FamiliarityTier;
  firstSightedDate?: string;
  sightingCount: number;
  lastUpdated: number;
}
