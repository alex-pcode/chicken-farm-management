import { useMemo } from 'react';
import { usePagination, type UsePaginationOptions } from './usePagination';
import type { FeedEntry } from '../../types';

export interface UseFeedPaginationOptions extends UsePaginationOptions {
  feedEntries: FeedEntry[];
  sortDirection?: 'asc' | 'desc';
  sortBy?: 'openedDate' | 'brand' | 'quantity';
  filterType?: string;
}

export interface UseFeedPaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  paginatedFeedEntries: FeedEntry[];
  totalFeedEntries: number;
  filteredFeedEntries: FeedEntry[];
}

export const useFeedPagination = (options: UseFeedPaginationOptions): UseFeedPaginationReturn => {
  const {
    feedEntries,
    sortDirection = 'desc',
    sortBy = 'openedDate',
    filterType,
    pageSize = 10,
    initialPage = 1
  } = options;

  // Filter feed entries by type if specified
  const filteredFeedEntries = useMemo(() => {
    if (!filterType || filterType === 'All') {
      return feedEntries;
    }
    return feedEntries.filter(feed => feed.type === filterType);
  }, [feedEntries, filterType]);

  // Sort filtered feed entries
  const sortedFeedEntries = useMemo(() => {
    return [...filteredFeedEntries].sort((a, b) => {
      let compareValue: number;
      
      switch (sortBy) {
        case 'openedDate':
          compareValue = new Date(a.openedDate).getTime() - new Date(b.openedDate).getTime();
          break;
        case 'brand':
          compareValue = a.brand.localeCompare(b.brand);
          break;
        case 'quantity':
          compareValue = a.quantity - b.quantity;
          break;
        default:
          compareValue = new Date(a.openedDate).getTime() - new Date(b.openedDate).getTime();
      }
      
      return sortDirection === 'desc' ? -compareValue : compareValue;
    });
  }, [filteredFeedEntries, sortBy, sortDirection]);

  // Use base pagination hook
  const pagination = usePagination({
    pageSize,
    initialPage,
    totalItems: sortedFeedEntries.length
  });

  // Get paginated feed entries
  const paginatedFeedEntries = pagination.paginatedItems(sortedFeedEntries);

  return useMemo(() => ({
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    pageSize: pagination.pageSize,
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
    isFirstPage: pagination.isFirstPage,
    isLastPage: pagination.isLastPage,
    paginatedFeedEntries,
    totalFeedEntries: sortedFeedEntries.length,
    filteredFeedEntries,
  }), [pagination, paginatedFeedEntries, sortedFeedEntries.length, filteredFeedEntries]);
};