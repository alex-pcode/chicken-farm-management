/**
 * Comprehensive unit tests for type guards and validation utilities
 */
import { describe, it, expect } from 'vitest';
import {
  // Basic type utilities
  isObject,
  isValidString,
  isValidNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidDateString,

  // Validation error utilities
  createValidationError,

  // Core data type guards
  isEggEntry,
  isExpense,
  isFlockEvent,
  isFlockProfile,

  // CRM type guards
  isCustomer,
  isSale,

  // API type guards
  isApiErrorData,
  isApiResponse,

  // Array validation utilities
  isArrayOf,
  isEggEntryArray,
  isExpenseArray,

  // Validation result utilities
  createValidResult,
  createInvalidResult,
  validateWithDetails,

  // Comprehensive validation functions
  validateEggEntry,
  validateExpense,
  validateCustomer,
  validateSale,
} from '../typeGuards';

describe('Basic Type Utilities', () => {
  describe('isObject', () => {
    it('should return true for valid objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject({ a: 1, b: 2 })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe('isValidString', () => {
    it('should return true for valid non-empty strings', () => {
      expect(isValidString('hello')).toBe(true);
      expect(isValidString('123')).toBe(true);
      expect(isValidString('  valid  ')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isValidString('')).toBe(false);
      expect(isValidString('   ')).toBe(false);
      expect(isValidString(null)).toBe(false);
      expect(isValidString(undefined)).toBe(false);
      expect(isValidString(123)).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(1)).toBe(true);
      expect(isValidNumber(-1)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
      expect(isValidNumber('123')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
      expect(isPositiveNumber(100)).toBe(true);
    });

    it('should return false for non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.1)).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    it('should return true for non-negative numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(1)).toBe(true);
      expect(isNonNegativeNumber(0.1)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
      expect(isNonNegativeNumber(-0.1)).toBe(false);
      expect(isNonNegativeNumber(NaN)).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('should return true for valid date strings', () => {
      expect(isValidDateString('2023-12-25')).toBe(true);
      expect(isValidDateString('2023-01-01T00:00:00Z')).toBe(true);
      expect(isValidDateString('December 25, 2023')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
      expect(isValidDateString('2023-13-45')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(123)).toBe(false);
    });
  });

});

describe('Validation Error Utilities', () => {
  describe('createValidationError', () => {
    it('should create valid ValidationError objects', () => {
      const error = createValidationError('testField', 'Test message', 'required');
      expect(error).toEqual({
        field: 'testField',
        message: 'Test message',
        type: 'required'
      });
    });
  });
});

describe('Core Data Type Guards', () => {
  describe('isEggEntry', () => {
    it('should return true for valid EggEntry objects', () => {
      const validEntry = {
        id: 'valid-id',
        date: '2023-12-25',
        count: 10
      };
      expect(isEggEntry(validEntry)).toBe(true);
    });

    it('should return false for invalid EggEntry objects', () => {
      expect(isEggEntry({})).toBe(false);
      expect(isEggEntry({ id: '', date: '2023-12-25', count: 10 })).toBe(false);
      expect(isEggEntry({ id: 'valid-id', date: 'invalid-date', count: 10 })).toBe(false);
      expect(isEggEntry({ id: 'valid-id', date: '2023-12-25', count: -1 })).toBe(false);
    });
  });

  describe('isExpense', () => {
    it('should return true for valid Expense objects', () => {
      const validExpense = {
        date: '2023-12-25',
        category: 'feed',
        description: 'Chicken feed',
        amount: 25.99
      };
      expect(isExpense(validExpense)).toBe(true);
    });

    it('should return false for invalid Expense objects', () => {
      expect(isExpense({})).toBe(false);
      expect(isExpense({ date: 'invalid', category: 'feed', description: 'test', amount: 10 })).toBe(false);
      expect(isExpense({ date: '2023-12-25', category: '', description: 'test', amount: 10 })).toBe(false);
      expect(isExpense({ date: '2023-12-25', category: 'feed', description: 'test', amount: 0 })).toBe(false);
    });
  });


  describe('isFlockEvent', () => {
    it('should return true for valid FlockEvent objects', () => {
      const validEvent = {
        id: 'valid-id',
        date: '2023-12-25',
        type: 'acquisition' as const,
        description: 'Bought new chickens'
      };
      expect(isFlockEvent(validEvent)).toBe(true);
    });

    it('should return false for invalid FlockEvent objects', () => {
      expect(isFlockEvent({})).toBe(false);
      expect(isFlockEvent({ id: 'valid', date: '2023-12-25', type: 'invalid_type', description: 'test' })).toBe(false);
    });
  });
});

describe('CRM Type Guards', () => {
  describe('isCustomer', () => {
    it('should return true for valid Customer objects', () => {
      const validCustomer = {
        id: 'valid-id',
        user_id: 'valid-user-id',
        name: 'John Doe',
        created_at: '2023-12-25T00:00:00Z',
        is_active: true
      };
      expect(isCustomer(validCustomer)).toBe(true);
    });

    it('should return false for invalid Customer objects', () => {
      expect(isCustomer({})).toBe(false);
      expect(isCustomer({ id: '', user_id: 'test', name: 'John', created_at: '2023-12-25', is_active: true })).toBe(false);
    });
  });

  describe('isSale', () => {
    it('should return true for valid Sale objects', () => {
      const validSale = {
        id: 'valid-id',
        user_id: 'valid-user-id',
        customer_id: 'valid-customer-id',
        sale_date: '2023-12-25',
        dozen_count: 2,
        individual_count: 0,
        total_amount: 12.00,
        created_at: '2023-12-25T00:00:00Z'
      };
      expect(isSale(validSale)).toBe(true);
    });

    it('should return false for invalid Sale objects', () => {
      expect(isSale({})).toBe(false);
      expect(isSale({ id: '', user_id: 'test', customer_id: 'test', sale_date: 'invalid', dozen_count: 2, individual_count: 0, total_amount: 12, created_at: '2023-12-25' })).toBe(false);
    });
  });
});

describe('API Type Guards', () => {
  describe('isApiErrorData', () => {
    it('should return true for valid ApiErrorData objects', () => {
      const validError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      };
      expect(isApiErrorData(validError)).toBe(true);
    });

    it('should return false for invalid ApiErrorData objects', () => {
      expect(isApiErrorData({})).toBe(false);
      expect(isApiErrorData({ code: 'TEST' })).toBe(false);
    });
  });

  describe('isApiResponse', () => {
    it('should return true for valid ApiResponse objects with success format', () => {
      const validResponse = {
        success: true,
        data: { test: 'data' }
      };
      expect(isApiResponse(validResponse)).toBe(true);
    });

    it('should return true for valid ApiResponse objects with message format', () => {
      const validResponse = {
        message: 'Data fetched successfully',
        data: { test: 'data' },
        timestamp: '2025-08-11T18:24:08.403Z'
      };
      expect(isApiResponse(validResponse)).toBe(true);
    });

    it('should return false for invalid ApiResponse objects', () => {
      expect(isApiResponse({})).toBe(false);
      expect(isApiResponse({ success: 'true' })).toBe(false);
      expect(isApiResponse({ message: 'test' })).toBe(false); // missing data and timestamp
    });

    it('should validate data with provided data guard', () => {
      const validSuccessResponse = {
        success: true,
        data: 'test string'
      };
      
      const validMessageResponse = {
        message: 'Data fetched successfully',
        data: 'test string',
        timestamp: '2025-08-11T18:24:08.403Z'
      };
      
      const stringGuard = (data: unknown): data is string => typeof data === 'string';
      
      expect(isApiResponse(validSuccessResponse, stringGuard)).toBe(true);
      expect(isApiResponse(validMessageResponse, stringGuard)).toBe(true);
      expect(isApiResponse({ success: true, data: 123 }, stringGuard)).toBe(false);
      expect(isApiResponse({ message: 'test', data: 123, timestamp: '2025-08-11T18:24:08.403Z' }, stringGuard)).toBe(false);
    });
  });
});

describe('Array Validation Utilities', () => {
  describe('isArrayOf', () => {
    it('should return true for valid arrays with matching items', () => {
      const stringGuard = (item: unknown): item is string => typeof item === 'string';
      expect(isArrayOf(['a', 'b', 'c'], stringGuard)).toBe(true);
      expect(isArrayOf([], stringGuard)).toBe(true);
    });

    it('should return false for invalid arrays or non-matching items', () => {
      const stringGuard = (item: unknown): item is string => typeof item === 'string';
      expect(isArrayOf('not an array', stringGuard)).toBe(false);
      expect(isArrayOf(['a', 1, 'c'], stringGuard)).toBe(false);
    });
  });

  describe('isEggEntryArray', () => {
    it('should return true for valid EggEntry arrays', () => {
      const validEntries = [
        { id: 'entry-1', date: '2023-12-25', count: 10 },
        { id: 'entry-2', date: '2023-12-26', count: 12 }
      ];
      expect(isEggEntryArray(validEntries)).toBe(true);
      expect(isEggEntryArray([])).toBe(true);
    });

    it('should return false for invalid arrays', () => {
      expect(isEggEntryArray('not an array')).toBe(false);
      expect(isEggEntryArray([{ invalid: 'object' }])).toBe(false);
    });
  });
});

describe('Validation Result Utilities', () => {
  describe('createValidResult', () => {
    it('should create valid ValidationResult objects', () => {
      const result = createValidResult('test data');
      expect(result).toEqual({
        isValid: true,
        data: 'test data',
        errors: []
      });
    });
  });

  describe('createInvalidResult', () => {
    it('should create invalid ValidationResult objects', () => {
      const errors = [createValidationError('field', 'message', 'invalid')];
      const result = createInvalidResult(errors);
      expect(result).toEqual({
        isValid: false,
        errors
      });
    });
  });

  describe('validateWithDetails', () => {
    it('should return valid result for valid data', () => {
      const stringGuard = (data: unknown): data is string => typeof data === 'string';
      const result = validateWithDetails('test', stringGuard, 'String');
      
      expect(result.isValid).toBe(true);
      expect(result.data).toBe('test');
      expect(result.errors).toEqual([]);
    });

    it('should return invalid result for invalid data', () => {
      const stringGuard = (data: unknown): data is string => typeof data === 'string';
      const result = validateWithDetails(123, stringGuard, 'String');
      
      expect(result.isValid).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid String format');
    });
  });
});

describe('Comprehensive Validation Functions', () => {
  describe('validateEggEntry', () => {
    it('should validate valid egg entries', () => {
      const validEntry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2023-12-25',
        count: 10
      };
      const result = validateEggEntry(validEntry);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validEntry);
    });

    it('should reject invalid egg entries', () => {
      const result = validateEggEntry({ invalid: 'data' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('validateExpense', () => {
    it('should validate valid expenses', () => {
      const validExpense = {
        date: '2023-12-25',
        category: 'feed',
        description: 'Chicken feed',
        amount: 25.99
      };
      const result = validateExpense(validExpense);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validExpense);
    });

    it('should reject invalid expenses', () => {
      const result = validateExpense({ invalid: 'data' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('validateCustomer', () => {
    it('should validate valid customers', () => {
      const validCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '456e7890-e12b-34c5-d678-901234567890',
        name: 'John Doe',
        created_at: '2023-12-25T00:00:00Z',
        is_active: true
      };
      const result = validateCustomer(validCustomer);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validCustomer);
    });

    it('should reject invalid customers', () => {
      const result = validateCustomer({ invalid: 'data' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});

describe('Performance Tests', () => {
  it('should validate large arrays efficiently', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: `123e4567-e89b-12d3-a456-42661417${i.toString().padStart(4, '0')}`,
      date: '2023-12-25',
      count: i
    }));

    const start = performance.now();
    const result = isEggEntryArray(largeArray);
    const end = performance.now();
    
    expect(result).toBe(true);
    expect(end - start).toBeLessThan(50); // Should complete in less than 50ms
  });

  it('should validate complex objects efficiently', () => {
    const complexObject = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      hens: 25,
      roosters: 2,
      chicks: 10,
      lastUpdated: '2023-12-25T00:00:00Z',
      breedTypes: ['Rhode Island Red', 'Buff Orpington'],
      events: Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        date: '2023-12-25',
        type: 'acquisition' as const,
        description: `Event ${i}`
      })),
      brooding: 0
    };

    const start = performance.now();
    const result = isFlockProfile(complexObject);
    const end = performance.now();
    
    expect(result).toBe(true);
    expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
  });
});