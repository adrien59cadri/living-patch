import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { HabitatNeighborCategory } from '../lib/relationships';

interface Props {
  categories: HabitatNeighborCategory[];
  speciesId: string;
}

export function HabitatNeighborsSection({ categories, speciesId }: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (categories.length === 0) {
    return null;
  }

  const toggleCategory = (slug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Habitat Neighbors
      </div>
      <div className="space-y-3">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.slug);
          const displayCount = isExpanded ? 20 : 5;
          const displayedSpecies = category.species.slice(0, displayCount);
          const hasMore = category.species.length > 5;

          return (
            <div key={category.slug}>
              <Link
                to={`/species/${speciesId}/neighbors/${category.slug}`}
                className="flex items-center gap-2 mb-2 text-emerald-600 hover:text-emerald-700 no-underline group"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium group-hover:underline">{category.label}</span>
                <span className="text-xs text-stone-400">({category.species.length})</span>
              </Link>
              <div className="text-sm text-stone-700 ml-6">
                {displayedSpecies.map((species, idx) => (
                  <span key={species.id}>
                    <Link
                      to={`/species/${species.id}`}
                      className="text-emerald-600 hover:text-emerald-700 underline"
                    >
                      {species.common_name}
                    </Link>
                    {idx < displayedSpecies.length - 1 && <span>, </span>}
                  </span>
                ))}
                {!isExpanded && hasMore && <span>…</span>}
              </div>
              {hasMore && (
                <div className="flex items-center gap-2 mt-1 ml-6">
                  {!isExpanded && (
                    <button
                      onClick={() => toggleCategory(category.slug)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      + {category.species.length - 5} more
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      onClick={() => toggleCategory(category.slug)}
                      className="text-xs text-stone-500 hover:text-stone-700 font-medium"
                    >
                      − Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
