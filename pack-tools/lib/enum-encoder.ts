/**
 * Encoder to apply enum shorthands to pack data structures.
 * Traverses pack data and replaces enum values with their short codes.
 */

import {
  formTypeMap,
  habitatTypeMap,
  dietTypeMap,
  behaviorTypeMap,
  seasonTypeMap,
  symbiosisTypeMap,
  statusMap,
} from "./enum-mappings";

interface Species {
  form?: string;
  habitat?: string[];
  diet?: string[];
  behavior?: string[];
  season?: string[];
  [key: string]: any;
}

interface TaxonomicGroup {
  form?: string;
  behavior?: string[];
  [key: string]: any;
}

interface Symbiosis {
  type?: string;
  [key: string]: any;
}

interface PackData {
  species?: Species[];
  taxonomic_groups?: TaxonomicGroup[];
  symbiosis?: Symbiosis[];
  [key: string]: any;
}

interface Pack {
  metadata?: {
    status?: string;
    [key: string]: any;
  };
  data?: PackData;
  [key: string]: any;
}

/**
 * Encode a single species record
 */
function encodeSpecies(species: Species): Species {
  return {
    ...species,
    form: species.form ? (formTypeMap as any)[species.form] || species.form : species.form,
    habitat: species.habitat?.map((h) => (habitatTypeMap as any)[h] || h),
    diet: species.diet?.map((d) => (dietTypeMap as any)[d] || d),
    behavior: species.behavior?.map((b) => (behaviorTypeMap as any)[b] || b),
    season: species.season?.map((s) => (seasonTypeMap as any)[s] || s),
  };
}

/**
 * Encode a taxonomic group record
 */
function encodeTaxonomicGroup(group: TaxonomicGroup): TaxonomicGroup {
  return {
    ...group,
    form: group.form ? (formTypeMap as any)[group.form] || group.form : group.form,
    behavior: group.behavior?.map((b) => (behaviorTypeMap as any)[b] || b),
  };
}

/**
 * Encode a symbiosis record
 */
function encodeSymbiosis(sym: Symbiosis): Symbiosis {
  return {
    ...sym,
    type: sym.type ? (symbiosisTypeMap as any)[sym.type] || sym.type : sym.type,
  };
}

/**
 * Encode entire pack data
 */
export function encodePack(pack: Pack): Pack {
  return {
    ...pack,
    metadata: pack.metadata
      ? {
          ...pack.metadata,
          status: pack.metadata.status
            ? (statusMap as any)[pack.metadata.status] || pack.metadata.status
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

/**
 * Decode a single species record
 */
function decodeSpecies(species: Species): Species {
  const habitatReverse = Object.fromEntries(
    Object.entries(habitatTypeMap).map(([k, v]) => [v, k])
  );
  const dietReverse = Object.fromEntries(Object.entries(dietTypeMap).map(([k, v]) => [v, k]));
  const behaviorReverse = Object.fromEntries(
    Object.entries(behaviorTypeMap).map(([k, v]) => [v, k])
  );
  const seasonReverse = Object.fromEntries(
    Object.entries(seasonTypeMap).map(([k, v]) => [v, k])
  );
  const formReverse = Object.fromEntries(Object.entries(formTypeMap).map(([k, v]) => [v, k]));

  return {
    ...species,
    form: species.form ? formReverse[species.form] || species.form : species.form,
    habitat: species.habitat?.map((h) => habitatReverse[h] || h),
    diet: species.diet?.map((d) => dietReverse[d] || d),
    behavior: species.behavior?.map((b) => behaviorReverse[b] || b),
    season: species.season?.map((s) => seasonReverse[s] || s),
  };
}

/**
 * Decode a taxonomic group record
 */
function decodeTaxonomicGroup(group: TaxonomicGroup): TaxonomicGroup {
  const formReverse = Object.fromEntries(Object.entries(formTypeMap).map(([k, v]) => [v, k]));
  const behaviorReverse = Object.fromEntries(
    Object.entries(behaviorTypeMap).map(([k, v]) => [v, k])
  );

  return {
    ...group,
    form: group.form ? formReverse[group.form] || group.form : group.form,
    behavior: group.behavior?.map((b) => behaviorReverse[b] || b),
  };
}

/**
 * Decode a symbiosis record
 */
function decodeSymbiosis(sym: Symbiosis): Symbiosis {
  const symbiosisReverse = Object.fromEntries(
    Object.entries(symbiosisTypeMap).map(([k, v]) => [v, k])
  );

  return {
    ...sym,
    type: sym.type ? symbiosisReverse[sym.type] || sym.type : sym.type,
  };
}

/**
 * Decode entire pack data
 */
export function decodePack(pack: Pack): Pack {
  const statusReverse = Object.fromEntries(Object.entries(statusMap).map(([k, v]) => [v, k]));

  return {
    ...pack,
    metadata: pack.metadata
      ? {
          ...pack.metadata,
          status: pack.metadata.status
            ? statusReverse[pack.metadata.status] || pack.metadata.status
            : pack.metadata.status,
        }
      : pack.metadata,
    data: pack.data
      ? {
          ...pack.data,
          species: pack.data.species?.map(decodeSpecies),
          taxonomic_groups: pack.data.taxonomic_groups?.map(decodeTaxonomicGroup),
          symbiosis: pack.data.symbiosis?.map(decodeSymbiosis),
        }
      : pack.data,
  };
}
