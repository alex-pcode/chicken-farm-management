import React from 'react';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface PageSizeSelectorProps extends BaseUIComponentProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  label?: string;
  variant?: 'default' | 'compact';
}

const defaultOptions = [10, 25, 50, 100];

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = defaultOptions,
  label = 'Show',
  variant = 'default',
  className = '',
  testId,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  const baseClasses = 'flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300';
  const combinedClassName = `${baseClasses} ${className}`;

  const selectClasses = variant === 'compact' 
    ? 'border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
    : 'border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200';

  if (variant === 'compact') {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <select 
          value={pageSize} 
          onChange={handleChange}
          className={selectClasses}
          aria-label="Items per page"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={combinedClassName} data-testid={testId}>
      <label htmlFor="page-size-selector" className="whitespace-nowrap">
        {label}
      </label>
      <select 
        id="page-size-selector"
        value={pageSize} 
        onChange={handleChange}
        className={selectClasses}
        aria-label="Items per page"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="whitespace-nowrap">per page</span>
    </div>
  );
};