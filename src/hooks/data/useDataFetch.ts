import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ApiServiceError } from '../../types/api';

export interface UseDataFetchOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  cacheTime?: number;
  staleTime?: number;
  enabled?: boolean;
}

export interface UseDataFetchReturn<T> {
  data: T | undefined;
  error: ApiServiceError | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export const useDataFetch = <T>(options: UseDataFetchOptions<T>): UseDataFetchReturn<T> => {
  const {
    key,
    fetcher,
    cacheTime = 300000, // 5 minutes default
    staleTime = 60000,  // 1 minute default
    enabled = true
  } = options;

  // State declarations
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiServiceError | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isValidating, setIsValidating] = useState(false);

  // Check cache for existing data
  const getCachedData = useCallback((): T | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  }, [key, cacheTime]);

  // Check if data is stale
  const isStale = useCallback((): boolean => {
    const cached = cache.get(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp > cached.staleTime;
  }, [key]);

  // Fetch data from API
  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsValidating(true);
      }
      
      setError(null);
      
      const result = await fetcher();
      
      // Cache the result
      cache.set(key, {
        data: result,
        timestamp: Date.now(),
        staleTime
      });
      
      setData(result);
    } catch (err) {
      const apiError = err as ApiServiceError;
      setError(apiError);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [enabled, fetcher, key, staleTime]);

  // Mutate (refetch) data
  const mutate = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  // Refetch with loading
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (!enabled) return;

    // Check cache first
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setIsLoading(false);
      
      // If data is stale, refetch in background
      if (Date.now() - cached.timestamp > cached.staleTime) {
        fetchData(false);
      }
    } else {
      // No cached data, fetch from API
      fetchData(true);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key, cacheTime]);

  // Return stable object
  return useMemo(() => ({
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refetch,
  }), [data, error, isLoading, isValidating, mutate, refetch]);
};