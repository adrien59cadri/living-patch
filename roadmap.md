# Living Patch Roadmap

## ✅ Completed (June 1, 2026)

### 9. Multi-Dataset Runtime Pack Control ✅
Enable toggling of data packs at runtime:
- **Store**: Zustand store for pack enable/disable state, persisted to localStorage
- **UI**: Pack management page (`/packs`) with toggle switches per pack
- **Data**: Dynamic dataset indexing based on enabled packs
- **Status**: Ships with 2 packs (0-base: 80 NE PA species, 1-france: 24 French species)

### 10. French Species Pack ✅
Add European species dataset as a second geographic pack:
- **Pack file**: `pack-tools/packs/1-france.json` with 24 French species
- **Content**: Birds (rouge-gorge, mésange, etc.), mammals (renard, sanglier, etc.), trees, plants, butterflies
- **Symbiosis**: 11 relationships reflecting French temperate ecosystem
- **Status**: Published (loads by default)

### 11. Area-Based List Filtering ✅
Expose the `region` field as a filter dimension:
- **FilterState**: Added `areas: string[]` with multi-select support
- **UI**: Area chips in quick filter bar (sky-blue, active when filtered) + checkboxes in advanced panel
- **Display**: Only shown when >1 region in dataset
- **URLs**: Supports `?area=france` and `?area=northeast_pa` URL params for deep-linking

### 12. Hierarchical Form Filters in Species List ✅
Redesign the species list form filter to show only top-level categories initially:
- **UI**: Primary selector shows top-level forms (bird, mammal, plant, insect, frog)
- **Progressive disclosure**: When user selects a top-level form, sub-categories appear with visual prefix (e.g., "└─ Woodpecker")
- **Consistency**: Mirrors the hierarchical structure already defined in FormHierarchySection on /learn page
- **Files**: `app/src/components/FilterPanel.tsx`, `app/src/lib/learnContent.ts` (utilities: `getTopLevelForms()`, `getChildForms()`, `getAllDescendantForms()`)
- **Status**: Published, 22 E2E tests passing

### 13. Life List Backup & Restore ✅
Add export/import controls in the Settings page to prevent data loss:
- **Export**: Download life list data (sightings + tiers) as a JSON file from the Settings page
- **Import**: Upload a previously exported JSON file to restore data (with confirmation prompt)
- Useful when switching browsers, devices, or clearing browser storage
- **Status**: Implemented in SettingsPage.tsx with `restoreFromBackup()` store action

---

## Planned Features (Next Priority)

---

## Future Ideas & Enhancements

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

### 8. Sighting-Based Familiarity Progression
Replace the manual tier system with familiarity derived from observation data:
- Auto-calculate a familiarity level from sighting count, seasonal diversity, habitat diversity, and years observed
- Factor in related species sightings — observing a predator and its prey, or a plant and its pollinator, signals deeper ecosystem understanding
- Show progression indicators on the species card — what dimensions of observation would advance familiarity
- Allow users to override the calculated level if desired
- Surface insights: "Seen in 3 seasons across 2 years — you may know this species well"

**Impact**: Makes familiarity feel earned through real observation rather than arbitrary manual selection; rewards consistent, multi-context naturalism.

### 9. Automated Multilingual Name Fetcher
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
