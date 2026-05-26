/**
 * Pack merging utilities
 * 
 * Used by the app to merge data packs into a single dataset
 * with proper conflict detection and index rebuilding.
 */

import type { DataPack } from './schema.js';
import { checkInternalConflicts, checkMultiplePackConflicts, checkAgainstExistingData } from './conflicts.js';

export interface MergeOptions {
  /** Throw on any conflicts (strict mode) */
  strict?: boolean;
  /** Existing dataset to merge packs against */
  baseSpeciesIds?: Set<string>;
  baseGroupIds?: Set<string>;
}

export interface MergeResult {
  success: boolean;
  mergedPacks: number;
  totalSpecies: number;
  totalSymbiosis: number;
  totalRelations: number;
  conflicts: string[];
  species: any[];
  taxonomic_groups: any[];
  symbiosis: any[];
  relations: any[];
}

/**
 * Merge multiple packs into a single dataset
 */
export function mergePacks(packs: DataPack[], options: MergeOptions = {}): MergeResult {
  const { strict = true, baseSpeciesIds = new Set(), baseGroupIds = new Set() } = options;
  const conflicts: string[] = [];
  const mergedSpecies: any[] = [];
  const mergedGroups: any[] = [];
  const mergedSymbiosis: any[] = [];
  const mergedRelations: any[] = [];

  // Check internal conflicts in each pack
  for (const pack of packs) {
    const internalConflicts = checkInternalConflicts(pack);
    if (internalConflicts.hasConflicts) {
      const msgs = internalConflicts.conflicts.map(c => `[${pack.metadata.id}] ${c.message}`);
      if (strict) {
        throw new Error(`Pack conflicts: ${msgs.join('; ')}`);
      }
      conflicts.push(...msgs);
    }

    // Check against base data
    const baseConflicts = checkAgainstExistingData(pack, baseSpeciesIds, baseGroupIds);
    if (baseConflicts.hasConflicts) {
      const msgs = baseConflicts.conflicts.map(c => `[${pack.metadata.id}] ${c.message}`);
      if (strict) {
        throw new Error(`Pack conflicts with base data: ${msgs.join('; ')}`);
      }
      conflicts.push(...msgs);
    }
  }

  // Check conflicts between packs
  const multiConflicts = checkMultiplePackConflicts(packs);
  if (multiConflicts.hasConflicts) {
    const msgs = multiConflicts.conflicts.map(c => `${c.message}`);
    if (strict) {
      throw new Error(`Conflicts between packs: ${msgs.join('; ')}`);
    }
    conflicts.push(...msgs);
  }

  // Merge all data
  for (const pack of packs) {
    if (pack.data.species) {
      mergedSpecies.push(...pack.data.species);
    }

    if (pack.data.taxonomic_groups) {
      mergedGroups.push(...pack.data.taxonomic_groups);
    }

    if (pack.data.symbiosis) {
      mergedSymbiosis.push(...pack.data.symbiosis);
    }

    if (pack.data.relations) {
      mergedRelations.push(...pack.data.relations);
    }
  }

  return {
    success: conflicts.length === 0 || !strict,
    mergedPacks: packs.length,
    totalSpecies: mergedSpecies.length,
    totalSymbiosis: mergedSymbiosis.length,
    totalRelations: mergedRelations.length,
    conflicts,
    species: mergedSpecies,
    taxonomic_groups: mergedGroups,
    symbiosis: mergedSymbiosis,
    relations: mergedRelations,
  };
}
