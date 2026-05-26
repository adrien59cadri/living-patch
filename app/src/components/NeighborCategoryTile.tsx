import { Link } from 'react-router-dom';
import type { NeighborCategory } from '../lib/relationships';

interface Props {
  category: NeighborCategory;
  speciesId: string;
}

export function NeighborCategoryTile({ category, speciesId }: Props) {
  return (
    <Link
      to={`/species/${speciesId}/neighbors/${category.slug}`}
      className="no-underline"
    >
      <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg p-3 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
        <span className="text-2xl flex-shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-stone-800">{category.label}</div>
          <div className="text-xs text-stone-400">{category.entries.length} species</div>
        </div>
        <span className="text-stone-300 text-sm flex-shrink-0" aria-label="Not yet logged">
          ☐
        </span>
      </div>
    </Link>
  );
}
