import { useEnabledPacks } from '../hooks/useActiveDataset';
import { usePacksStore } from '../stores/packs';

export default function PacksPage() {
  const enabledPacks = useEnabledPacks();
  const togglePack = usePacksStore((state) => state.togglePack);

  const totalSpecies = enabledPacks.reduce((sum, p) => sum + (p.data.species?.length || 0), 0);
  const totalGroups = enabledPacks.reduce((sum, p) => sum + (p.data.taxonomic_groups?.length || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-emerald-900">Data Packs</h1>

      <p className="text-stone-600 mb-8">
        {enabledPacks.filter((p) => p.enabled).length} of {enabledPacks.length} pack{enabledPacks.length !== 1 ? 's' : ''} enabled
        ({totalSpecies} species, {totalGroups} taxonomic groups)
      </p>

      <div className="grid gap-4">
        {enabledPacks.map((pack) => {
          const speciesCount = pack.data.species?.length || 0;
          const groupCount = pack.data.taxonomic_groups?.length || 0;
          const symbiosisCount = pack.data.symbiosis?.length || 0;
          const relationsCount = pack.data.relations?.length || 0;

          return (
            <div
              key={pack.metadata.id}
              className={`rounded-lg border p-6 transition-all ${
                pack.enabled
                  ? 'bg-white border-stone-200 hover:shadow-md'
                  : 'bg-stone-50 border-stone-300 opacity-60'
              }`}
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
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    pack.metadata.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {pack.metadata.status || 'published'}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pack.enabled}
                      onChange={() => togglePack(pack.metadata.id)}
                      className="w-4 h-4 rounded border-stone-300 text-emerald-600 accent-emerald-600"
                    />
                    <span className="text-xs font-medium text-stone-600">
                      {pack.enabled ? 'On' : 'Off'}
                    </span>
                  </label>
                </div>
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
                    {!pack.enabled && <span className="text-stone-400 ml-1">(hidden)</span>}
                  </div>
                )}
                {groupCount > 0 && (
                  <div>
                    <span className="font-medium text-emerald-700">{groupCount}</span> taxonomic group{groupCount !== 1 ? 's' : ''}
                    {!pack.enabled && <span className="text-stone-400 ml-1">(hidden)</span>}
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
