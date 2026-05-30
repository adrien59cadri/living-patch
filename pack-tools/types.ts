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
  taxonomic_group?: string | null;
  label?: string | null;
  common_traits?: string | null;
  notes?: string | null;
  /** Wikipedia image if available */
  image?: {
    url: string;
    author: string;
  };
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


