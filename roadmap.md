# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Invasive Species Page

A dedicated top-level page where the user picks a region and sees which species are invasive
there. Kept entirely separate from the main browse list — invasive status is place-specific,
not a universal species property.

#### Data model

Add a new first-class collection to packs — `invasives` — following the same pattern as
`symbiosis` and `relations`. No changes to the existing `Species` type or pack metadata.

```ts
interface Invasive {
  latin_name: string;       // canonical identifier
  common_name?: CommonName;
  region: string;           // where this species is invasive (e.g. "northeast_pa")
  description: string;      // ecological impact narrative — outcompetes, forms monocultures, etc.
}
```

`Dataset` gains an `invasives?: Invasive[]` field. Pack JSON gains an `invasives` array
under `data`, sitting alongside `species`, `symbiosis`, and `relations`.

An invasive entry is self-contained — no cross-references to species records, no relationship
links. The description carries all the relevant context: how it spreads, what it displaces,
why it matters ecologically.

#### New "Invasive Species" page

- Top-level nav entry (alongside Learn, Life List, Packs)
- Region picker: unique `region` values collected from loaded `invasives` entries
- After picking: list of invasive entries for that region; tiles link to the detail page
  if a matching `species_id` exists, otherwise show a minimal card
- Brief intro: "These are documented invasives in [region]. Any non-native species could
  also spread — check a local source for the full picture."
- Region selector persists in user preferences

#### Pack authoring

- `pack-tools` Zod schema: add `invasives` array to pack `data` (optional, validated).
- Populate `0-base` invasives for NE PA: porcelainberry, Japanese barberry, garlic mustard,
  multiflora rose, tree-of-heaven, mile-a-minute, burning bush, Norway maple.
- No deduplication concern: each pack's invasives list is its own regional answer. Same
  Latin name in two packs with different regions is correct data, not a conflict.

**Impact**: Users walking in Pennypack PA open the page, pick their region, and immediately
see what to watch out for. Zero changes to the main browse experience or existing species data.

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
