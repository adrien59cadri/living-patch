import type { Species } from '../types';
import { SpeciesTile } from './SpeciesTile';

interface Props {
  species: Species[];
  groups: Species[];
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
        <SpeciesTile key={s.id} species={s} isGroup={false} />
      ))}
      {groups.length > 0 && (
        <>
          <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Species Groups
          </div>
          {groups.map(g => (
            <SpeciesTile key={g.id} species={g} isGroup={true} />
          ))}
        </>
      )}
    </div>
  );
}
