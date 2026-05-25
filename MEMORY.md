# LivingPatch MVP — Dev Memory

## Project
- Personal ecological literacy tool — NE Pennsylvania species dataset explorer
- Phase 1: read-only webapp, no backend, no accounts

## Tech Stack
- React 18 + TypeScript + Vite + TailwindCSS
- React Router v6 for navigation
- Zustand planned for Phase 2 (logging)

## Dataset Facts
- File: `livingpatch-mvp-dataset.json` (also `src/data/dataset.json`)
- Arrays: `species`, `symbiosis`, `relations`, `life_stages_phenology`
- ~30 individual species + ~8 group entries (`is_group: true`)
- ~50 symbiosis entries, ~8 relation entries
- Species ID format: `type_common-name-slug` (e.g. `bird_pileated-woodpecker`)
- Symbiosis types: mutualism, parasitism, predation, competition, commensalism
- Obligate relationships (`obligate: true`) must be pinned top of their section
- Groups are NOT navigable; show with lighter visual treatment in list

## Key Design Decisions
- Search: full-text across common_name, latin_name, functional_description, tags
- Filters: form · season · habitat (multi-select, combinable with search)
- RelationshipsPanel: sections = [Mutualism, Parasitism/Host, Predation, Related species]
- Max 6 tiles per section; "show more" to expand overflow
- No photo or sound ID — photo area is placeholder only
- Latin name collapsed by default on species card
- No external API calls ever (offline-first)

## Conventions (update as established)
- Component files: PascalCase TSX in `src/components/`
- Hooks: camelCase with `use` prefix in `src/hooks/`
- Utilities: camelCase functions in `src/lib/`
- Types: all in `src/types/index.ts`
- Tailwind class order: layout → spacing → color → typography

## Phases
- Phase 2: sighting logging (localStorage), life list, familiarity tiers
- Phase 3: multiple locations (areas), area-based species views
- PWA / React Native: future — keep data layer clean for portability
