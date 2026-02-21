import React, { useState } from 'react';
import { FormModal } from './FormModal';
import { useFormState } from '../../../hooks/useFormState';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { useEggData } from '../../../hooks/data/useEggData';
import { useUserTier } from '../../../contexts/OptimizedDataProvider';
import { motion } from 'framer-motion';
import type { EggEntry } from '../../../types';

interface HistoricalEggTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface HistoricalFormData {
  startDate: string;
  endDate: string;
  averageDaily: string;
  notes: string;
  [key: string]: unknown;
}

export const HistoricalEggTrackingModal: React.FC<HistoricalEggTrackingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedEntries, setGeneratedEntries] = useState<number>(0);
  
  const { addEntry } = useEggData();
  const { userTier } = useUserTier();
  
  const form = useFormState<HistoricalFormData>({
    initialValues: {
      startDate: '',
      endDate: '',
      averageDaily: '',
      notes: ''
    }
  });

  const { errors, validate, clearErrors } = useFormValidation({
    rules: [
      {
        field: 'startDate',
        validator: (value) => {
          if (!value) return 'Start date is required';
          const date = new Date(value as string);
          const today = new Date();
          if (date > today) return 'Start date cannot be in the future';
          return null;
        },
        required: true
      },
      {
        field: 'endDate',
        validator: (value) => {
          if (!value) return 'End date is required';
          const startDate = new Date(form.values.startDate);
          const endDate = new Date(value as string);
          const today = new Date();
          
          if (endDate > today) return 'End date cannot be in the future';
          if (endDate <= startDate) return 'End date must be after start date';
          
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
          const maxDays = userTier === 'free' ? 90 : 365;
          const tierLabel = userTier === 'free' ? 'Free users are limited to 90 days' : 'Date range cannot exceed 365 days';
          
          if (daysDiff > maxDays) return tierLabel;
          
          return null;
        },
        required: true
      },
      {
        field: 'averageDaily',
        validator: (value) => {
          if (!value) return 'Average daily eggs is required';
          const num = parseFloat(value as string);
          if (isNaN(num) || num < 0) return 'Must be a valid positive number';
          if (num > 1000) return 'Daily average seems too high (max 1000)';
          return null;
        },
        required: true
      }
    ]
  });

  const calculateDateRange = () => {
    if (!form.values.startDate || !form.values.endDate) return { days: 0, weeks: 0 };
    
    const start = new Date(form.values.startDate);
    const end = new Date(form.values.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const weeks = Math.ceil(days / 7);
    
    return { days, weeks };
  };

  const calculateEstimatedEggs = () => {
    const { days } = calculateDateRange();
    const avgDaily = parseFloat(form.values.averageDaily) || 0;
    return Math.round(days * avgDaily);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    clearErrors();
    const isValid = validate(form.values);
    
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      const startDate = new Date(form.values.startDate);
      const endDate = new Date(form.values.endDate);
      const avgDaily = parseFloat(form.values.averageDaily);
      
      // Generate entries for each day in the range
      const entries: Omit<EggEntry, 'id'>[] = [];
      const currentDate = new Date(startDate);
      let totalGenerated = 0;
      
      while (currentDate <= endDate) {
        // Add some realistic variation (±20% of average)
        const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
        const dailyCount = Math.max(0, Math.round(avgDaily * (1 + variation)));
        
        entries.push({
          date: currentDate.toISOString().split('T')[0],
          count: dailyCount,
          notes: 'Historical data - Backfilled entry'
        });
        
        totalGenerated += dailyCount;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Add all entries
      for (const entry of entries) {
        await addEntry(entry);
      }
      
      setGeneratedEntries(totalGenerated);
      setStep('success');
      
    } catch (error) {
      console.error('Error generating historical entries:', error);
      validate({ submit: 'Failed to generate historical entries. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('intro');
    form.resetValues();
    clearErrors();
    onClose();
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  const { days, weeks } = calculateDateRange();
  const estimatedEggs = calculateEstimatedEggs();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'intro' ? '🥚 Historical Egg Tracking' : 
        step === 'form' ? 'Enter Historical Data' : 
        '✅ Success!'
      }
      onSubmit={step === 'form' ? handleSubmit : undefined}
      submitText={
        step === 'intro' ? undefined :
        step === 'form' ? 'Generate Historical Data' :
        'Close'
      }
      cancelText={step === 'success' ? undefined : 'Cancel'}
      showFooter={step !== 'intro'}
      size="lg"
      loading={isSubmitting}
      submitDisabled={isSubmitting}
    >
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Backfill Your Egg Production History
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Have you been raising chickens for a while? This tool helps you add historical egg production 
              data to get accurate trends and analytics from day one.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">What this does:</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 dark:text-blue-400 mt-0.5">•</span>
                <span>Creates daily entries based on your average production</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Adds realistic variation to make data look natural</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Enables accurate trend analysis and forecasting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Marks entries as historical for transparency</span>
              </li>
            </ul>
          </div>

          {userTier === 'free' && (
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-start gap-3">
                <span className="text-orange-600 dark:text-orange-400 text-xl mt-0.5">ℹ️</span>
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-1">Free User Limit</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    Free accounts can import up to 90 days of historical data. 
                    <span className="font-medium"> Upgrade to premium for unlimited historical imports.</span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 text-xl mt-0.5">💡</span>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Pro Tip</h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  You can always edit or delete individual entries later if needed. 
                  This just gives you a good starting baseline.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep('form')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.values.startDate}
                onChange={(e) => form.setValue('startDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="neu-input"
                required
              />
              {errors.find(e => e.field === 'startDate') && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.find(e => e.field === 'startDate')?.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.values.endDate}
                onChange={(e) => form.setValue('endDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={form.values.startDate}
                className="neu-input"
                required
              />
              {errors.find(e => e.field === 'endDate') && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.find(e => e.field === 'endDate')?.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Average Daily Eggs <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1000"
              value={form.values.averageDaily}
              onChange={(e) => form.setValue('averageDaily', e.target.value)}
              placeholder="e.g., 12.5"
              className="neu-input"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your estimated average eggs per day during this period
            </p>
            {errors.find(e => e.field === 'averageDaily') && (
              <p className="text-red-500 text-xs mt-1">
                {errors.find(e => e.field === 'averageDaily')?.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Additional Notes
            </label>
            <textarea
              value={form.values.notes}
              onChange={(e) => form.setValue('notes', e.target.value)}
              placeholder="Any additional context about this historical period..."
              rows={3}
              className="neu-input resize-none"
            />
          </div>
          
          {days > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700"
            >
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Preview</h4>
              <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <p><strong>Period:</strong> {days} days ({weeks} weeks)</p>
                {userTier === 'free' && (
                  <p><strong>Free user limit:</strong> {days}/90 days</p>
                )}
                <p><strong>Estimated Total:</strong> ~{estimatedEggs.toLocaleString()} eggs</p>
                <p><strong>Daily Variation:</strong> ±20% for realistic data</p>
              </div>
              {userTier === 'free' && days > 80 && days <= 90 && (
                <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ You're near your 90-day limit for free users
                </div>
              )}
            </motion.div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 text-lg mt-0.5">⏱️</span>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Processing Time</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Generating historical entries may take a few minutes, especially for longer date ranges. 
                  Please be patient and don't close this window during processing.
                </p>
              </div>
            </div>
          </div>
          
          {errors.find(e => e.field === 'submit') && (
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-700">
              <p className="text-red-800 dark:text-red-300 text-sm">
                {errors.find(e => e.field === 'submit')?.message}
              </p>
            </div>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Historical Data Generated!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Successfully created historical entries for your specified period.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">{days}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Days of Data</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">{generatedEntries.toLocaleString()}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Eggs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">{Math.round(generatedEntries / days)}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Avg per Day</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your dashboard and analytics will now show complete historical trends. 
              You can continue adding daily entries as normal going forward.
            </p>
          </div>
          
          <button
            onClick={handleSuccess}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            View My Updated Dashboard
          </button>
        </div>
      )}
    </FormModal>
  );
};