import { useState } from 'react';
import type { Species, LifeStage } from '../types';
import type { RelatedEntry } from '../lib/relationships';
import { getHabitatNeighborsByCategory } from '../lib/relationships';
import { KeystoneBadge } from './KeystoneBadge';
import { LifeStageRow } from './LifeStageRow';
import { KeyRelationshipsSection } from './KeyRelationshipsSection';
import { TaxonomyRelatedGrid } from './TaxonomyRelatedGrid';
import { HabitatNeighborsSection } from './HabitatNeighborsSection';
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
  symbiotes: RelatedEntry[];
  habitatNeighbors: Species[];
  related: RelatedEntry[];
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

export function SpeciesCard({ species, symbiotes, habitatNeighbors, related }: Props) {
  const [showScientificName, setShowScientificName] = useState(false);
  const stages = (species.life_stages as LifeStage[]).filter(
    s => typeof s === 'object' && s !== null
  );

  const habitatNeighborCategories = getHabitatNeighborsByCategory(habitatNeighbors);

  const seasonChip = activeMonthsLabel(species.active_months);

  return (
    <div className="space-y-6">
      {/* 1. Hero photo area */}
      <div className="w-full h-48 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300 overflow-hidden">
        {species.image?.url ? (
          <img
            src={species.image.url}
            alt={species.common_name}
            loading="lazy"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-5xl">📷</span>
        )}
      </div>

      {/* 2. Name block */}
      <div>
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 leading-tight">
              {species.common_name}
            </h1>
            {showScientificName && species.latin_name && (
              <p className="text-sm text-stone-600 mt-1 italic">
                {species.latin_name}
              </p>
            )}
          </div>
          {species.is_keystone && <KeystoneBadge type={species.keystone_type} />}
        </div>
        {species.latin_name && (
          <button
            onClick={() => setShowScientificName(!showScientificName)}
            className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 font-medium"
          >
            {showScientificName ? '− Scientific name' : '+ Scientific name'}
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

      {/* 5. Life stages */}
      {stages.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Life Stages
          </div>
          <LifeStageRow stages={stages} />
        </div>
      )}

      {/* 6. Symbiotes */}
      <KeyRelationshipsSection related={symbiotes} />

      {/* 7. Habitat neighbors (organized by category) */}
      <HabitatNeighborsSection categories={habitatNeighborCategories} speciesId={species.id} />

      {/* 8. Related by taxonomy */}
      <TaxonomyRelatedGrid related={related} speciesId={species.id} />

      {/* 9. Log sighting */}
      <LogSightingButton />
    </div>
  );
}

