import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatCard } from '../cards/StatCard';

describe('StatCard Component', () => {
  it('renders basic stat card correctly', () => {
    render(
      <StatCard 
        title="Total Users"
        total={1234}
        label="active users"
      />
    );
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('active users')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<StatCard title="Test" total={0} loading={true} />);
    
    // Check for the loading skeleton
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('displays change percentage with correct styling', () => {
    render(
      <StatCard 
        title="Revenue"
        total="$12,345"
        change={15.5}
        changeType="increase"
      />
    );
    
    const changeElement = screen.getByText('+15.5%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('text-green-600');
  });

  it('displays decrease change correctly', () => {
    render(
      <StatCard 
        title="Sales"
        total={100}
        change={-5.2}
        changeType="decrease"
      />
    );
    
    const changeElement = screen.getByText('-5.2%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('text-red-600');
  });

  it('shows trend icons', () => {
    render(
      <StatCard 
        title="Growth"
        total={50}
        trend="up"
      />
    );
    
    expect(screen.getByText('📈')).toBeInTheDocument();
  });

  it('handles click events when onClick is provided', () => {
    const mockClick = vi.fn();
    render(
      <StatCard 
        title="Clickable Card"
        total={42}
        onClick={mockClick}
      />
    );
    
    const card = screen.getByText('Clickable Card').closest('div');
    fireEvent.click(card!);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('displays icon when provided', () => {
    render(
      <StatCard 
        title="Users"
        total={100}
        icon="👥"
      />
    );
    
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { container } = render(
      <StatCard 
        title="Compact Card"
        total={25}
        variant="compact"
      />
    );
    
    expect(container.firstChild).toHaveClass('bg-white', 'rounded-lg', 'p-4', 'border');
  });

  it('renders React node as label', () => {
    const customLabel = <span className="custom-label">Custom Label</span>;
    render(
      <StatCard 
        title="Custom"
        total={99}
        label={customLabel}
      />
    );
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom Label')).toHaveClass('custom-label');
  });

  it('includes test id when provided', () => {
    render(
      <StatCard 
        title="Test Card"
        total={123}
        testId="test-stat-card"
      />
    );
    
    expect(screen.getByTestId('test-stat-card')).toBeInTheDocument();
  });
});