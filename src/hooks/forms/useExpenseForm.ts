import { useCallback, useMemo } from 'react';
import { useFormState } from './useFormState';
import { useFormSubmit } from './useFormSubmit';
import { useExpenseData } from '../data/useExpenseData';
import { validateExpenseAmount } from '../../utils/validation';
import type { Expense, ValidationError } from '../../types';

export interface ExpenseFormData extends Record<string, unknown> {
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
  setValue: (field: keyof ExpenseFormData, value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (field: keyof ExpenseFormData) => (value: string) => void;
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
    notes: (initialExpense as Expense & { notes?: string })?.notes || ''
  }), [initialExpense, categories]);

  // Form submission handler
  const handleFormSubmit = useCallback(async (values: ExpenseFormData): Promise<void> => {
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
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess({ ...expense, id: Date.now().toString() } as Expense);
    }
  }, [addExpense, onSuccess]);

  // Form state hook
  const formState = useFormState({
    initialValues,
    onSubmit: handleFormSubmit
  });

  // Form validation
  const validateForm = useCallback((values: ExpenseFormData): boolean => {
    let isValid = true;
    
    // Validate required fields
    if (!values.description.trim()) {
      isValid = false;
    }
    
    if (!values.category.trim()) {
      isValid = false;
    }
    
    if (!values.date) {
      isValid = false;
    }
    
    // Validate amount
    const amountError = validateExpenseAmount(values.amount);
    if (amountError) {
      isValid = false;
    }
    
    // Validate date is not in future
    if (values.date && new Date(values.date) > new Date()) {
      isValid = false;
    }
    
    // Validate category is valid
    if (values.category && !categories.includes(values.category)) {
      isValid = false;
    }
    
    return isValid;
  }, [categories]);

  // Form submission hook (for useFormSubmit)
  const handleFormSubmitForHook = useCallback(async (values: ExpenseFormData) => {
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

  // Form submission hook
  const submitState = useFormSubmit({
    onSubmit: handleFormSubmitForHook,
    onSuccess: (result) => {
      if (onSuccess) {
        onSuccess(result as Expense);
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
  }, [submitState, formState.values]);

  // Field validation
  const validateField = useCallback((field: keyof ExpenseFormData): boolean => {
    const value = formState.values[field];
    
    switch (field) {
      case 'amount': {
        const amountError = validateExpenseAmount(String(value));
        return !amountError;
      }
        
      case 'description':
        return String(value).trim().length > 0;
        
      case 'category': {
        const categoryValue = String(value);
        return categoryValue.trim().length > 0 && categories.includes(categoryValue);
      }
        
      case 'date':
        if (!value) {
          return false;
        }
        if (new Date(String(value)) > new Date()) {
          return false;
        }
        return true;
        
      default:
        return true;
    }
  }, [formState, categories]);

  return useMemo(() => ({
    // Form state
    values: formState.values as ExpenseFormData,
    errors: [],
    isSubmitting: submitState.isSubmitting,
    isSuccess: submitState.isSuccess,
    isValid: true,
    isDirty: formState.isDirty,
    
    // Form actions
    setValue: (field: keyof ExpenseFormData, value: string) => formState.setValue(field, value),
    handleSubmit,
    handleChange: (field: keyof ExpenseFormData) => (value: string) => formState.setValue(field, value),
    reset: () => formState.reset(),
    
    // Field helpers
    getFieldError: () => undefined,
    hasError: () => false,
    
    // Validation
    validateForm: () => validateForm(formState.values as ExpenseFormData),
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