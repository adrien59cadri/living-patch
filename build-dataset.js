#!/usr/bin/env node

/**
 * Build script: Merge data packs and generate dataset.json for the app
 *
 * This script:
 * 1. Loads all published packs from pack-tools/packs/
 * 2. Optionally includes draft packs if INCLUDE_DRAFTS=true
 * 3. Merges them into a single dataset
 * 4. Applies enum shorthand compression if --compact flag is set
 * 5. Outputs to app/src/data/dataset.json
 *
 * Run before building the app:
 *   node build-dataset.js
 *   npm run build
 *
 * With compact format (27% size reduction):
 *   node build-dataset.js --compact
 *
 * Or with draft packs:
 *   INCLUDE_DRAFTS=true node build-dataset.js
 *   INCLUDE_DRAFTS=true node build-dataset.js --compact
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic imports for enum encoder and compact JSON formatter
let encodePack;
let compactJson;
const COMPACT_MODE = process.argv.includes('--compact');

// Conditionally load compression modules only if needed
if (COMPACT_MODE) {
  const { encodePack: encode } = await import('./pack-tools/lib/enum-encoder.js');
  const { compactJson: compact } = await import('./pack-tools/lib/compact-json.js');
  encodePack = encode;
  compactJson = compact;
}

const PACKS_DIR = path.join(__dirname, 'pack-tools', 'packs');
const OUTPUT_PATH = path.join(__dirname, 'app', 'src', 'data', 'dataset.json');
const INCLUDE_DRAFTS = process.env.INCLUDE_DRAFTS === 'true';

console.log(`🔄 Building dataset from packs...`);
console.log(`   Packs dir: ${PACKS_DIR}`);
console.log(`   Output: ${OUTPUT_PATH}`);
console.log(`   Include drafts: ${INCLUDE_DRAFTS ? 'YES' : 'NO'}`);
console.log(`   Compact format: ${COMPACT_MODE ? 'YES (enum shorthands + 180-char lines)' : 'NO'}`);
console.log('');

try {
  if (!fs.existsSync(PACKS_DIR)) {
    throw new Error(`Packs directory not found: ${PACKS_DIR}`);
  }

  // Load all packs (unified format: data packs and image packs share the same schema)
  const files = fs.readdirSync(PACKS_DIR)
    .filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    throw new Error(`No pack files found in ${PACKS_DIR}`);
  }

  const packs = [];
  const skippedDrafts = [];
  const imagesBySpeciesId = new Map();
  let imagesLoaded = 0;

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

      // Index images from this pack (data.images is the unified images entry)
      if (data.data.images && Array.isArray(data.data.images)) {
        for (const imageEntry of data.data.images) {
          if (imageEntry.speciesId && imageEntry.url && imageEntry.author) {
            imagesBySpeciesId.set(imageEntry.speciesId, {
              url: imageEntry.url,
              author: imageEntry.author,
            });
            imagesLoaded++;
          }
        }
        console.log(`   ✓ Loaded: ${data.metadata.id} (${status}) — 🖼️  ${data.data.images.length} images`);
      } else {
        console.log(`   ✓ Loaded: ${data.metadata.id} (${status})`);
      }

      packs.push(data);
    } catch (err) {
      console.warn(`⚠️  Error loading ${file}:`, err instanceof Error ? err.message : String(err));
    }
  }

  if (imagesLoaded > 0) {
    console.log(`   📸 Total images indexed: ${imagesLoaded}`);
  }
  console.log('');

  const dataPacks = packs.filter(p =>
    p.data.species || p.data.taxonomic_groups || p.data.symbiosis || p.data.relations
  );

  if (dataPacks.length === 0) {
    throw new Error(`No valid data packs to merge`);
  }

  // Check for duplicate IDs across all packs
  const speciesIds = new Set();
  const groupIds = new Set();

  for (const pack of dataPacks) {
    const { data } = pack;

    if (data.species) {
      for (const spec of data.species) {
        if (speciesIds.has(spec.id)) {
          throw new Error(`Duplicate species ID: ${spec.id} (from pack ${pack.metadata.id})`);
        }
        speciesIds.add(spec.id);

        // Attach image data if available
        if (imagesBySpeciesId.has(spec.id)) {
          spec.image = imagesBySpeciesId.get(spec.id);
        }
      }
    }

    if (data.taxonomic_groups) {
      for (const group of data.taxonomic_groups) {
        if (groupIds.has(group.id)) {
          throw new Error(`Duplicate group ID: ${group.id} (from pack ${pack.metadata.id})`);
        }
        groupIds.add(group.id);
      }
    }
  }

  // Output: array of packs (preserving pack identity)
  // Remove redundant images array since images are already attached to species
  let packsForOutput = dataPacks.map(pack => ({
    metadata: pack.metadata,
    data: {
      species: pack.data.species,
      taxonomic_groups: pack.data.taxonomic_groups,
      symbiosis: pack.data.symbiosis,
      relations: pack.data.relations,
    },
  }));

  // Apply enum shorthand compression if --compact flag is set
  if (COMPACT_MODE && encodePack) {
    packsForOutput = packsForOutput.map(pack => encodePack(pack));
  }

  let output = {
    packs: packsForOutput,
  };

  // Write output
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Format output: use compact formatter if --compact, otherwise pretty-print
  const outputJson = COMPACT_MODE && compactJson
    ? compactJson(output)
    : JSON.stringify(output, null, 2);

  fs.writeFileSync(OUTPUT_PATH, outputJson);

  console.log('');
  console.log(`✓ Dataset built successfully with ${dataPacks.length} pack(s)`);

  let totalSpecies = 0;
  let totalGroups = 0;
  let totalSymbiosis = 0;
  let totalRelations = 0;
  let speciesWithImages = 0;

  for (const pack of dataPacks) {
    const { data } = pack;
    if (data.species) {
      totalSpecies += data.species.length;
      for (const spec of data.species) {
        if (spec.image) speciesWithImages++;
      }
    }
    if (data.taxonomic_groups) totalGroups += data.taxonomic_groups.length;
    if (data.symbiosis) totalSymbiosis += data.symbiosis.length;
    if (data.relations) totalRelations += data.relations.length;
  }

  console.log(`  ${totalSpecies} species`);
  console.log(`  ${totalGroups} taxonomic groups`);
  console.log(`  ${totalSymbiosis} symbiosis relationships`);
  console.log(`  ${totalRelations} general relations`);

  if (speciesWithImages > 0) {
    console.log(`  🖼️  ${speciesWithImages} species with Wikipedia images`);
  }

  if (skippedDrafts.length > 0) {
    console.log(`  ⊘ Skipped ${skippedDrafts.length} draft pack(s): ${skippedDrafts.join(', ')}`);
  }

  process.exit(0);
} catch (err) {
  console.error('');
  console.error(`❌ Error:`, err instanceof Error ? err.message : String(err));
  process.exit(1);
}
