import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface SectionContainerProps extends BaseUIComponentProps {
  title?: string;
  description?: string;
  spacing?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'glass';
  animated?: boolean;
}

const spacingClasses = {
  sm: 'space-y-4',
  md: 'space-y-6', 
  lg: 'space-y-8',
};

const variantClasses = {
  default: '',
  card: 'bg-white rounded-lg p-6 border border-gray-200 shadow-sm',
  glass: 'glass-card',
};

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  description,
  spacing = 'md',
  variant = 'default',
  animated = true,
  children,
  className = '',
  testId,
}) => {
  const baseClasses = spacingClasses[spacing];
  const variantClass = variantClasses[variant];
  const combinedClassName = `${baseClasses} ${variantClass} ${className}`;

  const content = (
    <>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={combinedClassName}
        data-testid={testId}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div 
      className={combinedClassName}
      data-testid={testId}
    >
      {content}
    </div>
  );
};