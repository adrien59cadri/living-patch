# 🌿 LivingPatch MVP — Dataset Explorer

A personal ecological literacy tool for exploring NE Pennsylvania species and their relationships. **Phase 1 (MVP)**: read-only local webapp — no server, no accounts, fully offline.

## Quick Start

```bash
cd app
npm install  # If first time
npm run dev  # Start dev server
```

**Open**: http://localhost:5174/

## Features

✨ **Search**: Full-text across species name, description, and tags  
🔍 **Filter**: Form, season, habitat (multi-select, combinable)  
🦅 **Species Cards**: Detail view with functional description, life stages, relationships  
🔗 **Relationships**: Grouped by symbiosis type (mutualism, parasitism, predation, etc.)  
📱 **Responsive**: Mobile-first design  
⚡ **Offline**: Zero network requests, fully local  

## What's Included

- **~30 species** (birds, mammals, plants, insects) + 8 species groups
- **~50 ecological relationships** (symbiosis entries)
- **Full-text search** across name, description, and all tags
- **Multi-select filters** by form, season, habitat
- **Relationship grouping** with obligate relationships pinned at top

## Try These

1. **Search**: Type "milkweed" or "monarch"  
2. **Filter**: Click "butterfly" + "summer"  
3. **Navigate**: Click a species → see detail card → click a related species
4. **Offline**: Open DevTools → Network → offline mode (app still works!)

## Project Structure

```
app/src/
  types/
    index.ts          → TypeScript interfaces
  data/
    dataset.json      → Species database
    index.ts          → Data loading + indexing
  components/
    SearchBar.tsx, FilterPanel.tsx, SpeciesList.tsx,
    SpeciesCard.tsx, RelationshipsPanel.tsx, etc.
  pages/
    HomePage.tsx      → Search + filter + list
    DetailPage.tsx    → Species detail + relationships
  lib/
    filters.ts, relationships.ts, labels.ts
```

## Tech Stack

- **React 18** + TypeScript (strict mode)
- **Vite** (fast dev server)
- **TailwindCSS v4** (responsive styling)
- **React Router v6** (HashRouter for offline use)

## Documentation

- **[PLAN.md](PLAN.md)** — Architecture and implementation plan
- **[TODO.md](TODO.md)** — Task checklist (MVP complete ✅)
- **[MEMORY.md](MEMORY.md)** — Dev notes and conventions
- **[.instructions.md](.instructions.md)** — Development guide
- **[.copilot-instructions.md](.copilot-instructions.md)** — Copilot context
- **[.claude.md](.claude.md)** — Claude development guidance
- **[.prompt.md](.prompt.md)** — Custom prompt template for asking for help
- **[livingpatch-product-definition.md](livingpatch-product-definition.md)** — Full product spec

## What's NOT Included (Phase 1)

- Sighting logging (Phase 2)
- Life lists / personal tracking (Phase 2)
- Multiple locations / areas (Phase 3)
- Photo or sound identification (out of scope)
- Social features (never)
- Accounts or server (until explicitly needed)

## Build for Production

```bash
cd app
npm run build    # Creates dist/
npm run preview  # Serve dist/ locally
```

## Demo Verification

The app is fully functional. To verify:

1. **Search works**: Type any word in search box
2. **Filters work**: Click filter chips, combine multiple filters
3. **Navigate**: Click species tile → detail page → click related species
4. **Offline**: DevTools → Network → offline mode → app still responds
5. **No errors**: DevTools Console should be empty
6. **No network**: DevTools Network tab shows zero requests after initial load

## Data Model

Each species has:
- Name, scientific name, form (bird, butterfly, tree, etc.)
- Habitat, diet, behavior, season
- Functional description (ecological role)
- Life stages (with icons and active months)
- Keystone flag (if ecosystem engineer, predator, etc.)

Each relationship (symbiosis) has:
- Type: mutualism, parasitism, predation, competition, commensalism
- Members: the two species involved
- Obligate: true if one species requires the other
- Notes: context about the relationship

## Future Phases

**Phase 2**: Logging sightings, personal life list, familiarity tiers  
**Phase 3**: Multiple locations, area-based comparisons  
**PWA/Mobile**: Install-to-home-screen, React Native bridge

## Questions?

See [.instructions.md](.instructions.md) for development guide or [.prompt.md](.prompt.md) for the custom prompt template.
