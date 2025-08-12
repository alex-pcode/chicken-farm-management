import React from 'react';
import { SimplePagination } from './SimplePagination';
import { PageSizeSelector } from './PageSizeSelector';
import { PaginationInfo } from './PaginationInfo';
import { usePagination, UsePaginationOptions } from '../../../hooks/pagination/usePagination';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface PaginationControlsProps extends BaseUIComponentProps {
  totalItems: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPaginationInfo?: boolean;
  variant?: 'default' | 'compact';
  paginationOptions?: UsePaginationOptions;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPaginationInfo = true,
  variant = 'default',
  paginationOptions,
  className = '',
  testId,
}) => {
  const pagination = usePagination({
    pageSize,
    totalItems,
    ...paginationOptions,
  });

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const containerClasses = variant === 'compact' 
    ? 'flex items-center justify-between gap-4'
    : 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4';
  
  const combinedClassName = `${containerClasses} ${className}`;

  return (
    <div className={combinedClassName} data-testid={testId}>
      {showPaginationInfo && (
        <PaginationInfo
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={totalItems}
          itemsPerPage={pagination.pageSize}
          variant={variant === 'compact' ? 'compact' : 'default'}
        />
      )}
      
      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <PageSizeSelector
            pageSize={pagination.pageSize}
            onPageSizeChange={handlePageSizeChange}
            options={pageSizeOptions}
            variant={variant}
          />
        )}
        
        <SimplePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onNextPage={pagination.nextPage}
          onPreviousPage={pagination.previousPage}
          variant={variant}
          showPageInfo={false} // Info is shown separately above
        />
      </div>
    </div>
  );
};