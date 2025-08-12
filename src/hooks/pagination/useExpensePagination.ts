import { useMemo } from 'react';
import { usePagination, type UsePaginationOptions } from './usePagination';
import type { Expense } from '../../types';

export interface UseExpensePaginationOptions extends UsePaginationOptions {
  expenses: Expense[];
  sortDirection?: 'asc' | 'desc';
  filterCategory?: string;
}

export interface UseExpensePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  paginatedExpenses: Expense[];
  totalExpenses: number;
  filteredExpenses: Expense[];
}

export const useExpensePagination = (options: UseExpensePaginationOptions): UseExpensePaginationReturn => {
  const {
    expenses,
    sortDirection = 'desc',
    filterCategory,
    pageSize = 10,
    initialPage = 1
  } = options;

  // Filter expenses by category if specified
  const filteredExpenses = useMemo(() => {
    if (!filterCategory || filterCategory === 'All') {
      return expenses;
    }
    return expenses.filter(expense => expense.category === filterCategory);
  }, [expenses, filterCategory]);

  // Sort filtered expenses by date (most recent first by default)
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredExpenses, sortDirection]);

  // Use base pagination hook
  const pagination = usePagination({
    pageSize,
    initialPage,
    totalItems: sortedExpenses.length
  });

  // Get paginated expenses
  const paginatedExpenses = pagination.paginatedItems(sortedExpenses);

  return useMemo(() => ({
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
    isFirstPage: pagination.isFirstPage,
    isLastPage: pagination.isLastPage,
    paginatedExpenses,
    totalExpenses: sortedExpenses.length,
    filteredExpenses,
  }), [pagination, paginatedExpenses, sortedExpenses.length, filteredExpenses]);
};