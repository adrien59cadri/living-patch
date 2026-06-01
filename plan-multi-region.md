# Multi-Region Plan: French Pack, Area Filter & Multi-Dataset Support

Items 9, 10, and 11 from `roadmap.md` — dependency analysis and implementation detail.

---

## Dependency Map

```
Item 9 (Multi-Dataset runtime control)
  └── independent; makes sense AFTER items 10+11 give users something to toggle

Item 10 (French Pack — data)
  ├── build pipeline: already works, no changes needed
  └── UI usefulness: REQUIRES item 11 (area filter), otherwise French + NE PA
      species mix in the list with no way to separate them

Item 11 (Area Filter — UI)
  └── no blocking dependencies; meaningful once item 10 is underway
      but can be coded and shipped before French pack data is complete
```

**Short version**: 11 → 10 can be done as a unit (or 11 first, 10 immediately after).
Item 9 is orthogonal — it adds runtime pack toggle controls that become useful only
once both packs are live.

---

## What Already Exists (Don't Rebuild)

| Infrastructure | File | Status |
|---|---|---|
| Multi-pack build pipeline | `build-dataset.js` | ✅ Works today — add any `.json` to `packs/`, it loads |
| `{ packs: [...] }` output format | `build-dataset.js` | ✅ Each pack preserved as a unit |
| Per-pack iteration at app startup | `app/src/data/index.ts` | ✅ Already flattens N packs into indexes |
| `region` field on Species | `pack-tools/types.ts`, `pack-tools/schema/pack-schema.json` | ✅ Required field, currently always `"northeast_pa"` |
| Duplicate-ID detection | `build-dataset.js` | ✅ Throws on conflict at build time |
| FilterState + filterSpecies() | `app/src/lib/filters.ts` | ✅ Extensible — adding `areas` is a 3-line change |
| Filter URL params | `app/src/pages/HomePage.tsx` | ✅ `searchParams.getAll(key)` pattern — copy for `area` |
| Pack info display | `app/src/pages/PacksPage.tsx` | ✅ Shows pack metadata + counts — extend for toggles |

---

## Item 11: Area-Based List Filtering

**Ship order**: implement before or alongside item 10.

### 1. `app/src/lib/filters.ts`

Add `areas` to `FilterState`:
```ts
export interface FilterState {
  search: string;
  forms: string[];
  seasons: string[];
  habitats: string[];
  keystone_types: string[];
  areas: string[];           // ← new
}
```

Add one guard clause in `filterSpecies()` (after the keystone check):
```ts
if (areas.length > 0 && !areas.includes(s.region)) return false;
```

Add to `getFilterOptions()`:
```ts
const areas = [...new Set(species.map(s => s.region).filter(Boolean))].sort();
return { forms, seasons, habitats, keystone_types, areas };
```

### 2. `app/src/lib/labels.ts`

Add `areaLabel()` following the existing `formLabel` / `habitatLabel` pattern:
```ts
export function areaLabel(region: string): string {
  const map: Record<string, string> = {
    northeast_pa: 'Northeast PA',
    france: 'France',
  };
  return map[region] ?? region;
}
```

### 3. `app/src/components/FilterPanel.tsx`

- Add `areas: string[]` to the local `FilterOptions` interface.
- Add a checkbox section between Habitat and Keystone — but **only render it when
  `options.areas.length > 1`** (no visual noise when the dataset has one region):
```tsx
{options.areas.length > 1 && (
  <div className="space-y-1.5">
    <span className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
      Area
    </span>
    <div className="flex flex-col gap-1.5">
      {options.areas.map(a => (
        <CheckboxItem
          key={a}
          label={areaLabel(a)}
          checked={filters.areas.includes(a)}
          onChange={() => onChange({ ...filters, areas: toggle(filters.areas, a) })}
        />
      ))}
    </div>
  </div>
)}
```
- Add `filters.areas.length > 0` to `hasActive`.
- Add `areas: []` to the clear-filters handler.

### 4. `app/src/components/QuickFilterBar.tsx`

- Add `areas: string[]` to the local `FilterOptions` interface.
- Add an area chip row **only when `options.areas.length > 1`**:
```tsx
{options.areas.length > 1 && (
  <div className="flex flex-wrap gap-1.5">
    {options.areas.map(area => {
      const active = filters.areas.includes(area);
      return (
        <button
          key={area}
          onClick={() => onChange({ ...filters, areas: toggle(filters.areas, area) })}
          className={active
            ? 'text-xs px-2 py-0.5 rounded-full bg-sky-600 text-white'
            : 'text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 hover:bg-sky-200'}
        >
          {areaLabel(area)}
        </button>
      );
    })}
  </div>
)}
```

### 5. `app/src/pages/HomePage.tsx`

Three small edits:
```ts
// FilterState initializer
areas: searchParams.getAll('area'),

// isAdvancedOpen detection
searchParams.getAll('area').length > 0

// activeFilterCount
+ filters.areas.length
```

### Tests to write / update
- **Unit** (`filters.test.ts`): `filterSpecies` with `areas: ['france']` excludes `region: 'northeast_pa'` species.
- **Unit**: `getFilterOptions` returns unique area values.
- **Component** (`FilterPanel.test.tsx`): area section hidden when `options.areas` has 1 element; visible with 2.
- **E2E**: navigate to `/?area=france` → only French species visible.

---

## Item 10: French Species Pack

**Ship order**: after or with item 11.

### Build pipeline changes: none

`build-dataset.js` auto-discovers all `.json` files in `pack-tools/packs/`. Adding
`1-france.json` is sufficient — no script edits needed.

### New file: `pack-tools/packs/1-france.json`

Follows the identical schema as `0-base.json`. Key structural differences:

```json
{
  "metadata": {
    "id": "france-base",
    "author": "Living Patch",
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "description": "French temperate species — birds, mammals, plants, trees, butterflies",
    "createdDate": "2026-06-01T00:00:00Z",
    "status": "draft"
  },
  "data": {
    "species": [ ... ],
    "taxonomic_groups": [ ... ],
    "symbiosis": [ ... ],
    "relations": [ ... ]
  }
}
```

**Every species entry must have `"region": "france"`.**

#### ID convention
Same pattern as base pack: `{form}_{slug}` in lowercase kebab.
Examples: `bird_rouge-gorge`, `mammal_renard-roux`, `tree_chene-pedoncule`,
`plant_sureau-noir`, `butterfly_paon-du-jour`.

#### Representative species list (starting point)

| Form | ID slug | Common name |
|---|---|---|
| bird | rouge-gorge | Rougegorge familier |
| bird | mesange-charbonniere | Mésange charbonnière |
| bird | pic-vert | Pic vert |
| bird | geai-des-chenes | Geai des chênes |
| bird | coucou-gris | Coucou gris |
| bird | faucon-crecerelle | Faucon crécerelle |
| mammal | renard-roux | Renard roux |
| mammal | sanglier | Sanglier |
| mammal | chevreuil | Chevreuil |
| mammal | herisson | Hérisson d'Europe |
| mammal | blaireau | Blaireau européen |
| mammal | ecureuil-roux | Écureuil roux |
| tree | chene-pedoncule | Chêne pédonculé |
| tree | hetre-commun | Hêtre commun |
| tree | chataignier | Châtaignier |
| plant | sureau-noir | Sureau noir |
| plant | lierre-grimpant | Lierre grimpant |
| plant | ortie | Grande ortie |
| butterfly | paon-du-jour | Paon du jour |
| butterfly | vulcain | Vulcain |
| butterfly | citron | Citron |
| butterfly | machaon | Machaon |

#### Key symbiosis relationships to include

| Type | Source | Target(s) | Notes |
|---|---|---|---|
| mutualism | `bird_geai-des-chenes` | `tree_chene-pedoncule` | Acorn caching drives oak regeneration |
| predation | `mammal_renard-roux` | `mammal_herisson`, `bird_rouge-gorge` | Opportunistic predation |
| predation | `bird_rouge-gorge` | (earthworm — add `invertebrate_lombric`) | Primary foraging |
| mutualism | `butterfly_machaon` | `plant_carotte-sauvage` (add) | Larval host plant |
| predation | `mammal_sanglier` | `tree_chataignier`, `tree_chene-pedoncule` | Mast foraging, soil disturbance |
| mutualism | `mammal_blaireau` | (earthworm) | Digging aerates soil |
| commensalism | `bird_mesange-charbonniere` | `tree_hetre-commun` | Cavity nesting in old beech |

#### Validation & workflow
```sh
# Validate schema + internal consistency
npm run pack:validate pack-tools/packs/1-france.json

# Preview merge — confirms no duplicate IDs with 0-base
npm run pack:merge pack-tools/packs/0-base.json pack-tools/packs/1-france.json

# Rebuild app dataset
npm run build:dataset

# Dev server — verify area chips appear, French species filterable
npm run dev
```

Promote `status` from `"draft"` to `"published"` only after review of all species
entries, symbiosis accuracy, and at least one full validation + merge dry-run pass.

---

## Item 9: Multi-Dataset Support (runtime pack management)

This item becomes meaningful once item 10 ships — there is now a second pack to toggle.
It does **not** block items 10 or 11.

### Gap analysis: what 9 adds that the build pipeline doesn't

| Capability | Current state | Item 9 adds |
|---|---|---|
| Load N packs at build | ✅ `build-dataset.js` | — |
| Flatten indexes from N packs | ✅ `data/index.ts` | — |
| User can disable a pack at runtime | ❌ | ✅ pack toggle in PacksPage |
| Species list respects enabled packs | ❌ (always all) | ✅ |
| Conflict/dupe UI | ❌ (throws at build) | ✅ warning badge in PacksPage |
| Deduplication of same species across packs | ❌ (error at build) | ✅ last-write-wins or merge strategy |

### 1. New Zustand slice: enabled packs state

Add to `app/src/stores/lifeList.ts` (or a dedicated `packs.ts` store):
```ts
interface PacksState {
  disabledPackIds: string[];   // IDs of packs the user has toggled off
  togglePack: (packId: string) => void;
}
```
Persisted to localStorage under key `living-patch-packs-v1`.

### 2. `app/src/data/index.ts` — respect enabled pack state

Currently:
```ts
for (const pack of data.packs) {
  species.push(...pack.data.species ?? []);
  ...
}
```

After item 9:
```ts
const enabledPacks = data.packs.filter(p => !disabledPackIds.includes(p.metadata.id));
for (const pack of enabledPacks) {
  species.push(...pack.data.species ?? []);
  ...
}
```

This means the dataset indexes are rebuilt from only enabled packs. The cleanest way to
wire this is a `useActiveDataset()` hook that reads from both `dataset.json` and the
packs Zustand store, returning filtered arrays. The existing `useDataset()` hook
(`app/src/hooks/useDataset.ts`) can delegate to it.

### 3. `app/src/pages/PacksPage.tsx` — toggle UI

Add per-pack controls to the existing pack list:
- Toggle switch (enabled / disabled) wired to `togglePack(pack.metadata.id)`
- Disabled state: pack card grayed out, badge "0 species active"
- Warning when disabling: "X species and Y relationships will be hidden from the list"
- Conflict badge: shown when two loaded packs share a species ID (rare once ID
  conventions are enforced, but worth surfacing)

### 4. Deduplication strategy (for conflict case)

At build time `build-dataset.js` already throws on duplicate IDs — this stays.
At runtime, if two packs somehow share an ID (e.g. user side-loads a custom pack in
a future version), apply last-pack-wins: the pack with the higher index in `dataset.packs`
overrides the earlier one for that species ID. Log a console warning in dev mode.

The `speciesById` Map in `data/index.ts` already implements last-write-wins naturally
since it's built by iterating packs in order.

### Tests to write / update
- **Unit** (`data/index.ts`): when `disabledPackIds` includes a pack ID, species from
  that pack are absent from the flattened arrays.
- **Component** (`PacksPage.test.tsx`): toggle switch calls `togglePack`; disabled pack
  card shows grayed style.
- **E2E**: disable France pack → French species disappear from list; re-enable → they return.

---

## Recommended Ship Order

```
Week 1  ──  Item 11: Area filter
              · filters.ts  ·  labels.ts  ·  FilterPanel  ·  QuickFilterBar  ·  HomePage
              · unit + component tests
              · works fine with single-region data (area chips hidden when 1 region)

Week 2  ──  Item 10: French Pack (data authoring)
              · 1-france.json — species, symbiosis, taxonomic groups
              · pack:validate + pack:merge + build:dataset
              · area chips now visible; French species filterable

Week 3+ ──  Item 9: Runtime pack management
              · Zustand packs store
              · useActiveDataset hook
              · PacksPage toggle controls
              · deduplication + conflict badge
```

---

## Files Touched (summary)

| File | Item | Change |
|---|---|---|
| `app/src/lib/filters.ts` | 11 | Add `areas` to FilterState, filterSpecies, getFilterOptions |
| `app/src/lib/labels.ts` | 11 | Add `areaLabel()` |
| `app/src/components/FilterPanel.tsx` | 11 | Area checkbox section (hidden when 1 region) |
| `app/src/components/QuickFilterBar.tsx` | 11 | Area chip row (hidden when 1 region) |
| `app/src/pages/HomePage.tsx` | 11 | `?area=` URL param wiring |
| `pack-tools/packs/1-france.json` | 10 | New file — French species dataset |
| `app/src/data/dataset.json` | 10 | Regenerated — do not edit manually |
| `app/src/stores/packs.ts` | 9 | New Zustand store — disabled pack IDs |
| `app/src/hooks/useDataset.ts` | 9 | Delegate to `useActiveDataset` |
| `app/src/data/index.ts` | 9 | Filter out disabled packs before building indexes |
| `app/src/pages/PacksPage.tsx` | 9 | Toggle UI, conflict badge |
