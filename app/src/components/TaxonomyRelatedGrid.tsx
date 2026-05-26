import type { RelatedEntry } from '../lib/relationships';
import { getCategoryGroups } from '../lib/relationships';

interface Props {
  related: RelatedEntry[];
  speciesId: string;
}

export function TaxonomyRelatedGrid({ related }: Props) {
  const allCategories = getCategoryGroups(related);
  const taxonomyCategories = allCategories.filter(c => c.slug === 'related');

  if (taxonomyCategories.length === 0) {
    return null;
  }

  const speciesNames = related
    .filter(e => e.role === 'related')
    .map(e => e.species.common_name);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
        Related by Taxonomy
      </div>
      <div className="text-sm text-stone-700">
        {speciesNames.join(', ')}
      </div>
    </div>
  );
}
