# Living Patch Roadmap

## Planned Features (Next Priority)

### 1. Invasive Species Page

A dedicated top-level page where the user picks a region and sees which species in that
pack are invasive there. Kept separate from the main browse list — invasive status is
place-specific, not a universal species property.

**The core insight**: a species is only invasive relative to a location. Porcelainberry is an
aggressive invasive in Pennypack PA and a native plant in eastern Asia. The same Latin name
can appear in two packs with opposite statuses — that is correct, not a conflict. Non-native
= potentially invasive by definition, so any species without native status in a pack is at
minimum worth flagging.

#### Data model changes

**Pack metadata** must declare its region explicitly (currently implied by species `region`
fields, but needs to be a first-class field so the region picker can enumerate options):

```ts
// pack-tools/packs/<id>.json → metadata
region: string;   // e.g. "northeast_pa", "france" — required, mirrors species region values
```

**Species record** gets one optional field:

```ts
invasive?: true;   // present and true = known invasive in this pack's region; absent = not flagged
```

No `status` vocabulary needed at this stage. The binary `invasive` flag is sufficient and
honest: a species is either a documented invasive in this region, or it isn't flagged. The
broader native/introduced/naturalized taxonomy can come later if the data warrants it.

#### New "Invasive Species" page

- Top-level nav entry (alongside Learn, Life List, Packs)
- On first visit: region picker showing all loaded packs that declare a `region`
- After picking: grid/list of species with `invasive: true` in that pack
- Species tiles link to the normal detail page
- Brief intro line: "These species are documented invasives in [region]. Any non-native
  species could also spread — check a local source for the full picture."
- Region can be changed at any time via a chip/selector at the top

#### What stays the same

- Main browse list: no status badges added, invasive species appear normally
- Detail page: no status section (invasive context lives on the dedicated page)
- Species IDs and pack structure: unchanged

#### Pack authoring

- `pack-tools` schema: add optional `invasive: true` to species; add required `region` to
  pack metadata (warn on missing, since existing packs already have implicit regions).
- Annotate known invasives in `0-base` for NE PA: porcelainberry, Japanese barberry,
  garlic mustard, multiflora rose, tree-of-heaven, mile-a-minute, burning bush, Norway maple.
- No cross-pack deduplication concern: each pack's invasive list is its own regional answer.

**Impact**: Users walking in Pennypack PA open the page, pick their region, and immediately
see what to watch out for. Zero complexity added to the main browse experience.

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
