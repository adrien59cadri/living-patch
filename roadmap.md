# Living Patch Roadmap

## Future Ideas & Enhancements

### 1. Relation Strength System
Create a strength scale for relations to separate critical relations from weak ones. This allows users to:
- Focus on important relationships without being overwhelmed by all connections
- Filter relations by strength level (critical → strong → weak)
- Customize which relation strengths are displayed in graphs
- Better understand ecological hierarchy and impact

**Impact**: Improves usability by reducing visual clutter while maintaining data completeness.

### 2. Keystone Keyword & Value Shorthands
Implement a shorthand system for changing keystone keywords and values in datasets:
- Define shorthand aliases (e.g., `PH` → `pH`, `N` → `Nitrogen`)
- Apply shorthands consistently across datasets
- Simplify dataset authoring and maintenance
- Reduce data entry errors

**Impact**: Streamlines dataset creation and makes collaboration easier.

### 3. Native/Invasive Species Classification
Add native/invasive and other species classification info to datasets:
- Extend dataset schema to include species classification (native, invasive, endemic, etc.)
- Display this information on the learning page using shorthand labels
- Filter/highlight species by classification in the app
- Support habitat-specific classifications (a species can be native in one region, invasive in another)

**Impact**: Provides richer ecological context and educational value.

### 4. Expand Keystone Species Coverage
Add more keystone species to datasets:
- Identify and include additional keystone species for various habitats
- Document keystone species relationships more thoroughly
- Support different geographical regions and biomes

**Impact**: Increases dataset comprehensiveness and educational scope.

### 5. Species List per Habitat
Make it easy to view all species associated with a given habitat:
- Create a habitat detail view showing its complete species list
- Support filtering by species type, classification, or role
- Link to individual species pages from habitat view
- Show species abundance/frequency in the habitat

**Impact**: Improves navigation and exploration of the dataset.

### 6. Plant Trait Expansion: Allergen & Reproduction Info
Extend plant species data with human health and reproduction information:
- Add allergen classification (highly allergenic, mildly allergenic, non-allergenic)
- Document mode of reproduction (seed, vegetative, fragmentation, etc.)
- Display on species cards to help users identify allergenic plants and understand plant strategies
- Support filtering by allergen status and reproduction type
- Cross-reference with related plants using same reproduction strategy

**Impact**: Provides practical information for users with allergies; enhances understanding of plant ecology and life strategies.

### 7. Global Life List System
Create a comprehensive system to track species observations:
- Allow users to maintain a personal or collaborative life list
- Track sightings with location, date, and notes
- Cross-reference with the living patch dataset
- Generate statistics and insights from life list data

**Impact**: Adds engaging tracking features and personal connection to the data.

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
