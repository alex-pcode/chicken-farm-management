import React from 'react';
import { motion } from 'framer-motion';
import type { ValidationError } from '../../../types';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[] | string[];
  placeholder?: string;
  required?: boolean;
  errors?: ValidationError[];
  disabled?: boolean;
  className?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  errors = [],
  disabled = false,
  className = ''
}) => {
  const fieldErrors = errors.filter(error => 
    error.field === id || error.field === label.toLowerCase().replace(/\s+/g, '_')
  );
  const hasError = fieldErrors.length > 0;

  const inputId = id || label.toLowerCase().replace(/\s+/g, '_');

  // Normalize options to SelectOption format
  const normalizedOptions = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option }
      : option
  );

  return (
    <div className={className}>
      <label 
        htmlFor={inputId}
        className="block text-gray-600 dark:text-gray-400 text-sm mb-2"
      >
        {label}
      </label>
      
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`neu-input ${hasError ? 'border-red-300 focus:ring-red-500' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {normalizedOptions.map((option, index) => (
          <option 
            key={index}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
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
    </div>
  );
};