import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertDialog } from '../modals/AlertDialog';

describe('AlertDialog Component', () => {
  it('renders info variant correctly', () => {
    render(
      <AlertDialog
        isOpen={true}
        onClose={() => {}}
        title="Information"
        message="This is an info message"
        variant="info"
      />
    );
    
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('This is an info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('renders success variant correctly', () => {
    render(
      <AlertDialog
        isOpen={true}
        onClose={() => {}}
        title="Success"
        message="Operation completed successfully"
        variant="success"
      />
    );
    
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders warning variant correctly', () => {
    render(
      <AlertDialog
        isOpen={true}
        onClose={() => {}}
        title="Warning"
        message="Please be careful"
        variant="warning"
      />
    );
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders error variant correctly', () => {
    render(
      <AlertDialog
        isOpen={true}
        onClose={() => {}}
        title="Error"
        message="Something went wrong"
        variant="error"
      />
    );
    
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockClose = vi.fn();
    render(
      <AlertDialog
        isOpen={true}
        onClose={mockClose}
        title="Test"
        message="Test message"
        variant="info"
      />
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <AlertDialog
        isOpen={false}
        onClose={() => {}}
        title="Hidden"
        message="This should not be visible"
        variant="info"
      />
    );
    
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('includes test id when provided', () => {
    render(
      <AlertDialog
        isOpen={true}
        onClose={() => {}}
        title="Test"
        message="Test"
        variant="info"
        testId="test-alert-dialog"
      />
    );
    
    expect(screen.getByTestId('test-alert-dialog')).toBeInTheDocument();
  });
});