import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface StatCardProps extends BaseUIComponentProps {
  title: string;
  total: string | number;
  label?: string | React.ReactNode;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  variant?: 'default' | 'compact' | 'gradient';
  icon?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'glass-card p-6',
  compact: 'bg-white rounded-lg p-4 border border-gray-200',
  gradient: 'glass-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6',
};

const cardVariants = {
  hover: { 
    scale: 1.02,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  total,
  label,
  change,
  changeType,
  trend,
  loading = false,
  variant = 'default',
  icon,
  onClick,
  className = '',
  testId,
}) => {
  const baseClasses = variantClasses[variant];
  const combinedClassName = `${baseClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '';
  };

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      {icon && (
        <div className="text-2xl mb-2">{icon}</div>
      )}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-gray-900 ${variant === 'compact' ? 'text-sm' : 'text-lg'}`}>
          {title}
        </h3>
        {getTrendIcon() && (
          <span className="text-lg">{getTrendIcon()}</span>
        )}
      </div>
      
      <div className={`font-bold ${variant === 'compact' ? 'text-xl' : 'text-3xl'} mb-2 text-indigo-600`}>
        {total}
      </div>
      
      <div className="flex items-center justify-between">
        {label && (
          <div className={`text-gray-500 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
            {label}
          </div>
        )}
        
        {change !== undefined && (
          <div className={`text-sm ${getChangeColor()}`}>
            {changeType === 'increase' ? '+' : ''}
            {change}%
          </div>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <motion.div
        className={combinedClassName}
        onClick={onClick}
        whileHover={cardVariants.hover}
        data-testid={testId}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={combinedClassName}
      data-testid={testId}
    >
      {cardContent}
    </motion.div>
  );
};