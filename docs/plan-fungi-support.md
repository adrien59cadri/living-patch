# Fungi Support Implementation Plan

## Overview

Add comprehensive fungi support to Living Patch, including UI forms, filters, learn page integration, and hierarchical taxonomy display for the newly added Florida fungi dataset.

## Context

The Florida dataset (packs 2-4) includes 8 fungi species organized under taxonomic groups:
- Truffles, Boletes, Chanterelles, Amanitas, Russulas, Milkcaps, Puffballs, Morels, and other fungal fruiting bodies
- Fungi serve as decomposers and mycorrhizal partners in ecosystems
- Hierarchical organization: Fungi → Mycorrhizal Fungi, Truffles, Mushroom species, etc.

## Objectives

1. Enable users to filter and view fungi species alongside plants, animals, and other organisms
2. Display hierarchical taxonomy relationships in the UI
3. Add fungi-specific form controls (habitat, season, ecological role)
4. Update the learn page to showcase fungi with proper taxonomic context
5. Support fungi sighting logging in the life list

## Implementation Phases

### Phase 1: Data & Schema Updates (Low Effort)
- ✅ Fungi species data already added to packs 2-4
- [ ] Verify all fungi entries have consistent `form` field values (currently set to "fungus")
- [ ] Add any missing `season`, `habitat`, `ecological_role` fields to fungi species
- [ ] Ensure taxonomic group references are correct (`taxonomic_group` field)

### Phase 2: Filter Form Updates (Medium Effort)
**Files to modify:**
- `app/src/components/SpeciesFilter.tsx` (or equivalent filter component)
- `app/src/components/SpeciesForm.tsx` (or equivalent species entry form)

**Changes:**
1. Add "Fungi" as a filterable organism type checkbox
   - Current types: Plants, Mammals, Birds, Reptiles, Amphibians, Insects
   - Add: Fungi

2. Add fungi-specific filter options:
   - Habitat: soil, wood, tree, forest, grassland, wetland
   - Season: year_round, spring, summer, fall, winter
   - Ecological role: decomposer, mycorrhizal_partner

3. Update form validation to accept fungi entries

### Phase 3: UI Component Updates (Medium-High Effort)
**Files to modify:**
- `app/src/components/SpeciesCard.tsx`
- `app/src/components/SpeciesDetail.tsx`
- `app/src/components/TaxonomyBrowser.tsx` (create if needed)

**Changes:**
1. Display hierarchical taxonomy labels
   - Format: "Category > Subcategory > Species Name"
   - Example: "Fungi > Decomposers > Morel"
   - Add `group_label` field display on species cards

2. Add fungi-specific icons/badges
   - Fungi icon (🍄)
   - Decomposer badge
   - Mycorrhizal partner badge

3. Show habitat preferences for fungi
   - Soil specialist
   - Wood decomposer
   - Tree associate

4. Add keystone indicator for fungi (Earthworms and Dragonflies already marked as keystone in data)

### Phase 4: Learn Page Integration (Medium Effort)
**Files to modify:**
- `app/src/pages/LearnPage.tsx` (or equivalent)
- `app/src/components/LearnPageContent.tsx`

**Changes:**
1. Add fungi as a browsable category alongside plants, animals, insects
2. Display fungi organized by:
   - Ecological role (decomposers, mycorrhizal partners)
   - Habitat type (forest, grassland, soil)
   - Taxonomic group (from dataset)

3. Show sample fungi from each region:
   - Florida: Morels, Truffles, Polypores, etc.
   - (Future regions as data is added)

4. Add educational content about fungi:
   - Ecological role in nutrient cycling
   - Symbiotic relationships with plants
   - Decomposition process

### Phase 5: Sighting & Life List Support (Medium Effort)
**Files to modify:**
- `app/src/components/LogSightingForm.tsx` (or equivalent)
- `app/src/store/lifeListStore.ts` (or equivalent)

**Changes:**
1. Enable fungi sighting logging
   - Update species selector to include fungi
   - Add fungi-specific sighting fields:
     - Substrate type (wood, soil, plant, other)
     - Fruiting stage (fruiting, spore dispersal, dormant)

2. Update stats calculations to include fungi observations
   - Total fungi species seen
   - Fungi by habitat type
   - Seasonal fungi patterns

### Phase 6: Hierarchical Taxonomy Display (Medium-High Effort)
**Files to create/modify:**
- `app/src/components/TaxonomyTree.tsx` (new component)
- `app/src/utils/taxonomyUtils.ts` (new utility file)

**Changes:**
1. Create utility functions to organize species by taxonomy groups:
   ```typescript
   function buildTaxonomyTree(species: Species[]): TaxonomyNode[]
   function filterByTaxonomicGroup(species: Species[], groupId: string): Species[]
   ```

2. Create tree view component displaying:
   - Expandable/collapsible groups
   - Count of species per group
   - Visual hierarchy using indentation

3. Example tree structure:
   ```
   Fungi (8 species)
   ├── Mycorrhizal Fungi (3 species)
   │   ├── Truffle
   │   ├── Bolete
   │   └── Chanterelle
   └── Decomposers (5 species)
       ├── Morel
       ├── Polypore
       └── ...
   ```

## Data Structure Changes (if needed)

Current fungi species structure already includes:
- `id`: unique identifier
- `common_name`: display name
- `latin_name`: scientific name
- `form`: "fungus"
- `habitat`: array of habitat types
- `season`: array of seasons
- `ecological_role`: "decomposer" or "mycorrhizal_partner"
- `taxonomic_group`: reference to group ID
- `region`: "florida"

**Potential additions:**
- `substrate_type`: soil, wood, plant, other (for sighting specificity)
- `fruiting_season`: more granular seasonal info

## Testing Plan

1. **Unit tests:**
   - Test taxonomy tree building
   - Test filter logic for fungi
   - Test taxonomy hierarchy queries

2. **Integration tests:**
   - Filter fungi by habitat
   - Log fungi sightings
   - View fungi on learn page

3. **UI tests:**
   - Hierarchical display renders correctly
   - Filter form includes fungi options
   - Species cards show fungi icons/badges

## Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| 1: Data & Schema | 0.5d | Validation & minor updates |
| 2: Filter Form | 1d | Add fungi checkboxes and options |
| 3: UI Components | 1.5d | Icons, badges, hierarchy display |
| 4: Learn Page | 1d | Category, content, browsing |
| 5: Sighting Support | 0.5d | Add to form & calculations |
| 6: Taxonomy Display | 1.5d | Build tree component & utils |
| **Total** | **6d** | ~1 week of development |

## Dependencies

- Florida species data packs (✅ already added)
- Existing species filter & form infrastructure
- Current UI component structure

## Success Criteria

- [ ] Fungi appear in species list and can be filtered
- [ ] Hierarchical taxonomy displays on learn page
- [ ] Users can log fungi sightings
- [ ] Fungi stats appear in life list
- [ ] All existing functionality remains unbroken
- [ ] At least 5 fungi species visible in initial load

## Future Enhancements

1. Add more fungi species from other regions (EU, Asia, etc.)
2. Implement substrate/food web connections (shows which fungi partner with which plants)
3. Add seasonal species guides (e.g., "Spring Morels")
4. Integrate with spore identification tools
5. Add cultivation/foraging guides (if in scope)

## Blockers & Risks

- **Risk**: Filter UI may need redesign if too many organism types
  - *Mitigation*: Consider grouping (e.g., "Plants & Fungi" category)
- **Risk**: Hierarchy display may cause performance issues with large datasets
  - *Mitigation*: Lazy-load taxonomic groups, implement virtualization
- **Risk**: Fungi-specific sighting fields may conflict with existing schema
  - *Mitigation*: Use optional/conditional fields in schema

## References

- [Florida Fungi Dataset](../pack-tools/packs/4-florida-fungi-invertebrates-complete.json)
- [Living Patch Data Schema](../pack-tools/types.ts)
- [Existing Roadmap](../roadmap.md)
