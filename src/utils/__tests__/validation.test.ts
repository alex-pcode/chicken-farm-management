/**
 * Unit tests for enhanced validation utilities with type guards
 */
import { describe, it, expect } from 'vitest';
import {
  // Enhanced validators
  validateStringField,
  validateNumberField,
  validatePositiveNumberField,
  validateNonNegativeNumberField,
  validateDateField,

  // Application-specific enhanced validators
  validateEggCountWithTypeGuards,
  validateExpenseAmountWithTypeGuards,
  validateBirdCountWithTypeGuards,
  validateFeedQuantityWithTypeGuards,
  validatePricePerUnitWithTypeGuards,

  // Utility functions
  convertToLegacyValidator,
  validateForm,
  
  // Legacy validators for comparison
  validateEggCount,
  validateExpenseAmount,
  validateBirdCount,
  validateFeedQuantity,
  validatePricePerUnit,
  
  // Basic validators
  validators,
} from '../validation';

describe('Enhanced String Validation', () => {
  describe('validateStringField', () => {
    it('should validate required strings correctly', () => {
      const validator = validateStringField('testField', true, 3, 10);
      
      // Valid strings
      expect(validator('hello').isValid).toBe(true);
      expect(validator('test').isValid).toBe(true);
      expect(validator('1234567890').isValid).toBe(true);
      
      // Invalid strings
      expect(validator('').isValid).toBe(false);
      expect(validator('hi').isValid).toBe(false); // Too short
      expect(validator('this is too long').isValid).toBe(false); // Too long
      expect(validator(null).isValid).toBe(false);
      expect(validator(undefined).isValid).toBe(false);
      expect(validator(123).isValid).toBe(false);
    });

    it('should handle optional strings correctly', () => {
      const validator = validateStringField('optionalField', false, 0, 10);
      
      // Valid cases
      expect(validator('').isValid).toBe(true);
      expect(validator(null).isValid).toBe(true);
      expect(validator(undefined).isValid).toBe(true);
      expect(validator('hello').isValid).toBe(true);
    });

    it('should return proper error messages', () => {
      const validator = validateStringField('testField', true, 3, 10);
      
      const requiredResult = validator('');
      expect(requiredResult.errors[0].type).toBe('required');
      expect(requiredResult.errors[0].message).toContain('required');
      
      const lengthResult = validator('hi');
      expect(lengthResult.errors[0].type).toBe('range');
      expect(lengthResult.errors[0].message).toContain('at least 3');
    });
  });
});

describe('Enhanced Number Validation', () => {
  describe('validateNumberField', () => {
    it('should validate numbers with range constraints', () => {
      const validator = validateNumberField('testField', true, 0, 100, true);
      
      // Valid numbers
      expect(validator(50).isValid).toBe(true);
      expect(validator(0).isValid).toBe(true);
      expect(validator(100).isValid).toBe(true);
      expect(validator(50.5).isValid).toBe(true);
      expect(validator('50').isValid).toBe(true); // String conversion
      
      // Invalid numbers
      expect(validator(-1).isValid).toBe(false); // Below min
      expect(validator(101).isValid).toBe(false); // Above max
      expect(validator('invalid').isValid).toBe(false);
      expect(validator(null).isValid).toBe(false);
    });

    it('should handle integer-only validation', () => {
      const validator = validateNumberField('intField', true, 0, 100, false);
      
      expect(validator(50).isValid).toBe(true);
      expect(validator(50.5).isValid).toBe(false);
    });

    it('should handle optional number fields', () => {
      const validator = validateNumberField('optionalField', false, 0, 100, true);
      
      expect(validator(null).isValid).toBe(true);
      expect(validator(undefined).isValid).toBe(true);
      expect(validator('').isValid).toBe(true);
      expect(validator(50).isValid).toBe(true);
    });
  });

  describe('validatePositiveNumberField', () => {
    it('should only accept positive numbers', () => {
      const validator = validatePositiveNumberField('positiveField');
      
      expect(validator(1).isValid).toBe(true);
      expect(validator(0.1).isValid).toBe(true);
      expect(validator(100).isValid).toBe(true);
      
      expect(validator(0).isValid).toBe(false);
      expect(validator(-1).isValid).toBe(false);
      expect(validator(-0.1).isValid).toBe(false);
    });
  });

  describe('validateNonNegativeNumberField', () => {
    it('should accept non-negative numbers', () => {
      const validator = validateNonNegativeNumberField('nonNegativeField');
      
      expect(validator(0).isValid).toBe(true);
      expect(validator(1).isValid).toBe(true);
      expect(validator(100).isValid).toBe(true);
      
      expect(validator(-1).isValid).toBe(false);
      expect(validator(-0.1).isValid).toBe(false);
    });
  });
});

describe('Enhanced Date Validation', () => {
  describe('validateDateField', () => {
    it('should validate date strings with range constraints', () => {
      const validator = validateDateField('dateField', true, '2023-01-01', '2023-12-31');
      
      // Valid dates
      expect(validator('2023-06-15').isValid).toBe(true);
      expect(validator('2023-01-01').isValid).toBe(true);
      expect(validator('2023-12-31').isValid).toBe(true);
      
      // Invalid dates
      expect(validator('2022-12-31').isValid).toBe(false); // Before min
      expect(validator('2024-01-01').isValid).toBe(false); // After max
      expect(validator('invalid-date').isValid).toBe(false);
      expect(validator('').isValid).toBe(false);
    });

    it('should handle optional date fields', () => {
      const validator = validateDateField('optionalDate', false);
      
      expect(validator('').isValid).toBe(true);
      expect(validator(null).isValid).toBe(true);
      expect(validator(undefined).isValid).toBe(true);
      expect(validator('2023-12-25').isValid).toBe(true);
    });
  });
});

describe('Application-Specific Enhanced Validators', () => {
  describe('validateEggCountWithTypeGuards', () => {
    it('should validate egg counts correctly', () => {
      expect(validateEggCountWithTypeGuards(0).isValid).toBe(true);
      expect(validateEggCountWithTypeGuards(10).isValid).toBe(true);
      expect(validateEggCountWithTypeGuards(100).isValid).toBe(true);
      
      expect(validateEggCountWithTypeGuards(-1).isValid).toBe(false);
      expect(validateEggCountWithTypeGuards(101).isValid).toBe(false);
      expect(validateEggCountWithTypeGuards(5.5).isValid).toBe(false); // Must be integer
      expect(validateEggCountWithTypeGuards('invalid').isValid).toBe(false);
    });
  });

  describe('validateExpenseAmountWithTypeGuards', () => {
    it('should validate expense amounts correctly', () => {
      expect(validateExpenseAmountWithTypeGuards(1).isValid).toBe(true);
      expect(validateExpenseAmountWithTypeGuards(25.99).isValid).toBe(true);
      expect(validateExpenseAmountWithTypeGuards(9999.99).isValid).toBe(true);
      
      expect(validateExpenseAmountWithTypeGuards(0).isValid).toBe(false); // Must be positive
      expect(validateExpenseAmountWithTypeGuards(-1).isValid).toBe(false);
      expect(validateExpenseAmountWithTypeGuards(10001).isValid).toBe(false); // Above max
      expect(validateExpenseAmountWithTypeGuards(1.999).isValid).toBe(false); // Too many decimals
    });
  });

  describe('validateBirdCountWithTypeGuards', () => {
    it('should validate bird counts correctly', () => {
      expect(validateBirdCountWithTypeGuards(0).isValid).toBe(true);
      expect(validateBirdCountWithTypeGuards(25).isValid).toBe(true);
      expect(validateBirdCountWithTypeGuards(1000).isValid).toBe(true);
      
      expect(validateBirdCountWithTypeGuards(-1).isValid).toBe(false);
      expect(validateBirdCountWithTypeGuards(1001).isValid).toBe(false);
      expect(validateBirdCountWithTypeGuards(5.5).isValid).toBe(false);
    });
  });

  describe('validateFeedQuantityWithTypeGuards', () => {
    it('should validate feed quantities correctly', () => {
      expect(validateFeedQuantityWithTypeGuards(0.1).isValid).toBe(true);
      expect(validateFeedQuantityWithTypeGuards(50).isValid).toBe(true);
      expect(validateFeedQuantityWithTypeGuards(9999.99).isValid).toBe(true);
      
      expect(validateFeedQuantityWithTypeGuards(0).isValid).toBe(false); // Must be positive
      expect(validateFeedQuantityWithTypeGuards(-1).isValid).toBe(false);
      expect(validateFeedQuantityWithTypeGuards(10001).isValid).toBe(false);
    });
  });

  describe('validatePricePerUnitWithTypeGuards', () => {
    it('should validate prices correctly', () => {
      expect(validatePricePerUnitWithTypeGuards(0).isValid).toBe(true); // Free items allowed
      expect(validatePricePerUnitWithTypeGuards(1.5).isValid).toBe(true);
      expect(validatePricePerUnitWithTypeGuards(999.9999).isValid).toBe(true);
      
      expect(validatePricePerUnitWithTypeGuards(-1).isValid).toBe(false);
      expect(validatePricePerUnitWithTypeGuards(1001).isValid).toBe(false);
      expect(validatePricePerUnitWithTypeGuards(1.99999).isValid).toBe(false); // Too many decimals
    });
  });
});

describe('Utility Functions', () => {
  describe('convertToLegacyValidator', () => {
    it('should convert type guard validators to legacy format', () => {
      const typeGuardValidator = validateEggCountWithTypeGuards;
      const legacyValidator = convertToLegacyValidator(typeGuardValidator);
      
      expect(legacyValidator(10)).toBe(null); // Valid returns null
      expect(typeof legacyValidator(-1)).toBe('string'); // Invalid returns string
    });

    it('should maintain validation logic in conversion', () => {
      const typeGuardValidator = validateStringField('test', true, 3, 10);
      const legacyValidator = convertToLegacyValidator(typeGuardValidator);
      
      expect(legacyValidator('hello')).toBe(null);
      expect(legacyValidator('hi')).toContain('at least 3');
    });
  });

  describe('validateForm', () => {
    it('should validate entire forms with multiple fields', () => {
      const formData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        count: 5
      };

      const validators = {
        name: validateStringField('name', true, 2, 50),
        age: validatePositiveNumberField('age', true, 150, false),
        email: validateStringField('email', true, 5, 100),
        count: validateNonNegativeNumberField('count', true, 100, false)
      };

      const result = validateForm(formData, validators);
      
      expect(result.isValid).toBe(true);
      expect(result.validData).toEqual({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        count: 5
      });
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should collect all validation errors', () => {
      const formData = {
        name: '',
        age: -5,
        email: 'x',
        count: 101
      };

      const validators = {
        name: validateStringField('name', true, 2, 50),
        age: validatePositiveNumberField('age', true, 150, false),
        email: validateStringField('email', true, 5, 100),
        count: validateNonNegativeNumberField('count', true, 100, false)
      };

      const result = validateForm(formData, validators);
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
      expect(result.validData).toEqual({});
    });

    it('should handle partial validation success', () => {
      const formData = {
        name: 'John',
        age: -5,
        email: 'john@example.com'
      };

      const validators = {
        name: validateStringField('name', true, 2, 50),
        age: validatePositiveNumberField('age', true, 150, false),
        email: validateStringField('email', true, 5, 100)
      };

      const result = validateForm(formData, validators);
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(1);
      expect(result.errors.age).toBeDefined();
      expect(result.validData).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });
  });
});

describe('Legacy Validator Compatibility', () => {
  it('should maintain backward compatibility with existing validators', () => {
    // Test that legacy validators still work
    expect(validateEggCount(10)).toBe(null);
    expect(validateEggCount(-1)).toContain('cannot be negative');
    
    expect(validateExpenseAmount(25.99)).toBe(null);
    expect(validateExpenseAmount(-1)).toContain('cannot be negative');
    
    expect(validateBirdCount(25)).toBe(null);
    expect(validateBirdCount(-1)).toContain('cannot be negative');
    
    expect(validateFeedQuantity(50)).toBe(null);
    expect(validateFeedQuantity(0)).toContain('must be greater than 0');
    
    expect(validatePricePerUnit(1.50)).toBe(null);
    expect(validatePricePerUnit(-1)).toContain('cannot be negative');
  });

  it('should have equivalent results between legacy and enhanced validators', () => {
    const testCases = [
      { value: 10, shouldBeValid: true },
      { value: 0, shouldBeValid: true },
      { value: -1, shouldBeValid: false },
      { value: 101, shouldBeValid: false },
      { value: 5.5, shouldBeValid: false },
    ];

    testCases.forEach(({ value, shouldBeValid }) => {
      const legacyResult = validateEggCount(value) === null;
      const enhancedResult = validateEggCountWithTypeGuards(value).isValid;
      
      expect(legacyResult).toBe(shouldBeValid);
      expect(enhancedResult).toBe(shouldBeValid);
      expect(legacyResult).toBe(enhancedResult);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should validate forms efficiently', () => {
    const largeFormData = Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`field${i}`, `value${i}`])
    );

    const validators = Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [
        `field${i}`, 
        validateStringField(`field${i}`, true, 1, 20)
      ])
    );

    const start = performance.now();
    const result = validateForm(largeFormData, validators);
    const end = performance.now();
    
    expect(result.isValid).toBe(true);
    expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
  });

  it('should convert validators efficiently', () => {
    const typeGuardValidators = Array.from({ length: 100 }, () => 
      validateStringField('test', true, 1, 10)
    );

    const start = performance.now();
    const legacyValidators = typeGuardValidators.map(convertToLegacyValidator);
    const end = performance.now();
    
    expect(legacyValidators).toHaveLength(100);
    expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
  });
});