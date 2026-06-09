# LivingPatch – Claude Memory Context

## Project Overview

**LivingPatch** is an ecological literacy tool for NE Pennsylvania species. It provides an interactive, filterable database of local wildlife with rich relationships: symbiosis, habitat, keystones, conservation status, and ecological status (native/bully/invasive/non-native).

**Repository:** `adrien59cadri/living-patch`

### Stack
- **Frontend:** React 18 + Vite, TailwindCSS, Router, Zustand
- **Backend:** Static data packs (JSON, bundled)
- **Data tools:** TypeScript CLI for scraping Wikipedia (images, conservation status)
- **Architecture:** Modular pack system; packs can be merged, validated, and versioned independently

---

## Feature: Ecological Status Taxonomy (June 5, 2026)

### What was implemented

Refactored `invasive?: boolean` field to `status?: EcologicalStatus` enum capturing the full four-category ecological taxonomy:
- **N (Native, default)** — undefined status; species evolved in region, no action needed
- **NB (Native Bully)** — `'nb'`; native species spreading aggressively, outcompeting other natives
- **NNNA (Non-Native Non-Aggressive)** — `'nnna'`; introduced by humans but not spreading, low ecological threat
- **I (Invasive)** — `'i'`; non-native AND spreading aggressively/causing ecological damage

Eight invasive species updated from `invasive: true` to `status: 'i'` in the `0-base` pack (northeast_pa):
1. Japanese honeysuckle, porcelainberry, oriental bittersweet (vines)
2. Canada thistle, garlic mustard, common periwinkle (wildflowers)
3. Multiflora rose, Japanese wineberry (shrubs)

Each species includes full ecological context in `functional_description` (e.g., "smothers native shrubs", "allelopathic to mycorrhizal fungi").

### Key Files

#### Data Model
- **`app/src/types/index.ts`** — `EcologicalStatus` type alias + `status?: EcologicalStatus` field on `Species`
- **`pack-tools/lib/schema.ts`** — Zod schema with `status: z.enum(['nb', 'nnna', 'i']).optional()`
- **`pack-tools/types.ts`** — same `status?: 'nb' | 'nnna' | 'i'` field on Species interface

#### Data
- **`pack-tools/packs/0-base.json`** — 8 species updated to `"status": "i"` (total 120 species, 45+ taxonomic groups)

#### Design & Labels
- **`app/src/lib/designTokens.ts`** — `ECOLOGICAL_STATUS_LABELS`, `ECOLOGICAL_STATUS_COLORS`, `ECOLOGICAL_STATUS_DESCRIPTIONS` mappings
- **`app/src/lib/labels.ts`** — `ecologicalStatusLabel()` and `ecologicalStatusDescription()` helpers

#### Filters
- **`app/src/lib/filters.ts`** — `ecological_statuses: string[]` in `FilterState`; filter logic for status matching

#### UI Components
- **`app/src/components/EcologicalStatusBadge.tsx`** — styled pill badge (red/amber/sky) per status
- **`app/src/components/EcologicalStatusSection.tsx`** — Learn page section (expandable, I→NB→NNNA, shows species per status)
- **`app/src/components/TagRow.tsx`** — shows badge on detail page with filter link (`?ecological_status=`)
- **`app/src/components/FilterPanel.tsx`** — ecological status checkboxes (desktop)
- **`app/src/components/QuickFilterBar.tsx`** — ecological status chips (mobile-friendly)
- **`app/src/pages/HomePage.tsx`** — URL sync for `ecological_status` param
- **`app/src/pages/LearnPage.tsx`** — renders new `EcologicalStatusSection`

### Data Model Design
```ts
export type EcologicalStatus = 'nb' | 'nnna' | 'i';

interface Species {
  id: string;
  common_name: CommonName;
  latin_name?: string | null;
  form: string;                      // vine, wildflower, shrub, etc.
  region: string;                    // northeast_pa, france, etc.
  status?: EcologicalStatus;         // 'nb', 'nnna', or 'i'; default undefined = native
  functional_description: string;    // ecological impact narrative
  // ... other fields
}
```

**Key insight**: Status is regional by design. The same species (e.g., porcelainberry) appears with `status: 'i'` in the PA pack but not in a hypothetical East Asia pack. No merge conflicts; each pack's truth is its own. Future: add native species with `status: 'nb'` (Salix spp., some Cornus spp.) and non-native localized species with `status: 'nnna'` (e.g., forget-me-not cultivars).

### UI Features
- **Badges**: Red (invasive), Amber (native bully), Sky blue (non-native non-aggressive); clickable on detail page links to filtered list
- **Learn Page**: New `EcologicalStatusSection` with expandable rows per status, definitions, and example species
- **Filters**: Checkboxes + chips in FilterPanel/QuickFilterBar; URL param sync with `ecological_status=i,nb,nnna`
- **Color Scheme**: Matching conservation status pattern (badge + background colors)

### Code Conventions
- Pack JSON stores `status: "i"|"nb"|"nnna"` only (omit if undefined = native)
- UI checks `species.status === 'i'` (or uses defensive `status?.includes()`)
- Type alias `EcologicalStatus` enforces valid enum values at compile-time
- Each species is a full `Species` record (reuses existing schema; status is just one more optional field)

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
├── roadmap.md                     # Project roadmap: completed & planned features
└── CLAUDE.md                      # This file

```

---

## Relationship Data Conventions

### Two arrays, two shapes

The pack JSON has two top-level relationship arrays with different schemas:

| Array | Schema | Shape | Use for |
|---|---|---|---|
| `data.symbiosis` | `SymbiosisSchema` | `source` + `targets[]` + `fulfillment?` | Directional ecological interactions |
| `data.relations` | `RelationSchema` | `members[]` | Undirected groupings (taxonomic, ecological guild) |

### source / target convention

**`source` = the species that benefits or acts. `targets` = the species being depended on or acted upon.**

This applies across all symbiosis types:
- **commensalism**: source = beneficiary (uses habitat/structure), target = provider (unaffected)
- **predation**: source = predator, target = prey
- **parasitism**: source = parasite/dependent, target = host/victim
- **mutualism**: source = primary actor (e.g., pollinator), target = plant
- **competition**: source = the challenger, target = the established species

❌ Wrong: `{ source: "bird_pileated-woodpecker", targets: ["bird_american-kestrel"] }` — woodpecker doesn't benefit  
✅ Right: `{ source: "bird_american-kestrel", targets: ["bird_pileated-woodpecker"] }` — kestrel benefits from cavity

### fulfillment: "any" — one-of-N providers

When a species can satisfy its dependency from **any one** of multiple providers, use a single entry with multiple targets and `fulfillment: "any"`:

```json
{
  "type": "commensalism",
  "source": "bird_american-kestrel",
  "targets": ["bird_pileated-woodpecker", "bird_northern-flicker"],
  "fulfillment": "any",
  "strength": "important",
  "notes": "..."
}
```

Do **not** create two separate entries. The `fulfillment: "any"` pattern correctly models "needs one of these". Use `fulfillment: "all"` only when all targets are simultaneously required (rare).

### Commensalism cavity-provider pattern

Several cavity-nesting species depend on either Pileated Woodpecker or Northern Flicker. All are modelled as `source → [pileated, flicker]` with `fulfillment: "any"`:
- `bird_american-kestrel`
- `bird_great-crested-flycatcher`
- `bird_white-breasted-nuthatch`

Single-provider dependencies (pileated only) follow the same direction convention:
- `bird_great-horned-owl`, `bird_wood-duck`, `mammal_flying-squirrel` → `[bird_pileated-woodpecker]`

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
npm run fetch-images <pack-file> --only-missing      # Skip species with images
npm run fetch-images <pack-file> --fix-authors       # Re-fetch only placeholder/bad authors
npm run fetch-conservation-status <pack-file> --only-missing
npm run pack:validate    # Validate pack structure
npm run pack:merge       # Merge multiple packs
npm run bundle:packs     # Rebuild dataset from packs
```

### Image author conventions
- `fetch-images` scraper: `source` = beneficiary, `target` = provider (same as symbiosis)
- Placeholder authors recognized: `"This file is lacking author information."`, `"Unknown"`, `"Photographer"`, `"No machine-readable author provided. X"` (strips prefix, keeps X)
- When author is a placeholder, scraper falls back to the **Source** field (e.g., `"U.S. Fish & Wildlife Service"`)
- Use `--fix-authors` flag to re-scrape only the 3 remaining `"Wikimedia Commons"` fallbacks if better data becomes available

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

### Symbiosis Convention Audit + Author Scraper Fixes (June 7, 2026 — latest)
- **Branch:** `claude/indiana-bat-symbiosis-author-c4vxo`
- **Status:** ✓ Complete, PR #60 open
- **Changes:**
  - Indiana Bat: added 4 symbiosis entries (predation on moths/beetles, commensalism with pileated, competition with cave-sharing bats); fixed image author to `"U.S. Fish & Wildlife Service"`
  - Fixed 7 reversed commensalism entries (provider was listed as source; beneficiary should be source); 3 consolidated with `fulfillment: "any"` (kestrel, great crested flycatcher, white-breasted nuthatch all depend on pileated OR northern flicker)
  - `wikipedia-scraper.ts`: author placeholder detection (`"This file is lacking author information."`, `"Photographer"`, `"No machine-readable author provided. X"`); falls back to Source field; strips prefix for "No machine-readable" to recover username
  - `fetch-images.ts`: new `--fix-authors` flag re-fetches only species with placeholder/bad authors
  - 8 species author values corrected across pack (Velela, Mdf, MPF, Own work, FWS, etc.)
  - `SpeciesCard.tsx`: Wikipedia credit link moved to its own line below author text
  - CLAUDE.md: added **Relationship Data Conventions** section documenting source/target direction, fulfillment: "any", and two-array structure

### Image Credit Line + Test Infrastructure (June 6, 2026)
- **Branch:** `claude/wizardly-archimedes-BL71D`
- **Status:** ✓ Complete, pushed to origin
- **Changes:**
  - `image` object gains `source_url?: string` — Wikipedia page URL for the species
  - `app/src/components/SpeciesCard.tsx` — renders `Photo: [author] · Wikipedia ↗` under hero image; graceful fallback when missing
  - `pack-tools/lib/wikipedia-scraper.ts` — `scrapeSpeciesImage()` now returns `source_url`
  - `pack-tools/lib/schema.ts` — image URL validated as proper URL (`z.string().url()`); `source_url` added to schema
  - `pack-tools/packs/0-base.json` — **126 species backfilled** with `source_url`
  - `app/e2e/species-detail.spec.ts` — 3 new e2e tests for credit line (Photo: text, Wikipedia link href, target=_blank)
  - `pack-tools/__tests__/lib/wikipedia-scraper.test.ts` — mocking fixed (`vi.mock('node-fetch')`), all 28 pack-tools tests now pass
  - `pack-tools/__tests__/lib/rate-limiter.test.ts` — fake timer tests fixed using `vi.runAllTimersAsync()`
  - `.github/workflows/ci.yml` — added `pack-tools-tests` job; e2e now depends on both `ci` and `pack-tools-tests`

### PA Endangered & Threatened Species (June 6, 2026)
- **Commit:** `96c8cef` — "feat(data): add 11 PA endangered and threatened species with conservation status"
- **Status:** ✓ Complete
- Dataset expanded: **120 → 126 species** total (including later additions)
- Added 11 PA endangered/threatened: 6 birds (bittern, shrike, plover, owls, harrier), 5 mammals (bats, woodrat, water shrew)

### Ecological Status Taxonomy (June 5, 2026)
- **Commit:** `25111e0` — "feat(ecology): refactor invasive flag to full N/NB/NNNA/I taxonomy"
- **Status:** ✓ Complete
- Refactored `invasive?: boolean` → `status?: EcologicalStatus` (`'nb' | 'nnna' | 'i'`)
- 8 invasive species updated to `status: "i"`; full UI: badges, filters, Learn page section

### Conservation Status Implementation
- **Status:** ✓ Complete
- IUCN Red List codes scraped from Wikipedia, stored per species, displayed as badges and filterable

---

## Contact & Contributing

Repository: https://github.com/adrien59cadri/living-patch

For questions or issues, see GitHub issues or contact the maintainer.
