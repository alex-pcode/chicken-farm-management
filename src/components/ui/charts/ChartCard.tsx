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
  variant?: 'default' | 'compact' | 'detailed';
  showBorder?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  height = 240,
  loading = false,
  showBorder = true,
  children,
  className = '',
  testId,
}) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`chart-card bg-white dark:bg-[#1a1a1a] rounded-xl ${showBorder ? 'border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md' : 'shadow-none'} p-6 transition-shadow flex flex-col gap-4 ${className}`}
        data-testid={testId}
      >
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading chart...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`chart-card bg-white dark:bg-[#1a1a1a] rounded-xl ${showBorder ? 'border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md' : 'shadow-none'} p-6 transition-shadow flex flex-col gap-4 ${className}`}
      data-testid={testId}
    >
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div 
        className="chart-container w-full" 
        style={{ 
          height, 
          minHeight: height,
          minWidth: '200px',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default ChartCard;