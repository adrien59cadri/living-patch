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

export interface Symbiosis {
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism';
  /** Array of species IDs involved in this relationship */
  members: string[];
  /** Optional: specific species impacted by this relationship */
  impacted_species?: string | null;
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

/**
 * Image Pack Type Definitions
 * 
 * Images pack stores Wikipedia-sourced images and metadata for species
 */

export interface ImageEntry {
  /** Species ID this image is for */
  speciesId: string;
  /** URL to the image on Wikimedia Commons */
  url: string;
  /** Author/creator of the image */
  author: string;
}

export interface ImagesMetadata {
  /** Unique identifier for the images pack */
  id: string;
  /** ISO 8601 date when images were fetched */
  createdDate: string;
  /** Status: draft (incomplete) or published (complete) */
  status: 'draft' | 'published';
  /** ID of the source data pack these images are for */
  packId: string;
  /** Optional: human-readable description */
  description?: string;
}

export interface ImagesPack {
  metadata: ImagesMetadata;
  data: ImageEntry[];
}
