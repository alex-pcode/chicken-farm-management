import { useCallback, useMemo } from 'react';
import { useFormState } from './useFormState';
import { useFormSubmit } from './useFormSubmit';
import { useEggData } from '../data/useEggData';
import { validateEggCount, validators } from '../../utils/validation';
import type { EggEntry, ValidationError } from '../../types';

export interface EggEntryFormData extends Record<string, unknown> {
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

  // Form submission handler (without formState dependency)
  const handleFormSubmit = useCallback(async (values: EggEntryFormData): Promise<void> => {
    // Validate form data
    const countError = validateEggCount(values.count);
    const dateError = validators.dateRange()(values.date);
    
    if (countError || dateError) {
      throw new Error('Form validation failed');
    }
    
    // Convert form data to EggEntry
    const eggEntry: Omit<EggEntry, 'id'> = {
      count: typeof values.count === 'string' ? parseInt(values.count, 10) : values.count as number,
      date: values.date,
      notes: values.notes || '',
      created_at: new Date().toISOString(),
    };
    
    // Submit to API
    await addEntry(eggEntry);
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess({ ...eggEntry, id: Date.now().toString() } as EggEntry);
    }
  }, [addEntry, onSuccess]);

  // Form state hook
  const formState = useFormState({
    initialValues,
    onSubmit: handleFormSubmit
  });

  // Form submission hook
  const submitState = useFormSubmit({
    onSubmit: handleFormSubmit,
    onSuccess: () => {
      // Success handled within handleFormSubmit
    },
    onError,
    showSuccessFor: 3000,
    resetOnSuccess: true
  });

  // Combined submit handler
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitState.submit(formState.values);
  }, [submitState, formState]);

  // Form validation
  const validateForm = useCallback((values: EggEntryFormData): boolean => {
    const countError = validateEggCount(values.count);
    const dateError = validators.dateRange()(values.date);
    
    return !countError && !dateError;
  }, []);

  // Field validation
  const validateField = useCallback((field: keyof EggEntryFormData): boolean => {
    const value = formState.values[field];
    
    switch (field) {
      case 'count': {
        const countError = validateEggCount(String(value));
        if (countError) {
          // Note: formState from useFormState doesn't have setError method
          return false;
        }
        return true;
      }
        
      case 'date': {
        const dateError = validators.dateRange()(String(value));
        if (dateError) {
          return false;
        }
        return true;
      }
        
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