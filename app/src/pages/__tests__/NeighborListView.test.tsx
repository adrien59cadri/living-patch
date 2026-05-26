import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NeighborListView from '../NeighborListView';

function renderNeighborList(speciesId: string, category: string) {
  return render(
    <MemoryRouter
      initialEntries={[`/species/${speciesId}/neighbors/${category}`]}
    >
      <Routes>
        <Route
          path="/species/:id/neighbors/:category"
          element={<NeighborListView />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('NeighborListView', () => {
  test('shows species not found for unknown species id', () => {
    renderNeighborList('nonexistent-xyz', 'plants');
    expect(screen.getByText('Species not found.')).toBeInTheDocument();
  });

  test('shows category not found for invalid category slug', () => {
    renderNeighborList('insect_monarch-butterfly', 'invalid-category');
    expect(screen.getByText('Category not found.')).toBeInTheDocument();
  });

  test('renders correct heading for plants category', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    expect(
      screen.getByRole('heading', {
        name: /plants connected to monarch butterfly/i,
      })
    ).toBeInTheDocument();
  });

  test('shows at least one plant species entry', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    // Monarch has multiple milkweed entries; getAllByText handles duplicates
    expect(screen.getAllByText('Common Milkweed').length).toBeGreaterThan(0);
  });

  test('renders back link to parent species page', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    const back = screen.getByRole('link', { name: /monarch butterfly/i });
    expect(back).toHaveAttribute('href', '/species/insect_monarch-butterfly');
  });

  test('shows species count', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    // Should show a count like "6 species"
    expect(screen.getByText(/^\d+ species$/)).toBeInTheDocument();
  });

  test('group placeholder entries are not wrapped in a link', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    const groupElements = screen.queryAllByText('Other Native Milkweeds');
    // Every group placeholder text element should have no <a> ancestor
    for (const el of groupElements) {
      expect(el.closest('a')).toBeNull();
    }
  });

  test('renders symbiosis type badge for entries with roles', () => {
    renderNeighborList('insect_monarch-butterfly', 'plants');
    // Monarch→milkweed is parasitism
    expect(screen.getAllByText('Parasitism & Hosting').length).toBeGreaterThan(0);
  });
});
