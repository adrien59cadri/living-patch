# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Native/Invasive Species Classification
Add native/invasive and other species classification info to datasets:
- Extend dataset schema to include species classification (native, invasive, endemic, etc.)
- Display this information on the learning page using shorthand labels
- Filter/highlight species by classification in the app
- Support habitat-specific classifications (a species can be native in one region, invasive in another)

**Impact**: Provides richer ecological context and educational value.

### 2. Plant Trait Expansion: Allergen & Reproduction Info
Extend plant species data with human health and reproduction information:
- Add allergen classification (highly allergenic, mildly allergenic, non-allergenic)
- Document mode of reproduction (seed, vegetative, fragmentation, etc.)
- Display on species cards to help users identify allergenic plants and understand plant strategies
- Support filtering by allergen status and reproduction type
- Cross-reference with related plants using same reproduction strategy

**Impact**: Provides practical information for users with allergies; enhances understanding of plant ecology and life strategies.

### 8. Fungi Support & Hierarchical Taxonomy Display
Add comprehensive UI support for fungi species and display hierarchical taxonomic organization:
- **Data Integration**: Add fungi filter checkbox and form controls (habitat, substrate type, ecological role)
- **Learn Page**: Create fungi browsing category with taxonomic tree view (Fungi → Decomposers → Morel, etc.)
- **Hierarchy Display**: Build taxonomy tree component showing group relationships and species counts
- **Sighting Support**: Enable fungi sighting logging with substrate-type and fruiting-stage fields
- **Icons & Badges**: Add fungi-specific visual indicators (🍄 icon, decomposer/mycorrhizal badges)
- **Stats**: Update life list to include fungi observation counts and seasonal patterns

**Status**: Full implementation plan in `docs/plan-fungi-support.md`; ready for development (6d estimated effort)

**Includes**: 8 Florida fungi species already in dataset; plan covers UI/UX to make them discoverable and actionable

### 9. Organism Type Preferences & Settings Page
Allow users to customize which organism types to track and display:
- **Settings Page**: Add organism type toggles (Mammals, Birds, Reptiles, Amphibians, Insects, Plants, Fungi)
- **Quick Presets**: Provide preset configurations ("Birds Only", "Botanist", "Zoologist", "All Except Fungi", etc.)
- **Dynamic Filtering**: Filter species lists, forms, learn page, and life list based on enabled types
- **Smart Defaults**: Remember preferences across sessions; default to all types enabled
- **Data Preservation**: Keep sightings for disabled types; reappear when re-enabled
- **UX Guidance**: Show count of hidden sightings and helpful messages when type disabled

**Status**: Full implementation plan in `docs/plan-organism-type-preferences.md`; ready for development (5.5d estimated effort)

**Use Cases**: Bird watchers (birds only), botanists (plants + fungi + insects), zoologists (all animals), pollinators (plants + insects + birds)

