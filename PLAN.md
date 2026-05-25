# LivingPatch MVP — Implementation Plan

## Vision
Personal ecological literacy tool for nature hobbyists (birders, gardeners, naturalists).
Helps people understand *why* they see what they see together — via ecological relationships.

## MVP Scope (Phase 1 — Dataset Explorer)
Browse and explore species and their ecological relationships from a curated NE Pennsylvania dataset.
No logging, no account, no server. Fully local webapp.

---

## Tech Stack
| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| State (MVP) | React hooks (useState, useMemo) |
| State (Phase 2+) | Zustand |
| Storage (Phase 2+) | localStorage |
| Backend | None |

---

## Project Structure
```
src/
  components/
    SearchBar.tsx
    FilterPanel.tsx
    SpeciesList.tsx
    SpeciesCard.tsx
    RelationshipsPanel.tsx
    RelationshipTile.tsx
    LifeStageRow.tsx
    KeystoneBadge.tsx
  pages/
    HomePage.tsx
    DetailPage.tsx
  types/
    index.ts
  data/
    dataset.json        (copied from root)
  hooks/
    useDataset.ts       (load + index dataset)
    useSpeciesSearch.ts (search + filter logic)
  lib/
    relationships.ts    (getRelatedSpecies, groupByType)
    filters.ts          (filterSpecies)
  App.tsx
  main.tsx
  index.css
```

---

## Implementation Phases

### Phase 1: Project Setup
- [x] Create PLAN.md, TODO.md, MEMORY.md
- [ ] Initialize git repo + first commit
- [ ] Scaffold Vite + React + TypeScript project
- [ ] Install TailwindCSS, React Router
- [ ] Copy dataset.json to src/data/
- [ ] Set up directory structure

### Phase 2: Data & Types
- [ ] TypeScript interfaces: Species, Symbiosis, Relations, LifeStage, Dataset
- [ ] `useDataset` hook: import JSON, build `speciesById` map, `symbiosisBySpeciesId` index
- [ ] `relationships.ts`: getRelatedSpecies, groupByType, groupByRole
- [ ] `filters.ts`: filterSpecies by form/season/habitat + text search

### Phase 3: Core Components
- [ ] SearchBar — debounced text input
- [ ] FilterPanel — form/season/habitat checkboxes
- [ ] SpeciesList — filtered list with keystone badge, groups styled lighter
- [ ] SpeciesCard — full detail view (tags, life stages, relationships)
- [ ] RelationshipsPanel — sections by symbiosis type, obligate pinned, max 6 then collapse
- [ ] RelationshipTile — tappable tile linking to species card

### Phase 4: Pages & Routing
- [ ] App.tsx with React Router routes: `/` and `/species/:id`
- [ ] HomePage: SearchBar + FilterPanel + SpeciesList
- [ ] DetailPage: load species by :id, render SpeciesCard
- [ ] App layout: header (branding + home link), minimal footer
- [ ] Back navigation from detail to list

### Phase 5: Polish
- [ ] TailwindCSS theme (greens, clean whites)
- [ ] Mobile-first responsive layout
- [ ] Keystone badge styling
- [ ] Life stage icons (emoji from dataset)
- [ ] Smooth transitions

---

## Data Notes
- Dataset has `species`, `symbiosis`, `relations`, `life_stages_phenology` arrays
- Species entries: ~30 individual + ~8 group entries (flagged with `is_group: true`)
- Groups should be shown with lighter styling; not navigable to full card
- Symbiosis types: mutualism, parasitism, predation, competition, commensalism
- Relations types: taxonomic_group (shown as "Related species" section)
- `obligate: true` relationships always pinned at top of their section
- IDs use format: `type_common-name-slug` (e.g., `plant_common-milkweed`)

---

## Out of Scope (Phase 1)
- Sighting logging and life lists
- Multiple locations / areas
- Social features
- In-app photo/sound recognition
- External API calls
- Gamification
