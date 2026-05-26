/**
 * Zod validation schema for data packs
 * 
 * This file defines runtime validation using Zod, ensuring pack structure
 * matches the expected format and all required fields are present.
 */

import { z } from 'zod';

/**
 * Regular expression for valid species IDs
 * Format: lowercase_category_slug (e.g., bird_pileated-woodpecker)
 */
const SPECIES_ID_PATTERN = /^[a-z]+_[a-z0-9-]+$/;

/**
 * Regular expression for valid pack IDs
 * Format: lowercase-kebab-case or lowercase_snake_case
 */
const PACK_ID_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Regular expression for semantic versioning
 */
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

export const LifeStageSchema = z.object({
  icon: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  months: z.array(z.string()).optional(),
});

export const SpeciesSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(SPECIES_ID_PATTERN, 'Species ID must match pattern: category_slug (e.g., bird_pileated-woodpecker)'),
  common_name: z.string().min(1),
  latin_name: z.string().optional().nullable(),
  form: z.string().min(1),
  habitat: z.array(z.string()).min(0),
  diet: z.array(z.string()).min(0),
  behavior: z.array(z.string()).min(0),
  season: z.array(z.string()).min(0),
  functional_description: z.string().min(1),
  life_stages: z.union([z.array(LifeStageSchema), z.array(z.string())]),
  region: z.string().min(1),
  ecological_role: z.string().optional().nullable(),
  is_keystone: z.boolean().optional(),
  keystone_type: z.string().optional().nullable(),
  keystone_description: z.string().optional().nullable(),
  active_months: z.array(z.string()).optional().nullable(),
  taxonomic_group: z.string().optional().nullable(),
  is_group: z.boolean().optional(),
  label: z.string().optional().nullable(),
  common_traits: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const SymbiosisSchema = z.object({
  type: z.enum(['mutualism', 'parasitism', 'predation', 'competition', 'commensalism']),
  members: z.array(z.string()).min(2, 'Symbiosis must have at least 2 members'),
  impacted_species: z.string().optional().nullable(),
  obligate: z.boolean().optional(),
  notes: z.string().min(1),
});

export const RelationSchema = z.object({
  type: z.string().min(1),
  members: z.array(z.string()).min(2, 'Relation must have at least 2 members'),
  notes: z.string().min(1),
});

export const PackMetadataSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(PACK_ID_PATTERN, 'Pack ID must contain only lowercase letters, numbers, hyphens, and underscores'),
  createdDate: z.string().datetime('createdDate must be a valid ISO 8601 datetime'),
  author: z.string().min(1),
  version: z
    .string()
    .regex(SEMVER_PATTERN, 'Version must match semantic versioning (e.g., 1.0.0)'),
  schemaVersion: z
    .string()
    .regex(SEMVER_PATTERN, 'schemaVersion must match semantic versioning (e.g., 1.0.0)'),
  description: z.string().min(1),
  status: z.enum(['published', 'draft']).default('published').optional(),
});

export const PackDataSchema = z.object({
  species: z.array(SpeciesSchema).optional(),
  taxonomic_groups: z.array(SpeciesSchema).optional(),
  symbiosis: z.array(SymbiosisSchema).optional(),
  relations: z.array(RelationSchema).optional(),
});

export const DataPackSchema = z.object({
  metadata: PackMetadataSchema,
  data: PackDataSchema,
});

/**
 * Validate a pack against the schema
 * @param data Unknown data to validate
 * @returns Validated DataPack or throws ZodError
 */
export function validatePack(data: unknown) {
  return DataPackSchema.parse(data);
}

/**
 * Validate a pack safely (returns result instead of throwing)
 */
export function validatePackSafe(data: unknown) {
  return DataPackSchema.safeParse(data);
}

export type DataPack = z.infer<typeof DataPackSchema>;
export type Species = z.infer<typeof SpeciesSchema>;
export type Symbiosis = z.infer<typeof SymbiosisSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type PackMetadata = z.infer<typeof PackMetadataSchema>;
export type PackData = z.infer<typeof PackDataSchema>;
