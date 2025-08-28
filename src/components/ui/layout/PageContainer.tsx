import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface PageContainerProps extends BaseUIComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  style?: React.CSSProperties;
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-8xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  maxWidth = 'lg',
  padding = 'md',
  animated = true,
  children,
  className = '',
  testId,
  style,
}) => {
  const baseClasses = 'mx-auto px-4 sm:px-6 lg:px-8';
  const widthClass = maxWidthClasses[maxWidth];
  const paddingClass = paddingClasses[padding];
  const combinedClassName = `${baseClasses} ${widthClass} ${paddingClass} ${className}`;

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={combinedClassName}
        style={style}
        data-testid={testId}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      className={combinedClassName}
      style={style}
      data-testid={testId}
    >
      {children}
    </div>
  );
};