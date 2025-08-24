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
  error: unknown;
  refetch: () => Promise<void>;
  addEntry: (entry: Omit<EggEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<EggEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  totalEggs: number;
  averageDaily: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
  previousWeekTotal: number;
  previousMonthTotal: number;
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
  const fetcher = useCallback(async (): Promise<EggEntry[]> => {
    const response = await apiService.production.getEggEntries();
    return response.data as EggEntry[];
  }, []);
  
  // Fallback data fetching hook (only when context truly unavailable)
  const {
    data: fetchedEntries,
    isLoading: fetchLoading,
    error: fetchError,
    refetch
  } = useDataFetch<EggEntry[]>({
    key: 'egg-entries',
    fetcher,
    cacheTime,
    enabled: autoRefresh && !contextEntries  // Only trigger if contextEntries is null/undefined, not empty array
  });

  // Fixed data precedence: use context if it exists (even if empty array), only fallback if context is null/undefined
  const entries = useMemo(() => {
    return Array.isArray(contextEntries) 
      ? contextEntries  // ✅ Primary: use context data (complete 8 fields)
      : (Array.isArray(fetchedEntries) ? fetchedEntries : []);  // ⚠️ Fallback: minimal 3 fields
  }, [contextEntries, fetchedEntries]);
  const isLoading = contextLoading || fetchLoading;
  const error = fetchError;

  // Add new egg entry
  const addEntry = useCallback(async (entry: Omit<EggEntry, 'id'>) => {
    // Add temporary ID for API compatibility (database will generate final UUID)
    const entryWithId: EggEntry = { ...entry, id: `temp-${Date.now()}` };
    await apiService.production.saveEggEntries([entryWithId]);
    
    // After successful save, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

  // Update existing egg entry
  const updateEntry = useCallback(async (id: string, updatedData: Partial<EggEntry>) => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    const entryToUpdate = { ...entries[entryIndex], ...updatedData };
    
    // Save to API
    await apiService.production.saveEggEntries([entryToUpdate]);
    
    // After successful save, refresh data from server to get updated state
    await refreshData();
  }, [entries, refreshData]);

  // Delete egg entry
  const deleteEntry = useCallback(async (id: string) => {
    // Use the proper delete API endpoint
    await apiService.production.deleteEggEntry(id);
    
    // After successful delete, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

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
    
    // Calculate previous week's total
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const previousWeekTotal = validEntries
      .filter(entry => entry?.date && new Date(entry.date) >= twoWeeksAgo && new Date(entry.date) < oneWeekAgo)
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate this month's total
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonthTotal = validEntries
      .filter(entry => entry?.date && new Date(entry.date) >= oneMonthAgo)
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate previous month's total
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const previousMonthTotal = validEntries
      .filter(entry => entry?.date && new Date(entry.date) >= twoMonthsAgo && new Date(entry.date) < oneMonthAgo)
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    return {
      totalEggs,
      averageDaily: Math.round(averageDaily * 100) / 100,
      thisWeekTotal,
      thisMonthTotal,
      previousWeekTotal,
      previousMonthTotal
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