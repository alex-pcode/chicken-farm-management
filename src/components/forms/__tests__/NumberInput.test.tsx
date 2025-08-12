import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NumberInput } from '../NumberInput';
import type { ValidationError } from '../../../types';

describe('NumberInput', () => {
  it('renders with label and number input', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Test Number"
        value={0}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Test Number')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('calls onChange with parsed number value', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Count"
        value={0}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '42' } });

    expect(mockOnChange).toHaveBeenCalledWith(42);
  });

  it('handles empty string input as 0', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Count"
        value={5}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('applies min and max constraints', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Count"
        value={5}
        onChange={mockOnChange}
        min={1}
        max={10}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '10');
  });

  it('displays error messages', () => {
    const mockOnChange = vi.fn();
    const errors: ValidationError[] = [
      { field: 'count', message: 'Must be a positive number', type: 'invalid' }
    ];
    
    render(
      <NumberInput
        id="count"
        label="Count"
        value={-1}
        onChange={mockOnChange}
        errors={errors}
      />
    );

    expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
  });

  it('hides spinner when showSpinner is false', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Count"
        value={0}
        onChange={mockOnChange}
        showSpinner={false}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass('[appearance:textfield]');
  });

  it('handles decimal numbers correctly', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Price"
        value={0}
        onChange={mockOnChange}
        step={0.01}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '19.99' } });

    expect(mockOnChange).toHaveBeenCalledWith(19.99);
  });

  it('handles invalid number input by converting to 0', () => {
    const mockOnChange = vi.fn();
    
    render(
      <NumberInput
        label="Count"
        value={5}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    // HTML number inputs typically convert invalid text to empty string
    fireEvent.change(input, { target: { value: '' } });

    // Empty string should be converted to 0
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });
});