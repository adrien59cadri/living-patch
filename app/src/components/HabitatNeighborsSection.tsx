import { Link } from 'react-router-dom';
import type { Species } from '../types';
import { formLabel } from '../lib/labels';

interface Props {
  neighbors: Species[];
}

export function HabitatNeighborsSection({ neighbors }: Props) {
  if (neighbors.length === 0) {
    return null;
  }

  const displayedNeighbors = neighbors.slice(0, 4);
  const remainingCount = Math.max(0, neighbors.length - 4);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Habitat Neighbors
      </div>
      <div className="grid grid-cols-4 gap-3">
        {displayedNeighbors.map(species => (
          <Link
            key={species.id}
            to={`/species/${species.id}`}
            className="block no-underline"
          >
            <div className="flex flex-col gap-1 p-3 rounded-lg border bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all text-left">
              <div className="flex items-start gap-1.5 flex-wrap">
                <span className="text-sm font-medium text-stone-800 leading-tight">
                  {species.common_name}
                </span>
              </div>
              <span className="text-xs text-stone-400 capitalize">
                {formLabel(species.form)}
              </span>
            </div>
          </Link>
        ))}
        {remainingCount > 0 && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center justify-center text-center">
            <div>
              <div className="text-sm font-semibold text-stone-500">More</div>
              <div className="text-xs text-stone-400">+{remainingCount}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
