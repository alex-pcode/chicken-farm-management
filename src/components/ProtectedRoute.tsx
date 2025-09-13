import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingProvider';
import { useUserTier } from '../contexts/OptimizedDataProvider';
import { AuthComponent } from './Auth';
import { LoadingSpinner } from './LoadingSpinner';
import { WelcomeScreen } from './onboarding';
import { OnboardingWizardUpdated } from './onboarding/OnboardingWizardUpdated';
import { FreeUserOnboarding } from './onboarding/FreeUserOnboarding';
import type { OnboardingFormData } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { 
    onboardingState, 
    isLoading: onboardingLoading,
    completeOnboarding,
    updateOnboardingStep
  } = useOnboarding();
  
  const [currentOnboardingView, setCurrentOnboardingView] = useState<'welcome' | 'wizard'>('welcome');

  // Show loading spinner while authentication or onboarding data loads
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show authentication if user is not logged in
  if (!user) {
    return <AuthComponent />;
  }

  // Route interception for new users - show onboarding flow
  if (!onboardingState.hasCompletedOnboarding) {
    // Return a component that will handle tier-aware onboarding inside the data provider
    return (
      <TierAwareOnboardingWrapper
        currentOnboardingView={currentOnboardingView}
        setCurrentOnboardingView={setCurrentOnboardingView}
        completeOnboarding={completeOnboarding}
        updateOnboardingStep={updateOnboardingStep}
      />
    );
  }

  // User is authenticated and has completed onboarding - show main app
  return <>{children}</>;
};

// Wrapper component that can access useUserTier (needs to be inside OptimizedDataProvider)
interface TierAwareOnboardingWrapperProps {
  currentOnboardingView: 'welcome' | 'wizard';
  setCurrentOnboardingView: (view: 'welcome' | 'wizard') => void;
  completeOnboarding: (formData: OnboardingFormData) => Promise<{ success: boolean; flockCreated?: boolean }>;
  updateOnboardingStep: (step: 'welcome' | 'setup' | 'complete') => Promise<void>;
}

const TierAwareOnboardingWrapper: React.FC<TierAwareOnboardingWrapperProps> = ({
  currentOnboardingView,
  setCurrentOnboardingView,
  completeOnboarding,
  updateOnboardingStep
}) => {
  const { userTier, isSubscriptionLoading } = useUserTier();

  // Show loading while determining user tier
  if (isSubscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Free users get simplified onboarding focused only on egg tracking
  if (userTier === 'free') {
    return (
      <FreeUserOnboarding
        onComplete={async () => {
          // Mark as completed but with no flock for free users
          await completeOnboarding({
            hasChickens: false,
            henCount: 0,
            roosterCount: 0,
            chickCount: 0,
            breed: '',
            acquisitionDate: new Date().toISOString().split('T')[0]
          });
        }}
        onBack={() => {
          // Free users can't go back - they need to complete onboarding
          // Could show a "Contact Support" option here if needed
        }}
      />
    );
  }
  
  // Premium users get full flock onboarding
  if (currentOnboardingView === 'welcome') {
    return (
      <WelcomeScreen
        onStartSetup={async () => {
          await updateOnboardingStep('setup');
          setCurrentOnboardingView('wizard');
        }}
        onSkipToApp={async () => {
          // Mark as completed but with no flock
          await completeOnboarding({
            hasChickens: false,
            henCount: 0,
            roosterCount: 0,
            chickCount: 0,
            breed: '',
            acquisitionDate: new Date().toISOString().split('T')[0]
          });
        }}
      />
    );
  } else {
    return (
      <OnboardingWizardUpdated
        onComplete={async (formData: OnboardingFormData) => {
          const result = await completeOnboarding(formData);
          if (result.success) {
            // Onboarding complete - the provider will update state and user will see main app
            console.log('Onboarding completed successfully', result.flockCreated ? 'with flock creation' : 'without flock');
          }
        }}
        onBack={() => {
          setCurrentOnboardingView('welcome');
        }}
      />
    );
  }
};
