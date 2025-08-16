import { useCallback, useMemo } from 'react';
import { useFormState } from './useFormState';
import { useFormSubmit } from './useFormSubmit';
import { useEggData } from '../data/useEggData';
import { validateEggCount, validators } from '../../utils/validation';
import type { EggEntry, ValidationError } from '../../types';

export interface EggEntryFormData {
  count: string;
  date: string;
  notes?: string;
}

export interface UseEggEntryFormOptions {
  initialEntry?: Partial<EggEntry>;
  onSuccess?: (entry: EggEntry) => void;
  onError?: (error: Error) => void;
}

export interface UseEggEntryFormReturn {
  // Form state
  values: EggEntryFormData;
  errors: ValidationError[];
  isSubmitting: boolean;
  isSuccess: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Form actions
  setValue: (field: keyof EggEntryFormData, value: string | number) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (field: keyof EggEntryFormData) => (value: string | number) => void;
  reset: () => void;
  
  // Field helpers
  getFieldError: (field: keyof EggEntryFormData) => string | undefined;
  hasError: (field: keyof EggEntryFormData) => boolean;
  
  // Validation
  validateForm: () => boolean;
  validateField: (field: keyof EggEntryFormData) => boolean;
}

export const useEggEntryForm = (options: UseEggEntryFormOptions = {}): UseEggEntryFormReturn => {
  const { initialEntry, onSuccess, onError } = options;
  
  const { addEntry } = useEggData();

  // Initial form values
  const initialValues: EggEntryFormData = useMemo(() => ({
    count: initialEntry?.count?.toString() || '',
    date: initialEntry?.date || new Date().toISOString().split('T')[0],
    notes: initialEntry?.notes || ''
  }), [initialEntry]);

  // Form validation
  const validateForm = useCallback((values: EggEntryFormData): boolean => {
    let isValid = true;
    
    // Validate egg count
    const countError = validateEggCount(values.count);
    if (countError) {
      formState.setError('count', countError);
      isValid = false;
    }
    
    // Validate date
    const dateError = validators.dateRange()(values.date);
    if (dateError) {
      formState.setError('date', dateError);
      isValid = false;
    }
    
    return isValid;
  }, []);

  // Form submission handler
  const handleFormSubmit = useCallback(async (values: EggEntryFormData) => {
    // Clear existing errors
    formState.clearAllErrors();
    
    // Validate form
    if (!validateForm(values)) {
      throw new Error('Form validation failed');
    }
    
    // Convert form data to EggEntry
    const eggEntry: Omit<EggEntry, 'id'> = {
      count: parseInt(values.count, 10),
      date: values.date,
      notes: values.notes || '',
      userId: '', // Will be set by API
      createdAt: new Date().toISOString(),
    };
    
    // Submit to API
    await addEntry(eggEntry);
    
    return eggEntry;
  }, [addEntry, validateForm]);

  // Form state hook
  const formState = useFormState({
    initialValues,
    onSubmit: handleFormSubmit,
    onError,
    resetOnSubmit: true,
    validateOnChange: true
  });

  // Form submission hook
  const submitState = useFormSubmit({
    onSubmit: handleFormSubmit,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result);
      }
    },
    onError,
    showSuccessFor: 3000,
    resetOnSuccess: true
  });

  // Combined submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitState.submit(formState.values);
  }, [submitState.submit, formState.values]);

  // Field validation
  const validateField = useCallback((field: keyof EggEntryFormData): boolean => {
    const value = formState.values[field];
    
    switch (field) {
      case 'count':
        const countError = validateEggCount(value);
        if (countError) {
          formState.setError('count', countError);
          return false;
        }
        formState.clearError('count');
        return true;
        
      case 'date':
        const dateError = validators.dateRange()(value);
        if (dateError) {
          formState.setError('date', dateError);
          return false;
        }
        formState.clearError('date');
        return true;
        
      default:
        return true;
    }
  }, [formState]);

  return useMemo(() => ({
    // Form state
    values: formState.values,
    errors: formState.errors,
    isSubmitting: submitState.isSubmitting,
    isSuccess: submitState.isSuccess,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    
    // Form actions
    setValue: formState.setValue,
    handleSubmit,
    handleChange: formState.handleChange,
    reset: formState.reset,
    
    // Field helpers
    getFieldError: formState.getFieldError,
    hasError: formState.hasError,
    
    // Validation
    validateForm: () => validateForm(formState.values),
    validateField,
  }), [
    formState,
    submitState,
    handleSubmit,
    validateForm,
    validateField,
  ]);
};