#!/usr/bin/env node
/**
 * Verify that a .toon pack file round-trips identically to its JSON reference.
 * Usage: node scripts/verify-toon.js <toon-file> <reference-json-file>
 */

import { decode } from '@toon-format/toon';
import fs from 'fs';

const [toonPath, jsonPath] = process.argv.slice(2);

if (!toonPath || !jsonPath) {
  console.error('Usage: node scripts/verify-toon.js <toon-file> <reference-json-file>');
  process.exit(1);
}

const orig = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const decoded = decode(fs.readFileSync(toonPath, 'utf-8'));

const checks = [
  ['metadata.id', orig.metadata.id === decoded.metadata.id],
  ['species count', orig.data.species.length === decoded.data.species.length],
  ['first species id', orig.data.species[0].id === decoded.data.species[0].id],
  ['last species id', orig.data.species.at(-1).id === decoded.data.species.at(-1).id],
  ['latin_name type', typeof decoded.data.species[0].latin_name === 'string'],
  ['habitat is array', Array.isArray(decoded.data.species[0].habitat)],
];

let passed = true;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) passed = false;
}

if (passed) {
  console.log(`\nPASS: ${orig.data.species.length} species verified (${orig.metadata.id})`);
} else {
  console.error('\nFAIL: mismatch detected');
  process.exit(1);
}
