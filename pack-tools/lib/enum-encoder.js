/**
 * Encoder to apply enum shorthands to pack data structures.
 */

import {
  formTypeMap,
  habitatTypeMap,
  dietTypeMap,
  behaviorTypeMap,
  seasonTypeMap,
  symbiosisTypeMap,
  statusMap,
} from './enum-mappings.js';

/**
 * Encode a single species record
 */
function encodeSpecies(species) {
  return {
    ...species,
    form: species.form ? formTypeMap[species.form] || species.form : species.form,
    habitat: species.habitat?.map((h) => habitatTypeMap[h] || h),
    diet: species.diet?.map((d) => dietTypeMap[d] || d),
    behavior: species.behavior?.map((b) => behaviorTypeMap[b] || b),
    season: species.season?.map((s) => seasonTypeMap[s] || s),
  };
}

/**
 * Encode a taxonomic group record
 */
function encodeTaxonomicGroup(group) {
  return {
    ...group,
    form: group.form ? formTypeMap[group.form] || group.form : group.form,
    behavior: group.behavior?.map((b) => behaviorTypeMap[b] || b),
  };
}

/**
 * Encode a symbiosis record
 */
function encodeSymbiosis(sym) {
  return {
    ...sym,
    type: sym.type ? symbiosisTypeMap[sym.type] || sym.type : sym.type,
  };
}

/**
 * Encode entire pack data
 */
export function encodePack(pack) {
  return {
    ...pack,
    metadata: pack.metadata
      ? {
          ...pack.metadata,
          status: pack.metadata.status
            ? statusMap[pack.metadata.status] || pack.metadata.status
            : pack.metadata.status,
        }
      : pack.metadata,
    data: pack.data
      ? {
          ...pack.data,
          species: pack.data.species?.map(encodeSpecies),
          taxonomic_groups: pack.data.taxonomic_groups?.map(encodeTaxonomicGroup),
          symbiosis: pack.data.symbiosis?.map(encodeSymbiosis),
        }
      : pack.data,
  };
}
