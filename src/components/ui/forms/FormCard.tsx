import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface FormCardProps extends BaseUIComponentProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  asFormWrapper?: boolean; // New prop to control form wrapper
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  onSubmit,
  loading = false,
  asFormWrapper = true, // Default to true for backward compatibility
  children,
  className = '',
  testId,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(event);
    }
  };

  const headerContent = (title || subtitle || description) && (
    <div className="mb-6">
      {title && (
        <h2 className="neu-title flex items-center gap-3">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      )}
      {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
      {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card ${className}`}
      data-testid={testId}
    >
      {headerContent}
      
      {asFormWrapper ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}
        </form>
      ) : (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default FormCard;