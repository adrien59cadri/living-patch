import { Link } from 'react-router-dom';
import type { Species } from '../types';
import { KeystoneBadge } from './KeystoneBadge';
import { formLabel } from '../lib/labels';

interface Props {
  species: Species[];
  groups: Species[];
}

function SpeciesRow({ species }: { species: Species }) {
  const isGroup = species.is_group === true;

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
            {species.common_name}
          </span>
          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
            {formLabel(species.form)}
          </span>
          {species.is_keystone && <KeystoneBadge type={species.keystone_type} />}
        </div>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">
          {species.functional_description}
        </p>
      </div>
      {!isGroup && <span className="text-stone-300 shrink-0 mt-0.5">›</span>}
    </div>
  );

  if (isGroup) return <div>{inner}</div>;

  return (
    <Link to={`/species/${species.id}`} className="block no-underline">
      {inner}
    </Link>
  );
}

export function SpeciesList({ species, groups }: Props) {
  if (species.length === 0 && groups.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400 text-sm">
        No species found. Try a different search or clear filters.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {species.map(s => (
        <SpeciesRow key={s.id} species={s} />
      ))}
      {groups.length > 0 && (
        <>
          <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Species Groups
          </div>
          {groups.map(g => (
            <SpeciesRow key={g.id} species={g} />
          ))}
        </>
      )}
    </div>
  );
}
