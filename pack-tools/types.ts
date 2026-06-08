/**
 * Data Pack Type Definitions
 * 
 * These types define the structure of a data pack file.
 * Each pack contains metadata and optional data (species, taxonomic groups, symbiosis, relations).
 */

export interface PackMetadata {
  /** Unique identifier for the pack (allows future version superseding) */
  id: string;
  /** ISO 8601 date when pack was created */
  createdDate: string;
  /** Author/creator of the pack */
  author: string;
  /** Semantic version of this pack (e.g., "1.0.0") */
  version: string;
  /** Schema version this pack targets (e.g., "1.0.0") */
  schemaVersion: string;
  /** Human-readable description of pack contents */
  description: string;
  /** Pack status: "published" (reviewed, always loaded) or "draft" (requires --include-drafts flag) */
  status?: 'published' | 'draft';
}

export interface LifeStage {
  icon?: string;
  name: string;
  description: string;
  months?: string[];
}

/**
 * A species common name. Either a plain English string, or an object
 * with a required `en` key and optional additional language keys (e.g. `fr`).
 */
export type CommonName = string | { en: string; [lang: string]: string | undefined };

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
  /** Only stored when true — absence means non-keystone */
  is_keystone?: true;
  keystone_type?: string;
  keystone_description?: string;
  active_months?: string[];
  taxonomic_group?: string;
  label?: string;
  common_traits?: string;
  notes?: string;
  /** Wikipedia image if available */
  image?: {
    url: string;
    author: string;
    source_url?: string;
  };
  /** IUCN Red List conservation status code */
  conservation_status?: 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';
  /** Ecological standing relative to the pack's region.
   * 'n' = native (valid value in code; pack data omits field instead of storing 'n')
   * 'nb' | 'nnna' | 'i' = non-native/invasive variants */
  status?: 'n' | 'nb' | 'nnna' | 'i';
}

export type SymbiosisStrength = 'critical' | 'important' | 'incidental';

export interface Symbiosis {
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism';
  /** The actor or needing party: predator, parasite, or species whose requirement this describes */
  source: string;
  /** One or more partner species. Single entry for standard pairwise; multiple for one-to-many */
  targets: string[];
  /** Only meaningful when targets.length > 1. 'any' = any single target satisfies the need. 'all' = all targets simultaneously. */
  fulfillment?: 'any' | 'all';
  /** Ecological importance of this relationship */
  strength: SymbiosisStrength;
  /** Notes explaining the relationship */
  notes: string;
}

export interface Relation {
  type: string;
  /** Array of species IDs involved */
  members: string[];
  notes: string;
}

export interface PackData {
  /** Array of species (individual and taxonomic groups) */
  species?: Species[];
  /** Array of taxonomic groups (legacy, mostly for backward compat) */
  taxonomic_groups?: Species[];
  /** Array of symbiotic relationships */
  symbiosis?: Symbiosis[];
  /** Array of general relations */
  relations?: Relation[];
}

export interface Pack {
  metadata: PackMetadata;
  data: PackData;
}

// Aliases for backward compatibility
export type DataPack = Pack;
export type ImagesPack = Pack;

/**
 * Full dataset after merging multiple packs
 */
export interface Dataset {
  taxonomic_groups: Species[];
  species: Species[];
  symbiosis: Symbiosis[];
  relations: Relation[];
}

/**
 * Validation and conflict detection result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConflictReport {
  hasConflicts: boolean;
  conflicts: Array<{
    type: 'duplicate_species_id' | 'duplicate_group_id' | 'orphaned_reference' | 'id_format_violation';
    message: string;
    packId?: string;
    affectedIds?: string[];
  }>;
}


