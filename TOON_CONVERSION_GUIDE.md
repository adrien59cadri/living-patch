# TOON Format Conversion Guide: 0-base Pack

## Overview

This guide covers converting the **0-base pack** from JSON to TOON format.

**Status:** Other packs (1-france.toon, 2-florida.toon) are already in TOON format.

**Why TOON?**
- **26.3% smaller by bytes** (360KB → 285KB for 0-base pack)
- **37.1% fewer tokens** for Claude and other AI models (~102K → ~74K tokens)
- Maintains 100% data fidelity (verified round-trip conversion)

---

## Prerequisites

1. **Node.js** with `npm` installed
2. **@toon-format/cli** package (auto-installed via npx)
3. **@toon-format/toon** package (required for verification)

## Step-by-Step Conversion Process

### 1. Create a Feature Branch

```bash
git checkout -b toon
```

This isolates your conversion work on a separate branch.

### 2. Backup the Original JSON Pack

Create an `archive/` directory to store backups:

```bash
mkdir -p pack-tools/packs/archive
cp pack-tools/packs/0-base.json pack-tools/packs/archive/0-base.json
```

**Why archive?** 
- Preserves the original for reference and disaster recovery
- The build script automatically filters out the `archive/` directory (files don't match `.json` or `.toon` pattern at the root level)

### 3. Install TOON Dependencies

```bash
cd pack-tools
npm install @toon-format/toon
```

This installs the verification tool's dependency. The `@toon-format/cli` tool is installed on-demand via `npx`.

### 4. Convert JSON to TOON

Using the TOON CLI to encode (convert JSON → TOON):

```bash
cd pack-tools
npx @toon-format/cli --encode -o packs/0-base.toon packs/0-base.json
```

**Output:**
```
✔ Encoded packs/0-base.json → packs/0-base.toon                   11:13:32 AM
```

### 5. Verify the Conversion

Verify that the TOON file round-trips correctly back to JSON:

```bash
cd pack-tools
node scripts/verify-toon.js packs/0-base.toon packs/0-base.json
```

**Expected output:**
```
✓ metadata.id
✓ species count
✓ first species id
✓ last species id
✓ latin_name type
✓ habitat is array

PASS: 142 species verified (0-base)
```

All 142 species in the pack should verify with a `PASS` status. If any checks fail, the conversion has a problem and you should investigate.

### 6. Update Project Memory

Update relevant documentation files to reflect the conversion:

**In `/memories/repo/livingpatch-codebase-architecture.md`:**
- Add note that 0-base pack is now TOON format (like france and florida)
- Update pack file list to reflect: `0-base.toon`, `1-france.toon`, `2-florida.toon`

**In `CLAUDE.md`:**
- Add to **Recent Changes** section (at top of list)
- Example entry:
  ```markdown
  ### TOON Format Conversion: 0-base Pack (June 9, 2026 — latest)
  - **Branch:** `toon`
  - **Status:** ✓ Complete
  - **Changes:**
    - Converted 0-base.json → 0-base.toon (26.3% smaller, 37.1% fewer tokens)
    - Backed up original to pack-tools/packs/archive/0-base.json
    - Verified all 142 species round-trip correctly
    - Installed @toon-format/toon dependency
  ```

### 7. Commit and Push

```bash
git add pack-tools/packs/0-base.toon pack-tools/packs/archive/ CLAUDE.md
git commit -m "feat(data): convert 0-base pack to toon format"
git push -u origin toon
```

---

## Understanding the TOON Format

### File Structure Example (0-base)

A TOON file is human-readable:

```
metadata:
  id: 0-base
  author: Living Patch
  version: 1.0.0
  schemaVersion: 1.0.0
  description: "Northeast Pennsylvania species (142 total)..."
  createdDate: "2026-06-01T00:00:00Z"
  status: published
data:
  species[142]:
    - id: bird_pileated-woodpecker
      common_name:
        en: Pileated Woodpecker
      latin_name: Dryocopus pileatus
      form: woodpecker
      habitat[4]: forest,woodland,cliff,snag
      diet[2]: wood-boring-insect,ant
      behavior[2]: excavator,climber
      season[1]: year_round
      # ... more fields
```

### Key TOON Syntax

- **Array counts**: `habitat[4]` = 4 items following
- **Inline arrays**: `habitat: forest,woodland,cliff,snag` (comma-delimited)
- **Nested objects**: Indented YAML-style
- **No quotes** around most values (unlike JSON)
- **Compact key-value pairs** with `:` separator

---

## CLI Commands Reference

### Convert JSON → TOON

```bash
npx @toon-format/cli --encode -o output.toon input.json
```

**Options:**
- `--encode` — Force JSON→TOON conversion (auto-detected by default)
- `-o, --output=<path>` — Output file path
- `--delimiter=<comma|tab|pipe>` — Array delimiter (default: comma)
- `--indent=<size>` — Indentation spaces (default: 2)
- `--stats` — Show token statistics

### Convert TOON → JSON

```bash
npx @toon-format/cli --decode -o output.json input.toon
```

### Verify Round-Trip

```bash
node pack-tools/scripts/verify-toon.js packs/0-base.toon packs/0-base.json
```

The verification script checks:
1. Metadata ID matches
2. Species count matches
3. First and last species IDs match
4. Data types are preserved (e.g., `latin_name` is string, `habitat` is array)

---

## Size Comparison: 0-base Pack (142 species)

| Metric | JSON | TOON | Savings |
|--------|------|------|---------|
| **Bytes** | 360,013 | 285,362 | 26.3% smaller |
| **Lines** | 8,620 | 4,329 | 49.8% fewer lines |
| **Tokens** (estimated) | ~102,553 | ~74,812 | 37.1% fewer tokens |
| **Ratio** | — | **1.26×** smaller | — |

**Token estimation:** Based on Claude's typical tokenization (~3.5 chars/token for JSON, ~3.8 for TOON). Actual values depend on the specific tokenizer, but the ~37% reduction is a conservative estimate.

---

## Troubleshooting

### "Cannot find package '@toon-format/toon'"

**Solution:** Install the package in `pack-tools/`:
```bash
cd pack-tools
npm install @toon-format/toon
```

### Verification fails with mismatches

**Potential causes:**
1. Incomplete conversion (some fields truncated)
2. Schema version mismatch
3. Invalid nested structure

**Solution:** 
- Re-run the conversion with `--verbose` flag:
  ```bash
  npx @toon-format/cli --encode --verbose packs/0-base.json -o packs/0-base.toon
  ```
- Check the error output and ensure the original JSON is valid

### TOON file is larger than JSON

**This should not happen.** If it does:
1. Verify the original JSON is properly minified (no extra whitespace)
2. Check file encoding (should be UTF-8)
3. Try re-encoding with explicit options:
   ```bash
   npx @toon-format/cli --encode --delimiter=comma --indent=2 packs/0-base.json -o packs/0-base.toon
   ```

---

## Updating When 0-base Dataset Changes

When the 0-base source dataset changes (e.g., new species added, fields modified):

1. Remove the old TOON file:
   ```bash
   rm pack-tools/packs/0-base.toon
   ```

2. Convert the updated JSON:
   ```bash
   npx @toon-format/cli --encode -o pack-tools/packs/0-base.toon pack-tools/packs/0-base.json
   ```

3. Verify:
   ```bash
   node pack-tools/scripts/verify-toon.js pack-tools/packs/0-base.toon pack-tools/packs/0-base.json
   ```

4. Backup the updated JSON (optional):
   ```bash
   cp pack-tools/packs/0-base.json pack-tools/packs/archive/0-base.json.backup-$(date +%s)
   ```

Use the `--stats` flag to see compression ratio:
```bash
npx @toon-format/cli --encode packs/0-base.json -o packs/0-base.toon --stats
```

---

## Build Integration

The LivingPatch build system automatically handles both `.json` and `.toon` packs (including 0-base):

```bash
npm run build
```

**What happens:**
1. `build-dataset.js` reads `pack-tools/packs/`
2. Filters files: only `.json` and `.toon` files (ignores `archive/` subdirectory)
3. Decodes `.toon` files (0-base, france, florida) using `@toon-format/toon`
4. Processes metadata, merges species, generates manifest
5. Outputs `app/public/packs/{id}.json` and `app/public/packs/manifest.json`

The final build output is always JSON (for browser compatibility), but TOON input is decoded transparently.

---

## Notes

- **TOON files are smaller and faster to parse** but require the `@toon-format/toon` decoder
- **Archive folder is automatically excluded** from build scans (doesn't end in `.json` or `.toon`)
- **0-base pack stores 142 species** — verify all round-trip correctly after conversion
- **Both formats store identical data** — no loss or transformation during conversion
- **Other packs (france, florida) already in TOON format** — this guide is 0-base specific

---

## Quick Reference: Full Workflow

```bash
# 1. Create branch
git checkout -b toon

# 2. Backup original
mkdir -p pack-tools/packs/archive
cp pack-tools/packs/0-base.json pack-tools/packs/archive/0-base.json

# 3. Install dependencies
cd pack-tools && npm install @toon-format/toon && cd ..

# 4. Convert
cd pack-tools
npx @toon-format/cli --encode -o packs/0-base.toon packs/0-base.json

# 5. Verify
node scripts/verify-toon.js packs/0-base.toon packs/0-base.json

# 6. Update memory (CLAUDE.md, repo memory, etc.)
# - Add Recent Changes entry
# - Update pack file references

# 7. Commit
git add packs/0-base.toon packs/archive/ CLAUDE.md
git commit -m "feat(data): convert 0-base pack to toon format"
git push -u origin toon
```
