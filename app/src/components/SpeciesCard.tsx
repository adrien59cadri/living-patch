import type { Species, LifeStage } from '../types';
import type { RelatedEntry } from '../lib/relationships';
import { getCategoryGroups } from '../lib/relationships';
import { KeystoneBadge } from './KeystoneBadge';
import { LifeStageRow } from './LifeStageRow';
import { KeyRelationshipsSection } from './KeyRelationshipsSection';
import { NeighborsGrid } from './NeighborsGrid';
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
  const stages = (species.life_stages as LifeStage[]).filter(
    s => typeof s === 'object' && s !== null
  );

  const allCategories = getCategoryGroups(related);
  const habitatCategories = allCategories.filter(c => c.slug !== 'related');

  const seasonChip = activeMonthsLabel(species.active_months);

  return (
    <div className="space-y-6">
      {/* 1. Hero photo area */}
      {species.image ? (
        <div className="relative group">
          <img
            src={species.image.url}
            alt={species.common_name}
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-b-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white">
              Photo by{' '}
              <span className="font-semibold">{species.image.author}</span>
              {' '}via{' '}
              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-200"
              >
                Wikimedia Commons
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-stone-100 rounded-xl flex items-center justify-center text-stone-300">
          <span className="text-5xl">📷</span>
        </div>
      )}

      {/* 2. Name block */}
      <div>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-800 leading-tight">
            {species.common_name}
            {species.latin_name && (
              <span className="text-lg font-normal text-stone-500 ml-2">
                ({species.latin_name})
              </span>
            )}
          </h1>
          {species.is_keystone && <KeystoneBadge type={species.keystone_type} />}
        </div>
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

      {/* 7. Habitat neighbors */}
      <HabitatNeighborsSection neighbors={habitatNeighbors} />

      {/* 8. Related by habitat (legacy - may hide if all species are now showing as neighbors/symbiotes) */}
      {habitatCategories.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Related by Habitat
          </div>
          <NeighborsGrid categories={habitatCategories} speciesId={species.id} />
        </div>
      )}

      {/* 9. Related by taxonomy */}
      <TaxonomyRelatedGrid related={related} speciesId={species.id} />

      {/* 10. Log sighting */}
      <LogSightingButton />
    </div>
  );
}

