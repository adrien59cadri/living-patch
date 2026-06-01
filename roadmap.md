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

### 7. Sighting-Based Familiarity Score — Full Overhaul

Replace the manual four-tier system with a **computed familiarity score** derived purely from observation history. The score encodes two independent ideas: *how often* you've seen a species and *how richly* you've encountered it — across time and space.

---

#### 7.1 Score Design

The score is a single decimal number in **[0, 100]**, computed as the product of three independent sub-scores, each capped at its maximum weight:

```
familiarity = sightingScore × timeScore × habitatScore
```

| Sub-score | Weight | What it measures |
|---|---|---|
| `sightingScore` | 40 pts | Raw observation frequency (deduplicated per day) |
| `timeScore` | 35 pts | Temporal spread across years and seasons |
| `habitatScore` | 25 pts | Diversity of habitat types where observed |

**Why multiplicative?** A species seen 50 times in a single afternoon in one habitat should not score as high as one seen 10 times across 3 years in 4 habitats. Each dimension must contribute meaningfully for the score to be high.

---

#### 7.2 Sub-score Formulas

**`sightingScore` (0–40)**

Uses a logarithmic curve so early sightings are highly rewarding and later ones taper off:

```
sightingScore = 40 × log(n + 1) / log(threshold + 1)
```

Where `n` = deduplicated daily sighting count and `threshold` = 30 (saturates at ~30 days of observation). Capped at 40.

**`timeScore` (0–35)**

Rewards both *years* of observation and *seasonal* coverage:

```
yearPoints  = min(years, 4) / 4   × 0.6   // up to 4 years → 60% of time score
seasonPoints = seasons / 4         × 0.4   // 4 seasons → 40% of time score

timeScore = 35 × (yearPoints + seasonPoints)
```

- `years` = count of distinct calendar years with at least one sighting
- `seasons` = count of distinct seasons (spring/summer/autumn/winter) with at least one sighting

**`habitatScore` (0–25)**

```
habitatScore = 25 × min(habitatTypes, 4) / 4
```

- `habitatTypes` = count of distinct habitat type values recorded across all sightings (e.g. forest edge, pond, meadow, garden)
- Saturates at 4 distinct habitats

---

#### 7.3 Tier Mapping

The four existing tiers are **derived** from the score and kept as display labels only. No manual tier setting.

| Score range | Tier | Label |
|---|---|---|
| 0–19 | `noticed` | Noticed |
| 20–44 | `familiar` | Familiar |
| 45–74 | `know-it-well` | Know It Well |
| 75–100 | `steward` | Steward |

Thresholds are constants in `lifeListUtils.ts` so they can be tuned independently of the formula.

---

#### 7.4 Data Requirements (depends on Feature 6)

This feature depends on **Feature 6 (Sighting Depth)** for the `habitatType` field on sightings and the deduplicated daily count logic. Feature 7 should be implemented after Feature 6 is complete.

New fields used from the enriched sighting record:
- `sighting.habitatType: string` — habitat type at the time of the sighting
- `sighting.date` — already present; used for year/season bucketing

No schema migration needed for old sightings — missing `habitatType` values simply don't contribute to `habitatScore` (treated as 0 distinct habitats until one is logged).

---

#### 7.5 Implementation Plan

1. **`computeFamiliarityScore(sightings: Sighting[]): FamiliarityResult`** — pure function in `lifeListUtils.ts`
   - Returns `{ score, tier, breakdown: { sightingScore, timeScore, habitatScore } }`
   - No side effects; fully testable

2. **Remove `setTier()` from the store** — replace with `computedTier` selector that calls the function above

3. **`LifeListEntry`** — remove the manual `tier` field; the tier is always derived at read time from sightings

4. **`TierSelector` component** — remove or repurpose as a read-only score display widget

5. **Score breakdown UI** — add a small progress breakdown on the species card:
   - Three bars: Sightings / Time / Habitats, each filled proportionally
   - Tooltip or expandable: "Seen 8 times · 2 seasons · 1 habitat type"

6. **Insight string** — generate a short human-readable sentence:
   - `"Seen on 8 days across 2 seasons — try logging in a new habitat to progress."`
   - `"Observed every year for 3 years across 3 habitat types — you know this species well."`

7. **Manual override** (optional, v2) — a settings toggle that allows pinning a tier manually; override is stored separately and shown with an indicator. Not in v1.

---

#### 7.6 Test Cases

| Scenario | Expected tier |
|---|---|
| 1 sighting, today, 1 habitat | noticed (~8 pts) |
| 15 sightings, same day, same habitat | noticed (sighting score inflated but time/habitat near 0) |
| 5 sightings across 2 years, 2 seasons, 2 habitats | familiar (~38 pts) |
| 12 sightings across 3 years, 4 seasons, 3 habitats | know-it-well (~62 pts) |
| 25+ sightings across 4+ years, all 4 seasons, 4 habitats | steward (90+ pts) |

---

**Impact**: Familiarity becomes a meaningful signal earned through sustained, diverse observation — not a checkbox. The score rewards exactly the naturalist behavior the app wants to encourage: returning to the same species across seasons, years, and different places.

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
