# LivingPatch — Development Memory

## Project Status: ✅ MVP COMPLETE
Full Phase 1 (Dataset Explorer with D3 Diagram) implemented, tested, and refactored.
- **Live**: http://localhost:5174/ (run `npm run dev` in root)
- **Build**: 160ms, 625 modules
- **Tests**: 98 passing across 9 test files
- **Git**: Commits tracked, latest: refactoring work complete

## What Works
✅ **D3 Radial Bubble Tree** - Interactive species relationship diagram
✅ **Search** - Full-text across common_name, latin_name, description
✅ **Filters** - Form, season, habitat (multi-select, combinable)
✅ **Species List** - 30+ species + 8 groups, keystone badges
✅ **Species Card** - Full detail view with photo, tags, relationships
✅ **Relationships** - Grouped by symbiosis type, obligate pinned top
✅ **Navigation** - List ↔ Detail pages, click-through relationships
✅ **Diagram Depths** - Detail page (depth-1), full diagram (depth-2)
✅ **Mobile Responsive** - Works on tablets, phones, desktops
✅ **Offline** - HashRouter, zero external APIs, fully local

## Project
Personal ecological literacy tool for NE Pennsylvania species dataset.
Helps nature hobbyists understand ecological relationships in their area.

## Tech Stack
- **React 18** + TypeScript + Vite v8.0.14
- **Styling**: TailwindCSS v4
- **Visualization**: D3.js v7+ (radial bubble tree)
- **Routing**: React Router v6 (HashRouter for offline)
- **Testing**: Vitest + React Testing Library + Playwright
- **Data**: Static JSON indexed into Maps (O(1) lookups)

## Dataset Facts
- File: app/src/data/dataset.json (62KB, 1923 lines)
- ~30 individual species + ~8 group entries
- ~50 symbiosis entries (mutualism, parasitism, predation, competition, commensalism)
- ~8 taxonomic relations
- Species ID format: type_common-name-slug (e.g., bird_pileated-woodpecker)
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

### Phase 2: Sighting Logging (2-3 weeks)
- localStorage for observation logging
- Life list tracking
- Familiarity/expertise tiers
- Calendar view of sightings

### Phase 3: Multiple Locations (3-4 weeks)
- Area/region selection
- Area-specific species filtering
- Comparison between locations

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

## Next Steps for Developer
1. Run `npm run dev` in root → http://localhost:5174/
2. Search "milkweed", "bird", "monarch"
3. Use filters: form, season, habitat (combinable with search)
4. Click species → see detail with diagram
5. Click related species to drill down
6. Full diagram page shows more context (depth-2)
7. Inspect code in RelationshipBubbleTree.tsx for D3 implementation
8. Run tests: `npm run test` (98 passing)
9. Build: `npm run build` (160ms)

## Important Files

| File | Purpose |
|------|---------|
| app/src/components/RelationshipBubbleTree.tsx | D3 radial bubble tree component |
| app/src/components/SpeciesBubbleTree.tsx | React wrapper |
| app/src/lib/bubbleTreeUtils.ts | Data transformation + styling utils |
| app/src/data/dataset.json | Complete dataset (62KB) |
| app/src/data/index.ts | Dataset loading + indexing |
| app/src/hooks/useDataset.ts | Data access hook |
| REFACTORING_ANALYSIS.md | Complete refactoring opportunities analysis |
| /memories/repo/livingpatch-codebase-architecture.md | Detailed architecture doc |
