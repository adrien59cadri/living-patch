import { loadedPacks } from '../data';

export default function PacksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-emerald-900">Data Packs</h1>

      <p className="text-stone-600 mb-8">
        The dataset is built from {loadedPacks.length} pack{loadedPacks.length !== 1 ? 's' : ''}.
      </p>

      <div className="grid gap-4">
        {loadedPacks.map((pack) => {
          const speciesCount = pack.data.species?.length || 0;
          const groupCount = pack.data.taxonomic_groups?.length || 0;
          const symbiosisCount = pack.data.symbiosis?.length || 0;
          const relationsCount = pack.data.relations?.length || 0;

          return (
            <div
              key={pack.metadata.id}
              className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">
                    {pack.metadata.id}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    v{pack.metadata.version}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  pack.metadata.status === 'published'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {pack.metadata.status || 'published'}
                </span>
              </div>

              {pack.metadata.description && (
                <p className="text-sm text-stone-600 mb-4">
                  {pack.metadata.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-stone-600">
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
