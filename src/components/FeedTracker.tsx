import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FeedEntry } from '../types';
import { apiService } from '../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
// import { v4 as uuidv4 } from 'uuid';
import AnimatedFeedPNG from './AnimatedFeedPNG';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput
} from './forms';
import { useSimpleValidation } from '../hooks/useSimpleValidation';
import { useFeedData } from '../hooks/data/useFeedData';
import { useFormState } from '../hooks/useFormState';
import { useCallback } from 'react';

import { 
  PaginatedDataTable,
  PageContainer,
  FormCard,
  FormButton,
  ConfirmDialog
} from './ui';
import { FeedCostCalculator } from './FeedCostCalculator';
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
    deleteFeedEntry
    // totalQuantity,
    // totalValue,
    // feedByType
  } = useFeedData();
  
  
  // UI state hooks
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; feed: FeedEntry } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data loading is handled by hooks

  const handleDeleteClick = useCallback((feed: FeedEntry) => {
    setDeleteConfirm({ id: feed.id, feed });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteFeedEntry(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch {
      setErrorMsg('Failed to delete feed entry. Please try again.');
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteFeedEntry]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleDepleteFeed = useCallback(async (id: string) => {
    try {
      const depletionDate = new Date().toISOString().split('T')[0];
      
      // Use the hook's updateFeedEntry method
      await updateFeedEntry(id, { 
        depletedDate: depletionDate 
      });
      
    } catch (error) {
      
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
  }, [updateFeedEntry]);

  // Table columns configuration
  const tableColumns: TableColumn<FeedEntry>[] = useMemo(() => [
    {
      key: 'brand',
      label: 'Brand',
      render: (_, feed) => feed.brand,
    },
    {
      key: 'type',
      label: 'Type',
      render: (_, feed) => feed.type,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (_, feed) => `${feed.quantity} ${feed.unit}`,
    },
    {
      key: 'pricePerUnit',
      label: 'Price',
      render: (_, feed) => `$${(feed.quantity * feed.pricePerUnit).toFixed(2)}`,
    },
    {
      key: 'openedDate',
      label: 'Opened',
      render: (_, feed) => feed.openedDate,
    },
    {
      key: 'depletedDate',
      label: 'Duration',
      render: (_, feed) => feed.depletedDate ? (
        `${calculateDuration(feed.openedDate, feed.depletedDate)} days`
      ) : (
        <motion.button
          onClick={() => handleDepleteFeed(feed.id)}
          className="neu-button transition-all duration-200 font-medium rounded-lg px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1.5 min-w-[110px] justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Mark this feed bag as depleted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Mark Depleted
        </motion.button>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, feed) => (
        <button
          onClick={() => handleDeleteClick(feed)}
          className="inline-flex items-center p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete feed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      ),
    },
  ], [handleDeleteClick, handleDepleteFeed]);
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data loading is now handled by custom hooks

  const calculateDuration = (openedDate: string, depletedDate?: string) => {
    if (!depletedDate) return null;
    
    const start = new Date(openedDate);
    const end = new Date(depletedDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
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
      setIsSubmitting(false);
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
      feedForm.resetValues();
      
    } catch (error) {
      
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
    } catch {
      setErrorMsg('Feed saved but failed to record expense. Please add manually.');
    }
    
    // Form is already reset above on success
    setIsSubmitting(false);
    clearAllErrors();
  };

  return (
    <PageContainer maxWidth="xl">
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
        onSubmit={handleSubmit}
        loading={isSubmitting}
      >
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}
        
        {/* Feed Information Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Brand Name"
              value={feedForm.values.brand}
              onChange={(value) => {
                feedForm.setValue('brand', value);
                clearFieldError('brand');
              }}
              errors={errors.filter(e => e.field === 'brand')}
              required
            />
            <SelectInput
              label="Feed Type"
              value={feedForm.values.type}
              onChange={(value) => feedForm.setValue('type', value)}
              options={FEED_TYPES.map(feedType => ({ value: feedType, label: feedType }))}
            />
          </div>

          {/* Quantity and Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput
              label="Quantity"
              value={parseFloat(feedForm.values.quantity) || 0}
              onChange={(value) => {
                feedForm.setValue('quantity', value.toString());
                clearFieldError('quantity');
              }}
              min={0}
              step={0.1}
              errors={errors.filter(e => e.field === 'quantity')}
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
              label="Price per Unit ($)"
              value={parseFloat(feedForm.values.pricePerUnit) || 0}
              onChange={(value) => {
                feedForm.setValue('pricePerUnit', value.toString());
                clearFieldError('pricePerUnit');
              }}
              min={0}
              step={0.01}
              errors={errors.filter(e => e.field === 'pricePerUnit')}
              required
            />
          </div>

          {/* Additional Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-center">
              <FormButton
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Add Feed to Inventory
              </FormButton>
            </div>
          </div>
      </FormCard>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative mt-8">
        <div className="absolute pointer-events-none transition-opacity duration-300" style={{
          top: '-25%',
          right: '-15%',
          width: '35%',
          height: '30%',
          borderRadius: '70%',
          background: 'radial-gradient(circle, rgb(79, 57, 246) 0%, rgb(25, 22, 86) 100%)',
          filter: 'blur(60px)',
          opacity: 0.6
        }}></div>
        <div className="relative">
          <PaginatedDataTable<FeedEntry>
            data={feedInventory}
            columns={tableColumns}
            loading={inventoryLoading}
            emptyMessage="No feed inventory found"
            itemsPerPage={5}
            sortable={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Feed Cost Calculator Section */}
      <div className="mt-6">
        <FeedCostCalculator />
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Feed Entry"
        message={deleteConfirm ? `Are you sure you want to delete ${deleteConfirm.feed.brand} ${deleteConfirm.feed.type}? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageContainer>
  );
};