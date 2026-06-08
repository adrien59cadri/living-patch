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
 * Deprecated enum values that have been renamed or consolidated.
 * Storing these in a pack is an error — use the canonical value instead.
 */
const DEPRECATED_VALUES: Record<string, string> = {
  // diet synonyms → canonical -ivore names
  insect_eater: 'insectivore',
  fruit_eater: 'frugivore',
  seed_eater: 'granivore',
  nectar_feeder: 'nectarivore',
  nectivore: 'nectarivore',
  plant_sap_feeder: 'sap_feeder',
  invertebrate_eater: 'invertivore',
  // habitat duplicates
  disturbed_areas: 'disturbed_site',
  rocky_slopes: 'rocky_slope',
  // behavior duplicates
  migratory_seasonal: 'migratory',
  colony_forming: 'colonial',
  mast_producing: 'mast_producer',
};

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
  common_name: z.union([
    z.string().min(1),
    z.object({ en: z.string().min(1) }).catchall(z.string()),
  ]).optional(),
  latin_name: z.string().optional(),
  form: z.string().optional(),
  habitat: z.array(z.string()).min(1, 'habitat must not be empty — omit the field instead').optional(),
  diet: z.array(z.string()).min(1, 'diet must not be empty — omit the field instead').optional(),
  behavior: z.array(z.string()).min(1, 'behavior must not be empty — omit the field instead').optional(),
  season: z.array(z.string()).min(1, 'season must not be empty — omit the field instead').optional(),
  functional_description: z.string().optional(),
  life_stages: z.union([
    z.array(LifeStageSchema).min(1, 'life_stages must not be empty — omit the field instead'),
    z.array(z.string()).min(1, 'life_stages must not be empty — omit the field instead'),
  ]).optional(),
  region: z.string().optional(),
  ecological_role: z.string().optional(),
  is_keystone: z.literal(true).optional(),
  keystone_type: z.string().optional(),
  keystone_description: z.string().optional(),
  active_months: z.array(z.string()).min(1, 'active_months must not be empty — omit the field instead').optional(),
  status: z.enum(['n', 'nb', 'nnna', 'i']).optional(),
  taxonomic_group: z.string().optional(),
  label: z.string().optional(),
  common_traits: z.string().optional(),
  notes: z.string().optional(),
  image: z.object({
    url: z.string().url('Image URL must be a valid URL'),
    author: z.string(),
    source_url: z.string().url().optional(),
  }).optional(),
}).superRefine((species, ctx) => {
  const arrayFields: Array<keyof typeof species> = ['diet', 'habitat', 'behavior', 'season'];
  for (const field of arrayFields) {
    const arr = species[field] as string[] | undefined;
    if (!arr) continue;
    for (const val of arr) {
      const canonical = DEPRECATED_VALUES[val];
      if (canonical) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `[${field}] deprecated value "${val}" — use "${canonical}" instead`,
        });
      }
    }
  }
});

export const TaxonomicGroupSchema = z.object({
  id: z.string().min(1).regex(SPECIES_ID_PATTERN),
  label: z.string().min(1),
  common_traits: z.string().min(1),
  notes: z.string().optional(),
});

export const SymbiosisSchema = z.object({
  type: z.string().min(1),
  source: z.string().min(1),
  targets: z.array(z.string()).min(1, 'Symbiosis must have at least one target'),
  fulfillment: z.enum(['any', 'all']).optional(),
  strength: z.enum(['critical', 'important', 'incidental']),
  notes: z.string().min(1),
}).superRefine((val, ctx) => {
  if (val.fulfillment !== undefined && val.targets.length === 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '[symbiosis] fulfillment set on single-target entry — ignored',
      fatal: false,
    });
  }
  if (val.targets.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '[symbiosis] targets must contain at least one species id',
    });
  }
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
  taxonomic_groups: z.array(TaxonomicGroupSchema).optional(),
  symbiosis: z.array(SymbiosisSchema).optional(),
  relations: z.array(RelationSchema).optional(),
});

export const PackSchema = z.object({
  metadata: PackMetadataSchema,
  data: PackDataSchema,
});

// Alias for backward compatibility
export const DataPackSchema = PackSchema;

/**
 * Validate a pack against the schema
 * @param data Unknown data to validate
 * @returns Validated Pack or throws ZodError
 */
export function validatePack(data: unknown) {
  return PackSchema.parse(data);
}

/**
 * Validate a pack safely (returns result instead of throwing)
 */
export function validatePackSafe(data: unknown) {
  return PackSchema.safeParse(data);
}

// Aliases for backward compatibility
export const validateImagesPack = validatePack;
export const validateImagesPackSafe = validatePackSafe;

export type Pack = z.infer<typeof PackSchema>;
export type DataPack = Pack;
export type ImagesPack = Pack;
export type Species = z.infer<typeof SpeciesSchema>;
export type Symbiosis = z.infer<typeof SymbiosisSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type PackMetadata = z.infer<typeof PackMetadataSchema>;
export type PackData = z.infer<typeof PackDataSchema>;
