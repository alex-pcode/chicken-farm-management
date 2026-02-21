import React from 'react';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface SimplePaginationProps extends BaseUIComponentProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  nextText?: string;
  previousText?: string;
  showPageInfo?: boolean;
  variant?: 'default' | 'compact';
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  nextText = 'Next',
  previousText = 'Previous',
  showPageInfo = true,
  variant = 'default',
  className = '',
  testId,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const baseClasses = 'flex items-center justify-between';
  const combinedClassName = `${baseClasses} ${className}`;

  const buttonClasses = variant === 'compact'
    ? 'relative inline-flex items-center px-3 py-1 text-sm font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
    : 'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`} data-testid={testId}>
        <button
          onClick={onPreviousPage}
          disabled={isFirstPage}
          className={buttonClasses}
        >
          ← {previousText}
        </button>
        {showPageInfo && (
          <span className="flex items-center px-2 text-sm text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
        )}
        <button
          onClick={onNextPage}
          disabled={isLastPage}
          className={buttonClasses}
        >
          {nextText} →
        </button>
      </div>
    );
  }

  return (
    <div className={combinedClassName} data-testid={testId}>
      <button
        onClick={onPreviousPage}
        disabled={isFirstPage}
        className={buttonClasses}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
        {previousText}
      </button>
      
      {showPageInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      )}
      
      <button
        onClick={onNextPage}
        disabled={isLastPage}
        className={buttonClasses}
      >
        {nextText}
        <svg className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};