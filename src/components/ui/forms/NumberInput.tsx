import React from 'react';
import { motion } from 'framer-motion';
import type { ValidationError } from '../../../types';

interface NumberInputProps {
  id?: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  errors?: ValidationError[];
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  showSpinner?: boolean;
  selectAllOnFocus?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  errors = [],
  disabled = false,
  className = '',
  min,
  max,
  step = 1,
  showSpinner = true,
  selectAllOnFocus = false
}) => {
  const fieldErrors = errors.filter(error => 
    error.field === id || error.field === label.toLowerCase().replace(/\s+/g, '_')
  );
  const hasError = fieldErrors.length > 0;

  const inputId = id || label.toLowerCase().replace(/\s+/g, '_');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input for better UX - don't force to 0 immediately
    if (inputValue === '') {
      onChange(0); // Still need to provide a number for controlled input
      return;
    }
    
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      // Apply min/max constraints if specified
      let constrainedValue = newValue;
      if (min !== undefined && constrainedValue < min) constrainedValue = min;
      if (max !== undefined && constrainedValue > max) constrainedValue = max;
      onChange(constrainedValue);
    }
    // If the value is NaN (invalid), don't call onChange to prevent corruption
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (selectAllOnFocus) {
      // Select all text when selectAllOnFocus is enabled
      e.target.select();
    } else if (value === 0 || value === '0') {
      // Default behavior: only select all when value is 0
      e.target.select();
    }
  };

  return (
    <div className={className}>
      <label 
        htmlFor={inputId}
        className="block text-gray-600 dark:text-gray-400 text-sm mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={inputId}
        type="number"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`neu-input ${hasError ? 'border-red-300 focus:ring-red-500' : ''} ${!showSpinner ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
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
    </div>
  );
};