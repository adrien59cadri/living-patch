import { Link } from 'react-router-dom';
import type { Species } from '../types';

interface Props {
  species: Species;
  obligate: boolean;
  notes: string;
}

export function RelationshipTile({ species, obligate, notes }: Props) {
  const inner = (
    <div
      className={[
        'flex flex-col gap-1 p-3 rounded-lg border text-left transition-all',
        species.is_group
          ? 'bg-stone-50 border-stone-200 text-stone-500 cursor-default'
          : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer',
        obligate ? 'border-l-2 border-l-amber-400' : '',
      ].join(' ')}
      title={notes}
    >
      <div className="flex items-start gap-1.5 flex-wrap">
        <span className="text-sm font-medium text-stone-800 leading-tight">
          {species.common_name}
        </span>
        {obligate && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium leading-tight">
            obligate
          </span>
        )}
      </div>
      <span className="text-xs text-stone-400 capitalize">
        {species.form.replace(/_/g, ' ')}
      </span>
    </div>
  );

  if (species.is_group) return inner;

  return (
    <Link to={`/species/${species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}
