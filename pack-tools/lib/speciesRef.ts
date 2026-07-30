/**
 * Parsing helper for symbiosis/relation reference strings.
 * Mirrors app/src/lib/speciesRef.ts — kept as a separate copy since
 * app/ and pack-tools/ are independent TypeScript projects.
 */

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
