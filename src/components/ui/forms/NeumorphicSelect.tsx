import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValidationError } from '../../../types';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface NeumorphicSelectProps {
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

export const NeumorphicSelect: React.FC<NeumorphicSelectProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = normalizedOptions.find(option => option.value === value);
  const displayValue = selectedOption?.label || placeholder || 'Select...';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className} ref={dropdownRef}>
      <label 
        htmlFor={inputId}
        className="block text-gray-600 text-sm mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`neu-input w-full text-left flex items-center justify-between ${hasError ? 'border-red-300' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-10 w-full mt-1 neu-form border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {normalizedOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => !option.disabled && handleOptionClick(option.value)}
                  disabled={option.disabled}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                    option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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