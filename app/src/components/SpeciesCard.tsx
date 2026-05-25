import { useState } from 'react';
import type { Species, LifeStage } from '../types';
import type { GroupedRelations } from '../lib/relationships';
import { KeystoneBadge } from './KeystoneBadge';
import { LifeStageRow } from './LifeStageRow';
import { RelationshipsPanel } from './RelationshipsPanel';
import {
  formLabel,
  habitatLabel,
  dietLabel,
  behaviorLabel,
  seasonLabel,
} from '../lib/labels';

interface Props {
  species: Species;
  grouped: GroupedRelations;
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

export function SpeciesCard({ species, grouped }: Props) {
  const [latinVisible, setLatinVisible] = useState(false);

  const stages = (species.life_stages as LifeStage[]).filter(
    s => typeof s === 'object' && s !== null
  );

  return (
    <div className="space-y-6">
      {/* Photo placeholder */}
      <div className="w-full h-48 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300">
        <span className="text-5xl">📷</span>
      </div>

      {/* Name */}
      <div>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-800 leading-tight">
            {species.common_name}
          </h1>
          {species.is_keystone && <KeystoneBadge type={species.keystone_type} />}
        </div>
        {species.latin_name && (
          <button
            onClick={() => setLatinVisible(v => !v)}
            className="mt-1 text-xs text-stone-400 hover:text-stone-600"
          >
            {latinVisible ? `— ${species.latin_name}` : '+ Scientific name'}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Tag label={formLabel(species.form)} />
        {(species.habitat ?? []).map(h => (
          <Tag key={h} label={habitatLabel(h)} />
        ))}
        {(species.diet ?? []).map(d => (
          <Tag key={d} label={dietLabel(d)} />
        ))}
        {(species.behavior ?? []).map(b => (
          <Tag key={b} label={behaviorLabel(b)} />
        ))}
        {(species.season ?? []).map(s => (
          <Tag key={s} label={seasonLabel(s)} />
        ))}
      </div>

      {/* Functional description */}
      <p className="text-stone-600 text-sm leading-relaxed">
        {species.functional_description}
      </p>

      {/* Keystone callout */}
      {species.is_keystone && species.keystone_description && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
            Keystone role
          </div>
          <p className="text-sm text-amber-900">{species.keystone_description}</p>
        </div>
      )}

      {/* Life stages */}
      {stages.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Life Stages
          </div>
          <LifeStageRow stages={stages} />
        </div>
      )}

      {/* Relationships */}
      <RelationshipsPanel grouped={grouped} />
    </div>
  );
}
