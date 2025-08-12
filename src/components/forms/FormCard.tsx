import React from 'react';
import { motion } from 'framer-motion';

interface FormCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

const getPaddingClasses = (padding: string) => {
  switch (padding) {
    case 'sm': return 'p-4';
    case 'md': return 'p-6';
    case 'lg': return 'p-8';
    default: return 'p-6';
  }
};

export const FormCard: React.FC<FormCardProps> = ({
  children,
  title,
  description,
  className = '',
  padding = 'md',
  shadow = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        neu-form
        ${getPaddingClasses(padding)}
        ${shadow ? 'shadow-lg' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="mb-6">
          <h2 className="neu-title">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 text-center mt-2">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </motion.div>
  );
};