#!/usr/bin/env node

/**
 * Fetch Wikipedia images for species in a pack
 * 
 * Usage: npm run fetch-images <pack-file> [options]
 * Example: npm run fetch-images packs/0-base.json
 * Example: npm run fetch-images packs/0-base.json --only-missing
 * 
 * Scrapes Wikipedia for species images, extracts Wikimedia Commons URLs
 * and author information, and writes directly to species.image properties
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validatePackSafe } from '../lib/schema.js';
import { scrapeSpeciesImage } from '../lib/wikipedia-scraper.js';
import { RateLimiter } from '../lib/rate-limiter.js';
import type { DataPack, Pack } from '../types.js';

const args = process.argv.slice(2);

/**
 * Print usage information
 */
function printUsage() {
  console.error(`${chalk.gray('Usage:')} npm run fetch-images <pack-file> [options]`);
  console.error(`${chalk.gray('Example:')} npm run fetch-images packs/0-base.json`);
  console.error(`${chalk.gray('Example:')} npm run fetch-images packs/0-base.json --only-missing`);
  console.error();
  console.error(`${chalk.gray('Options:')}`);
  console.error(`  --only-missing      Skip species that already have images (update mode)`);
  console.error(`  --delay <ms>        Delay between requests in milliseconds (default: 1000)`);
  console.error(`  --max <count>       Maximum number of species to process (for testing)`);
}

/**
 * Parse command line arguments
 */
function parseArgs(cliArgs: string[]): {
  packFile: string;
  delay: number;
  maxSpecies?: number;
  onlyMissing: boolean;
} | null {
  const packFile = cliArgs.find(arg => !arg.startsWith('--'));
  
  if (!packFile) {
    console.error(chalk.red('❌ Error: No pack file specified'));
    printUsage();
    return null;
  }

  let delay = 1000;
  let maxSpecies: number | undefined;
  let onlyMissing = false;

  for (let i = 0; i < cliArgs.length; i++) {
    if (cliArgs[i] === '--delay' && cliArgs[i + 1]) {
      delay = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--max' && cliArgs[i + 1]) {
      maxSpecies = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--only-missing') {
      onlyMissing = true;
    }
  }

  return { packFile, delay, maxSpecies, onlyMissing };
}

/**
 * Load and validate a pack file
 */
function loadPack(filePath: string): DataPack | null {
  try {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      console.error(chalk.red(`❌ Error: Pack file not found: ${filePath}`));
      return null;
    }

    const rawData = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Load as-is without strict validation to handle packs with optional fields
    if (!data.metadata || !data.data) {
      console.error(chalk.red('❌ Error: Pack file missing metadata or data'));
      return null;
    }

    return data as DataPack;
  } catch (error) {
    console.error(chalk.red('❌ Error reading pack file:'));
    console.error(chalk.gray(error instanceof Error ? error.message : String(error)));
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const parsed = parseArgs(args);
  
  if (!parsed) {
    process.exit(1);
  }

  const { packFile, delay: requestDelay, maxSpecies, onlyMissing } = parsed;
  const pack = loadPack(packFile);
  
  if (!pack) {
    process.exit(1);
  }

  const absolutePackPath = path.resolve(packFile);

  console.log(chalk.blue('🔍 Fetching Wikipedia images...'));
  console.log(`${chalk.gray('Pack:')} ${pack.metadata.id} (v${pack.metadata.version})`);
  console.log(`${chalk.gray('Request delay:')} ${requestDelay}ms`);
  if (onlyMissing) {
    console.log(`${chalk.gray('Mode:')} Only missing images (--only-missing)`);
  }
  console.log();

  // Collect all species
  const allSpecies = pack.data.species || [];
  const speciesCount = Math.min(allSpecies.length, maxSpecies || allSpecies.length);
  const speciesToProcess = allSpecies.slice(0, speciesCount);

  console.log(`${chalk.gray('Processing:')} ${speciesToProcess.length} species`);
  console.log();

  // Initialize rate limiter
  const rateLimiter = new RateLimiter(requestDelay);

  // Track results
  let successfulImages = 0;
  let failedSpecies: string[] = [];
  let skippedSpecies: string[] = [];
  let alreadyHadImages = 0;

  // Process each species
  for (let i = 0; i < speciesToProcess.length; i++) {
    const species = speciesToProcess[i];
    const progress = `[${i + 1}/${speciesToProcess.length}]`;

    // Skip taxonomic groups (only fetch images for individual species)
    if (species.taxonomic_group && !species.latin_name) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Skipped: ${species.common_name} (taxonomic group)`);
      skippedSpecies.push(species.id);
      continue;
    }

    // Skip if --only-missing is set and species already has an image
    if (onlyMissing && species.image?.url) {
      console.log(`${chalk.gray(progress)} ${chalk.gray('✓')} Already has image: ${species.common_name}`);
      alreadyHadImages++;
      continue;
    }

    // Skip if no names to search with
    if (!species.latin_name && !species.common_name) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Skipped: ${species.id} (no names)`);
      skippedSpecies.push(species.id);
      continue;
    }

    try {
      process.stdout.write(`${chalk.cyan(progress)} Searching for ${species.common_name}... `);

      const imageData = await rateLimiter.execute(() =>
        scrapeSpeciesImage(species.latin_name, species.common_name)
      );

      if (imageData) {
        console.log(chalk.green('✓ Found'));
        // Write directly to species object
        species.image = {
          url: imageData.url,
          author: imageData.author,
        };
        successfulImages++;
      } else {
        console.log(chalk.yellow('✗ Not found'));
        failedSpecies.push(species.id);
      }
    } catch (error) {
      console.log(chalk.red('✗ Error'));
      console.error(chalk.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
      failedSpecies.push(species.id);
    }
  }

  console.log();
  console.log(chalk.bold('Summary:'));
  console.log(`${chalk.green('✓ Newly fetched:')} ${successfulImages}/${speciesToProcess.length - alreadyHadImages}`);
  if (alreadyHadImages > 0) {
    console.log(`${chalk.blue('→ Already had images:')} ${alreadyHadImages}/${speciesToProcess.length}`);
  }
  console.log(`${chalk.yellow('✗ Failed:')} ${failedSpecies.length}/${speciesToProcess.length - alreadyHadImages}`);
  console.log(`${chalk.gray('⊘ Skipped:')} ${skippedSpecies.length}/${speciesToProcess.length}`);

  // Validate modified pack
  const validationResult = validatePackSafe(pack);

  if (!validationResult.success) {
    console.error(chalk.red('❌ Error: Pack validation failed after image fetch'));
    validationResult.error.issues.forEach(issue => {
      console.error(`  ${chalk.gray('•')} ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  // Write modified pack back to original file
  try {
    fs.writeFileSync(absolutePackPath, JSON.stringify(pack, null, 2), 'utf-8');
    console.log();
    console.log(chalk.green('✓ Pack updated with images:'));
    console.log(`  ${path.relative(process.cwd(), absolutePackPath)}`);
    console.log(`  ${chalk.cyan(successfulImages)} new images added to species.image property`);
    if (onlyMissing && alreadyHadImages > 0) {
      console.log(`  ${chalk.blue(alreadyHadImages)} species already had images (skipped)`);
    }
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Error writing pack file:'));
    console.error(chalk.gray(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// Run main
main().catch(error => {
  console.error(chalk.red('❌ Unexpected error:'));
  console.error(chalk.gray(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
