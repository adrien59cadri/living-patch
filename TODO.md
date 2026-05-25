# LivingPatch MVP — Todo

## In Progress
_Nothing in progress yet_

---

## Phase 1: Setup
- [ ] Init git repo + first commit
- [ ] Scaffold Vite + React + TypeScript (`npm create vite@latest`)
- [ ] Install TailwindCSS + React Router
- [ ] Copy dataset.json to `src/data/`
- [ ] Create directory structure (components, pages, types, hooks, lib)

## Phase 2: Data & Types
- [ ] TypeScript interfaces in `src/types/index.ts`
- [ ] `useDataset` hook: load JSON, build lookup maps
- [ ] `relationships.ts`: `getRelatedSpecies()`, `groupByType()`
- [ ] `filters.ts`: `filterSpecies()` by form/season/habitat + text

## Phase 3: Components
- [ ] `SearchBar` — debounced text input
- [ ] `FilterPanel` — form, season, habitat filters
- [ ] `SpeciesList` — grid/list with keystone badge, groups lighter
- [ ] `SpeciesCard` — full detail view
- [ ] `RelationshipsPanel` — sections per symbiosis type, obligate pinned, max 6 + collapse
- [ ] `RelationshipTile` — tappable tile → species card
- [ ] `LifeStageRow` — icons + month ranges
- [ ] `KeystoneBadge` — visual badge for keystone species

## Phase 4: Pages & Routing
- [ ] React Router routes in `App.tsx`
- [ ] `HomePage` — search + filter + list
- [ ] `DetailPage` — species card by `:id` param
- [ ] App layout — header + footer
- [ ] Back navigation

## Phase 5: Polish
- [ ] TailwindCSS theme tokens
- [ ] Mobile-first responsive layout
- [ ] Transitions between list and detail
- [ ] Accessibility pass (focus, aria labels, keyboard nav)

## Verification
- [ ] Text search returns correct results (e.g., "milkweed" matches 3+ species)
- [ ] Filters work individually and combined
- [ ] Species card renders all fields
- [ ] RelationshipsPanel groups correctly; obligate entries at top
- [ ] Navigation: list → detail → related species → back
- [ ] No browser console errors
- [ ] No network requests (DevTools offline mode works)
