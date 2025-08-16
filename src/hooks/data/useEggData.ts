import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useOptimizedAppData } from '../../contexts/OptimizedDataProvider';
import { apiService } from '../../services/api';
import type { EggEntry } from '../../types';

export interface UseEggDataOptions {
  autoRefresh?: boolean;
  cacheTime?: number;
}

export interface UseEggDataReturn {
  entries: EggEntry[];
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
  addEntry: (entry: Omit<EggEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<EggEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  totalEggs: number;
  averageDaily: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
}

export const useEggData = (options: UseEggDataOptions = {}): UseEggDataReturn => {
  const {
    autoRefresh = true,
    cacheTime = 300000 // 5 minutes
  } = options;

  // Use OptimizedDataProvider for cached data
  const { data, isLoading: contextLoading, refreshData } = useOptimizedAppData();
  const contextEntries = data.eggEntries;

  // Memoize the fetcher function to prevent infinite loops
  const fetcher = useCallback(() => apiService.production.getEggEntries(), []);
  
  // Fallback data fetching hook (if DataContext fails)
  const {
    data: fetchedEntries,
    isLoading: fetchLoading,
    error: fetchError,
    refetch
  } = useDataFetch<EggEntry[]>({
    key: 'egg-entries',
    fetcher,
    cacheTime,
    enabled: autoRefresh && (!contextEntries || contextEntries.length === 0)
  });

  // Use context data preferentially, fallback to fetched data
  // Ensure entries is always an array
  const entries = Array.isArray(contextEntries) && contextEntries.length > 0 
    ? contextEntries 
    : (Array.isArray(fetchedEntries) ? fetchedEntries : []);
  const isLoading = contextLoading || fetchLoading;
  const error = fetchError;

  // Add new egg entry
  const addEntry = useCallback(async (entry: Omit<EggEntry, 'id'>) => {
    try {
      // Save to API without ID (let database generate UUID)
      await apiService.production.saveEggEntries([entry]);
      
      // After successful save, refresh data from server to get updated state
      await refreshData();
      
    } catch (err) {
      throw err;
    }
  }, [refreshData]);

  // Update existing egg entry
  const updateEntry = useCallback(async (id: string, updatedData: Partial<EggEntry>) => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    const entryToUpdate = { ...entries[entryIndex], ...updatedData };
    
    try {
      // Save to API
      await apiService.production.saveEggEntries([entryToUpdate]);
      
      // After successful save, refresh data from server to get updated state
      await refreshData();
    } catch (err) {
      throw err;
    }
  }, [entries, refreshData]);

  // Delete egg entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      // Delete the entry by filtering it out and saving the updated array
      const updatedEntries = entries.filter(entry => entry.id !== id);
      await apiService.production.saveEggEntries(updatedEntries);
      
      // After successful delete, refresh data from server to get updated state
      await refreshData();
    } catch (err) {
      throw err;
    }
  }, [entries, refreshData]);

  // Statistics calculations
  const statistics = useMemo(() => {
    // Ensure we're working with a valid array
    const validEntries = Array.isArray(entries) ? entries : [];
    
    const totalEggs = validEntries.reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate average daily production
    const uniqueDates = [...new Set(validEntries.map(entry => entry?.date).filter(Boolean))];
    const averageDaily = uniqueDates.length > 0 ? totalEggs / uniqueDates.length : 0;
    
    // Calculate this week's total
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekTotal = validEntries
      .filter(entry => entry?.date && new Date(entry.date) >= oneWeekAgo)
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate this month's total
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonthTotal = validEntries
      .filter(entry => entry?.date && new Date(entry.date) >= oneMonthAgo)
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    return {
      totalEggs,
      averageDaily: Math.round(averageDaily * 100) / 100,
      thisWeekTotal,
      thisMonthTotal
    };
  }, [entries]);

  return useMemo(() => ({
    entries,
    isLoading,
    error,
    refetch,
    addEntry,
    updateEntry,
    deleteEntry,
    ...statistics,
  }), [
    entries,
    isLoading,
    error,
    refetch,
    addEntry,
    updateEntry,
    deleteEntry,
    statistics,
  ]);
};