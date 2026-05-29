#!/usr/bin/env node

/**
 * Migration script: Convert data.images array to species.image properties
 * Usage: node migrate-images.mjs <pack-file>
 */

import fs from 'fs';
import path from 'path';

const packFile = process.argv[2];

if (!packFile) {
  console.error('❌ Error: No pack file specified');
  console.error(`Usage: node migrate-images.mjs <pack-file>`);
  process.exit(1);
}

try {
  const absolutePath = path.resolve(packFile);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${packFile}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf-8');
  const pack = JSON.parse(rawData);

  if (!pack.data || !pack.data.images) {
    console.log('⚠ No images to migrate');
    process.exit(0);
  }

  const imagesArray = pack.data.images;
  console.log(`🔄 Migrating ${imagesArray.length} images...`);
  console.log();

  // Create a map of speciesId -> image for quick lookup
  const imagesById = new Map();
  for (const img of imagesArray) {
    imagesById.set(img.speciesId, {
      url: img.url,
      author: img.author,
    });
  }

  // Migrate images to species objects
  let migratedCount = 0;
  let skippedCount = 0;

  const species = pack.data.species || [];
  for (const s of species) {
    if (imagesById.has(s.id)) {
      if (s.image) {
        console.log(`⊘ ${s.common_name} (${s.id}) - already has image, skipping`);
        skippedCount++;
      } else {
        s.image = imagesById.get(s.id);
        console.log(`✓ ${s.common_name} (${s.id})`);
        migratedCount++;
      }
    }
  }

  console.log();
  console.log('Summary:');
  console.log(`✓ Migrated: ${migratedCount} images`);
  if (skippedCount > 0) {
    console.log(`⊘ Skipped: ${skippedCount} (already had images)`);
  }

  // Remove the images array
  delete pack.data.images;

  // Write back
  fs.writeFileSync(absolutePath, JSON.stringify(pack, null, 2), 'utf-8');
  console.log();
  console.log('✓ Pack migrated and saved');
  console.log(`Path: ${path.relative(process.cwd(), absolutePath)}`);

} catch (error) {
  console.error('❌ Error:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
