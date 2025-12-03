import React from 'react';
import { motion } from 'framer-motion';
import type { ValidationError } from '../../../types';

interface TextInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  errors?: ValidationError[];
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'email' | 'password';
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  errors = [],
  disabled = false,
  className = '',
  type = 'text'
}) => {
  const fieldErrors = errors.filter(error => 
    error.field === id || error.field === label.toLowerCase().replace(/\s+/g, '_')
  );
  const hasError = fieldErrors.length > 0;

  const inputId = id || label.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className={className}>
      <label 
        htmlFor={inputId}
        className="block text-gray-600 text-sm mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
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
    </div>
  );
};