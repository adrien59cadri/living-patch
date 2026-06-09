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
    expect(dietLabel('insectivore')).toBe('Insectivore');
    expect(dietLabel('nectarivore')).toBe('Nectarivore');
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
    expect(symbiosisLabel('parasitism')).toBe('Parasitism');
  });

  test('returns type itself for unknown', () => {
    expect(symbiosisLabel('unknown_type')).toBe('unknown_type');
  });
});

describe('formIcon', () => {
  test.each([
    ['butterfly', '🦋'],
    ['bee', '🐝'],
    ['owl', '🦉'],
    ['tree', '🌳'],
    ['frog', '🐸'],
  ])('%s → %s', (form, expected) => {
    expect(formIcon(form)).toBe(expected);
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

  test.each([[[] as string[]], [undefined]])('returns null for %s', (input) => {
    expect(activeMonthsLabel(input)).toBeNull();
  });
});
