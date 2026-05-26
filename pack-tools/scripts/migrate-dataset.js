#!/usr/bin/env node

/**
 * Utility script to convert an existing dataset.json to pack format
 * 
 * Usage: node scripts/migrate-dataset.js <input-path> <output-path>
 * Example: node scripts/migrate-dataset.js ../app/src/data/dataset.json packs/0-base.json
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/migrate-dataset.js <input> <output>');
  console.error('Example: node scripts/migrate-dataset.js ../app/src/data/dataset.json packs/0-base.json');
  process.exit(1);
}

const [inputPath, outputPath] = args;

try {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const dataset = JSON.parse(rawData);

  const pack = {
    metadata: {
      id: '0-base',
      createdDate: new Date().toISOString(),
      author: 'LivingPatch Contributors',
      version: '1.0.0',
      schemaVersion: '1.0.0',
      description: 'Core LivingPatch dataset: Northeast Pennsylvania species, taxonomic groups, and ecological relationships',
      status: 'published',
    },
    data: {
      species: dataset.species || [],
      taxonomic_groups: dataset.taxonomic_groups || [],
      symbiosis: dataset.symbiosis || [],
      relations: dataset.relations || [],
    },
  };

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(pack, null, 2));
  console.log(`✓ Migrated dataset to pack format: ${outputPath}`);
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}
