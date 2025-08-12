import { useState, useCallback, useMemo } from 'react';

export interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
  totalItems?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  startIndex: number;
  endIndex: number;
  paginatedItems: <T>(items: T[]) => T[];
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    pageSize = 10,
    initialPage = 1,
    totalItems = 0
  } = options;

  // State declarations
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculated values
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // Memoized callbacks
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const paginatedItems = useCallback(<T>(items: T[]): T[] => {
    return items.slice(startIndex, startIndex + pageSize);
  }, [startIndex, pageSize]);

  // Computed properties
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Return stable object
  return useMemo(() => ({
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex,
    paginatedItems,
  }), [
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    previousPage,
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex,
    paginatedItems,
  ]);
};