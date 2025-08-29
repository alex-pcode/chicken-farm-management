import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface StatCardProps extends BaseUIComponentProps {
  title: string;
  total: string | number;
  label?: string | React.ReactNode;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  variant?: 'default' | 'compact' | 'gradient' | 'corner-gradient' | 'dark';
  icon?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'glass-card p-2 lg:p-3 relative overflow-hidden',
  compact: 'glass-card p-2 lg:p-3',
  gradient: 'glass-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-2 lg:p-3',
  'corner-gradient': 'glass-card p-2 lg:p-3 relative overflow-hidden',
  'dark': 'stat-card',
};

const cardVariants = {
  hover: { 
    scale: 1.02,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
};

{/* 
COMPARISON CARD FOR DESIGN REFERENCE:
<div class="stat-card">
  <h3 class="text-lg font-medium text-white">Net Profit/Loss</h3>
  <p class="text-4xl font-bold mt-2">-$91.09</p>
  <p class="text-sm text-white/90 mt-1">period profit only</p>
</div>
*/}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  total,
  label,
  change,
  changeType,
  // trend, // TODO: Implement trend functionality
  loading = false,
  variant = 'default',
  icon,
  onClick,
  className = '',
  testId,
}) => {
  const baseClasses = variantClasses[variant];
  const combinedClassName = `${baseClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className={combinedClassName} data-testid={testId}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      {/* Corner Gradient Overlay */}
      {variant === 'corner-gradient' && (
        <>
          <div 
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              top: '-25%',
              right: '-15%',
              width: '35%',
              height: '30%',
              borderRadius: '70%',
              background: 'radial-gradient(circle, #4F39F6 0%, #191656 100%)',
              filter: 'blur(60px)',
              opacity: 1
            }}
          />
        </>
      )}
      
      <div className="relative">
        {/* Icon positioned in top-right corner */}
        {icon && (
          <div className={`absolute top-0 right-0 size-6 flex items-center justify-center ${
            variant === 'dark' ? 'text-white/70' : 'text-gray-400'
          }`}>
            <span className="text-base">{icon}</span>
          </div>
        )}
        
        {/* Content Section */}
        <div className="pr-8">
          {/* Title */}
          <div className={`font-bold text-base lg:text-lg mb-1 ${
            variant === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </div>
          
          {/* Value */}
          <div className={`font-bold mb-2 text-2xl ${
            variant === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {total}
          </div>
          
          {/* Label and Change */}
          <div className={`text-xs ${
            variant === 'dark' ? 'text-white/90' : 'text-gray-500'
          }`}>
            {change !== undefined && (
              <span className={`font-medium ${
                variant === 'dark' 
                  ? (changeType === 'increase' ? 'text-green-400' : changeType === 'decrease' ? 'text-red-400' : 'text-white/90')
                  : getChangeColor()
              }`}>
                {changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→'} {changeType === 'increase' ? '+' : ''}{change}%
              </span>
            )}
            {change !== undefined && label && <span> vs </span>}
            {label && <span>{label}</span>}
          </div>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <motion.div
        className={combinedClassName}
        onClick={onClick}
        whileHover={cardVariants.hover}
        data-testid={testId}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={combinedClassName}
      data-testid={testId}
    >
      {cardContent}
    </motion.div>
  );
};