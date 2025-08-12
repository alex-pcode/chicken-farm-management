import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/api';
import type { EggEntry, Expense, FeedEntry, FlockProfile, FlockEvent } from '../types';

import type { Customer, SaleWithCustomer, SalesSummary } from '../types/crm';

interface AppData {
  eggEntries: EggEntry[];
  expenses: Expense[];
  feedInventory: FeedEntry[];
  flockProfile: FlockProfile | null;
  flockEvents: FlockEvent[];
  customers?: Customer[];
  sales?: SaleWithCustomer[];
  summary?: SalesSummary;
}

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateEggEntries: (entries: EggEntry[]) => void;
  updateExpenses: (expenses: Expense[]) => void;
  updateFeedInventory: (inventory: FeedEntry[]) => void;
  updateFlockProfile: (profile: FlockProfile) => void;
  lastFetched: Date | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    eggEntries: [],
    expenses: [],
    feedInventory: [],
    flockProfile: null,
    flockEvents: [],
    customers: [],
    sales: [],
    summary: undefined
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.data.fetchAllData();
      const dbData = response.data;
      
      setData({
        eggEntries: dbData?.eggEntries || [],
        expenses: dbData?.expenses || [],
        feedInventory: dbData?.feedInventory || [],
        flockProfile: dbData?.flockProfile || null,
        flockEvents: dbData?.flockEvents || [],
        customers: dbData?.customers || [],
        sales: dbData?.sales || [],
        summary: dbData?.summary || undefined
      });
      
      setLastFetched(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if cache is stale
  const isCacheStale = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched.getTime() > CACHE_DURATION;
  }, [lastFetched]);

  // Auto-refresh data on mount and when cache becomes stale
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic cache validation (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCacheStale() && !isLoading) {
        console.log('Cache is stale, refreshing data...');
        refreshData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isCacheStale, isLoading, refreshData]);

  // Update functions for optimistic updates
  const updateEggEntries = useCallback((entries: EggEntry[]) => {
    setData(prev => ({ ...prev, eggEntries: entries }));
  }, []);

  const updateExpenses = useCallback((expenses: Expense[]) => {
    setData(prev => ({ ...prev, expenses }));
  }, []);

  const updateFeedInventory = useCallback((inventory: FeedEntry[]) => {
    setData(prev => ({ ...prev, feedInventory: inventory }));
  }, []);

  const updateFlockProfile = useCallback((profile: FlockProfile) => {
    setData(prev => ({ ...prev, flockProfile: profile }));
  }, []);

  const contextValue: DataContextType = {
    data,
    isLoading,
    error,
    refreshData,
    updateEggEntries,
    updateExpenses,
    updateFeedInventory,
    updateFlockProfile,
    lastFetched
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
};

// Hook for components that only need specific data types
export const useEggEntries = () => {
  const { data, isLoading, updateEggEntries } = useAppData();
  return { eggEntries: data.eggEntries, isLoading, updateEggEntries };
};

export const useExpenses = () => {
  const { data, isLoading, updateExpenses } = useAppData();
  return { expenses: data.expenses, isLoading, updateExpenses };
};

export const useFeedInventory = () => {
  const { data, isLoading, updateFeedInventory } = useAppData();
  return { feedInventory: data.feedInventory, isLoading, updateFeedInventory };
};

export const useFlockProfile = () => {
  const { data, isLoading, updateFlockProfile } = useAppData();
  return { flockProfile: data.flockProfile, isLoading, updateFlockProfile };
};
