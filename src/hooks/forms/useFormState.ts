import { useState, useCallback, useMemo } from 'react';
import type { ValidationError } from '../../types';

export interface UseFormStateOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (error: Error) => void;
  resetOnSubmit?: boolean;
  validateOnChange?: boolean;
}

export interface UseFormStateReturn<T> {
  values: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, message: string, type?: ValidationError['type']) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  reset: (newValues?: T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (field: keyof T) => (value: any) => void;
  getFieldError: (field: keyof T) => string | undefined;
  hasError: (field: keyof T) => boolean;
}

export const useFormState = <T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateReturn<T> => {
  const {
    initialValues,
    onSubmit,
    onError,
    resetOnSubmit = false,
    validateOnChange = false
  } = options;

  // State declarations
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Calculate if form is valid
  const isValid = useMemo(() => errors.length === 0, [errors]);

  // Set a single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => {
      const newValues = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialValues));
      return newValues;
    });
    
    // Clear field error when value changes
    if (validateOnChange) {
      clearError(field);
    }
  }, [initialValues, validateOnChange]);

  // Set multiple field values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => {
      const updatedValues = { ...prev, ...newValues };
      setIsDirty(JSON.stringify(updatedValues) !== JSON.stringify(initialValues));
      return updatedValues;
    });
  }, [initialValues]);

  // Set field error
  const setError = useCallback((field: keyof T, message: string, type: ValidationError['type'] = 'invalid') => {
    setErrors(prev => {
      // Remove existing errors for this field
      const filteredErrors = prev.filter(error => error.field !== String(field));
      return [...filteredErrors, {
        field: String(field),
        message,
        type
      }];
    });
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => prev.filter(error => error.field !== String(field)));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Reset form
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValues;
    setValuesState(resetValues);
    setErrors([]);
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!onSubmit || isSubmitting) return;

    setIsSubmitting(true);
    clearAllErrors();

    try {
      await onSubmit(values);
      
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        // Set a general form error if no error handler provided
        setError('form' as keyof T, 'An error occurred while submitting the form');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, isSubmitting, clearAllErrors, resetOnSubmit, reset, onError, setError]);

  // Create field change handler
  const handleChange = useCallback((field: keyof T) => {
    return (value: any) => setValue(field, value);
  }, [setValue]);

  // Get field error message
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    const fieldError = errors.find(error => error.field === String(field));
    return fieldError?.message;
  }, [errors]);

  // Check if field has error
  const hasError = useCallback((field: keyof T): boolean => {
    return errors.some(error => error.field === String(field));
  }, [errors]);

  return useMemo(() => ({
    values,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    reset,
    handleSubmit,
    handleChange,
    getFieldError,
    hasError,
  }), [
    values,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    reset,
    handleSubmit,
    handleChange,
    getFieldError,
    hasError,
  ]);
};