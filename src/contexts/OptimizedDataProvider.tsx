import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/api';
import { browserCache, CACHE_KEYS } from '../utils/browserCache';
import type { EggEntry, Expense, FeedEntry, FlockProfile, FlockEvent, FlockBatch, DeathRecord, UserProfile } from '../types';
import type { Customer, SaleWithCustomer, SalesSummary } from '../types/crm';

interface AppData {
  eggEntries: EggEntry[];
  expenses: Expense[];
  feedInventory: FeedEntry[];
  flockProfile: FlockProfile | null;
  flockEvents: FlockEvent[];
  customers: Customer[];
  sales: SaleWithCustomer[];
  summary: SalesSummary | undefined;
  flockBatches: FlockBatch[];
  deathRecords: DeathRecord[];
  userProfile: UserProfile | null;
}

interface OptimizedDataContextType {
  data: AppData;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  silentRefresh: () => Promise<void>;
  lastFetched: Date | null;
  userTier: 'free' | 'premium';
}

const OptimizedDataContext = createContext<OptimizedDataContextType | undefined>(undefined);

interface OptimizedDataProviderProps {
  children: ReactNode;
}

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

export const OptimizedDataProvider: React.FC<OptimizedDataProviderProps> = ({ children }) => {
  // Initialize with cached data if available
  const [data, setData] = useState<AppData>(() => {
    const cachedData = browserCache.get<AppData>(CACHE_KEYS.APP_DATA);
    return cachedData || {
      eggEntries: [],
      expenses: [],
      feedInventory: [],
      flockProfile: null,
      flockEvents: [],
      customers: [],
      sales: [],
      summary: undefined,
      flockBatches: [],
      deathRecords: [],
      userProfile: null
    };
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.data.fetchAllData();
      const dbData = response.data || {
        eggEntries: [],
        expenses: [],
        feedInventory: [],
        flockProfile: null,
        flockEvents: [],
        customers: [],
        sales: [],
        summary: undefined,
        userProfile: null
      };
      

      const newData = {
        eggEntries: dbData?.eggEntries || [],
        expenses: dbData?.expenses || [],
        feedInventory: dbData?.feedInventory || [],
        flockProfile: dbData?.flockProfile || null,
        flockEvents: dbData?.flockEvents || [],
        customers: dbData?.customers || [],
        sales: dbData?.sales || [],
        summary: dbData?.summary || undefined,
        flockBatches: dbData?.flockBatches || [],
        deathRecords: dbData?.deathRecords || [],
        userProfile: dbData?.userProfile || null
      };
      
      setData(newData);
      
      // Cache the data in browser storage for faster subsequent loads
      browserCache.set(CACHE_KEYS.APP_DATA, newData, 10); // 10 minutes cache
      
      setLastFetched(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Silent refresh that doesn't show loading state - for after mutations
  const silentRefresh = useCallback(async () => {
    try {
      const response = await apiService.data.fetchAllData();
      const dbData = response.data || {
        eggEntries: [],
        expenses: [],
        feedInventory: [],
        flockProfile: null,
        flockEvents: [],
        customers: [],
        sales: [],
        summary: undefined,
        userProfile: null
      };
      
      const newData = {
        eggEntries: dbData?.eggEntries || [],
        expenses: dbData?.expenses || [],
        feedInventory: dbData?.feedInventory || [],
        flockProfile: dbData?.flockProfile || null,
        flockEvents: dbData?.flockEvents || [],
        customers: dbData?.customers || [],
        sales: dbData?.sales || [],
        summary: dbData?.summary || undefined,
        flockBatches: dbData?.flockBatches || [],
        deathRecords: dbData?.deathRecords || [],
        userProfile: dbData?.userProfile || null
      };
      
      setData(newData);
      browserCache.set(CACHE_KEYS.APP_DATA, newData, 10);
      setLastFetched(new Date());
    } catch (err) {
      console.error('Silent refresh failed:', err);
      // Don't set error state for silent refresh failures
    }
  }, []);

  // Check if cache is stale
  const isCacheStale = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched.getTime() > CACHE_DURATION;
  }, [lastFetched]);

  // Auto-refresh data on mount - always fetch fresh data
  useEffect(() => {
    refreshData();
  }, [refreshData]); // Add refreshData to dependency array

  // Background refresh when cache becomes stale
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCacheStale() && !isLoading && document.hasFocus()) {
        console.log('Optimized cache is stale, refreshing data...');
        refreshData();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isCacheStale, isLoading, refreshData]);


  const contextValue: OptimizedDataContextType = {
    data,
    isLoading,
    error,
    refreshData,
    silentRefresh,
    lastFetched,
    userTier: (data.userProfile?.subscription_status === 'premium') ? 'premium' : 'free'
  };

  return (
    <OptimizedDataContext.Provider value={contextValue}>
      {children}
    </OptimizedDataContext.Provider>
  );
};

// Legacy compatibility hook - provides same interface as useAppData but with optimized performance
// eslint-disable-next-line react-refresh/only-export-components
export const useOptimizedAppData = (): OptimizedDataContextType => {
  const context = useContext(OptimizedDataContext);
  if (context === undefined) {
    throw new Error('useOptimizedAppData must be used within an OptimizedDataProvider');
  }
  return context;
};

// Simplified hooks that use the optimized data context
// eslint-disable-next-line react-refresh/only-export-components
export const useEggEntries = () => {
  const { data } = useOptimizedAppData();
  return data.eggEntries;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedInventory = () => {
  const { data } = useOptimizedAppData();
  return data.feedInventory;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExpenses = () => {
  const { data } = useOptimizedAppData();
  return data.expenses;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSales = () => {
  const { data } = useOptimizedAppData();
  return data.sales;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSalesSummary = () => {
  const { data } = useOptimizedAppData();
  return data.summary;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFlockProfile = () => {
  const { data } = useOptimizedAppData();
  return data.flockProfile;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFlockEvents = () => {
  const { data } = useOptimizedAppData();
  return data.flockEvents;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomers = () => {
  const { data } = useOptimizedAppData();
  return data.customers;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCRMSales = () => {
  const { data } = useOptimizedAppData();
  return data.sales;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCRMSummary = () => {
  const { data } = useOptimizedAppData();
  return data.summary;
};

// Specialized data hooks for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export const useProductionData = () => {
  const context = useOptimizedAppData();
  return {
    data: {
      eggEntries: context.data.eggEntries,
      feedInventory: context.data.feedInventory
    },
    isLoading: context.isLoading,
    error: context.error,
    refreshData: context.refreshData
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFinancialData = () => {
  const context = useOptimizedAppData();
  return {
    data: {
      expenses: context.data.expenses,
      sales: context.data.sales,
      summary: context.data.summary
    },
    isLoading: context.isLoading,
    error: context.error,
    refreshData: context.refreshData
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFlockData = () => {
  const context = useOptimizedAppData();
  return {
    data: {
      flockProfile: context.data.flockProfile,
      flockEvents: context.data.flockEvents
    },
    isLoading: context.isLoading,
    error: context.error,
    refreshData: context.refreshData
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCRMData = () => {
  const context = useOptimizedAppData();
  return {
    data: {
      customers: context.data.customers,
      sales: context.data.sales,
      summary: context.data.summary
    },
    isLoading: context.isLoading,
    error: context.error,
    refreshData: context.refreshData,
    silentRefresh: context.silentRefresh
  };
};

// New hooks for flock batch data
// eslint-disable-next-line react-refresh/only-export-components
export const useFlockBatches = () => {
  const { data } = useOptimizedAppData();
  return data.flockBatches;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDeathRecords = () => {
  const { data } = useOptimizedAppData();
  return data.deathRecords;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFlockBatchData = () => {
  const context = useOptimizedAppData();
  return {
    data: {
      flockBatches: context.data.flockBatches,
      deathRecords: context.data.deathRecords
    },
    isLoading: context.isLoading,
    error: context.error,
    refreshData: context.refreshData
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserTier = () => {
  const { userTier } = useOptimizedAppData();
  return userTier;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserProfile = () => {
  const { data } = useOptimizedAppData();
  return data.userProfile;
};