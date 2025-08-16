import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry, FlockProfile } from '../types';
import { apiService } from '../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { v4 as uuidv4 } from 'uuid';
import AnimatedFeedPNG from './AnimatedFeedPNG';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput,
  FormCard, 
  FormRow, 
  SubmitButton 
} from './forms';
import { useSimpleValidation } from '../hooks/useSimpleValidation';
import { useFeedData } from '../hooks/data/useFeedData';
import { useFormState } from '../hooks/useFormState';
import { useToggle, useTimeoutToggle } from '../hooks/utils';
import { 
  DataTable, 
  StatCard, 
  GridContainer 
} from './ui';
import type { TableColumn } from './ui';

const FEED_TYPES = [
  'Baby chicks',
  'Big chicks', 
  'Both'
];


export const FeedTracker = () => {
  // Use custom data management hooks
  const {
    feedEntries: feedInventory,
    isLoading: inventoryLoading,
    addFeedEntry,
    updateFeedEntry,
    deleteFeedEntry,
    totalQuantity,
    totalValue,
    feedByType
  } = useFeedData();
  
  const { data, isLoading: profileLoading, refreshData } = useOptimizedAppData();
  const cachedProfile = data.flockProfile;
  
  // UI state hooks
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const showEstimator = useToggle(false);
  
  // Data loading is handled by hooks
  const flockProfile = cachedProfile;

  const handleDelete = async (id: string) => {
    console.log('🎯 handleDelete called with id:', id);
    console.log('🔍 Current deleteConfirm:', deleteConfirm);
    
    if (deleteConfirm === id) {
      console.log('✅ Confirmed delete - proceeding...');
      try {
        console.log('🚀 Calling deleteFeedEntry...');
        await deleteFeedEntry(id);
        console.log('✅ deleteFeedEntry completed');
        setDeleteConfirm(null);
      } catch (error) {
        console.error('❌ Error deleting feed entry:', error);
        setErrorMsg('Failed to delete feed entry. Please try again.');
      }
    } else {
      console.log('⚠️ First click - setting confirmation for id:', id);
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleDepleteFeed = async (id: string) => {    
    console.log('🚀 handleDepleteFeed called with id:', id);
    try {
      const depletionDate = new Date().toISOString().split('T')[0];
      console.log('📅 Setting depletion date to:', depletionDate);
      
      // Use the hook's updateFeedEntry method
      await updateFeedEntry(id, { 
        depletedDate: depletionDate 
      });
      
      console.log('✅ Feed depletion update successful');
    } catch (error) {
      console.error('Error saving feed depletion:', error);
      
      // Use standardized error handling
      let errorMessage = 'Failed to mark feed as depleted. Please try again.';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setErrorMsg(errorMessage);
    }
  };

  // Table columns configuration
  const tableColumns: TableColumn<FeedEntry>[] = useMemo(() => [
    {
      key: 'brand',
      label: 'Brand',
      render: (value, feed) => feed.brand,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, feed) => feed.type,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value, feed) => `${feed.quantity} ${feed.unit}`,
    },
    {
      key: 'pricePerUnit',
      label: 'Price',
      render: (value, feed) => `$${(feed.quantity * feed.pricePerUnit).toFixed(2)}`,
    },
    {
      key: 'openedDate',
      label: 'Opened',
      render: (value, feed) => feed.openedDate,
    },
    {
      key: 'depletedDate',
      label: 'Duration',
      render: (value, feed) => feed.depletedDate ? (
        `${calculateDuration(feed.openedDate, feed.depletedDate)} days`
      ) : (
        <button
          onClick={() => handleDepleteFeed(feed.id)}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Mark Depleted
        </button>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, feed) => (
        <button
          onClick={() => handleDelete(feed.id)}
          className={`inline-flex items-center p-2 rounded-full
            ${deleteConfirm === feed.id
              ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            } transition-colors`}
          title={deleteConfirm === feed.id ? "Click again to confirm deletion" : "Delete feed"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      ),
    },
  ], [deleteConfirm]);
  
  // Form state management
  const feedForm = useFormState({
    initialValues: {
      brand: '',
      type: FEED_TYPES[0],
      quantity: '',
      unit: 'kg' as 'kg' | 'lbs',
      openedDate: new Date().toISOString().split('T')[0],
      batchNumber: '',
      pricePerUnit: ''
    }
  });

  // Form validation using shared hook
  const { errors, setFieldError, clearFieldError, clearAllErrors } = useSimpleValidation();
  const submittingState = useToggle(false);

  // Data loading is now handled by custom hooks

  const calculateDuration = (openedDate: string, depletedDate?: string) => {
    if (!depletedDate) return null;
    
    const start = new Date(openedDate);
    const end = new Date(depletedDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Calculate actual consumption rates from your completed feed cycles
  const getActualConsumptionData = () => {
    const completedFeeds = feedInventory.filter(feed => feed.depletedDate);
    
    if (completedFeeds.length === 0) return null;
    
    const consumptionData = completedFeeds.map(feed => {
      const duration = calculateDuration(feed.openedDate, feed.depletedDate) || 1;
      const dailyConsumption = feed.quantity / duration;
      const totalCost = feed.quantity * feed.pricePerUnit;
      const dailyCost = totalCost / duration;
      
      return {
        feedType: feed.type,
        brand: feed.brand,
        duration,
        quantity: feed.quantity,
        unit: feed.unit,
        dailyConsumption,
        totalCost,
        dailyCost,
        startDate: feed.openedDate,
        endDate: feed.depletedDate
      };
    });
    
    // Calculate averages by feed type
    const avgByType: Record<string, any> = {};
    
    ['Baby chicks', 'Big chicks', 'Both'].forEach(type => {
      const typeFeeds = consumptionData.filter(feed => feed.feedType === type);
      if (typeFeeds.length > 0) {
        const avgDaily = typeFeeds.reduce((sum, feed) => sum + feed.dailyConsumption, 0) / typeFeeds.length;
        const avgCost = typeFeeds.reduce((sum, feed) => sum + feed.dailyCost, 0) / typeFeeds.length;
        
        avgByType[type] = {
          count: typeFeeds.length,
          avgDailyConsumption: avgDaily,
          avgDailyCost: avgCost,
          recentFeeds: typeFeeds.slice(-3) // Last 3 feeds of this type
        };
      }
    });
    
    return {
      allFeeds: consumptionData,
      byType: avgByType,
      totalCompleted: completedFeeds.length
    };
  };

  // Estimate future needs based on YOUR actual data
  const estimateFutureNeeds = (days: number = 30) => {
    const actualData = getActualConsumptionData();
    if (!actualData || !flockProfile) return null;
    
    const currentFlockSize = flockProfile.chicks + flockProfile.hens + flockProfile.roosters;
    if (currentFlockSize === 0) return null;
    
    // Use the most appropriate feed type data
    let bestEstimate = null;
    
    // Prefer 'Both' type if available, then 'Big chicks', then 'Baby chicks'
    if (actualData.byType['Both']) {
      bestEstimate = actualData.byType['Both'];
    } else if (actualData.byType['Big chicks']) {
      bestEstimate = actualData.byType['Big chicks'];
    } else if (actualData.byType['Baby chicks']) {
      bestEstimate = actualData.byType['Baby chicks'];
    }
    
    if (!bestEstimate) return null;
    
    return {
      dailyConsumption: bestEstimate.avgDailyConsumption,
      dailyCost: bestEstimate.avgDailyCost,
      totalNeed: bestEstimate.avgDailyConsumption * days,
      totalCost: bestEstimate.avgDailyCost * days,
      basedOnFeeds: bestEstimate.count,
      currentFlockSize
    };
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    submittingState.setTrue();
    clearAllErrors();
    
    // Validate required fields using shared validation
    let hasErrors = false;
    
    if (!feedForm.values.brand.trim()) {
      setFieldError('brand', 'Brand name is required');
      hasErrors = true;
    }
    
    if (!feedForm.values.quantity || parseFloat(feedForm.values.quantity) <= 0) {
      setFieldError('quantity', 'Quantity must be greater than 0');
      hasErrors = true;
    }
    
    if (!feedForm.values.pricePerUnit || parseFloat(feedForm.values.pricePerUnit) <= 0) {
      setFieldError('pricePerUnit', 'Price per unit must be greater than 0');
      hasErrors = true;
    }
    
    if (hasErrors) {
      submittingState.setFalse();
      return;
    }
    
    const newFeed: Omit<FeedEntry, 'id'> = {
      brand: feedForm.values.brand,
      type: feedForm.values.type,
      quantity: parseFloat(feedForm.values.quantity),
      unit: feedForm.values.unit,
      openedDate: feedForm.values.openedDate,
      pricePerUnit: parseFloat(feedForm.values.pricePerUnit),
      // Do not include batchNumber or description here
    };
    
    try {
      // Use the hook's addFeedEntry method
      await addFeedEntry(newFeed);
      
      // Reset form on success
      feedForm.resetForm();
      
    } catch (error) {
      console.error('Error saving feed inventory:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to save feed inventory. Please try again.';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setErrorMsg(errorMessage);
    }

    // Add expense entry automatically when feed is purchased
    try {
      const newExpense = {
        date: feedForm.values.openedDate,
        category: 'Feed',
        description: `${feedForm.values.brand} ${feedForm.values.type} (${feedForm.values.quantity} ${feedForm.values.unit})`,
        amount: parseFloat(feedForm.values.quantity) * parseFloat(feedForm.values.pricePerUnit)
      };

      // Save expense without ID (let database generate UUID)
      await apiService.production.saveExpenses([newExpense]);
    } catch (error) {
      console.error('Error saving expenses:', error);
      setErrorMsg('Feed saved but failed to record expense. Please add manually.');
    }
    
    // Form is already reset above on success
    submittingState.setFalse();
    clearAllErrors();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {/* Animated Feed Pile Section - Welcome animation for new users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mt-10 lg:mt-0 mb-0"
      >
        <AnimatedFeedPNG />
      </motion.div>

      <FormCard
        title="Add New Feed"
        error={errorMsg || undefined}
        validationErrors={errors}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormRow>
            <TextInput
              label="Brand Name"
              value={feedForm.values.brand}
              onChange={(value) => {
                feedForm.setValue('brand', value);
                clearFieldError('brand');
              }}
              validation={errors.filter(e => e.field === 'brand')}
              required
            />
            <SelectInput
              label="Feed Type"
              value={feedForm.values.type}
              onChange={(value) => feedForm.setValue('type', value)}
              options={FEED_TYPES.map(feedType => ({ value: feedType, label: feedType }))}
            />
          </FormRow>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberInput
              label="Quantity"
              value={parseFloat(feedForm.values.quantity) || 0}
              onChange={(value) => {
                feedForm.setValue('quantity', value.toString());
                clearFieldError('quantity');
              }}
              min={0}
              step={0.1}
              validation={errors.filter(e => e.field === 'quantity')}
              required
            />
            <SelectInput
              label="Unit"
              value={feedForm.values.unit}
              onChange={(value) => feedForm.setValue('unit', value as 'kg' | 'lbs')}
              options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'lbs', label: 'Pounds (lbs)' }
              ]}
            />
            <NumberInput
              label="Price per Unit"
              value={parseFloat(feedForm.values.pricePerUnit) || 0}
              onChange={(value) => {
                feedForm.setValue('pricePerUnit', value.toString());
                clearFieldError('pricePerUnit');
              }}
              min={0}
              step={0.01}
              prefix="$"
              validation={errors.filter(e => e.field === 'pricePerUnit')}
              required
            />
          </div>

          <FormRow>
            <DateInput
              label="Purchase Date"
              value={feedForm.values.openedDate}
              onChange={(value) => feedForm.setValue('openedDate', value)}
              required
            />
            <TextInput
              label="Batch Number (Optional)"
              value={feedForm.values.batchNumber}
              onChange={(value) => feedForm.setValue('batchNumber', value)}
            />
          </FormRow>

          <SubmitButton
            isLoading={submittingState.value}
            loadingText="Adding Feed..."
            text="Add Feed to Inventory"
            className="md:w-auto md:min-w-[200px]"
          />
        </form>
      </FormCard>

      {/* Feed Consumption Estimator */}
      {showEstimator.value && flockProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feed Consumption Based on Your Data</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Flock Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Flock</h3>
              <GridContainer columns={2} gap="md">
                <StatCard
                  title="Baby Chicks"
                  value={flockProfile.chicks.toString()}
                  variant="warning"
                  animated
                />
                <StatCard
                  title="Adult Birds"
                  value={(flockProfile.hens + flockProfile.roosters).toString()}
                  variant="info"
                  animated
                />
              </GridContainer>
              
              {(() => {
                const futureNeeds = estimateFutureNeeds(30);
                const actualData = getActualConsumptionData();
                
                if (!futureNeeds || !actualData) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-600">Complete some feed cycles to see your actual consumption data</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Mark feed bags as "depleted" when empty to build your consumption history
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        Your Daily Consumption: {futureNeeds.dailyConsumption.toFixed(2)} {unit}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Daily Cost: ${futureNeeds.dailyCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Based on {futureNeeds.basedOnFeeds} completed feed cycle(s)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Monthly Estimates</div>
                      <div className="text-lg font-bold text-blue-600">
                        {futureNeeds.totalNeed.toFixed(1)} {unit} • ${futureNeeds.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Consumption History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Feed History</h3>
              {(() => {
                const actualData = getActualConsumptionData();
                
                if (!actualData || actualData.totalCompleted === 0) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                      No completed feed cycles yet. Mark feed as depleted to start tracking!
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {actualData.allFeeds.slice(-5).map((feed, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">
                              {feed.brand} - {feed.feedType}
                            </div>
                            <div className="text-sm text-gray-600">
                              {feed.quantity} {feed.unit} • {feed.duration} days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-700">
                              {feed.dailyConsumption.toFixed(2)} {feed.unit}/day
                            </div>
                            <div className="text-sm text-gray-500">
                              ${feed.dailyCost.toFixed(2)}/day
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-xs text-gray-500 text-center">
                      Showing last 5 completed feeds
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>          {/* Feed Type Guide & Consumption Insights */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Feed Type Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Baby chicks:</span>
                  <div className="text-blue-600">For birds 0-6 weeks old. High protein starter feed.</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Big chicks:</span>
                  <div className="text-blue-600">For birds 6+ weeks old. Layer or grower feed.</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Both:</span>
                  <div className="text-blue-600">All-flock feed suitable for mixed ages.</div>
                </div>
              </div>
            </div>
            
            {(() => {
              const actualData = getActualConsumptionData();
              if (actualData && Object.keys(actualData.byType).length > 0) {
                return (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Your Consumption Patterns</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(actualData.byType).map(([type, data]: [string, any]) => (
                        <div key={type}>
                          <span className="font-medium text-green-700">{type}:</span>
                          <div className="text-green-600">
                            {data.avgDailyConsumption.toFixed(2)} kg/day avg
                          </div>
                          <div className="text-green-500 text-xs">
                            ${data.avgDailyCost.toFixed(2)}/day • {data.count} cycles
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Feed Inventory</h2>
          <button
            onClick={showEstimator.toggle}
            className="neu-button"
          >
            {showEstimator.value ? 'Hide Analysis' : 'Show Feed Analysis'}
          </button>
        </div>

        <DataTable
          data={feedInventory}
          columns={tableColumns}
          loading={inventoryLoading}
          emptyMessage="No feed inventory found"
          className="w-full"
        />
      </motion.div>
    </motion.div>
  );
};