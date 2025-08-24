import React from 'react';
import { motion } from 'framer-motion';

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
  responsive = true,
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
  const responsiveClasses = responsive ? 'overflow-x-auto w-full' : '';
  const combinedClassName = `${baseClasses} ${className}`;
  
  const containerClasses = 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative';

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
            <p className="text-gray-500">{emptyMessage}</p>
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
        <div className={responsiveClasses}>
          <table className={combinedClassName} data-testid={testId}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 ${
                      sortable && column.sortable !== false
                        ? 'cursor-pointer hover:bg-gray-100/50 transition-colors'
                        : ''
                    } ${column.className || ''}`}
                    onClick={() => 
                      sortable && column.sortable !== false 
                        ? handleSort(column.key as keyof T) 
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <span className="text-gray-400 text-xs">
                          {getSortIcon(column.key as keyof T) || '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, index) => (
                <motion.tr
                  key={`row-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 text-sm text-gray-600"
                    >
                      {column.render 
                        ? column.render(row[column.key as keyof T] ?? row, row)
                        : String(row[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};