# LivingPatch – Claude Memory Context

## Project Overview

**LivingPatch** is an ecological literacy tool for NE Pennsylvania species. It provides an interactive, filterable database of local wildlife with rich relationships: symbiosis, habitat, keystones, and now conservation status.

**Repository:** `adrien59cadri/living-patch`

### Stack
- **Frontend:** React 18 + Vite, TailwindCSS, Router, Zustand
- **Backend:** Static data packs (JSON, bundled)
- **Data tools:** TypeScript CLI for scraping Wikipedia (images, conservation status)
- **Architecture:** Modular pack system; packs can be merged, validated, and versioned independently

---

## Feature: Invasive Species Annotations (June 5, 2026)

### What was implemented

Added `invasive?: boolean` field to `Species` to flag ecological invasives by region. Eight invasive species annotated in the `0-base` pack (northeast_pa):
1. Japanese honeysuckle, porcelainberry, oriental bittersweet (vines)
2. Canada thistle, garlic mustard, common periwinkle (wildflowers)
3. Multiflora rose, Japanese wineberry (shrubs)

Each species includes full ecological context in `functional_description` (e.g., "smothers native shrubs", "allelopathic to mycorrhizal fungi").

### Key Files

#### Data Model
- **`app/src/types/index.ts`** — `invasive?: boolean` field on `Species`
- **`pack-tools/lib/schema.ts`** — Zod schema with optional `invasive` field

#### Data
- **`pack-tools/packs/0-base.json`** — 8 invasive species added (total 109 species, 45+ taxonomic groups)

### Data Model Design
```ts
interface Species {
  id: string;
  common_name: CommonName;
  latin_name?: string | null;
  form: string;                      // vine, wildflower, shrub, etc.
  region: string;                    // northeast_pa, france, etc.
  invasive?: boolean;                // true = invasive in this region; default false
  functional_description: string;    // ecological impact narrative
  // ... other fields
}
```

**Key insight**: `invasive` is regional by design. The same species (e.g., porcelainberry) appears with `invasive: true` in the PA pack but not in a hypothetical East Asia pack. No merge conflicts; each pack's truth is its own.

### Planned UI (Roadmap Phase 4)
- **Invasive Species page** — Top-level nav entry
- **Region picker** — Collects unique `region` values from all loaded invasive species
- **List view** — Filtered by selected region, shows invasive entries with full detail links
- **Zero impact on main browse** — Invasives stay in species list; invasive flag is optional context

### Code Conventions
- Pack JSON stores `invasive: true` only (omit if false)
- UI checks `species.invasive === true` (defensive against undefined)
- Each invasive entry is a full `Species` record (reuses existing schema)

---

## Feature: IUCN Conservation Status

### What was implemented
The **Endangered Species Roadmap** adds IUCN Red List status to every species. Status codes (LC, NT, VU, EN, CR, EW, EX, DD) are:
1. **Scraped from Wikipedia** infoboxes via a new `fetch-conservation-status` CLI tool
2. **Stored in pack JSON** as shorthand codes only (e.g., `"conservation_status": "CR"`)
3. **Displayed on the UI** as badges on species tiles and detail cards
4. **Filterable** in the list view (FilterPanel + QuickFilterBar)
5. **Documented** in a new Learn page section with definitions and example species

### Key Files

#### Data Model
- **`app/src/types/index.ts`** — `ConservationStatus` type + `conservation_status?` field on `Species`
- **`pack-tools/types.ts`** — same for pack-tools

#### Scraper & CLI
- **`pack-tools/lib/wikipedia-scraper.ts`** — `extractConservationStatus(html)` + `scrapeConservationStatus(latin, common)`
- **`pack-tools/cli/fetch-conservation-status.ts`** — CLI tool with `--only-missing`, `--overwrite`, `--delay`, `--max` flags
- **`pack-tools/package.json`** — npm script `fetch-conservation-status`

#### Design & Labels
- **`app/src/lib/designTokens.ts`** — `CONSERVATION_STATUS_COLORS`, `ICONS`, `LABELS` + `getConservationStatusLabel()`
- **`app/src/lib/labels.ts`** — `conservationStatusLabel()` helper

#### Taxonomy
- **`app/src/lib/taxonomies/conservation.ts`** — `CONSERVATION_DEFINITIONS` (descriptions per tier) + `CONSERVATION_ORDERED` (sort key EX→DD)
- **`app/src/lib/taxonomies/index.ts`** — re-exports

#### Filters
- **`app/src/lib/filters.ts`** — `conservation_statuses: string[]` in `FilterState`; filter logic; options sorted by threat

#### UI Components
- **`app/src/components/ConservationBadge.tsx`** — styled pill badge per tier
- **`app/src/components/ConservationStatusSection.tsx`** — Learn page section (expandable, EX→DD, shows species)
- **`app/src/components/SpeciesTile.tsx`** — shows badge for EX/EW/CR/EN/VU/DD (omits NT/LC)
- **`app/src/components/TagRow.tsx`** — shows badge on detail page with filter link
- **`app/src/components/FilterPanel.tsx`** — conservation status checkboxes (desktop)
- **`app/src/components/QuickFilterBar.tsx`** — conservation status chips (mobile-friendly)
- **`app/src/pages/HomePage.tsx`** — URL sync for conservation_status param
- **`app/src/pages/LearnPage.tsx`** — fifth section for conservation status

### Data Pipeline
```bash
# Fetch images from Wikipedia (existing)
npm run fetch-images packs/0-base.json --only-missing

# NEW: Fetch conservation status from Wikipedia infoboxes
npm run fetch-conservation-status packs/0-base.json --only-missing

# Pack JSON now contains both image.url and conservation_status
# UI displays them automatically
```

### Code Conventions

#### Type naming
- Conservation status codes are always uppercase: `'LC'`, `'CR'`, `'VU'`, etc.
- The `ConservationStatus` union type enforces valid codes at compile-time.

#### Labels vs codes
- **Pack JSON stores codes only** (e.g., `"LC"`) — never full text like `"Least Concern"`
- **Full labels are resolved at render time** via `CONSERVATION_STATUS_LABELS` map
- This keeps packs compact and unambiguous

#### UI thresholds
- Badges shown on tiles only for **threatened/notable** tiers: `EX`, `EW`, `CR`, `EN`, `VU`, `DD`
- `NT` and `LC` are omitted to reduce visual clutter (but still filterable and visible on detail pages)

---

## Project Structure

```
living-patch/
├── app/                           # React frontend
│   ├── src/
│   │   ├── components/            # React UI components
│   │   ├── pages/                 # Page-level components (routing)
│   │   ├── lib/
│   │   │   ├── filters.ts         # Filter state & logic
│   │   │   ├── labels.ts          # Human-readable labels
│   │   │   ├── designTokens.ts    # Colors, icons, CSS variables
│   │   │   └── taxonomies/        # Form, habitat, keystone, conservation
│   │   ├── hooks/                 # Custom React hooks (useDataset, useLifeList, etc.)
│   │   ├── stores/                # Zustand state (packs, user prefs)
│   │   ├── types/                 # TypeScript definitions
│   │   └── data/                  # Dataset indexing
│   └── public/packs/              # Bundled JSON packs (generated)
│
├── pack-tools/                    # CLI data tools
│   ├── cli/
│   │   ├── fetch-images.ts        # Scrape Wikipedia for images
│   │   ├── fetch-conservation-status.ts  # Scrape Wikipedia for IUCN status
│   │   └── ...                    # Other CLIs (validate, merge, etc.)
│   ├── lib/
│   │   ├── wikipedia-scraper.ts   # Cheerio-based HTML parsing
│   │   └── ...                    # Validation, schemas, etc.
│   ├── packs/                     # Source data packs
│   │   └── 0-base.json
│   └── types.ts                   # Pack type definitions
│
├── build-dataset.js               # Merge packs into public/packs/
├── package.json
├── ROADMAP.md                     # Conservation status implementation plan
└── CLAUDE.md                      # This file

```

---

## Development Workflow

### Running the app
```bash
npm run dev              # Start Vite dev server (app/)
npm run build            # Full build: merge packs + build app
npm run lint             # ESLint check (app/)
npm run test             # Run vitest (app/)
```

### Working with data packs
```bash
npm run fetch-images <pack-file> --only-missing
npm run fetch-conservation-status <pack-file> --only-missing
npm run pack:validate    # Validate pack structure
npm run pack:merge       # Merge multiple packs
npm run bundle:packs     # Rebuild dataset from packs
```

### Typical changes
1. **Add a new species field** → update `app/src/types/index.ts` + `pack-tools/types.ts`
2. **Add labels** → `app/src/lib/labels.ts` + `app/src/lib/designTokens.ts`
3. **Add filter** → `app/src/lib/filters.ts` + UI components
4. **Add Learn page section** → new component file + render in `LearnPage.tsx`

---

## Common Tasks

### Adding a new filter type
1. Add field to `FilterState` in `app/src/lib/filters.ts`
2. Update `filterSpecies()` predicate
3. Update `getFilterOptions()` to extract values from species
4. Add UI in `FilterPanel.tsx` and `QuickFilterBar.tsx`
5. Sync to URL params in `HomePage.tsx`

### Updating Learn page sections
Follow the pattern of `KeystoneTypesSection.tsx`:
- Query `speciesById` to find matching species
- Render expandable rows with definitions
- Show example species with links

### Scraping new data from Wikipedia
1. Add `extract*()` function to `pack-tools/lib/wikipedia-scraper.ts`
2. Create new CLI in `pack-tools/cli/fetch-*.ts` (copy `fetch-images.ts` pattern)
3. Add npm script to `pack-tools/package.json`
4. Update pack type definitions

---

## Important Notes

### Data & Privacy
- All data is **static JSON**, bundled at build time
- No backend server or database
- User preferences (life list, favorites) stored in **browser localStorage**
- Wikipedia images linked directly to Wikimedia Commons (external URLs)

### Performance
- **Packs loaded lazily** via Zustand store
- Dataset is **memoized** in `useDataset()` hook
- Species indexed by ID for O(1) lookups

### Linting & Types
- TypeScript strict mode enabled
- ESLint enforces no unused vars, consistent imports
- Both `app/` and `pack-tools/` have separate tsconfig files

---

## Recent Changes

### Invasive Species Annotations (latest)
- **Commit:** `e0538e3` — "feat(data): add 8 invasive species to 0-base pack; add invasive field to Species type"
- **Branch:** `claude/invasive-species-geo-plan-HKeWT`
- **Status:** ✓ Complete, rebased on main, CI passing (lint + type-check + tests + E2E)
- **Changes:** 3 files modified
  - `app/src/types/index.ts` — added `invasive?: boolean` to Species
  - `pack-tools/lib/schema.ts` — added `invasive` to SpeciesSchema (Zod)
  - `pack-tools/packs/0-base.json` — added 8 invasive species (109 total)
- **PR #51:** https://github.com/adrien59cadri/living-patch/pull/51 (mergeable)

### Conservation Status Implementation (previous)
- **Status:** ✓ Complete
- **Commits:** Multiple on branch `claude/endangered-species-roadmap-plan-eFtuk`

---

## Contact & Contributing

Repository: https://github.com/adrien59cadri/living-patch

For questions or issues, see GitHub issues or contact the maintainer.
