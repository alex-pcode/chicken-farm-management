import React from 'react';
import { motion } from 'framer-motion';
import { EmptyState } from './EmptyState';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface DataListProps<T> extends BaseUIComponentProps {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyAction?: {
    text: string;
    onClick: () => void;
  };
  variant?: 'default' | 'grid' | 'compact';
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'space-y-4',
  grid: 'grid',
  compact: 'space-y-2',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export const DataList = <T,>({
  data,
  renderItem,
  loading = false,
  emptyMessage = 'No items to display',
  emptyIcon = '📋',
  emptyTitle,
  emptyAction,
  variant = 'default',
  columns = 3,
  gap = 'md',
  className = '',
  testId,
}: DataListProps<T>) => {
  const baseClasses = variantClasses[variant];
  const gapClass = variant === 'grid' ? gapClasses[gap] : '';
  const gridCols = variant === 'grid' ? `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}` : '';
  const combinedClassName = `${baseClasses} ${gapClass} ${gridCols} ${className}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        testId={testId}
      />
    );
  }

  return (
    <div className={combinedClassName} data-testid={testId}>
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
};