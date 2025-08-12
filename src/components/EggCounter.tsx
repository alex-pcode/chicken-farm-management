"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { apiService } from '../services/api';
import type { FlockSummary } from '../types';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
import { StatCard } from './ui';
import AnimatedEggCounterPNG from './AnimatedEggCounterPNG';
import { useAuth } from '../contexts/AuthContext';
import { DateInput, NumberInput, FormGroup, FormCard, SubmitButton } from './forms';
import { useFormState } from '../hooks/useFormState';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEggCount } from '../utils/validation';
import type { ValidationError, EggEntry } from '../types';
import { useEggData } from '../hooks/data/useEggData';
import { useEggPagination } from '../hooks/pagination/useEggPagination';
import { useToggle, useTimeoutToggle } from '../hooks/utils';
import { v4 as uuidv4 } from 'uuid';


export const EggCounter = () => {
  const { user } = useAuth();
  
  // Use custom data management hook
  const { entries: eggEntries, isLoading, addEntry, totalEggs, averageDaily, thisWeekTotal, thisMonthTotal } = useEggData();
  
  // Use pagination hook
  const { 
    currentPage, 
    totalPages, 
    paginatedEntries, 
    goToPage, 
    nextPage, 
    previousPage, 
    isFirstPage, 
    isLastPage 
  } = useEggPagination({
    entries: eggEntries,
    pageSize: 10,
    sortDirection: 'desc'
  });
  
  // Form state management with custom hook
  const eggForm = useFormState({
    initialValues: {
      count: '0',
      selectedDate: new Date().toISOString().split('T')[0]
    }
  });
  
  // Log form state changes for debugging
  console.log('🔍 EggForm current values:', eggForm.values);
  
  // Form validation
  const { errors, validate, clearErrors } = useFormValidation({
    rules: [
      {
        field: 'count',
        validator: (value: string) => {
          console.log('🔍 Validating count field with value:', value, 'type:', typeof value);
          const result = validateEggCount(value);
          console.log('Validation result:', result);
          return result;
        },
        required: true
      }
    ]
  });
  
  // UI state with utility hooks
  const success = useTimeoutToggle(false, 3000);
  const flockLoading = useToggle(false);
  const [flockSummary, setFlockSummary] = React.useState<FlockSummary | null>(null);
  
  // Function to fetch flock summary for production analysis
  const fetchFlockSummary = async () => {
    if (!user) return;
    
    flockLoading.setTrue();
    try {
      const response = await apiService.flock.getFlockSummary();
      if (response.data) {
        setFlockSummary(response.data.summary || response.data);
      }
    } catch (error) {
      console.error('Error fetching flock summary:', error);
    } finally {
      flockLoading.setFalse();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      // Fetch flock summary for production analysis
      fetchFlockSummary();
    }
  }, [user]);

  const validateForm = (): boolean => {
    console.log('🔍 Validating form with values:', eggForm.values);
    
    const isFormValid = validate(eggForm.values);
    console.log('Validation result:', isFormValid);
    
    // Additional manual validation logging
    const countValidation = validateEggCount(eggForm.values.count);
    console.log('Egg count validation:', {
      value: eggForm.values.count,
      result: countValidation
    });
    
    return isFormValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🥚 Form submission started');
    console.log('Form values:', eggForm.values);
    
    clearErrors();
    success.setFalse();

    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Current errors:', errors);

    if (!isValid) {
      console.log('❌ Form validation failed, stopping submission');
      return;
    }

    try {
      const existingEntry = eggEntries.find(entry => entry.date === eggForm.values.selectedDate);
      console.log('Existing entry check:', existingEntry);
      
      if (existingEntry) {
        if (!window.confirm('An entry for this date already exists. Do you want to update it?')) {
          console.log('❌ User cancelled update');
          return;
        }
      }

      console.log('🚀 Calling addEntry with:', {
        date: eggForm.values.selectedDate,
        count: parseInt(eggForm.values.count)
      });

      // Use the hook's addEntry method
      await addEntry({
        date: eggForm.values.selectedDate,
        count: parseInt(eggForm.values.count)
      });
      
      console.log('✅ Entry saved successfully');
      
      // Reset form and show success
      eggForm.resetValues();
      success.setTrue();
      
      // Refresh flock summary to update production analysis
      fetchFlockSummary();
    } catch (error) {
      console.error('❌ Error saving egg entry:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to save entry. Please try again.';
      
      if (error instanceof AuthenticationError) {
        // User automatically signed out by service layer
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      console.log('Setting error message:', errorMessage);
      
      // Use validation hook for error setting
      validate({ count: eggForm.values.count, submit: errorMessage });
    }
  };

  // Statistics are now provided by the useEggData hook

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-3xl mx-auto py-8"
    >
      {/* Animated Hen Section - Testing (will be for new users) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <AnimatedEggCounterPNG />
      </motion.div>

      <FormCard
        title="Log Daily Eggs"
        className="transition-all duration-200"
      >
        <AnimatePresence mode="wait">
          {success.value && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="success-toast mb-6"
            >
              Egg count saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormGroup columns={2} gap="md">
            <DateInput
              id="eggDate"
              label="Date"
              value={eggForm.values.selectedDate}
              onChange={(value) => eggForm.setValue('selectedDate', value)}
              max={new Date().toISOString().split('T')[0]}
              required
              errors={errors}
            />
            
            <NumberInput
              id="count"
              label="Number of Eggs"
              value={eggForm.values.count === '' ? 0 : parseInt(eggForm.values.count) || 0}
              onChange={(value) => {
                console.log('🔢 NumberInput onChange called with value:', value, 'type:', typeof value);
                eggForm.setValue('count', value.toString());
                clearErrors();
              }}
              min={0}
              placeholder="Enter egg count"
              required
              errors={errors}
              showSpinner={false}
            />
          </FormGroup>
          
          <SubmitButton
            loading={isLoading}
            disabled={isLoading}
            className="neu-button full-width md:w-auto md:min-w-[200px]"
            loadingText="Saving..."
          >
            Log Eggs
          </SubmitButton>
        </form>
      </FormCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="This Week" total={thisWeekTotal} label="eggs collected" />
        <StatCard title="This Month" total={thisMonthTotal} label="eggs collected" />
        <StatCard title="Total" total={totalEggs} label="eggs collected" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Average" total={averageDaily} label="eggs per day" />
      </div>

      {/* Flock Production Analysis */}
      {flockSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">🐔 Flock Production Analysis</h2>
          
          {flockLoading.value ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard 
                  title="🐔 Laying Hens" 
                  total={flockSummary.expectedLayers} 
                  label="should be laying"
                />
                <StatCard 
                  title="🥚 Eggs per Hen" 
                  total={flockSummary.avgEggsPerHen?.toFixed(2) || '0.00'} 
                  label="daily average"
                />
                <StatCard 
                  title="📊 Production Status" 
                  total={flockSummary.productionMetrics.productionStatus.toUpperCase()} 
                  label={
                    <span className={`text-xs px-2 py-1 rounded ${
                      flockSummary.productionMetrics.productionStatus === 'excellent' ? 'bg-green-100 text-green-600' :
                      flockSummary.productionMetrics.productionStatus === 'good' ? 'bg-blue-100 text-blue-600' :
                      flockSummary.productionMetrics.productionStatus === 'fair' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      Performance Level
                    </span>
                  }
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">Production Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Birds:</span>
                      <span className="font-medium">{flockSummary.totalBirds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expected Layers:</span>
                      <span className="font-medium">{flockSummary.expectedLayers}</span>
                    </div>
                    {flockSummary.actualLayers && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Estimated Active Layers:</span>
                        <span className="font-medium">{flockSummary.actualLayers}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Egg Average:</span>
                      <span className="font-medium">{flockSummary.productionMetrics.avgDailyEggs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Laying Ready:</span>
                      <span className="font-medium">{flockSummary.productionMetrics.layingReady}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Too Young to Lay:</span>
                      <span className="font-medium">{flockSummary.productionMetrics.tooYoung}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border-l-4 border-indigo-400">
                  <p className="text-sm text-gray-700">
                    <strong>Analysis:</strong> {flockSummary.productionMetrics.productionMessage}
                  </p>
                  {flockSummary.avgEggsPerHen && flockSummary.avgEggsPerHen < 0.5 && flockSummary.productionMetrics.tooYoung > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      💡 <strong>Tip:</strong> You have {flockSummary.productionMetrics.tooYoung} young birds that aren't laying yet. 
                      Production should increase as they mature.
                    </p>
                  )}
                  {flockSummary.mortalityMetrics.recentDeaths > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ⚠️ <strong>Note:</strong> Recent losses ({flockSummary.mortalityMetrics.recentDeaths} birds in last 30 days) 
                      may be affecting production.
                    </p>
                  )}
                </div>

                {flockSummary.batchSummary.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Batch Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {flockSummary.batchSummary.filter(batch => batch.type === 'hens' || batch.type === 'mixed').map((batch) => (
                        <div key={batch.id} className="text-xs bg-white border rounded p-2">
                          <div className="font-medium">{batch.name}</div>
                          <div className="text-gray-600">{batch.currentCount} birds</div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            batch.isLayingAge 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {batch.isLayingAge ? 'Laying' : 'Pre-laying'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Entries</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto w-full rounded-xl">
              <table className="min-w-max">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.id || entry.date + index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.count}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={previousPage}
                  disabled={isFirstPage}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${isFirstPage
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={isLastPage}
                  className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${isLastPage
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, eggEntries.length)}
                    </span>{' '}
                    of <span className="font-medium">{eggEntries.length}</span> entries
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={previousPage}
                      disabled={isFirstPage}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2
                        ${isFirstPage
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      ←
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => goToPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                          ${currentPage === index + 1
                            ? 'z-10 bg-indigo-600 text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={isLastPage}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2
                        ${isLastPage
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
