import React from 'react';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface PaginationProps extends BaseUIComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  showInfo?: boolean;
  variant?: 'default' | 'simple';
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  showInfo = true,
  variant = 'default',
  maxVisiblePages = 7,
  className = '',
  testId,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (variant === 'simple') {
    return (
      <div className={`flex flex-1 justify-between sm:hidden ${className}`} data-testid={testId}>
        <button
          onClick={onPreviousPage}
          disabled={isFirstPage}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
            ${isFirstPage
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={isLastPage}
          className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
            ${isLastPage
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 ${className}`}
      data-testid={testId}
    >
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={onPreviousPage}
          disabled={isFirstPage}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
            ${isFirstPage
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={isLastPage}
          className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
            ${isLastPage
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {showInfo && (
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
        )}
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={onPreviousPage}
              disabled={isFirstPage}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-sm ring-1 ring-inset ring-gray-300
                ${isFirstPage
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-50 bg-white'}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                  ${currentPage === page
                    ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 bg-white'}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={onNextPage}
              disabled={isLastPage}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-sm ring-1 ring-inset ring-gray-300
                ${isLastPage
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-50 bg-white'}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};