import { Link } from 'react-router-dom';
import type { RelatedEntry } from '../lib/relationships';

interface Props {
  entry: RelatedEntry;
}

export function KeyRelationshipTile({ entry }: Props) {
  const isGroup = entry.isGroup ?? false;
  const inner = (
    <div
      className={[
        'p-4 rounded-lg border flex items-start gap-3 transition-all',
        isGroup
          ? 'border-stone-100 bg-stone-50 opacity-70'
          : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={[
              'font-medium leading-tight',
              isGroup ? 'text-stone-500' : 'text-stone-800',
            ].join(' ')}
          >
            {entry.species.common_name}
          </span>
          {entry.obligate && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
              Obligate
            </span>
          )}
          {entry.isImpacted && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
              Impacted
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">
          {entry.notes}
        </p>
      </div>
      {!isGroup && <span className="text-stone-300 shrink-0 mt-0.5">›</span>}
    </div>
  );

  if (isGroup) return <div>{inner}</div>;

  return (
    <Link to={`/species/${entry.species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}
