# 🌿 LivingPatch MVP — Dataset Explorer

A personal ecological literacy tool for exploring NE Pennsylvania species and their relationships. **Phase 1 (MVP)**: read-only local webapp — no server, no accounts, fully offline.

**🚀 Live Demo**: https://adrien59cadri.github.io/living-patch/

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
npm run test       # Run 121 unit tests (Vitest + React Testing Library)
npm run test:e2e   # Run 21 E2E tests (Playwright)
```

## Features

✨ **Search**: Full-text across species name, description, and tags  
🔍 **Filter**: Form, season, habitat (multi-select, combinable)  
🦅 **Species Cards**: Detail view with functional description, life stages, keystone roles  
🔗 **Key Relationships**: Pinned obligate symbiosis (e.g., Monarch ↔ Milkweed)  
🌍 **Neighbors Grid**: Category-based drill-down (Birds, Plants, Insects, Wildlife, Related)  
📱 **Responsive**: Mobile-first design  
⚡ **Offline**: Zero network requests, fully local  
✅ **Tested**: 121 unit tests + 21 E2E tests, GitHub Actions CI/CD  

## What's Included

- **56 species** + 9 taxonomic groups
- **66 symbiosis entries** + 3 general relations
- **Full-text search** across name, description, all tags
- **Multi-select filters** (form, season, habitat — combinable)
- **Species detail page** with 8 sections:
  - Hero photo, name, tags, description, keystone callout, life stages
  - **Key Relationship** tile (pinned obligate symbiosis)
  - **Neighbors Grid** (category-based drill-down by type)
  - Log Sighting button (opens the Life List sighting workflow)
- **121 unit tests** (Vitest + React Testing Library)
- **21 E2E tests** (Playwright, full user workflows)
- **GitHub Actions CI/CD** (lint → type-check → test → build → E2E → deploy to Pages)

## Data Packs System

The app uses a **data pack system** with versioned JSON files in [`pack-tools/packs/`](pack-tools/packs/). The production dataset is currently consolidated into a single published pack: `0-base.json`.

### Pack Status

Each pack has a `status` field:
- **`"published"`**: Reviewed and approved. Always loaded by the app.
- **`"draft"`**: Work-in-progress. Only loaded when explicitly enabled via `VITE_INCLUDE_DRAFT_PACKS=true`.

### Available Packs

- **`0-base.json`** (published): Core LivingPatch dataset with NE Pennsylvania species, taxonomic groups, symbiosis relationships, and relations

### Creating and Contributing a Pack

1. **Create** a new pack JSON file in `pack-tools/packs/` (copying structure from `0-base.json` metadata/data layout)
2. **Validate** your pack locally:
   ```bash
   npm run pack:validate packs/my-pack.json
   ```
3. **Add images** (optional but recommended):
   ```bash
   npm run pack:fetch-images packs/my-pack.json --merge
   ```
   See [Image Validation Workflow](#image-validation-workflow) below for details.
4. **Test** by merging with base:
   ```bash
   npm run pack:merge packs/0-base.json packs/my-pack.json
   ```
5. **Mark as draft** while under review (set `"status": "draft"` in metadata)
6. **Submit** via pull request — reviewers will validate and approve

### Image Validation Workflow

When your pack has species but no images, validation shows warnings. Use the fetch-images CLI to automatically add Wikipedia images to your pack:

```bash
npm run pack:fetch-images packs/my-pack.json --merge
```

This command:
- Searches Wikipedia for images (tries scientific name, then common name)
- Extracts Wikimedia Commons URLs and author info
- Merges images directly into your pack file
- Shows progress (successful, failed, skipped)

**Full workflow documentation**: See [Image Validation Workflow](pack-tools/README.md#image-validation-workflow) in the pack-tools README.
6. **Change to published** once approved (set `"status": "published"`)

See [`pack-tools/README.md`](pack-tools/README.md) for full pack format documentation and [`pack-tools/.instructions.md`](pack-tools/.instructions.md) for pack creation guidelines.

### For Developers: Pack CLI Tools

```bash
# Validate a single pack
npm run pack:validate packs/my-pack.json

# Preview merging multiple packs (skip drafts by default)
npm run pack:merge packs/0-base.json packs/custom.json

# Include draft packs in merge preview
npm run pack:merge packs/0-base.json packs/draft.json --include-drafts

# Migrate existing dataset to pack format
npm run pack:migrate
```

### Environment Variables

To load draft packs during development:
```bash
# Start dev server with draft packs enabled
VITE_INCLUDE_DRAFT_PACKS=true npm run dev

# Build with draft packs included
VITE_INCLUDE_DRAFT_PACKS=true npm run build
```

(App integration for loading packs from pack-tools directory is planned for Phase 2)

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

**Unit tests (121 passing):**
```bash
npm run test
```
- `src/lib/__tests__/` — Relationship utilities, label formatting
- `src/components/__tests__/` — SpeciesCard, all UI sections
- `src/pages/__tests__/` — DetailPage, NeighborListView, navigation

**E2E tests (21 passing):**
```bash
npm run test:e2e
```
- Species page render, keystone badge, latin name toggle
- Life stages, key relationship, neighbors grid display
- Neighbor drill-down navigation and back link
- Edge cases (invalid species/category)

## CI/CD

Two workflows:
- **CI** (`.github/workflows/ci.yml`): Runs on every push and pull request
  1. **`ci` job**: Lint → TypeScript check → Unit tests → Build
  2. **`e2e` job**: Playwright tests (after `ci` passes)
- **Deploy** (`.github/workflows/deploy.yml`): Auto-triggers after CI passes on `main` branch
  - Downloads build artifact and deploys to GitHub Pages

To enable Pages deployment: Repo Settings → Pages → Source → "GitHub Actions"

### Run CI locally

Test the CI pipeline locally before pushing using `act` (GitHub Actions simulator):

```bash
npm run ci:local    # Run CI job (lint → type-check → test → build)
npm run e2e:local   # Run E2E tests
```

**Setup:** `brew install act` + Docker Desktop running. Install Docker from [docker.com](https://www.docker.com/products/docker-desktop).

**Note:** Artifact upload fails locally (expected) — doesn't affect linting, type-checking, testing, or building.

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
npm run build:dataset  # Generate app/src/data/dataset.json from packs
npm run build          # Build: auto-generates dataset, then builds app → app/dist/
npm run preview        # Serve app/dist/ locally on :4173
```

The `npm run build` command automatically:
1. Merges all published packs from `pack-tools/packs/`
2. Generates `app/src/data/dataset.json`
3. Builds the app with TypeScript checking and Vite optimization

To include draft packs during build:
```bash
INCLUDE_DRAFTS=true npm run build
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
