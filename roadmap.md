# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Keystone Keyword & Value Shorthands
Implement a shorthand system for changing keystone keywords and values in datasets:
- Define shorthand aliases (e.g., `PH` → `pH`, `N` → `Nitrogen`)
- Apply shorthands consistently across datasets
- Simplify dataset authoring and maintenance
- Reduce data entry errors

**Impact**: Streamlines dataset creation and makes collaboration easier.

### 2. Native/Invasive Species Classification
Add native/invasive and other species classification info to datasets:
- Extend dataset schema to include species classification (native, invasive, endemic, etc.)
- Display this information on the learning page using shorthand labels
- Filter/highlight species by classification in the app
- Support habitat-specific classifications (a species can be native in one region, invasive in another)

**Impact**: Provides richer ecological context and educational value.

### 3. Expand Keystone Species Coverage
Add more keystone species to datasets:
- Identify and include additional keystone species for various habitats
- Document keystone species relationships more thoroughly
- Support different geographical regions and biomes

**Impact**: Increases dataset comprehensiveness and educational scope.

### 4. Species List per Habitat
Make it easy to view all species associated with a given habitat:
- Create a habitat detail view showing its complete species list
- Support filtering by species type, classification, or role
- Link to individual species pages from habitat view
- Show species abundance/frequency in the habitat

**Impact**: Improves navigation and exploration of the dataset.

### 5. Plant Trait Expansion: Allergen & Reproduction Info
Extend plant species data with human health and reproduction information:
- Add allergen classification (highly allergenic, mildly allergenic, non-allergenic)
- Document mode of reproduction (seed, vegetative, fragmentation, etc.)
- Display on species cards to help users identify allergenic plants and understand plant strategies
- Support filtering by allergen status and reproduction type
- Cross-reference with related plants using same reproduction strategy

**Impact**: Provides practical information for users with allergies; enhances understanding of plant ecology and life strategies.

### 6. Sighting Depth: Habitat Context & Temporal/Spatial Diversity
Enrich sighting data to capture where and when observations happen, not just how many:
- **Habitat type on sighting**: Add a habitat type field to the log form (e.g., forest edge, pond, garden, meadow) to characterize the location type, separate from the free-text location name
- **Deduplicated daily counts**: Count only one sighting per species per day — multiple logs the same day refine the record but don't inflate the count
- **Monthly × yearly tracking**: Track unique months and years a species was observed (e.g., "seen in 5 different Mays", "observed across 3 years")
- **Location diversity**: Track how many distinct named locations and habitat types a species has been recorded in
- **Stats surface**: Expose these metrics in the Stats tab and species detail — "Observed in 3 habitat types", "Seen every spring for 4 years"

**Impact**: Transforms sighting counts into a richer picture of a species' presence across seasons, years, and habitats — rewarding long-term, multi-site observation.

### 7. Familiarity Badges

Replace the manual tier system with a small set of **observation badges** earned automatically from sighting history. Badges are independent — a species can hold any combination — and are displayed together on the species card.

#### Badges

| Badge | Condition | Icon |
|---|---|---|
| **Seen** | At least 1 sighting logged | 👁 |
| **Recurring** | Sighted in 2 or more different months (any year) | 📅 |
| **Long-term** | Sighted in 2 or more different calendar years | 🗓 |
| **Wide-ranging** | Sighted in 2 or more distinct habitat types | 🗺 |

#### Derived familiarity tier

The existing four tiers (`noticed`, `familiar`, `know-it-well`, `steward`) are kept as display labels but derived from badge count, not set manually:

| Badges earned | Tier |
|---|---|
| Seen only | Noticed |
| Seen + 1 other | Familiar |
| Seen + 2 others | Know It Well |
| All 4 badges | Steward |

#### Data requirements

- `sighting.date` — already present; used for month and year bucketing
- `sighting.habitatType` — added in Feature 6; missing values simply don't contribute to Wide-ranging

#### Implementation

1. **`computeFamiliarityBadges(sightings: Sighting[]): Badge[]`** — pure function in `lifeListUtils.ts`, returns the list of earned badge ids
2. **`deriveTier(badges: Badge[]): FamiliarityTier`** — maps badge count to tier label
3. Remove `setTier()` from the store; tier is always derived at read time
4. Replace `TierSelector` with a read-only badge row on the species card

**Impact**: Familiarity is earned through real, diverse observation. Badges are immediately legible — a user can see at a glance whether they've seen a species across time and place, not just once.

### 8. Automated Multilingual Name Fetcher
Implement a CLI tool to auto-populate multilingual common names from Wikipedia:
- **Tool**: `fetch-names` CLI (mirrors `fetch-images` pattern)
- **Source**: Wikipedia language-links API to find vernacular names in other languages
- **Usage**: `npm run fetch-names packs/1-france.json --lang fr`
- **Features**: Support `--only-missing`, `--delay`, `--max` options for flexible runs
- **Implementation**: See `plan-fetch-names.md` for full specification
- **Impact**: Enables easy expansion to new languages without manual data entry

**Status**: Specification complete in `plan-fetch-names.md`; ready for implementation

---

## Implementation Notes

- **Dataset Structure**: Datasets remain one per pack but are pre-validated and minified during distribution
- **Data Processing**: Deduplication and conflict resolution moved to app layer for flexibility
- **Performance**: Consider caching and indexing strategies for multi-dataset queries
- **User Experience**: Provide clear controls for toggling features and managing data sources
