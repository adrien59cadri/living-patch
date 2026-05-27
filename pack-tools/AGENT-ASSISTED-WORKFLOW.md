# Agent-Assisted Pack Generation & Correction Workflow

This document explains how to use Claude Code or Copilot as an intelligent assistant to generate and correct LivingPatch data packs.

## Quick Start

1. **Open Claude Code**: `claude dev` (CLI) or `claude.ai/code` (web)
2. **Read the schema guide**: `pack-tools/PACK-CONTEXT.md` 
3. **Ask Claude to generate a pack** with your input (CSV, notes, free-form description)
4. **Validate the output**: `npm run pack:validate packs/your-pack.json`
5. **Review and merge**: Use `npm run pack:merge` to test integration

## What Can Claude Generate?

### ✅ New Species Entries
- From descriptions: "Carolina Wren is a small cavity-nesting songbird..."
- From CSV: Import species list and convert to pack format
- With relationships: "Add Great Blue Heron and its predator role"

### ✅ Symbiosis Relationships
- Mutualism: pollinator ↔ flower
- Parasitism: insect caterpillar → host plant
- Predation: predator hunts prey
- Competition: species competing for resource
- Commensalism: one benefits, one unaffected

### ✅ Complete Packs
- New region packs: "Create a pack for Pacific Northwest species"
- Thematic packs: "Create a pack for native plants of PA"
- Specialized packs: "Create a pack for vernal pool species"

### ✅ Corrections
- Fix broken references in existing packs
- Add missing species IDs
- Correct relationship types
- Fill in incomplete fields

## Key Rules Claude Must Follow

### 1. Species ID Format: `category_slug`
- All lowercase
- Category (bird, plant, insect) + underscore + slug
- Slug uses hyphens for words
- ✅ `bird_pileated-woodpecker`
- ❌ `Pileated_Woodpecker`, `bird piliated woodpecker`

### 2. Required Fields for Species
```json
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "functional_description": "2-4 sentences about ecology and appearance",
  "life_stages": []  // can be empty, but must exist
}
```

### 3. Symbiosis Must Have Valid Members
- All species IDs in `members[]` must exist
- At least 2 members required
- Type must be one of: mutualism, parasitism, predation, competition, commensalism
- `notes` must explain the relationship

### 4. Obligate Relationships
- `obligate: true` means one species cannot survive without the other
- Host-plant relationships (monarch → milkweed) are obligate
- Use for specialist parasites, obligate mutualisms
- Use `false` or omit for facultative relationships

## Workflow Examples

### Example: Generate Species from Notes
```
You: "Using PACK-CONTEXT.md, generate a species entry for 
Eastern Tiger Swallowtail butterfly. Caterpillars eat Black Cherry 
and oaks. Adults emerge May-August, fly in woodlands. Is it keystone?"

Claude: [Generates valid Species JSON]

You: "Verify this meets PACK-CONTEXT.md rules:
✓ ID format matches category_slug?
✓ All required fields present?
✓ Latin name correct?
✓ Symbiosis with host plants included?"

Claude: [Validates and refines if needed]
```

### Example: Convert CSV to Pack
```
You: "Convert this CSV to a LivingPatch pack:
[paste CSV with species data]

Use PACK-CONTEXT.md for ID format and field rules.
Generate complete pack JSON with metadata."

Claude: [Generates full pack.json with metadata + species array]

You: Run locally:
$ npm run pack:validate packs/new-pack.json
```

### Example: Add Symbiosis from Descriptions
```
You: "These species exist in the dataset:
- insect_monarch-butterfly (Monarch Butterfly)
- plant_common-milkweed (Common Milkweed)
- plant_butterfly-weed (Butterfly Weed)

Generate 2 symbiosis entries:
1. Monarch obligate on milkweed (parasitism)
2. Native bumble bees pollinate milkweed (mutualism)

Reference PACK-CONTEXT.md for structure."

Claude: [Generates valid symbiosis array]
```

### Example: Fix Broken Pack
```
You: "This pack has validation errors:
[paste broken pack + error messages]

Fix these issues using PACK-CONTEXT.md rules:
- Broken species ID references
- Missing obligate flags
- Invalid relationship types
Return corrected pack."

Claude: [Analyzes, fixes, reports changes]

You: Validate fix:
$ npm run pack:validate packs/corrected-pack.json
```

## Using Pack Context Guide

When asking Claude to generate/correct packs, always mention:
```
"Reference pack-tools/PACK-CONTEXT.md for:
- ID format rules (category_slug pattern)
- Required vs optional fields
- Symbiosis type definitions
- Validation rules and examples
- Common mistakes to avoid"
```

This ensures Claude has the exact rules it needs.

## After Claude Generates

### Step 1: Save the JSON
```bash
# Claude outputs JSON → save to packs/your-pack.json
```

### Step 2: Validate Locally
```bash
npm run pack:validate packs/your-pack.json
```

Expected success output:
```
✓ Pack is valid
```

Expected error output:
```
✗ Validation failed:
  - Species ID 'bird_wrong_id' does not match pattern
  - Symbiosis references unknown species 'xyz'
```

### Step 3: Fix Errors
If validation fails, copy errors back to Claude:
```
"Fix these validation errors:
- Species ID 'bird_wrong_id' does not match pattern category_slug
- Symbiosis references unknown species 'xyz'"
```

### Step 4: Test Merge
```bash
npm run pack:merge packs/0-base.json packs/your-pack.json
```

This shows:
- How new pack integrates with base data
- Any conflicts detected
- Final merged dataset structure

### Step 5: Review Content
- Read species descriptions for accuracy
- Check symbiosis relationships are ecologically sound
- Verify keystone species explanations

### Step 6: Use the Pack
Once validated:
```bash
# Add to build pipeline by editing build-dataset.js
# Or test by running:
npm run build
```

## Tips for Claude Success

### 1. Be Specific About Relationships
**Good**: "Add obligate parasitism: Monarch caterpillar on Common Milkweed"
**Vague**: "Add a relationship between butterfly and plant"

### 2. Provide Field Values You Know
**Good**: "Pileated Woodpecker: form=woodpecker, keystone=true, keystone_type=ecosystem_engineer"
**Vague**: "Add a woodpecker species"

### 3. Reference Existing Examples
**Good**: "Format like the Monarch entry in 0-base.json"
**Vague**: "Make it realistic"

### 4. Ask for Validation Steps
**Good**: "Then verify: (1) ID format ✓ (2) all members exist ✓ (3) ecology accurate ✓"
**Vague**: "Make sure it's correct"

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Species ID does not match pattern" | Wrong ID format (uppercase, spaces, etc.) | Ask Claude: "Fix ID to match category_slug format" |
| "Symbiosis references unknown species" | Member ID doesn't exist | Verify species was created, fix ID spelling |
| "Missing required field" | Species missing common_name or functional_description | Ask Claude: "Add missing fields: common_name, functional_description" |
| "Invalid symbiosis type" | Type not in list (mutualism, parasitism, etc.) | Check PACK-CONTEXT.md types, fix in Claude |
| "Duplicate IDs" | Two species with same ID | Rename or remove one |

## Validation Rules Checklist

When Claude generates, verify:

- [ ] **ID format**: `category_slug` (all lowercase)
- [ ] **Required fields**: `id`, `common_name`, `functional_description`, `life_stages`
- [ ] **No duplicates**: Each ID unique within pack
- [ ] **Symbiosis members**: All IDs exist in species array
- [ ] **Symbiosis type**: Valid (mutualism, parasitism, predation, competition, commensalism)
- [ ] **Obligate flag**: Correctly marks required relationships
- [ ] **Dates**: ISO 8601 format (e.g., 2026-05-27T14:30:00Z)
- [ ] **Versions**: Semantic versioning (1.0.0)
- [ ] **Description**: Non-empty, explains pack contents

## Advanced: Multi-Step Generation

For complex packs, break into steps:

**Step 1: Generate species array**
```
"Generate species entries for: [list]. 
Return only species array in JSON format."
```

**Step 2: Add symbiosis**
```
"Given these species, generate symbiosis entries for:
[list relationships]
Return only symbiosis array."
```

**Step 3: Assemble full pack**
```
"Create complete pack JSON with:
- Metadata: [id, author, etc.]
- Species: [from step 1]
- Symbiosis: [from step 2]"
```

This gives you more control and easier debugging.

## Next Steps

1. **For generation**: Open Claude Code → paste your input → reference PACK-CONTEXT.md
2. **For corrections**: Paste broken pack → list issues → ask Claude to fix
3. **For validation**: Run `npm run pack:validate` locally to verify output
4. **For testing**: Use `npm run pack:merge` to see how pack integrates
5. **For review**: Read species descriptions and validate ecology is accurate

---

**Questions?**
- Pack format: See `PACK-CONTEXT.md`
- Examples: Check `packs/0-base.json`
- Validation: Run `npm run pack:validate packs/your-pack.json`
- Merge testing: Run `npm run pack:merge packs/0-base.json packs/new.json`

*Last updated: 2026-05-27*
