import React from 'react';
import { motion } from 'framer-motion';
import type { ValidationError } from '../../types';

interface DateInputProps {
  id?: string;
  label: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  errors?: ValidationError[];
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  helperText?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  errors = [],
  disabled = false,
  className = '',
  min,
  max,
  helperText
}) => {
  // Extract string from label for ID generation, fallback to id if label is not a string
  const labelString = typeof label === 'string' ? label : (id || 'date-input');
  
  const fieldErrors = errors.filter(error => 
    error.field === id || error.field === labelString.toLowerCase().replace(/\s+/g, '_')
  );
  const hasError = fieldErrors.length > 0;

  const inputId = id || labelString.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className={className}>
      <label 
        htmlFor={inputId}
        className="block text-gray-600 text-sm mb-2"
      >
        {label}
      </label>
      
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={`neu-input ${hasError ? 'border-red-300 focus:ring-red-500' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
      />
      
      {hasError && (
        <motion.div
          id={`${inputId}-error`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 text-sm text-red-600"
        >
          {fieldErrors.map((error, index) => (
            <div key={index}>{error.message}</div>
          ))}
        </motion.div>
      )}
      
      {helperText && !hasError && (
        <p className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};