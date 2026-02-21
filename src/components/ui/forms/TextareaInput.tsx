import React from 'react';
import { motion } from 'framer-motion';
import type { ValidationError } from '../../../types';

interface TextareaInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  errors?: ValidationError[];
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  errors = [],
  disabled = false,
  className = '',
  rows = 3,
  maxLength,
  showCharCount = false
}) => {
  const fieldErrors = errors.filter(error => 
    error.field === id || error.field === label.toLowerCase().replace(/\s+/g, '_')
  );
  const hasError = fieldErrors.length > 0;

  const inputId = id || label.toLowerCase().replace(/\s+/g, '_');
  const charCount = value.length;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;

  return (
    <div className={className}>
      <div className="flex justify-between items-end mb-2">
        <label 
          htmlFor={inputId}
          className="block text-gray-600 dark:text-gray-400 text-sm"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {showCharCount && maxLength && (
          <span className={`text-xs ${isNearLimit ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`neu-input resize-none ${hasError ? 'border-red-300 focus:ring-red-500' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        style={{ height: `${rows * 1.5 + 1}rem`, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
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