/**
 * OnboardingWizard Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../OnboardingWizard';

const mockOnComplete = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onComplete: mockOnComplete,
  onBack: mockOnBack
};

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial assessment step', () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    expect(screen.getByText('Do you currently have chickens?')).toBeInTheDocument();
    expect(screen.getByText('Yes, I have chickens')).toBeInTheDocument();
    expect(screen.getByText('No, not yet')).toBeInTheDocument();
  });

  it('shows correct step progress', () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('proceeds to details step when user has chickens', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Click "Yes, I have chickens"
    fireEvent.click(screen.getByText('Yes, I have chickens'));
    
    // Click Next
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Tell us about your flock')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });
  });

  it('proceeds directly to confirmation when user has no chickens', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Click "No, not yet"
    fireEvent.click(screen.getByText('No, not yet'));
    
    // Click Next
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Ready to set up your flock!')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    });
  });

  it('validates required fields in details step', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Select "Yes, I have chickens"
    fireEvent.click(screen.getByText('Yes, I have chickens'));
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Tell us about your flock')).toBeInTheDocument();
    });
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables next button when valid data is entered', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Go to details step
    fireEvent.click(screen.getByText('Yes, I have chickens'));
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Tell us about your flock')).toBeInTheDocument();
    });
    
    // Fill in required fields
    const henInput = screen.getByLabelText(/Hens/i);
    const breedSelect = screen.getByLabelText(/Primary breed/i);
    
    fireEvent.change(henInput, { target: { value: '10' } });
    fireEvent.change(breedSelect, { target: { value: 'Rhode Island Red' } });
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('calls onComplete with correct form data', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Complete the form
    fireEvent.click(screen.getByText('Yes, I have chickens'));
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Tell us about your flock')).toBeInTheDocument();
    });
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Hens/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Roosters/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Primary breed/i), { target: { value: 'Rhode Island Red' } });
    
    // Go to confirmation
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Ready to set up your flock!')).toBeInTheDocument();
    });
    
    // Complete setup
    fireEvent.click(screen.getByText('Complete Setup'));
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        hasChickens: true,
        henCount: 10,
        roosterCount: 2,
        chickCount: 0,
        breed: 'Rhode Island Red',
        acquisitionDate: expect.any(String)
      });
    });
  });

  it('calls onBack when back button is clicked on first step', () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Previous'));
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('shows flock summary in confirmation step', async () => {
    render(<OnboardingWizard {...defaultProps} />);
    
    // Complete form with chickens
    fireEvent.click(screen.getByText('Yes, I have chickens'));
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Tell us about your flock')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Hens/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Roosters/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Primary breed/i), { target: { value: 'Leghorn' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Your Flock Summary:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Hen count
      expect(screen.getByText('1')).toBeInTheDocument(); // Rooster count
      expect(screen.getByText('6')).toBeInTheDocument(); // Total count
      expect(screen.getByText('Leghorn')).toBeInTheDocument(); // Breed
    });
  });
});