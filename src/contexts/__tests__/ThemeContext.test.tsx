import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component that uses the theme context
const TestConsumer = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('ThemeContext', () => {
  let localStorageMock: Record<string, string>;
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });

    // Setup matchMedia mock
    mediaQueryListeners = [];
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark') ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          mediaQueryListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = mediaQueryListeners.indexOf(listener);
          if (index > -1) {
            mediaQueryListeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true });

    // Clean up document class list
    document.documentElement.classList.remove('dark', 'light');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides default system theme when no preference stored', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  it('uses stored theme from localStorage', () => {
    localStorageMock['theme'] = 'dark';

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('allows setting theme to light', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Light'));
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(localStorageMock['theme']).toBe('light');
  });

  it('allows setting theme to dark', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Dark'));
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(localStorageMock['theme']).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('allows setting theme to system', () => {
    localStorageMock['theme'] = 'dark';

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set System'));
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(localStorageMock['theme']).toBe('system');
  });

  it('responds to system theme changes when in system mode', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    // Set to system mode
    act(() => {
      fireEvent.click(screen.getByText('Set System'));
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('system');

    // Simulate system dark mode change
    act(() => {
      mediaQueryListeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  it('ignores system theme changes when not in system mode', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    // Set to light mode explicitly
    act(() => {
      fireEvent.click(screen.getByText('Set Light'));
    });

    // Simulate system dark mode change
    act(() => {
      mediaQueryListeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    // Should still be light
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
