import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaginationControls } from '../navigation/PaginationControls';

// Mock the pagination hook
vi.mock('../../../hooks/pagination/usePagination', () => ({
  usePagination: () => ({
    currentPage: 1,
    totalPages: 5,
    pageSize: 10,
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    isFirstPage: true,
    isLastPage: false,
    startIndex: 0,
    endIndex: 9,
    paginatedItems: vi.fn((items) => items.slice(0, 10)),
  }),
}));

describe('PaginationControls Component', () => {
  it('renders pagination info by default', () => {
    render(<PaginationControls totalItems={100} />);
    
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText(/results/i)).toBeInTheDocument();
  });

  it('renders page size selector by default', () => {
    render(<PaginationControls totalItems={100} />);
    
    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByText('per page')).toBeInTheDocument();
  });

  it('renders pagination navigation', () => {
    render(<PaginationControls totalItems={100} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('hides pagination info when showPaginationInfo is false', () => {
    render(<PaginationControls totalItems={100} showPaginationInfo={false} />);
    
    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
  });

  it('hides page size selector when showPageSizeSelector is false', () => {
    render(<PaginationControls totalItems={100} showPageSizeSelector={false} />);
    
    expect(screen.queryByText('Show')).not.toBeInTheDocument();
    expect(screen.queryByText('per page')).not.toBeInTheDocument();
  });

  it('calls onPageSizeChange when page size changes', () => {
    const mockPageSizeChange = vi.fn();
    render(
      <PaginationControls 
        totalItems={100} 
        onPageSizeChange={mockPageSizeChange}
      />
    );
    
    const select = screen.getByDisplayValue('10');
    fireEvent.change(select, { target: { value: '25' } });
    
    expect(mockPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('applies compact variant styling', () => {
    const { container } = render(
      <PaginationControls totalItems={100} variant="compact" />
    );
    
    const paginationContainer = container.firstChild as HTMLElement;
    expect(paginationContainer).toHaveClass('flex', 'items-center', 'justify-between', 'gap-4');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PaginationControls totalItems={100} className="custom-pagination" />
    );
    
    const paginationContainer = container.firstChild as HTMLElement;
    expect(paginationContainer).toHaveClass('custom-pagination');
  });

  it('includes test id when provided', () => {
    render(
      <PaginationControls 
        totalItems={100} 
        testId="test-pagination-controls"
      />
    );
    
    expect(screen.getByTestId('test-pagination-controls')).toBeInTheDocument();
  });

  it('passes pagination options correctly', () => {
    render(
      <PaginationControls 
        totalItems={100}
        paginationOptions={{ initialPage: 2, pageSize: 20 }}
      />
    );
    
    // Test passes if component renders without error with custom pagination options
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });
});