# LivingPatch — Product Definition

## Vision

A personal ecological literacy tool. Helps nature hobbyists — birders, gardeners, naturalists — understand *why* they see what they see together. Not a species ID app. Not social. Quietly personal.

---

## Core Principles

- **Relationships first.** Every species is shown in context of what it eats, hosts, pollinates, and competes with.
- **No in-app recognition.** No photo or sound identification. Users identify species externally (Merlin, Google Lens, iNaturalist) and return to log or explore.
- **No social layer.** No sharing, leaderboards, or public profiles. Ever.
- **Local-first.** MVP is a local webapp, no server required. Data lives on the device.
- **Functional, not taxonomic.** Species described by what they *do* ecologically, not by Latin classification.

---

## Phased Roadmap

### Phase 1 — MVP: Dataset Explorer (local webapp)
Browse and explore species and their ecological relationships from a curated NE Pennsylvania dataset. No logging, no account, no server.

### Phase 2 — Logging + Life List
Log sightings. Build a personal life list across species and time. Track familiarity tiers.

### Phase 3 — Multiple Locations
Assign sightings to user-defined areas (yard, park, preserve). Compare what you've seen across places.

### Out of Scope (all phases)
- Social features, sharing, or public data
- In-app photo or sound recognition
- Server-side storage or accounts (until explicitly chosen)
- Gamification (XP, streaks, badges)

---

## Data Model

### Species
Each species has:
- Functional description (plain language: what it does, when, where)
- Form, habitat, diet, behavior tags
- Season / active months (range notation: `Jun-Aug`)
- Life stages with findable months
- Keystone flag + role

### Symbiosis
Ecological relationships between two species:

| Type | Both impacted? | `impacted_species` |
|---|---|---|
| Mutualism | Both benefit | — |
| Commensalism | One benefits, one neutral | benefiting species |
| Parasitism | One benefits, one harmed | benefiting species |
| Predation | One benefits, one dies | predator |
| Competition | Neither benefits | — |

Attributes: `members [A, B]`, `impacted_species`, `obligate`, `notes`

### Relations
Non-directional groupings: taxonomic relatives, habitat associates.
Attributes: `members [A, B, ...]`, `type`, `notes`

---

## MVP Screens

### 1. Home — Species List
- Full species list, searchable
- Filter by: form (bird, tree, butterfly…), season, habitat
- Each entry: common name, short functional description, keystone badge if applicable
- Groups shown with lighter styling, not tappable to full card
- No area selector in MVP (single implicit region: NE Pennsylvania)

### 2. Species Card
- Photo placeholder area
- Common name + optional Latin name (collapsed by default)
- Functional description
- Tag row: form · habitat · diet · behavior · season
- Life stages row: icons + name + months. Grey = not yet logged (Phase 2)
- Relationships panel (see below)

### 3. Relationships Panel (within Species Card)
Organized by symbiosis type:
- **Mutualism** — pollinators, seed dispersers, shelter providers
- **Parasitism / Host** — what this species hosts or depends on (obligate flagged prominently)
- **Predation** — what eats this, what this eats
- **Related species** — same genus/family group

Each entry is a tappable tile navigating to that species' card.
Obligate relationships always pinned at top of their section.
Max 6 tiles per section; overflow collapsed.

### 4. Search
- Full-text search across common name, functional description, tags
- Instant filter, no server call

---

## MVP Technical Spec

| Attribute | Choice |
|---|---|
| Delivery | Local web app (HTML/CSS/JS or React) |
| Data | Static JSON dataset bundled at build time |
| Storage | None in Phase 1; localStorage in Phase 2 |
| Server | None |
| Auth | None |
| Offline | Full — no network dependency |
| Future | Progressive Web App → React Native phone app |

### Dataset (Phase 1)
- ~39 species/groups, NE Pennsylvania
- 50 symbiosis entries, 8 relation entries
- Fully self-contained JSON, no external calls
- ID format: `type_common-name-slug` (e.g. `plant_common-milkweed`)

---

## Phase 2 Additions (Logging + Life List)

### New Screens
- **Log Sighting modal** — species picker, date, optional note. No photo.
- **Life List** — all logged species. Filter by form, season. Count by type.

### New Data (localStorage)
```json
{
  "sightings": [
    { "species_id": "plant_common-milkweed", "date": "2025-06-14", "note": "" }
  ]
}
```

### UI Changes to Existing Screens
- Species card: life stages turn green when logged
- Relationship tiles: green border when both sides logged (relationship "confirmed")
- Home list: logged species marked

### Familiarity Tiers (auto-derived from sighting count)
Noticed → Familiar → Know It Well → Steward
Icon-based, no numbers shown.

---

## Phase 3 Additions (Multiple Locations)

### New Concept: Area
User-defined location with a type (yard, garden, park, riparian, preserve, forest, wetland).
Optional GPS pin. Purely personal, never shared.

### New Screens
- **Areas list** — manage areas
- **Area view** — species logged in this area; relationships observed here

### UI Changes
- Area selector added to Home and Life List
- Species card shows "seen in: [area list]"

---

## What LivingPatch Is Not

- Not an ID app. Identification happens outside the app.
- Not a field guide. Descriptions are relational, not encyclopedic.
- Not social. No accounts until strictly necessary for sync/backup.
- Not gamified. No points, streaks, or completion pressure.
