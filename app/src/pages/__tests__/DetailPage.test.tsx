import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetailPage from '../DetailPage';

function renderDetailPage(speciesId: string) {
  return render(
    <MemoryRouter initialEntries={[`/species/${speciesId}`]}>
      <Routes>
        <Route path="/species/:id" element={<DetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DetailPage', () => {
  test('shows species not found for unknown id', () => {
    renderDetailPage('nonexistent-species-xyz');
    expect(screen.getByText('Species not found.')).toBeInTheDocument();
  });

  test('renders species name for valid monarch id', () => {
    renderDetailPage('insect_monarch-butterfly');
    expect(
      screen.getByRole('heading', { name: 'Monarch Butterfly' })
    ).toBeInTheDocument();
  });

  test('renders back link pointing to home', () => {
    renderDetailPage('insect_monarch-butterfly');
    const back = screen.getByRole('link', { name: /all species/i });
    expect(back).toHaveAttribute('href', '/');
  });

  test('renders keystone badge for monarch', () => {
    renderDetailPage('insect_monarch-butterfly');
    expect(screen.getByText(/Keystone Mutualist/i)).toBeInTheDocument();
  });

  test('renders life stages for monarch', () => {
    renderDetailPage('insect_monarch-butterfly');
    expect(screen.getByText('Life Stages')).toBeInTheDocument();
    expect(screen.getByText('Egg')).toBeInTheDocument();
  });

  test('renders key relationship for monarch (has obligate symbiosis)', () => {
    renderDetailPage('insect_monarch-butterfly');
    expect(screen.getByText('Key Relationship')).toBeInTheDocument();
    expect(screen.getByText('Obligate')).toBeInTheDocument();
  });

  test('renders neighbors grid for monarch', () => {
    renderDetailPage('insect_monarch-butterfly');
    expect(screen.getByText('Neighbors')).toBeInTheDocument();
  });

  test('renders disabled log sighting button', () => {
    renderDetailPage('insect_monarch-butterfly');
    const btn = screen.getByRole('button', { name: /log sighting/i });
    expect(btn).toBeDisabled();
  });
});
