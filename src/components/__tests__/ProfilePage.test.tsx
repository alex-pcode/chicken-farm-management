import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '../ProfilePage';
import { AuthContext } from '../../contexts/AuthContext';
import { UserService } from '../../services/api/UserService';
import { supabase } from '../../contexts/AuthContext';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../../types';

// Create mock functions
const mockGetUserProfile = vi.fn();
const mockUpdateUserProfile = vi.fn();
const mockCompleteOnboarding = vi.fn();
const mockCalculateSetupProgress = vi.fn();
const mockUpdateProgressFlag = vi.fn();
const mockHasCompletedOnboarding = vi.fn();
const mockCompleteOnboardingFlow = vi.fn();

// Mock UserService
vi.mock('../../services/api/UserService', () => ({
  UserService: {
    getInstance: vi.fn(() => ({
      getUserProfile: mockGetUserProfile,
      updateUserProfile: mockUpdateUserProfile,
      completeOnboarding: mockCompleteOnboarding,
      calculateSetupProgress: mockCalculateSetupProgress,
      updateProgressFlag: mockUpdateProgressFlag,
      hasCompletedOnboarding: mockHasCompletedOnboarding,
      completeOnboardingFlow: mockCompleteOnboardingFlow,
    })),
  },
}));

// Mock Supabase
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    supabase: {
      auth: {
        updateUser: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
    },
  };
});

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      display_name: 'Test User',
      yearly_egg_goal: 1200,
    },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    app_metadata: {},
  };

  const mockAuthValue = {
    user: mockUser,
    session: null,
    loading: false,
    signOut: vi.fn(),
  };

  return (
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders profile page with correct sections', () => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Check main title
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument();

      // Check all sections are present
      expect(screen.getByText('👤')).toBeInTheDocument();
      expect(screen.getByText('User Information')).toBeInTheDocument();
      
      expect(screen.getByText('💳')).toBeInTheDocument();
      expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      
      expect(screen.getByText('🔒')).toBeInTheDocument();
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Yearly Production Goal')).toBeInTheDocument();
    });

    it('populates form with user data on load', async () => {
      const mockProfile: UserProfile = {
        id: 'profile-id',
        user_id: 'test-user-id',
        onboarding_completed: true,
        onboarding_step: 'complete',
        setup_progress: {
          hasFlockProfile: true,
          hasRecordedProduction: true,
          hasRecordedExpense: false,
          hasFeedTracking: false,
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: mockProfile,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
    });

    it('shows validation errors for empty required fields', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Clear the display name
      const displayNameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(displayNameInput, { target: { value: '' } });

      // Try to save
      const saveButtons = screen.getAllByText('💾 Save Profile');
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Display name is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for negative yearly goal', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
      });

      // Change goal to negative number
      const goalInput = screen.getByDisplayValue('1200');
      fireEvent.change(goalInput, { target: { value: '-100' } });

      // The input should prevent negative numbers, so value should be 0
      expect(goalInput).toHaveValue(0);
    });
  });

  describe('Profile Save Functionality', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
    });

    it('saves profile successfully', async () => {
      (supabase.auth.updateUser as Mock).mockResolvedValue({
        error: null,
        data: { user: { id: 'test-user-id' } },
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Update display name
      const displayNameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(displayNameInput, { target: { value: 'Updated User' } });

      // Update yearly goal
      const goalInput = screen.getByDisplayValue('1200');
      fireEvent.change(goalInput, { target: { value: '1500' } });

      // Save profile
      const saveButtons = screen.getAllByText('💾 Save Profile');
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({
          data: {
            display_name: 'Updated User',
            yearly_egg_goal: 1500,
          },
        });
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('handles profile save error', async () => {
      (supabase.auth.updateUser as Mock).mockResolvedValue({
        error: { message: 'Update failed' },
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Try to save
      const saveButtons = screen.getAllByText('💾 Save Profile');
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Functionality', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
    });

    it('sends password reset email successfully', async () => {
      (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
        error: null,
        data: {},
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const resetButton = screen.getByText('🔄 Reset Password');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          { redirectTo: window.location.origin + '/reset-password' }
        );
        expect(screen.getByText('Password reset email sent! Please check your inbox.')).toBeInTheDocument();
      });
    });

    it('handles password reset error', async () => {
      (supabase.auth.resetPasswordForEmail as Mock).mockResolvedValue({
        error: { message: 'Reset failed' },
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const resetButton = screen.getByText('🔄 Reset Password');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Reset failed')).toBeInTheDocument();
      });
    });
  });

  describe('Subscription Section', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
    });

    it('displays free plan information', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Full access to all features')).toBeInTheDocument();
      
      const upgradeButton = screen.getByText('🚀 Upgrade to Premium (Coming Soon)');
      expect(upgradeButton).toBeDisabled();
    });
  });

  describe('Yearly Goal Progress', () => {
    beforeEach(() => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
    });

    it('shows progress when goal is set', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
      });

      // Goal progress section should be visible
      expect(screen.getByText('Current Progress')).toBeInTheDocument();
      expect(screen.getByText(/0 eggs collected/)).toBeInTheDocument();
    });

    it('hides progress when no goal is set', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
      });

      // Clear the goal
      const goalInput = screen.getByDisplayValue('1200');
      fireEvent.change(goalInput, { target: { value: '0' } });

      // Progress section should not be visible
      expect(screen.queryByText('Current Progress')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles getUserProfile API error gracefully', async () => {
      mockGetUserProfile.mockRejectedValue(new Error('API Error'));

      // Should not throw an error
      expect(() => {
        render(
          <TestWrapper>
            <ProfilePage />
          </TestWrapper>
        );
      }).not.toThrow();

      // Component should still render
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });

    it('handles network errors during operations', async () => {
      mockGetUserProfile.mockResolvedValue({
        success: true,
        data: null,
      });
      
      (supabase.auth.updateUser as Mock).mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Try to save
      const saveButtons = screen.getAllByText('💾 Save Profile');
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
      });
    });
  });
});