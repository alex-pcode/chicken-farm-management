import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface UseDebounceReturn<T> {
  debouncedValue: T;
  isDebouncing: boolean;
  cancel: () => void;
  flush: () => void;
}

export const useDebounce = <T>(
  value: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> => {
  const { leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [maxTimeoutRef, setMaxTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number | null>(null);
  const [leadingExecuted, setLeadingExecuted] = useState(false);

  const cancel = useCallback(() => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      setTimeoutRef(null);
    }
    if (maxTimeoutRef) {
      clearTimeout(maxTimeoutRef);
      setMaxTimeoutRef(null);
    }
    setIsDebouncing(false);
    setLeadingExecuted(false);
    setLastCallTime(null);
  }, [timeoutRef, maxTimeoutRef]);

  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(value);
  }, [value, cancel]);

  const updateDebouncedValue = useCallback((newValue: T) => {
    setDebouncedValue(newValue);
    setIsDebouncing(false);
    setLeadingExecuted(false);
  }, []);

  useEffect(() => {
    const now = Date.now();
    
    // Cancel previous timeout
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    // Set up debouncing flag
    if (!isDebouncing) {
      setIsDebouncing(true);
    }

    // Handle leading edge
    if (leading && (!lastCallTime || !leadingExecuted)) {
      updateDebouncedValue(value);
      setLeadingExecuted(true);
      setLastCallTime(now);
      
      // If only leading is enabled, return early
      if (!trailing) {
        return;
      }
    }

    // Set up trailing timeout
    if (trailing) {
      const newTimeout = setTimeout(() => {
        updateDebouncedValue(value);
      }, delay);
      
      setTimeoutRef(newTimeout);
      setLastCallTime(now);

      // Handle maxWait
      if (maxWait && !maxTimeoutRef) {
        const newMaxTimeout = setTimeout(() => {
          updateDebouncedValue(value);
        }, maxWait);
        
        setMaxTimeoutRef(newMaxTimeout);
      }
    }

    // Cleanup function
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [value, delay, leading, trailing, maxWait, lastCallTime, leadingExecuted, timeoutRef, maxTimeoutRef, updateDebouncedValue, isDebouncing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return useMemo(() => ({
    debouncedValue,
    isDebouncing,
    cancel,
    flush
  }), [debouncedValue, isDebouncing, cancel, flush]);
};

// Simplified version for common use cases
export const useSimpleDebounce = <T>(value: T, delay: number = 300): T => {
  const { debouncedValue } = useDebounce(value, delay);
  return debouncedValue;
};

// Hook for debouncing function calls
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300,
  options: UseDebounceOptions = {}
): [T, () => void, () => void] => {
  const { leading = false, trailing = true } = options;
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [leadingExecuted, setLeadingExecuted] = useState(false);

  const cancel = useCallback(() => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      setTimeoutRef(null);
    }
    setLeadingExecuted(false);
  }, [timeoutRef]);

  const flush = useCallback(() => {
    cancel();
    // Execute callback immediately
    callback();
  }, [callback, cancel]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      cancel();

      // Handle leading edge
      if (leading && !leadingExecuted) {
        callback(...args);
        setLeadingExecuted(true);
        
        if (!trailing) {
          return;
        }
      }

      // Handle trailing edge
      if (trailing) {
        const newTimeout = setTimeout(() => {
          callback(...args);
          setLeadingExecuted(false);
        }, delay);
        
        setTimeoutRef(newTimeout);
      }
    }) as T,
    [callback, delay, leading, trailing, leadingExecuted, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedCallback, cancel, flush];
};