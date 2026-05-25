import { useParams, Link } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { getRelatedEntries, groupByRole } from '../lib/relationships';
import { SpeciesCard } from '../components/SpeciesCard';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { speciesById, symbiosisBySpeciesId, relationsBySpeciesId } = useDataset();

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

  const related = getRelatedEntries(
    species.id,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
    speciesById
  );
  const grouped = groupByRole(related);

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 no-underline"
      >
        ← All species
      </Link>
      <SpeciesCard species={species} grouped={grouped} />
    </div>
  );
}
