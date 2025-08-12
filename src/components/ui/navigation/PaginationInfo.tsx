import React from 'react';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface PaginationInfoProps extends BaseUIComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  variant?: 'default' | 'compact' | 'detailed';
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  variant = 'default',
  className = '',
  testId,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const baseClasses = 'text-sm text-gray-700';
  const combinedClassName = `${baseClasses} ${className}`;

  if (variant === 'compact') {
    return (
      <div className={combinedClassName} data-testid={testId}>
        {currentPage} of {totalPages}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`${combinedClassName} space-y-1`} data-testid={testId}>
        <div>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages} ({itemsPerPage} per page)
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={combinedClassName} data-testid={testId}>
      Showing <span className="font-medium">{startItem}</span> to{' '}
      <span className="font-medium">{endItem}</span> of{' '}
      <span className="font-medium">{totalItems}</span> results
    </div>
  );
};