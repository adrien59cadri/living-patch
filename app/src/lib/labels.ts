export function formLabel(form: string): string {
  const labels: Record<string, string> = {
    woodpecker: 'Woodpecker',
    raptor: 'Raptor',
    owl: 'Owl',
    songbird: 'Songbird',
    warbler: 'Warbler',
    hummingbird: 'Hummingbird',
    wading_bird: 'Wading Bird',
    mammal: 'Mammal',
    tree: 'Tree',
    wildflower: 'Wildflower',
    shrub: 'Shrub',
    butterfly: 'Butterfly',
    beetle: 'Beetle',
    bug: 'Bug',
    bee: 'Bee',
    frog: 'Frog',
  };
  return (
    labels[form] ??
    form.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
}

export function seasonLabel(season: string): string {
  const labels: Record<string, string> = {
    year_round: 'Year-round',
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    fall_migrant: 'Fall migrant',
    late_summer: 'Late summer',
    winter: 'Winter',
  };
  return labels[season] ?? season.replace(/_/g, ' ');
}

export function habitatLabel(habitat: string): string {
  const labels: Record<string, string> = {
    forest: 'Forest',
    woodland: 'Woodland',
    forest_edge: 'Forest edge',
    field: 'Field',
    field_edge: 'Field edge',
    meadow: 'Meadow',
    garden: 'Garden',
    wetland: 'Wetland',
    marsh: 'Marsh',
    pond: 'Pond',
    riparian: 'Riparian',
    streamside: 'Streamside',
    dry_meadow: 'Dry meadow',
    beaver_pond: 'Beaver pond',
    rocky_slope: 'Rocky slope',
    open_woodland: 'Open woodland',
    wet_meadow: 'Wet meadow',
  };
  return labels[habitat] ?? habitat.replace(/_/g, ' ');
}

export function dietLabel(diet: string): string {
  const labels: Record<string, string> = {
    insect_eater: 'Insect eater',
    predator: 'Predator',
    fruit_eater: 'Fruit eater',
    nectar_feeder: 'Nectar feeder',
    herbivore: 'Herbivore',
    pollen_eater: 'Pollen eater',
  };
  return labels[diet] ?? diet.replace(/_/g, ' ');
}

export function behaviorLabel(behavior: string): string {
  return behavior
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function symbiosisLabel(type: string): string {
  const labels: Record<string, string> = {
    mutualism: 'Mutualism',
    parasitism: 'Parasitism & Hosting',
    predation: 'Predation',
    competition: 'Competition',
    commensalism: 'Commensalism',
    related: 'Related Species',
  };
  return labels[type] ?? type;
}
