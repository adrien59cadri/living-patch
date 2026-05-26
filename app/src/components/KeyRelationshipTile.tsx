import { Link } from 'react-router-dom';
import type { RelatedEntry } from '../lib/relationships';
import { formIcon } from '../lib/labels';

interface Props {
  entry: RelatedEntry;
}

export function KeyRelationshipTile({ entry }: Props) {
  const isGroup = entry.isGroup ?? false;
  const inner = (
    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <span
        className="text-2xl flex-shrink-0 mt-0.5"
        role="img"
        aria-label={entry.species.form}
      >
        {formIcon(entry.species.form)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-stone-800 text-sm leading-tight">
          {entry.species.common_name}
        </div>
        <div className="text-xs text-stone-500 mt-1 leading-snug line-clamp-2">
          {entry.notes}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {entry.obligate && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">
            Obligate
          </span>
        )}
        {entry.isImpacted && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">
            Impacted
          </span>
        )}
        <span className="text-stone-300 text-sm" aria-label="Not yet logged">
          ☐
        </span>
      </div>
    </div>
  );

  if (isGroup) return inner;

  return (
    <Link to={`/species/${entry.species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}
