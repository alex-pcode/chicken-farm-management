import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface GridContainerProps extends BaseUIComponentProps {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
  animated?: boolean;
  equalHeight?: boolean;
}

const getColumnClasses = (columns: number | { sm?: number; md?: number; lg?: number; xl?: number }): string => {
  if (typeof columns === 'number') {
    return `grid-cols-2 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`;
  }

  const classes = ['grid-cols-2'];
  if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
  if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
  if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
  if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
  
  return classes.join(' ');
};

const gapClasses = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-3',
  xl: 'gap-4',
};

export const GridContainer: React.FC<GridContainerProps> = ({
  columns = 3,
  gap = 'md',
  autoFit = false,
  minItemWidth = '280px',
  animated = true,
  equalHeight = false,
  children,
  className = '',
  testId,
}) => {
  let gridClasses = 'grid';

  if (autoFit) {
    // Use CSS Grid auto-fit for truly responsive grids
    const style = {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
    };
    
    const baseClasses = `${gapClasses[gap]} ${equalHeight ? 'grid-rows-[masonry]' : ''}`;
    const combinedClassName = `${baseClasses} ${className}`;

    if (animated) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={style}
          className={combinedClassName}
          data-testid={testId}
        >
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <div
        style={style}
        className={combinedClassName}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }

  // Use Tailwind responsive grid classes
  gridClasses += ` ${getColumnClasses(columns)} ${gapClasses[gap]}`;
  if (equalHeight) gridClasses += ' items-stretch';

  const combinedClassName = `${gridClasses} ${className}`;

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={combinedClassName}
        data-testid={testId}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className={combinedClassName} data-testid={testId}>
      {children}
    </div>
  );
};