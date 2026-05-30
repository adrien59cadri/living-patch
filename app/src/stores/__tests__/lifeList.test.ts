import { describe, test, expect, beforeEach } from 'vitest';
import { useLifeListStore } from '../../stores/lifeList';

// Reset store state before each test to ensure isolation
beforeEach(() => {
  useLifeListStore.setState({ entries: [], sightings: [] });
});

describe('lifeList store', () => {
  describe('addSighting', () => {
    test('creates a new entry with noticed tier on first sighting', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      const { entries } = useLifeListStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].speciesId).toBe('bird_test');
      expect(entries[0].tier).toBe('noticed');
      expect(entries[0].sightingCount).toBe(1);
    });

    test('sets firstSightedDate from the first sighting date', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      const { entries } = useLifeListStore.getState();
      expect(entries[0].firstSightedDate).toBe('2026-05-01');
    });

    test('increments sightingCount for subsequent sightings of same species', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-15' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      const { entries } = useLifeListStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].sightingCount).toBe(3);
    });

    test('does not change firstSightedDate on subsequent sightings', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      const { entries } = useLifeListStore.getState();
      expect(entries[0].firstSightedDate).toBe('2026-05-01');
    });

    test('stores optional location and notes', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({
        speciesId: 'bird_test',
        date: '2026-05-30',
        location: 'backyard',
        notes: 'singing',
      });
      const { sightings } = useLifeListStore.getState();
      expect(sightings[0].location).toBe('backyard');
      expect(sightings[0].notes).toBe('singing');
    });

    test('stores optional weather and time conditions', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({
        speciesId: 'bird_test',
        date: '2026-05-30',
        conditions: { weather: 'sunny', time: 'morning' },
      });
      const { sightings } = useLifeListStore.getState();
      expect(sightings[0].conditions?.weather).toBe('sunny');
      expect(sightings[0].conditions?.time).toBe('morning');
    });

    test('assigns a unique id and createdAt timestamp to each sighting', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      const { sightings } = useLifeListStore.getState();
      expect(sightings[0].id).toBeTruthy();
      expect(sightings[1].id).toBeTruthy();
      expect(sightings[0].id).not.toBe(sightings[1].id);
      expect(typeof sightings[0].createdAt).toBe('number');
    });

    test('creates separate entries for different species', () => {
      const { addSighting } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'plant_oak', date: '2026-05-15' });
      const { entries, sightings } = useLifeListStore.getState();
      expect(entries).toHaveLength(2);
      expect(sightings).toHaveLength(2);
    });
  });

  describe('setTier', () => {
    test('creates a new entry when setting tier for unknown species', () => {
      const { setTier } = useLifeListStore.getState();
      setTier('bird_test', 'familiar');
      const { entries } = useLifeListStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].speciesId).toBe('bird_test');
      expect(entries[0].tier).toBe('familiar');
      expect(entries[0].sightingCount).toBe(0);
    });

    test('updates tier for existing species entry', () => {
      const { addSighting, setTier } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      setTier('bird_test', 'steward');
      const { entries } = useLifeListStore.getState();
      expect(entries[0].tier).toBe('steward');
      expect(entries[0].sightingCount).toBe(1); // count unchanged
    });

    test('does not reset sightingCount when tier is changed', () => {
      const { addSighting, setTier } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-15' });
      setTier('bird_test', 'know-it-well');
      const { entries } = useLifeListStore.getState();
      expect(entries[0].sightingCount).toBe(2);
      expect(entries[0].tier).toBe('know-it-well');
    });
  });

  describe('getTier', () => {
    test('returns null for unknown species', () => {
      const { getTier } = useLifeListStore.getState();
      expect(getTier('unknown')).toBeNull();
    });

    test('returns the correct tier after setTier', () => {
      const { setTier, getTier } = useLifeListStore.getState();
      setTier('bird_test', 'familiar');
      expect(getTier('bird_test')).toBe('familiar');
    });
  });

  describe('getSightings', () => {
    test('returns empty array for species with no sightings', () => {
      const { getSightings } = useLifeListStore.getState();
      expect(getSightings('unknown')).toHaveLength(0);
    });

    test('returns only sightings for the requested species', () => {
      const { addSighting, getSightings } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'plant_oak', date: '2026-05-15' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-30' });
      expect(getSightings('bird_test')).toHaveLength(2);
      expect(getSightings('plant_oak')).toHaveLength(1);
    });
  });

  describe('getSightingCount', () => {
    test('returns 0 for unknown species', () => {
      const { getSightingCount } = useLifeListStore.getState();
      expect(getSightingCount('unknown')).toBe(0);
    });

    test('returns the correct count', () => {
      const { addSighting, getSightingCount } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' });
      addSighting({ speciesId: 'bird_test', date: '2026-05-15' });
      expect(getSightingCount('bird_test')).toBe(2);
    });
  });

  describe('getEntriesForTier', () => {
    test('returns empty array when no entries exist', () => {
      const { getEntriesForTier } = useLifeListStore.getState();
      expect(getEntriesForTier('noticed')).toHaveLength(0);
    });

    test('returns only entries matching the requested tier', () => {
      const { addSighting, setTier, getEntriesForTier } = useLifeListStore.getState();
      addSighting({ speciesId: 'bird_test', date: '2026-05-01' }); // noticed (default)
      addSighting({ speciesId: 'plant_oak', date: '2026-05-15' }); // noticed
      setTier('plant_oak', 'steward');
      expect(getEntriesForTier('noticed')).toHaveLength(1);
      expect(getEntriesForTier('steward')).toHaveLength(1);
      expect(getEntriesForTier('familiar')).toHaveLength(0);
    });
  });

  describe('getTierProgress', () => {
    test('returns zero counts when store is empty', () => {
      const { getTierProgress } = useLifeListStore.getState();
      const progress = getTierProgress();
      expect(progress.noticed).toBe(0);
      expect(progress.familiar).toBe(0);
      expect(progress['know-it-well']).toBe(0);
      expect(progress.steward).toBe(0);
    });

    test('returns correct counts per tier', () => {
      const { addSighting, setTier, getTierProgress } = useLifeListStore.getState();
      addSighting({ speciesId: 'a', date: '2026-05-01' }); // noticed
      addSighting({ speciesId: 'b', date: '2026-05-01' }); // noticed
      addSighting({ speciesId: 'c', date: '2026-05-01' }); // noticed → familiar
      setTier('c', 'familiar');
      addSighting({ speciesId: 'd', date: '2026-05-01' }); // noticed → steward
      setTier('d', 'steward');
      const progress = getTierProgress();
      expect(progress.noticed).toBe(2);
      expect(progress.familiar).toBe(1);
      expect(progress.steward).toBe(1);
    });
  });
});
