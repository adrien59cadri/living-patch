import { useParams, Link } from 'react-router-dom';
import { useDataset } from '../hooks/useDataset';
import { getRelatedEntries, getSymbiotes, getHabitatNeighbors } from '../lib/relationships';
import { SpeciesCard } from '../components/SpeciesCard';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { species, speciesById, symbiosisBySpeciesId, relationsBySpeciesId } = useDataset();

  const currentSpecies = id ? speciesById.get(id) : undefined;

  if (!currentSpecies) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-stone-400">Species not found.</p>
        <Link to="/" className="text-emerald-600 hover:underline text-sm">
          ← Back to list
        </Link>
      </div>
    );
  }

  const symbiotes = getSymbiotes(
    currentSpecies.id,
    symbiosisBySpeciesId,
    speciesById
  );

  const habitatNeighbors = getHabitatNeighbors(
    currentSpecies.id,
    species,
    speciesById,
    symbiosisBySpeciesId
  );

  const related = getRelatedEntries(
    currentSpecies.id,
    symbiosisBySpeciesId,
    relationsBySpeciesId,
    speciesById
  );

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 no-underline"
      >
        ← All species
      </Link>
      <SpeciesCard
        species={currentSpecies}
        symbiotes={symbiotes}
        habitatNeighbors={habitatNeighbors}
        related={related}
      />
    </div>
  );
}
