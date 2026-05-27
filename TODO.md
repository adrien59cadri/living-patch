# LivingPatch — Active Todo

## Current Sprint
- [x] D3 Radial Bubble Tree Implementation
- [x] Diagram Refactoring (dead code removal, helper extraction)
- [x] All Tests Passing (98 tests)
- [x] Code Quality Review & Cleanup
- [x] Memory & Documentation Update

---

## MVP Phase 1: Dataset Explorer (✅ COMPLETE)

### Setup
- [x] Git repo + initial commit
- [x] Vite + React 18 + TypeScript scaffold
- [x] TailwindCSS + React Router setup
- [x] Dataset loading + indexing
- [x] Directory structure

### Data & Types
- [x] TypeScript interfaces (Species, Symbiosis, Relations, LifeStage)
- [x] useDataset hook with O(1) lookups
- [x] Relationship queries (getRelatedEntries, groupByRole)
- [x] Filtering logic (filterSpecies)
- [x] Label utilities

### Core Components
- [x] SearchBar (debounced text input)
- [x] FilterPanel (form/season/habitat filters)
- [x] SpeciesList (filtered list view)
- [x] SpeciesCard (full detail view)
- [x] RelationshipsPanel (grouped relationships)
- [x] RelationshipTile (tappable tiles)
- [x] LifeStageRow (month ranges)
- [x] KeystoneBadge (visual indicator)

### Pages & Routing
- [x] HashRouter setup
- [x] HomePage (search + filter + list)
- [x] DetailPage (species detail by :id)
- [x] Navigation + routing

### Polish
- [x] TailwindCSS theme (emerald/stone/amber)
- [x] Mobile-first responsive layout
- [x] Smooth transitions
- [x] Accessibility (semantic HTML, aria labels)
- [x] TypeScript strict mode

---

## D3 Diagram Implementation Phase (✅ COMPLETE)

### Visualization Replacement
- [x] Replace Cytoscape with D3.js
- [x] Implement radial bubble tree layout
- [x] Form-based node coloring
- [x] Manual positioning (not force simulation)
- [x] BFS depth calculation
- [x] Filter connections (forward edges only)

### Visual Features
- [x] Text wrapping with balanced algorithm
- [x] Proper SVG text positioning (tspan support)
- [x] Link endpoint adjustment (node edge touching)
- [x] Rendering order (nodes above links)
- [x] Legend rendering (compact, dynamic spacing)
- [x] Hover effects + cursors
- [x] Zoom/pan (full diagram only)

### Depth & Filtering
- [x] Species detail: depth-1 only (focal + neighbors)
- [x] Full diagram: depth-2 (focal + 2 hops)
- [x] Filtered connections (no redundant links)
- [x] Proper type signatures (maxDepth prop)

### Testing
- [x] Update tests for nodes/edges model
- [x] Test form colors
- [x] Test node sizing by depth
- [x] Test link filtering
- [x] 98 tests passing
- [x] CSS class selectors for element identification

---

## Code Refactoring Phase (✅ COMPLETE)

### Dead Code Removal (Refactoring 1)
- [x] Removed buildBubbleTreeHierarchy()
- [x] Removed categoryLabel()
- [x] Removed getNodeRadius()
- [x] Removed getNodeOpacity()
- [x] Removed getLabelSize()
- [x] Removed getLabelWeight()
- [x] Updated tests accordingly
- [x] Verified no external dependencies

### Helper Extraction (Refactoring 2)
- [x] Extracted calculateLinkEndpoints()
- [x] Pre-calculates direction vectors
- [x] Eliminates 4x computation during rendering
- [x] Single source of truth for math

### Legend Refactoring (Refactoring 3)
- [x] Extracted renderLegendSection()
- [x] Factory function for forms + relationships
- [x] Dynamic color derivation
- [x] Dynamic spacing based on text length
- [x] Cleaner code, less duplication

---

## Pending Refactorings (Not Blocking MVP)

1. [ ] Consolidate depth-based styling
2. [ ] Extract SVG path rendering
3. [ ] Simplify node position calculations
4. [ ] Memoize text wrapping
5. [ ] Extract test fixtures
6. [ ] Improve hover effects
7. [ ] Extract zoom/pan configuration
8. [ ] Add performance monitoring

---

## Phase 2: Sighting Logging (Future)

- [ ] localStorage setup
- [ ] Add sighting log feature
- [ ] Life list tracking
- [ ] Familiarity tiers
- [ ] Calendar view

---

## Phase 3: Multiple Locations (Future)

- [ ] Area/region selection
- [ ] Area-specific species filtering
- [ ] Comparison views
- [ ] Location persistence

---

## Phase 4: Advanced Visualization (Future)

- [ ] Alternative view options
- [ ] Strength indicators
- [ ] Seasonal timelines
- [ ] Habitat similarity graphs

---

## Status: ✅ MVP READY
All Phase 1 + D3 diagram + refactoring work complete.
Ready for public demo or Phase 2 sighting logging.

