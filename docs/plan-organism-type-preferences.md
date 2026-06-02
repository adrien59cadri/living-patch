# Organism Type Preferences Implementation Plan

## Overview

Add a settings page feature that allows users to customize which organism types (forms) they want to track and display in the app. Users can enable/disable any combination of organisms: Mammals, Birds, Reptiles, Amphibians, Insects, Plants, Fungi, etc.

## Problem Statement

The Living Patch app now includes diverse organism types (mammals, birds, reptiles, amphibians, insects, plants, fungi). Different users have different interests:
- A bird watcher may only care about birds
- A botanist may focus on plants
- Someone tracking pollinators may want insects and plants only
- A user may want everything except fungi

Currently, users see all organisms and have no way to customize their view, leading to:
- Visual clutter in species lists
- Irrelevant sighting form fields
- Confusing learn page with many organism types

## Objectives

1. Allow users to select which organism types they want to track
2. Filter species lists, forms, and learn pages based on user preferences
3. Remember preferences across sessions
4. Make it easy to customize at any time
5. Provide preset configurations ("Bird Watcher", "Botanist", "All", etc.)

## Implementation Phases

### Phase 1: Data Model & Storage (Low Effort)
**Files to create/modify:**
- `app/src/store/settingsStore.ts` (or equivalent)
- `app/src/types/Settings.ts` (or equivalent)

**Changes:**
1. Define organism type enum/constants:
   ```typescript
   enum OrganismType {
     MAMMAL = 'mammal',
     BIRD = 'bird',
     REPTILE = 'reptile',
     AMPHIBIAN = 'amphibian',
     INSECT = 'insect',
     PLANT = 'plant',
     FUNGUS = 'fungus'
   }
   ```

2. Add to user settings schema:
   ```typescript
   interface UserSettings {
     // ... existing settings
     enabledOrganismTypes: OrganismType[] // or Set<OrganismType>
     presetName?: string // 'all', 'birds-only', 'botanist', etc.
   }
   ```

3. Implement persistence:
   - Save to `localStorage` under `userSettings.enabledOrganismTypes`
   - Default: all organism types enabled
   - Load on app startup

4. Create utility functions:
   ```typescript
   function isOrganismTypeEnabled(type: string): boolean
   function toggleOrganismType(type: string): void
   function setOrganismTypes(types: string[]): void
   function applyPreset(presetName: string): void
   ```

### Phase 2: Settings UI Component (Medium Effort)
**Files to create/modify:**
- `app/src/pages/SettingsPage.tsx` (or create if doesn't exist)
- `app/src/components/OrganismTypeSelector.tsx` (new)

**Changes:**
1. Create organism type selector component:
   - Grid/list of toggles for each organism type
   - Each toggle shows: icon, label, count of species
   - Visual feedback (enabled/disabled states)

2. Add preset buttons:
   - "All Organisms" - enables all types
   - "All Except Fungi" - enables all except fungi
   - "Birds Only" - only bird type
   - "Plants & Insects" - for pollinators/plants focus
   - "Botanist" - plants, fungi, insects (pollinators)
   - "Zoologist" - all animals (mammals, birds, reptiles, amphibians, insects)
   - Custom button to save current selection as preset

3. Show live preview:
   - Display count of enabled species
   - Show list of affected filters/forms
   - "You will see X species across Y organism types"

4. Add reset button:
   - Restore default (all enabled)

### Phase 3: Form & Filter Integration (Medium-High Effort)
**Files to modify:**
- `app/src/components/SpeciesFilter.tsx`
- `app/src/components/LogSightingForm.tsx`
- `app/src/components/SpeciesForm.tsx`

**Changes:**
1. Filter organism type checkboxes:
   - Hide checkboxes for disabled organism types
   - Show visual indicator "Disabled in settings" if user tries to access

2. Update species selector:
   - Only show species matching enabled organism types
   - Update form options dynamically when settings change

3. Update form fields:
   - Show/hide organism-type-specific fields based on enabled types
   - Example: "Substrate Type" only appears if fungi enabled

4. Add reactive updates:
   - When user changes settings, immediately filter visible species
   - Clear selections of disabled types from any active filters

### Phase 4: Learn Page & Species List Updates (Medium Effort)
**Files to modify:**
- `app/src/pages/LearnPage.tsx`
- `app/src/components/SpeciesCard.tsx`
- `app/src/components/SpeciesList.tsx`

**Changes:**
1. Filter species display:
   - Hide species cards for disabled organism types
   - Filter taxonomy groups (hide groups with no enabled species)
   - Update species counts per category

2. Update navigation:
   - Hide category tabs/sections for disabled types
   - Example: If fungi disabled, don't show "Fungi" tab

3. Update learn page sections:
   - Only show enabled organism type sections
   - Dynamically reorganize layout

4. Search & filter results:
   - Only return species of enabled types in search
   - Update filter options to exclude disabled types

### Phase 5: Life List & Stats Integration (Medium Effort)
**Files to modify:**
- `app/src/store/lifeListStore.ts`
- `app/src/components/StatsPanel.tsx`
- `app/src/components/LifeListView.tsx`

**Changes:**
1. Filter sightings display:
   - Only show sightings of enabled organism types
   - Update species count to reflect enabled types only

2. Update statistics:
   - Recalculate stats for enabled organism types
   - Show "X sightings across Y organism types"
   - Display breakdown by enabled type

3. Preserve data integrity:
   - Don't delete sightings when organism type disabled
   - If user re-enables a type, sightings reappear

### Phase 6: User Guidance & Notifications (Low-Medium Effort)
**Files to modify/create:**
- `app/src/components/DisabledTypeNotice.tsx` (new)
- Settings help text

**Changes:**
1. Add helpful messaging:
   - "Fungi disabled in settings - enable to track fungi sightings"
   - Show on learn page, species list, form if relevant type disabled

2. Show statistics:
   - "You have X hidden sightings (fungi)" in stats
   - Allow temporary re-enable to view

3. First-time user flow:
   - Show organism type selector on first load
   - Optional onboarding: "What are you interested in tracking?"

## UI Mockup

### Settings Page - Organism Types Section

```
┌─────────────────────────────────────────────────┐
│ Organism Types                                  │
│ Choose which organisms to track and display     │
├─────────────────────────────────────────────────┤
│                                                 │
│ QUICK PRESETS:                                  │
│ [All] [Birds Only] [Plants & Insects]           │
│ [Botanist] [Zoologist] [Customize...]           │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ ☑ 🦊 Mammals (47 species)                       │
│ ☑ 🦅 Birds (89 species)                         │
│ ☑ 🐢 Reptiles (63 species)                      │
│ ☑ 🐸 Amphibians (35 species)                    │
│ ☑ 🦋 Insects (204 species)                      │
│ ☑ 🌿 Plants (156 species)                       │
│ ☐ 🍄 Fungi (8 species)                          │
│                                                 │
├─────────────────────────────────────────────────┤
│ Total: 602 species across 6 organism types      │
│ [Reset to Default] [Save Custom Preset]         │
└─────────────────────────────────────────────────┘
```

## Data Structure

### User Settings Update

```typescript
interface UserSettings {
  // ... existing settings (theme, notifications, etc.)
  
  // New organism type preferences
  enabledOrganismTypes: OrganismType[]
  customPresets: {
    name: string
    types: OrganismType[]
  }[]
  lastModified: Date
}

enum OrganismType {
  MAMMAL = 'mammal',
  BIRD = 'bird',
  REPTILE = 'reptile',
  AMPHIBIAN = 'amphibian',
  INSECT = 'insect',
  PLANT = 'plant',
  FUNGUS = 'fungus'
}
```

### Default Presets

```typescript
const ORGANISM_PRESETS = {
  all: {
    name: 'All Organisms',
    types: [MAMMAL, BIRD, REPTILE, AMPHIBIAN, INSECT, PLANT, FUNGUS]
  },
  allExceptFungi: {
    name: 'All Except Fungi',
    types: [MAMMAL, BIRD, REPTILE, AMPHIBIAN, INSECT, PLANT]
  },
  birdsOnly: {
    name: 'Birds Only',
    types: [BIRD]
  },
  botanist: {
    name: 'Botanist',
    types: [PLANT, FUNGUS, INSECT] // pollinators
  },
  zoologist: {
    name: 'Zoologist',
    types: [MAMMAL, BIRD, REPTILE, AMPHIBIAN, INSECT]
  },
  pollinators: {
    name: 'Pollinators & Plants',
    types: [PLANT, INSECT, BIRD]
  }
}
```

## Utility Functions

Create `app/src/utils/organismTypeUtils.ts`:

```typescript
function filterSpeciesByType(
  species: Species[],
  enabledTypes: OrganismType[]
): Species[]

function filterSightingsByType(
  sightings: Sighting[],
  enabledTypes: OrganismType[]
): Sighting[]

function getEnabledSpeciesCount(enabledTypes: OrganismType[]): number

function getOrganismTypeLabel(type: OrganismType): string

function getOrganismTypeIcon(type: OrganismType): string

function getOrganismTypesFromSpecies(species: Species[]): OrganismType[]
```

## Testing Plan

1. **Unit tests:**
   - Settings persistence (save/load)
   - Preset application
   - Organism type filtering functions
   - Species count calculations

2. **Integration tests:**
   - Toggle organism type in settings
   - Verify species list updates
   - Verify form fields update
   - Verify stats update
   - Verify sightings preserved

3. **UI tests:**
   - Settings page renders correctly
   - Preset buttons work
   - Toggles toggle correctly
   - Disabled types hidden from forms
   - Live preview accurate

4. **Edge cases:**
   - All types disabled (show error/re-enable all)
   - No species for enabled type (show "no species" message)
   - Switching presets multiple times
   - Sightings exist for disabled type (verify preserved)

## Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| 1: Data Model & Storage | 0.5d | Settings schema & utils |
| 2: Settings UI | 1d | Component, toggles, presets |
| 3: Form Integration | 1.5d | Filter forms, fields, validation |
| 4: Learn Page & Lists | 1d | Filter species, update layout |
| 5: Life List & Stats | 1d | Filter sightings, recalculate stats |
| 6: UX & Guidance | 0.5d | Notifications, help text |
| **Total** | **5.5d** | ~1 week of development |

## Dependencies

- Existing settings/storage infrastructure
- Species data with consistent `form` field values
- Existing filter & form components

## Success Criteria

- [ ] Users can toggle organism types in settings
- [ ] Settings persist across sessions
- [ ] Species lists filter correctly
- [ ] Forms hide/show fields based on enabled types
- [ ] Sightings only show enabled types
- [ ] Stats update dynamically
- [ ] All sightings preserved when toggling types
- [ ] Preset buttons work correctly
- [ ] At least 5 presets available
- [ ] No broken UI when all types disabled (fallback to all)

## Future Enhancements

1. **Per-region organism filters** - Allow different preferences per region (PA birds, Florida mammals, etc.)
2. **Smart presets** - "Recommended for your interests" based on sighting history
3. **Conditional display** - Show/hide fields based on enabled types (e.g., "Substrate Type" only for fungi)
4. **Import/export presets** - Share preference configurations with other users
5. **Mobile optimization** - Responsive preset buttons and toggle grid
6. **Search filtering** - Apply type filter to search results

## Blockers & Risks

- **Risk**: User disables all organism types
  - *Mitigation*: Prevent all-disabled state; show warning; default to re-enabling all

- **Risk**: Sightings for disabled types could cause confusion
  - *Mitigation*: Preserve data, show count of hidden sightings, provide easy re-enable

- **Risk**: Settings UI complexity if too many organism types
  - *Mitigation*: Use presets as primary interface; toggles as advanced option

- **Risk**: Form validation with hidden fields
  - *Mitigation*: Make disabled type fields truly hidden (not just CSS); validate only visible fields

## Related Features

- **Feature #8: Fungi Support** - Depends on this to allow users to hide fungi if they choose
- **Feature #6: Sighting Depth** - Can integrate habitat context filtering with organism types
- **Feature #7: Familiarity Badges** - Stats should respect organism type preferences

## References

- [Living Patch Settings Architecture](../app/src/store) (if exists)
- [Species Data Structure](../pack-tools/types.ts)
- [Roadmap](../roadmap.md)
