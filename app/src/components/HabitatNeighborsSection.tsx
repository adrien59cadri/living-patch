import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Species } from '../types';

interface Props {
  neighbors: Species[];
}

export function HabitatNeighborsSection({ neighbors }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (neighbors.length === 0) {
    return null;
  }

  const displayedCount = isExpanded ? neighbors.length : 5;
  const displayedNeighbors = neighbors.slice(0, displayedCount);
  const hasMore = neighbors.length > 6;

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Habitat Neighbors
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-sm text-stone-700">
          {displayedNeighbors.map((species, idx) => (
            <span key={species.id}>
              <Link
                to={`/species/${species.id}`}
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                {species.common_name}
              </Link>
              {idx < displayedNeighbors.length - 1 && <span>, </span>}
            </span>
          ))}
          {hasMore && !isExpanded && <span>…</span>}
        </div>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-stone-500 hover:text-stone-700 font-medium whitespace-nowrap"
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
    </div>
  );
}
