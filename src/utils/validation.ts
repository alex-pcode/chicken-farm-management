/**
 * Common validation utilities for form components with type guard integration
 */
import type { ValidationError } from '../types';
import { 
  isValidString, 
  isValidNumber, 
  isPositiveNumber, 
  isNonNegativeNumber,
  isValidDateString,
  createValidationError,
  ValidationResult,
  createValidResult,
  createInvalidResult
} from './typeGuards';

export type ValidatorFunction = (value: unknown, formData?: Record<string, unknown>) => string | null;

/**
 * Enhanced validator that returns ValidationError objects
 */
export type TypeGuardValidator<T> = (value: unknown) => ValidationResult<T>;

// Generic validators
export const validators = {
  required: (message = 'This field is required'): ValidatorFunction => 
    (value) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return message;
      }
      return null;
    },

  minLength: (min: number, message?: string): ValidatorFunction =>
    (value) => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return null;
    },

  maxLength: (max: number, message?: string): ValidatorFunction =>
    (value) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Must be no more than ${max} characters`;
      }
      return null;
    },

  min: (min: number, message?: string): ValidatorFunction =>
    (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value as number;
      if (typeof num === 'number' && !isNaN(num) && num < min) {
        return message || `Must be at least ${min}`;
      }
      return null;
    },

  max: (max: number, message?: string): ValidatorFunction =>
    (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value as number;
      if (typeof num === 'number' && !isNaN(num) && num > max) {
        return message || `Must be no more than ${max}`;
      }
      return null;
    },

  email: (message = 'Please enter a valid email address'): ValidatorFunction =>
    (value) => {
      if (typeof value === 'string' && value.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return message;
        }
      }
      return null;
    },

  number: (message = 'Please enter a valid number'): ValidatorFunction =>
    (value) => {
      if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
        return message;
      }
      return null;
    },

  integer: (message = 'Please enter a whole number'): ValidatorFunction =>
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && !Number.isInteger(num)) {
        return message;
      }
      return null;
    },

  positive: (message = 'Must be a positive number'): ValidatorFunction =>
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && num <= 0) {
        return message;
      }
      return null;
    },

  dateRange: (startDate?: string, endDate?: string, message?: string): ValidatorFunction =>
    (value) => {
      if (typeof value === 'string' && value.length > 0) {
        const date = new Date(value);
        
        if (startDate && date < new Date(startDate)) {
          return message || `Date must be after ${startDate}`;
        }
        
        if (endDate && date > new Date(endDate)) {
          return message || `Date must be before ${endDate}`;
        }
      }
      return null;
    },

  custom: (validatorFn: (value: unknown) => boolean, message: string): ValidatorFunction =>
    (value) => {
      if (!validatorFn(value)) {
        return message;
      }
      return null;
    }
};

// Application-specific validators
export const validateEggCount: ValidatorFunction = (value) => {
  const count = Number(value);
  
  if (isNaN(count)) {
    return 'Egg count must be a number';
  }
  
  if (count < 0) {
    return 'Egg count cannot be negative';
  }
  
  if (count > 100) {
    return 'Egg count seems unusually high. Please verify.';
  }
  
  if (!Number.isInteger(count)) {
    return 'Egg count must be a whole number';
  }
  
  return null;
};

export const validateExpenseAmount: ValidatorFunction = (value) => {
  const amount = Number(value);
  
  if (isNaN(amount)) {
    return 'Amount must be a number';
  }
  
  if (amount < 0) {
    return 'Amount cannot be negative';
  }
  
  if (amount > 10000) {
    return 'Amount seems unusually high. Please verify.';
  }
  
  // Check for reasonable decimal places (max 2)
  const decimalPlaces = (amount.toString().split('.')[1] || []).length;
  if (decimalPlaces > 2) {
    return 'Amount cannot have more than 2 decimal places';
  }
  
  return null;
};

export const validateBirdCount: ValidatorFunction = (value) => {
  const count = Number(value);
  
  if (isNaN(count)) {
    return 'Bird count must be a number';
  }
  
  if (count < 0) {
    return 'Bird count cannot be negative';
  }
  
  if (count > 1000) {
    return 'Bird count seems unusually high. Please verify.';
  }
  
  if (!Number.isInteger(count)) {
    return 'Bird count must be a whole number';
  }
  
  return null;
};

export const validateFeedQuantity: ValidatorFunction = (value) => {
  const quantity = Number(value);
  
  if (isNaN(quantity)) {
    return 'Quantity must be a number';
  }
  
  if (quantity <= 0) {
    return 'Quantity must be greater than 0';
  }
  
  if (quantity > 10000) {
    return 'Quantity seems unusually high. Please verify.';
  }
  
  return null;
};

export const validatePricePerUnit: ValidatorFunction = (value) => {
  const price = Number(value);
  
  if (isNaN(price)) {
    return 'Price must be a number';
  }
  
  if (price < 0) {
    return 'Price cannot be negative';
  }
  
  if (price > 1000) {
    return 'Price per unit seems unusually high. Please verify.';
  }
  
  // Check for reasonable decimal places (max 4 for per-unit pricing)
  const decimalPlaces = (price.toString().split('.')[1] || []).length;
  if (decimalPlaces > 4) {
    return 'Price cannot have more than 4 decimal places';
  }
  
  return null;
};

// Date validation utilities
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isDateInFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

export const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date < new Date();
};

export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/* ===== TYPE GUARD ENHANCED VALIDATORS ===== */

/**
 * Enhanced string validator with type safety
 */
export const validateStringField = (
  fieldName: string,
  required: boolean = true,
  minLength: number = 0,
  maxLength: number = 1000
): TypeGuardValidator<string> => {
  return (value: unknown): ValidationResult<string> => {
    // Required field check
    if (required && (value === null || value === undefined || value === '')) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} is required`, 'required')
      ]);
    }

    // Allow empty string for non-required fields
    if (!required && (value === null || value === undefined || value === '')) {
      return createValidResult('');
    }

    // Type check
    if (!isValidString(value)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be a valid non-empty string`, 'invalid')
      ]);
    }

    // Length validation
    if (value.length < minLength) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be at least ${minLength} characters`, 'range')
      ]);
    }

    if (value.length > maxLength) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be no more than ${maxLength} characters`, 'range')
      ]);
    }

    return createValidResult(value);
  };
};

/**
 * Enhanced number validator with type safety
 */
export const validateNumberField = (
  fieldName: string,
  required: boolean = true,
  min?: number,
  max?: number,
  allowDecimals: boolean = true
): TypeGuardValidator<number> => {
  return (value: unknown): ValidationResult<number> => {
    // Required field check
    if (required && (value === null || value === undefined || value === '')) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} is required`, 'required')
      ]);
    }

    // Allow undefined for non-required fields
    if (!required && (value === null || value === undefined || value === '')) {
      return createValidResult(0); // Default to 0 for non-required number fields
    }

    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Type check
    if (!isValidNumber(numValue)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be a valid number`, 'invalid')
      ]);
    }

    // Integer check if decimals not allowed
    if (!allowDecimals && !Number.isInteger(numValue)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be a whole number`, 'invalid')
      ]);
    }

    // Range validation
    if (min !== undefined && numValue < min) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be at least ${min}`, 'range')
      ]);
    }

    if (max !== undefined && numValue > max) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be no more than ${max}`, 'range')
      ]);
    }

    return createValidResult(numValue);
  };
};

/**
 * Enhanced positive number validator
 */
export const validatePositiveNumberField = (
  fieldName: string,
  required: boolean = true,
  max?: number,
  allowDecimals: boolean = true
): TypeGuardValidator<number> => {
  return (value: unknown): ValidationResult<number> => {
    const numberValidation = validateNumberField(fieldName, required, 0.01, max, allowDecimals);
    const result = numberValidation(value);

    if (!result.isValid || result.data === undefined) {
      return result;
    }

    if (!isPositiveNumber(result.data)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be greater than 0`, 'range')
      ]);
    }

    return result;
  };
};

/**
 * Enhanced non-negative number validator
 */
export const validateNonNegativeNumberField = (
  fieldName: string,
  required: boolean = true,
  max?: number,
  allowDecimals: boolean = true
): TypeGuardValidator<number> => {
  return (value: unknown): ValidationResult<number> => {
    const numberValidation = validateNumberField(fieldName, required, 0, max, allowDecimals);
    const result = numberValidation(value);

    if (!result.isValid || result.data === undefined) {
      return result;
    }

    if (!isNonNegativeNumber(result.data)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} cannot be negative`, 'range')
      ]);
    }

    return result;
  };
};

/**
 * Enhanced date validator with type safety
 */
export const validateDateField = (
  fieldName: string,
  required: boolean = true,
  minDate?: string,
  maxDate?: string
): TypeGuardValidator<string> => {
  return (value: unknown): ValidationResult<string> => {
    // Required field check
    if (required && (value === null || value === undefined || value === '')) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} is required`, 'required')
      ]);
    }

    // Allow empty string for non-required fields
    if (!required && (value === null || value === undefined || value === '')) {
      return createValidResult('');
    }

    // Type and format check
    if (!isValidDateString(value)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be a valid date`, 'invalid')
      ]);
    }

    // Range validation
    const dateValue = new Date(value);

    if (minDate && dateValue < new Date(minDate)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be after ${minDate}`, 'range')
      ]);
    }

    if (maxDate && dateValue > new Date(maxDate)) {
      return createInvalidResult([
        createValidationError(fieldName, `${fieldName} must be before ${maxDate}`, 'range')
      ]);
    }

    return createValidResult(value);
  };
};

/**
 * Enhanced egg count validator using type guards
 */
export const validateEggCountWithTypeGuards: TypeGuardValidator<number> = (value: unknown) => {
  return validateNonNegativeNumberField('Egg Count', true, 100, false)(value);
};

/**
 * Enhanced expense amount validator using type guards
 */
export const validateExpenseAmountWithTypeGuards: TypeGuardValidator<number> = (value: unknown) => {
  const result = validatePositiveNumberField('Expense Amount', true, 10000, true)(value);
  
  if (!result.isValid || result.data === undefined) {
    return result;
  }

  // Additional decimal places check
  const decimalPlaces = (result.data.toString().split('.')[1] || []).length;
  if (decimalPlaces > 2) {
    return createInvalidResult([
      createValidationError('Expense Amount', 'Amount cannot have more than 2 decimal places', 'invalid')
    ]);
  }

  return result;
};

/**
 * Enhanced bird count validator using type guards
 */
export const validateBirdCountWithTypeGuards: TypeGuardValidator<number> = (value: unknown) => {
  return validateNonNegativeNumberField('Bird Count', true, 1000, false)(value);
};

/**
 * Enhanced feed quantity validator using type guards
 */
export const validateFeedQuantityWithTypeGuards: TypeGuardValidator<number> = (value: unknown) => {
  return validatePositiveNumberField('Feed Quantity', true, 10000, true)(value);
};

/**
 * Enhanced price per unit validator using type guards
 */
export const validatePricePerUnitWithTypeGuards: TypeGuardValidator<number> = (value: unknown) => {
  const result = validateNonNegativeNumberField('Price Per Unit', true, 1000, true)(value);
  
  if (!result.isValid || result.data === undefined) {
    return result;
  }

  // Additional decimal places check for pricing
  const decimalPlaces = (result.data.toString().split('.')[1] || []).length;
  if (decimalPlaces > 4) {
    return createInvalidResult([
      createValidationError('Price Per Unit', 'Price cannot have more than 4 decimal places', 'invalid')
    ]);
  }

  return result;
};

/**
 * Utility to convert ValidationResult to legacy validator format
 */
export const convertToLegacyValidator = <T>(
  typeGuardValidator: TypeGuardValidator<T>
): ValidatorFunction => {
  return (value: unknown) => {
    const result = typeGuardValidator(value);
    if (result.isValid) {
      return null; // No error
    }
    
    // Return the first error message
    return result.errors[0]?.message || 'Validation failed';
  };
};

/**
 * Batch validation utility for forms
 */
export const validateForm = (
  formData: Record<string, unknown>,
  validators: Record<string, TypeGuardValidator<unknown>>
): { isValid: boolean; errors: Record<string, ValidationError[]>; validData: Record<string, unknown> } => {
  const errors: Record<string, ValidationError[]> = {};
  const validData: Record<string, unknown> = {};
  let isValid = true;

  for (const [fieldName, validator] of Object.entries(validators)) {
    const fieldValue = formData[fieldName];
    const result = validator(fieldValue);
    
    if (result.isValid && result.data !== undefined) {
      validData[fieldName] = result.data;
    } else {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  }

  return { isValid, errors, validData };
};