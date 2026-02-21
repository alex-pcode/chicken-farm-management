import React from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface DataTableProps<T> extends BaseUIComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  sortable?: boolean;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  sortColumn?: keyof T;
  sortDirection?: 'asc' | 'desc';
  responsive?: boolean;
}

export const DataTable = <T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  sortable = false,
  onSort,
  sortColumn,
  sortDirection,
  responsive: _responsive = true,
  className = '',
  testId,
}: DataTableProps<T>) => {
  const handleSort = (column: keyof T) => {
    if (!sortable || !onSort) return;
    
    const newDirection = 
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const getSortIcon = (column: keyof T) => {
    if (!sortable || sortColumn !== column) {
      return null;
    }
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const baseClasses = 'min-w-full';
  const combinedClassName = `${baseClasses} ${className}`;
  
  const containerClasses = 'bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative';

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="absolute pointer-events-none transition-opacity duration-300" style={{
          top: '-25%',
          right: '-15%',
          width: '35%',
          height: '30%',
          borderRadius: '70%',
          background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
          filter: 'blur(60px)',
          opacity: 0.6
        }}></div>
        <div className="relative">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={containerClasses}>
        <div className="absolute pointer-events-none transition-opacity duration-300" style={{
          top: '-25%',
          right: '-15%',
          width: '35%',
          height: '30%',
          borderRadius: '70%',
          background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
          filter: 'blur(60px)',
          opacity: 0.6
        }}></div>
        <div className="relative">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="absolute pointer-events-none transition-opacity duration-300" style={{
        top: '-25%',
        right: '-15%',
        width: '35%',
        height: '30%',
        borderRadius: '70%',
        background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
        filter: 'blur(60px)',
        opacity: 0.6
      }}></div>
      <div className="relative">
        <table className={combinedClassName} data-testid={testId}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => column.sortable && handleSort(column.key as keyof T)}
                  className={`px-4 py-2 text-left text-gray-600 dark:text-gray-300 ${column.className || ''}`}
                >
                  {column.label} {column.sortable && getSortIcon(column.key as keyof T)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-4 py-2 text-gray-900 dark:text-gray-200 ${column.className || ''}`}>
                    {column.render ? column.render(row[column.key as keyof T], row) : row[column.key as keyof T] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};