# LivingPatch MVP — Dev Memory

## Project Status: ✅ COMPLETE
MVP Phase 1 (Dataset Explorer) fully implemented and running.
- **Live**: http://localhost:5174/ (run `npm run dev` in `app/` directory)
- **Dev server**: Vite on port 5174 (5173 was in use)
- **Zero TypeScript errors**
- **Zero network requests** (fully offline)

## What Works
✅ **Search**: Full-text across common_name, latin_name, functional_description, all tags
✅ **Filters**: Form, season, habitat (multi-select, combinable with search)
✅ **Species list**: 30+ species + 8 groups, keystone badges, groups lighter styling
✅ **Species card**: Full detail view with photo placeholder, description, tags, life stages, keystone callout
✅ **Relationships**: Grouped by symbiosis type, obligate pinned top, max-6 per section with "show more"
✅ **Navigation**: List ↔ Detail pages, back navigation, click related species to drill down
✅ **Mobile**: Responsive layout (sm: tablets, lg: desktop)
✅ **Offline**: HashRouter, no external APIs, works fully offline

## Project
- Personal ecological literacy tool — NE Pennsylvania species dataset explorer
- Phase 1: read-only webapp, no backend, no accounts

## Tech Stack
- React 18 + TypeScript + Vite + TailwindCSS v4
- React Router v6 (HashRouter for offline use)
- State: React hooks only
- Data: Static JSON, indexed into Maps (O(1) lookups)

## Dataset Facts
- File: `app/src/data/dataset.json` (62KB, 1923 lines)
- Arrays: `species`, `symbiosis`, `relations`, `life_stages_phenology`
- ~30 individual species + ~8 group entries (`is_group: true`)
- ~50 symbiosis entries, ~8 relation entries
- Species ID format: `type_common-name-slug` (e.g. `bird_pileated-woodpecker`)
- Symbiosis types: mutualism, parasitism, predation, competition, commensalism
- Obligate relationships (`obligate: true`) pinned top of their section
- Groups are NOT navigable; show with lighter visual treatment in list

## Key Design Decisions
- Search: full-text across common_name, latin_name, functional_description, tags
- Filters: form · season · habitat (multi-select, combinable with search)
- RelationshipsPanel: sections = [Mutualism, Parasitism/Host, Predation, Related species]
- Max 6 tiles per section; "show more" to expand overflow
- No photo or sound ID — photo area is placeholder only
- Latin name collapsed by default on species card
- No external API calls ever (offline-first)
- Color palette: stone (neutrals), emerald (primary), amber (keystone)

## Implementation Checklist (All Complete)
✅ TypeScript interfaces (src/types/index.ts)
✅ Data loading + indexing (src/data/index.ts)
✅ useDataset hook (src/hooks/useDataset.ts)
✅ Relationship grouping (src/lib/relationships.ts)
✅ Filtering logic (src/lib/filters.ts)
✅ Label utilities (src/lib/labels.ts)
✅ 8 components (SearchBar, FilterPanel, SpeciesList, SpeciesCard, RelationshipsPanel, RelationshipTile, LifeStageRow, KeystoneBadge)
✅ 2 pages (HomePage, DetailPage)
✅ App routing + layout
✅ Styling (Tailwind v4)
✅ Git history with clear commits

## Conventions (Established)
- Component files: PascalCase TSX in `src/components/`
- Hooks: camelCase with `use` prefix in `src/hooks/`
- Utilities: camelCase functions in `src/lib/`
- Types: all in `src/types/index.ts`
- Tailwind class order: layout → spacing → color → typography

## Phases (Future)
- Phase 2: sighting logging (localStorage), life list, familiarity tiers
- Phase 3: multiple locations (areas), area-based species views
- PWA / React Native: keep data layer clean for portability

## Next Steps for User
1. Open http://localhost:5174/ in browser (dev server running)
2. Try search: "milkweed", "bird", "monarch"
3. Try filters: select "butterfly" + "summer"
4. Click a species → see detail card
5. Scroll to relationships, click a related species
6. Open DevTools → Network tab (zero requests after initial load)
7. DevTools → Network → offline mode (app still works fully)
