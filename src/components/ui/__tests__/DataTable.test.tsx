import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, type TableColumn } from '../tables/DataTable';

// Mock framer-motion to avoid issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    tr: 'tr',
    div: 'div'
  }
}));

interface TestData {
  id: number;
  name: string;
  age: number;
  email: string;
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', age: 25, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 30, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];

const mockColumns: TableColumn<TestData>[] = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'email', label: 'Email' },
];

describe('DataTable Component', () => {
  it('renders data correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading={true} />);
    
    // Check for the loading spinner element
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty state with custom message', () => {
    const emptyMessage = 'No users found';
    render(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage={emptyMessage}
      />
    );
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it('handles sorting when enabled', () => {
    const mockOnSort = vi.fn();
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        sortable={true}
        onSort={mockOnSort}
      />
    );
    
    const ageHeader = screen.getByText('Age').closest('th');
    fireEvent.click(ageHeader!);
    
    expect(mockOnSort).toHaveBeenCalledWith('age', 'asc');
  });

  it('displays sort icons correctly', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        sortable={true}
        sortColumn="age"
        sortDirection="asc"
      />
    );
    
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders custom cell content', () => {
    const columnsWithCustomRender: TableColumn<TestData>[] = [
      { 
        key: 'name', 
        label: 'Name',
        render: (value, row) => <strong>{value} (ID: {row.id})</strong>
      },
      { key: 'age', label: 'Age' },
    ];
    
    render(<DataTable data={mockData} columns={columnsWithCustomRender} />);
    
    expect(screen.getByText('John Doe (ID: 1)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        className="custom-table"
      />
    );
    
    expect(container.querySelector('.custom-table')).toBeInTheDocument();
  });

  it('includes test id when provided', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        testId="test-data-table"
      />
    );
    
    expect(screen.getByTestId('test-data-table')).toBeInTheDocument();
  });
});