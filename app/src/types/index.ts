export interface LifeStage {
  icon: string;
  name: string;
  description: string;
  months: string[];
}

export interface Species {
  id: string;
  common_name: string;
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
  members: string[];
  impacted_species?: string;
  strength: SymbiosisStrength;
  grp?: string | null;
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

export interface Sighting {
  id: string;
  speciesId: string;
  date: string; // ISO 8601: YYYY-MM-DD
  location?: string;
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
