import { useParams, Link } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import {
  getRelatedEntries,
  getCategoryGroups,
} from '../lib/relationships';
import type { RelatedEntry } from '../lib/relationships';
import { symbiosisLabel } from '../lib/labels';

export default function NeighborListView() {
  const { id, category } = useParams<{ id: string; category: string }>();
  const { speciesById, symbiosisBySpeciesId, relationsBySpeciesId, taxonomicGroupIds } = useDataset();

  const species = id ? speciesById.get(id) : undefined;

  if (!species) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-stone-400">Species not found.</p>
        <Link to="/" className="text-emerald-600 hover:underline text-sm">
          ← Back to list
        </Link>
      </div>
    );
  }

  const entries = getRelatedEntries(id!, symbiosisBySpeciesId, relationsBySpeciesId, speciesById, taxonomicGroupIds);
  const categoryGroups = getCategoryGroups(entries);
  const currentCategory = categoryGroups.find(c => c.slug === category);

  if (!currentCategory) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-stone-400">Category not found.</p>
        <Link to={`/species/${id}`} className="text-emerald-600 hover:underline text-sm">
          ← Back to {species.common_name}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to={`/species/${id}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 no-underline"
      >
        ← {species.common_name}
      </Link>

      <div>
        <h1 className="text-lg font-bold text-stone-800">
          {currentCategory.label} connected to {species.common_name}
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {currentCategory.entries.length} species
        </p>
      </div>

      <div className="space-y-2">
        {currentCategory.entries.map((entry, i) => (
          <SpeciesTile key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function symBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    mutualism:    'bg-emerald-100 text-emerald-700',
    parasitism:   'bg-amber-100 text-amber-700',
    predation:    'bg-red-100 text-red-700',
    competition:  'bg-blue-100 text-blue-700',
    commensalism: 'bg-stone-100 text-stone-600',
  };
  return classes[role] ?? 'bg-stone-100 text-stone-600';
}

function SpeciesTile({ entry }: { entry: RelatedEntry }) {
  const isGroup = entry.isGroup ?? false;
  const tile = (
    <div
      className={[
        'flex items-start gap-3 p-3 rounded-lg border',
        isGroup
          ? 'bg-stone-50 border-stone-100 opacity-70'
          : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium text-stone-800 leading-tight ${
            isGroup ? 'italic' : ''
          }`}
        >
          {entry.species.common_name}
        </div>
        <div className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
          {entry.notes}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {entry.role !== 'related' && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${symBadgeClass(
              entry.role
            )}`}
          >
            {symbiosisLabel(entry.role)}
          </span>
        )}
        <span className="text-stone-300 text-sm">☐</span>
      </div>
    </div>
  );

  if (isGroup) return tile;

  return (
    <Link to={`/species/${entry.species.id}`} className="block no-underline">
      {tile}
    </Link>
  );
}
