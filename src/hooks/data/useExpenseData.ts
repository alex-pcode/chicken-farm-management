import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useOptimizedAppData } from '../../contexts/OptimizedDataProvider';
import { apiService } from '../../services/api';
import type { Expense } from '../../types';

export interface UseExpenseDataOptions {
  autoRefresh?: boolean;
  cacheTime?: number;
  category?: string;
}

export interface UseExpenseDataReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalAmount: number;
  averageDaily: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
  expensesByCategory: Record<string, number>;
}

export const useExpenseData = (options: UseExpenseDataOptions = {}): UseExpenseDataReturn => {
  const {
    autoRefresh = true,
    cacheTime = 300000, // 5 minutes
    category
  } = options;

  // Use OptimizedDataProvider for cached data
  const { data, isLoading: contextLoading, refreshData } = useOptimizedAppData();
  const contextExpenses = data.expenses;

  // Memoize the fetcher function to prevent infinite loops
  const fetcher = useCallback(async (): Promise<Expense[]> => {
    const response = await apiService.production.getExpenses();
    return response.data as Expense[];
  }, []);
  
  // Fallback data fetching hook (if DataContext fails)
  const {
    data: fetchedExpenses,
    isLoading: fetchLoading,
    error: fetchError,
    refetch
  } = useDataFetch<Expense[]>({
    key: 'expenses',
    fetcher,
    cacheTime,
    enabled: autoRefresh && (!contextExpenses || contextExpenses.length === 0)
  });

  // Use context data preferentially, fallback to fetched data
  const allExpenses = useMemo(() => {
    return (contextExpenses && contextExpenses.length > 0) ? contextExpenses : (fetchedExpenses || []);
  }, [contextExpenses, fetchedExpenses]);
  
  // Ensure allExpenses is always an array - wrap in useMemo to prevent dependency changes
  const safeAllExpenses = useMemo(() => {
    return Array.isArray(allExpenses) ? allExpenses : [];
  }, [allExpenses]);
  
  // Filter by category if specified
  const expenses = useMemo(() => {
    if (!category || category === 'All') {
      return safeAllExpenses;
    }
    return safeAllExpenses.filter(expense => expense.category === category);
  }, [safeAllExpenses, category]);

  const isLoading = contextLoading || fetchLoading;
  const error = fetchError;

  // Add new expense  
  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    // Save to API without ID (let database generate UUID)
    await apiService.production.saveExpenses([expense]);
    
    // After successful save, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

  // Update existing expense
  const updateExpense = useCallback(async (id: string, updatedData: Partial<Expense>) => {
    const expenseIndex = safeAllExpenses.findIndex(expense => expense.id === id);
    if (expenseIndex === -1) return;

    const expenseToUpdate = { ...safeAllExpenses[expenseIndex], ...updatedData };
    
    // Save to API
    await apiService.production.saveExpenses([expenseToUpdate]);
    
    // After successful save, refresh data from server to get updated state
    await refreshData();
  }, [safeAllExpenses, refreshData]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    // Use proper DELETE API endpoint
    await apiService.production.deleteExpense(id);
    
    // After successful delete, refresh data from server to get updated state
    await refreshData();
  }, [refreshData]);

  // Statistics calculations
  const statistics = useMemo(() => {
    // Ensure expenses is always an array for statistics
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const totalAmount = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average daily expenses
    const uniqueDates = [...new Set(safeExpenses.map(expense => expense.date))];
    const averageDaily = uniqueDates.length > 0 ? totalAmount / uniqueDates.length : 0;
    
    // Calculate this week's total
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekTotal = safeExpenses
      .filter(expense => new Date(expense.date) >= oneWeekAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate this month's total
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonthTotal = safeExpenses
      .filter(expense => new Date(expense.date) >= oneMonthAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate expenses by category
    const expensesByCategory = safeExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageDaily: Math.round(averageDaily * 100) / 100,
      thisWeekTotal: Math.round(thisWeekTotal * 100) / 100,
      thisMonthTotal: Math.round(thisMonthTotal * 100) / 100,
      expensesByCategory
    };
  }, [expenses]);

  return useMemo(() => ({
    expenses: Array.isArray(expenses) ? expenses : [],
    isLoading,
    error,
    refetch,
    addExpense,
    updateExpense,
    deleteExpense,
    ...statistics,
  }), [
    expenses,
    isLoading,
    error,
    refetch,
    addExpense,
    updateExpense,
    deleteExpense,
    statistics,
  ]);
};