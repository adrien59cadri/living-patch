# LivingPatch — Development Memory

## Project Status: ✅ Phase 3.8 COMPLETE — Ecological Status Taxonomy (June 5, 2026)
Phase 1 (Dataset Explorer) + Phase 2 (Life List) + Multi-Region + French Pack + Ecoregion 5 Expansion + Salamanders + Invasive Species Annotations + **Ecological Status Taxonomy** — all implemented, tested, and shipped.
- **Live**: http://localhost:5174/ (run `npm run dev` in root)
- **Build**: ~200ms, ~700 modules
- **Tests**: 121 unit tests + 95 E2E tests passing
- **Dataset**: 177 species (109 NE PA Ecoregion 5 with 8 invasives + 23 French + 45+ taxonomic groups)
- **Image Validation**: All 86 species in 0-base pack have verified Wikipedia Commons images
- **Ecological Status**: N (native, default), NB (native bully), NNNA (non-native non-aggressive), I (invasive)

## What Works
✅ **D3 Radial Bubble Tree** - Interactive species relationship diagram
✅ **Search** - Full-text across common_name, latin_name, description
✅ **Filters** - Form, season, habitat (multi-select, combinable); advanced FilterPanel + QuickFilterBar chips
✅ **Quick Filter Chips** - Pill-style Form/Habitat/Keystone chips on list page (QuickFilterBar component)
✅ **Clickable Detail Tags** - Form/Habitat/Keystone tags in species detail navigate to filtered list via URL params
✅ **URL Filter Params** - List page reads ?form=, ?habitat=, ?keystone_type= params (multi-value)
✅ **Multi-Region Packs** - Pack management page (/packs), toggle packs at runtime, 2 packs (NE PA + France)
✅ **Area Filtering** - Sky-blue area chips + checkboxes; ?area= URL params; only shown when >1 region
✅ **French Species Pack** - 24 French species (birds, mammals, trees, plants, butterflies), English text, {en, fr} names
✅ **Multilingual CommonName** - `common_name: string | {en, fr?, ...}` polymorphic type; getCommonName() + getAltNames() helpers; FR: name displayed below scientific name in SpeciesCard
✅ **Species List** - 167 species + 50+ taxonomic groups, keystone badges + Ecoregion 5 expansion
✅ **Species Card** - Full detail view with photo, tags (linkable), relationships
✅ **Relationships** - Grouped by symbiosis type, obligate pinned top
✅ **Navigation** - List ↔ Detail pages, click-through relationships
✅ **Diagram Depths** - Detail page (depth-1), full diagram (depth-2)
✅ **Mobile Responsive** - Works on tablets, phones, desktops
✅ **Offline** - HashRouter, zero external APIs, fully local
✅ **Life List** - Sighting logging, familiarity tiers, Zustand persist store
✅ **Calendar View** - Month grid with tier-colored sighting dots, day detail popup
✅ **Stats Panel** - Tier distribution, monthly sightings chart, top-5 species
✅ **Tier Selector** - 4-tier buttons (Noticed → Familiar → Know It Well → Steward) on DetailPage
✅ **Sighting Modal** - Date/location/notes/conditions form; stays open for batch logging
✅ **Life List Page** - /life-list route with All / By Tier / Calendar / Stats tabs
✅ **Salamander Pack Expansion** - Added Eastern Red-backed (Plethodon cinereus) and Northern Red (Pseudotriton ruber) salamanders with full ecological data and verified images
✅ **Image Validation** - All 86 species in 0-base pack have verified Wikipedia Commons images; fetch-images tool with --check mode for CI/CD validation
✅ **Ecological Status Taxonomy** - Four-category classification (N/NB/NNNA/I) with filter chips, Learn page section, and expandable status rows
✅ **Invasive Species Badges** - Red/amber/sky color-coded badges; clickable tags link to filtered list view

## Project
Personal ecological literacy tool for NE Pennsylvania species dataset.
Helps nature hobbyists understand ecological relationships in their area.

## Tech Stack
- **React 18** + TypeScript + Vite v8.0.14
- **Styling**: TailwindCSS v4
- **Visualization**: D3.js v7+ (radial bubble tree)
- **Routing**: React Router v6 (HashRouter for offline)
- **State Management**: Zustand v5 with persist middleware (localStorage)
- **Testing**: Vitest + React Testing Library + Playwright (121 unit/component tests passing)
- **Data**: Static JSON indexed into Maps (O(1) lookups)
- **Design Tokens**: Centralized in designTokens.ts (colors, icons, labels)

## Dataset Facts
- File: app/src/data/dataset.json (merged from packs at build time)
- **Pack 0**: pack-tools/packs/0-base.json — 109 NE PA species (Ecoregion 5 Northern Forests) + 45+ taxonomic groups
  - Original: 80 species (birds, mammals, insects, plants)
  - Added June 2: 64 keystone plants from Dr. Doug Tallamy's research (trees, wildflowers, shrubs)
  - Trees: Quercus, Prunus, Betula, Populus, Acer, Malus, Pinus, etc. (445+ caterpillar species support)
  - Wildflowers: Goldenrod, Sunflower, Rudbeckia, Aster species (specialist bee plants)
  - Dual keystones: Supporting both Lepidoptera caterpillars AND specialist bees
  - Added June 5: 2 salamanders (Eastern Red-backed, Northern Red) + fixed raccoon image + 8 invasive species
  - **Invasive species** (June 5): Japanese honeysuckle, porcelainberry, oriental bittersweet, Canada thistle, multiflora rose, common periwinkle, Japanese wineberry, garlic mustard
- **Pack 1**: pack-tools/packs/1-france.json — 23 French species + 3 taxonomic groups
- **Total**: 132 individual species + 45+ taxonomic groups (note: France pack does not flag invasives)
- **Image Validation**: All 86 species in 0-base pack have verified Wikipedia Commons images (86/86 = 100%)
- **Ecological Status field**: `status?: 'nb' | 'nnna' | 'i'` on Species (default undefined = native); 8 species marked status:'i' in 0-base
- Build: `npm run build:dataset` merges packs → dataset.json; status:published packs only (draft skipped)
- Species ID format: type_common-name-slug (e.g., bird_pileated-woodpecker, tree_black-oak, plant_garlic-mustard)
- Obligate relationships marked and pinned in detail view

## Architecture

### Diagram Stack (D3-Based)
- **RelationshipBubbleTree.tsx** - Core D3 rendering component (~500 lines)
  - Manual radial positioning (not force simulation)
  - Focal species at center, depth-1 in circle, depth-2+ radiating out
  - Form-based node coloring (bird, plant, insect, mammal, amphibian, reptile)
  - Text wrapping with balanced algorithm
  - Legend with compact 2-line format
  - Zoom/pan only on full diagram (depth-2+)

- **bubbleTreeUtils.ts** - Data transformation + utilities
  - transformToNodesEdges() - Converts data to flat nodes/edges model
  - BFS depth calculation from focal species
  - Filtered connections (forward edges only, no redundant links)
  - Color functions, sizing by depth, link stroke width

- **SpeciesBubbleTree.tsx** - React wrapper for D3 component
  - Props: focalId, data, maxDepth, onNodeClick, optional dimensions
  - Wraps RelationshipBubbleTree with minimal overhead

### Integration Points
- **DiagramCard.tsx** - Embedded in species detail page
  - maxDepth={1} → Shows focal + immediate neighbors only
  - Height: 550px, responsive width
  
- **RelationshipDiagramPage.tsx** - Full-page diagram view
  - maxDepth={2} → Shows focal + 2 hops of relationships
  - Filtered connections (only edges touching focal species)
  - Header text, legend, zoom/pan enabled

### Data Flow
```
dataset.json (62KB, pack format)
    ↓
data/index.ts (loads + indexes into Maps)
    ↓
useDataset() hook (returns speciesById, symbiosisBySpeciesId)
    ↓
SpeciesBubbleTree wrapper
    ↓
transformToNodesEdges() (BFS, filters, calculates depth)
    ↓
RelationshipBubbleTree renders with D3 (SVG)
```

## Code Quality

### Refactoring Work (Completed)
1. **Dead Code Removal** - Removed ~70 lines of unused functions
   - buildBubbleTreeHierarchy() - Old 3-tier model no longer needed
   - categoryLabel(), getNodeRadius(), getNodeOpacity(), getLabelSize(), getLabelWeight()

2. **Helper Extraction** - Improved maintainability
   - calculateLinkEndpoints() - Pre-calculates all link endpoints (eliminates 4x computation)
   - renderLegendSection() - Factory function for legend (handles forms + relationships)

3. **Test Updates** - All 98 tests passing
   - Updated assertions for nodes/edges model
   - CSS class selectors for element identification
   - Form colors, node sizing, link filtering tests

### Key Decisions
- **D3 over Cytoscape** - Custom layout, better performance, form-based colors
- **Flat nodes/edges model** - Clearer than hierarchy, easier filtering
- **Manual radial layout** - Deterministic, reproducible, fast
- **Depth-1 on detail, depth-2 on full** - Contextual info vs. broader scope
- **Forward edges only** - Prevents redundant connections
- **Form-based colors** - More intuitive than relationship-type colors
- **Balanced text wrapping** - Better visual hierarchy, less truncation
- **Compact legend** - Saves space, maintains focus

## Conventions (Established)

**Component files**: PascalCase TSX in src/components/
**Hooks**: camelCase with use prefix in src/hooks/
**Utilities**: camelCase functions in src/lib/
**Types**: all in src/types/index.ts
**Data**: indexed in src/data/index.ts (Maps for O(1) lookup)
**Tailwind**: layout → spacing → color → typography order
**Tests**: mirrored file structure with *.test.tsx or *.spec.ts

## Future Phases (Reference)

### Phase 2: Sighting Logging ✅ COMPLETE (May 30, 2026)
- Zustand store with localStorage persist (key: `living-patch-life-list-v1`)
- Sighting logging via SightingModal (date, location, notes, weather/time)
- 4 familiarity tiers: noticed → familiar → know-it-well → steward
- Life List page (/life-list): All / By Tier / Calendar / Stats tabs
- Tier badges + sighting counts on SpeciesTile; tier selector + recent sightings on SpeciesCard
- LifeListStats summary bar on HomePage

### Phase 3: Multi-Region ✅ COMPLETE (June 1, 2026)
- Pack management, runtime toggling, /packs page
- French species pack (1-france.json)
- Area-based list filtering (?area= URL params)
- Multilingual CommonName type ({en, fr} objects)
- Alt-name display (FR: ...) in SpeciesCard
- `getCommonName()` / `getAltNames()` helpers in labels.ts — defensive against undefined (taxonomic groups)

### Phase 3.5: Ecoregion 5 Keystone Plants Expansion ✅ COMPLETE (June 2, 2026)
- **Source**: NW-FGF Keystone Plant List - Ecoregion 5 Northern Forests (Dr. Doug Tallamy, University of Delaware)
- **Added 64 species** across 35+ genera (trees, shrubs, wildflowers)
- **Phase 1 - Trees & Shrubs (26 species)**: Quercus velutina, Prunus americana, Betula spp., Populus spp., etc.
  - Focus: Maximum caterpillar support (445+ species for oaks, 409+ for plums, 385+ for birches)
- **Phase 2 - High-Value Wildflowers (16 species)**: Goldenrod, Helianthus, Rudbeckia, Coreopsis, etc.
  - Focus: Specialist bee plants + caterpillar host plants (dual keystones)
- **Phase 3 - Additional Plants (22 species)**: Vaccinium, Salix, Viburnum, Echinacea, Ironweed, etc.
  - Focus: Completing Top-30 genera coverage + specialist bee forage plants
- **Keystone Types**: host_plant_lepidoptera (34 species) + specialist_bee_forage (17) + dual_keystone (13)
- **Document**: ECOREGION5_ANALYSIS.md (gap assessment + implementation roadmap)
- **Tests Updated**: E2E species count assertions (104 → 169 total with both packs)

### Phase 3.6: Salamander Expansion & Image Validation ✅ COMPLETE (June 5, 2026)
- **Added Salamanders**: Eastern Red-backed (Plethodon cinereus) + Northern Red (Pseudotriton ruber)
  - Eastern Red-backed: Fossorial, direct development (no aquatic stage), year-round forest floor dweller
  - Northern Red: Aquatic/semi-aquatic, 1-2 year larval stage, cold stream specialist, aposematic (warning) colors
- **Image Fixes**: Updated raccoon image from broken Wikimedia URL to verified Central Park photograph
- **Tool Enhancement**: Added `--check` mode to fetch-images CLI for read-only image validation
  - `npm run fetch-images -- packs/0-base.json --check` - Validates without modifying pack
  - Perfect for CI/CD pipelines to verify image integrity
  - Results: 86/86 species (100%) have verified Wikipedia Commons images

### Phase 3.7: Invasive Species Annotations ✅ COMPLETE (June 5, 2026)
- **Data Model**: Added `invasive?: boolean` field to `Species` type (default false)
- **8 Invasive Species Added to 0-base** (northeast_pa region):
  1. **Japanese Honeysuckle** (Lonicera japonica) — vine, smothers native shrubs
  2. **Porcelainberry** (Ampelopsis glandulosa var. brevipedunculata) — vine, mimics native grape, forms dense carpets
  3. **Oriental Bittersweet** (Celastrus orbiculatus) — vine, girdles and strangles trees
  4. **Canada Thistle** (Cirsium arvense) — wildflower, rhizome spreader, forms monocultures
  5. **Multiflora Rose** (Rosa multiflora) — shrub, 500k seeds/year, impenetrable thickets
  6. **Common Periwinkle** (Vinca minor) — wildflower, mats out spring ephemerals
  7. **Japanese Wineberry** (Rubus phoenicolasius) — shrub, displaces native Rubus
  8. **Garlic Mustard** (Alliaria petiolata) — wildflower, allelopathic to mycorrhizal fungi
- **Each entry**: Full species record with ecological impact in `functional_description` (e.g., "outcompetes native shrubs", "forms dense monocultures")

### Phase 3.8: Ecological Status Taxonomy ✅ COMPLETE (June 5, 2026)
- **Data Model Refactor**: Changed `invasive?: boolean` → `status?: 'nb' | 'nnna' | 'i'` enum
- **Four-Category Taxonomy**:
  - **N (Native, default)**: undefined status — species evolved in region, no action needed
  - **NB (Native Bully)**: `status: 'nb'` — native species spreading aggressively, outcompeting other natives (e.g., some willows, dogwoods)
  - **NNNA (Non-Native Non-Aggressive)**: `status: 'nnna'` — introduced by humans but not spreading, low ecological threat (e.g., forget-me-not, cultivated ornamentals)
  - **I (Invasive)**: `status: 'i'` — non-native AND spreading aggressively/causing damage (all 8 current invasive species)
- **UI Integration**: 
  - New `EcologicalStatusBadge` component with red (invasive), amber (bully), sky (non-native) color scheme
  - `QuickFilterBar` + `FilterPanel` chips/checkboxes for filtering by status
  - `TagRow` badges on detail page link to filtered list view with `?ecological_status=` URL param
  - New `EcologicalStatusSection` on Learn page with expandable rows per status
- **Data Migration**: All 8 previously-invasive species updated from `invasive: true` to `status: "i"` in 0-base.json
- **Design Tokens**: Added ECOLOGICAL_STATUS_LABELS, ECOLOGICAL_STATUS_COLORS, ECOLOGICAL_STATUS_DESCRIPTIONS
- **Zod Schema**: Updated pack-tools validation to accept `status: z.enum(['nb', 'nnna', 'i']).optional()`

### Future Plans
- **Fetch-names CLI** (plan-fetch-names.md): Wikipedia langlinks API to auto-populate language keys in common_name objects
- **Ecoregion 6-9 expansions** (when keystone plant lists available)
- **Add native bully species** (Phase 3.9): Populate `status: 'nb'` with regionally-aggressive natives (e.g., some Salix, Cornus species)
- **Add non-native non-aggressive species** (Phase 3.10): Populate `status: 'nnna'` with localized non-native species

### Phase 4: Advanced Visualization (4-6 weeks)
- Alternative views (grid, timeline, network)
- Relationship strength indicators
- Seasonal activity timelines
- Habitat similarity graphs

### Phase 5: Social & Sharing (6-8 weeks)
- Share observations/lists
- Community contributions
- Photo uploads
- Export functionality

## Next Steps for Developer (Current)
1. **Add native bully species** — Identify regionally-aggressive natives (Salix, Cornus spp.) and update with `status: 'nb'` (Phase 3.9)
2. **Add non-native non-aggressive species** — Find localized non-native species (e.g., forget-me-not cultivars) and mark `status: 'nnna'` (Phase 3.10)
3. **Add Allergen/Reproduction Data** — Plant trait expansion (Phase 2 on roadmap)
4. **Organism Type Preferences** — Toggle display of Mammals/Birds/Plants/etc (Phase 8 on roadmap)
5. **Dynamic Pack Loading** — Fetch packs on demand without restart (Phase 9 on roadmap)

## Quick Reference
1. Run `npm run dev` in root → http://localhost:5174/
2. Search "milkweed", "monarch", "invasive" (8 new invasives in 0-base)
3. Use filters: form, season, habitat, area (multi-region aware)
4. Click species → see detail with diagram, life list tier selector
5. /life-list page → track sightings, filter by tier, calendar view
6. /packs page → toggle packs at runtime
7. Run tests: `npm run test` (121 unit + 95 E2E)
8. Build: `npm run build` (~200ms)

## Important Files

| File | Purpose |
|------|---------|
| app/src/components/RelationshipBubbleTree.tsx | D3 radial bubble tree component |
| app/src/components/SpeciesBubbleTree.tsx | React wrapper |
| app/src/lib/bubbleTreeUtils.ts | Data transformation + styling utils |
| app/src/lib/designTokens.ts | Colors, icons, labels (single source of truth) |
| app/src/lib/labels.ts | Label functions + formatters (imports from designTokens) |
| app/src/data/dataset.json | Complete dataset (~62KB) |
| app/src/data/index.ts | Dataset loading + indexing |
| app/src/hooks/useDataset.ts | Data access hook |
| REFACTORING_ANALYSIS.md | Ongoing refactoring guide (living document) |
| /memories/repo/livingpatch-codebase-architecture.md | Detailed architecture doc |
