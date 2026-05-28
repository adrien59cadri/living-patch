import { useState, Suspense, lazy } from 'react';
import type { Species, LifeStage } from '../types';
import type { RelatedEntry } from '../lib/relationships';
import { getHabitatNeighborsByCategory } from '../lib/relationships';
import { LifeStageRow } from './LifeStageRow';
import { KeyRelationshipsSection } from './KeyRelationshipsSection';
import { TaxonomyRelatedGrid } from './TaxonomyRelatedGrid';
import { HabitatNeighborsSection } from './HabitatNeighborsSection';
import { LogSightingButton } from './LogSightingButton';
import { TagRow } from './TagRow';

// Lazy load DiagramCard to avoid loading ForceGraph2D and THREE.js until needed
const DiagramCard = lazy(async () => {
  const module = await import('./DiagramCard');
  return { default: module.DiagramCard };
});

interface Props {
  species: Species;
  symbiotes: RelatedEntry[];
  habitatNeighbors: Species[];
  related: RelatedEntry[];
}

export function SpeciesCard({ species, symbiotes, habitatNeighbors, related }: Props) {
  const [showScientificName, setShowScientificName] = useState(false);
  const stages = (species.life_stages as LifeStage[]).filter(
    s => typeof s === 'object' && s !== null
  );

  const habitatNeighborCategories = getHabitatNeighborsByCategory(habitatNeighbors);

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
      <TagRow species={species} />

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

      {/* 6.5. Relationship Diagram */}
      <Suspense fallback={<div className="text-center text-stone-500 py-4">Loading diagram...</div>}>
        <DiagramCard speciesId={species.id} />
      </Suspense>

      {/* 7. Habitat neighbors (organized by category) */}
      <HabitatNeighborsSection categories={habitatNeighborCategories} speciesId={species.id} />

      {/* 8. Related by taxonomy */}
      <TaxonomyRelatedGrid related={related} speciesId={species.id} />

      {/* 9. Log sighting */}
      <LogSightingButton />
    </div>
  );
}

