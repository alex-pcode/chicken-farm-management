import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface ComparisonData {
  value: string | number;
  label: string;
}

interface ComparisonCardProps extends BaseUIComponentProps {
  title: string;
  before: ComparisonData;
  after: ComparisonData;
  change?: number;
  changeType?: 'increase' | 'decrease';
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  variant?: 'default' | 'compact';
  loading?: boolean;
  showArrow?: boolean;
  icon?: string;
  onClick?: () => void;
}

const formatValue = (value: string | number, format: string): string => {
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
    
    case 'decimal':
      return numValue.toFixed(2);
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(numValue);
  }
};

const getChangeColor = (changeType?: string) => {
  switch (changeType) {
    case 'increase':
      return { color: 'oklch(0.44 0.11 162.79)' };
    case 'decrease':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  before,
  after,
  change,
  changeType,
  format = 'number',
  variant = 'default',
  loading = false,
  showArrow = true,
  icon,
  onClick,
  className = '',
  testId,
}) => {
  const baseClasses = 'glass-card p-6 space-y-4';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const combinedClassName = `${baseClasses} ${clickableClasses} ${className}`;

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="flex justify-center items-center">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
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
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className={`font-semibold text-gray-900 dark:text-white ${variant === 'compact' ? 'text-base' : 'text-lg'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {change !== undefined && (
            <div 
              className={`text-sm font-medium ${typeof getChangeColor(changeType) === 'string' ? getChangeColor(changeType) : ''}`}
              style={typeof getChangeColor(changeType) === 'object' ? getChangeColor(changeType) as React.CSSProperties : undefined}
            >
              {changeType === 'increase' ? '+' : ''}
              {change?.toFixed(1)}%
            </div>
          )}
          {icon && (
            <div className="max-[480px]:hidden size-8 shrink-0 rounded-full bg-indigo-600/25 border border-indigo-600/50 flex items-center justify-center text-indigo-500">
              <span className="text-lg">{icon}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Before Value */}
        <div className="text-center space-y-1">
          <div className={`font-bold text-gray-500 dark:text-gray-400 ${variant === 'compact' ? 'text-lg' : 'text-2xl'}`}>
            {formatValue(before.value, format)}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {before.label}
          </div>
        </div>

        {/* Arrow */}
        {showArrow && (
          <div className="flex justify-center">
            <div className="text-gray-400 dark:text-gray-500 text-2xl">
              →
            </div>
          </div>
        )}

        {/* After Value */}
        <div className="text-center space-y-1">
          <div className={`font-bold text-gray-900 dark:text-white ${variant === 'compact' ? 'text-lg' : 'text-2xl'}`}>
            {formatValue(after.value, format)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {after.label}
          </div>
        </div>
      </div>
    </motion.div>
  );
};