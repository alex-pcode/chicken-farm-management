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
  const { data, isLoading: contextLoading, silentRefresh } = useOptimizedAppData();
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

  // Add new egg entry with true optimistic updates
  const addEntry = useCallback(async (entry: Omit<EggEntry, 'id'>) => {
    // Create optimistic entry with temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: EggEntry = { ...entry, id: tempId };

    try {
      // Save to API and immediately refresh to get real data
      const response = await apiService.production.saveEggEntries([optimisticEntry]);
      console.log('✅ Entry saved to API:', response);

      // Force immediate data refresh to update UI
      console.log('🔄 Triggering silent refresh...');
      await silentRefresh();
      console.log('✅ Silent refresh completed');
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      // If API call fails, refresh anyway to ensure consistency
      await silentRefresh();
      throw error;
    }
  }, [silentRefresh]);

  // Update existing egg entry with optimistic updates
  const updateEntry = useCallback(async (id: string, updatedData: Partial<EggEntry>) => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    const entryToUpdate = { ...entries[entryIndex], ...updatedData };

    // Save to API, then refresh data
    await apiService.production.saveEggEntries([entryToUpdate]);
    await silentRefresh();
  }, [entries, silentRefresh]);

  // Delete egg entry with optimistic updates
  const deleteEntry = useCallback(async (id: string) => {
    // Delete from API, then refresh data
    await apiService.production.deleteEggEntry(id);
    await silentRefresh();
  }, [silentRefresh]);

  // Statistics calculations
  const statistics = useMemo(() => {
    // Ensure we're working with a valid array
    const validEntries = Array.isArray(entries) ? entries : [];
    
    const totalEggs = validEntries.reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate monthly-based daily average: this month's total / highest date in this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthEntries = validEntries.filter(entry => {
      if (!entry?.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const thisMonthTotal = thisMonthEntries.reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Monthly-based daily average: thisMonth total / last entry date
    let averageDaily = 0;
    if (thisMonthEntries.length > 0) {
      const lastDateThisMonth = Math.max(...thisMonthEntries.map(entry => new Date(entry.date).getDate()));
      averageDaily = thisMonthTotal / lastDateThisMonth;
    }
    
    // Calculate this week's total (last 7 days inclusive - days 0 to 6 going back)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6); // 6 days back + today = 7 days
    sixDaysAgo.setHours(0, 0, 0, 0); // Start of day
    
    const thisWeekTotal = validEntries
      .filter(entry => {
        if (!entry?.date) return false;
        const entryDate = new Date(entry.date + 'T00:00:00');
        return entryDate >= sixDaysAgo && entryDate <= today;
      })
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate previous week's total (days 7 to 13 going back)
    const thirteenDaysAgo = new Date();
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13); // 13 days back
    thirteenDaysAgo.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // 7 days back
    sevenDaysAgo.setHours(23, 59, 59, 999); // End of 7th day back
    
    const previousWeekTotal = validEntries
      .filter(entry => {
        if (!entry?.date) return false;
        const entryDate = new Date(entry.date + 'T00:00:00');
        return entryDate >= thirteenDaysAgo && entryDate <= sevenDaysAgo;
      })
      .reduce((sum, entry) => sum + (entry?.count || 0), 0);
    
    // Calculate previous month's total for the same time period
    // Compare same number of days: if today is the 15th, compare first 15 days of each month
    const currentDayOfMonth = now.getDate();
    
    const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    const previousMonthTotal = validEntries
      .filter(entry => {
        if (!entry?.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === previousMonth && 
               entryDate.getFullYear() === previousYear &&
               entryDate.getDate() <= currentDayOfMonth;
      })
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