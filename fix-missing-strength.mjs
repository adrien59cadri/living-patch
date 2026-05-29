#!/usr/bin/env node

/**
 * Fix missing strength fields in symbiosis entries
 */

import fs from 'fs';
import path from 'path';

const packFile = process.argv[2] || 'packs/0-base.json';

try {
  const absolutePath = path.resolve(packFile);
  const rawData = fs.readFileSync(absolutePath, 'utf-8');
  const pack = JSON.parse(rawData);

  if (!pack.data.symbiosis) {
    console.log('No symbiosis data found');
    process.exit(0);
  }

  let fixedCount = 0;

  // Fix missing strength fields
  for (const symbiosis of pack.data.symbiosis) {
    if (!symbiosis.strength) {
      // Assign strength based on relationship type and notes
      const type = symbiosis.type;
      const notes = (symbiosis.notes || '').toLowerCase();

      // Determine strength based on type and keywords in notes
      let strength = 'important'; // default

      if (type === 'mutualism') {
        if (notes.includes('pollinator') || notes.includes('pollination') || 
            notes.includes('primary') || notes.includes('critical')) {
          strength = 'critical';
        }
      } else if (type === 'parasitism' || type === 'predation') {
        if (notes.includes('obligate') || notes.includes('critical')) {
          strength = 'critical';
        } else if (notes.includes('facultative')) {
          strength = 'incidental';
        }
      } else if (type === 'commensalism' || type === 'competition') {
        strength = 'incidental';
      }

      symbiosis.strength = strength;
      fixedCount++;
      console.log(`Fixed: ${symbiosis.members.join(' ↔ ')} → ${strength}`);
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(absolutePath, JSON.stringify(pack, null, 2), 'utf-8');
    console.log();
    console.log(`✓ Fixed ${fixedCount} missing strength fields`);
  } else {
    console.log('No missing strength fields found');
  }

} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
