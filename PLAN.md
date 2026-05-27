# LivingPatch — Current State & Future Plan

## Project Status: ✅ MVP COMPLETE (with D3 Diagrams)
MVP Phase 1 (Dataset Explorer with D3 Diagram) fully implemented and tested.
- **Live**: http://localhost:5174/ (run `npm run dev` in root)
- **Build**: Passing (160ms), 625 modules
- **Tests**: 98 passing across 9 test files
- **Git**: Main development complete, refactoring finished

## Recent Completed Work (Latest Session)

✅ **D3 Radial Bubble Tree** - Replaced Cytoscape with custom D3 visualization
✅ **Diagram Refactoring** - Removed dead code (~70 lines), extracted helpers (~100 lines saved)
✅ **Text Wrapping** - Balanced algorithm for better species name display
✅ **Legend Rendering** - Compact bottom-left legend with dynamic spacing
✅ **Depth Filtering** - Species detail (depth-1), full diagram (depth-2, filtered connections)
✅ **All Tests Passing** - 98 tests with updated assertions for nodes/edges model
✅ **Code Quality Improvements** - Better maintainability, type safety, factory functions

---

## Architecture Overview

### Frontend Stack
- **Framework**: React 18 + TypeScript (strict mode)
- **Build**: Vite v8.0.14 (tsc -b + vite build)
- **Styling**: TailwindCSS v4
- **Visualization**: D3.js v7+ (radial bubble tree, SVG-based)
- **Routing**: React Router v6 (HashRouter for offline)
- **Testing**: Vitest v4.1.7 + React Testing Library + Playwright
- **Data**: Static JSON (62KB), indexed into Maps (O(1) lookups)

### Key Components

**Diagram Stack:**
- RelationshipBubbleTree.tsx - Core D3 radial bubble tree (~500 lines, refactored)
- SpeciesBubbleTree.tsx - React wrapper
- DiagramCard.tsx - Embedded in species detail (height: 550px, depth: 1)
- RelationshipDiagramPage.tsx - Full-page diagram (depth: 2, filtered)

**Data & Utilities:**
- bubbleTreeUtils.ts - Data transformation (nodes/edges), colors, sizing
- relationships.ts - Relationship queries
- filters.ts - Search/filter logic
- data/index.ts - Dataset loading + indexing

**Other Components:**
- SpeciesCard.tsx - Species detail view
- RelationshipsPanel.tsx - Alternative grid view
- SpeciesList.tsx - Searchable list with filters

### Data Model
- **Nodes**: Flat structure with `{ id, name, form, depth }`
- **Edges**: Relationships with `{ source, target, type, obligate }`
- **Colors**: By species form (bird, plant, insect, mammal, amphibian, reptile)
- **Depth**: BFS-calculated from focal species
- **Filtering**: Connections filtered to forward edges only (prevents redundant links)

### Removed Dead Code (Refactoring 1-3 Complete)
- buildBubbleTreeHierarchy() - Old 3-tier hierarchy model
- categoryLabel(), getNodeRadius(), getNodeOpacity(), getLabelSize(), getLabelWeight()
- Extracted calculateLinkEndpoints() helper (pre-calculates link endpoints)
- Refactored renderLegendSection() factory function (dynamic color derivation)

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| D3 over Cytoscape | Custom radial layout, better performance, form-based coloring |
| Flat nodes/edges over hierarchy | Clearer data model, easier to filter, simpler to style |
| Manual radial layout | Deterministic, reproducible, predictable experience |
| Depth-1 on detail, depth-2 on full | Balance context (detail) vs. scope (full diagram) |
| Forward edges only | Prevents duplicate connections, ensures all links touch focal |
| Form-based colors | More intuitive than relationship-type colors |
| Balanced text wrapping | Better visual hierarchy, less truncation |
| Compact legend | Saves space, maintains focus on diagram |

---

## Pending Refactoring Opportunities

Identified in REFACTORING_ANALYSIS.md but deferred (not critical for MVP):

1. Consolidate depth-based styling - DRY repeated depth checks (medium effort)
2. Extract SVG path rendering - Links/legends use factory functions (medium effort)
3. Simplify node position calculations - Reduce trigonometry overhead (low effort)
4. Memoize text wrapping - Cache wrapped labels for repeated rendering (low effort)
5. Extract test fixtures - DRY up test node/edge creation (low effort)
6. Improve hover effects - Unified hover state (medium effort)
7. Extract zoom/pan configuration - Cleaner D3 event handling (low effort)
8. Add performance monitoring - Track render times/memory (low effort)

---

## Future Phases

### Phase 2: Sighting Logging
- Add sighting log feature (localStorage)
- Life list tracking
- Familiarity/expertise tiers
- Calendar view of observations
- Estimated effort: 2-3 weeks

### Phase 3: Multiple Locations
- Area/region selection
- Area-specific species filtering
- Comparison views between areas
- Estimated effort: 3-4 weeks

### Phase 4: Advanced Visualization
- Alternative views (grid, timeline, network graph)
- Relationship strength indicators
- Seasonal activity timeline
- Habitat similarity graphs
- Estimated effort: 4-6 weeks

### Phase 5: Social & Sharing
- Share observations/lists
- Community contributions
- Photo uploads
- Estimated effort: 6-8 weeks

---

## Deployment Notes
- **Offline First**: Zero external dependencies, all data bundled
- **Bundle Size**: Main app ~55KB gzipped (D3 adds ~30KB gzipped)
- **Build Command**: `npm run build` produces static dist/
- **No Backend**: Fully client-side, works on file:// or any static server
- **Mobile**: Responsive layout works on all device sizes
- **Browser Support**: Modern browsers (ES2020+)

---

## Data Notes
- Dataset: ~30 species + ~8 groups, ~50+ relationships
- File: app/src/data/dataset.json (62KB)
- Symbiosis types: mutualism, parasitism, predation, competition, commensalism
- Obligate relationships: marked with obligate: true, pinned top in detail view
- IDs format: type_common-name-slug (e.g., bird_pileated-woodpecker)
