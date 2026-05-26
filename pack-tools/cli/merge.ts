#!/usr/bin/env node

/**
 * Pack merge preview CLI
 * 
 * Usage: npm run merge <pack1> <pack2> [pack3...] [--strict]
 * Example: npm run merge packs/0-base.json packs/custom-region.json
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validatePackSafe } from '../lib/schema.js';
import { checkInternalConflicts, checkMultiplePackConflicts } from '../lib/conflicts.js';

interface MergeResult {
  success: boolean;
  packCount: number;
  totalSpecies: number;
  totalSymbiosis: number;
  totalRelations: number;
  speciesByPack: Map<string, number>;
  conflicts: string[];
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const includeDrafts = args.includes('--include-drafts');
const packFiles = args.filter(arg => !arg.startsWith('--'));

if (packFiles.length === 0) {
  console.error(chalk.red('❌ Error: No pack files specified'));
  console.error(`${chalk.gray('Usage:')} npm run merge <pack1> <pack2> [...] [--strict] [--include-drafts]`);
  console.error(`${chalk.gray('Example:')} npm run merge packs/0-base.json packs/custom.json`);
  process.exit(1);
}

try {
  const packs = [];
  const errors: string[] = [];

  // Load and validate each pack
  for (const packFile of packFiles) {
    try {
      const absolutePath = path.resolve(packFile);
      if (!fs.existsSync(absolutePath)) {
        errors.push(`File not found: ${packFile}`);
        continue;
      }

      const rawData = fs.readFileSync(absolutePath, 'utf-8');
      let data: unknown;

      try {
        data = JSON.parse(rawData);
      } catch (err) {
        errors.push(`JSON parse error in ${packFile}: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }

      const schemaResult = validatePackSafe(data);
      if (!schemaResult.success) {
        errors.push(`Schema validation failed in ${packFile}: ${schemaResult.error.issues[0].message}`);
        continue;
      }

      // Check internal conflicts
      const internalConflicts = checkInternalConflicts(schemaResult.data);
      if (internalConflicts.hasConflicts) {
        errors.push(`Internal conflicts in ${packFile}: ${internalConflicts.conflicts[0].message}`);
        continue;
      }

      packs.push(schemaResult.data);
    } catch (err) {
      errors.push(`Error processing ${packFile}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (errors.length > 0) {
    console.error(chalk.red('❌ Errors loading packs:'));
    errors.forEach(err => console.error(`  ${chalk.yellow('•')} ${err}`));
    process.exit(1);
  }

  if (packs.length === 0) {
    console.error(chalk.red('❌ No valid packs loaded'));
    process.exit(1);
  }

  // Check for conflicts between packs
  const multiConflicts = checkMultiplePackConflicts(packs);

  if (multiConflicts.hasConflicts) {
    console.error(chalk.red('❌ Conflicts detected between packs:'));
    multiConflicts.conflicts.forEach(conflict => {
      console.error(`  ${chalk.yellow('•')} ${conflict.message}`);
    });
    if (strict) {
      process.exit(1);
    }
  }

  // Calculate merged stats
  let totalSpecies = 0;
  let totalSymbiosis = 0;
  let totalRelations = 0;
  const speciesByPack = new Map<string, number>();
  const draftPacks = [];
  const publishedPacks = [];

  for (const pack of packs) {
    const status = pack.metadata.status || 'published';
    const speciesCount = (pack.data.species?.length || 0) + (pack.data.taxonomic_groups?.length || 0);
    
    totalSpecies += speciesCount;
    totalSymbiosis += pack.data.symbiosis?.length || 0;
    totalRelations += pack.data.relations?.length || 0;
    speciesByPack.set(pack.metadata.id, speciesCount);

    if (status === 'draft') {
      draftPacks.push({ pack, speciesCount });
    } else {
      publishedPacks.push({ pack, speciesCount });
    }
  }

  // Filter draft packs if not included
  let activePacks = packs;
  let skippedDrafts = 0;
  if (!includeDrafts && draftPacks.length > 0) {
    skippedDrafts = draftPacks.length;
    activePacks = publishedPacks.map(p => p.pack);
    
    // Recalculate totals for active packs only
    totalSpecies = 0;
    totalSymbiosis = 0;
    totalRelations = 0;
    for (const { pack } of publishedPacks) {
      const speciesCount = (pack.data.species?.length || 0) + (pack.data.taxonomic_groups?.length || 0);
      totalSpecies += speciesCount;
      totalSymbiosis += pack.data.symbiosis?.length || 0;
      totalRelations += pack.data.relations?.length || 0;
    }
  }

  // Output results
  console.log(chalk.green('✓ Merge Preview Successful'));
  console.log('');
  
  if (activePacks.length > 0) {
    console.log(chalk.bold('Packs to merge:'));
    activePacks.forEach(pack => {
      const speciesCount = speciesByPack.get(pack.metadata.id) || 0;
      const status = pack.metadata.status || 'published';
      const statusLabel = status === 'draft' ? chalk.yellow('🚧 DRAFT') : chalk.green('✓');
      console.log(`  ${statusLabel} ${chalk.cyan(pack.metadata.id)} (v${pack.metadata.version})`);
      console.log(`    ${speciesCount} species/groups | ${(pack.data.symbiosis?.length || 0)} symbiosis | ${(pack.data.relations?.length || 0)} relations`);
    });
  }

  if (skippedDrafts > 0) {
    console.log('');
    console.log(chalk.yellow(`⊘ Skipped ${skippedDrafts} draft pack(s) (use --include-drafts to include them)`));
  }

  console.log('');
  console.log(chalk.bold('Merged Dataset:'));
  console.log(`  ${chalk.cyan(totalSpecies)} total species/groups`);
  console.log(`  ${chalk.cyan(totalSymbiosis)} total symbiosis relationships`);
  console.log(`  ${chalk.cyan(totalRelations)} total general relations`);

  if (multiConflicts.hasConflicts && !strict) {
    console.log('');
    console.log(chalk.yellow('⚠ Warnings: Conflicts detected but merge would continue'));
  }

  process.exit(0);
} catch (err) {
  console.error(chalk.red('❌ Unexpected Error'));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
