import type { NeighborCategory } from '../lib/relationships';
import { NeighborCategoryTile } from './NeighborCategoryTile';

interface Props {
  categories: NeighborCategory[];
  speciesId: string;
}

const MAX_TILES = 4;

export function NeighborsGrid({ categories, speciesId }: Props) {
  if (categories.length === 0) return null;

  const visible = categories.slice(0, MAX_TILES);
  const overflow = categories.length - MAX_TILES;

  return (
    <div className="grid grid-cols-2 gap-2">
      {visible.map(cat => (
        <NeighborCategoryTile key={cat.slug} category={cat} speciesId={speciesId} />
      ))}
      {overflow > 0 && (
        <div className="flex items-center justify-center bg-stone-50 border border-stone-200 rounded-lg p-3">
          <span className="text-sm text-stone-500">+{overflow} more</span>
        </div>
      )}
    </div>
  );
}
