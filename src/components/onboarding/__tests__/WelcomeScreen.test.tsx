/**
 * WelcomeScreen Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WelcomeScreen } from '../WelcomeScreen';

const mockOnStartSetup = vi.fn();
const mockOnSkipToApp = vi.fn();

const defaultProps = {
  onStartSetup: mockOnStartSetup,
  onSkipToApp: mockOnSkipToApp
};

describe('WelcomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message and branding', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    expect(screen.getByText('Welcome to Chicken Manager')).toBeInTheDocument();
    expect(screen.getByText('Your complete solution for managing chickens and maximizing egg production')).toBeInTheDocument();
    expect(screen.getByText('🐔')).toBeInTheDocument();
  });

  it('displays value proposition cards', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    expect(screen.getByText('Track Production')).toBeInTheDocument();
    expect(screen.getByText('Manage Flocks')).toBeInTheDocument();
    expect(screen.getByText('Boost Profits')).toBeInTheDocument();
    
    expect(screen.getByText('Monitor daily egg collection, feed consumption, and expenses')).toBeInTheDocument();
    expect(screen.getByText('Organize birds by batches, track health events and lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Analyze costs, track sales, and optimize your operation')).toBeInTheDocument();
  });

  it('shows getting started message', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    expect(screen.getByText('Ready to get started?')).toBeInTheDocument();
    expect(screen.getByText(/Let's set up your flock in just a few simple steps/)).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    expect(screen.getByText('Set Up My Flock')).toBeInTheDocument();
    expect(screen.getByText('Skip for Now')).toBeInTheDocument();
  });

  it('shows help text', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    expect(screen.getByText(/Don't worry - you can always set up your flock later/)).toBeInTheDocument();
  });

  it('calls onStartSetup when setup button is clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    const setupButton = screen.getByText('Set Up My Flock');
    fireEvent.click(setupButton);
    
    expect(mockOnStartSetup).toHaveBeenCalledTimes(1);
  });

  it('calls onSkipToApp when skip button is clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip for Now');
    fireEvent.click(skipButton);
    
    expect(mockOnSkipToApp).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <WelcomeScreen {...defaultProps} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('has proper accessibility attributes', () => {
    render(<WelcomeScreen {...defaultProps} />);
    
    const setupButton = screen.getByText('Set Up My Flock');
    const skipButton = screen.getByText('Skip for Now');
    
    expect(setupButton).toHaveAttribute('type', 'button');
    expect(skipButton).toHaveAttribute('type', 'button');
  });
});