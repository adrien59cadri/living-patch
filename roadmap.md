# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Plant Trait Expansion: Allergen & Reproduction Info
Extend plant species data with human health and reproduction information:
- Add allergen classification (highly allergenic, mildly allergenic, non-allergenic)
- Document mode of reproduction (seed, vegetative, fragmentation, etc.)
- Display on species cards to help users identify allergenic plants and understand plant strategies
- Support filtering by allergen status and reproduction type
- Cross-reference with related plants using same reproduction strategy

**Impact**: Provides practical information for users with allergies; enhances understanding of plant ecology and life strategies.

### 2. Organism Type Preferences & Settings Page
Allow users to customize which organism types to track and display:
- **Settings Page**: Add organism type toggles (Mammals, Birds, Reptiles, Amphibians, Insects, Plants, Fungi)
- **Quick Presets**: Provide preset configurations ("Birds Only", "Botanist", "Zoologist", "All Except Fungi", etc.)
- **Dynamic Filtering**: Filter species lists, forms, learn page, and life list based on enabled types
- **Smart Defaults**: Remember preferences across sessions; default to all types enabled
- **Data Preservation**: Keep sightings for disabled types; reappear when re-enabled
- **UX Guidance**: Show count of hidden sightings and helpful messages when type disabled

**Status**: Full implementation plan in `docs/plan-organism-type-preferences.md`; ready for development (5.5d estimated effort)

**Use Cases**: Bird watchers (birds only), botanists (plants + fungi + insects), zoologists (all animals), pollinators (plants + insects + birds)

---

## Implementation Notes

- **Dataset Structure**: Datasets remain one per pack but are pre-validated and minified during distribution
- **Data Processing**: Deduplication and conflict resolution moved to app layer for flexibility
- **Performance**: Consider caching and indexing strategies for multi-dataset queries
- **User Experience**: Provide clear controls for toggling features and managing data sources
