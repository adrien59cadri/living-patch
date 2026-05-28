# Pack Schema Reference (Minimal)

Quick reference for generating LivingPatch packs. Use with chunking: process 5-10 species per Claude prompt.

## Pack Structure
```json
{
  "metadata": {
    "id": "my-pack",
    "createdDate": "2026-05-27T14:30:00Z",
    "author": "You",
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "description": "What's in this pack",
    "status": "draft"
  },
  "data": {
    "species": [],
    "symbiosis": []
  }
}
```

## Species: Required Fields
```json
{
  "id": "category_slug",
  "common_name": "Display Name",
  "functional_description": "2-4 sentences about ecology.",
  "life_stages": []
}
```

ID format: `category_slug` (all lowercase, underscore separates category from hyphenated slug). Examples: `bird_pileated-woodpecker`, `plant_common-milkweed`, `insect_monarch-butterfly`.

## Species: Common Optional Fields
- `latin_name`: Scientific name
- `form`: bird, mammal, plant, tree, wildflower, insect, butterfly
- `habitat`: forest, woodland, field, meadow, garden, wetland, riparian
- `diet`: insect_eater, predator, nectar_feeder, fruit_eater, seed_eater
- `behavior`: cavity_nester, nocturnal, migratory, territorial, nectar_source
- `season`: year_round, spring, summer, fall
- `region`: northeast_pa
- `ecological_role`: producer, herbivore, carnivore
- `is_keystone`: true/false + `keystone_type` and `keystone_description`
- `image`: { url, author }

## Symbiosis (Relationships)
```json
{
  "type": "mutualism|parasitism|predation|competition|commensalism",
  "members": ["species_id_1", "species_id_2"],
  "obligate": true/false,
  "notes": "Explanation of relationship"
}
```

- **mutualism**: Both benefit (pollinator ↔ flower)
- **parasitism**: One benefits, one harmed (caterpillar eats plant)
- **predation**: One eats the other
- **competition**: Both compete for same resource
- **commensalism**: One benefits, one unaffected

`obligate: true` = relationship required for survival (e.g., monarch obligate on milkweed).

## Top 5 Validation Rules
1. Species IDs must match `category_slug` (lowercase, hyphens in slug)
2. All symbiosis member IDs must exist in species array
3. No duplicate species IDs
4. All species must have: id, common_name, functional_description, life_stages
5. Symbiosis must have: type, members (2+), notes

## Common Mistakes & Fixes
| Problem | Fix |
|---------|-----|
| ID: `bird_Wrong` | Use `bird_correct` (lowercase) |
| ID: `bird piliated woodpecker` | Use `bird_pileated-woodpecker` (hyphens in slug) |
| Symbiosis refs unknown species | Verify species exists in array |
| Missing `life_stages` | Add empty array `[]` |
| Obligate mismatch | Host plants, obligate parasites should be `true` |

## Chunking & Batch Processing

**Why**: Large JSON files exceed Claude's token budget. Solution: Process in batches.

**Best practices**:
1. Generate 5-10 species per Claude prompt (not 50+)
2. For large CSV, ask Claude to do batch processing: "Process rows 1-10, then I'll ask for rows 11-20"
3. Don't paste entire `0-base.json`; paste only the relevant section
4. Reference this file by name, don't paste it into every prompt
5. Combine results locally using `npm run pack:merge`

**Example prompt**:
> "Generate pack JSON for these 5 species (use PACK-CONTEXT.md for rules): [species list]. Output only the species array."

## Worked Examples

**Species**:
```json
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "latin_name": "Thryothorus ludovicianus",
  "form": "songbird",
  "habitat": ["forest_edge", "garden"],
  "diet": ["insect_eater"],
  "behavior": ["cavity_nester"],
  "season": ["year_round"],
  "functional_description": "Small reddish wren with loud song. Uses cavities for nesting. Year-round PA resident.",
  "life_stages": [],
  "region": "northeast_pa",
  "ecological_role": "carnivore",
  "is_keystone": false
}
```

**Symbiosis**:
```json
{
  "type": "parasitism",
  "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
  "obligate": true,
  "notes": "Monarch caterpillar obligate on milkweed (genus Asclepias). Cannot breed without it."
}
```

## Testing Your Pack
```bash
npm run pack:validate packs/your-pack.json
npm run pack:merge packs/0-base.json packs/your-pack.json
```

---
*See also: `.instructions.md` for workflows, `types.ts` for full schema definitions, `0-base.json` for complete examples.*
