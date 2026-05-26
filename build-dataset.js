#!/usr/bin/env node

/**
 * Build script: Merge data packs and generate dataset.json for the app
 * 
 * This script:
 * 1. Loads all published packs from pack-tools/packs/
 * 2. Optionally includes draft packs if INCLUDE_DRAFTS=true
 * 3. Merges them into a single dataset
 * 4. Outputs to app/src/data/dataset.json
 * 
 * Run before building the app:
 *   node build-dataset.js
 *   npm run build
 * 
 * Or with draft packs:
 *   INCLUDE_DRAFTS=true node build-dataset.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKS_DIR = path.join(__dirname, 'pack-tools', 'packs');
const OUTPUT_PATH = path.join(__dirname, 'app', 'src', 'data', 'dataset.json');
const INCLUDE_DRAFTS = process.env.INCLUDE_DRAFTS === 'true';

console.log(`🔄 Building dataset from packs...`);
console.log(`   Packs dir: ${PACKS_DIR}`);
console.log(`   Output: ${OUTPUT_PATH}`);
console.log(`   Include drafts: ${INCLUDE_DRAFTS ? 'YES' : 'NO'}`);
console.log('');

try {
  if (!fs.existsSync(PACKS_DIR)) {
    throw new Error(`Packs directory not found: ${PACKS_DIR}`);
  }

  // Load all packs
  const files = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    throw new Error(`No pack files found in ${PACKS_DIR}`);
  }

  const packs = [];
  const skippedDrafts = [];

  for (const file of files) {
    try {
      const filePath = path.join(PACKS_DIR, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawData);

      // Validate pack structure
      if (!data.metadata || !data.data) {
        console.warn(`⚠️  Skipped ${file}: Invalid pack structure (missing metadata or data)`);
        continue;
      }

      const status = data.metadata.status || 'published';
      if (status === 'draft' && !INCLUDE_DRAFTS) {
        skippedDrafts.push(data.metadata.id);
        console.log(`   ⊘ Draft pack: ${data.metadata.id}`);
        continue;
      }

      packs.push(data);
      console.log(`   ✓ Loaded: ${data.metadata.id} (${status})`);
    } catch (err) {
      console.warn(`⚠️  Error loading ${file}:`, err instanceof Error ? err.message : String(err));
    }
  }

  if (packs.length === 0) {
    throw new Error(`No valid packs to merge`);
  }

  // Merge packs into single dataset
  const merged = {
    taxonomic_groups: [],
    species: [],
    symbiosis: [],
    relations: [],
  };

  const speciesIds = new Set();
  const groupIds = new Set();

  for (const pack of packs) {
    const { data } = pack;

    // Track IDs for duplicate detection
    if (data.species) {
      for (const spec of data.species) {
        if (speciesIds.has(spec.id)) {
          throw new Error(`Duplicate species ID: ${spec.id} (from pack ${pack.metadata.id})`);
        }
        speciesIds.add(spec.id);
      }
      merged.species.push(...data.species);
    }

    if (data.taxonomic_groups) {
      for (const group of data.taxonomic_groups) {
        if (groupIds.has(group.id)) {
          throw new Error(`Duplicate group ID: ${group.id} (from pack ${pack.metadata.id})`);
        }
        groupIds.add(group.id);
      }
      merged.taxonomic_groups.push(...data.taxonomic_groups);
    }

    if (data.symbiosis) {
      merged.symbiosis.push(...data.symbiosis);
    }

    if (data.relations) {
      merged.relations.push(...data.relations);
    }
  }

  // Write output
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

  console.log('');
  console.log(`✓ Dataset built successfully`);
  console.log(`  ${merged.species.length} species`);
  console.log(`  ${merged.taxonomic_groups.length} taxonomic groups`);
  console.log(`  ${merged.symbiosis.length} symbiosis relationships`);
  console.log(`  ${merged.relations.length} general relations`);
  
  if (skippedDrafts.length > 0) {
    console.log(`  ⊘ Skipped ${skippedDrafts.length} draft pack(s): ${skippedDrafts.join(', ')}`);
  }

  process.exit(0);
} catch (err) {
  console.error('');
  console.error(`❌ Error:`, err instanceof Error ? err.message : String(err));
  process.exit(1);
}
