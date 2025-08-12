import { useState, useCallback, useMemo } from 'react';
import type { ValidationError } from '../../types';

export interface UseFormSubmitOptions<T> {
  onSubmit: (data: T) => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  showSuccessFor?: number; // milliseconds
  resetOnSuccess?: boolean;
}

export interface UseFormSubmitReturn<T> {
  submit: (data: T) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  submitCount: number;
  lastSubmitTime: number | null;
  reset: () => void;
}

export const useFormSubmit = <T>(
  options: UseFormSubmitOptions<T>
): UseFormSubmitReturn<T> => {
  const {
    onSubmit,
    onSuccess,
    onError,
    showSuccessFor = 3000,
    resetOnSuccess = false
  } = options;

  // State declarations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null);

  // Reset all states
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    setSubmitCount(0);
    setLastSubmitTime(null);
  }, []);

  // Submit handler
  const submit = useCallback(async (data: T) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    setIsError(false);
    setError(null);
    setSubmitCount(prev => prev + 1);
    setLastSubmitTime(Date.now());

    try {
      const result = await onSubmit(data);
      
      // Handle success
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }

      // Auto-hide success message
      if (showSuccessFor > 0) {
        setTimeout(() => {
          setIsSuccess(false);
        }, showSuccessFor);
      }

      // Reset form if requested
      if (resetOnSuccess) {
        setTimeout(() => {
          reset();
        }, showSuccessFor);
      }

    } catch (err) {
      const submitError = err as Error;
      setIsError(true);
      setError(submitError);
      
      if (onError) {
        onError(submitError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    onSubmit,
    onSuccess,
    onError,
    showSuccessFor,
    resetOnSuccess,
    reset
  ]);

  return useMemo(() => ({
    submit,
    isSubmitting,
    isSuccess,
    isError,
    error,
    submitCount,
    lastSubmitTime,
    reset,
  }), [
    submit,
    isSubmitting,
    isSuccess,
    isError,
    error,
    submitCount,
    lastSubmitTime,
    reset,
  ]);
};