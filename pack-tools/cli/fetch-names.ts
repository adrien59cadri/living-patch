#!/usr/bin/env node

/**
 * Fetch Wikipedia vernacular names for species in a pack
 *
 * Usage: npm run fetch-names <pack-file> --lang <code> [options]
 * Example: npm run fetch-names packs/1-france.json --lang fr
 * Example: npm run fetch-names packs/0-base.json --lang fr --only-missing
 *
 * Queries the Wikipedia langlinks API and writes the result into
 * common_name as an additional language key (e.g. common_name.fr).
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { validatePackSafe } from '../lib/schema.js';
import { fetchLangName } from '../lib/wikipedia-names.js';
import { RateLimiter } from '../lib/rate-limiter.js';
import type { CommonName, DataPack } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveCommonName(name: CommonName | undefined, fallback: string): string {
  if (!name) return fallback;
  return typeof name === 'string' ? name : name.en;
}

function getLangKey(name: CommonName | undefined, lang: string): string | undefined {
  if (!name || typeof name === 'string') return undefined;
  return (name as Record<string, string>)[lang];
}

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function printUsage() {
  console.error(`${chalk.gray('Usage:')} npm run fetch-names <pack-file> --lang <code> [options]`);
  console.error(`${chalk.gray('Example:')} npm run fetch-names packs/1-france.json --lang fr`);
  console.error(`${chalk.gray('Example:')} npm run fetch-names packs/0-base.json --lang fr --only-missing`);
  console.error();
  console.error(`${chalk.gray('Options:')}`);
  console.error(`  --lang <code>       BCP-47 language code to fetch (required, e.g. fr, de, es)`);
  console.error(`  --only-missing      Skip species that already have the target lang key`);
  console.error(`  --delay <ms>        Delay between API requests (default: 500)`);
  console.error(`  --max <count>       Maximum number of species to process (for testing)`);
}

function parseArgs(cliArgs: string[]): {
  packFile: string;
  lang: string;
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

  let lang: string | undefined;
  let delay = 500;
  let maxSpecies: number | undefined;
  let onlyMissing = false;

  for (let i = 0; i < cliArgs.length; i++) {
    if (cliArgs[i] === '--lang' && cliArgs[i + 1]) {
      lang = cliArgs[i + 1];
      i++;
    } else if (cliArgs[i] === '--delay' && cliArgs[i + 1]) {
      delay = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--max' && cliArgs[i + 1]) {
      maxSpecies = parseInt(cliArgs[i + 1], 10);
      i++;
    } else if (cliArgs[i] === '--only-missing') {
      onlyMissing = true;
    }
  }

  if (!lang) {
    console.error(chalk.red('❌ Error: --lang <code> is required'));
    printUsage();
    return null;
  }

  return { packFile, lang, delay, maxSpecies, onlyMissing };
}

// ---------------------------------------------------------------------------
// Pack loader
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const parsed = parseArgs(args);

  if (!parsed) {
    process.exit(1);
  }

  const { packFile, lang, delay: requestDelay, maxSpecies, onlyMissing } = parsed;
  const pack = loadPack(packFile);

  if (!pack) {
    process.exit(1);
  }

  const absolutePackPath = path.resolve(packFile);

  console.log(chalk.blue(`🔍 Fetching ${lang.toUpperCase()} names from Wikipedia...`));
  console.log(`${chalk.gray('Pack:')} ${pack.metadata.id} (v${pack.metadata.version})`);
  console.log(`${chalk.gray('Language:')} ${lang}  |  ${chalk.gray('Request delay:')} ${requestDelay}ms`);
  if (onlyMissing) {
    console.log(`${chalk.gray('Mode:')} Only missing names (--only-missing)`);
  }
  console.log();

  const allSpecies = pack.data.species || [];
  const speciesToProcess = allSpecies.slice(0, maxSpecies ?? allSpecies.length);

  console.log(`${chalk.gray('Processing:')} ${speciesToProcess.length} species`);
  console.log();

  const rateLimiter = new RateLimiter(requestDelay);

  let fetched = 0;
  let notFound = 0;
  let skipped = 0;
  let alreadyHad = 0;

  for (let i = 0; i < speciesToProcess.length; i++) {
    const species = speciesToProcess[i];
    const progress = `[${i + 1}/${speciesToProcess.length}]`;
    const displayName = resolveCommonName(species.common_name, species.id);

    // Skip taxonomic groups
    if (species.taxonomic_group && !species.latin_name) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Skipped: ${displayName} (taxonomic group)`);
      skipped++;
      continue;
    }

    // Skip if no names at all
    if (!species.latin_name && !species.common_name) {
      console.log(`${chalk.yellow(progress)} ${chalk.gray('⊘')} Skipped: ${species.id} (no names)`);
      skipped++;
      continue;
    }

    // Skip if already has the lang key and --only-missing
    if (onlyMissing && getLangKey(species.common_name, lang)) {
      console.log(`${chalk.gray(progress)} ${chalk.gray('✓')} Already has ${lang}: ${displayName}`);
      alreadyHad++;
      continue;
    }

    try {
      process.stdout.write(
        `${chalk.cyan(progress)} ${displayName.padEnd(30, ' ')} → `,
      );

      const result = await rateLimiter.execute(() =>
        fetchLangName(species.latin_name, displayName, lang)
      );

      if (result) {
        console.log(`${lang.toUpperCase()}: ${chalk.green(result)}  ✓`);

        // Upgrade plain string → multilingual object if needed
        if (typeof species.common_name === 'string') {
          species.common_name = { en: species.common_name, [lang]: result };
        } else if (species.common_name && typeof species.common_name === 'object') {
          (species.common_name as Record<string, string>)[lang] = result;
        } else {
          // common_name was undefined/null — set as object with just the lang key
          species.common_name = { en: displayName, [lang]: result } as CommonName;
        }

        fetched++;
      } else {
        console.log(chalk.yellow('✗ No name found'));
        notFound++;
      }
    } catch (error) {
      console.log(chalk.red('✗ Error'));
      console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
      notFound++;
    }
  }

  console.log();
  console.log(chalk.bold('Summary:'));
  console.log(`${chalk.green(`✓ Names fetched:`)}   ${fetched}/${speciesToProcess.length - skipped - alreadyHad}`);
  console.log(`${chalk.yellow(`✗ Not found:`)}        ${notFound}/${speciesToProcess.length - skipped - alreadyHad}`);
  if (alreadyHad > 0) {
    console.log(`${chalk.blue(`→ Already had ${lang}:`)}  ${alreadyHad}/${speciesToProcess.length}`);
  }
  console.log(`${chalk.gray(`⊘ Skipped:`)}          ${skipped}/${speciesToProcess.length}`);

  if (fetched === 0) {
    console.log();
    console.log(chalk.gray('Nothing to write — pack unchanged.'));
    process.exit(0);
  }

  // Validate modified pack
  const validationResult = validatePackSafe(pack);

  if (!validationResult.success) {
    console.error(chalk.red('\n❌ Pack validation failed after name fetch'));
    validationResult.error.issues.forEach(issue => {
      console.error(`  ${chalk.gray('•')} ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  // Write back
  try {
    fs.writeFileSync(absolutePackPath, JSON.stringify(pack, null, 2) + '\n', 'utf-8');
    console.log();
    console.log(chalk.green('✓ Pack updated:'));
    console.log(`  ${path.relative(process.cwd(), absolutePackPath)}`);
    console.log(`  ${chalk.cyan(fetched)} ${lang} names written to common_name.${lang}`);
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
