import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App component mounting', () => {
  test('mounts without errors', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  test('renders the component with content', () => {
    const { container } = render(<App />);
    // Check that something rendered
    const content = container.innerHTML;
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(0);
  });

  test('renders header with LivingPatch title', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    // The header contains a Link to "/" with text "🌿 LivingPatch"
    const title = screen.getByText(/🌿 LivingPatch/);
    expect(title).toBeInTheDocument();
    expect(title.getAttribute('href')).toBe('#/');
  });

  test('renders navigation links in header', () => {
    render(<App />);
    const learn = screen.getByRole('link', { name: /Learn/ });
    const settings = screen.getByRole('link', { name: /Settings/ });
    expect(learn).toBeInTheDocument();
    expect(settings).toBeInTheDocument();
    expect(learn.getAttribute('href')).toBe('#/learn');
    expect(settings.getAttribute('href')).toBe('#/settings');
  });

  test('renders main content area', () => {
    const { container } = render(<App />);
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
  });

  test('renders location text in header', () => {
    render(<App />);
    expect(screen.getByText('NE Pennsylvania')).toBeInTheDocument();
  });

  test('renders home page content by default', () => {
    render(<App />);
    // HomePage should render a search bar
    const searchBar = screen.getByRole('searchbox');
    expect(searchBar).toBeInTheDocument();
  });
});
