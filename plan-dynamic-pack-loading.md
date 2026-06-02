# Plan: Dynamic Pack Loading (No-Restart)

## Context

Currently `build-dataset.js` merges **all** published packs into a single `dataset.json` which is statically imported into the app bundle at build time. The Packs page toggle exists but only hides packs from the UI — all data is always in memory. This plan replaces that with true lazy loading: only `0-base` loads on startup; other packs can be fetched and loaded/unloaded at runtime without a page refresh.

---

## Architecture

### Build step (modified)

Instead of merging all packs into one blob, `build-dataset.js` will:

1. For each published pack: validate, attach image data to species objects, write the processed pack to `app/public/packs/{id}.json`
2. Write `app/public/packs/manifest.json` — a lightweight array of `PackMetadata` objects (no species data, just id, version, status, description, author, counts)

Pack files are served as static assets fetched at runtime. `dataset.json` is eliminated.

### Runtime model

On app start:
1. Fetch `manifest.json` → populate "available packs" list (shown in UI)
2. Fetch each pack listed in `enabledPackIds` (persisted in localStorage, defaults to `['0-base']`) → load into memory

When user enables a pack: `fetch(/packs/{id}.json)` → add to `loadedPacks` state → `buildIndexes()` re-runs  
When user disables a pack: remove from `loadedPacks` → `buildIndexes()` re-runs

### Persistence

Zustand store persists only `enabledPackIds` (a string array). Pack data itself is NOT stored in localStorage (too large). On every page load, enabled packs are re-fetched from the server.

---

## File Changes

### `build-dataset.js`

- Replace single-file output with per-pack file output to `app/public/packs/`
- Generate `app/public/packs/manifest.json` (metadata + counts only)
- Keep all existing validation (duplicate ID detection, draft filtering, image attachment)

### `app/public/packs/` *(new, gitignored)*

Generated at build time. Contains:
- `manifest.json`
- `0-base.json`, `1-france.json`, etc.

### `app/src/data/index.ts`

- Remove static `import rawDataset from './dataset.json'`
- Keep and export only `buildIndexes()` and related types
- Remove `loadedPacks` export (moves to store)

### `app/src/data/dataset.json`

Delete — no longer generated.

### `app/src/stores/packs.ts` *(full rewrite)*

```typescript
interface PacksState {
  manifest: PackMetadata[];        // available packs (from manifest.json)
  loadedPacks: LoadedPack[];       // packs with data in memory
  enabledPackIds: string[];        // persisted; defaults to ['0-base']
  loadingPackIds: string[];        // in-flight fetches
  errorPackIds: string[];

  initializePacks: () => Promise<void>;  // fetch manifest + all enabled packs
  togglePack: (packId: string) => void;  // enable = fetch+load, disable = unload
  isPackEnabled: (packId: string) => boolean;
  isPackLoading: (packId: string) => boolean;
}
```

Persist only `enabledPackIds`. `initializePacks()` is called once on app mount.

### `app/src/App.tsx`

Add `useEffect(() => { initializePacks() }, [])` at the root to trigger startup loading.

### `app/src/pages/PacksPage.tsx`

- Source available packs from `manifest` (all packs shown, loaded or not)
- Show species/group/symbiosis counts only when pack is loaded
- Toggle: enabling triggers fetch + load; disabling unloads from memory
- Per-pack loading spinner while fetching
- Error state if fetch fails (with retry option)
- Note in UI that `0-base` is the default pack

### Consumers of `loadedPacks`

Any component that reads `loadedPacks` from `'../data'` must switch to `usePacksStore().loadedPacks`. The `buildIndexes()` call becomes a `useMemo` derived from `loadedPacks` in whatever component/hook needs the indexes, or can be computed inside the store itself.

---

## Build & Dev Workflow

```jsonc
// package.json scripts (unchanged interface)
"build:dataset": "node build-dataset.js"   // now writes to app/public/packs/
"build": "npm run build:dataset && cd app && npm run build"
"dev": "npm run build:dataset && cd app && npm run dev"
```

Add `app/public/packs/` to `.gitignore`.

---

## Verification

1. `node build-dataset.js` → `app/public/packs/` contains `manifest.json`, `0-base.json`, `1-france.json`
2. `npm run dev` → app loads; only `0-base` species appear in species list
3. Packs page → both packs listed from manifest; only `0-base` toggled on
4. Enable `1-france` → network tab shows fetch of `1-france.json`; French species appear immediately
5. Disable `1-france` → French species gone, no page reload
6. Reload page → `0-base` auto-loaded; `1-france` auto-loaded if it was enabled (localStorage)
7. `npm run build` → `dist/packs/` contains all pack files; app works offline from `dist/`
