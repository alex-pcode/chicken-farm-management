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
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  onSubmit,
  loading = false,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`neu-form p-6 shadow-lg transition-all duration-200 ${className}`}
      data-testid={testId}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="neu-title">{title}</h2>}
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
      </form>
    </motion.div>
  );
};

export default FormCard;