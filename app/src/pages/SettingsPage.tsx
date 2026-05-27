import { useUserPreferences } from '../stores/userPreferences';
import { loadedPacks } from '../data';

export default function SettingsPage() {
  const { preferences, setPreferences } = useUserPreferences();

  const handleThumbnailToggle = () => {
    setPreferences({
      ...preferences,
      showThumbnailsInList: !preferences.showThumbnailsInList,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-emerald-900">Settings</h1>
      </div>

      {/* Key Relations Settings */}
      <section className="bg-white rounded-lg border border-stone-200 p-6">
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Key Relations</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="font-medium text-stone-800">
                Show thumbnails in species list
              </label>
              <p className="text-sm text-stone-600 mt-1">
                Display species images on the left side of each species tile in the list view
              </p>
            </div>
            <button
              onClick={handleThumbnailToggle}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                preferences.showThumbnailsInList
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              }`}
            >
              {preferences.showThumbnailsInList ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* Data Packs Section */}
      <section className="bg-white rounded-lg border border-stone-200 p-6">
        <h2 className="text-xl font-semibold text-emerald-900 mb-4">Data Packs</h2>

        <p className="text-stone-600 mb-6">
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
                className="bg-stone-50 rounded-lg border border-stone-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-emerald-900">
                      {pack.metadata.id}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
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
                  <p className="text-sm text-stone-600 mb-3">
                    {pack.metadata.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-stone-600">
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

                <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-500">
                  <p>Author: {pack.metadata.author}</p>
                  <p>Created: {new Date(pack.metadata.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
