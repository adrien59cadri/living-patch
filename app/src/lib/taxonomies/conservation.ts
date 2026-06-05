export const CONSERVATION_ORDERED = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD'] as const;

export type ConservationStatusCode = typeof CONSERVATION_ORDERED[number];

export interface ConservationDefinition {
  label: string;
  shortDescription: string;
  description: string;
}

export const CONSERVATION_DEFINITIONS: Record<string, ConservationDefinition> = {
  EX: {
    label: 'Extinct',
    shortDescription: 'No surviving individuals known.',
    description:
      'A taxon is Extinct when there is no reasonable doubt that the last individual has died. Absence of individuals is confirmed through exhaustive surveys across its historical range, across appropriate time periods and habitats.',
  },
  EW: {
    label: 'Extinct in the Wild',
    shortDescription: 'Survives only in captivity or cultivation.',
    description:
      'A taxon is Extinct in the Wild when it is known to survive only in cultivation, captive populations, or as a naturalized population well outside its historical range. Restoration to the wild is typically the long-term conservation goal.',
  },
  CR: {
    label: 'Critically Endangered',
    shortDescription: 'Extremely high risk of extinction.',
    description:
      'A taxon faces an extremely high risk of extinction in the wild. Critically Endangered species typically show rapid population declines or survive in very small, fragmented populations. Immediate conservation intervention is almost always required.',
  },
  EN: {
    label: 'Endangered',
    shortDescription: 'Very high risk of extinction.',
    description:
      'A taxon faces a very high risk of extinction in the wild. Endangered species show significant population declines, restricted ranges, or adverse exploitation. Active conservation management is needed to prevent further decline.',
  },
  VU: {
    label: 'Vulnerable',
    shortDescription: 'High risk of extinction.',
    description:
      'A taxon faces a high risk of extinction in the wild. Vulnerable species are declining due to habitat loss, overharvesting, invasive species, or other pressures. Without intervention, they are likely to become Endangered.',
  },
  NT: {
    label: 'Near Threatened',
    shortDescription: 'Close to qualifying as threatened.',
    description:
      'A taxon does not qualify as Threatened now, but is close to qualifying or is likely to qualify in the near future. Near Threatened species warrant monitoring and preventive conservation attention.',
  },
  LC: {
    label: 'Least Concern',
    shortDescription: 'Widespread and abundant.',
    description:
      'A taxon has been evaluated and does not qualify as Threatened, Near Threatened, or Data Deficient. Least Concern species are generally widespread and abundant, though regional populations may still face local pressures.',
  },
  DD: {
    label: 'Data Deficient',
    shortDescription: 'Insufficient data to assess.',
    description:
      'There is inadequate information to make a direct or indirect assessment of extinction risk. Data Deficient is not a threat category — the taxon may prove threatened or not once sufficient data become available.',
  },
};
