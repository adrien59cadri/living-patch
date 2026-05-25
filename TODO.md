# LivingPatch MVP — Todo

## In Progress
_Nothing in progress yet_

---

## Phase 1: Setup
- [x] Init git repo + first commit
- [x] Scaffold Vite + React + TypeScript (`npm create vite@latest`)
- [x] Install TailwindCSS + React Router
- [x] Copy dataset.json to `src/data/`
- [x] Create directory structure (components, pages, types, hooks, lib)

## Phase 2: Data & Types
- [x] TypeScript interfaces in `src/types/index.ts`
- [x] `src/data/index.ts`: load JSON, build lookup maps (speciesById, symbiosisBySpeciesId, relationsBySpeciesId)
- [x] `useDataset` hook: thin wrapper over data module
- [x] `relationships.ts`: `getRelatedEntries()`, `groupByRole()`
- [x] `filters.ts`: `filterSpecies()` by form/season/habitat + text
- [x] `labels.ts`: human-readable labels for all tag types

## Phase 3: Components
- [x] `SearchBar` — debounced text input
- [x] `FilterPanel` — form, season, habitat chip filters
- [x] `SpeciesList` — list with keystone badge, groups lighter
- [x] `SpeciesCard` — full detail view
- [x] `RelationshipsPanel` — sections per symbiosis type, obligate pinned, max 6 + collapse
- [x] `RelationshipTile` — tappable tile → species card (groups non-navigable)
- [x] `LifeStageRow` — icons + month ranges
- [x] `KeystoneBadge` — visual badge for keystone species

## Phase 4: Pages & Routing
- [x] HashRouter routes in `App.tsx` (HashRouter for offline use)
- [x] `HomePage` — search + filter + list
- [x] `DetailPage` — species card by `:id` param
- [x] App layout — sticky header + footer
- [x] Back navigation (← All species)

## Phase 5: Polish
- [x] TailwindCSS theme (stone/emerald/amber palette)
- [x] Mobile-first responsive layout (sm/lg breakpoints)
- [x] Truncation on list (line-clamp-2)
- [x] Smooth transitions between views
- [x] Accessibility (aria-label, semantic HTML, keyboard nav)

## Verification & Launch
- [x] Text search full-text across name, description, tags
- [x] Filters work individually and combined
- [x] Species card renders all fields (name, description, tags, life stages, relationships)
- [x] RelationshipsPanel groups by type; obligate entries pinned at top
- [x] Navigation: list ↔ detail ↔ related species works
- [x] No TypeScript errors
- [x] App runs: `npm run dev` → http://localhost:5174/
- [x] Zero network requests (fully offline)
- [x] HashRouter for file-based/offline use
- [x] All 30+ species + 8 groups indexed and searchable
- [x] 50+ relationships loaded and grouped correctly

## Status: ✅ MVP COMPLETE
Full Phase 1 dataset explorer is live and ready for demo.

