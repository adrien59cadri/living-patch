import { Link } from 'react-router-dom';
import type { Species } from '../types';
import type { SymbiosisStrength } from '../types';

interface Props {
  species: Species;
  strength: SymbiosisStrength;
  notes: string;
  isGroup?: boolean;
}

export function RelationshipTile({ species, strength, notes, isGroup = false }: Props) {
  const inner = (
    <div
      className={[
        'flex flex-col gap-1 p-3 rounded-lg border text-left transition-all',
        isGroup
          ? 'bg-stone-50 border-stone-200 text-stone-500 cursor-default'
          : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer',
        strength === 'critical' ? 'border-l-2 border-l-amber-400' : '',
      ].join(' ')}
      title={notes}
    >
      <div className="flex items-start gap-1.5 flex-wrap">
        <span className="text-sm font-medium text-stone-800 leading-tight">
          {species.common_name}
        </span>
        {strength === 'critical' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium leading-tight">
            Critical
          </span>
        )}
        {strength === 'important' && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium leading-tight">
            Important
          </span>
        )}
      </div>
      <span className="text-xs text-stone-400 capitalize">
        {species.form.replace(/_/g, ' ')}
      </span>
    </div>
  );

  if (isGroup) return inner;

  return (
    <Link to={`/species/${species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}
