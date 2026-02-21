import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../../../contexts/ThemeContext';

// Helper to render with ThemeProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset document classes
    document.documentElement.classList.remove('dark', 'light');

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark') ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders default variant with light, system, and dark options', () => {
    renderWithProvider(<ThemeToggle />);

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    renderWithProvider(<ThemeToggle variant="compact" />);

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider(<ThemeToggle />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', 'Theme selection');

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3); // Light, System, and Dark

    radios.forEach(radio => {
      expect(radio).toHaveAttribute('aria-checked');
    });
  });

  it('allows selecting light theme', () => {
    renderWithProvider(<ThemeToggle />);

    const lightButton = screen.getByText('Light').closest('button');
    expect(lightButton).toBeInTheDocument();

    fireEvent.click(lightButton!);

    expect(lightButton).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('allows selecting dark theme', () => {
    renderWithProvider(<ThemeToggle />);

    const darkButton = screen.getByText('Dark').closest('button');
    expect(darkButton).toBeInTheDocument();

    fireEvent.click(darkButton!);

    expect(darkButton).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('displays descriptions in default variant', () => {
    renderWithProvider(<ThemeToggle />);

    expect(screen.getByText('Use light mode')).toBeInTheDocument();
    expect(screen.getByText('Follow system preference')).toBeInTheDocument();
    expect(screen.getByText('Use dark mode')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProvider(<ThemeToggle className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows check icon for selected theme', () => {
    renderWithProvider(<ThemeToggle />);

    // Click dark theme
    const darkButton = screen.getByText('Dark').closest('button');
    fireEvent.click(darkButton!);

    // The check icon is within the selected button
    const svgCheck = darkButton!.querySelector('svg');
    expect(svgCheck).toBeInTheDocument();
  });

  it('defaults to system mode when no preference stored', () => {
    renderWithProvider(<ThemeToggle />);

    // With no localStorage value, system mode should be selected
    const systemButton = screen.getByText('System').closest('button');
    expect(systemButton).toHaveAttribute('aria-checked', 'true');
  });

  it('allows selecting system theme', () => {
    // First set a different theme
    localStorage.setItem('theme', 'dark');

    const { rerender } = renderWithProvider(<ThemeToggle />);

    // Clear and rerender with fresh state
    localStorage.clear();
    rerender(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const systemButton = screen.getByText('System').closest('button');
    expect(systemButton).toBeInTheDocument();

    fireEvent.click(systemButton!);

    expect(systemButton).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('theme')).toBe('system');
  });
});
