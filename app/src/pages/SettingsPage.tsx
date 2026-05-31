import { useRef, useState } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { loadedPacks } from '../data';
import { useLifeListStore } from '../stores/lifeList';
import type { LifeListEntry, Sighting } from '../types';

interface BackupFile {
  entries: LifeListEntry[];
  sightings: Sighting[];
  exportedAt: string;
  version: number;
}

function isValidBackup(data: unknown): data is BackupFile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.entries) || !Array.isArray(d.sightings)) return false;
  for (const e of d.entries) {
    if (!e || typeof (e as Record<string, unknown>).speciesId !== 'string') return false;
    if (typeof (e as Record<string, unknown>).tier !== 'string') return false;
  }
  for (const s of d.sightings) {
    if (!s || typeof (s as Record<string, unknown>).id !== 'string') return false;
    if (typeof (s as Record<string, unknown>).speciesId !== 'string') return false;
    if (typeof (s as Record<string, unknown>).date !== 'string') return false;
  }
  return true;
}

export default function SettingsPage() {
  const { preferences, setPreferences } = useUserPreferences();
  const { entries, sightings, restoreFromBackup } = useLifeListStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const isEmpty = entries.length === 0 && sightings.length === 0;

  function handleExport() {
    const backup: BackupFile = {
      entries,
      sightings,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `living-patch-life-list-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportSuccess(false);
    setPendingBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: unknown = JSON.parse(ev.target?.result as string);
        if (!isValidBackup(parsed)) {
          setImportError('Invalid backup file: missing or malformed entries/sightings.');
          return;
        }
        setPendingBackup(parsed);
      } catch {
        setImportError('Could not parse the file. Make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleConfirmImport() {
    if (!pendingBackup) return;
    restoreFromBackup(pendingBackup.entries, pendingBackup.sightings);
    setPendingBackup(null);
    setImportSuccess(true);
  }

  function handleCancelImport() {
    setPendingBackup(null);
    setImportError(null);
  }

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

      {/* Life List Backup & Restore */}
      <section className="bg-white rounded-lg border border-stone-200 p-6">
        <h2 className="text-xl font-semibold text-emerald-900 mb-1">Life List Backup</h2>
        <p className="text-sm text-stone-600 mb-6">
          Export your sightings and familiarity tiers to a JSON file, or restore from a previous backup.
        </p>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-stone-800">Export</p>
              <p className="text-sm text-stone-600 mt-1">
                Download your life list as a JSON file
                {!isEmpty && ` (${entries.length} species, ${sightings.length} sighting${sightings.length !== 1 ? 's' : ''})`}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isEmpty}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>

          {/* Import */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-stone-800">Import</p>
              <p className="text-sm text-stone-600 mt-1">
                Restore from a previously exported backup file
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => {
                setImportError(null);
                setImportSuccess(false);
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-stone-200 text-stone-700 hover:bg-stone-300 ml-4 shrink-0"
            >
              Import from file
            </button>
          </div>

          {/* Pending confirmation */}
          {pendingBackup && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
              <p className="text-sm text-amber-900 font-medium">
                Ready to restore: {pendingBackup.entries.length} species entr{pendingBackup.entries.length !== 1 ? 'ies' : 'y'},{' '}
                {pendingBackup.sightings.length} sighting{pendingBackup.sightings.length !== 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-amber-700">
                This will replace your current life list. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  Confirm restore
                </button>
                <button
                  onClick={handleCancelImport}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {importSuccess && (
            <p className="text-sm text-emerald-700 font-medium">
              Life list restored successfully.
            </p>
          )}

          {/* Error */}
          {importError && (
            <p className="text-sm text-red-600">{importError}</p>
          )}
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
