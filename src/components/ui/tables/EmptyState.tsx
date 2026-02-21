import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface EmptyStateProps extends BaseUIComponentProps {
  icon?: string;
  title?: string;
  message: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📊',
  title,
  message,
  action,
  variant = 'default',
  className = '',
  testId,
}) => {
  const isCompact = variant === 'compact';
  
  const baseClasses = 'text-center';
  const spacingClasses = isCompact ? 'py-6' : 'py-12';
  const combinedClassName = `${baseClasses} ${spacingClasses} ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={combinedClassName}
      data-testid={testId}
    >
      <div className={`${isCompact ? 'text-3xl mb-2' : 'text-6xl mb-4'}`}>
        {icon}
      </div>
      {title && (
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isCompact ? 'text-base mb-1' : 'text-lg mb-2'}`}>
          {title}
        </h3>
      )}
      <p className={`text-gray-500 dark:text-gray-400 ${isCompact ? 'text-sm' : ''} ${action ? 'mb-4' : ''}`}>
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="neu-button"
        >
          {action.text}
        </button>
      )}
    </motion.div>
  );
};