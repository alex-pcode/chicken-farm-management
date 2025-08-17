import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface ProgressCardProps extends BaseUIComponentProps {
  title: string;
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
  loading?: boolean;
}

const colorClasses = {
  default: {
    bg: '#4F39F6',
    bgLight: '#E8E5FF',
    text: 'text-blue-600',
  },
  success: {
    bg: '#4F39F6',
    bgLight: '#E8E5FF',
    text: { color: 'oklch(0.44 0.11 162.79)' },
  },
  warning: {
    bg: '#4F39F6',
    bgLight: '#E8E5FF',
    text: 'text-yellow-600',
  },
  danger: {
    bg: '#4F39F6',
    bgLight: '#E8E5FF',
    text: 'text-red-600',
  },
  info: {
    bg: '#4F39F6',
    bgLight: '#E8E5FF',
    text: 'text-cyan-600',
  },
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  max,
  label,
  showPercentage = true,
  showValues = true,
  variant = 'default',
  color = 'default',
  animated = true,
  loading = false,
  className = '',
  testId,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = colorClasses[color];
  
  const baseClasses = 'glass-card p-6 space-y-4';
  const combinedClassName = `${baseClasses} ${className}`;

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showPercentage && (
            <span 
              className={`text-sm font-medium ${typeof colors.text === 'string' ? colors.text : ''}`}
              style={typeof colors.text === 'object' ? colors.text : undefined}
            >
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
        
        {variant === 'detailed' && showValues && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>{value.toLocaleString()}</span>
            <span>{max.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="w-full rounded-full h-3" style={{ backgroundColor: colors.bgLight }}>
          <motion.div
            className="h-3 rounded-full"
            style={{ background: colors.bg }}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animated ? 1.5 : 0,
              ease: "easeOut",
              delay: 0.2,
            }}
          />
        </div>
        
        {variant !== 'compact' && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="text-sm text-gray-500">{label}</span>
            )}
            {showValues && variant !== 'detailed' && (
              <span className="text-sm text-gray-600">
                {value.toLocaleString()} / {max.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};