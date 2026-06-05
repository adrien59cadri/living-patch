# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Geo-Aware Species Status (Native / Invasive / Introduced)

The same species can have completely different ecological standing depending on geography.
Porcelainberry (*Ampelopsis glandulosa*) is an aggressive invasive in Pennypack PA — yet it
is native and ecologically integrated in eastern Asia. The system must encode this without
treating status as a global species property.

#### Why "just add a status field" is not enough

The current `Species` record is already region-scoped via `region: string`. Adding a flat
`status` field to that record is correct and sufficient *within a single pack*. The real
design challenge emerges when multiple packs are loaded simultaneously and the same Latin
name appears with *different statuses* across regions. That cross-pack case needs explicit
handling so the UI surfaces "invasive here, native there" rather than silently picking one.

#### Proposed data model

**On the `Species` record** (one status per region-scoped entry):

```ts
status?: 'native' | 'introduced' | 'naturalized' | 'invasive' | 'endemic' | 'extirpated';
status_authority?: string;   // e.g. "PA DCNR", "USDA PLANTS", "IUCN"
status_notes?: string;       // optional human-readable context
```

Because `region` already scopes the record, this is geo-specific with no additional key.
A species that appears in two packs simply has two records with two statuses.

**No new `geo_status` array needed at this stage.** The multi-region story is handled by the
merged-dataset layer, not by embedding a region map inside each record.

#### Cross-pack status collision handling

When two loaded packs share the same `latin_name` with different `status` values, the
merged dataset should *preserve both records* rather than deduplicate them. The app layer
needs a new collision class — "status divergence" — distinct from true duplicates:

- `pack-tools` conflict resolver: add `status_divergence` detection alongside existing
  duplicate logic; emit a warning (not an error) so authors know the divergence is intentional.
- App `useDataset` / index layer: when a species detail page is requested by Latin name
  and multiple region records exist, aggregate them into a `StatusByRegion` view:
  `[{ region: 'northeast_pa', status: 'invasive' }, { region: 'east_asia', status: 'native' }]`.

#### Implementation phases

**Phase A — Schema & pack data (no UI changes)**
- Add `status`, `status_authority`, `status_notes` to the `Species` Zod schema (all optional).
- Add status values to `pack-tools/lib/schema.ts` and regenerate JSON Schema.
- Annotate existing `0-base` species that are known invasives in NE PA
  (porcelainberry, Japanese barberry, garlic mustard, multiflora rose, tree-of-heaven, etc.).
- Add `status_divergence` detection to `pack-tools/lib/conflicts.ts`.

**Phase B — Display**
- Status badge on `SpeciesTile` and `DetailPage`: coloured chip
  (`invasive` → red-orange, `introduced` → amber, `native` → green, `endemic` → teal,
  `naturalized` → blue-grey, `extirpated` → grey strikethrough).
- On `DetailPage`, when multiple region records exist for the same Latin name, show a
  "Status varies by region" section listing each region and its status.
- Tooltip / expandable panel explaining what each status means ecologically.

**Phase C — Filter & highlight**
- Extend `FilterState` with `statuses: string[]`.
- Filter chips in `FilterPanel` for status (multi-select).
- "Invasives only" quick-filter shortcut on the home page.
- Optional: highlight invasive species with a subtle visual treatment in the species list
  (e.g., left border accent) so they stand out without requiring an active filter.

**Phase D — Pack authoring guidance**
- `pack-tools` lint rule: warn if a `form: 'plant'` or `form: 'tree'` species has no `status`
  field (plants are the primary invasive concern).
- CLI output for `status_divergence` collisions explains the intentional multi-region pattern.
- Document the convention in pack authoring docs.

#### Open questions
- Should `status` be required for all species, or only for certain `form` values?
  (Plants/trees are the clear priority; birds and mammals rarely classified as invasive in
  the same legal/ecological sense, though brown-headed cowbirds and feral hogs are edge cases.)
- When both packs are loaded and a species is `invasive` in the user's active region but
  `native` elsewhere, should the badge show the *local* status, the *worst-case* status, or
  both? Recommendation: default to active-region status; show full breakdown on detail page.
- Authority field: free text for now; could become a controlled vocabulary later
  (PA DCNR, NJ DEP, USDA PLANTS, iNaturalist status, etc.).

**Impact**: Grounds species learning in place — the same plant can be a welcome wildflower or
an ecological threat depending on where you are standing. Directly supports the Pennypack PA
use case and generalises cleanly to any multi-region dataset.

### 2. Plant Trait Expansion: Allergen & Reproduction Info
Extend plant species data with human health and reproduction information:
- Add allergen classification (highly allergenic, mildly allergenic, non-allergenic)
- Document mode of reproduction (seed, vegetative, fragmentation, etc.)
- Display on species cards to help users identify allergenic plants and understand plant strategies
- Support filtering by allergen status and reproduction type
- Cross-reference with related plants using same reproduction strategy

**Impact**: Provides practical information for users with allergies; enhances understanding of plant ecology and life strategies.

### 8. Organism Type Preferences & Settings Page
Allow users to customize which organism types to track and display:
- **Settings Page**: Add organism type toggles (Mammals, Birds, Reptiles, Amphibians, Insects, Plants, Fungi)
- **Quick Presets**: Provide preset configurations ("Birds Only", "Botanist", "Zoologist", "All Except Fungi", etc.)
- **Dynamic Filtering**: Filter species lists, forms, learn page, and life list based on enabled types
- **Smart Defaults**: Remember preferences across sessions; default to all types enabled
- **Data Preservation**: Keep sightings for disabled types; reappear when re-enabled
- **UX Guidance**: Show count of hidden sightings and helpful messages when type disabled

**Status**: Full implementation plan in `docs/plan-organism-type-preferences.md`; ready for development (5.5d estimated effort)

**Use Cases**: Bird watchers (birds only), botanists (plants + fungi + insects), zoologists (all animals), pollinators (plants + insects + birds)

### 9. Dynamic Pack Loading (No-Restart)

Replace the current merged-at-build-time `dataset.json` with per-pack JSON files served as static assets. Only `0-base` loads on startup; users can enable or disable additional packs from the Packs page without restarting the app.

- Build step emits `app/public/packs/{id}.json` + a lightweight `manifest.json` (metadata only)
- App fetches `manifest.json` on startup to discover available packs, then fetches only the enabled ones
- Enabled pack list persists to localStorage; pack data is fetched fresh on each load (not stored in localStorage)
- Toggling a pack on fetches its JSON and merges it into the active dataset; toggling off removes it from memory
- Packs page shows all available packs from the manifest, with per-pack loading spinners and error states

**Status**: Specification complete in `plan-dynamic-pack-loading.md`; ready for implementation

---

## Implementation Notes

- **Dataset Structure**: Datasets remain one per pack but are pre-validated and minified during distribution
- **Data Processing**: Deduplication and conflict resolution moved to app layer for flexibility
- **Performance**: Consider caching and indexing strategies for multi-dataset queries
- **User Experience**: Provide clear controls for toggling features and managing data sources
