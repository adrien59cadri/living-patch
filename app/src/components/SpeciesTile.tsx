import { Link } from 'react-router-dom';
import type { Species } from '../types';
import type { RelatedEntry } from '../lib/relationships';
import { KeystoneBadge } from './KeystoneBadge';
import { formLabel } from '../lib/labels';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface Props {
  species: Species;
  related?: RelatedEntry;
  isGroup?: boolean;
}

export function SpeciesTile({ species, related, isGroup }: Props) {
  // Determine if this is a group: explicit prop > related.isGroup > false
  const actualIsGroup = isGroup ?? related?.isGroup ?? false;

  // Choose description text based on whether we have relationship data
  const description = related?.notes ?? species.functional_description;

  const { preferences } = useUserPreferences();

  const inner = (
    <div
      className={[
        'p-4 rounded-lg border flex items-start gap-3 transition-all',
        actualIsGroup
          ? 'border-stone-100 bg-stone-50 opacity-70'
          : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm',
      ].join(' ')}
    >
      {!actualIsGroup && preferences.showThumbnailsInList && (
        <div className="shrink-0 w-12 h-12 bg-stone-100 rounded-md flex items-center justify-center overflow-hidden border border-stone-200">
          {species.image?.url ? (
            <img
              src={species.image.url}
              alt={species.common_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg">📷</span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={[
              'font-medium leading-tight',
              actualIsGroup ? 'text-stone-500' : 'text-stone-800',
            ].join(' ')}
          >
            {species.common_name}
          </span>
          {!actualIsGroup && species.form && (
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              {formLabel(species.form)}
            </span>
          )}
          {species.is_keystone && <KeystoneBadge type={species.keystone_type} />}
          {related?.obligate && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
              Obligate
            </span>
          )}
          {related?.isImpacted && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
              Impacted
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {description}
        </p>
      </div>
      {!actualIsGroup && <span className="text-stone-300 shrink-0 mt-0.5">›</span>}
    </div>
  );

  if (actualIsGroup) return <div>{inner}</div>;

  return (
    <Link to={`/species/${species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}
