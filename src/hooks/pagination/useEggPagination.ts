import { useMemo } from 'react';
import { usePagination, type UsePaginationOptions } from './usePagination';
import type { EggEntry } from '../../types';

export interface UseEggPaginationOptions extends UsePaginationOptions {
  entries: EggEntry[];
  sortDirection?: 'asc' | 'desc';
}

export interface UseEggPaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  paginatedEntries: EggEntry[];
  totalEntries: number;
}

export const useEggPagination = (options: UseEggPaginationOptions): UseEggPaginationReturn => {
  const {
    entries,
    sortDirection = 'desc',
    pageSize = 10,
    initialPage = 1
  } = options;

  // Sort entries by date (most recent first by default)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [entries, sortDirection]);

  // Use base pagination hook
  const pagination = usePagination({
    pageSize,
    initialPage,
    totalItems: sortedEntries.length
  });

  // Get paginated entries - memoize to prevent recalculation
  const paginatedEntries = useMemo(() => {
    return pagination.paginatedItems(sortedEntries);
  }, [pagination.currentPage, pagination.pageSize, sortedEntries]);

  return useMemo(() => ({
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
    isFirstPage: pagination.isFirstPage,
    isLastPage: pagination.isLastPage,
    paginatedEntries,
    totalEntries: sortedEntries.length,
  }), [
    pagination.currentPage,
    pagination.totalPages,
    pagination.pageSize,
    pagination.goToPage,
    pagination.nextPage,
    pagination.previousPage,
    pagination.isFirstPage,
    pagination.isLastPage,
    paginatedEntries,
    sortedEntries.length
  ]);
};