import { useState, useCallback } from 'react';

interface UseFormStateProps<T> {
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormStateReturn<T> {
  values: T;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  resetValues: () => void;
  handleInputChange: (field: keyof T) => (value: any) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isDirty: boolean;
  isSubmitting: boolean;
  setSubmitting: (submitting: boolean) => void;
}

export const useFormState = <T extends Record<string, any>>({
  initialValues,
  onSubmit
}: UseFormStateProps<T>): UseFormStateReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if form has been modified
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  const resetValues = useCallback(() => {
    setValuesState(initialValues);
  }, [initialValues]);

  const handleInputChange = useCallback((field: keyof T) => {
    return (value: any) => setValue(field, value);
  }, [setValue]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!onSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, isSubmitting]);

  return {
    values,
    setValue,
    setValues,
    resetValues,
    handleInputChange,
    handleSubmit,
    isDirty,
    isSubmitting,
    setSubmitting
  };
};