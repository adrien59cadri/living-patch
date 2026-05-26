import { useState } from 'react';
import type { Species, LifeStage } from '../types';
import type { RelatedEntry } from '../lib/relationships';
import { getCategoryGroups, getKeyRelationship } from '../lib/relationships';
import { KeystoneBadge } from './KeystoneBadge';
import { LifeStageRow } from './LifeStageRow';
import { KeyRelationshipTile } from './KeyRelationshipTile';
import { NeighborsGrid } from './NeighborsGrid';
import { LogSightingButton } from './LogSightingButton';
import {
  formLabel,
  habitatLabel,
  dietLabel,
  behaviorLabel,
  activeMonthsLabel,
} from '../lib/labels';

interface Props {
  species: Species;
  related: RelatedEntry[];
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

export function SpeciesCard({ species, related }: Props) {
  const [latinVisible, setLatinVisible] = useState(false);

  const stages = (species.life_stages as LifeStage[]).filter(
    s => typeof s === 'object' && s !== null
  );

  const keyRelationship = getKeyRelationship(related);
  const categories = getCategoryGroups(related);

  const seasonChip = activeMonthsLabel(species.active_months);

  return (
    <div className="space-y-6">
      {/* 1. Hero photo area */}
      <div className="w-full h-48 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300">
        <span className="text-5xl">📷</span>
      </div>

      {/* 2. Name block */}
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

      {/* 3. Tags row */}
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
        {seasonChip && <Tag label={seasonChip} />}
      </div>

      {/* 4. Functional description */}
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

      {/* 5. Life stages */}
      {stages.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Life Stages
          </div>
          <LifeStageRow stages={stages} />
        </div>
      )}

      {/* 6. Key relationship */}
      {keyRelationship && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Key Relationship
          </div>
          <KeyRelationshipTile entry={keyRelationship} />
        </div>
      )}

      {/* 7. Neighbors grid */}
      {categories.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Neighbors
          </div>
          <NeighborsGrid categories={categories} speciesId={species.id} />
        </div>
      )}

      {/* 8. Log sighting */}
      <LogSightingButton />
    </div>
  );
}

