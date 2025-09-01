/**
 * Onboarding Wizard Component - Multi-step setup flow
 * Guides users through flock setup with optional chicken entry
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OnboardingFormData } from '../../types';

interface OnboardingWizardProps {
  onComplete: (formData: OnboardingFormData) => void;
  onBack: () => void;
  className?: string;
}

type WizardStep = 'assessment' | 'details' | 'confirmation';

const COMMON_BREEDS = [
  'Rhode Island Red',
  'Leghorn',
  'Plymouth Rock',
  'Australorp',
  'Buff Orpington',
  'New Hampshire',
  'Sussex',
  'Wyandotte',
  'Mixed/Other'
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onBack,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('assessment');
  const [formData, setFormData] = useState<OnboardingFormData>({
    hasChickens: false,
    henCount: 0,
    roosterCount: 0,
    chickCount: 0,
    broodingCount: 0,
    breed: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    batchName: 'Initial Flock',
    ageAtAcquisition: 'adult',
    source: 'onboarding',
    cost: 0,
    notes: 'Initial batch created during onboarding'
  });

  const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 'assessment') {
      if (formData.hasChickens) {
        setCurrentStep('details');
      } else {
        setCurrentStep('confirmation');
      }
    } else if (currentStep === 'details') {
      setCurrentStep('confirmation');
    }
  }, [currentStep, formData.hasChickens]);

  const handlePrevious = useCallback(() => {
    if (currentStep === 'confirmation') {
      if (formData.hasChickens) {
        setCurrentStep('details');
      } else {
        setCurrentStep('assessment');
      }
    } else if (currentStep === 'details') {
      setCurrentStep('assessment');
    } else {
      onBack();
    }
  }, [currentStep, formData.hasChickens, onBack]);

  const handleComplete = useCallback(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const isStepValid = useCallback(() => {
    if (currentStep === 'assessment') return true;
    if (currentStep === 'details') {
      const totalCount = formData.henCount + formData.roosterCount + formData.chickCount + (formData.broodingCount || 0);
      return totalCount > 0 && 
             formData.breed.trim() !== '' && 
             formData.acquisitionDate !== '' &&
             formData.batchName?.trim() !== '' &&
             formData.ageAtAcquisition &&
             formData.source?.trim() !== '';
    }
    return true;
  }, [currentStep, formData]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'assessment':
        return (
          <AssessmentStep
            hasChickens={formData.hasChickens}
            onUpdate={(hasChickens) => updateFormData({ hasChickens })}
          />
        );
      case 'details':
        return (
          <DetailsStep
            formData={formData}
            onUpdate={updateFormData}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            formData={formData}
          />
        );
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'assessment': return 1;
      case 'details': return 2;
      case 'confirmation': return formData.hasChickens ? 3 : 2;
    }
  };

  const getTotalSteps = () => formData.hasChickens ? 3 : 2;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 max-w-2xl w-full"
        style={{ boxShadow: '0 8px 32px rgba(243, 229, 215, 0.1)' }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 font-serif" style={{ fontFamily: 'Fraunces, serif' }}>
              Set Up Your Flock
            </h2>
            <span className="text-sm text-gray-500">
              Step {getStepNumber()} of {getTotalSteps()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
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
            disabled={!isStepValid()}
            className="
              px-8 py-2 text-white font-semibold rounded-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-102 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-purple-300
            "
            style={{ 
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)'
            }}
          >
            {currentStep === 'confirmation' ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Step 1: Current Flock Assessment
interface AssessmentStepProps {
  hasChickens: boolean;
  onUpdate: (hasChickens: boolean) => void;
}

const AssessmentStep: React.FC<AssessmentStepProps> = ({ hasChickens, onUpdate }) => (
  <div className="text-center">
    <div className="text-6xl mb-6">🐔</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif" style={{ fontFamily: 'Fraunces, serif' }}>
      Do you currently have chickens?
    </h3>
    <p className="text-gray-600 mb-8">
      This helps us set up your dashboard with the right information from the start.
    </p>

    <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
      <button
        onClick={() => onUpdate(true)}
        className={`
          p-6 rounded-lg border-2 transition-all duration-200
          ${hasChickens 
            ? 'border-purple-500 bg-purple-50 text-purple-700' 
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
          }
        `}
      >
        <div className="text-2xl mb-2">🐣</div>
        <div className="font-semibold">Yes, I have chickens</div>
        <div className="text-sm opacity-75 mt-1">
          I'll enter my current flock details
        </div>
      </button>

      <button
        onClick={() => onUpdate(false)}
        className={`
          p-6 rounded-lg border-2 transition-all duration-200
          ${!hasChickens 
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }
        `}
      >
        <div className="text-2xl mb-2">📝</div>
        <div className="font-semibold">No, not yet</div>
        <div className="text-sm opacity-75 mt-1">
          I'm planning to get chickens soon
        </div>
      </button>
    </div>
  </div>
);

// Step 2: Flock Details
interface DetailsStepProps {
  formData: OnboardingFormData;
  onUpdate: (updates: Partial<OnboardingFormData>) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ formData, onUpdate }) => (
  <div>
    <div className="text-center mb-8">
      <div className="text-4xl mb-4">🐣</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 font-serif" style={{ fontFamily: 'Fraunces, serif' }}>
        Tell us about your flock
      </h3>
      <p className="text-gray-600">
        Enter your current bird counts and basic information.
      </p>
    </div>

    <div className="space-y-6">
      {/* Batch Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would you like to call this batch?
        </label>
        <input
          type="text"
          value={formData.batchName || 'Initial Flock'}
          onChange={(e) => onUpdate({ batchName: e.target.value })}
          placeholder="Initial Flock"
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
      </div>

      {/* Bird Counts */}
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hens (laying females)
          </label>
          <input
            type="number"
            min="0"
            value={formData.henCount}
            onChange={(e) => onUpdate({ henCount: parseInt(e.target.value) || 0 })}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-colors duration-200
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roosters (males)
          </label>
          <input
            type="number"
            min="0"
            value={formData.roosterCount}
            onChange={(e) => onUpdate({ roosterCount: parseInt(e.target.value) || 0 })}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-colors duration-200
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chicks (young birds)
          </label>
          <input
            type="number"
            min="0"
            value={formData.chickCount}
            onChange={(e) => onUpdate({ chickCount: parseInt(e.target.value) || 0 })}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-colors duration-200
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brooding (nesting females)
          </label>
          <input
            type="number"
            min="0"
            value={formData.broodingCount || 0}
            onChange={(e) => onUpdate({ broodingCount: parseInt(e.target.value) || 0 })}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              transition-colors duration-200
            "
          />
        </div>
      </div>

      {/* Breed Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary breed
        </label>
        <select
          value={formData.breed}
          onChange={(e) => onUpdate({ breed: e.target.value })}
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        >
          <option value="">Select a breed...</option>
          {COMMON_BREEDS.map(breed => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>
      </div>

      {/* Acquisition Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When did you get them?
        </label>
        <input
          type="date"
          value={formData.acquisitionDate}
          onChange={(e) => onUpdate({ acquisitionDate: e.target.value })}
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
      </div>

      {/* Age at Acquisition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age when you got them
        </label>
        <select
          value={formData.ageAtAcquisition || 'adult'}
          onChange={(e) => onUpdate({ ageAtAcquisition: e.target.value as 'chick' | 'juvenile' | 'adult' })}
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        >
          <option value="chick">Chicks (0-8 weeks)</option>
          <option value="juvenile">Juveniles (8-20 weeks)</option>
          <option value="adult">Adults (20+ weeks)</option>
        </select>
      </div>

      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where did you get them from?
        </label>
        <input
          type="text"
          value={formData.source || 'onboarding'}
          onChange={(e) => onUpdate({ source: e.target.value })}
          placeholder="Farm, breeder, store, etc."
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
      </div>

      {/* Cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cost (optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.cost || ''}
          onChange={(e) => onUpdate({ cost: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={formData.notes || 'Initial batch created during onboarding'}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Any additional information about your flock..."
          rows={3}
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
      </div>

      {/* Total Count Display */}
      {(formData.henCount + formData.roosterCount + formData.chickCount + (formData.broodingCount || 0)) > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            Total birds: <span className="font-semibold">
              {formData.henCount + formData.roosterCount + formData.chickCount + (formData.broodingCount || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Step 3: Confirmation
interface ConfirmationStepProps {
  formData: OnboardingFormData;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData }) => (
  <div className="text-center">
    <div className="text-6xl mb-6">✅</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif" style={{ fontFamily: 'Fraunces, serif' }}>
      Ready to set up your flock!
    </h3>

    {formData.hasChickens ? (
      <div className="bg-gray-50 p-6 rounded-lg text-left mb-8">
        <h4 className="font-semibold text-gray-900 mb-4 font-serif" style={{ fontFamily: 'Fraunces, serif' }}>Your Flock Summary:</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Batch Name:</span>
            <span className="font-medium">{formData.batchName}</span>
          </div>
          <div className="flex justify-between">
            <span>Hens:</span>
            <span className="font-medium">{formData.henCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Roosters:</span>
            <span className="font-medium">{formData.roosterCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Chicks:</span>
            <span className="font-medium">{formData.chickCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Brooding:</span>
            <span className="font-medium">{formData.broodingCount || 0}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span>Total Birds:</span>
            <span className="font-semibold">{formData.henCount + formData.roosterCount + formData.chickCount + (formData.broodingCount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Breed:</span>
            <span className="font-medium">{formData.breed}</span>
          </div>
          <div className="flex justify-between">
            <span>Acquired:</span>
            <span className="font-medium">{new Date(formData.acquisitionDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Age at Acquisition:</span>
            <span className="font-medium">{formData.ageAtAcquisition}</span>
          </div>
          <div className="flex justify-between">
            <span>Source:</span>
            <span className="font-medium">{formData.source}</span>
          </div>
          {formData.cost && formData.cost > 0 && (
            <div className="flex justify-between">
              <span>Cost:</span>
              <span className="font-medium">${formData.cost.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="bg-indigo-50 p-6 rounded-lg mb-8">
        <p className="text-indigo-700">
          Perfect! We'll set up your dashboard and you can add your chickens whenever you're ready.
        </p>
      </div>
    )}

    <p className="text-gray-600 mb-4">
      We'll create your personalized dashboard and you can start tracking production right away.
    </p>

    <div className="text-sm text-gray-500">
      Don't worry - you can always update this information later in your profile settings.
    </div>
  </div>
);