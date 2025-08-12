import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextInput } from '../TextInput';
import type { ValidationError } from '../../../types';

describe('TextInput', () => {
  it('renders with label and input', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Test Label"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required asterisk when required prop is true', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Required Field"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error messages when errors are provided', () => {
    const mockOnChange = vi.fn();
    const errors: ValidationError[] = [
      { field: 'required_field', message: 'This field is required', type: 'required' }
    ];
    
    render(
      <TextInput
        id="required_field"
        label="Required Field"
        value=""
        onChange={mockOnChange}
        errors={errors}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Test Label"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('applies correct input type', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Email"
        value=""
        onChange={mockOnChange}
        type="email"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('disables input when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Disabled Field"
        value=""
        onChange={mockOnChange}
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('sets placeholder text', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TextInput
        label="Test Label"
        value=""
        onChange={mockOnChange}
        placeholder="Enter text here"
      />
    );

    const input = screen.getByPlaceholderText('Enter text here');
    expect(input).toBeInTheDocument();
  });

  it('matches field errors by field name when id is not provided', () => {
    const mockOnChange = vi.fn();
    const errors: ValidationError[] = [
      { field: 'test_label', message: 'Field error', type: 'invalid' }
    ];
    
    render(
      <TextInput
        label="Test Label"
        value=""
        onChange={mockOnChange}
        errors={errors}
      />
    );

    expect(screen.getByText('Field error')).toBeInTheDocument();
  });
});