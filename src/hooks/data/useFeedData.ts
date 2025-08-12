import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useFeedInventory } from '../../contexts/DataContext';
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
  error: any;
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

  // Use DataContext for cached data
  const { 
    feedInventory: contextFeedInventory, 
    isLoading: contextLoading, 
    updateFeedInventory 
  } = useFeedInventory();

  // Memoize the fetcher function to prevent infinite loops
  const fetcher = useCallback(() => apiService.production.getFeedInventory(), []);
  
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
    enabled: autoRefresh && !contextFeedInventory.length
  });

  // Use context data preferentially, fallback to fetched data
  const allFeedEntries = contextFeedInventory.length > 0 ? contextFeedInventory : (fetchedFeedEntries || []);
  
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
    try {
      // Save to API without ID (let database generate UUID)
      await apiService.production.saveFeedInventory([entry]);
      
      // After successful save, add to local state with temporary ID for UI
      const newEntry: FeedEntry = {
        ...entry,
        id: `temp-${Date.now()}` // Temporary ID for local state only
      };
      
      const updatedEntries = [...allFeedEntries, newEntry];
      updateFeedInventory(updatedEntries);
      
    } catch (err) {
      // No optimistic update, so no need to revert
      throw err;
    }
  }, [allFeedEntries, updateFeedInventory]);

  // Update existing feed entry
  const updateFeedEntry = useCallback(async (id: string, updatedData: Partial<FeedEntry>) => {
    const entryIndex = allFeedEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    const updatedEntries = [...allFeedEntries];
    updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], ...updatedData };
    
    // Optimistic update
    updateFeedInventory(updatedEntries);
    
    try {
      // Save to API
      await apiService.production.saveFeedInventory([updatedEntries[entryIndex]]);
    } catch (err) {
      // Revert on error
      updateFeedInventory(allFeedEntries);
      throw err;
    }
  }, [allFeedEntries, updateFeedInventory]);

  // Delete feed entry
  const deleteFeedEntry = useCallback(async (id: string) => {
    const updatedEntries = allFeedEntries.filter(entry => entry.id !== id);
    
    // Optimistic update
    updateFeedInventory(updatedEntries);
    
    try {
      // Delete from API (assuming API has delete endpoint)
      await apiService.production.deleteFeedEntry?.(id);
    } catch (err) {
      // Revert on error
      updateFeedInventory(allFeedEntries);
      throw err;
    }
  }, [allFeedEntries, updateFeedInventory]);

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