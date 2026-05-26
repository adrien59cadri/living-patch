export interface LifeStage {
  icon: string;
  name: string;
  description: string;
  months: string[];
}

export interface Species {
  id: string;
  common_name: string;
  latin_name?: string | null;
  form: string;
  habitat: string[];
  diet: string[];
  behavior: string[];
  season: string[];
  functional_description: string;
  life_stages: LifeStage[] | string[];
  region: string;
  ecological_role?: string | null;
  is_keystone?: boolean;
  keystone_type?: string | null;
  keystone_description?: string | null;
  active_months?: string[] | null;
  /** Wikipedia image if available */
  image?: {
    url: string;
    author: string;
  };
}

export interface Symbiosis {
  type: 'mutualism' | 'parasitism' | 'predation' | 'competition' | 'commensalism';
  members: string[];
  impacted_species?: string;
  obligate?: boolean;
  notes: string;
}

export interface Relation {
  type: string;
  members: string[];
  notes: string;
}

export interface Dataset {
  species: Species[];
  taxonomic_groups: Species[];
  symbiosis: Symbiosis[];
  relations: Relation[];
}
