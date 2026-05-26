/**
 * Pack loader utility
 * 
 * Loads data packs from the filesystem and merges them with the base dataset.
 * This is meant to be used at build time or via a server-side endpoint.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePackSafe } from './schema.js';
import { mergePacks } from './merge.js';
import type { DataPack } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LoadPacksOptions {
  /** Include draft packs (default: false, only published) */
  includeDrafts?: boolean;
}

/**
 * Load all pack files from a directory
 */
export function loadPacksFromDirectory(packsDir: string, options: LoadPacksOptions = {}): DataPack[] {
  const packs: DataPack[] = [];
  const { includeDrafts = false } = options;

  if (!fs.existsSync(packsDir)) {
    console.warn(`Pack directory not found: ${packsDir}`);
    return packs;
  }

  const files = fs.readdirSync(packsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(packsDir, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawData);

      const result = validatePackSafe(data);
      if (!result.success) {
        console.error(`❌ Failed to validate ${file}:`, result.error.issues[0].message);
        continue;
      }

      const pack = result.data;

      // Filter by status
      const status = pack.metadata.status || 'published';
      if (status === 'draft' && !includeDrafts) {
        console.log(`⊘ Skipped draft pack: ${pack.metadata.id} from ${file} (use --include-drafts to load)`);
        continue;
      }

      packs.push(pack);
      console.log(`✓ Loaded pack: ${pack.metadata.id} (${status}) from ${file}`);
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err instanceof Error ? err.message : String(err));
    }
  }

  return packs;
}

/**
 * Load the base dataset
 */
export function loadBaseDataset(datasetPath: string): any {
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Base dataset not found: ${datasetPath}`);
  }

  const rawData = fs.readFileSync(datasetPath, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Merge packs with base dataset
 */
export function mergeWithBaseDataset(baseDataset: any, packs: DataPack[]): any {
  const baseSpeciesIds = new Set<string>();
  const baseGroupIds = new Set<string>();

  // Collect base dataset IDs
  if (baseDataset.species) {
    for (const species of baseDataset.species) {
      if (species.is_group) {
        baseGroupIds.add(species.id);
      } else {
        baseSpeciesIds.add(species.id);
      }
    }
  }

  if (baseDataset.taxonomic_groups) {
    for (const group of baseDataset.taxonomic_groups) {
      baseGroupIds.add(group.id);
    }
  }

  // Merge packs
  const mergeResult = mergePacks(packs, {
    strict: true,
    baseSpeciesIds,
    baseGroupIds,
  });

  if (!mergeResult.success) {
    throw new Error(`Pack merge failed: ${mergeResult.conflicts.join('; ')}`);
  }

  // Combine with base dataset
  return {
    taxonomic_groups: [
      ...(baseDataset.taxonomic_groups || []),
      ...mergeResult.taxonomic_groups,
    ],
    species: [
      ...(baseDataset.species || []),
      ...mergeResult.species,
    ],
    symbiosis: [
      ...(baseDataset.symbiosis || []),
      ...mergeResult.symbiosis,
    ],
    relations: [
      ...(baseDataset.relations || []),
      ...mergeResult.relations,
    ],
  };
}

/**
 * Load and merge all data (packs + base dataset)
 * 
 * @param baseDatasetPath Path to base dataset.json
 * @param packsDirPath Path to packs directory
 * @param options Load options (includeDrafts, etc.)
 * @returns Merged dataset
 */
export function loadAndMergeDataset(
  baseDatasetPath: string,
  packsDirPath: string,
  options: LoadPacksOptions = {},
): any {
  console.log('Loading base dataset...');
  const baseDataset = loadBaseDataset(baseDatasetPath);

  console.log('Loading packs...');
  const packs = loadPacksFromDirectory(packsDirPath, options);

  if (packs.length === 0) {
    console.log('No packs found, using base dataset only');
    return baseDataset;
  }

  console.log(`Merging ${packs.length} pack(s) with base dataset...`);
  const merged = mergeWithBaseDataset(baseDataset, packs);

  console.log(`✓ Merge complete:`);
  console.log(`  ${merged.species.length} total species`);
  console.log(`  ${merged.taxonomic_groups.length} total taxonomic groups`);
  console.log(`  ${merged.symbiosis.length} total symbiosis relationships`);
  console.log(`  ${merged.relations.length} total relations`);

  return merged;
}
