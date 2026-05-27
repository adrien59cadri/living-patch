# Pack Schema & Generation Guide

Use this document when generating or correcting ecological data packs in Claude Code or Copilot.

## Pack Structure Overview

A pack is a JSON file containing metadata and ecological data. All packs follow this structure:

```json
{
  "metadata": { /* required */ },
  "data": { /* optional, can be empty */ }
}
```

---

## Metadata (Required)

All metadata fields are required:

```json
{
  "id": "pack-name",                    // unique identifier
  "createdDate": "2026-05-27T...",      // ISO 8601 datetime (use current time)
  "author": "Your Name",                // pack creator
  "version": "1.0.0",                   // semantic versioning
  "schemaVersion": "1.0.0",             // target schema version
  "description": "Brief description",   // what this pack contains
  "status": "draft"                     // "draft" or "published"
}
```

### Field Rules

- **id**: lowercase, alphanumeric + hyphens/underscores only. Examples: `0-base`, `example-new-species`, `my-additions`
- **createdDate**: ISO 8601 format. Examples: `2026-05-27T14:30:00Z`, `2026-05-27T14:30:00.123Z`
- **author**: Any string (person or organization name)
- **version** & **schemaVersion**: Must match `N.N.N` (semantic versioning). Always `1.0.0` unless you know what you're doing.
- **description**: 1-2 sentences describing pack contents
- **status**: 
  - `"draft"`: Work-in-progress. Requires `--include-drafts` flag to load. Use for experimental data.
  - `"published"`: Reviewed and stable. Always loaded by default.

---

## Species Data

Species represent individual organisms and taxonomic groups. The `species` array is the most common data section.

### Species ID Format

**CRITICAL**: Species IDs must match pattern: `category_slug`

- All lowercase
- Underscore separates category from slug
- Slug uses hyphens for word separation
- Examples: `bird_pileated-woodpecker`, `plant_common-milkweed`, `insect_monarch-butterfly`

### Minimal Species (Required Fields Only)

```json
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "form": "songbird",
  "region": "northeast_pa",
  "functional_description": "Brief 1-2 sentence description.",
  "life_stages": []
}
```

### Full Species (With Optional Enrichment)

```json
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "latin_name": "Thryothorus ludovicianus",
  "form": "songbird",
  "habitat": ["forest_edge", "garden", "woodland"],
  "diet": ["insect_eater"],
  "behavior": ["cavity_nester", "territorial"],
  "season": ["year_round"],
  "functional_description": "Small reddish-brown wren with loud 'teakettle-teakettle-teakettle' song. Uses cavities and nest boxes. Year-round resident in PA.",
  "life_stages": [],
  "region": "northeast_pa",
  "ecological_role": "carnivore",
  "is_keystone": false,
  "keystone_type": null,
  "keystone_description": null,
  "taxonomic_group": "group_songbirds",
  "image": {
    "url": "https://commons.wikimedia.org/wiki/...",
    "author": "Your Name"
  }
}
```

### Field Descriptions

| Field | Type | Required? | Notes |
|-------|------|-----------|-------|
| **id** | string | ✅ Yes | Must match `category_slug` pattern. Unique within all packs. |
| **common_name** | string | Recommended | English common name. Use title case. |
| **latin_name** | string \| null | Optional | Scientific name (genus species). Italicize if possible; use `Genus species`. Null if unknown. |
| **form** | string | Recommended | Organism category: `bird`, `mammal`, `tree`, `wildflower`, `shrub`, `butterfly`, `insect`, `raptor`, `owl`, `songbird`, `woodpecker`, etc. |
| **habitat** | string[] | Optional | Array of habitat types where species is found. Common values: `forest`, `woodland`, `field`, `meadow`, `garden`, `wetland`, `riparian`, `forest_edge`, `woodland_edge`, `field_edge`, `dry_meadow`, `wet_meadow`, `rocky_slope`, `roadside`. |
| **diet** | string[] | Optional | Food sources: `insect_eater`, `nectar_feeder`, `predator`, `fruit_eater`, `seed_eater`, `pollen_eater`, `leaf_eater`, `bark_eater`, etc. |
| **behavior** | string[] | Optional | Behavioral traits: `cavity_nester`, `nocturnal`, `diurnal`, `migratory`, `long_distance_migrant`, `perch_hunter`, `soaring`, `aposematic`, `territorial`, `solitary`, `social`, `gall_host`, `nectar_source`, `fruit_producer`, `mast_host`, `toxin_producer`, `fall_bloomer`, `spring_bloomer`, `early_bloomer`, etc. |
| **season** | string[] | Optional | Active seasons: `year_round`, `spring`, `summer`, `fall`, `fall_migrant`, `winter`, `late_summer`. |
| **functional_description** | string | ✅ Yes | 2-4 sentences explaining: what it looks like, where it lives, what it eats, and why it matters ecologically. This is the narrative that appears in the app. |
| **life_stages** | LifeStage[] \| string[] | ✅ Yes (can be empty) | Array of life stage objects or simple strings. See next section. |
| **region** | string | Recommended | Geographic region: `northeast_pa` (Northeast Pennsylvania). |
| **ecological_role** | string \| null | Optional | High-level role: `producer` (plant), `herbivore`, `carnivore`, `omnivore`, `detritivore`. Null if not applicable. |
| **is_keystone** | boolean | Optional | `true` if this species plays a disproportionately important ecological role. Default: `false`. |
| **keystone_type** | string \| null | Optional | Type of keystone (if `is_keystone: true`): `ecosystem_engineer`, `predator`, `host_plant`, `mutualist`, `structural`, `prey`. Null if not keystone. |
| **keystone_description** | string \| null | Optional | 1-2 sentences explaining why this species is keystone. Null if not keystone. |
| **active_months** | string[] \| null | Optional | Array of active months in "Mon-Mon" format: `["Apr-May", "Sep-Oct"]`. Use if species is seasonal. Null if year-round. |
| **taxonomic_group** | string \| null | Optional | ID of taxonomic group this species belongs to. Example: `group_woodpeckers`, `group_milkweeds`. Null if not grouped. |
| **image** | {url, author} | Optional | Wikimedia Commons image. Must have `url` (full URL) and `author` (photographer name). |

### Life Stages Format

**Simple list** (when you don't have detailed info):
```json
"life_stages": ["seedling", "mature", "flowering", "fruiting"]
```

**Detailed objects** (for rich descriptions with icons and months):
```json
"life_stages": [
  {
    "icon": "🥚",
    "name": "Egg",
    "description": "Tiny cream egg on underside of milkweed leaf",
    "months": ["Jun-Aug"]
  },
  {
    "icon": "🐛",
    "name": "Caterpillar",
    "description": "Yellow, black, and white striped; feeds only on milkweed",
    "months": ["Jun-Sep"]
  }
]
```

Common life stage icons: 🥚 (egg), 🐛 (larva/caterpillar), 🫘 (chrysalis/pupa), 🦋 (adult), 🌱 (seedling), 🌿 (vegetative), 🌸 (flowering), 🫐 (fruiting)

---

## Symbiosis Data

Symbiosis entries describe ecological relationships between species.

### Symbiosis Entry Structure

```json
{
  "type": "mutualism",
  "members": ["species_id_1", "species_id_2"],
  "impacted_species": "species_id_1",
  "obligate": true,
  "notes": "Description of the relationship."
}
```

### Field Descriptions

| Field | Type | Required? | Notes |
|-------|------|-----------|-------|
| **type** | enum | ✅ Yes | One of: `mutualism`, `parasitism`, `predation`, `competition`, `commensalism` |
| **members** | string[] | ✅ Yes | Array of 2+ species IDs involved. Must reference existing species. |
| **impacted_species** | string \| null | Optional | ID of species being impacted (especially for predation/parasitism). Helps clarify directionality. Null if symmetric. |
| **obligate** | boolean | Optional | `true` if relationship is required for survival. Default: `false`. Use for host-plant, obligate parasites, etc. |
| **notes** | string | ✅ Yes | 1-3 sentences explaining the relationship, specificity, and ecological relevance. This is what users see. |

### Symbiosis Types Explained

**mutualism**: Both species benefit.
- Example: Bumble bees pollinate milkweed; milkweed provides nectar.
- Obligate mutualism: Both depend on each other (e.g., Monarch caterpillar + milkweed).
- Facultative mutualism: Both benefit but can survive independently.

**parasitism**: One species (parasite) benefits; the other (host) is harmed.
- Includes host-plant relationships (insect larva eats plant).
- Example: Monarch caterpillar feeds on milkweed (Monarch benefits, milkweed harmed slightly).
- Obligate parasitism: Parasite cannot survive without host.

**predation**: One species (predator) hunts and eats another (prey).
- Less common in packs (use for unusual predator-prey dynamics).
- Usually modeled as symbiosis only if relationship is ecologically significant.

**competition**: Species compete for same resource (food, habitat, mates).
- Use sparingly; only when competition is notable.
- Example: Multiple bee species competing for limited late-season nectar.

**commensalism**: One species benefits; the other is unaffected.
- Example: Bird nesting in cavity created by another bird (bird benefits, cavity-maker unaffected).

### Symbiosis Validation Rules

- **members** must contain 2+ valid species IDs
- All species IDs must exist in the pack or be present in the final merged dataset
- **type** must be one of the five listed above
- **obligate** should be `true` for:
  - Host plants (insect cannot breed without specific plant)
  - Essential mutualists (neither can survive without the other)
  - Critical parasites (host cannot reproduce without being parasitized)

### Examples from 0-base.json

**Obligate host-plant parasitism** (Monarch depends on milkweed):
```json
{
  "type": "parasitism",
  "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
  "impacted_species": "insect_monarch-butterfly",
  "obligate": true,
  "notes": "Monarch caterpillar obligate on genus Asclepias. Cannot breed without milkweed."
}
```

**Mutualism** (Bumble bees pollinate, milkweed provides nectar):
```json
{
  "type": "mutualism",
  "members": ["insect_native-bumble-bees", "plant_common-milkweed"],
  "notes": "Bumble bees are primary diurnal pollinators of Common Milkweed — produce 8x more mature pods than nocturnal moth visitors per Fritz & Morse 1981."
}
```

**Commensalism** (wren uses woodpecker cavity):
```json
{
  "type": "mutualism",
  "members": ["bird_carolina-wren", "bird_pileated-woodpecker"],
  "notes": "Carolina Wren uses abandoned Pileated Woodpecker cavities for nesting."
}
```

---

## Relations Data (Less Common)

Relations are general groupings that don't fit the symbiosis framework.

### Relation Entry Structure

```json
{
  "type": "taxonomic_group",
  "members": ["species_id_1", "species_id_2", "species_id_3"],
  "notes": "These species share common traits."
}
```

### Use Cases for Relations

- **taxonomic_group**: Grouping species by Linnaean taxonomy (rarely used; prefer symbiosis).
- **habitat_guild**: Species that share habitat and ecological role.
- **phenology_group**: Species active in same season.
- **functional_group**: Species with similar ecological function.

Relations are rarely used in practice. Use **Symbiosis** instead for ecological relationships.

---

## Taxonomic Groups (Special Species Entries)

Taxonomic groups are pseudo-species that represent classifications. They use the Species structure but are conceptual.

### Taxonomic Group Example

```json
{
  "id": "group_woodpeckers",
  "common_name": "Woodpeckers",
  "form": "group",
  "habitat": [],
  "diet": [],
  "behavior": [],
  "season": [],
  "functional_description": "PA woodpeckers are cavity-excavating birds. All have specialized skull anatomy and tongues for extracting insects from bark. Create cavities used by owls, kestrels, ducks, and squirrels.",
  "life_stages": [],
  "region": "northeast_pa",
  "label": "Woodpeckers",
  "common_traits": "Cavity excavators, insect specialists, year-round residents"
}
```

### Rules for Taxonomic Groups

- ID starts with `group_` prefix
- Set `form: "group"`
- Include `label` and `common_traits` fields
- Leave `habitat`, `diet`, `behavior`, `season` empty (or fill with common patterns)
- Don't set `is_keystone`
- Individual species reference the group via `taxonomic_group` field

---

## Validation Rules

Before submitting a pack, verify:

### Metadata
- [ ] `id` is lowercase alphanumeric + hyphens/underscores
- [ ] `createdDate` is valid ISO 8601
- [ ] `version` and `schemaVersion` match `N.N.N` format
- [ ] `status` is `"draft"` or `"published"`
- [ ] `description` explains pack contents

### Species
- [ ] Each `id` matches `category_slug` pattern (e.g., `bird_pileated-woodpecker`)
- [ ] No duplicate IDs across all packs
- [ ] `common_name` and `functional_description` are present for complete entries
- [ ] `life_stages` is always present (can be empty array `[]`)
- [ ] `taxonomic_group` references valid group (if used)
- [ ] If `is_keystone: true`, then `keystone_type` and `keystone_description` must be present

### Symbiosis
- [ ] `type` is one of: `mutualism`, `parasitism`, `predation`, `competition`, `commensalism`
- [ ] `members` has 2+ entries
- [ ] All species IDs in `members` exist in final dataset
- [ ] `notes` explains the relationship
- [ ] If `obligate: true`, the relationship is actually obligatory

### General
- [ ] No orphaned references (species IDs in symbiosis don't exist)
- [ ] No duplicate species IDs
- [ ] Valid JSON syntax

---

## Common Mistakes & Fixes

### ❌ Wrong ID Format
```json
// BAD: spaces, uppercase, missing underscore
"id": "Pileated Woodpecker"
"id": "pileated_woodpecker_pa"  // extra segment

// GOOD: category_slug
"id": "bird_pileated-woodpecker"
```

### ❌ Missing Required Fields
```json
// BAD: missing functional_description, life_stages
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren"
}

// GOOD: all required fields
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "functional_description": "Small reddish wren...",
  "life_stages": []
}
```

### ❌ Broken Symbiosis References
```json
// BAD: species_id_x doesn't exist
{
  "type": "mutualism",
  "members": ["bird_carolina-wren", "species_id_x"],
  "notes": "..."
}

// GOOD: both species exist
{
  "type": "mutualism",
  "members": ["bird_carolina-wren", "bird_pileated-woodpecker"],
  "notes": "..."
}
```

### ❌ Wrong Symbiosis Type
```json
// BAD: Monarch caterpillar eating milkweed is parasitism, not predation
{
  "type": "predation",
  "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
  "notes": "..."
}

// GOOD: herbivory = parasitism in ecology
{
  "type": "parasitism",
  "members": ["insect_monarch-butterfly", "plant_common-milkweed"],
  "obligate": true,
  "notes": "Monarch caterpillar obligate on genus Asclepias..."
}
```

### ❌ Keystone Incomplete
```json
// BAD: is_keystone but missing type/description
{
  "id": "plant_common-milkweed",
  "is_keystone": true,
  "keystone_type": null,
  "keystone_description": null
}

// GOOD: complete keystone info
{
  "id": "plant_common-milkweed",
  "is_keystone": true,
  "keystone_type": "host_plant",
  "keystone_description": "Anchor of the milkweed guild. Monarch cannot breed without it..."
}
```

---

## Tips for Generation in Claude Code

### When You See Free-Form Input
Convert narrative into structured data:

**Input**: "Carolina Wrens are small reddish wrens that nest in cavities. They sing year-round."

**Generated Species**:
```json
{
  "id": "bird_carolina-wren",
  "common_name": "Carolina Wren",
  "form": "songbird",
  "behavior": ["cavity_nester"],
  "season": ["year_round"],
  "functional_description": "Small reddish-brown wren with loud song. Uses cavities and nest boxes. Year-round resident in PA.",
  "life_stages": [],
  "region": "northeast_pa"
}
```

### When Generating Relationships
Always ask: "What is the ecological mechanism?"

- Does one eat the other? → **parasitism** or **predation**
- Do both benefit? → **mutualism**
- Does one benefit, the other unaffected? → **commensalism**
- Do they compete? → **competition**

### When in Doubt
- Check `0-base.json` for examples of similar species/relationships
- Keep descriptions concrete and specific (avoid generic statements)
- Prefer obligate relationships when the dependence is absolute
- Always verify symbiosis members exist before saving

---

## Example Workflow in Claude Code

### Scenario 1: Add New Species from Notes

**User provides**: "Add Eastern Tiger Swallowtail butterfly to the dataset. Caterpillars eat cherry, oak, and other trees. Adults pollinate flowers in spring and summer."

**Claude generates**:
1. New species entry: `insect_eastern-tiger-swallowtail`
2. Symbiosis entries linking to cherry, oak (host plants, parasitism, obligate)
3. Adds any missing symbiosis with pollinators if relevant

### Scenario 2: Correct Broken References

**User provides**: Pack with symbiosis referencing `bird_great-blue-heron` but species not defined.

**Claude**:
1. Detects missing reference via validation
2. Reports error: "species_id 'bird_great-blue-heron' used in symbiosis but not defined"
3. Either: removes symbiosis entry, or generates the missing species

### Scenario 3: Enhance Incomplete Species

**User provides**: Existing species entry missing habitat, diet, behavior details.

**Claude**:
1. Uses `functional_description` to infer missing fields
2. Populates arrays with ecologically accurate tags
3. Preserves all existing data

---

## Testing Your Pack

After generation, validate with:

```bash
npm run pack:validate packs/your-pack.json
```

Expected output for valid pack:
```
✓ Pack is valid
```

Expected output for errors:
```
✗ Validation failed:
  - Species ID 'bird_wrong id' does not match pattern
  - Symbiosis references unknown species 'xyz'
```

---

## Next Steps

1. Create or edit a pack file in `/home/user/living-patch/pack-tools/packs/`
2. Follow the structure described here
3. Run validation: `npm run pack:validate packs/your-pack.json`
4. If valid, you can merge with existing packs: `npm run pack:merge packs/0-base.json packs/your-pack.json`
5. To include the new pack in the app, add to build pipeline or update import logic

---

*Last updated: 2026-05-27*
