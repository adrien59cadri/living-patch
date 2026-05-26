# LivingPatch Pack Tools

Tools for creating, validating, and managing LivingPatch data packs.

## Overview

A **data pack** is a self-contained JSON file containing:
- **Metadata**: ID, author, version, creation date, schema version, description
- **Data**: Species, taxonomic groups, symbiosis relationships, and general relations

Packs are modular and can be created independently, then merged together to build the app's dataset. This enables:
- Community contributions via pull requests
- Regional or thematic data isolation
- Version control and review workflows
- Incremental dataset expansion

## Pack Format

### File Structure

```json
{
  "metadata": {
    "id": "pack-identifier",
    "createdDate": "2026-05-26T00:00:00Z",
    "author": "Author Name",
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "description": "Brief description of pack contents"
  },
  "data": {
    "species": [],
    "taxonomic_groups": [],
    "symbiosis": [],
    "relations": []
  }
}
```

### Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique pack identifier (lowercase, hyphens/underscores ok). Used for version superseding. |
| `createdDate` | ISO 8601 | Yes | When the pack was created (e.g., `2026-05-26T12:30:00Z`) |
| `author` | string | Yes | Pack creator/maintainer |
| `version` | semver | Yes | Semantic version (e.g., `1.0.0`). Later versions with same `id` supersede earlier ones. |
| `schemaVersion` | semver | Yes | Schema version this pack targets (for future compatibility) |
| `description` | string | Yes | Human-readable description of pack contents |
| `status` | enum | No | Pack status: `"published"` (reviewed, always loaded) or `"draft"` (requires `--include-drafts` flag). Default: `"published"`. |

### Data Fields

All are optional arrays:

- **`species`**: Individual species + groups. Each entry follows the Species schema.
- **`taxonomic_groups`**: (Legacy) Taxonomic groups can also be defined here separately.
- **`symbiosis`**: Relationships between species (mutualism, parasitism, predation, etc.)
- **`relations`**: General relations between species

### Species Schema

Required fields:
- `id`: Unique identifier (format: `{category}_{slug}`, e.g., `bird_pileated-woodpecker`)
- `common_name`: Display name
- `form`: Category (bird, mammal, plant, tree, butterfly, etc.)
- `habitat`: Array of habitat types
- `diet`: Array of diet types
- `behavior`: Array of behaviors
- `season`: Array of activity seasons
- `functional_description`: Narrative description
- `life_stages`: Array of life stage objects or strings
- `region`: Geographic region (e.g., `northeast_pa`)

Optional fields:
- `latin_name`: Scientific name
- `ecological_role`: Role in ecosystem
- `is_keystone`: Boolean
- `keystone_type`: Type of keystone role
- `keystone_description`: Why it's keystone
- `active_months`: Months species is active
- `taxonomic_group`: ID of parent taxonomic group
- `is_group`: Boolean (mark taxonomic groups)
- `label`: Display label for groups
- `common_traits`: Shared traits of group members

### Symbiosis Schema

```json
{
  "type": "mutualism|parasitism|predation|competition|commensalism",
  "members": ["species_id_1", "species_id_2"],
  "impacted_species": "species_id_1",
  "obligate": true,
  "notes": "Description of the relationship"
}
```

### Relation Schema

```json
{
  "type": "string",
  "members": ["species_id_1", "species_id_2"],
  "notes": "Description of the relation"
}
```

## Validation Rules

Packs are validated for:

1. **Schema compliance**: All required fields present, correct types
2. **ID format**: Must match `category_slug` pattern (e.g., `bird_pileated-woodpecker`)
3. **Unique IDs within pack**: No duplicate species or group IDs
4. **Reference validity**: All symbiosis/relation members must exist (in this pack or base dataset)
5. **Version format**: Semantic versioning (e.g., `1.0.0`)
6. **Status field**: If present, must be either `"published"` or `"draft"`

## Pack Status: Published vs. Draft

Each pack has an optional `status` field:
- **`"published"`** (default): Reviewed and approved packs. Always loaded by the app.
- **`"draft"`**: Work-in-progress packs. Only loaded when explicitly requested.

### Using Draft Packs

Draft packs are useful for:
- Testing new species/relationships before review
- Collaborative work with pending review
- Development and iteration without affecting production data

To include draft packs:

```bash
# App loads packs with environment variable (future implementation)
INCLUDE_DRAFTS=true npm run dev

# Or CLI tools with flag
npm run merge packs/0-base.json packs/draft.json --include-drafts
npm run validate packs/draft.json  # Shows warning if draft status
```

Draft packs will be validated and tested the same way as published packs, but won't be included in the app's dataset unless explicitly enabled.

## CLI Tools

### Validate a Pack

```bash
npm run validate packs/my-pack.json
```

Output:
- ✓ Schema validation results
- ✓ ID uniqueness checks
- ✓ Reference validation
- ✓ Pack summary (species count, relationships, etc.)

### Preview Merge

```bash
npm run merge packs/base.json packs/custom-region.json
```

Output:
- ✓ Load validation for all packs
- ✓ Conflict detection
- ✓ Merged dataset statistics
- Optional `--strict` flag: fail on any conflicts

## Creating a Pack

### Step 1: Create JSON File

Create a new file in `packs/` directory:

```bash
touch packs/my-region.json
```

### Step 2: Add Metadata

```json
{
  "metadata": {
    "id": "my-region",
    "createdDate": "2026-05-26T00:00:00Z",
    "author": "Your Name",
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "description": "Additional species for my region"
  },
  "data": {
    "species": [],
    "symbiosis": [],
    "relations": []
  }
}
```

### Step 3: Add Species

Look at existing packs (like `packs/0-base.json`) for examples:

```json
{
  "id": "bird_my-species",
  "common_name": "My Bird",
  "latin_name": "Species scientificus",
  "form": "bird",
  "habitat": ["forest", "meadow"],
  "diet": ["insect_eater"],
  "behavior": ["nester", "migrant"],
  "season": ["spring", "summer", "fall"],
  "functional_description": "A beautiful bird that...",
  "life_stages": [],
  "region": "northeast_pa",
  "ecological_role": "carnivore",
  "is_keystone": false
}
```

### Step 4: Add Relationships

Link your species to existing ones:

```json
{
  "type": "mutualism",
  "members": ["bird_my-species", "plant_my-plant"],
  "notes": "This bird pollinates this plant"
}
```

### Step 5: Validate

```bash
npm run validate packs/my-region.json
```

### Step 6: Test Merge

```bash
npm run merge packs/0-base.json packs/my-region.json
```

## ID Format Guidelines

Species IDs follow the pattern: `{category}_{slug}`

Examples:
- **Birds**: `bird_pileated-woodpecker`, `bird_great-horned-owl`
- **Mammals**: `mammal_beaver`, `mammal_eastern-gray-squirrel`
- **Plants**: `plant_white-oak`, `plant_common-milkweed`
- **Insects**: `insect_monarch-butterfly`, `butterfly_spicebush-swallowtail`
- **Amphibians**: `amphibian_american-bullfrog`, `frog_spring-peeper`

## Common Mistakes

1. **Duplicate IDs**: Same species ID appears twice in a pack
   - **Fix**: Use unique IDs; rename or remove duplicates

2. **Orphaned references**: Symbiosis references species that doesn't exist
   - **Fix**: Add the referenced species to the pack or use its correct ID

3. **Wrong ID format**: `my-bird` instead of `bird_my-bird`
   - **Fix**: Include category prefix with underscore

4. **Invalid date format**: `2026-05-26` instead of ISO 8601
   - **Fix**: Use full datetime: `2026-05-26T00:00:00Z`

5. **Wrong semver**: `1.0` instead of `1.0.0`
   - **Fix**: Always use three-part versioning

## Integration with App

Packs are loaded at app startup:

1. Base dataset (`packs/0-base.json`) is loaded
2. All other packs in `packs/` directory are loaded
3. Conflicts are detected and reported (strict mode: fails entire load)
4. Merged dataset is built with proper indices
5. App components access unified dataset via `useDataset()` hook

## Versioning & Superseding

If you create a new version of a pack:
- Keep the same `metadata.id`
- Increment `metadata.version`
- New pack with higher version supersedes old one

Example:
- `id: "my-pack", version: "1.0.0"` → later superseded by
- `id: "my-pack", version: "1.1.0"`

## File Organization

```
pack-tools/
├── packs/                    # Pack files
│   ├── 0-base.json          # Core LivingPatch dataset
│   ├── example-custom.json  # Template/example pack
│   └── my-region.json       # User-contributed pack
├── schema/
│   └── pack-schema.json     # JSON Schema definition
├── lib/
│   ├── schema.ts            # Zod validation schemas
│   ├── conflicts.ts         # Conflict detection
│   ├── merge.ts             # Pack merging logic
│   └── index.ts             # Public API
├── cli/
│   ├── validate.ts          # Validation CLI
│   └── merge.ts             # Merge preview CLI
├── package.json
└── tsconfig.json
```

## Further Reading

- `schema/pack-schema.json` - Complete JSON Schema definition
- `app/src/types/index.ts` - App type definitions (source of truth for species/symbiosis format)
- `.instructions.md` - AI instructions for pack generation/review
