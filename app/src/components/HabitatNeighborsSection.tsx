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

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Habitat Neighbors
      </div>
      <div className="space-y-2">
        {neighbors.map(species => (
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
      </div>
    </div>
  );
}
