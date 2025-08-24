/**
 * Simplified Type Guards and Runtime Validation Utilities
 * 
 * This is a working implementation that avoids TypeScript assertion issues
 * while providing comprehensive runtime validation.
 */

import type {
  EggEntry,
  Expense,
  FeedEntry,
  FlockProfile,
  FlockEvent,
  Customer,
  Sale,
  ValidationError,
  ApiResponse,
  ApiErrorData
} from '../types';

/* ===== BASIC TYPE UTILITIES ===== */

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && isFinite(value);
};

export const isPositiveNumber = (value: unknown): value is number => {
  return isValidNumber(value) && value > 0;
};

export const isNonNegativeNumber = (value: unknown): value is number => {
  return isValidNumber(value) && value >= 0;
};

export const isValidDateString = (value: unknown): value is string => {
  if (!isValidString(value)) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

/* ===== VALIDATION ERROR UTILITIES ===== */

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

export const createValidationError = (
  field: string, 
  message: string, 
  type: ValidationError['type'] = 'invalid'
): ValidationError => ({
  field,
  message,
  type
});

export const createValidResult = <T>(data: T): ValidationResult<T> => ({
  isValid: true,
  data,
  errors: []
});

export const createInvalidResult = <T>(errors: ValidationError[]): ValidationResult<T> => ({
  isValid: false,
  errors
});

/* ===== CORE DATA TYPE GUARDS ===== */

export const isEggEntry = (value: unknown): value is EggEntry => {
  if (!isObject(value)) return false;
  
  return (
    'id' in value &&
    'date' in value &&
    'count' in value &&
    isValidString(value.id) &&
    isValidDateString(value.date) &&
    isNonNegativeNumber(value.count)
  );
};

export const isExpense = (value: unknown): value is Expense => {
  if (!isObject(value)) return false;
  
  return (
    'date' in value &&
    'category' in value &&
    'description' in value &&
    'amount' in value &&
    isValidDateString(value.date) &&
    isValidString(value.category) &&
    isValidString(value.description) &&
    isPositiveNumber(value.amount)
  );
};

export const isFeedEntry = (value: unknown): value is FeedEntry => {
  if (!isObject(value)) return false;
  
  const validUnits = ['kg', 'lbs'];
  
  console.log('[isFeedEntry] Validating:', value);
  
  const hasRequiredFields = (
    'id' in value &&
    'brand' in value &&
    'type' in value &&
    'quantity' in value &&
    'unit' in value &&
    'openedDate' in value &&
    'pricePerUnit' in value
  );
  
  console.log('[isFeedEntry] Required fields check:', {
    hasId: 'id' in value,
    hasBrand: 'brand' in value,
    hasType: 'type' in value,
    hasQuantity: 'quantity' in value,
    hasUnit: 'unit' in value,
    hasOpenedDate: 'openedDate' in value,
    hasPricePerUnit: 'pricePerUnit' in value,
    openedDateValue: value.openedDate,
    pricePerUnitValue: value.pricePerUnit
  });
  
  if (!hasRequiredFields) return false;
  
  const validTypes = (
    isValidString(value.id) &&
    isValidString(value.brand) &&
    isValidString(value.type) &&
    isPositiveNumber(value.quantity) &&
    typeof value.unit === 'string' &&
    validUnits.includes(value.unit) &&
    isValidDateString(value.openedDate) &&
    isNonNegativeNumber(value.pricePerUnit)
  );
  
  console.log('[isFeedEntry] Type validation:', {
    validId: isValidString(value.id),
    validBrand: isValidString(value.brand),
    validType: isValidString(value.type),
    validQuantity: isPositiveNumber(value.quantity),
    validUnit: typeof value.unit === 'string' && validUnits.includes(value.unit),
    validOpenedDate: isValidDateString(value.openedDate),
    validPricePerUnit: isNonNegativeNumber(value.pricePerUnit)
  });
  
  return validTypes &&
    (typeof value.depletedDate === 'undefined' || value.depletedDate === null || isValidDateString(value.depletedDate)) &&
    (typeof value.batchNumber === 'undefined' || value.batchNumber === null || isValidString(value.batchNumber)) &&
    (typeof value.description === 'undefined' || value.description === null || isValidString(value.description));
};

export const isFlockEvent = (value: unknown): value is FlockEvent => {
  if (!isObject(value)) return false;
  
  const validTypes = ['acquisition', 'laying_start', 'broody', 'hatching', 'other'];
  
  return (
    'id' in value &&
    'date' in value &&
    'type' in value &&
    'description' in value &&
    isValidString(value.id) &&
    isValidDateString(value.date) &&
    typeof value.type === 'string' &&
    validTypes.includes(value.type) &&
    isValidString(value.description)
  );
};

export const isFlockProfile = (value: unknown): value is FlockProfile => {
  if (!isObject(value)) return false;
  
  return (
    'hens' in value &&
    'roosters' in value &&
    'chicks' in value &&
    'lastUpdated' in value &&
    'breedTypes' in value &&
    'events' in value &&
    'brooding' in value &&
    isNonNegativeNumber(value.hens) &&
    isNonNegativeNumber(value.roosters) &&
    isNonNegativeNumber(value.chicks) &&
    isValidString(value.lastUpdated) &&
    Array.isArray(value.breedTypes) &&
    Array.isArray(value.events) &&
    isNonNegativeNumber(value.brooding)
  );
};

export const isCustomer = (value: unknown): value is Customer => {
  if (!isObject(value)) return false;
  
  return (
    'id' in value &&
    'user_id' in value &&
    'name' in value &&
    'created_at' in value &&
    'is_active' in value &&
    isValidString(value.id) &&
    isValidString(value.user_id) &&
    isValidString(value.name) &&
    isValidString(value.created_at) &&
    typeof value.is_active === 'boolean'
  );
};

export const isSale = (value: unknown): value is Sale => {
  if (!isObject(value)) return false;
  
  return (
    'id' in value &&
    'user_id' in value &&
    'customer_id' in value &&
    'sale_date' in value &&
    'dozen_count' in value &&
    'individual_count' in value &&
    'total_amount' in value &&
    'created_at' in value &&
    isValidString(value.id) &&
    isValidString(value.user_id) &&
    isValidString(value.customer_id) &&
    isValidDateString(value.sale_date) &&
    isNonNegativeNumber(value.dozen_count) &&
    isNonNegativeNumber(value.individual_count) &&
    isNonNegativeNumber(value.total_amount) &&
    isValidString(value.created_at)
  );
};

/* ===== API RESPONSE TYPE GUARDS ===== */

export const isApiErrorData = (value: unknown): value is ApiErrorData => {
  if (!isObject(value)) return false;
  
  return (
    'code' in value &&
    'message' in value &&
    isValidString(value.code) &&
    isValidString(value.message)
  );
};

export const isApiResponse = <T>(
  value: unknown,
  dataGuard?: (data: unknown) => data is T
): value is ApiResponse<T> => {
  if (!isObject(value)) return false;
  
  // Handle both response formats:
  // 1. {success: boolean, data: T, error?: ApiErrorData} - TypeScript interface
  // 2. {message: string, data: T, timestamp: string} - Actual API response
  
  const hasSuccessFormat = 'success' in value && typeof value.success === 'boolean';
  const hasMessageFormat = 'message' in value && 'timestamp' in value &&
    typeof value.message === 'string' && typeof value.timestamp === 'string';
  
  if (!hasSuccessFormat && !hasMessageFormat) {
    return false;
  }
  
  // For message format, we need to transform it to ApiResponse format
  // The BaseApiService will handle this transformation
  if (hasMessageFormat) {
    // If data guard is provided and data exists, validate the data
    if (dataGuard && 'data' in value && value.data !== undefined) {
      return dataGuard(value.data);
    }
    return true;
  }
  
  // For success format, validate normally
  if (dataGuard && 'data' in value && value.data !== undefined) {
    return dataGuard(value.data);
  }
  
  return true;
};

/* ===== ARRAY VALIDATION UTILITIES ===== */

export const isArrayOf = <T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] => {
  if (!Array.isArray(value)) return false;
  return value.every(item => itemGuard(item));
};

export const isEggEntryArray = (value: unknown): value is EggEntry[] => {
  return isArrayOf(value, isEggEntry);
};

export const isExpenseArray = (value: unknown): value is Expense[] => {
  return isArrayOf(value, isExpense);
};

export const isFeedEntryArray = (value: unknown): value is FeedEntry[] => {
  return isArrayOf(value, isFeedEntry);
};

export const isFlockEventArray = (value: unknown): value is FlockEvent[] => {
  return isArrayOf(value, isFlockEvent);
};

/* ===== COMPREHENSIVE VALIDATION FUNCTIONS ===== */

export const validateWithDetails = <T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  typeName: string
): ValidationResult<T> => {
  if (guard(value)) {
    return createValidResult(value);
  }
  
  return createInvalidResult([
    createValidationError(
      'data', 
      `Invalid ${typeName} format or missing required fields`, 
      'invalid'
    )
  ]);
};

export const validateEggEntry = (value: unknown): ValidationResult<EggEntry> => {
  return validateWithDetails(value, isEggEntry, 'EggEntry');
};

export const validateExpense = (value: unknown): ValidationResult<Expense> => {
  return validateWithDetails(value, isExpense, 'Expense');
};

export const validateCustomer = (value: unknown): ValidationResult<Customer> => {
  return validateWithDetails(value, isCustomer, 'Customer');
};

export const validateSale = (value: unknown): ValidationResult<Sale> => {
  return validateWithDetails(value, isSale, 'Sale');
};