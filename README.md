# 🌿 LivingPatch MVP — Dataset Explorer

A personal ecological literacy tool for exploring NE Pennsylvania species and their relationships. **Phase 1 (MVP)**: read-only local webapp — no server, no accounts, fully offline.

## Quick Start

```bash
cd app
npm install        # First time setup (run once in app/ folder)
npm run dev        # Start dev server → http://localhost:5174/
```

## Development Commands

Run from the **repo root** (commands delegate to `app/` folder):

```bash
npm run dev        # Start dev server → http://localhost:5174/
npm run build      # TypeScript check + Vite build → dist/
npm run preview    # Serve dist/ locally → http://localhost:4173/
npm run lint       # Run ESLint
npm run test:run   # Run 60 unit tests (Vitest + React Testing Library)
npm run test:e2e   # Run 13 E2E tests (Playwright, requires build)
```

## Features

✨ **Search**: Full-text across species name, description, and tags  
🔍 **Filter**: Form, season, habitat (multi-select, combinable)  
🦅 **Species Cards**: Detail view with functional description, life stages, keystone roles  
🔗 **Key Relationships**: Pinned obligate symbiosis (e.g., Monarch ↔ Milkweed)  
🌍 **Neighbors Grid**: Category-based drill-down (Birds, Plants, Insects, Wildlife, Related)  
📱 **Responsive**: Mobile-first design  
⚡ **Offline**: Zero network requests, fully local  
✅ **Tested**: 60 unit tests + 13 E2E tests, GitHub Actions CI/CD  

## What's Included

- **~30 species** + 8 taxonomic groups
- **~50 symbiosis entries** + taxonomic relations
- **Full-text search** across name, description, all tags
- **Multi-select filters** (form, season, habitat — combinable)
- **Species detail page** with 8 sections:
  - Hero photo, name, tags, description, keystone callout, life stages
  - **Key Relationship** tile (pinned obligate symbiosis)
  - **Neighbors Grid** (category-based drill-down by type)
  - Log Sighting button (Phase 1 placeholder, disabled)
- **60 unit tests** (Vitest + React Testing Library)
- **13 E2E tests** (Playwright, full user workflows)
- **GitHub Actions CI/CD** (lint → type-check → test → build → E2E → deploy to Pages)

## Try These

1. **Search**: Type "milkweed" or "monarch"  
2. **Filter**: Click "butterfly" + "summer"  
3. **Species detail**: Click a species → see keystone badge, life stages, key relationship, neighbors grid
4. **Drill-down**: Click "Plants" in neighbors grid → see all plant species connected to this one
5. **Offline**: DevTools → Network → offline mode → app still works!

## Project Structure

```
app/src/
  types/
    index.ts              → TypeScript interfaces
  data/
    dataset.json          → Species + symbiosis + relations
    index.ts              → Data loading + indexing
  components/
    SpeciesCard.tsx       → Main card (8 sections per spec)
    KeyRelationshipTile.tsx
    NeighborsGrid.tsx, NeighborCategoryTile.tsx
    LogSightingButton.tsx
    SearchBar.tsx, FilterPanel.tsx, SpeciesList.tsx
  pages/
    HomePage.tsx          → Search + filter + list
    DetailPage.tsx        → Species detail
    NeighborListView.tsx  → Neighbor drill-down by category
  lib/
    filters.ts, relationships.ts, labels.ts
  test/
    setup.ts, fixtures.ts
  lib/__tests__/          → 29 unit tests
  components/__tests__/   → 15 component tests
  pages/__tests__/        → 16 page tests
e2e/
  species-detail.spec.ts  → 13 E2E tests (Playwright)
```

## Tech Stack

- **React 19** + **TypeScript 6** (strict mode)
- **Vite 8** (fast dev server & build)
- **TailwindCSS 4** (responsive styling)
- **React Router v7** (HashRouter for offline use)
- **Vitest** (unit tests)
- **Playwright** (E2E tests)
- **ESLint 10** (linting)

## Testing

**Unit tests (60 passing):**
```bash
npm run test:run
```
- `src/lib/__tests__/` — Relationship utilities, label formatting
- `src/components/__tests__/` — SpeciesCard, all UI sections
- `src/pages/__tests__/` — DetailPage, NeighborListView, navigation

**E2E tests (13 passing):**
```bash
npm run build && npm run test:e2e
```
- Species page render, keystone badge, latin name toggle
- Life stages, key relationship, neighbors grid display
- Neighbor drill-down navigation and back link
- Edge cases (invalid species/category)

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
1. **`ci` job**: Lint → TypeScript check → Unit tests → Build
2. **`e2e` job**: Playwright tests (after `ci` passes)
3. **`deploy` job**: Deploy to GitHub Pages (on `main` merge, after both pass)

To enable Pages deployment: Repo Settings → Pages → Source → "GitHub Actions"

## Documentation

- **[livingpatch-species-card-requirements.md](livingpatch-species-card-requirements.md)** — Species card UI spec
- **[livingpatch-product-definition.md](livingpatch-product-definition.md)** — Full product spec
- **[PLAN.md](PLAN.md)** — Implementation architecture
- **[TODO.md](TODO.md)** — Task checklist (MVP complete ✅)

## What's NOT Included (Phase 1)

- Sighting logging (Phase 2)
- Life lists / personal tracking (Phase 2)
- Multiple locations / areas (Phase 3)
- Photo or sound identification (out of scope)
- Social features (never)
- Accounts or server (until explicitly needed)

## Build & Deploy

```bash
npm run build     # TypeScript check + Vite build → app/dist/
npm run preview   # Serve app/dist/ locally on :4173
```

GitHub Pages deploys automatically on `main` push (via GitHub Actions).

## Verification Checklist

Unit tests:
```bash
npm run test:run  # Should show: Tests 60 passed (60)
```

E2E tests:
```bash
npm run build && npm run test:e2e  # Should show: 13 passed
```

Local demo:
1. `npm run dev` → http://localhost:5174/
2. Search "monarch" → click result → see all 8 sections of species card
3. Click "Plants" in neighbors grid → drill-down list of milkweed species
4. DevTools Network tab → offline mode → app still works

## Data Model

**Species:**
- name, latin_name, form (bird, butterfly, tree, etc.)
- habitat[], diet[], behavior[], season[]
- functional_description, life_stages[]
- is_keystone, keystone_type, keystone_description
- active_months (formatted as "May-Oct", "Jan-Dec", etc.)

**Symbiosis (relationships):**
- type: mutualism | parasitism | predation | competition | commensalism
- members: [species_id_a, species_id_b]
- obligate: true if one species requires the other
- notes: context about the relationship

**Relations (taxonomic/ecological groupings):**
- type: "taxonomic_group" (birds → other PA birds, oaks → other PA oaks, etc.)
- members: [species_id, group_id]
- notes: brief description

## Future Phases

**Phase 2**: Log sightings, personal life list, familiarity tiers  
**Phase 3**: Multiple locations, area-based ecosystem comparisons  
**PWA**: Install-to-home-screen, offline caching optimization
