import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../../../contexts/OnboardingProvider';
import { AuthComponent } from './Auth';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { WelcomeScreen } from '../../onboarding';
import { OnboardingWizardUpdated } from '../../onboarding/OnboardingWizardUpdated';
import { FreeUserOnboarding } from '../../onboarding/FreeUserOnboarding';
import type { OnboardingFormData } from '../../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const {
    onboardingState,
    isLoading: onboardingLoading,
    completeOnboarding,
    updateOnboardingStep,
    userProfile
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
    return (
      <TierAwareOnboardingWrapper
        currentOnboardingView={currentOnboardingView}
        setCurrentOnboardingView={setCurrentOnboardingView}
        completeOnboarding={completeOnboarding}
        updateOnboardingStep={updateOnboardingStep}
        userTier={userProfile?.subscription_status === 'active' ? 'premium' : 'free'}
      />
    );
  }

  // User is authenticated and has completed onboarding - show main app
  return <>{children}</>;
};

// Wrapper component for tier-aware onboarding with error handling
interface TierAwareOnboardingWrapperProps {
  currentOnboardingView: 'welcome' | 'wizard';
  setCurrentOnboardingView: (view: 'welcome' | 'wizard') => void;
  completeOnboarding: (formData: OnboardingFormData) => Promise<{ success: boolean; flockCreated?: boolean }>;
  updateOnboardingStep: (step: 'welcome' | 'setup' | 'complete') => Promise<void>;
  userTier: 'free' | 'premium';
}

const TierAwareOnboardingWrapper: React.FC<TierAwareOnboardingWrapperProps> = ({
  currentOnboardingView,
  setCurrentOnboardingView,
  completeOnboarding,
  updateOnboardingStep,
  userTier
}) => {
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async (formData: OnboardingFormData) => {
    setCompletionError(null);
    setIsCompleting(true);
    try {
      const result = await completeOnboarding(formData);
      if (!result.success) {
        setCompletionError("Setup couldn't be saved. Please check your connection and try again.");
      }
    } catch {
      setCompletionError("Setup couldn't be saved. Please check your connection and try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const errorBanner = completionError ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-500 flex-shrink-0">&#9888;</span>
          <p className="text-sm text-red-700">{completionError}</p>
        </div>
        <button
          onClick={() => setCompletionError(null)}
          className="text-red-400 hover:text-red-600 ml-4 flex-shrink-0 text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  ) : null;

  const loadingOverlay = isCompleting ? (
    <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ) : null;

  const freeFormData: OnboardingFormData = {
    hasChickens: false,
    henCount: 0,
    roosterCount: 0,
    chickCount: 0,
    breed: '',
    acquisitionDate: new Date().toISOString().split('T')[0]
  };

  // Free users get simplified onboarding focused only on egg tracking
  if (userTier === 'free') {
    return (
      <>
        {errorBanner}
        {loadingOverlay}
        <FreeUserOnboarding
          onComplete={() => { handleComplete(freeFormData); }}
          onBack={() => {}}
        />
      </>
    );
  }

  // Premium users get full flock onboarding
  if (currentOnboardingView === 'welcome') {
    return (
      <>
        {errorBanner}
        {loadingOverlay}
        <WelcomeScreen
          onStartSetup={async () => {
            await updateOnboardingStep('setup');
            setCurrentOnboardingView('wizard');
          }}
          onSkipToApp={() => { handleComplete(freeFormData); }}
        />
      </>
    );
  }

  return (
    <>
      {errorBanner}
      {loadingOverlay}
      <OnboardingWizardUpdated
        onComplete={(formData: OnboardingFormData) => { handleComplete(formData); }}
        onBack={() => { setCurrentOnboardingView('welcome'); }}
      />
    </>
  );
};
