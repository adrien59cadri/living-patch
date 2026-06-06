#!/usr/bin/env node

/**
 * Validate and fix broken/missing images in a pack
 *
 * Usage: npm run fix-broken-images <pack-file> [options]
 * Example: npm run fix-broken-images packs/0-base.json
 * Example: npm run fix-broken-images packs/0-base.json --check (verify without fixing)
 *
 * Validates all species images, identifies broken/missing ones, and fetches
 * fresh images from Wikipedia to replace them.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validatePackSafe } from '../lib/schema.js';
import { scrapeSpeciesImage } from '../lib/wikipedia-scraper.js';
import { RateLimiter } from '../lib/rate-limiter.js';
import type { CommonName, DataPack } from '../types.js';

function resolveCommonName(name: CommonName | undefined, fallback: string): string {
  if (!name) return fallback;
  return typeof name === 'string' ? name : name.en;
}

const args = process.argv.slice(2);

function printUsage() {
  console.error(`${chalk.gray('Usage:')} npm run fix-broken-images <pack-file> [options]`);
  console.error(`${chalk.gray('Example:')} npm run fix-broken-images packs/0-base.json`);
  console.error(`${chalk.gray('Example:')} npm run fix-broken-images packs/0-base.json --check`);
  console.error();
  console.error(`${chalk.gray('Options:')}`);
  console.error(`  --check             Verify broken images without fixing (read-only)`);
  console.error(`  --delay <ms>        Delay between requests in milliseconds (default: 1000)`);
}

function parseArgs(cliArgs: string[]): {
  packFile: string;
  delay: number;
  checkMode: boolean;
} | null {
  const packFile = cliArgs.find(arg => !arg.startsWith('--'));

  if (!packFile) {
    console.error(chalk.red('❌ Error: No pack file specified'));
    printUsage();
    return null;
  }

  let delay = 1000;
  let checkMode = false;

  for (let i = 0; i < cliArgs.length; i++) {
    if (cliArgs[i] === '--delay' && cliArgs[i + 1]) {
      delay = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--check') {
      checkMode = true;
    }
  }

  return { packFile, delay, checkMode };
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

async function checkUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function main() {
  const parsed = parseArgs(args);

  if (!parsed) {
    process.exit(1);
  }

  const { packFile, delay: requestDelay, checkMode } = parsed;
  const pack = loadPack(packFile);

  if (!pack) {
    process.exit(1);
  }

  const absolutePackPath = path.resolve(packFile);

  console.log(chalk.blue('🔍 Validating and fixing broken images...'));
  console.log(`${chalk.gray('Pack:')} ${pack.metadata.id} (v${pack.metadata.version})`);
  if (checkMode) {
    console.log(`${chalk.gray('Mode:')} Check mode (read-only, no fixes)`);
  }
  console.log();

  const allSpecies = pack.data.species || [];
  console.log(`${chalk.gray('Scanning:')} ${allSpecies.length} species`);
  console.log();

  // First pass: validate all images
  const brokenSpecies: typeof allSpecies = [];
  const missingSpecies: typeof allSpecies = [];
  const validSpecies: typeof allSpecies = [];

  for (let i = 0; i < allSpecies.length; i++) {
    const species = allSpecies[i];
    const progress = `[${i + 1}/${allSpecies.length}]`;

    if (!species.image || !species.image.url) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Missing: ${resolveCommonName(species.common_name, species.id)}`);
      missingSpecies.push(species);
      continue;
    }

    process.stdout.write(`${chalk.cyan(progress)} Checking: ${resolveCommonName(species.common_name, species.id)}... `);
    const isValid = await checkUrl(species.image.url);

    if (isValid) {
      console.log(chalk.green('✓ OK'));
      validSpecies.push(species);
    } else {
      console.log(chalk.red('✗ Broken'));
      brokenSpecies.push(species);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log();
  console.log(chalk.bold('Validation Summary:'));
  console.log(`${chalk.green('✓ Valid:')} ${validSpecies.length}/${allSpecies.length}`);
  console.log(`${chalk.red('✗ Broken:')} ${brokenSpecies.length}/${allSpecies.length}`);
  console.log(`${chalk.yellow('⊘ Missing:')} ${missingSpecies.length}/${allSpecies.length}`);

  const toFix = [...brokenSpecies, ...missingSpecies];

  if (toFix.length === 0) {
    console.log();
    console.log(chalk.green('✓ All images are valid!'));
    process.exit(0);
  }

  console.log();
  console.log(chalk.blue(`🔄 Fetching fresh images for ${toFix.length} species...`));
  console.log(`${chalk.gray('Request delay:')} ${requestDelay}ms`);
  console.log();

  if (checkMode) {
    console.log(chalk.yellow('(Check mode: not fixing - use without --check to apply fixes)'));
    console.log();
  }

  const rateLimiter = new RateLimiter(requestDelay);

  let fixedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < toFix.length; i++) {
    const species = toFix[i];
    const progress = `[${i + 1}/${toFix.length}]`;

    if (!species.latin_name && !species.common_name) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Skipped: ${species.id} (no names)`);
      continue;
    }

    try {
      process.stdout.write(`${chalk.cyan(progress)} Fetching for ${resolveCommonName(species.common_name, species.id)}... `);

      const imageData = await rateLimiter.execute(() =>
        scrapeSpeciesImage(species.latin_name, resolveCommonName(species.common_name, species.id))
      );

      if (imageData) {
        console.log(chalk.green('✓ Found'));
        if (!checkMode) {
          species.image = {
            url: imageData.url,
            author: imageData.author,
          };
        }
        fixedCount++;
      } else {
        console.log(chalk.yellow('✗ Not found on Wikipedia'));
        failedCount++;
      }
    } catch (error) {
      console.log(chalk.red('✗ Error'));
      console.error(chalk.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
      failedCount++;
    }
  }

  console.log();
  console.log(chalk.bold('Fix Summary:'));
  console.log(`${chalk.green('✓ Fixed:')} ${fixedCount}/${toFix.length}`);
  console.log(`${chalk.red('✗ Unable to fix:')} ${failedCount}/${toFix.length}`);

  // Validate modified pack
  const validationResult = validatePackSafe(pack);

  if (!validationResult.success) {
    console.error(chalk.red('❌ Error: Pack validation failed'));
    validationResult.error.issues.forEach(issue => {
      console.error(`  ${chalk.gray('•')} ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  if (checkMode) {
    console.log();
    console.log(chalk.yellow('ℹ Check complete (no modifications made)'));
    process.exit(0);
  }

  // Write modified pack back
  try {
    fs.writeFileSync(absolutePackPath, JSON.stringify(pack, null, 2), 'utf-8');
    console.log();
    console.log(chalk.green('✓ Pack updated with fresh images:'));
    console.log(`  ${path.relative(process.cwd(), absolutePackPath)}`);
    console.log(`  ${chalk.green(fixedCount)} broken/missing images replaced`);
    if (failedCount > 0) {
      console.log(`  ${chalk.yellow(failedCount)} species still need manual images`);
    }
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
