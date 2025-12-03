import React from 'react';
// import { motion } from 'framer-motion'; // Unused import

interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const getGridClasses = (columns: number) => {
  switch (columns) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-1 md:grid-cols-2';
    case 3: return 'grid-cols-1 md:grid-cols-3';
    case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    default: return 'grid-cols-1 md:grid-cols-2';
  }
};

const getGapClasses = (gap: string) => {
  switch (gap) {
    case 'sm': return 'gap-4';
    case 'md': return 'gap-6';
    case 'lg': return 'gap-8';
    default: return 'gap-6';
  }
};

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className = '',
  columns = 2,
  gap = 'md'
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={`grid ${getGridClasses(columns)} ${getGapClasses(gap)}`}>
        {children}
      </div>
    </div>
  );
};