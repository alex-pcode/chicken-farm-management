import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface CardContainerProps extends BaseUIComponentProps {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-white rounded-lg shadow-sm border border-gray-200',
  glass: 'glass-card',
  bordered: 'bg-white rounded-lg border-2 border-gray-300',
  elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const spacingClasses = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
};

const cardVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
  },
};

export const CardContainer: React.FC<CardContainerProps> = ({
  variant = 'default',
  padding = 'md',
  spacing = 'md',
  animated = true,
  hover = false,
  clickable = false,
  onClick,
  children,
  className = '',
  testId,
}) => {
  const baseClasses = variantClasses[variant];
  const paddingClass = paddingClasses[padding];
  const spacingClass = spacingClasses[spacing];
  
  const shouldShowHover = hover || clickable;
  const shouldBeClickable = clickable || !!onClick;
  
  const combinedClassName = `${baseClasses} ${paddingClass} ${spacingClass} ${shouldBeClickable ? 'cursor-pointer' : ''} ${className}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cardContent = (
    <div className={spacingClass}>
      {children}
    </div>
  );

  if (animated && (shouldShowHover || shouldBeClickable)) {
    return (
      <motion.div
        className={combinedClassName}
        variants={cardVariants}
        initial="rest"
        whileHover={shouldShowHover ? "hover" : "rest"}
        whileTap={shouldBeClickable ? "tap" : "rest"}
        onClick={handleClick}
        data-testid={testId}
      >
        {cardContent}
      </motion.div>
    );
  }

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={combinedClassName}
        onClick={handleClick}
        data-testid={testId}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div 
      className={combinedClassName}
      onClick={handleClick}
      data-testid={testId}
    >
      {cardContent}
    </div>
  );
};