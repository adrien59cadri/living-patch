#!/usr/bin/env node

/**
 * Pack validation CLI
 * 
 * Usage: npm run validate <pack-file>
 * Example: npm run validate packs/0-base.json
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validatePackSafe } from '../lib/schema.js';
import { checkInternalConflicts, checkMissingImages } from '../lib/conflicts.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(chalk.red('❌ Error: No pack file specified'));
  console.error(`${chalk.gray('Usage:')} npm run validate <pack-file>`);
  console.error(`${chalk.gray('Example:')} npm run validate packs/0-base.json`);
  process.exit(1);
}

const packFilePath = args[0];

try {
  // Read and parse JSON
  const absolutePath = path.resolve(packFilePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(chalk.red(`❌ File not found: ${packFilePath}`));
    process.exit(1);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf-8');
  let data: unknown;

  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error(chalk.red('❌ JSON Parse Error'));
    if (err instanceof SyntaxError) {
      console.error(`${chalk.gray('Message:')} ${err.message}`);
    }
    process.exit(1);
  }

  // Validate against schema
  const schemaResult = validatePackSafe(data);

  if (!schemaResult.success) {
    console.error(chalk.red('❌ Schema Validation Failed'));
    console.error('');

    schemaResult.error.issues.forEach((issue, idx) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      console.error(`${chalk.yellow(`  [${idx + 1}]`)} ${chalk.gray(path)}`);
      console.error(`      ${issue.message}`);
    });

    process.exit(1);
  }

  const pack = schemaResult.data;

  // Check internal conflicts
  const internalConflicts = checkInternalConflicts(pack);

  if (internalConflicts.hasConflicts) {
    console.error(chalk.red('❌ Internal Conflicts Detected'));
    console.error('');

    internalConflicts.conflicts.forEach((conflict, idx) => {
      console.error(`${chalk.yellow(`  [${idx + 1}]`)} ${chalk.red(conflict.type)}`);
      console.error(`      ${conflict.message}`);
      if (conflict.location) {
        console.error(`      ${chalk.gray(`at ${conflict.location}`)}`);
      }
    });

    process.exit(1);
  }

  // Check for missing images (warnings only)
  const imageWarnings = checkMissingImages(pack);

  // Success!
  const totalSpecies = (pack.data.species?.length || 0) + (pack.data.taxonomic_groups?.length || 0);
  const totalSymbiosis = pack.data.symbiosis?.length || 0;
  const totalRelations = pack.data.relations?.length || 0;
  const totalImages = pack.data.images?.length || 0;
  const status = pack.metadata.status || 'published';

  console.log(chalk.green('✓ Validation Passed'));
  console.log('');
  console.log(`${chalk.bold('Pack:')} ${pack.metadata.id} (v${pack.metadata.version})`);
  console.log(`${chalk.bold('Author:')} ${pack.metadata.author}`);
  console.log(`${chalk.bold('Created:')} ${pack.metadata.createdDate}`);
  console.log(`${chalk.bold('Schema Version:')} ${pack.metadata.schemaVersion}`);
  console.log(`${chalk.bold('Description:')} ${pack.metadata.description}`);
  console.log(`${chalk.bold('Status:')} ${status === 'draft' ? chalk.yellow('🚧 DRAFT') : chalk.green('✓ Published')}`);
  console.log('');
  console.log(chalk.bold('Content:'));
  console.log(`  ${chalk.cyan(totalSpecies)} species/groups`);
  if (totalSymbiosis > 0) console.log(`  ${chalk.cyan(totalSymbiosis)} symbiosis relationships`);
  if (totalRelations > 0) console.log(`  ${chalk.cyan(totalRelations)} general relations`);
  if (totalImages > 0) console.log(`  ${chalk.cyan(totalImages)} 🖼️  images`);

  // Show image coverage warnings
  if (imageWarnings.hasConflicts && imageWarnings.conflicts.length > 0) {
    console.log('');
    console.log(chalk.yellow('⚠ Image Coverage Warnings:'));
    imageWarnings.conflicts.forEach((warning) => {
      console.log(`  ${chalk.yellow('⊘')} ${warning.message}`);
    });
    console.log('');
    console.log(chalk.gray('💡 Suggestion: Run the following to fetch images from Wikipedia:'));
    console.log(chalk.gray(`   npm run fetch-images packs/${pack.metadata.id}.json`));
    console.log(chalk.gray('   Then merge the generated images-*.json into this pack by adding the "images" array to the data object.'));
  }

  if (status === 'draft') {
    console.log('');
    console.log(chalk.yellow('⚠ Note: This pack is DRAFT status and will only be loaded with --include-drafts flag'));
  }

  process.exit(0);
} catch (err) {
  console.error(chalk.red('❌ Unexpected Error'));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
