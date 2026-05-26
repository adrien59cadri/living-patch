import type { RelatedEntry } from '../lib/relationships';
import { getCategoryGroups } from '../lib/relationships';
import { NeighborCategoryTile } from './NeighborCategoryTile';

interface Props {
  related: RelatedEntry[];
  speciesId: string;
}

export function TaxonomyRelatedGrid({ related, speciesId }: Props) {
  const allCategories = getCategoryGroups(related);
  const taxonomyCategories = allCategories.filter(c => c.slug === 'related');

  if (taxonomyCategories.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Related by Taxonomy
      </div>
      <div className="grid grid-cols-2 gap-3">
        {taxonomyCategories.slice(0, 4).map((category) => (
          <NeighborCategoryTile
            key={category.slug}
            category={category}
            speciesId={speciesId}
          />
        ))}
        {taxonomyCategories.length > 4 && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center justify-center text-center">
            <div>
              <div className="text-sm font-semibold text-stone-500">More</div>
              <div className="text-xs text-stone-400">
                +{taxonomyCategories.length - 4}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
