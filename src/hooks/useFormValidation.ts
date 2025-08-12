import { useState, useCallback } from 'react';
import type { ValidationError } from '../types';

interface ValidationRule {
  field: string;
  validator: (value: any, formData?: Record<string, any>) => string | null;
  required?: boolean;
}

interface UseFormValidationProps {
  rules: ValidationRule[];
  onValidSubmit?: (formData: Record<string, any>) => void | Promise<void>;
}

interface UseFormValidationReturn {
  errors: ValidationError[];
  isValid: boolean;
  validate: (formData: Record<string, any>) => boolean;
  validateField: (field: string, value: any, formData?: Record<string, any>) => void;
  clearErrors: (fields?: string[]) => void;
  addError: (field: string, message: string, type?: ValidationError['type']) => void;
  hasFieldError: (field: string) => boolean;
  getFieldErrors: (field: string) => ValidationError[];
}

export const useFormValidation = ({ 
  rules, 
  onValidSubmit 
}: UseFormValidationProps): UseFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearErrors = useCallback((fields?: string[]) => {
    if (fields) {
      setErrors(prev => prev.filter(error => !fields.includes(error.field)));
    } else {
      setErrors([]);
    }
  }, []);

  const addError = useCallback((field: string, message: string, type: ValidationError['type'] = 'invalid') => {
    setErrors(prev => {
      // Remove existing errors for this field
      const filtered = prev.filter(error => error.field !== field);
      return [...filtered, { field, message, type }];
    });
  }, []);

  const validateField = useCallback((field: string, value: any, formData?: Record<string, any>) => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return;

    // Clear existing errors for this field
    setErrors(prev => prev.filter(error => error.field !== field));

    // Check required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      addError(field, `${field.replace('_', ' ')} is required`, 'required');
      return;
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return;
    }

    // Run custom validator
    const errorMessage = rule.validator(value, formData);
    if (errorMessage) {
      addError(field, errorMessage, 'invalid');
    }
  }, [rules, addError]);

  const validate = useCallback((formData: Record<string, any>): boolean => {
    clearErrors();
    let isFormValid = true;

    for (const rule of rules) {
      const value = formData[rule.field];
      
      // Check required validation
      if (rule.required && (value === null || value === undefined || value === '')) {
        addError(rule.field, `${rule.field.replace('_', ' ')} is required`, 'required');
        isFormValid = false;
        continue;
      }

      // Skip other validations if field is empty and not required
      if (!rule.required && (value === null || value === undefined || value === '')) {
        continue;
      }

      // Run custom validator
      const errorMessage = rule.validator(value, formData);
      if (errorMessage) {
        addError(rule.field, errorMessage, 'invalid');
        isFormValid = false;
      }
    }

    return isFormValid;
  }, [rules, clearErrors, addError]);

  const hasFieldError = useCallback((field: string): boolean => {
    return errors.some(error => error.field === field);
  }, [errors]);

  const getFieldErrors = useCallback((field: string): ValidationError[] => {
    return errors.filter(error => error.field === field);
  }, [errors]);

  const isValid = errors.length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    addError,
    hasFieldError,
    getFieldErrors
  };
};