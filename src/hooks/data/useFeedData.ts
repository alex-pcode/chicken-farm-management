import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useOptimizedAppData } from '../../contexts/OptimizedDataProvider';
import { apiService } from '../../services/api';
import type { FeedEntry } from '../../types';

export interface UseFeedDataOptions {
  autoRefresh?: boolean;
  cacheTime?: number;
  feedType?: string;
}

export interface UseFeedDataReturn {
  feedEntries: FeedEntry[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
  addFeedEntry: (entry: Omit<FeedEntry, 'id'>) => Promise<void>;
  updateFeedEntry: (id: string, entry: Partial<FeedEntry>) => Promise<void>;
  deleteFeedEntry: (id: string) => Promise<void>;
  totalQuantity: number;
  totalValue: number;
  averagePrice: number;
  lowStockItems: FeedEntry[];
  feedByType: Record<string, { quantity: number; value: number; count: number }>;
}

export const useFeedData = (options: UseFeedDataOptions = {}): UseFeedDataReturn => {
  const {
    autoRefresh = true,
    cacheTime = 300000, // 5 minutes
    feedType
  } = options;

  // Use OptimizedDataProvider for cached data
  const { data, isLoading: contextLoading, refreshData } = useOptimizedAppData();
  const contextFeedInventory = data.feedInventory;

  // Memoize the fetcher function to prevent infinite loops
  const fetcher = useCallback(async (): Promise<FeedEntry[]> => {
    const response = await apiService.production.getFeedInventory();
    return response.data as FeedEntry[];
  }, []);
  
  // Fallback data fetching hook (if DataContext fails)
  const {
    data: fetchedFeedEntries,
    isLoading: fetchLoading,
    error: fetchError,
    refetch
  } = useDataFetch<FeedEntry[]>({
    key: 'feed-inventory',
    fetcher,
    cacheTime,
    enabled: autoRefresh && (!contextFeedInventory || contextFeedInventory.length === 0)
  });

  // Use context data preferentially, fallback to fetched data
  const allFeedEntries = useMemo(() => {
    const result = (contextFeedInventory && contextFeedInventory.length > 0) ? contextFeedInventory : (fetchedFeedEntries || []);
    return result;
  }, [contextFeedInventory, fetchedFeedEntries]);
  
  // Filter by feed type if specified
  const feedEntries = useMemo(() => {
    if (!feedType || feedType === 'All') {
      return allFeedEntries;
    }
    return allFeedEntries.filter(feed => feed.type === feedType);
  }, [allFeedEntries, feedType]);

  const isLoading = contextLoading || fetchLoading;
  const error = fetchError;

  // Add new feed entry
  const addFeedEntry = useCallback(async (entry: Omit<FeedEntry, 'id'>) => {
    // Add temporary ID for API compatibility (database will generate final UUID)
    const entryWithId: FeedEntry = { ...entry, id: `temp-${Date.now()}` };
    await apiService.production.saveFeedInventory([entryWithId]);
    
    // After successful save, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

  // Update existing feed entry  
  const updateFeedEntry = useCallback(async (id: string, updatedData: Partial<FeedEntry>) => {
    // Use the most current data available
    const currentEntries = contextFeedInventory && contextFeedInventory.length > 0 ? contextFeedInventory : allFeedEntries;
    
    const entryIndex = currentEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
      return;
    }

    const entryToUpdate = { ...currentEntries[entryIndex], ...updatedData };
    
    // Save only the updated entry to API (UPSERT will handle it properly)
    await apiService.production.saveFeedInventory([entryToUpdate]);
    
    // After successful API call, refresh data from server to get updated state
    await refreshData();
  }, [allFeedEntries, contextFeedInventory, refreshData]);

  // Delete feed entry
  const deleteFeedEntry = useCallback(async (id: string) => {
    // Use proper delete API instead of saving filtered array
    await apiService.production.deleteFeedInventory(id);
    
    // After successful delete, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

  // Statistics and analysis
  const statistics = useMemo(() => {
    const totalQuantity = feedEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalValue = feedEntries.reduce((sum, entry) => sum + (entry.quantity * (entry.pricePerUnit || 0)), 0);
    const averagePrice = feedEntries.length > 0 ? totalValue / totalQuantity : 0;
    
    // Define low stock threshold (could be configurable)
    const LOW_STOCK_THRESHOLD = 5;
    const lowStockItems = feedEntries.filter(entry => entry.quantity <= LOW_STOCK_THRESHOLD);
    
    // Calculate feed statistics by type
    const feedByType = feedEntries.reduce((acc, entry) => {
      const type = entry.type;
      if (!acc[type]) {
        acc[type] = { quantity: 0, value: 0, count: 0 };
      }
      acc[type].quantity += entry.quantity;
      acc[type].value += entry.quantity * (entry.pricePerUnit || 0);
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { quantity: number; value: number; count: number }>);
    
    return {
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      lowStockItems,
      feedByType
    };
  }, [feedEntries]);

  return useMemo(() => ({
    feedEntries,
    isLoading,
    error,
    refetch,
    addFeedEntry,
    updateFeedEntry,
    deleteFeedEntry,
    ...statistics,
  }), [
    feedEntries,
    isLoading,
    error,
    refetch,
    addFeedEntry,
    updateFeedEntry,
    deleteFeedEntry,
    statistics,
  ]);
};