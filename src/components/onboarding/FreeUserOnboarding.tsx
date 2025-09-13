/**
 * Free User Onboarding Component - Simplified setup focused on egg tracking
 * For users without premium subscription who only have access to egg counter and account
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoricalEggTrackingModal } from '../modals/HistoricalEggTrackingModal';

interface FreeUserOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
  className?: string;
}

type FreeOnboardingStep = 'welcome' | 'egg-history' | 'import-data' | 'confirmation';

export const FreeUserOnboarding: React.FC<FreeUserOnboardingProps> = ({
  onComplete,
  onBack,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<FreeOnboardingStep>('welcome');
  const [skipHistory, setSkipHistory] = useState(false);
  const [showHistoricalModal, setShowHistoricalModal] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [skipImportStep, setSkipImportStep] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep === 'welcome') {
      setCurrentStep('egg-history');
    } else if (currentStep === 'egg-history') {
      if (skipHistory) {
        setCurrentStep('confirmation');
      } else {
        setCurrentStep('import-data');
      }
    } else if (currentStep === 'import-data') {
      setCurrentStep('confirmation');
    }
  }, [currentStep, skipHistory]);

  const handlePrevious = useCallback(() => {
    if (currentStep === 'confirmation') {
      if (skipHistory) {
        setCurrentStep('egg-history');
      } else {
        setCurrentStep('import-data');
      }
    } else if (currentStep === 'import-data') {
      setCurrentStep('egg-history');
    } else if (currentStep === 'egg-history') {
      setCurrentStep('welcome');
    } else {
      onBack();
    }
  }, [currentStep, skipHistory, onBack]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const canProceedFromImport = useCallback(() => {
    return hasImportedData || skipImportStep;
  }, [hasImportedData, skipImportStep]);

  const isNextButtonEnabled = useCallback(() => {
    if (currentStep === 'import-data') {
      return canProceedFromImport();
    }
    return true;
  }, [currentStep, canProceedFromImport]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'egg-history':
        return (
          <EggHistoryStep
            skipHistory={skipHistory}
            onSkipChange={setSkipHistory}
          />
        );
      case 'import-data':
        return (
          <ImportDataStep
            hasImportedData={hasImportedData}
            skipImportStep={skipImportStep}
            onOpenModal={() => setShowHistoricalModal(true)}
            onSkipImport={() => setSkipImportStep(true)}
          />
        );
      case 'confirmation':
        return <ConfirmationStep skipHistory={skipHistory} hasImportedData={hasImportedData} skipImportStep={skipImportStep} />;
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'welcome': return 1;
      case 'egg-history': return 2;
      case 'import-data': return 3;
      case 'confirmation': return skipHistory ? 3 : 4;
    }
  };

  const getTotalSteps = () => skipHistory ? 3 : 4;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 max-w-2xl w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">
              Welcome to ChickenCare
            </h2>
            <span className="text-sm text-gray-500">
              Step {getStepNumber()} of {getTotalSteps()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            className="
              px-6 py-2 text-gray-600 hover:text-gray-800
              border-2 border-gray-200 rounded-lg hover:border-gray-300
              transition-colors duration-200
              focus:outline-none focus:ring-4 focus:ring-gray-300
            "
          >
            Previous
          </button>

          <button
            onClick={currentStep === 'confirmation' ? handleComplete : handleNext}
            disabled={!isNextButtonEnabled()}
            className="
              px-8 py-2 text-white font-semibold rounded-xl
              transform hover:scale-102 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-blue-300
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            "
            style={{ 
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            {currentStep === 'confirmation' ? 'Start Tracking' : 'Next'}
          </button>
        </div>
      </motion.div>

      {/* Historical Data Import Modal */}
      <HistoricalEggTrackingModal
        isOpen={showHistoricalModal}
        onClose={() => setShowHistoricalModal(false)}
        onSuccess={() => {
          setHasImportedData(true);
          setShowHistoricalModal(false);
        }}
      />
    </div>
  );
};

// Step 1: Welcome to Free Tier
const WelcomeStep: React.FC = () => (
  <div className="text-center">
    <div className="text-6xl mb-6">🥚</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif">
      Start Tracking Your Egg Production
    </h3>
    <p className="text-gray-600 mb-6">
      Welcome to ChickenCare! With your free account, you can track daily egg production and monitor your progress over time.
    </p>
    
    <div className="bg-blue-50 p-6 rounded-lg mb-6">
      <h4 className="font-semibold text-blue-900 mb-3">What you can do:</h4>
      <ul className="text-blue-800 space-y-2 text-left">
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          Track daily egg counts
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          View production trends and statistics
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          Add historical egg data
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          Manage your account settings
        </li>
      </ul>
    </div>

    <div className="bg-amber-50 p-4 rounded-lg">
      <p className="text-amber-800 text-sm">
        💡 <strong>Want more features?</strong> Upgrade to premium for flock management, expenses, sales tracking, and more!
      </p>
    </div>
  </div>
);

// Step 2: Egg History Setup
interface EggHistoryStepProps {
  skipHistory: boolean;
  onSkipChange: (skip: boolean) => void;
}

const EggHistoryStep: React.FC<EggHistoryStepProps> = ({ skipHistory, onSkipChange }) => (
  <div className="text-center">
    <div className="text-4xl mb-6">📊</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif">
      Historical Egg Data
    </h3>
    <p className="text-gray-600 mb-8">
      Do you have historical egg production data you'd like to add? This helps create better trends and insights.
    </p>

    <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
      <button
        onClick={() => onSkipChange(false)}
        className={`
          p-6 rounded-lg border-2 transition-all duration-200
          ${!skipHistory 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }
        `}
      >
        <div className="text-2xl mb-2">📝</div>
        <div className="font-semibold">Yes, I have data</div>
        <div className="text-sm opacity-75 mt-1">
          I'll add historical records after setup
        </div>
      </button>

      <button
        onClick={() => onSkipChange(true)}
        className={`
          p-6 rounded-lg border-2 transition-all duration-200
          ${skipHistory 
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }
        `}
      >
        <div className="text-2xl mb-2">🚀</div>
        <div className="font-semibold">Start fresh</div>
        <div className="text-sm opacity-75 mt-1">
          I'll begin tracking from today
        </div>
      </button>
    </div>

    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        💡 <strong>Tip:</strong> You can always add historical data later using the "Add Historical Data" feature in the egg counter.
      </p>
    </div>
  </div>
);

// Step 3: Import Historical Data
interface ImportDataStepProps {
  hasImportedData: boolean;
  skipImportStep: boolean;
  onOpenModal: () => void;
  onSkipImport: () => void;
}

const ImportDataStep: React.FC<ImportDataStepProps> = ({ hasImportedData, skipImportStep, onOpenModal, onSkipImport }) => (
  <div className="text-center">
    <div className="text-4xl mb-6">📊</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif">
      Import Historical Data
    </h3>
    <p className="text-gray-600 mb-8">
      Great choice! You can now add your historical egg production data to get better insights and trends from day one.
    </p>

    {hasImportedData ? (
      <div className="bg-green-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl">✅</span>
          <h4 className="font-semibold text-green-900">Data Import Complete!</h4>
        </div>
        <p className="text-green-800 mb-4">
          Your historical egg production data has been successfully imported. You can continue to the final step.
        </p>
        <button
          onClick={onOpenModal}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Import additional data
        </button>
      </div>
    ) : skipImportStep ? (
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl">⏭️</span>
          <h4 className="font-semibold text-gray-900">Import Skipped</h4>
        </div>
        <p className="text-gray-800 mb-4">
          You've chosen to skip importing historical data. You can always add it later from the egg counter page.
        </p>
        <button
          onClick={onOpenModal}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Actually, I'd like to import data now
        </button>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">What you can import:</h4>
          <ul className="text-blue-800 space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Date ranges up to 90 days (free limit)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Average daily egg production
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Automatic daily variation for realistic data
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Notes for historical context
            </li>
          </ul>
        </div>

        <div className="grid gap-3">
          <button
            onClick={onOpenModal}
            className="
              w-full px-6 py-4 font-semibold rounded-xl
              border-2 border-blue-500 text-blue-600 hover:bg-blue-50
              transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300
            "
          >
            📈 Import Historical Data
          </button>

          <button
            onClick={onSkipImport}
            className="
              w-full px-4 py-3 font-medium rounded-lg
              border border-gray-300 text-gray-600 hover:bg-gray-50
              transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300
              text-sm
            "
          >
            Skip for now - I'll add data later
          </button>
        </div>

        <div className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> You can always import more data later from the egg counter page.
        </div>
      </div>
    )}
  </div>
);

// Step 4: Confirmation
interface ConfirmationStepProps {
  skipHistory: boolean;
  hasImportedData: boolean;
  skipImportStep: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ skipHistory, hasImportedData, skipImportStep }) => (
  <div className="text-center">
    <div className="text-6xl mb-6">✅</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif">
      You're all set!
    </h3>
    
    <div className="bg-green-50 p-6 rounded-lg text-left mb-8">
      <h4 className="font-semibold text-green-900 mb-4 font-serif">Your setup summary:</h4>
      <div className="space-y-2 text-sm text-green-800">
        <div className="flex justify-between">
          <span>Account type:</span>
          <span className="font-medium">Free Tier</span>
        </div>
        <div className="flex justify-between">
          <span>Historical data:</span>
          <span className="font-medium">
            {skipHistory ? 'Starting fresh' : hasImportedData ? 'Successfully imported' : skipImportStep ? 'Skipped for now' : 'Will add later'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Features available:</span>
          <span className="font-medium">Egg tracking & Account</span>
        </div>
      </div>
    </div>

    <p className="text-gray-600 mb-4">
      You'll be taken to your egg counter where you can start recording daily production.
    </p>

    <div className="text-sm text-gray-500">
      You can upgrade to premium anytime from your account settings to unlock additional features like flock management and sales tracking.
    </div>
  </div>
);