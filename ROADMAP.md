# Roadmap: Endangered Species Status

Add IUCN Red List conservation status to every species — fetched automatically from Wikipedia — and surface it throughout the app: species tiles, detail cards, list filters, and a new Learn page section.

---

## Overview

The IUCN Red List defines eight status tiers, from **Least Concern** to **Extinct**. The goal is to:

1. Extend the `Species` data model with a `conservation_status` field.
2. Add a `fetch-conservation-status` CLI tool (parallel to the existing `fetch-images` tool) that scrapes the Wikipedia infobox for each species and writes the status back to the pack JSON.
3. Add labels, icons, and design tokens for all eight tiers.
4. Wire the status into the filter system.
5. Display it on species tiles and detail cards.
6. Add a **Conservation Status** section to the Learn page, modelled on `KeystoneTypesSection`.

---

## IUCN Status Tiers

| Code | Label              | Colour (hex) | Emoji |
|------|--------------------|--------------|-------|
| EX   | Extinct            | `#000000`    | 💀    |
| EW   | Extinct in the Wild| `#542344`    | 🏚️    |
| CR   | Critically Endangered | `#CC0000` | 🔴    |
| EN   | Endangered         | `#CC6600`    | 🟠    |
| VU   | Vulnerable         | `#CCCC00`    | 🟡    |
| NT   | Near Threatened    | `#006666`    | 🔵    |
| LC   | Least Concern      | `#006600`    | 🟢    |
| DD   | Data Deficient     | `#AAAAAA`    | ⬜    |

Species with no scraped status are left as `undefined` (not shown in filters or badges).

---

## Step-by-step Plan

### Step 1 — Extend the data model

**File:** `app/src/types/index.ts`

Add a `conservation_status` optional field to the `Species` interface (currently lines 14–36):

```typescript
export type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

export interface Species {
  // … existing fields …
  conservation_status?: ConservationStatus | null;
}
```

---

### Step 2 — Scrape conservation status from Wikipedia

**Pattern:** mirror the existing `pack-tools/lib/wikipedia-scraper.ts` + `pack-tools/cli/fetch-images.ts` pair.

#### 2a. Extend the Wikipedia scraper library

**File:** `pack-tools/lib/wikipedia-scraper.ts`

Add a new exported function `extractConservationStatus(html: string): ConservationStatus | null` that:

1. Parses the HTML of a Wikipedia species page.
2. Finds the IUCN status inside the infobox — Wikipedia wraps it in a `<td>` with class `iucn` or in an element with `data-iucn-status`, or as a short text like "Endangered" near the word "IUCN".
3. Maps the full text to a **shorthand code** and returns that code — never the full text:

   | Wikipedia text         | Stored value |
   |------------------------|--------------|
   | `Least Concern`        | `LC`         |
   | `Near Threatened`      | `NT`         |
   | `Vulnerable`           | `VU`         |
   | `Endangered`           | `EN`         |
   | `Critically Endangered`| `CR`         |
   | `Extinct in the Wild`  | `EW`         |
   | `Extinct`              | `EX`         |
   | `Data Deficient`       | `DD`         |

   The function is case-insensitive and also accepts the codes themselves as input (idempotent), so re-running the CLI on an already-populated pack is safe.

4. Returns `null` if no recognisable status is found.

> Wikipedia's species infoboxes consistently use a block like:
> `<td class="iucn"><a …>Least Concern</a></td>`
> The scraper should target that pattern first, then fall back to searching for the IUCN abbreviation badge image alt-text (e.g., `alt="NT"`).

**Pack JSON storage format** — the shorthand is written directly to the field:

```json
{
  "id": "eurasian_sparrowhawk",
  "common_name": "Eurasian Sparrowhawk",
  "latin_name": "Accipiter nisus",
  "conservation_status": "LC",
  "image": { "url": "https://…", "author": "…" }
}
```

Full labels (e.g., "Least Concern") are resolved at render time via `CONSERVATION_STATUS_LABELS` in `designTokens.ts` — they are never stored in the pack.

#### 2b. New CLI tool

**New file:** `pack-tools/cli/fetch-conservation-status.ts`

Mirrors the structure of `fetch-images.ts`. For each species in the given pack file:

1. Calls `fetchWikipediaPage(speciesName)` (already in the scraper).
2. Calls `extractConservationStatus(html)`.
3. Writes `species.conservation_status = status` back to the pack JSON (leaves existing values alone unless `--overwrite` flag is set).
4. Respects the same `--only-missing`, `--delay <ms>`, and `--max <count>` flags for rate-limiting.

**Add npm script** in `package.json`:
```json
"fetch-conservation-status": "ts-node pack-tools/cli/fetch-conservation-status.ts"
```

---

### Step 3 — Design tokens and labels

**File:** `app/src/lib/designTokens.ts`

Add three new maps (following the pattern of `KEYSTONE_ICONS` at lines 101–121 and `KEYSTONE_LABELS` at lines 127–147):

```typescript
export const CONSERVATION_STATUS_COLORS: Record<string, string> = {
  EX:  '#000000',
  EW:  '#542344',
  CR:  '#CC0000',
  EN:  '#CC6600',
  VU:  '#CCCC00',
  NT:  '#006666',
  LC:  '#006600',
  DD:  '#AAAAAA',
};

export const CONSERVATION_STATUS_ICONS: Record<string, string> = {
  EX: '💀', EW: '🏚️', CR: '🔴', EN: '🟠',
  VU: '🟡', NT: '🔵', LC: '🟢', DD: '⬜',
};

export const CONSERVATION_STATUS_LABELS: Record<string, string> = {
  EX: '💀 Extinct',
  EW: '🏚️ Extinct in the Wild',
  CR: '🔴 Critically Endangered',
  EN: '🟠 Endangered',
  VU: '🟡 Vulnerable',
  NT: '🔵 Near Threatened',
  LC: '🟢 Least Concern',
  DD: '⬜ Data Deficient',
};
```

**File:** `app/src/lib/labels.ts`

Add a helper (following the pattern of `keystoneLabel()` at lines 79–81):

```typescript
export function conservationStatusLabel(status: string): string {
  return CONSERVATION_STATUS_LABELS[status] ?? status;
}
```

---

### Step 4 — Conservation status taxonomy (for the Learn page)

**New file:** `app/src/lib/taxonomies/conservation.ts`

Mirrors the structure of `keystones.ts` (lines 14–125). Define `CONSERVATION_DEFINITIONS` with a label, short description, and ecological/management context for each of the eight tiers. Export a `CONSERVATION_ORDERED` array that lists them from most to least threatened (`['EX','EW','CR','EN','VU','NT','LC','DD']`).

**File:** `app/src/lib/taxonomies/index.ts`

Re-export `CONSERVATION_DEFINITIONS` and `CONSERVATION_ORDERED` from the new file.

---

### Step 5 — Filter system

**File:** `app/src/lib/filters.ts`

1. Add `conservation_statuses: string[]` to `FilterState` (lines 10–17).
2. In `filterSpecies()` (lines 19–57), add a clause:
   ```typescript
   if (state.conservation_statuses.length > 0) {
     species = species.filter(s =>
       s.conservation_status != null &&
       state.conservation_statuses.includes(s.conservation_status)
     );
   }
   ```
3. In `getFilterOptions()` (lines 69–82), collect the set of `conservation_status` values present in the dataset and return them sorted by threat level (using `CONSERVATION_ORDERED` as the sort key).

---

### Step 6 — Filter UI

#### 6a. Filter panel (desktop/advanced)

**File:** `app/src/components/FilterPanel.tsx`

Add a new section after the keystone type filter (lines 206–247), following the same collapsible-dropdown pattern. Use `CONSERVATION_STATUS_LABELS` for option labels and colour the chips with `CONSERVATION_STATUS_COLORS`. Only tiers that exist in the loaded dataset appear as options (use `getFilterOptions()`).

#### 6b. Quick filter bar (compact chips)

**File:** `app/src/components/QuickFilterBar.tsx`

Add a `ConservationFilterChips` component (inline or extracted) next to `HierarchicalFilterChips`. Because conservation status is a flat list (no hierarchy), it can use a simple chip row, coloured by tier. Show only the tiers actually present in the dataset.

#### 6c. URL state sync

**File:** `app/src/pages/HomePage.tsx` (lines 28–41)

Add `conservation_statuses` to the URL serialisation/deserialisation logic alongside the existing filter params.

---

### Step 7 — Species tile badge

**File:** `app/src/components/SpeciesTile.tsx` (lines 59–64 area, next to the keystone badge)

Add a `ConservationBadge` (see Step 8a) rendered when `species.conservation_status` is defined and is one of `CR`, `EN`, or `VU` (threatened tiers only — avoid cluttering tiles for LC/NT species). `DD`, `EX`, and `EW` are also shown given their significance.

Display order on the tile: form tag → keystone badge → conservation badge.

---

### Step 8 — New components

#### 8a. `ConservationBadge`

**New file:** `app/src/components/ConservationBadge.tsx`

Mirrors `KeystoneBadge` (`app/src/components/KeystoneBadge.tsx`, lines 1–15). Accepts a `status: ConservationStatus` prop, renders a small pill with the icon + short label and a background derived from `CONSERVATION_STATUS_COLORS`.

```tsx
interface Props { status: ConservationStatus }
export function ConservationBadge({ status }: Props) {
  return (
    <span style={{ background: CONSERVATION_STATUS_COLORS[status] }}>
      {CONSERVATION_STATUS_LABELS[status]}
    </span>
  );
}
```

#### 8b. `ConservationStatusSection` (Learn page section)

**New file:** `app/src/components/ConservationStatusSection.tsx`

Mirrors `KeystoneTypesSection` (`app/src/components/KeystoneTypesSection.tsx`, lines 1–109):

- Renders each conservation tier as an expandable row (most-threatened first).
- Expanded row shows: tier label, colour swatch, IUCN definition text from `CONSERVATION_DEFINITIONS`, and up to 3 example species from the loaded dataset that carry that status, each linking to the detail page.
- Includes a footnote crediting the IUCN Red List.

---

### Step 9 — Learn page

**File:** `app/src/pages/LearnPage.tsx` (lines 1–44)

Import and render `<ConservationStatusSection />` as a fifth section after the existing four, passing the dataset index from `useDataset()`:

```tsx
<ConservationStatusSection dataset={dataset} />
```

---

### Step 10 — Species detail card

**File:** `app/src/components/SpeciesCard.tsx`

In the detail view, add a **Conservation Status** row in the metadata section (near habitat/diet/season chips). Show the full-width coloured badge (`ConservationBadge`) plus a one-sentence description from `CONSERVATION_DEFINITIONS`. Link out to the IUCN Red List page for the species (`https://www.iucnredlist.org/search?query=<latin_name>`).

---

## File Change Summary

| File | Change type | Notes |
|------|-------------|-------|
| `app/src/types/index.ts` | Edit | Add `ConservationStatus` type + field to `Species` |
| `pack-tools/lib/wikipedia-scraper.ts` | Edit | Add `extractConservationStatus()` |
| `pack-tools/cli/fetch-conservation-status.ts` | **New** | CLI tool to bulk-scrape and write status |
| `package.json` | Edit | Add `fetch-conservation-status` npm script |
| `app/src/lib/designTokens.ts` | Edit | Add color/icon/label maps |
| `app/src/lib/labels.ts` | Edit | Add `conservationStatusLabel()` helper |
| `app/src/lib/taxonomies/conservation.ts` | **New** | `CONSERVATION_DEFINITIONS` + `CONSERVATION_ORDERED` |
| `app/src/lib/taxonomies/index.ts` | Edit | Re-export from conservation.ts |
| `app/src/lib/filters.ts` | Edit | Add `conservation_statuses` to `FilterState` and filter logic |
| `app/src/components/FilterPanel.tsx` | Edit | Add conservation status filter section |
| `app/src/components/QuickFilterBar.tsx` | Edit | Add conservation chip row |
| `app/src/pages/HomePage.tsx` | Edit | URL state sync for new filter |
| `app/src/components/ConservationBadge.tsx` | **New** | Small pill badge component |
| `app/src/components/SpeciesTile.tsx` | Edit | Show `ConservationBadge` on tiles |
| `app/src/components/ConservationStatusSection.tsx` | **New** | Learn page section |
| `app/src/pages/LearnPage.tsx` | Edit | Add `ConservationStatusSection` |
| `app/src/components/SpeciesCard.tsx` | Edit | Add conservation row to detail view |

---

## Data pipeline after implementation

```
1. Edit or create a pack JSON file with species data
2. npm run fetch-images <pack-file> --only-missing        # existing
3. npm run fetch-conservation-status <pack-file> --only-missing  # new
4. The pack JSON now has image + conservation_status for each species
5. Deploy / reload the app — filters and badges are live
```

---

## Open questions

- **Threshold for badge display on tiles:** show all statuses, or only CR/EN/VU/EX/EW? (Current proposal: hide NT and LC to reduce noise.)
- **Regional vs. global status:** Wikipedia sometimes shows a regional assessment. The scraper should prefer the global IUCN assessment; if only regional is available, store it with a `_regional` suffix or flag.
- **Missing data handling:** species with no Wikipedia page or no infobox status — should the tile show a "status unknown" indicator or nothing?
- **Pack schema versioning:** bumping `schemaVersion` in pack metadata when the new field is added, to signal compatibility.
