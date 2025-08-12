import React, { useState, useCallback, useMemo } from 'react';

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

/**
 * Hook for managing boolean state with convenient toggle functions
 * @param initialValue - Initial boolean value (default: false)
 * @returns Object with current value and toggle functions
 */
export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return useMemo(() => ({
    value,
    toggle,
    setTrue,
    setFalse,
    setValue: setValueCallback
  }), [value, toggle, setTrue, setFalse, setValueCallback]);
};

/**
 * Hook for managing multiple boolean states with individual toggle functions
 * @param initialStates - Object with initial boolean values
 * @returns Object with current states and toggle functions
 */
export const useMultiToggle = <T extends Record<string, boolean>>(
  initialStates: T
): {
  values: T;
  toggles: Record<keyof T, () => void>;
  setters: Record<keyof T, (value: boolean) => void>;
  reset: () => void;
  setAll: (value: boolean) => void;
} => {
  const [values, setValues] = useState<T>(initialStates);

  const toggles = useMemo(() => {
    const result = {} as Record<keyof T, () => void>;
    
    Object.keys(initialStates).forEach(key => {
      result[key as keyof T] = () => {
        setValues(prev => ({
          ...prev,
          [key]: !prev[key as keyof T]
        }));
      };
    });
    
    return result;
  }, [initialStates]);

  const setters = useMemo(() => {
    const result = {} as Record<keyof T, (value: boolean) => void>;
    
    Object.keys(initialStates).forEach(key => {
      result[key as keyof T] = (value: boolean) => {
        setValues(prev => ({
          ...prev,
          [key]: value
        }));
      };
    });
    
    return result;
  }, [initialStates]);

  const reset = useCallback(() => {
    setValues(initialStates);
  }, [initialStates]);

  const setAll = useCallback((value: boolean) => {
    const newState = {} as T;
    Object.keys(initialStates).forEach(key => {
      newState[key as keyof T] = value;
    });
    setValues(newState);
  }, [initialStates]);

  return useMemo(() => ({
    values,
    toggles,
    setters,
    reset,
    setAll
  }), [values, toggles, setters, reset, setAll]);
};

/**
 * Hook for managing toggle state with persistence to localStorage
 * @param key - localStorage key
 * @param initialValue - Initial boolean value if not found in localStorage
 * @returns Object with current value and toggle functions
 */
export const usePersistedToggle = (
  key: string,
  initialValue: boolean = false
): UseToggleReturn => {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const toggle = useCallback(() => {
    setValue(prev => {
      const newValue = !prev;
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Failed to persist toggle state for key "${key}":`, error);
      }
      return newValue;
    });
  }, [key]);

  const setTrue = useCallback(() => {
    setValue(true);
    try {
      window.localStorage.setItem(key, JSON.stringify(true));
    } catch (error) {
      console.warn(`Failed to persist toggle state for key "${key}":`, error);
    }
  }, [key]);

  const setFalse = useCallback(() => {
    setValue(false);
    try {
      window.localStorage.setItem(key, JSON.stringify(false));
    } catch (error) {
      console.warn(`Failed to persist toggle state for key "${key}":`, error);
    }
  }, [key]);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Failed to persist toggle state for key "${key}":`, error);
    }
  }, [key]);

  return useMemo(() => ({
    value,
    toggle,
    setTrue,
    setFalse,
    setValue: setValueCallback
  }), [value, toggle, setTrue, setFalse, setValueCallback]);
};

/**
 * Hook for managing toggle state with automatic timeout
 * @param initialValue - Initial boolean value
 * @param timeout - Timeout in milliseconds after which state resets to false
 * @returns Object with current value and toggle functions
 */
export const useTimeoutToggle = (
  initialValue: boolean = false,
  timeout: number = 3000
): UseToggleReturn & { 
  timeRemaining: number | null;
  clearTimeout: () => void;
} => {
  const [value, setValue] = useState<boolean>(initialValue);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimeRemaining(null);
  }, [timeoutId, intervalId]);

  const startTimeout = useCallback(() => {
    clearCurrentTimeout();
    
    if (timeout > 0) {
      const startTime = Date.now();
      setTimeRemaining(timeout);
      
      // Set timeout to reset value
      const newTimeoutId = setTimeout(() => {
        setValue(false);
        clearCurrentTimeout();
      }, timeout);
      setTimeoutId(newTimeoutId);
      
      // Update remaining time every 100ms
      const newIntervalId = setInterval(() => {
        const remaining = timeout - (Date.now() - startTime);
        if (remaining <= 0) {
          clearCurrentTimeout();
        } else {
          setTimeRemaining(remaining);
        }
      }, 100);
      setIntervalId(newIntervalId);
    }
  }, [timeout, clearCurrentTimeout]);

  const toggle = useCallback(() => {
    setValue(prev => {
      const newValue = !prev;
      if (newValue && timeout > 0) {
        startTimeout();
      } else {
        clearCurrentTimeout();
      }
      return newValue;
    });
  }, [timeout, startTimeout, clearCurrentTimeout]);

  const setTrue = useCallback(() => {
    setValue(true);
    if (timeout > 0) {
      startTimeout();
    }
  }, [timeout, startTimeout]);

  const setFalse = useCallback(() => {
    setValue(false);
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
    if (newValue && timeout > 0) {
      startTimeout();
    } else {
      clearCurrentTimeout();
    }
  }, [timeout, startTimeout, clearCurrentTimeout]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearCurrentTimeout();
    };
  }, [clearCurrentTimeout]);

  return useMemo(() => ({
    value,
    toggle,
    setTrue,
    setFalse,
    setValue: setValueCallback,
    timeRemaining,
    clearTimeout: clearCurrentTimeout
  }), [
    value,
    toggle,
    setTrue,
    setFalse,
    setValueCallback,
    timeRemaining,
    clearCurrentTimeout
  ]);
};