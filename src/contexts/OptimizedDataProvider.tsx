import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/api';
import { browserCache, CACHE_KEYS } from '../utils/browserCache';
import { useAuth } from './AuthContext';
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
  isSubscriptionLoading: boolean;
}

const OptimizedDataContext = createContext<OptimizedDataContextType | undefined>(undefined);

interface OptimizedDataProviderProps {
  children: ReactNode;
}

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

export const OptimizedDataProvider: React.FC<OptimizedDataProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Initialize with empty data - we'll load cached data after auth is confirmed
  const [data, setData] = useState<AppData>({
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
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

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
      
      // Cache the data in browser storage with user-specific key
      browserCache.set(CACHE_KEYS.APP_DATA, newData, 10, user.id);
      
      // Cache subscription status separately for faster tier detection
      if (newData.userProfile?.subscription_status) {
        browserCache.set(CACHE_KEYS.SUBSCRIPTION_STATUS, newData.userProfile.subscription_status, 60, user.id);
      }
      
      setLastFetched(new Date());
      setIsSubscriptionLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Silent refresh that doesn't show loading state - for after mutations
  const silentRefresh = useCallback(async () => {
    if (!user?.id) return;

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
      browserCache.set(CACHE_KEYS.APP_DATA, newData, 10, user.id);
      
      // Cache subscription status separately for faster tier detection
      if (newData.userProfile?.subscription_status) {
        browserCache.set(CACHE_KEYS.SUBSCRIPTION_STATUS, newData.userProfile.subscription_status, 60, user.id);
      }
      
      setLastFetched(new Date());
      setIsSubscriptionLoading(false);
    } catch (err) {
      console.error('Silent refresh failed:', err);
      // Don't set error state for silent refresh failures
    }
  }, [user?.id]);

  // Check if cache is stale
  const isCacheStale = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched.getTime() > CACHE_DURATION;
  }, [lastFetched]);

  // Load cached data when user is authenticated, then refresh
  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete

    if (user?.id) {
      // Try to load cached subscription status first for instant tier detection
      const cachedSubscriptionStatus = browserCache.get<string>(CACHE_KEYS.SUBSCRIPTION_STATUS, user.id);
      if (cachedSubscriptionStatus) {
        setData(prevData => ({
          ...prevData,
          userProfile: prevData.userProfile ? {
            ...prevData.userProfile,
            subscription_status: cachedSubscriptionStatus as any
          } : null
        }));
        setIsSubscriptionLoading(false);
      }

      // Try to load cached data for faster initial render
      const cachedData = browserCache.get<AppData>(CACHE_KEYS.APP_DATA, user.id);
      if (cachedData) {
        if (import.meta.env.DEV) {
          console.log('Loading cached data for user:', user.id);
        }
        setData(cachedData);
        setLastFetched(new Date()); // Set a recent timestamp to avoid immediate refresh
        // If we have userProfile from cached data, subscription is no longer loading
        if (cachedData.userProfile) {
          setIsSubscriptionLoading(false);
        }
      }
      
      // Always refresh to get latest data
      refreshData();
    } else {
      // User not authenticated, clear data
      setData({
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
      });
      setIsLoading(false);
      setIsSubscriptionLoading(false);
    }
  }, [user?.id, authLoading]); // Removed refreshData from dependencies to prevent double execution
  // eslint-disable-next-line react-hooks/exhaustive-deps

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
    userTier: (data.userProfile?.subscription_status === 'active') ? 'premium' : 'free',
    isSubscriptionLoading
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
  const { userTier, isSubscriptionLoading } = useOptimizedAppData();
  return { userTier, isSubscriptionLoading };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserProfile = () => {
  const { data } = useOptimizedAppData();
  return data.userProfile;
};