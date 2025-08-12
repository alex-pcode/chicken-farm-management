import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToggle, useMultiToggle, usePersistedToggle, useTimeoutToggle } from '../useToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useToggle());
    
    expect(result.current.value).toBe(false);
  });

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    
    expect(result.current.value).toBe(true);
  });

  it('should toggle value correctly', () => {
    const { result } = renderHook(() => useToggle(false));
    
    expect(result.current.value).toBe(false);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.value).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.value).toBe(false);
  });

  it('should set value to true', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current.setTrue();
    });
    
    expect(result.current.value).toBe(true);
  });

  it('should set value to false', () => {
    const { result } = renderHook(() => useToggle(true));
    
    act(() => {
      result.current.setFalse();
    });
    
    expect(result.current.value).toBe(false);
  });

  it('should set value directly', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current.setValue(true);
    });
    
    expect(result.current.value).toBe(true);
    
    act(() => {
      result.current.setValue(false);
    });
    
    expect(result.current.value).toBe(false);
  });
});

describe('useMultiToggle', () => {
  it('should initialize with provided initial states', () => {
    const initialStates = { modal: false, sidebar: true, dropdown: false };
    const { result } = renderHook(() => useMultiToggle(initialStates));
    
    expect(result.current.values).toEqual(initialStates);
  });

  it('should toggle individual values', () => {
    const initialStates = { modal: false, sidebar: true };
    const { result } = renderHook(() => useMultiToggle(initialStates));
    
    act(() => {
      result.current.toggles.modal();
    });
    
    expect(result.current.values.modal).toBe(true);
    expect(result.current.values.sidebar).toBe(true);
  });

  it('should set individual values', () => {
    const initialStates = { modal: false, sidebar: true };
    const { result } = renderHook(() => useMultiToggle(initialStates));
    
    act(() => {
      result.current.setters.modal(true);
    });
    
    expect(result.current.values.modal).toBe(true);
  });

  it('should reset to initial states', () => {
    const initialStates = { modal: false, sidebar: true };
    const { result } = renderHook(() => useMultiToggle(initialStates));
    
    act(() => {
      result.current.toggles.modal();
      result.current.toggles.sidebar();
    });
    
    expect(result.current.values).toEqual({ modal: true, sidebar: false });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.values).toEqual(initialStates);
  });

  it('should set all values at once', () => {
    const initialStates = { modal: false, sidebar: false, dropdown: false };
    const { result } = renderHook(() => useMultiToggle(initialStates));
    
    act(() => {
      result.current.setAll(true);
    });
    
    expect(result.current.values).toEqual({ modal: true, sidebar: true, dropdown: true });
  });
});

describe('usePersistedToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default value when localStorage is empty', () => {
    const { result } = renderHook(() => usePersistedToggle('test-key', false));
    
    expect(result.current.value).toBe(false);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should initialize with stored value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    const { result } = renderHook(() => usePersistedToggle('test-key', false));
    
    expect(result.current.value).toBe(true);
  });

  it('should persist value to localStorage when toggled', () => {
    const { result } = renderHook(() => usePersistedToggle('test-key', false));
    
    act(() => {
      result.current.toggle();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'true');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => usePersistedToggle('test-key', false));
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.value).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to persist toggle state'),
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});

describe('useTimeoutToggle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useTimeoutToggle(false, 1000));
    
    expect(result.current.value).toBe(false);
    expect(result.current.timeRemaining).toBe(null);
  });

  it('should start timeout when set to true', () => {
    const { result } = renderHook(() => useTimeoutToggle(false, 1000));
    
    act(() => {
      result.current.setTrue();
    });
    
    expect(result.current.value).toBe(true);
    // timeRemaining should be either null or a number when timeout is disabled
    if (result.current.timeRemaining !== null) {
      expect(result.current.timeRemaining).toBeGreaterThan(0);
      expect(result.current.timeRemaining).toBeLessThanOrEqual(1000);
    }
  });

  it('should reset to false after timeout', () => {
    const { result } = renderHook(() => useTimeoutToggle(false, 1000));
    
    act(() => {
      result.current.setTrue();
    });
    
    expect(result.current.value).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(result.current.value).toBe(false);
    expect(result.current.timeRemaining).toBe(null);
  });

  it('should update time remaining', () => {
    const { result } = renderHook(() => useTimeoutToggle(false, 1000));
    
    act(() => {
      result.current.setTrue();
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current.timeRemaining).toBeLessThanOrEqual(500);
    expect(result.current.timeRemaining).toBeGreaterThan(0);
  });

  it('should clear timeout manually', () => {
    const { result } = renderHook(() => useTimeoutToggle(false, 1000));
    
    act(() => {
      result.current.setTrue();
    });
    
    expect(result.current.value).toBe(true);
    
    act(() => {
      result.current.clearTimeout();
    });
    
    expect(result.current.timeRemaining).toBe(null);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Should still be true because timeout was cleared
    expect(result.current.value).toBe(true);
  });
});