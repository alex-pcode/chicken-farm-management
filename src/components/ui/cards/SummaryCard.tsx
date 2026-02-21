import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface SummaryItem {
  label: string;
  value: string | number;
  format?: 'number' | 'currency' | 'percentage';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

interface SummaryCardProps extends BaseUIComponentProps {
  title: string;
  items: SummaryItem[];
  variant?: 'default' | 'compact' | 'detailed';
  loading?: boolean;
  showDividers?: boolean;
}

const formatValue = (value: string | number, format: string = 'number'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numValue);
    
    case 'percentage':
      return `${numValue}%`;
    
    case 'number':
    default:
      return numValue.toLocaleString();
  }
};

const getValueColorClass = (color: string = 'default') => {
  switch (color) {
    case 'success':
      return { color: 'oklch(0.44 0.11 162.79)' };
    case 'warning':
      return 'text-yellow-600';
    case 'danger':
      return 'text-red-600';
    default:
      return 'text-gray-900 dark:text-white';
  }
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  items,
  variant = 'default',
  loading = false,
  showDividers = true,
  className = '',
  testId,
}) => {
  const baseClasses = 'glass-card p-6 space-y-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200';
  const combinedClassName = `${baseClasses} ${className}`;

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={combinedClassName}
      data-testid={testId}
    >
      <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${variant === 'compact' ? 'text-base' : 'text-lg'}`}>
        {title}
      </h3>

      <div className={`space-y-${variant === 'compact' ? '2' : '3'}`}>
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <span className={`text-gray-600 dark:text-gray-400 ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {item.label}
              </span>
              <span 
                className={`font-semibold ${typeof getValueColorClass(item.color) === 'string' ? getValueColorClass(item.color) : ''} ${variant === 'compact' ? 'text-sm' : 'text-base'}`}
                style={typeof getValueColorClass(item.color) === 'object' ? getValueColorClass(item.color) as React.CSSProperties : undefined}
              >
                {formatValue(item.value, item.format)}
              </span>
            </div>
            {showDividers && index < items.length - 1 && (
              <hr className="border-gray-200 dark:border-gray-700 mt-2" />
            )}
          </div>
        ))}
      </div>

      {variant === 'detailed' && items.length > 0 && (
        <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="text-lg font-bold text-indigo-600">
              {formatValue(
                items.reduce((sum, item) => {
                  const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
                  return sum + (isNaN(value) ? 0 : value);
                }, 0),
                items[0]?.format || 'number'
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};