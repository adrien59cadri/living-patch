#!/usr/bin/env node

/**
 * Build script: Process data packs and emit per-pack JSON files + manifest
 *
 * This script:
 * 1. Loads all published packs from pack-tools/packs/
 * 2. Optionally includes draft packs if INCLUDE_DRAFTS=true
 * 3. Validates, attaches images, checks for duplicate IDs
 * 4. Writes app/public/packs/{id}.json for each pack
 * 5. Writes app/public/packs/manifest.json (metadata + counts, no species data)
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
import { decode } from '@toon-format/toon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKS_DIR = path.join(__dirname, 'pack-tools', 'packs');
const OUTPUT_DIR = path.join(__dirname, 'app', 'public', 'packs');
const INCLUDE_DRAFTS = process.env.INCLUDE_DRAFTS === 'true';

console.log(`🔄 Building dataset from packs...`);
console.log(`   Packs dir: ${PACKS_DIR}`);
console.log(`   Output dir: ${OUTPUT_DIR}`);
console.log(`   Include drafts: ${INCLUDE_DRAFTS ? 'YES' : 'NO'}`)
console.log('');

try {
  if (!fs.existsSync(PACKS_DIR)) {
    throw new Error(`Packs directory not found: ${PACKS_DIR}`);
  }

  // Load all packs (unified format: data packs and image packs share the same schema)
  const files = fs.readdirSync(PACKS_DIR)
    .filter(f => f.endsWith('.json') || f.endsWith('.toon'));

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
      const data = file.endsWith('.toon') ? decode(rawData) : JSON.parse(rawData);
      data._sourceFormat = file.endsWith('.toon') ? 'toon' : 'json';

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

  // Build clean pack objects (strip image pack entries, keep images attached to species)
  const packsForOutput = dataPacks.map(pack => ({
    metadata: pack.metadata,
    _sourceFormat: pack._sourceFormat ?? 'json',
    data: {
      species: pack.data.species,
      taxonomic_groups: pack.data.taxonomic_groups,
      symbiosis: pack.data.symbiosis,
      relations: pack.data.relations,
    },
  }));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write individual pack files
  for (const pack of packsForOutput) {
    const packPath = path.join(OUTPUT_DIR, `${pack.metadata.id}.json`);
    fs.writeFileSync(packPath, JSON.stringify(pack, null, 2));
  }

  // Write manifest (metadata + counts only, no species data)
  const manifest = packsForOutput.map(pack => ({
    ...pack.metadata,
    format: pack._sourceFormat ?? 'json',
    speciesCount: pack.data.species?.length ?? 0,
    groupCount: pack.data.taxonomic_groups?.length ?? 0,
    symbiosisCount: pack.data.symbiosis?.length ?? 0,
    relationsCount: pack.data.relations?.length ?? 0,
  }));
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('');
  console.log(`✓ Dataset built successfully with ${dataPacks.length} pack(s)`);
  console.log(`   → ${OUTPUT_DIR}/manifest.json`);
  for (const pack of packsForOutput) {
    console.log(`   → ${OUTPUT_DIR}/${pack.metadata.id}.json`);
  }

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
