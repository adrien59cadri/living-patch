import { loadedPacks } from '../data';
import { usePacksStore } from '../stores/packs';

export default function PacksPage() {
  const { disabledPackIds, togglePack } = usePacksStore();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-emerald-900">Data Packs</h1>

      <p className="text-stone-600 mb-8">
        The dataset is built from {loadedPacks.length} pack{loadedPacks.length !== 1 ? 's' : ''}.
        Disabled packs are hidden from the species list.
      </p>

      <div className="grid gap-4">
        {loadedPacks.map((pack) => {
          const speciesCount = pack.data.species?.length || 0;
          const groupCount = pack.data.taxonomic_groups?.length || 0;
          const symbiosisCount = pack.data.symbiosis?.length || 0;
          const relationsCount = pack.data.relations?.length || 0;
          const isEnabled = !disabledPackIds.includes(pack.metadata.id);

          return (
            <div
              key={pack.metadata.id}
              className={[
                'bg-white rounded-lg border p-6 transition-all',
                isEnabled
                  ? 'border-stone-200 hover:shadow-md'
                  : 'border-stone-100 opacity-50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-emerald-900">
                    {pack.metadata.id}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    v{pack.metadata.version}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    pack.metadata.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {pack.metadata.status || 'published'}
                  </span>
                  {/* Toggle switch */}
                  <button
                    onClick={() => togglePack(pack.metadata.id)}
                    aria-label={isEnabled ? `Disable ${pack.metadata.id}` : `Enable ${pack.metadata.id}`}
                    className={[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
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

              {pack.metadata.description && (
                <p className="text-sm text-stone-600 mb-4">
                  {pack.metadata.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                {isEnabled ? (
                  <>
                    {speciesCount > 0 && (
                      <div>
                        <span className="font-medium text-emerald-700">{speciesCount}</span> species
                      </div>
                    )}
                    {groupCount > 0 && (
                      <div>
                        <span className="font-medium text-emerald-700">{groupCount}</span> taxonomic group{groupCount !== 1 ? 's' : ''}
                      </div>
                    )}
                    {symbiosisCount > 0 && (
                      <div>
                        <span className="font-medium text-emerald-700">{symbiosisCount}</span> symbiosis relation{symbiosisCount !== 1 ? 's' : ''}
                      </div>
                    )}
                    {relationsCount > 0 && (
                      <div>
                        <span className="font-medium text-emerald-700">{relationsCount}</span> relation{relationsCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-stone-400 text-xs italic">0 species active — pack disabled</div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500">
                <p>Author: {pack.metadata.author}</p>
                <p>Created: {new Date(pack.metadata.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
