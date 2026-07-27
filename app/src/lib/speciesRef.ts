import type { LifeStage, Species } from '../types';

export interface SpeciesRef {
  speciesId: string;
  stageId?: string;
}

/**
 * Parses a symbiosis/relation reference string into its species ID and
 * optional stage qualifier. "insect_x@larva" -> { speciesId: "insect_x", stageId: "larva" }.
 * A stage-qualified reference always also resolves to the plain species ID.
 */
export function parseSpeciesRef(ref: string): SpeciesRef {
  const i = ref.indexOf('@');
  return i === -1 ? { speciesId: ref } : { speciesId: ref.slice(0, i), stageId: ref.slice(i + 1) };
}

/** Looks up the LifeStage object matching stageId on a species, if any. */
export function resolveStage(species: Species | undefined, stageId: string | undefined): LifeStage | undefined {
  if (!species || !stageId || !Array.isArray(species.life_stages)) return undefined;
  return (species.life_stages as LifeStage[]).find(
    (s): s is LifeStage => typeof s === 'object' && s !== null && s.id === stageId
  );
}
