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
  latin_name?: string;
  form: string;
  habitat: string[];
  diet: string[];
  behavior: string[];
  season: string[];
  functional_description: string;
  life_stages: LifeStage[] | string[];
  region: string;
  ecological_role?: string;
  is_keystone?: boolean;
  keystone_type?: string | null;
  keystone_description?: string | null;
  active_months?: string[];
  taxonomic_group?: string;
  /** Flag indicating this is a taxonomic/thematic group, not an individual species */
  is_group?: boolean;
  label?: string; // For taxonomic groups
  common_traits?: string; // For taxonomic groups
  notes?: string; // For taxonomic groups
}

export interface Symbiosis {
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism';
  /** Array of species IDs involved in this relationship */
  members: string[];
  /** Optional: specific species impacted by this relationship */
  impacted_species?: string;
  /** Whether the relationship is obligate (required for survival) */
  obligate?: boolean;
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

export interface DataPack {
  metadata: PackMetadata;
  data: PackData;
}

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
