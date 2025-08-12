import React from 'react';
import { motion } from 'framer-motion';

interface SubmitButtonProps {
  children?: React.ReactNode;
  text?: string; // Alternative to children
  loading?: boolean;
  isLoading?: boolean; // Alternative to loading
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loadingText?: string;
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'primary':
      return 'shiny-cta bg-blue-600 hover:bg-blue-700 text-white';
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white';
    default:
      return 'shiny-cta bg-blue-600 hover:bg-blue-700 text-white';
  }
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm': return 'px-3 py-2 text-sm';
    case 'md': return 'px-4 py-2';
    case 'lg': return 'px-6 py-3 text-lg';
    default: return 'px-4 py-2';
  }
};

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  text,
  loading = false,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'submit',
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText = 'Loading...'
}) => {
  // Support both loading and isLoading props
  const isCurrentlyLoading = loading || isLoading;
  const isDisabled = disabled || isCurrentlyLoading;
  
  // Support both children and text props
  const buttonText = text || children;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={`
        relative
        rounded-lg
        font-medium
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        flex
        items-center
        justify-center
        gap-2
        ${getVariantClasses(variant)}
        ${getSizeClasses(size)}
        ${className}
      `}
    >
      {isCurrentlyLoading && (
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-transparent border-t-current animate-spin"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      <span className={isCurrentlyLoading ? 'opacity-75' : ''}>
        {isCurrentlyLoading && loadingText ? loadingText : buttonText}
      </span>
    </motion.button>
  );
};