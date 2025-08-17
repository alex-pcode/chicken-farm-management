import React from 'react';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface FormFieldProps extends BaseUIComponentProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  inline?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  help,
  inline = false,
  children,
  className = '',
  testId,
}) => {
  const containerClasses = inline 
    ? 'flex items-center gap-4' 
    : 'space-y-2';

  return (
    <div className={`${containerClasses} ${className}`} data-testid={testId}>
      <div className={inline ? 'min-w-0 flex-1' : ''}>
        <label className="block text-gray-600 text-sm mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {help && !error && (
          <p className="text-gray-500 text-xs mt-1">{help}</p>
        )}
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;