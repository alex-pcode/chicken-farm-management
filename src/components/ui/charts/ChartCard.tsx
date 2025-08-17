import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface ChartCardProps extends BaseUIComponentProps {
  title: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  height = 240,
  loading = false,
  children,
  className = '',
  testId,
}) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`chart-card flex flex-col gap-4 ${className}`}
        data-testid={testId}
      >
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs lg:text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div 
          className="flex items-center justify-center bg-gray-50 rounded-lg"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-500 text-sm">Loading chart...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`chart-card flex flex-col gap-4 ${className}`}
      data-testid={testId}
    >
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs lg:text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="aspect-auto h-60 w-full" style={{ height }}>
        {children}
      </div>
    </motion.div>
  );
};

export default ChartCard;