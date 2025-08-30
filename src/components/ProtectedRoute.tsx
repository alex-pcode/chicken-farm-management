import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingProvider';
import { AuthComponent } from './Auth';
import { LoadingSpinner } from './LoadingSpinner';
import { WelcomeScreen, OnboardingWizard } from './onboarding';
import { OnboardingWizardUpdated } from './onboarding/OnboardingWizardUpdated';
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
  }

  // User is authenticated and has completed onboarding - show main app
  return <>{children}</>;
};
