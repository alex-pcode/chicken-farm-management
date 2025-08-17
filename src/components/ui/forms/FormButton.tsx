import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface FormButtonProps extends BaseUIComponentProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  primary: 'shiny-cta bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'neu-button-secondary',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const FormButton: React.FC<FormButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  className = '',
  testId,
}) => {
  const baseClasses = 'neu-button transition-all duration-200 font-medium rounded-lg';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'full-width' : 'md:w-auto md:min-w-[200px]';
  
  const combinedClassName = `${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClassName}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      data-testid={testId}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <span>{children}</span>
      )}
    </motion.button>
  );
};

export default FormButton;