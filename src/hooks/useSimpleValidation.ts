import { useState, useCallback } from 'react';
import type { ValidationError } from '../types';

interface UseSimpleValidationReturn {
  errors: ValidationError[];
  setFieldError: (field: string, message: string, type?: ValidationError['type']) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasFieldError: (field: string) => boolean;
  getFieldErrors: (field: string) => ValidationError[];
}

export const useSimpleValidation = (): UseSimpleValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const setFieldError = useCallback((field: string, message: string, type: ValidationError['type'] = 'invalid') => {
    setErrors(prev => {
      // Remove existing errors for this field
      const filtered = prev.filter(error => error.field !== field);
      return [...filtered, { field, message, type }];
    });
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const hasFieldError = useCallback((field: string): boolean => {
    return errors.some(error => error.field === field);
  }, [errors]);

  const getFieldErrors = useCallback((field: string): ValidationError[] => {
    return errors.filter(error => error.field === field);
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasFieldError,
    getFieldErrors
  };
};