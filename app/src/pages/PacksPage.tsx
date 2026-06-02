import { usePacksStore } from '../stores/packs';

export default function PacksPage() {
  const { manifest, enabledPackIds, loadingPackIds, errorPackIds, togglePack, retryPack } = usePacksStore();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-emerald-900">Data Packs</h1>

      <p className="text-stone-600 mb-8">
        {manifest.length} pack{manifest.length !== 1 ? 's' : ''} available.
        Enabled packs are loaded into memory; only <strong>0-base</strong> loads by default.
      </p>

      <div className="grid gap-4">
        {manifest.map((entry) => {
          const isEnabled = enabledPackIds.includes(entry.id);
          const isLoading = loadingPackIds.includes(entry.id);
          const hasError = errorPackIds.includes(entry.id);

          return (
            <div
              key={entry.id}
              className={[
                'bg-white rounded-lg border p-6 transition-all relative',
                isEnabled && !isLoading
                  ? 'border-stone-200 hover:shadow-md'
                  : 'border-stone-100 opacity-60',
              ].join(' ')}
            >
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                  <span className="text-sm text-stone-500 animate-pulse">Loading pack…</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-emerald-900">
                    {entry.id}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    v{entry.version}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    entry.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {entry.status || 'published'}
                  </span>
                  {/* Toggle switch */}
                  <button
                    onClick={() => { void togglePack(entry.id); }}
                    disabled={isLoading}
                    aria-label={isEnabled ? `Disable ${entry.id}` : `Enable ${entry.id}`}
                    className={[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:cursor-not-allowed',
                      isEnabled ? 'bg-emerald-500' : 'bg-stone-300',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        isEnabled ? 'translate-x-6' : 'translate-x-1',
                      ].join(' ')}
                    />
                  </button>
                </div>
              </div>

              {entry.description && (
                <p className="text-sm text-stone-600 mb-4">
                  {entry.description}
                </p>
              )}

              {/* Error state */}
              {hasError && (
                <div className="mb-3 flex items-center gap-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
                  <span>Failed to load pack.</span>
                  <button
                    onClick={() => { void retryPack(entry.id); }}
                    className="underline hover:no-underline text-red-700 font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Counts — always from manifest */}
              <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                {entry.speciesCount > 0 && (
                  <div>
                    <span className="font-medium text-emerald-700">{entry.speciesCount}</span> species
                  </div>
                )}
                {entry.groupCount > 0 && (
                  <div>
                    <span className="font-medium text-emerald-700">{entry.groupCount}</span> taxonomic group{entry.groupCount !== 1 ? 's' : ''}
                  </div>
                )}
                {entry.symbiosisCount > 0 && (
                  <div>
                    <span className="font-medium text-emerald-700">{entry.symbiosisCount}</span> symbiosis relation{entry.symbiosisCount !== 1 ? 's' : ''}
                  </div>
                )}
                {entry.relationsCount > 0 && (
                  <div>
                    <span className="font-medium text-emerald-700">{entry.relationsCount}</span> relation{entry.relationsCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500">
                <p>Author: {entry.author}</p>
                <p>Created: {new Date(entry.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
