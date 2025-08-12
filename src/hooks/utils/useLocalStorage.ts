import { useState, useCallback, useEffect, useMemo } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  onError?: (error: Error) => void;
  syncAcrossTabs?: boolean;
}

interface UseLocalStorageReturn<T> {
  storedValue: T;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
  error: Error | null;
  isLoading: boolean;
}

const defaultSerializer = {
  read: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  write: (value: unknown) => JSON.stringify(value),
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const {
    serializer = defaultSerializer,
    onError,
    syncAcrossTabs = true
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      setError(null);
      const item = window.localStorage.getItem(key);
      return item !== null ? serializer.read(item) : initialValue;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to read from localStorage');
      setError(err);
      if (onError) {
        onError(err);
      }
      return initialValue;
    } finally {
      setIsLoading(false);
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        console.warn('useLocalStorage: localStorage is not available');
        return;
      }

      try {
        setError(null);
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        window.localStorage.setItem(key, serializer.write(valueToStore));
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to write to localStorage');
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [key, serializer, storedValue, onError]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn('useLocalStorage: localStorage is not available');
      return;
    }

    try {
      setError(null);
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to remove from localStorage');
      setError(err);
      if (onError) {
        onError(err);
      }
    }
  }, [key, initialValue, onError]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== localStorage) {
        return;
      }

      try {
        setError(null);
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(serializer.read(e.newValue));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to sync localStorage change');
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, serializer, onError, syncAcrossTabs]);

  return useMemo(() => ({
    storedValue,
    setValue,
    removeValue,
    error,
    isLoading
  }), [storedValue, setValue, removeValue, error, isLoading]);
};