# Living Patch Roadmap

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

### 7. Sighting-Based Familiarity Progression
Replace the manual tier system with familiarity derived from observation data:
- Auto-calculate a familiarity level from sighting count, seasonal diversity, habitat diversity, and years observed
- Factor in related species sightings — observing a predator and its prey, or a plant and its pollinator, signals deeper ecosystem understanding
- Show progression indicators on the species card — what dimensions of observation would advance familiarity
- Allow users to override the calculated level if desired
- Surface insights: "Seen in 3 seasons across 2 years — you may know this species well"

**Impact**: Makes familiarity feel earned through real observation rather than arbitrary manual selection; rewards consistent, multi-context naturalism.

### 8. Life List Backup & Restore
Add export/import controls in the Settings page to prevent data loss:
- **Export**: Download life list data (sightings + tiers) as a JSON file from the Settings page
- **Import**: Upload a previously exported JSON file to restore data (with confirmation prompt)
- Useful when switching browsers, devices, or clearing browser storage
- Exported file format mirrors the existing `living-patch-life-list-v1` localStorage schema for simplicity

**Impact**: Protects users from accidental data loss; enables moving data between devices or browsers.

### 9. Multi-Dataset Support
Enable the app to load and manage multiple datasets:
- Support loading multiple datasets simultaneously
- Implement deduplication logic to handle species/relations appearing in multiple datasets
- Create conflict resolution system for conflicting data across datasets
- Perform validation and minification at app load time (datasets in packs are pre-validated)
- Allow users to choose dataset combinations for their view

**Impact**: Dramatically increases data coverage and flexibility; enables community dataset contributions.

### 10. French Species Pack
Add a French/European species dataset as a second geographic pack alongside the existing Northeast PA pack:
- Create `pack-tools/packs/1-france.json` with species common in France (birds, mammals, plants, trees, butterflies)
- Establish symbiosis relationships for French temperate/Mediterranean ecosystems
- Use the existing pack format and ID conventions (`bird_rouge-gorge`, `mammal_chevreuil`, etc.)
- Start as `status: "draft"`, validate with `pack:validate`, test-merge against `0-base.json`, then publish
- Regenerate `dataset.json` via `build:dataset` to include both packs

**Impact**: Extends the app beyond NE Pennsylvania, enabling use by naturalists in France; validates the multi-region pack architecture.

### 11. Area-Based List Filtering
Expose the existing `region` field on species as a filter dimension so users can narrow the list to a specific geographic area:
- Add `areas: string[]` to `FilterState` in `lib/filters.ts` and update `filterSpecies()` and `getFilterOptions()`
- Add area display names to `designTokens.ts` (`"northeast_pa"` → "Northeast PA", `"france"` → "France")
- Surface the filter in `FilterPanel.tsx` (multi-select, hidden when only one area exists in the loaded dataset)
- Add area pills to `QuickFilterBar.tsx` alongside existing form/habitat/keystone chips
- Support `?area=` URL param in `HomePage.tsx` for deep-linking to an area-filtered view

**Impact**: Makes multi-region datasets navigable; lets NE PA users hide French species and vice versa — a prerequisite for the French pack being useful in practice.

---

## Implementation Notes

- **Dataset Structure**: Datasets remain one per pack but are pre-validated and minified during distribution
- **Data Processing**: Deduplication and conflict resolution moved to app layer for flexibility
- **Performance**: Consider caching and indexing strategies for multi-dataset queries
- **User Experience**: Provide clear controls for toggling features and managing data sources
