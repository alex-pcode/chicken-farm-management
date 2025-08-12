import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useExpenses } from '../../contexts/DataContext';
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
  error: any;
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

  // Use DataContext for cached data
  const { 
    expenses: contextExpenses, 
    isLoading: contextLoading, 
    updateExpenses 
  } = useExpenses();

  // Memoize the fetcher function to prevent infinite loops
  const fetcher = useCallback(() => apiService.production.getExpenses(), []);
  
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
    enabled: autoRefresh && !contextExpenses.length
  });

  // Use context data preferentially, fallback to fetched data
  const allExpenses = contextExpenses.length > 0 ? contextExpenses : (fetchedExpenses || []);
  
  // Ensure allExpenses is always an array
  const safeAllExpenses = Array.isArray(allExpenses) ? allExpenses : [];
  
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
    try {
      // Save to API without ID (let database generate UUID)
      await apiService.production.saveExpenses([expense]);
      
      // After successful save, add to local state with temporary ID for UI
      const newExpense: Expense = {
        ...expense,
        id: `temp-${Date.now()}` // Temporary ID for local state only
      };
      
      const updatedExpenses = [...safeAllExpenses, newExpense];
      updateExpenses(updatedExpenses);
      
    } catch (err) {
      // No optimistic update, so no need to revert
      throw err;
    }
  }, [safeAllExpenses, updateExpenses]);

  // Update existing expense
  const updateExpense = useCallback(async (id: string, updatedData: Partial<Expense>) => {
    const expenseIndex = safeAllExpenses.findIndex(expense => expense.id === id);
    if (expenseIndex === -1) return;

    const updatedExpenses = [...safeAllExpenses];
    updatedExpenses[expenseIndex] = { ...updatedExpenses[expenseIndex], ...updatedData };
    
    // Optimistic update
    updateExpenses(updatedExpenses);
    
    try {
      // Save to API
      await apiService.production.saveExpenses([updatedExpenses[expenseIndex]]);
    } catch (err) {
      // Revert on error
      updateExpenses(safeAllExpenses);
      throw err;
    }
  }, [safeAllExpenses, updateExpenses]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    const updatedExpenses = safeAllExpenses.filter(expense => expense.id !== id);
    
    // Optimistic update
    updateExpenses(updatedExpenses);
    
    try {
      // Delete from API (assuming API has delete endpoint)
      await apiService.production.deleteExpense?.(id);
    } catch (err) {
      // Revert on error
      updateExpenses(safeAllExpenses);
      throw err;
    }
  }, [safeAllExpenses, updateExpenses]);

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