/**
 * Shorthand mappings for dataset compression.
 * Codes are 3-4 characters, no digits, intuitive and readable.
 * Maps are bidirectional for encoding/decoding.
 */

// Form types (18 values)
export const formTypeMap = {
  bee: "bee",
  beetle: "bet",
  bug: "bug",
  butterfly: "but",
  duck: "dck",
  frog: "frg",
  hummingbird: "hmb",
  mammal: "mam",
  moth: "mot",
  owl: "owl",
  raptor: "rpt",
  shrub: "shr",
  songbird: "sbr",
  tree: "tre",
  wading_bird: "wad",
  warbler: "wbr",
  wildflower: "wfl",
  woodpecker: "wpk",
} as const;

export const formTypeReverse = Object.fromEntries(
  Object.entries(formTypeMap).map(([k, v]) => [v, k])
);

// Habitat types (19 values)
export const habitatTypeMap = {
  beaver_pond: "bvr",
  dry_meadow: "drm",
  field: "fld",
  field_edge: "fle",
  forest: "for",
  forest_edge: "fre",
  garden: "gar",
  marsh: "mar",
  meadow: "med",
  open_woodland: "owl",
  pond: "pnd",
  riparian: "rip",
  roadside: "rds",
  rocky_slope: "rok",
  streamside: "stm",
  wet_meadow: "wet",
  wetland: "wtl",
  woodland: "wld",
  woodland_edge: "wle",
} as const;

export const habitatTypeReverse = Object.fromEntries(
  Object.entries(habitatTypeMap).map(([k, v]) => [v, k])
);

// Diet types (6 values)
export const dietTypeMap = {
  fruit_eater: "frt",
  herbivore: "hrb",
  insect_eater: "ins",
  nectar_feeder: "nct",
  pollen_eater: "pln",
  predator: "prd",
} as const;

export const dietTypeReverse = Object.fromEntries(
  Object.entries(dietTypeMap).map(([k, v]) => [v, k])
);

// Behavior types (44 values)
export const behaviorTypeMap = {
  aposematic: "apo",
  aquatic: "aqt",
  browser: "brs",
  buzz_pollinator: "bzp",
  calling: "cal",
  cavity_excavator: "cvx",
  cavity_nester: "cvn",
  cavity_user: "cvu",
  colonial_nester: "cln",
  dam_builder: "dam",
  early_bloomer: "ebl",
  engineer: "eng",
  fall_bloomer: "fbl",
  flocking: "flk",
  frugivore: "frg",
  gall_host: "gal",
  grazer: "grz",
  gregarious: "grg",
  ground_nester: "gnd",
  hovering: "hvr",
  insectivore: "ins",
  long_distance_migrant: "ldm",
  mast_cacher: "mca",
  mast_host: "mho",
  mast_producer: "mpr",
  migratory: "mgr",
  nectar_source: "ncs",
  nocturnal: "nct",
  perch_hunter: "prh",
  pioneer: "pio",
  pollinator: "pol",
  puddling: "pud",
  seed_disperser: "sed",
  soaring: "sor",
  social: "soc",
  soil_stabilizer: "ssl",
  spring_bloomer: "sbl",
  tent_builder: "tnt",
  toxin_producer: "tox",
  wader: "wad",
} as const;

export const behaviorTypeReverse = Object.fromEntries(
  Object.entries(behaviorTypeMap).map(([k, v]) => [v, k])
);

// Season types (6 values)
export const seasonTypeMap = {
  fall: "fal",
  fall_migrant: "fmg",
  late_summer: "lsu",
  spring: "spr",
  summer: "sum",
  year_round: "yar",
} as const;

export const seasonTypeReverse = Object.fromEntries(
  Object.entries(seasonTypeMap).map(([k, v]) => [v, k])
);

// Symbiosis types (7 values)
export const symbiosisTypeMap = {
  mutualism: "mut",
  parasitism: "par",
  predation: "pre",
  "predation-fruit_eating": "prf",
  "predation-grazing": "prg",
  "predation-nectar_feeding": "prn",
  "predation-seed_eating": "prs",
} as const;

export const symbiosisTypeReverse = Object.fromEntries(
  Object.entries(symbiosisTypeMap).map(([k, v]) => [v, k])
);

// Pack status (2 values)
export const statusMap = {
  published: "pub",
  draft: "drf",
} as const;

export const statusReverse = Object.fromEntries(
  Object.entries(statusMap).map(([k, v]) => [v, k])
);

/**
 * Type definitions for shorthand codes
 */
export type FormType = keyof typeof formTypeMap;
export type FormCode = typeof formTypeMap[FormType];

export type HabitatType = keyof typeof habitatTypeMap;
export type HabitatCode = typeof habitatTypeMap[HabitatType];

export type DietType = keyof typeof dietTypeMap;
export type DietCode = typeof dietTypeMap[DietType];

export type BehaviorType = keyof typeof behaviorTypeMap;
export type BehaviorCode = typeof behaviorTypeMap[BehaviorType];

export type SeasonType = keyof typeof seasonTypeMap;
export type SeasonCode = typeof seasonTypeMap[SeasonType];

export type SymbiosisType = keyof typeof symbiosisTypeMap;
export type SymbiosisCode = typeof symbiosisTypeMap[SymbiosisType];

export type StatusType = keyof typeof statusMap;
export type StatusCode = typeof statusMap[StatusType];

/**
 * Unified encoder/decoder for all enum types
 */
export function encodeEnum(value: string, mapFn: (v: string) => string): string {
  try {
    return mapFn(value);
  } catch {
    return value; // Fallback to original if not found
  }
}

export function decodeEnum(value: string, reverseMap: Record<string, string>): string {
  return reverseMap[value] || value; // Fallback to original if not found
}

/**
 * All reverse maps for easy lookup
 */
export const reverseMaps = {
  form: formTypeReverse,
  habitat: habitatTypeReverse,
  diet: dietTypeReverse,
  behavior: behaviorTypeReverse,
  season: seasonTypeReverse,
  symbiosis: symbiosisTypeReverse,
  status: statusReverse,
} as const;

/**
 * All forward maps for encoding
 */
export const forwardMaps = {
  form: formTypeMap,
  habitat: habitatTypeMap,
  diet: dietTypeMap,
  behavior: behaviorTypeMap,
  season: seasonTypeMap,
  symbiosis: symbiosisTypeMap,
  status: statusMap,
} as const;
