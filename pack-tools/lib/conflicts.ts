/**
 * Pack conflict detection and reporting
 * 
 * Checks for:
 * - Duplicate species IDs within a pack or across merged packs
 * - Orphaned references (symbiosis/relations referencing non-existent species)
 * - ID format violations
 */

import type { DataPack } from './schema.js';

export interface Conflict {
  type: 'duplicate_species_id' | 'duplicate_group_id' | 'orphaned_reference' | 'id_format_violation' | 'invalid_date_format';
  severity: 'error' | 'warning';
  message: string;
  packId?: string;
  affectedIds?: string[];
  location?: string;
}

export interface ConflictReport {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

/**
 * Check for conflicts within a single pack
 */
export function checkInternalConflicts(pack: DataPack): ConflictReport {
  const conflicts: Conflict[] = [];
  const allSpeciesIds = new Set<string>();

  // Collect all species IDs (including groups)
  const allSpecies = [
    ...(pack.data.species || []),
    ...(pack.data.taxonomic_groups || []),
  ];

  for (const species of allSpecies) {
    if (allSpeciesIds.has(species.id)) {
      conflicts.push({
        type: 'duplicate_species_id',
        severity: 'error',
        message: `Duplicate species ID: ${species.id}`,
        packId: pack.metadata.id,
        affectedIds: [species.id],
      });
    }
    allSpeciesIds.add(species.id);
  }

  // Check all symbiosis references exist
  if (pack.data.symbiosis) {
    for (const symbiosis of pack.data.symbiosis) {
      for (const id of [symbiosis.source, ...symbiosis.targets]) {
        if (!allSpeciesIds.has(id)) {
          conflicts.push({
            type: 'orphaned_reference',
            severity: 'error',
            message: `Symbiosis references non-existent species: ${id}`,
            packId: pack.metadata.id,
            affectedIds: [id],
            location: `symbiosis[type=${symbiosis.type}]`,
          });
        }
      }
    }
  }

  // Check all relation references exist
  if (pack.data.relations) {
    for (const relation of pack.data.relations) {
      for (const memberId of relation.members) {
        if (!allSpeciesIds.has(memberId)) {
          conflicts.push({
            type: 'orphaned_reference',
            severity: 'error',
            message: `Relation references non-existent species: ${memberId}`,
            packId: pack.metadata.id,
            affectedIds: [memberId],
            location: `relations[type=${relation.type}]`,
          });
        }
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check for conflicts between a pack and existing dataset
 */
export function checkAgainstExistingData(
  pack: DataPack,
  existingSpeciesIds: Set<string>,
  existingGroupIds: Set<string>,
): ConflictReport {
  const conflicts: Conflict[] = [];

  const packSpecies = pack.data.species || [];
  const packGroups = pack.data.taxonomic_groups || [];

  // Check for duplicate species IDs
  for (const species of packSpecies) {
    if (existingSpeciesIds.has(species.id)) {
      conflicts.push({
        type: 'duplicate_species_id',
        severity: 'error',
        message: `Pack species ID conflicts with existing data: ${species.id}`,
        packId: pack.metadata.id,
        affectedIds: [species.id],
      });
    }
  }

  // Check for duplicate group IDs
  for (const group of packGroups) {
    if (existingGroupIds.has(group.id)) {
      conflicts.push({
        type: 'duplicate_group_id',
        severity: 'error',
        message: `Pack taxonomic group ID conflicts with existing data: ${group.id}`,
        packId: pack.metadata.id,
        affectedIds: [group.id],
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check for conflicts across multiple packs
 */
export function checkMultiplePackConflicts(
  packs: DataPack[],
): ConflictReport {
  const conflicts: Conflict[] = [];
  const seenSpeciesIds = new Map<string, string>(); // id -> packId
  const seenGroupIds = new Map<string, string>(); // id -> packId

  for (const pack of packs) {
    const packSpecies = pack.data.species || [];
    const packGroups = pack.data.taxonomic_groups || [];

    // Check species
    for (const species of packSpecies) {
      if (seenSpeciesIds.has(species.id)) {
        const otherPack = seenSpeciesIds.get(species.id)!;
        conflicts.push({
          type: 'duplicate_species_id',
          severity: 'error',
          message: `Species ID ${species.id} exists in both pack "${pack.metadata.id}" and "${otherPack}"`,
          packId: pack.metadata.id,
          affectedIds: [species.id],
        });
      } else {
        seenSpeciesIds.set(species.id, pack.metadata.id);
      }
    }

    // Check groups
    for (const group of packGroups) {
      if (seenGroupIds.has(group.id)) {
        const otherPack = seenGroupIds.get(group.id)!;
        conflicts.push({
          type: 'duplicate_group_id',
          severity: 'error',
          message: `Taxonomic group ${group.id} exists in both pack "${pack.metadata.id}" and "${otherPack}"`,
          packId: pack.metadata.id,
          affectedIds: [group.id],
        });
      } else {
        seenGroupIds.set(group.id, pack.metadata.id);
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check if species in a pack are missing images
 * @param pack Pack to check
 * @returns Report with warnings for species without images
 */
export function checkMissingImages(pack: DataPack): ConflictReport {
  const conflicts: Conflict[] = [];

  // Only check if pack has species
  const hasSpecies = (pack.data.species && pack.data.species.length > 0);

  if (!hasSpecies) {
    return { hasConflicts: false, conflicts: [] };
  }

  // Check each species for missing images
  const allSpecies = pack.data.species || [];
  const missingImages: string[] = [];

  for (const species of allSpecies) {
    // Skip taxonomic groups (identified by taxonomic_group field + no latin_name)
    if (species.taxonomic_group && !species.latin_name) {
      continue;
    }

    // Check if species has image
    if (!species.image || !species.image.url) {
      missingImages.push(species.id);
      conflicts.push({
        type: 'id_format_violation', // Reuse existing type for warnings
        severity: 'warning',
        message: `Species "${species.common_name}" (${species.id}) is missing an image`,
        packId: pack.metadata.id,
        affectedIds: [species.id],
      });
    }
  }

  return { hasConflicts: conflicts.length > 0, conflicts };
}
