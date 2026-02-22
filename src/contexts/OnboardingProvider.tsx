/**
 * Onboarding Provider - Manages onboarding state and user profile data
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import type { 
  OnboardingState, 
  UserProfile,
  FarmSetupProgress,
  OnboardingFormData 
} from '../types';

interface OnboardingContextValue {
  // State
  onboardingState: OnboardingState;
  isLoading: boolean;
  error: string | null;
  
  // User profile
  userProfile: UserProfile | null;
  
  // Actions
  checkOnboardingStatus: () => Promise<void>;
  updateOnboardingStep: (step: 'welcome' | 'setup' | 'complete') => Promise<void>;
  completeOnboarding: (formData: OnboardingFormData) => Promise<{ success: boolean; flockCreated?: boolean }>;
  updateProgressFlag: (flag: keyof FarmSetupProgress, value: boolean) => Promise<void>;
  calculateProgress: () => { progress: FarmSetupProgress; percentage: number };
  restartOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasCompletedOnboarding: false,
    currentStep: 'welcome',
    setupProgress: {
      hasFlockProfile: false,
      hasRecordedProduction: false,
      hasRecordedExpense: false,
      hasCustomer: false,
      hasSale: false,
      hasMultipleBatches: false,
      hasFeedTracking: false
    },
    lastActiveDate: new Date().toISOString(),
    showGuidance: true
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    if (!user || authLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.user.getUserProfile();
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        setOnboardingState({
          hasCompletedOnboarding: response.data.onboarding_completed,
          currentStep: response.data.onboarding_step,
          setupProgress: response.data.setup_progress,
          lastActiveDate: response.data.updated_at,
          showGuidance: !response.data.onboarding_completed // Only show guidance for users who haven't completed onboarding
        });
      } else {
        // New user - no profile exists yet
        setUserProfile(null);
        setOnboardingState(prev => ({
          ...prev,
          hasCompletedOnboarding: false,
          currentStep: 'welcome',
          showGuidance: true
        }));
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setError('Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Update onboarding step
  const updateOnboardingStep = useCallback(async (step: 'welcome' | 'setup' | 'complete') => {
    if (!user) return;

    try {
      const response = await apiService.user.updateUserProfile({ onboarding_step: step });
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        setOnboardingState(prev => ({
          ...prev,
          currentStep: step
        }));
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      setError('Failed to update onboarding step');
    }
  }, [user]);

  // Complete onboarding with flock creation
  // Note: does NOT set isLoading to avoid unmounting the onboarding UI during the API call.
  // The caller (TierAwareOnboardingWrapper) manages its own completing state.
  const completeOnboarding = useCallback(async (formData: OnboardingFormData) => {
    if (!user) return { success: false };

    setError(null);

    try {
      const response = await apiService.user.completeOnboarding(formData);

      if (response.success && response.data) {
        setUserProfile(response.data.profile);
        setOnboardingState({
          hasCompletedOnboarding: true,
          currentStep: 'complete',
          setupProgress: response.data.profile.setup_progress,
          lastActiveDate: response.data.profile.updated_at,
          showGuidance: false
        });

        return {
          success: true,
          flockCreated: response.data.flockCreated
        };
      } else {
        const errorMsg = response.error?.message || 'Failed to complete onboarding';
        setError(errorMsg);
        console.error('Onboarding completion failed:', errorMsg);
        return { success: false };
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to complete onboarding';
      setError(errorMsg);
      return { success: false };
    }
  }, [user]);

  // Update progress flag
  const updateProgressFlag = useCallback(async (flag: keyof FarmSetupProgress, value: boolean) => {
    if (!userProfile) return;

    const updatedProgress = {
      ...userProfile.setup_progress,
      [flag]: value
    };

    try {
      const response = await apiService.user.updateUserProfile({
        setup_progress: updatedProgress
      });
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        setOnboardingState(prev => ({
          ...prev,
          setupProgress: updatedProgress
        }));
      }
    } catch (error) {
      console.error('Error updating progress flag:', error);
    }
  }, [userProfile]);

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    return apiService.user.calculateSetupProgress(onboardingState.setupProgress);
  }, [onboardingState.setupProgress]);

  // Restart onboarding for users who previously skipped
  const restartOnboarding = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.user.updateUserProfile({
        onboarding_completed: false,
        onboarding_step: 'welcome'
      });
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        setOnboardingState({
          hasCompletedOnboarding: false,
          currentStep: 'welcome',
          setupProgress: response.data.setup_progress,
          lastActiveDate: new Date().toISOString(),
          showGuidance: true
        });
      }
    } catch (error) {
      console.error('Error restarting onboarding:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to restart onboarding';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initialize onboarding status when user changes
  useEffect(() => {
    if (user && !authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, checkOnboardingStatus]);

  const contextValue: OnboardingContextValue = {
    // State
    onboardingState,
    isLoading,
    error,
    userProfile,
    
    // Actions
    checkOnboardingStatus,
    updateOnboardingStep,
    completeOnboarding,
    updateProgressFlag,
    calculateProgress,
    restartOnboarding
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};