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

### 6. Global Life List System ✅ Complete (May 30, 2026)
Personal observation tracking system, fully implemented:
- Personal life list stored in browser (localStorage via Zustand persist)
- Sighting logging with date, location, notes, weather/time conditions
- Calendar view with sighting dots, month navigation, day detail popup
- Stats panel: monthly chart, top-5 species
- `/life-list` page with All / Calendar / Stats tabs
- Sighting count on SpeciesTile; recent sightings on SpeciesCard
- LifeListStats summary bar on HomePage linking to /life-list

**Implementation details**: See [`LIFE-LIST-PLAN.md`](LIFE-LIST-PLAN.md) for full architecture, component breakdown, data model, and implementation history.

**Impact**: Transforms app from read-only explorer to personal naturalist's logbook.

### 7. Sighting Depth: Habitat Context & Temporal/Spatial Diversity
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

### 9. Life List Backup & Restore
Add export/import controls in the Settings page to prevent data loss:
- **Export**: Download life list data (sightings + tiers) as a JSON file from the Settings page
- **Import**: Upload a previously exported JSON file to restore data (with confirmation prompt)
- Useful when switching browsers, devices, or clearing browser storage
- Exported file format mirrors the existing `living-patch-life-list-v1` localStorage schema for simplicity

**Impact**: Protects users from accidental data loss; enables moving data between devices or browsers.

### 10. Multi-Dataset Support
Enable the app to load and manage multiple datasets:
- Support loading multiple datasets simultaneously
- Implement deduplication logic to handle species/relations appearing in multiple datasets
- Create conflict resolution system for conflicting data across datasets
- Perform validation and minification at app load time (datasets in packs are pre-validated)
- Allow users to choose dataset combinations for their view

**Impact**: Dramatically increases data coverage and flexibility; enables community dataset contributions.

---

## Implementation Notes

- **Dataset Structure**: Datasets remain one per pack but are pre-validated and minified during distribution
- **Data Processing**: Deduplication and conflict resolution moved to app layer for flexibility
- **Performance**: Consider caching and indexing strategies for multi-dataset queries
- **User Experience**: Provide clear controls for toggling features and managing data sources
