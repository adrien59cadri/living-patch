import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SpeciesCard } from '../SpeciesCard';
import {
  mockMonarch,
  mockMonarchYearRound,
  mockNoLifeStages,
  mockObligateEntry,
  mockBirdEntry,
} from '../../test/fixtures';
import type { RelatedEntry } from '../../lib/relationships';

function renderCard(
  species = mockMonarch,
  related: RelatedEntry[] = [mockObligateEntry, mockBirdEntry]
) {
  return render(
    <MemoryRouter>
      <SpeciesCard species={species} related={related} />
    </MemoryRouter>
  );
}

describe('SpeciesCard', () => {
  test('renders the common name', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Monarch Butterfly' })).toBeInTheDocument();
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
    renderCard(mockMonarchYearRound, []);
    expect(screen.getByText('Year-round')).toBeInTheDocument();
  });

  test('renders LIFE STAGES section for species with stage objects', () => {
    renderCard();
    expect(screen.getByText('Life Stages')).toBeInTheDocument();
    expect(screen.getByText('Egg')).toBeInTheDocument();
    expect(screen.getByText('Caterpillar')).toBeInTheDocument();
  });

  test('omits LIFE STAGES section for string-only stages', () => {
    renderCard(mockNoLifeStages, []);
    expect(screen.queryByText('LIFE STAGES')).not.toBeInTheDocument();
  });

  test('renders KEY RELATIONSHIP section when obligate entry exists', () => {
    renderCard(mockMonarch, [mockObligateEntry]);
    expect(screen.getByText('Key Relationship')).toBeInTheDocument();
    expect(screen.getByText('Common Milkweed')).toBeInTheDocument();
    expect(screen.getByText('Obligate')).toBeInTheDocument();
  });

  test('omits KEY RELATIONSHIP when no obligate entries', () => {
    renderCard(mockMonarch, [mockBirdEntry]);
    expect(screen.queryByText('KEY RELATIONSHIP')).not.toBeInTheDocument();
  });

  test('renders NEIGHBORS section when related entries exist', () => {
    renderCard();
    expect(screen.getByText('Neighbors')).toBeInTheDocument();
  });

  test('omits NEIGHBORS section when no related entries', () => {
    renderCard(mockMonarch, []);
    expect(screen.queryByText('NEIGHBORS')).not.toBeInTheDocument();
  });

  test('renders Log Sighting button in disabled state', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: /log sighting/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  test('renders the functional description', () => {
    renderCard();
    expect(
      screen.getByText(/Orange and black butterfly obligate on milkweed/)
    ).toBeInTheDocument();
  });

  test('renders keystone callout block when keystone_description present', () => {
    renderCard();
    expect(screen.getByText(/Obligate on milkweed/)).toBeInTheDocument();
  });
});
