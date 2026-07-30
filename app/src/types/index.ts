export interface LifeStage {
  /** Stable slug (e.g. "larva") — required for a stage to be referenceable via species_id@stage_id */
  id?: string;
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

export type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

/** Ecological standing relative to the pack's region.
 * 'n' = native (default — pack data omits this field rather than storing 'n', but code uses it explicitly)
 * 'nb' = native bully (native but aggressive spreader)
 * 'nnna' = non-native non-aggressive (introduced but stable)
 * 'i' = invasive (non-native AND spreading aggressively or causing damage) */
export type EcologicalStatus = 'n' | 'nb' | 'nnna' | 'i';

export type EcologicalStatusMode = 'all' | 'native_only' | 'non_native_invasive';

export interface Species {
  id: string;
  common_name: CommonName;
  latin_name?: string;
  form: string;
  habitat?: string[];
  diet?: string[];
  behavior?: string[];
  season?: string[];
  functional_description: string;
  life_stages?: LifeStage[] | string[];
  region: string;
  ecological_role?: string;
  is_keystone?: true;
  keystone_type?: string;
  keystone_description?: string;
  active_months?: string[];
  status?: EcologicalStatus;
  /** Wikipedia image if available */
  image?: {
    url: string;
    author: string;
    source_url?: string;
  };
  /** IUCN Red List conservation status code */
  conservation_status?: ConservationStatus;
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
