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
  customers: Customer[];
  sales: SaleWithCustomer[];
  summary: SalesSummary | undefined;
}

interface OptimizedDataContextType {
  data: AppData;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastFetched: Date | null;
}

const OptimizedDataContext = createContext<OptimizedDataContextType | undefined>(undefined);

interface OptimizedDataProviderProps {
  children: ReactNode;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const OptimizedDataProvider: React.FC<OptimizedDataProviderProps> = ({ children }) => {
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
      
      const newData = {
        eggEntries: dbData?.eggEntries || [],
        expenses: dbData?.expenses || [],
        feedInventory: dbData?.feedInventory || [],
        flockProfile: dbData?.flockProfile || null,
        flockEvents: dbData?.flockEvents || [],
        customers: dbData?.customers || [],
        sales: dbData?.sales || [],
        summary: dbData?.summary || undefined
      };
      
      setData(newData);
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

  // Auto-refresh data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic cache validation (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCacheStale() && !isLoading) {
        console.log('Optimized cache is stale, refreshing data...');
        refreshData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isCacheStale, isLoading, refreshData]);


  const contextValue: OptimizedDataContextType = {
    data,
    isLoading,
    error,
    refreshData,
    lastFetched
  };

  return (
    <OptimizedDataContext.Provider value={contextValue}>
      {children}
    </OptimizedDataContext.Provider>
  );
};

// Legacy compatibility hook - provides same interface as useAppData but with optimized performance
export const useOptimizedAppData = (): OptimizedDataContextType => {
  const context = useContext(OptimizedDataContext);
  if (context === undefined) {
    throw new Error('useOptimizedAppData must be used within an OptimizedDataProvider');
  }
  return context;
};

// Simplified hooks that use the optimized data context
export const useEggEntries = () => {
  const { data } = useOptimizedAppData();
  return data.eggEntries;
};

export const useFeedInventory = () => {
  const { data } = useOptimizedAppData();
  return data.feedInventory;
};

export const useExpenses = () => {
  const { data } = useOptimizedAppData();
  return data.expenses;
};

export const useSales = () => {
  const { data } = useOptimizedAppData();
  return data.sales;
};

export const useSalesSummary = () => {
  const { data } = useOptimizedAppData();
  return data.summary;
};

export const useFlockProfile = () => {
  const { data } = useOptimizedAppData();
  return data.flockProfile;
};

export const useFlockEvents = () => {
  const { data } = useOptimizedAppData();
  return data.flockEvents;
};

export const useCustomers = () => {
  const { data } = useOptimizedAppData();
  return data.customers;
};

export const useCRMSales = () => {
  const { data } = useOptimizedAppData();
  return data.sales;
};

export const useCRMSummary = () => {
  const { data } = useOptimizedAppData();
  return data.summary;
};

// Specialized data hooks for backward compatibility
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
    refreshData: context.refreshData
  };
};