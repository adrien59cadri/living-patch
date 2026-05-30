# LivingPatch Phase 2: Life List Implementation Plan

## Context

LivingPatch is a React + TypeScript ecological data explorer (Phase 1 MVP complete: read-only species exploration). Phase 2 adds personal observation tracking with sighting logging, familiarity tiers, calendar view, and statistics.

**Why**: Users need to track observed species, progressively learn about them (through familiarity tiers), and view their observation history. This transforms the app from read-only to a personal naturalist's logbook.

**Priority**: UX-first (beautiful, intuitive sighting logging interface)

**Scope**: Full Phase 2 including sighting logging + life list + familiarity tiers + calendar view + statistics

**Estimated effort**: 3-4 weeks

---

## Data Model & Architecture

### Type Definitions (update `app/src/types/index.ts`)

```typescript
export type FamiliarityTier = 'noticed' | 'familiar' | 'know-it-well' | 'steward';

export interface Sighting {
  id: string; // UUID
  speciesId: string;
  date: string; // ISO 8601: YYYY-MM-DD
  location?: string; // "backyard", "pond", etc.
  notes?: string;
  conditions?: {
    weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    time?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  createdAt: number; // timestamp
}

export interface LifeListEntry {
  speciesId: string;
  tier: FamiliarityTier;
  firstSightedDate?: string;
  sightingCount: number;
  lastUpdated: number;
}
```

### localStorage Schema

**Key**: `living-patch-life-list-v1`

Stores:
- `version: 1` (for future migrations)
- `entries: LifeListEntry[]` (one per observed species)
- `sightings: Sighting[]` (all observations)

**Storage**: Data is stored entirely in the browser via `localStorage`. No server, no cloud sync, no accounts — 100% offline. (IndexedDB is an option if sightings volume grows very large in future phases, but localStorage is sufficient for Phase 2.)

**Critical design decision**: Tier is explicitly set by the user, not auto-calculated from sighting count. A first sighting can be marked as "Steward" if desired. Sighting count is a separate metric.

---

## State Management: Zustand Store

**File**: `app/src/stores/lifeList.ts`

- Use Zustand with persist middleware for automatic localStorage sync
- Store methods:
  - `addSighting(sighting)` — creates entry if needed, increments count
  - `setTier(speciesId, tier)` — updates user's tier choice
  - `getTier(speciesId) → FamiliarityTier | null`
  - `getSightings(speciesId) → Sighting[]`
  - `getSightingCount(speciesId) → number`
  - `getEntriesForTier(tier) → LifeListEntry[]`
  - `getTierProgress() → { [tier]: count }`

**Hook wrapper** (`app/src/hooks/useLifeList.ts`):
- `useLifeList()` — full store access
- `useSpeciesTier(speciesId)` — just the tier for a species
- `useSpeciesSightings(speciesId)` — just sightings for a species

Install: `npm install zustand`

---

## Component Architecture

### New Components (10 files)

**Logging**:
- `app/src/components/SightingModal.tsx` — Form: date, location, notes, optional weather/time. Shows species name at top. Stays open after save for batch logging.
- `app/src/components/TierSelector.tsx` — 4 buttons (Noticed → Familiar → Know It Well → Steward). Current tier highlighted. Updates store immediately on click.
- `app/src/components/RecentSightings.tsx` — Shows last 3-5 sightings for a species (in SpeciesCard).
- `app/src/components/SpeciesTierBadge.tsx` — Visual tier indicator icon + label (used in SpeciesTile, SpeciesCard).

**Views**:
- `app/src/pages/LifeListPage.tsx` — Main life list view with 4-tab navigation
- `app/src/components/LifeList/AllSpeciesTab.tsx` — Filterable by tier; sortable by date, count, name
- `app/src/components/LifeList/ByTierTab.tsx` — 4 sections (one per tier) with species lists
- `app/src/components/CalendarView.tsx` — Month view; colored dots for sightings; click day for details
- `app/src/components/StatsPanel.tsx` — Total observed, species per tier chart, sightings per month, top 5

**Summary**:
- `app/src/components/LifeListStats.tsx` — Summary bar for HomePage (e.g., "25 species, 5 steward")

### Modified Components (4 files)

- `app/src/components/LogSightingButton.tsx` — Remove `disabled` attribute; wire to SightingModal
- `app/src/components/SpeciesCard.tsx` — Add TierSelector + RecentSightings + wire LogSightingButton
- `app/src/components/SpeciesTile.tsx` — Add SpeciesTierBadge and sighting count badge
- `app/src/pages/HomePage.tsx` — Add LifeListStats summary bar at top

### Utilities & Store (3 files)

- `app/src/stores/lifeList.ts` — Zustand store with persist middleware
- `app/src/hooks/useLifeList.ts` — Hook wrappers
- `app/src/lib/lifeListUtils.ts` — Helper functions (tier colors, labels, calculations)

### Routing (1 file)

- `app/src/App.tsx` — Add route `/life-list` → `<LifeListPage />` + header link

---

## Architecture Overview

```
localStorage (living-patch-life-list-v1)
    ↓
Zustand Store (app/src/stores/lifeList.ts)
    ↓
Hook Wrappers (app/src/hooks/useLifeList.ts)
    ↓
Components:
  ├─ SpeciesCard (DetailPage): TierSelector + RecentSightings + SightingModal
  ├─ SpeciesTile (HomePage): SpeciesTierBadge + count
  ├─ HomePage: LifeListStats bar
  └─ LifeListPage (/life-list):
     ├─ AllSpeciesTab
     ├─ ByTierTab
     ├─ CalendarView
     └─ StatsPanel
```

All Phase 2 components consume from Zustand store via hooks. Store auto-persists to localStorage. On app load, Zustand rehydrates from localStorage automatically.

---

## Implementation Sequence

### Phase 2a: Foundation (Week 1)
1. `npm install zustand`
2. Create data types in `app/src/types/index.ts` (`Sighting`, `LifeListEntry`, `FamiliarityTier`)
3. Create Zustand store: `app/src/stores/lifeList.ts`
4. Create hook wrappers: `app/src/hooks/useLifeList.ts`
5. Create utilities: `app/src/lib/lifeListUtils.ts` (tier colors, labels, calculations)
6. Create `SpeciesTierBadge.tsx`
7. Enable LogSightingButton (remove `disabled`)
8. Write unit tests for store

### Phase 2b: Core Logging (Week 2)
9. Create `SightingModal.tsx` — form with date, location, notes, optional weather/time
10. Wire SightingModal to DetailPage (LogSightingButton opens it)
11. Create `TierSelector.tsx` — 4 tier buttons
12. Add TierSelector to DetailPage (inside SpeciesCard)
13. Create `RecentSightings.tsx` — display last sightings
14. Add RecentSightings to SpeciesCard
15. Update SpeciesTile to show tier badge + sighting count
16. Create `LifeListStats.tsx` and add to HomePage
17. Write E2E tests: log sighting → set tier → verify persistence

### Phase 2c: Life List Page (Week 2-3)
18. Create `LifeListPage.tsx` with tab navigation
19. Create `AllSpeciesTab.tsx` — filterable by tier, sortable
20. Create `ByTierTab.tsx` — 4 sections by tier
21. Create `CalendarView.tsx` — month view with sighting dots
22. Create `StatsPanel.tsx` — charts and insights
23. Add route to `App.tsx`: `/life-list` + header link
24. Ensure responsive design (mobile-first)

### Phase 2d: Verification & Polish (Week 3-4)
25. localStorage persistence tests (reload page, data intact)
26. Offline mode testing (DevTools)
27. Performance testing (100+ sightings, no jank)
28. Mobile testing (375px, 768px breakpoints)
29. Accessibility audit (ARIA labels, keyboard nav, contrast)
30. Update CLAUDE.md and MEMORY.md
31. Bug fixes and polish

---

## User Flows

### Logging a Sighting
1. User views species detail page
2. Clicks "Log sighting" button
3. SightingModal opens with species name pre-filled
4. Fills date (defaults to today), location, notes
5. Optional: expands "advanced" for weather/time
6. Clicks Save → Zustand store updates, localStorage persists
7. Toast confirmation, modal stays open (can log another)
8. Closes modal → SpeciesCard re-renders with updated RecentSightings

### Setting a Tier
1. On DetailPage, user clicks a tier button in TierSelector
2. Zustand store updates immediately
3. SpeciesCard re-renders (current tier highlighted)
4. Tier badge updates on SpeciesTile in list view
5. If user navigates to LifeListPage, reflects in all views

### Viewing Life List
1. Click "Life List" in header
2. Navigate to `/life-list`
3. Default tab: AllSpeciesTab (all observed species with tier and count)
4. Tabs: All → By Tier → Calendar → Stats
5. Calendar shows sighting dots (color-coded by tier); click day to see details
6. Stats show total, distribution by tier, sightings per month, top 5 species

---

## Critical Design Decisions

| Decision | Why |
|----------|-----|
| **Zustand over Context** | Simpler mutations, better perf for frequent state changes |
| **Tier is explicit** | Users may want to mark a species as "Steward" on first sighting |
| **Modal for logging** | Keeps focus on species, allows batch logging |
| **Tier selector inline** | Direct feedback without navigation |
| **Calendar as tab** | All life list tools in one place |
| **localStorage schema v1** | Versioning allows future schema changes without data loss |
| **Form-based sighting** | Simple data (date, location, notes) — no photos |
| **Dots vs. full sightings** | Reduces calendar visual clutter; click for details |

---

## Mobile-First Design

- SightingModal: full-height on mobile; use native browser date picker
- TierSelector: 2×2 grid on mobile, single row on tablet+
- CalendarView: responsive grid; stacked dots if multiple sightings per day
- LifeListPage tabs: sticky to top for easy switching
- StatsPanel: stack charts vertically on mobile
- SpeciesTile badges: right-aligned for readability

---

## Testing Strategy

### Unit Tests
- Store: add sighting, set tier, query functions, tier progress counts
- Utilities: tier colors, labels, grouping sightings by date
- Hooks: `useSpeciesTier()`, `useSpeciesSightings()`

### Component Tests
- SightingModal: form submission, date defaults, store updates
- TierSelector: button clicks, tier highlighting, store updates
- CalendarView: day rendering, color coding, click handlers

### E2E Tests
1. Log sighting on species → verify in calendar + stats
2. Set tier on detail page → verify badge on list view
3. Log 3 sightings → verify count + tier progress
4. Reload page → verify life list persisted (localStorage)
5. Offline mode → log sighting + set tier → reload → data intact

### Manual Testing
- Mobile responsiveness (375px iPhone, 768px iPad)
- Browser offline mode (DevTools)
- Large dataset (100+ sightings, no jank)
- Keyboard navigation (tab, enter, arrow keys)

---

## Verification Checklist for Completion

- [ ] All 10 new components created and functional
- [ ] All 4 existing components updated
- [ ] Zustand store with persist middleware working
- [ ] localStorage survives page reload
- [ ] LogSightingButton enabled and opens modal
- [ ] Tier selector on DetailPage works
- [ ] CalendarView renders sightings correctly
- [ ] StatsPanel calculations accurate
- [ ] LifeListPage has all 4 tabs
- [ ] Mobile responsive (375px, 768px)
- [ ] Keyboard navigation functional
- [ ] No TypeScript errors (`npm run build`)
- [ ] All new unit tests passing
- [ ] E2E workflows verified
- [ ] Offline mode tested
- [ ] Browser console clean
- [ ] ARIA labels on interactive elements
- [ ] Documentation updated (MEMORY.md, CLAUDE.md)

---

## Future Extensions (Not Phase 2)

- Tier auto-progression (Phase 2.5)
- Drag-to-reorder species between tiers (Phase 2.5)
- Location/map view (Phase 3)
- Export to CSV/JSON (Phase 3)
- Multi-dataset sighting tracking (Phase 4)
- Social: share life lists, compare progress (Phase 5)
