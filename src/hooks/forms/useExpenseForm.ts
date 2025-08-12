import { useCallback, useMemo } from 'react';
import { useFormState } from './useFormState';
import { useFormSubmit } from './useFormSubmit';
import { useExpenseData } from '../data/useExpenseData';
import { validateExpenseAmount } from '../../utils/validation';
import type { Expense, ValidationError } from '../../types';

export interface ExpenseFormData {
  category: string;
  description: string;
  amount: string;
  date: string;
  notes?: string;
}

export interface UseExpenseFormOptions {
  initialExpense?: Partial<Expense>;
  onSuccess?: (expense: Expense) => void;
  onError?: (error: Error) => void;
  categories?: string[];
}

export interface UseExpenseFormReturn {
  // Form state
  values: ExpenseFormData;
  errors: ValidationError[];
  isSubmitting: boolean;
  isSuccess: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Form actions
  setValue: (field: keyof ExpenseFormData, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (field: keyof ExpenseFormData) => (value: any) => void;
  reset: () => void;
  
  // Field helpers
  getFieldError: (field: keyof ExpenseFormData) => string | undefined;
  hasError: (field: keyof ExpenseFormData) => boolean;
  
  // Validation
  validateForm: () => boolean;
  validateField: (field: keyof ExpenseFormData) => boolean;
  
  // Utilities
  categories: string[];
}

const DEFAULT_CATEGORIES = [
  'Feed',
  'Equipment',
  'Veterinary',
  'Maintenance',
  'Supplies',
  'Other'
];

export const useExpenseForm = (options: UseExpenseFormOptions = {}): UseExpenseFormReturn => {
  const { initialExpense, onSuccess, onError, categories = DEFAULT_CATEGORIES } = options;
  
  const { addExpense } = useExpenseData();

  // Initial form values
  const initialValues: ExpenseFormData = useMemo(() => ({
    category: initialExpense?.category || categories[0],
    description: initialExpense?.description || '',
    amount: initialExpense?.amount?.toString() || '',
    date: initialExpense?.date || new Date().toISOString().split('T')[0],
    notes: initialExpense?.notes || ''
  }), [initialExpense, categories]);

  // Form validation
  const validateForm = useCallback((values: ExpenseFormData): boolean => {
    let isValid = true;
    
    // Validate required fields
    if (!values.description.trim()) {
      formState.setError('description', 'Description is required');
      isValid = false;
    }
    
    if (!values.category.trim()) {
      formState.setError('category', 'Category is required');
      isValid = false;
    }
    
    if (!values.date) {
      formState.setError('date', 'Date is required');
      isValid = false;
    }
    
    // Validate amount
    const amountError = validateExpenseAmount(values.amount);
    if (amountError) {
      formState.setError('amount', amountError);
      isValid = false;
    }
    
    // Validate date is not in future
    if (values.date && new Date(values.date) > new Date()) {
      formState.setError('date', 'Date cannot be in the future');
      isValid = false;
    }
    
    // Validate category is valid
    if (values.category && !categories.includes(values.category)) {
      formState.setError('category', 'Please select a valid category');
      isValid = false;
    }
    
    return isValid;
  }, [categories]);

  // Form submission handler
  const handleFormSubmit = useCallback(async (values: ExpenseFormData) => {
    // Clear existing errors
    formState.clearAllErrors();
    
    // Validate form
    if (!validateForm(values)) {
      throw new Error('Form validation failed');
    }
    
    // Convert form data to Expense
    const expense: Omit<Expense, 'id'> = {
      category: values.category,
      description: values.description.trim(),
      amount: parseFloat(values.amount),
      date: values.date,
      // Note: created_at will be set by the API if needed
    };
    
    // Submit to API
    await addExpense(expense);
    
    return expense;
  }, [addExpense, validateForm]);

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
  const validateField = useCallback((field: keyof ExpenseFormData): boolean => {
    const value = formState.values[field];
    
    switch (field) {
      case 'amount':
        const amountError = validateExpenseAmount(value);
        if (amountError) {
          formState.setError('amount', amountError);
          return false;
        }
        formState.clearError('amount');
        return true;
        
      case 'description':
        if (!value.trim()) {
          formState.setError('description', 'Description is required');
          return false;
        }
        formState.clearError('description');
        return true;
        
      case 'category':
        if (!value.trim()) {
          formState.setError('category', 'Category is required');
          return false;
        }
        if (!categories.includes(value)) {
          formState.setError('category', 'Please select a valid category');
          return false;
        }
        formState.clearError('category');
        return true;
        
      case 'date':
        if (!value) {
          formState.setError('date', 'Date is required');
          return false;
        }
        if (new Date(value) > new Date()) {
          formState.setError('date', 'Date cannot be in the future');
          return false;
        }
        formState.clearError('date');
        return true;
        
      default:
        return true;
    }
  }, [formState, categories]);

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
    
    // Utilities
    categories,
  }), [
    formState,
    submitState,
    handleSubmit,
    validateForm,
    validateField,
    categories,
  ]);
};