import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SpeciesCard } from '../SpeciesCard';
import type { Species } from '../../types';
import {
  mockMonarch,
  mockMonarchYearRound,
  mockNoLifeStages,
  mockObligateEntry,
  mockBirdEntry,
} from '../../test/fixtures';
import type { RelatedEntry } from '../../lib/relationships';

// Mock life list hooks so SpeciesCard unit tests don't depend on Zustand/localStorage
vi.mock('../../hooks/useLifeList', () => ({
  useLifeList: () => ({
    addSighting: vi.fn(),
    setTier: vi.fn(),
    getTier: () => null,
    entries: [],
    sightings: [],
  }),
  useSpeciesTier: () => null,
  useSpeciesSightings: () => [],
  useSpeciesSightingCount: () => 0,
}));

function renderCard(
  species = mockMonarch,
  symbiotes: RelatedEntry[] = [mockObligateEntry],
  habitatNeighbors: Species[] = [],
  related: RelatedEntry[] = [mockObligateEntry, mockBirdEntry]
) {
  return render(
    <MemoryRouter>
      <SpeciesCard species={species} symbiotes={symbiotes} habitatNeighbors={habitatNeighbors} related={related} />
    </MemoryRouter>
  );
}

describe('SpeciesCard', () => {
  test('renders the common name', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: /Monarch Butterfly/ })).toBeInTheDocument();
  });

  test('shows keystone badge when is_keystone is true', () => {
    renderCard();
    expect(screen.getByText(/Keystone Mutualist/i)).toBeInTheDocument();
  });

  test('does not show keystone badge when is_keystone is false', () => {
    renderCard({ ...mockMonarch, is_keystone: false });
    expect(screen.queryByText(/Keystone/i)).not.toBeInTheDocument();
  });

  test('hides latin name by default and reveals on toggle', async () => {
    renderCard();
    expect(screen.queryByText('Danaus plexippus')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('+ Scientific name'));
    expect(screen.getByText(/Danaus plexippus/)).toBeInTheDocument();
  });

  test('renders season chip from active_months', () => {
    renderCard();
    expect(screen.getAllByText('May-Oct').length).toBeGreaterThanOrEqual(1);
  });

  test('renders "Year-round" chip for Jan-Dec active_months', () => {
    renderCard(mockMonarchYearRound, [], [], []);
    expect(screen.getByText('Year-round')).toBeInTheDocument();
  });

  test('renders LIFE STAGES section for species with stage objects', () => {
    renderCard();
    expect(screen.getByText('Life Stages')).toBeInTheDocument();
    expect(screen.getByText('Egg')).toBeInTheDocument();
    expect(screen.getByText('Caterpillar')).toBeInTheDocument();
  });

  test('omits LIFE STAGES section for string-only stages', () => {
    renderCard(mockNoLifeStages, [], [], []);
    expect(screen.queryByText('LIFE STAGES')).not.toBeInTheDocument();
  });

  test('renders RELATIONSHIPS section when critical entry exists', async () => {
    renderCard(mockMonarch, [mockObligateEntry]);
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('Common Milkweed')).toBeInTheDocument();
    // Critical badge is now visible in collapsed view
    const criticalBadges = screen.getAllByText('Critical');
    expect(criticalBadges.length).toBeGreaterThan(0);
  });

  test('omits KEY RELATIONSHIPS when no critical entries', () => {
    renderCard(mockMonarch, [], [], [mockBirdEntry]);
    expect(screen.queryByText('KEY RELATIONSHIPS')).not.toBeInTheDocument();
  });

  test('renders HABITAT NEIGHBORS section when neighbors exist', () => {
    const habitatNeighbor = { ...mockMonarch, id: 'neighbor-id', common_name: 'Test Neighbor' };
    renderCard(mockMonarch, [], [habitatNeighbor], [mockBirdEntry]);
    expect(screen.getByText('Habitat Neighbors')).toBeInTheDocument();
    expect(screen.getByText('Test Neighbor')).toBeInTheDocument();
  });

  test('omits HABITAT NEIGHBORS section when no neighbors exist', () => {
    renderCard(mockMonarch, [], [], []);
    expect(screen.queryByText('HABITAT NEIGHBORS')).not.toBeInTheDocument();
  });

  test('renders Log Sighting button', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: /log sighting/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  test('renders the functional description', () => {
    renderCard();
    expect(
      screen.getByText(/Orange and black butterfly obligate on milkweed/)
    ).toBeInTheDocument();
  });

  describe('Hero image rendering', () => {
    test('shows emoji placeholder when no image data', () => {
      renderCard({ ...mockMonarch, image: undefined });
      expect(screen.getByText('📷')).toBeInTheDocument();
    });

    test('shows emoji placeholder when image URL is empty', () => {
      renderCard({ ...mockMonarch, image: { url: '', author: 'Unknown' } });
      expect(screen.getByText('📷')).toBeInTheDocument();
    });

    test('renders actual image when good image URL is provided', () => {
      const speciesWithImage = {
        ...mockMonarch,
        image: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg/960px-test.jpg',
          author: 'Test Author',
        },
      };
      renderCard(speciesWithImage);
      const img = screen.getByRole('img', { name: /Monarch Butterfly/ });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'src',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg/960px-test.jpg'
      );
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    test('image has correct alt text', () => {
      const speciesWithImage = {
        ...mockMonarch,
        image: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/test.jpg/960px-test.jpg',
          author: 'Test Author',
        },
      };
      renderCard(speciesWithImage);
      const img = screen.getByRole('img', { name: /Monarch Butterfly/ });
      expect(img).toHaveAttribute('alt', 'Monarch Butterfly');
    });
  });
});
