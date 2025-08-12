import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface MetricDisplayProps extends BaseUIComponentProps {
  value: string | number;
  label: string;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  precision?: number;
  loading?: boolean;
  variant?: 'default' | 'large' | 'compact';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const formatValue = (
  value: string | number, 
  format: string, 
  precision: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(numValue);
    
    case 'percentage':
      return `${numValue.toFixed(precision)}%`;
    
    case 'decimal':
      return numValue.toFixed(precision);
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(numValue);
  }
};

const variantClasses = {
  default: 'text-4xl',
  large: 'text-6xl',
  compact: 'text-2xl',
};

const colorClasses = {
  default: 'text-gray-900',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
};

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  label,
  unit,
  format = 'number',
  precision = 2,
  loading = false,
  variant = 'default',
  color = 'default',
  className = '',
  testId,
}) => {
  const baseClasses = 'text-center space-y-2';
  const valueClasses = `${variantClasses[variant]} font-bold ${colorClasses[color]}`;
  const combinedClassName = `${baseClasses} ${className}`;

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className={`bg-gray-200 rounded mb-2 ${variant === 'large' ? 'h-16' : variant === 'compact' ? 'h-6' : 'h-10'}`}></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  const formattedValue = formatValue(value, format, precision);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={combinedClassName}
      data-testid={testId}
    >
      <div className={valueClasses}>
        {formattedValue}
        {unit && (
          <span className="text-sm text-gray-500 ml-1 font-normal">
            {unit}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {label}
      </div>
    </motion.div>
  );
};