#!/usr/bin/env node
/**
 * Migration: Convert Symbiosis entries from members/impacted_species/grp
 * to the new source/targets/fulfillment model.
 *
 * Direction rules:
 *   parasitism  → source = insect member (parasite), targets = [plant/group member (host)]
 *                 fallback: impacted_species as source when both members same category
 *   predation*  → source = predator (member ≠ impacted_species), targets = [impacted_species (prey)]
 *                 fallback: members[0] / [members[1]] when no impacted_species
 *   mutualism / commensalism / competition → source = members[0], targets = [members[1]]
 *
 * grp collapse:
 *   Groups with >1 entry sharing the same resolved source are collapsed into one
 *   multi-target entry with fulfillment: 'any'. All others just drop the grp field.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKS_DIR = path.join(__dirname, '..', 'packs');

/** Returns the first member whose ID starts with insect_ */
function getInsectMember(members) {
  return members.find(m => m.startsWith('insect_'));
}

/** Returns the first member whose ID does NOT start with insect_ */
function getNonInsectMember(members) {
  return members.find(m => !m.startsWith('insect_'));
}

/**
 * Determine source + targets for a single symbiosis entry.
 * Returns { source, targets } — does NOT include grp/members/impacted_species/fulfillment.
 */
function resolveDirection(entry) {
  const { type, members, impacted_species } = entry;
  const typeBase = type.split('-')[0]; // 'predation-seed_eating' → 'predation'

  if (typeBase === 'predation') {
    if (impacted_species && members.includes(impacted_species)) {
      const predator = members.find(m => m !== impacted_species);
      return { source: predator, targets: [impacted_species] };
    }
    return { source: members[0], targets: [members[1]] };
  }

  if (typeBase === 'parasitism') {
    const insect = getInsectMember(members);
    const nonInsect = getNonInsectMember(members);
    if (insect && nonInsect) {
      // Unambiguous: insect is parasite regardless of which impacted_species names
      return { source: insect, targets: [nonInsect] };
    }
    // Both members same category (e.g. insect-on-insect) — fall back to impacted_species
    if (impacted_species && members.includes(impacted_species)) {
      return {
        source: impacted_species,
        targets: [members.find(m => m !== impacted_species)],
      };
    }
    return { source: members[0], targets: [members[1]] };
  }

  // mutualism, commensalism, competition — bidirectional; source = authoring convention
  return { source: members[0], targets: [members[1]] };
}

/**
 * Convert a single symbiosis entry to the new model.
 * Drops members, impacted_species, grp, obligate (any unrecognised fields).
 */
function migrateEntry(entry) {
  const { source, targets } = resolveDirection(entry);
  const newEntry = { type: entry.type, source, targets };
  if (entry.strength !== undefined) newEntry.strength = entry.strength;
  newEntry.notes = entry.notes;
  return newEntry;
}

/**
 * Migrate all symbiosis entries in a pack, handling grp collapse.
 */
function migratePack(content) {
  const symbiosis = content.data?.symbiosis;
  if (!symbiosis || symbiosis.length === 0) return content;

  // ── Pre-pass: collect grp groups ──────────────────────────────────────────
  /** @type {Map<string, number[]>} grp slug → array of indices */
  const grpIndexMap = new Map();

  for (let i = 0; i < symbiosis.length; i++) {
    const grp = symbiosis[i].grp;
    if (grp) {
      const list = grpIndexMap.get(grp) ?? [];
      list.push(i);
      grpIndexMap.set(grp, list);
    }
  }

  /** Indices to omit (absorbed into a collapsed group entry at an earlier index) */
  const skipSet = new Set();
  /** index → replacement entry (collapsed group) */
  const replacementMap = new Map();

  for (const [slug, indices] of grpIndexMap) {
    if (indices.length <= 1) continue; // single-entry group: just drop grp, nothing to collapse

    const groupEntries = indices.map(i => symbiosis[i]);
    const converted = groupEntries.map(resolveDirection);
    const uniqueSources = new Set(converted.map(c => c.source));

    if (uniqueSources.size === 1) {
      // All entries share the same source → collapse into one multi-target entry
      const first = groupEntries[0];
      const allTargets = converted.map(c => c.targets[0]);
      const collapsed = {
        type: first.type,
        source: converted[0].source,
        targets: allTargets,
        fulfillment: 'any',
        ...(first.strength !== undefined ? { strength: first.strength } : {}),
        notes: first.notes,
      };
      replacementMap.set(indices[0], collapsed);
      for (let i = 1; i < indices.length; i++) {
        skipSet.add(indices[i]);
      }
    }
    // Different sources: fall through — each entry is migrated individually (grp dropped)
  }

  // ── Build new symbiosis array ──────────────────────────────────────────────
  const newSymbiosis = [];
  for (let i = 0; i < symbiosis.length; i++) {
    if (skipSet.has(i)) continue;
    if (replacementMap.has(i)) {
      newSymbiosis.push(replacementMap.get(i));
    } else {
      newSymbiosis.push(migrateEntry(symbiosis[i]));
    }
  }

  return { ...content, data: { ...content.data, symbiosis: newSymbiosis } };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const files = fs
  .readdirSync(PACKS_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('CHANGES'));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const filePath = path.join(PACKS_DIR, file);
  const original = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const before = original.data?.symbiosis?.length ?? 0;

  const migrated = migratePack(original);
  const after = migrated.data?.symbiosis?.length ?? 0;

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2) + '\n');

  const collapsed = before - after;
  const suffix = collapsed > 0 ? ` (${collapsed} collapsed into multi-target)` : '';
  console.log(`✓  ${file}: ${before} → ${after} entries${suffix}`);

  totalBefore += before;
  totalAfter += after;
}

const totalCollapsed = totalBefore - totalAfter;
console.log(
  `\nDone. ${totalBefore} entries → ${totalAfter} entries` +
    (totalCollapsed > 0 ? ` (${totalCollapsed} collapsed)` : '') +
    '.',
);
