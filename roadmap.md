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
- Familiarity tiers: Noticed → Familiar → Know It Well → Steward (user-set, not auto-calculated)
- Calendar view with tier-colored sighting dots, month navigation, day detail popup
- Stats panel: tier distribution, monthly chart, top-5 species
- `/life-list` page with All / By Tier / Calendar / Stats tabs
- Tier badge + sighting count on SpeciesTile; tier selector + recent sightings on SpeciesCard
- LifeListStats summary bar on HomePage linking to /life-list

**Implementation details**: See [`LIFE-LIST-PLAN.md`](LIFE-LIST-PLAN.md) for full architecture, component breakdown, data model, and implementation history.

**Impact**: Transforms app from read-only explorer to personal naturalist's logbook.

### 7. Life List Backup & Restore
Add export/import controls in the Settings page to prevent data loss:
- **Export**: Download life list data (sightings + tiers) as a JSON file from the Settings page
- **Import**: Upload a previously exported JSON file to restore data (with confirmation prompt)
- Useful when switching browsers, devices, or clearing browser storage
- Exported file format mirrors the existing `living-patch-life-list-v1` localStorage schema for simplicity

**Impact**: Protects users from accidental data loss; enables moving data between devices or browsers.

### 8. Multi-Dataset Support
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
