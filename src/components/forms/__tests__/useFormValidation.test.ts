import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { validators } from '../../../utils/validation';

describe('useFormValidation', () => {
  it('validates required fields correctly', () => {
    const rules = [
      { field: 'name', validator: validators.required(), required: true },
      { field: 'email', validator: validators.email(), required: true }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      const isValid = result.current.validate({ name: '', email: 'test@example.com' });
      expect(isValid).toBe(false);
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].field).toBe('name');
    expect(result.current.errors[0].type).toBe('required');
  });

  it('runs custom validators correctly', () => {
    const rules = [
      { 
        field: 'age', 
        validator: (value: number) => value < 18 ? 'Must be 18 or older' : null,
        required: true 
      }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      const isValid = result.current.validate({ age: 16 });
      expect(isValid).toBe(false);
    });

    expect(result.current.errors[0].message).toBe('Must be 18 or older');
  });

  it('validates individual fields', () => {
    const rules = [
      { field: 'email', validator: validators.email(), required: false }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      result.current.validateField('email', 'invalid-email');
    });

    expect(result.current.hasFieldError('email')).toBe(true);
    expect(result.current.getFieldErrors('email')).toHaveLength(1);
  });

  it('clears errors correctly', () => {
    const rules = [
      { field: 'name', validator: validators.required(), required: true },
      { field: 'email', validator: validators.email(), required: true }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      result.current.validate({ name: '', email: 'invalid' });
    });

    expect(result.current.errors).toHaveLength(2);

    act(() => {
      result.current.clearErrors(['name']);
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].field).toBe('email');

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toHaveLength(0);
  });

  it('adds custom errors', () => {
    const rules: any[] = [];
    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      result.current.addError('custom', 'Custom error message', 'invalid');
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toBe('Custom error message');
    expect(result.current.errors[0].type).toBe('invalid');
  });

  it('handles form data context in validators', () => {
    const rules = [
      { 
        field: 'confirmPassword', 
        validator: (value: string, formData?: Record<string, any>) => {
          if (formData?.password !== value) {
            return 'Passwords do not match';
          }
          return null;
        },
        required: true 
      }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      const isValid = result.current.validate({ 
        password: 'secret123',
        confirmPassword: 'secret456'
      });
      expect(isValid).toBe(false);
    });

    expect(result.current.errors[0].message).toBe('Passwords do not match');
  });

  it('skips validation for empty optional fields', () => {
    const rules = [
      { field: 'optional', validator: validators.minLength(5), required: false }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    act(() => {
      const isValid = result.current.validate({ optional: '' });
      expect(isValid).toBe(true);
    });

    expect(result.current.errors).toHaveLength(0);
  });

  it('returns correct isValid state', () => {
    const rules = [
      { field: 'name', validator: validators.required(), required: true }
    ];

    const { result } = renderHook(() => useFormValidation({ rules }));

    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.addError('name', 'Error message');
    });

    expect(result.current.isValid).toBe(false);
  });
});