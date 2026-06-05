#!/usr/bin/env node

/**
 * Fetch IUCN conservation status for species in a pack
 *
 * Usage: npm run fetch-conservation-status <pack-file> [options]
 * Example: npm run fetch-conservation-status packs/0-base.json
 * Example: npm run fetch-conservation-status packs/0-base.json --only-missing
 *
 * Scrapes Wikipedia infoboxes for each species, extracts the IUCN Red List
 * status code (LC, NT, VU, EN, CR, EW, EX, DD), and writes it directly to
 * species.conservation_status. Full labels are never stored — only the code.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { scrapeConservationStatus } from '../lib/wikipedia-scraper.js';
import { RateLimiter } from '../lib/rate-limiter.js';
import type { CommonName, DataPack } from '../types.js';

function resolveCommonName(name: CommonName | undefined, fallback: string): string {
  if (!name) return fallback;
  return typeof name === 'string' ? name : name.en;
}

const args = process.argv.slice(2);

function printUsage() {
  console.error(`${chalk.gray('Usage:')} npm run fetch-conservation-status <pack-file> [options]`);
  console.error(`${chalk.gray('Example:')} npm run fetch-conservation-status packs/0-base.json`);
  console.error(`${chalk.gray('Example:')} npm run fetch-conservation-status packs/0-base.json --only-missing`);
  console.error();
  console.error(`${chalk.gray('Options:')}`);
  console.error(`  --only-missing      Skip species that already have a status (update mode)`);
  console.error(`  --overwrite         Re-fetch even if a status already exists`);
  console.error(`  --delay <ms>        Delay between requests in milliseconds (default: 1000)`);
  console.error(`  --max <count>       Maximum number of species to process (for testing)`);
}

function parseArgs(cliArgs: string[]): {
  packFile: string;
  delay: number;
  maxSpecies?: number;
  onlyMissing: boolean;
  overwrite: boolean;
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
  let overwrite = false;

  for (let i = 0; i < cliArgs.length; i++) {
    if (cliArgs[i] === '--delay' && cliArgs[i + 1]) {
      delay = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--max' && cliArgs[i + 1]) {
      maxSpecies = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--only-missing') {
      onlyMissing = true;
    } else if (cliArgs[i] === '--overwrite') {
      overwrite = true;
    }
  }

  return { packFile, delay, maxSpecies, onlyMissing, overwrite };
}

function loadPack(filePath: string): DataPack | null {
  try {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      console.error(chalk.red(`❌ Error: Pack file not found: ${filePath}`));
      return null;
    }

    const rawData = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(rawData);

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

async function main() {
  const parsed = parseArgs(args);

  if (!parsed) {
    process.exit(1);
  }

  const { packFile, delay: requestDelay, maxSpecies, onlyMissing, overwrite } = parsed;
  const pack = loadPack(packFile);

  if (!pack) {
    process.exit(1);
  }

  const absolutePackPath = path.resolve(packFile);

  console.log(chalk.blue('🔍 Fetching IUCN conservation status from Wikipedia...'));
  console.log(`${chalk.gray('Pack:')} ${pack.metadata.id} (v${pack.metadata.version})`);
  console.log(`${chalk.gray('Request delay:')} ${requestDelay}ms`);
  if (onlyMissing) console.log(`${chalk.gray('Mode:')} Only missing status (--only-missing)`);
  if (overwrite) console.log(`${chalk.gray('Mode:')} Overwrite existing status (--overwrite)`);
  console.log();

  const allSpecies = pack.data.species || [];
  const speciesCount = Math.min(allSpecies.length, maxSpecies || allSpecies.length);
  const speciesToProcess = allSpecies.slice(0, speciesCount);

  console.log(`${chalk.gray('Processing:')} ${speciesToProcess.length} species`);
  console.log();

  const rateLimiter = new RateLimiter(requestDelay);

  let successful = 0;
  let failed: string[] = [];
  let skipped: string[] = [];
  let alreadyHad = 0;

  for (let i = 0; i < speciesToProcess.length; i++) {
    const species = speciesToProcess[i];
    const progress = `[${i + 1}/${speciesToProcess.length}]`;

    // Skip taxonomic groups
    if (species.taxonomic_group && !species.latin_name) {
      skipped.push(species.id);
      continue;
    }

    // Skip if already has status and not overwriting
    if (!overwrite && species.conservation_status && onlyMissing) {
      console.log(`${chalk.gray(progress)} ${chalk.gray('✓')} Already has status (${species.conservation_status}): ${resolveCommonName(species.common_name, species.id)}`);
      alreadyHad++;
      continue;
    }

    if (!overwrite && species.conservation_status) {
      alreadyHad++;
      continue;
    }

    if (!species.latin_name && !species.common_name) {
      skipped.push(species.id);
      continue;
    }

    try {
      process.stdout.write(`${chalk.cyan(progress)} ${resolveCommonName(species.common_name, species.id)}... `);

      const status = await rateLimiter.execute(() =>
        scrapeConservationStatus(species.latin_name, resolveCommonName(species.common_name, species.id))
      );

      if (status) {
        console.log(chalk.green(`✓ ${status}`));
        species.conservation_status = status;
        successful++;
      } else {
        console.log(chalk.yellow('✗ Not found'));
        failed.push(species.id);
      }
    } catch (error) {
      console.log(chalk.red('✗ Error'));
      console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
      failed.push(species.id);
    }
  }

  console.log();
  console.log(chalk.bold('Summary:'));
  console.log(`${chalk.green('✓ Newly fetched:')} ${successful}/${speciesToProcess.length - alreadyHad}`);
  if (alreadyHad > 0) {
    console.log(`${chalk.blue('→ Already had status:')} ${alreadyHad}/${speciesToProcess.length}`);
  }
  console.log(`${chalk.yellow('✗ Failed:')} ${failed.length}/${speciesToProcess.length - alreadyHad}`);
  console.log(`${chalk.gray('⊘ Skipped:')} ${skipped.length}/${speciesToProcess.length}`);

  try {
    fs.writeFileSync(absolutePackPath, JSON.stringify(pack, null, 2), 'utf-8');
    console.log();
    console.log(chalk.green('✓ Pack updated with conservation status:'));
    console.log(`  ${path.relative(process.cwd(), absolutePackPath)}`);
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Error writing pack file:'));
    console.error(chalk.gray(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Unexpected error:'));
  console.error(chalk.gray(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
