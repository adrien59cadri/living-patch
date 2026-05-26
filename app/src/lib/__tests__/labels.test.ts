import { describe, test, expect } from 'vitest';
import {
  formLabel,
  habitatLabel,
  dietLabel,
  behaviorLabel,
  seasonLabel,
  symbiosisLabel,
  formIcon,
  activeMonthsLabel,
} from '../labels';

describe('formLabel', () => {
  test('returns human-readable label for known form', () => {
    expect(formLabel('woodpecker')).toBe('Woodpecker');
    expect(formLabel('butterfly')).toBe('Butterfly');
  });

  test('capitalises and replaces underscores for unknown form', () => {
    expect(formLabel('weird_form')).toBe('Weird Form');
  });
});

describe('habitatLabel', () => {
  test('returns label for known habitat', () => {
    expect(habitatLabel('forest')).toBe('Forest');
    expect(habitatLabel('forest_edge')).toBe('Forest edge');
  });
});

describe('dietLabel', () => {
  test('returns label for known diet', () => {
    expect(dietLabel('insect_eater')).toBe('Insect eater');
    expect(dietLabel('nectar_feeder')).toBe('Nectar feeder');
  });
});

describe('behaviorLabel', () => {
  test('capitalises and replaces underscores', () => {
    expect(behaviorLabel('long_distance_migrant')).toBe('Long Distance Migrant');
  });
});

describe('seasonLabel', () => {
  test('returns label for known season', () => {
    expect(seasonLabel('year_round')).toBe('Year-round');
    expect(seasonLabel('fall_migrant')).toBe('Fall migrant');
  });
});

describe('symbiosisLabel', () => {
  test('returns label for known type', () => {
    expect(symbiosisLabel('mutualism')).toBe('Mutualism');
    expect(symbiosisLabel('parasitism')).toBe('Parasitism & Hosting');
  });

  test('returns type itself for unknown', () => {
    expect(symbiosisLabel('unknown_type')).toBe('unknown_type');
  });
});

describe('formIcon', () => {
  test('returns emoji for known forms', () => {
    expect(formIcon('butterfly')).toBe('🦋');
    expect(formIcon('bee')).toBe('🐝');
    expect(formIcon('owl')).toBe('🦉');
    expect(formIcon('tree')).toBe('🌳');
    expect(formIcon('frog')).toBe('🐸');
  });

  test('returns fallback emoji for unknown form', () => {
    expect(formIcon('unknown_xyz')).toBe('🌱');
  });
});

describe('activeMonthsLabel', () => {
  test('returns "Year-round" for Jan-Dec', () => {
    expect(activeMonthsLabel(['Jan-Dec'])).toBe('Year-round');
  });

  test('returns the range string as-is', () => {
    expect(activeMonthsLabel(['May-Oct'])).toBe('May-Oct');
    expect(activeMonthsLabel(['Apr-May'])).toBe('Apr-May');
  });

  test('returns null for empty array', () => {
    expect(activeMonthsLabel([])).toBeNull();
  });

  test('returns null for undefined', () => {
    expect(activeMonthsLabel(undefined)).toBeNull();
  });
});
