"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../../../types/api';
import type { EggEntry } from '../../../types';
import { DataTable, TableColumn } from '../../ui/tables/DataTable';
import { Pagination } from '../../ui/navigation/Pagination';
import { ProgressCard } from '../../ui/cards/ProgressCard';
import { StatCard } from '../../ui/cards/StatCard';
import { ComparisonCard } from '../../ui/cards/ComparisonCard';
import AnimatedEggCounterPNG from '../../landing/animations/AnimatedEggCounterPNG';
import { useFormState } from '../../../hooks/useFormState';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { validateEggCount } from '../../../utils/validation';
import { useEggData } from '../../../hooks/data/useEggData';
import { useFlockBatchData } from '../../../contexts/OptimizedDataProvider';
import { useEggPagination } from '../../../hooks/pagination/useEggPagination';
import { useTimeoutToggle } from '../../../hooks/utils';
import { ConfirmDialog } from '../../ui/modals/ConfirmDialog';
import { HistoricalEggTrackingModal } from '../../ui/modals/HistoricalEggTrackingModal';
import { useAuth } from '../../../contexts/AuthContext';


export const EggCounter = () => {
  // Get user data for yearly goal
  const { user } = useAuth();
  
  // Use custom data management hook
  const { entries: eggEntries, isLoading, addEntry, deleteEntry, totalEggs, averageDaily, thisWeekTotal, thisMonthTotal, previousWeekTotal, previousMonthTotal } = useEggData();
  
  // Get flock batch data for accurate hen count
  const { data: { flockBatches: batches } } = useFlockBatchData();
  
  // Calculate trend indicators
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    return { 
      percentage: Math.round(Math.abs(percentage)), 
      isPositive: percentage >= 0 
    };
  };

  const weekTrend = calculateTrend(thisWeekTotal, previousWeekTotal);
  const monthTrend = calculateTrend(thisMonthTotal, previousMonthTotal);

  // Calculate laying hens from batch data (same logic as FlockOverview)
  const layingHens = useMemo(() => {
    return batches
      .filter(batch => batch.actualLayingStartDate)
      .reduce((sum, batch) => {
        const hens = batch.hensCount || 0;
        const brooding = batch.broodingCount || 0;
        return sum + Math.max(0, hens - brooding);
      }, 0);
  }, [batches]);

  // Calculate lay rate (average daily eggs / laying hens * 100)
  const layRate = useMemo(() => {
    if (layingHens === 0 || averageDaily === 0) return 0;
    return Math.round((averageDaily / layingHens) * 100);
  }, [averageDaily, layingHens]);

  // Calculate protein generated (total eggs × 0.125 lbs)
  const proteinGenerated = useMemo(() => {
    const proteinLbs = totalEggs * 0.125;
    return Math.round(proteinLbs);
  }, [totalEggs]);

  // Calculate monthly goal from user's yearly goal (divided by 12)
  const yearlyGoal = user?.user_metadata?.yearly_egg_goal || 0;
  const MONTHLY_EGG_GOAL = Math.round(yearlyGoal / 12);
  const monthlyProgress = thisMonthTotal;

  // DataTable column configuration  
  const tableColumns: TableColumn<EggEntry>[] = [
    {
      key: 'date',
      label: 'Date',
      render: (value: unknown, row: EggEntry) => {
        const dateValue = typeof value === 'string' ? value : row?.date;
        return <span>{dateValue ? new Date(dateValue).toLocaleDateString() : '-'}</span>;
      }
    },
    {
      key: 'count',
      label: 'Eggs',
      render: (value: unknown, row: EggEntry) => {
        const countValue = typeof value === 'number' ? value : row?.count;
        return <span className="font-medium text-gray-900">{countValue || 0}</span>;
      }
    },
    {
      key: 'size',
      label: 'Size',
      render: (value: unknown, row: EggEntry) => {
        const sizeValue = typeof value === 'string' ? value : row?.size;
        if (!sizeValue) return <span className="text-gray-400">-</span>;
        const sizeDisplay = sizeValue.charAt(0).toUpperCase() + sizeValue.slice(1).replace('-', ' ');
        return <span className="text-gray-700 text-sm">{sizeDisplay}</span>;
      }
    },
    {
      key: 'color',
      label: 'Color',
      render: (value: unknown, row: EggEntry) => {
        const colorValue = typeof value === 'string' ? value : row?.color;
        if (!colorValue) return <span className="text-gray-400">-</span>;
        const colorDisplay = colorValue.charAt(0).toUpperCase() + colorValue.slice(1);
        return (
          <span className="text-gray-700 text-sm inline-flex items-center gap-1">
            <span 
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{
                backgroundColor: 
                  colorValue === 'white' ? '#ffffff' :
                  colorValue === 'brown' ? '#8B4513' :
                  colorValue === 'blue' ? '#87CEEB' :
                  colorValue === 'green' ? '#90EE90' :
                  colorValue === 'speckled' ? '#F5DEB3' :
                  colorValue === 'cream' ? '#FFFDD0' :
                  '#gray'
              }}
            />
            {colorDisplay}
          </span>
        );
      }
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: unknown, row: EggEntry) => {
        const notesValue = typeof value === 'string' ? value : row?.notes;
        return (
          <span className="text-gray-600 text-sm max-w-32 truncate" title={notesValue || ''}>
            {notesValue || '-'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: EggEntry) => {
        return (
          <button
            onClick={() => handleDeleteEntry(row.id)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
            title="Delete entry"
            aria-label={`Delete egg entry for ${new Date(row.date).toLocaleDateString()}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        );
      }
    }
  ];
  
  // Use pagination hook
  const { 
    currentPage, 
    totalPages, 
    paginatedEntries, 
    goToPage, 
    nextPage, 
    previousPage
  } = useEggPagination({
    entries: eggEntries,
    pageSize: 10,
    sortDirection: 'desc'
  });
  
  // Form state management with custom hook
  const eggForm = useFormState({
    initialValues: {
      count: '',
      selectedDate: new Date().toISOString().split('T')[0],
      notes: '',
      enableAdvanced: false,
      size: '',
      color: ''
    }
  });
  
  
  // Form validation
  const { errors, validate, clearErrors } = useFormValidation({
    rules: [
      {
        field: 'count',
        validator: (value: unknown) => {
          const result = validateEggCount(String(value || ''));
          return result;
        },
        required: true
      },
    ]
  });
  
  // UI state with utility hooks
  const success = useTimeoutToggle(false, 3000);
  const deleteSuccess = useTimeoutToggle(false, 4000);
  const [, setDeletedEntry] = React.useState<{ date: string; count: number } | null>(null);

  // Clear deleted entry info when success message disappears
  React.useEffect(() => {
    if (!deleteSuccess.value) {
      setDeletedEntry(null);
    }
  }, [deleteSuccess.value]);
  
  // Historical tracking modal state
  const [showHistoricalModal, setShowHistoricalModal] = React.useState(false);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    title: string;
    variant: 'warning' | 'danger' | 'success';
    isDeleting?: boolean;
    isSuccess?: boolean;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    title: '',
    variant: 'warning',
    isDeleting: false,
    isSuccess: false
  });

  const validateForm = (): boolean => {
    const isFormValid = validate(eggForm.values);
    
    return isFormValid;
  };

  const submitEntry = async () => {
    try {
      // Use the hook's addEntry method
      const entryData: Omit<EggEntry, 'id'> = {
        date: eggForm.values.selectedDate,
        count: parseInt(eggForm.values.count) || 0,
        ...(eggForm.values.enableAdvanced && eggForm.values.size && eggForm.values.size.trim() ? { size: eggForm.values.size as EggEntry['size'] } : {}),
        ...(eggForm.values.enableAdvanced && eggForm.values.color && eggForm.values.color.trim() ? { color: eggForm.values.color as EggEntry['color'] } : {}),
        ...(eggForm.values.notes && eggForm.values.notes.trim() ? { notes: eggForm.values.notes } : {})
      };

      await addEntry(entryData);
      
      // Reset form and show success
      eggForm.resetValues();
      success.setTrue();
    } catch (error) {
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
      
      // Use validation hook for error setting
      validate({ count: eggForm.values.count, submit: errorMessage });
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    const entryToDelete = eggEntries.find(entry => entry.id === entryId);
    if (!entryToDelete) return;

    const entryDate = new Date(entryToDelete.date).toLocaleDateString();
    const eggCount = entryToDelete.count;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Egg Entry',
      message: `Are you sure you want to delete the entry from ${entryDate} with ${eggCount} egg${eggCount !== 1 ? 's' : ''}? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          // Store info about the entry being deleted for the success message
          setDeletedEntry({ 
            date: entryToDelete.date, 
            count: entryToDelete.count 
          });
          
          // Show deleting state
          setConfirmDialog(prev => ({ 
            ...prev, 
            isDeleting: true,
            message: 'Deleting entry...'
          }));
          
          await deleteEntry(entryId);
          
          // Show success state
          setConfirmDialog(prev => ({ 
            ...prev, 
            isDeleting: false,
            isSuccess: true,
            title: 'Entry Deleted',
            message: `Successfully deleted the entry from ${entryDate} with ${eggCount} egg${eggCount !== 1 ? 's' : ''}!`,
            variant: 'success'
          }));
          
          // Auto-close after 2 seconds
          setTimeout(() => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }, 2000);
          
        } catch (error) {
          console.error('Failed to delete entry:', error);
          // Show error state
          setConfirmDialog(prev => ({ 
            ...prev, 
            isDeleting: false,
            isSuccess: false,
            title: 'Delete Failed',
            message: 'Failed to delete the entry. Please try again.',
            variant: 'danger'
          }));
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearErrors();
    success.setFalse();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    // Check for exact duplicate (same date, size, and color)
    const exactDuplicate = eggEntries.find(entry => 
      entry.date === eggForm.values.selectedDate &&
      entry.size === (eggForm.values.size || undefined) &&
      entry.color === (eggForm.values.color || undefined)
    );
    
    if (exactDuplicate) {
      const sizeText = eggForm.values.size ? ` (${eggForm.values.size}` : '';
      const colorText = eggForm.values.color ? ` ${eggForm.values.color}` : '';
      const typeText = sizeText || colorText ? `${sizeText}${colorText}${sizeText ? ')' : ''}` : '';
      
      setConfirmDialog({
        isOpen: true,
        title: 'Duplicate Entry Found',
        message: `An entry for this date${typeText} already exists. Do you want to update it?`,
        variant: 'warning',
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          submitEntry();
        }
      });
      return;
    }

    // No duplicate, submit directly
    await submitEntry();
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
        className="w-full mb-0"
      >
        <AnimatedEggCounterPNG />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="neu-form p-6 shadow-lg transition-all duration-200 !mb-0"
      >
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left flex-1">
              <h2 className="neu-title">Log Daily Eggs</h2>
              <p className="text-gray-600 text-sm mt-1">Record your daily egg production</p>
            </div>
            {eggEntries.length === 0 && (
              <button
                onClick={() => setShowHistoricalModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-blue-700 hover:text-blue-800 font-medium"
                title="Add historical egg tracking data"
              >
                <span className="text-lg">📊</span>
                <span>Backfill History</span>
              </button>
            )}
          </div>
        </div>


        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Date<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="eggDate"
                    className="neu-input"
                    type="date"
                    value={eggForm.values.selectedDate}
                    onChange={(e) => eggForm.setValue('selectedDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {errors.find(e => e.field === 'selectedDate') && (
                    <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'selectedDate')?.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Number of Eggs<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    placeholder="Enter egg count"
                    min="0"
                    className="neu-input"
                    type="number"
                    value={eggForm.values.count}
                    onChange={(e) => {
                      eggForm.setValue('count', e.target.value);
                      clearErrors();
                    }}
                    required
                  />
                  {errors.find(e => e.field === 'count') && (
                    <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'count')?.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Notes
                  </label>
                  <input
                    placeholder="Optional notes about this entry"
                    className="neu-input"
                    type="text"
                    value={eggForm.values.notes}
                    onChange={(e) => {
                      eggForm.setValue('notes', e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced Logging Checkbox */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="enableAdvanced"
                  type="checkbox"
                  checked={eggForm.values.enableAdvanced}
                  onChange={(e) => {
                    eggForm.setValue('enableAdvanced', e.target.checked);
                    // Reset advanced fields when disabling
                    if (!e.target.checked) {
                      eggForm.setValue('size', '');
                      eggForm.setValue('color', '');
                    }
                  }}
                  className="neu-checkbox"
                />
                <label htmlFor="enableAdvanced" className="text-gray-600 text-sm cursor-pointer">
                  Enable detailed egg tracking (size & color)
                </label>
              </div>
              
              {/* Advanced Fields - Only show when checkbox is checked */}
              {eggForm.values.enableAdvanced && (
                <div className="glass-card-compact p-4 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-gray-600 text-sm mb-2">
                        Egg Size
                      </label>
                      <select
                        value={eggForm.values.size}
                        onChange={(e) => eggForm.setValue('size', e.target.value)}
                        className="neu-input"
                      >
                        <option value="">Select size (optional)</option>
                        <option value="small">Small (42.5g / 1.5 oz)</option>
                        <option value="medium">Medium (49.6g / 1.75 oz)</option>
                        <option value="large">Large (56.8g / 2 oz)</option>
                        <option value="extra-large">Extra Large (63.8g / 2.25 oz)</option>
                        <option value="jumbo">Jumbo (70.9g / 2.5 oz)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-600 text-sm mb-2">
                        Egg Color
                      </label>
                      <select
                        value={eggForm.values.color}
                        onChange={(e) => eggForm.setValue('color', e.target.value)}
                        className="neu-input"
                      >
                        <option value="">Select color (optional)</option>
                        <option value="white">White</option>
                        <option value="brown">Brown</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="speckled">Speckled</option>
                        <option value="cream">Cream</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || success.value}
                className={`neu-button transition-all duration-200 font-medium rounded-lg px-6 py-2 min-w-[200px] ${
                  success.value 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'shiny-cta bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                ) : success.value ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Saved Successfully!</span>
                  </div>
                ) : (
                  <span>Log Eggs</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Monthly Goal Progress Card - Only show if yearly goal is set */}
      {yearlyGoal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="!mb-0"
        >
          <ProgressCard
            title="Monthly Egg Production Goal"
            value={monthlyProgress}
            max={MONTHLY_EGG_GOAL}
            label={`Monthly target (${yearlyGoal.toLocaleString()}/year)`}
            color="success"
            animated={true}
            showPercentage={true}
            showValues={true}
          />
        </motion.div>
      )}

      {/* No Goal Set Message */}
      {yearlyGoal === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="!mb-0"
        >
          <div className="glass-card p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <span className="text-4xl">🎯</span>
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
                Set Your Annual Goal
              </h3>
              <p className="text-gray-600 text-sm max-w-md">
                Visit your profile page to set a yearly egg production goal and track your monthly progress.
              </p>
              <button
                onClick={() => window.location.href = '/profile?tab=goals'}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
              >
                Set Goal Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 !mb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ComparisonCard
            title="7 Day Comparison"
            before={{
              value: previousWeekTotal,
              label: "Previous 7 Days"
            }}
            after={{
              value: thisWeekTotal,
              label: "Last 7 Days"
            }}
            change={previousWeekTotal > 0 ? weekTrend.percentage : undefined}
            changeType={previousWeekTotal > 0 ? (weekTrend.isPositive ? 'increase' : 'decrease') : undefined}
            format="number"
            icon="📅"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ComparisonCard
            title="Monthly Comparison"
            before={{
              value: previousMonthTotal,
              label: "Previous Month"
            }}
            after={{
              value: thisMonthTotal,
              label: "This Month"
            }}
            change={previousMonthTotal > 0 ? monthTrend.percentage : undefined}
            changeType={previousMonthTotal > 0 ? (monthTrend.isPositive ? 'increase' : 'decrease') : undefined}
            format="number"
            icon="📊"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 !mb-0">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Total Eggs"
            total={totalEggs.toLocaleString()}
            label="eggs collected"
            icon="🥚"
            variant="corner-gradient"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <StatCard
            title="Average Daily"
            total={averageDaily}
            label="eggs per day"
            icon="📈"
            variant="corner-gradient"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatCard
            title="Lay Rate"
            total={`${layRate}%`}
            label={`of ${layingHens} laying hens`}
            icon="🐔"
            variant="corner-gradient"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <StatCard
            title="Protein Wiz"
            total={`${proteinGenerated} lbs`}
            label="of protein"
            icon="🧙‍♂️"
            variant="corner-gradient"
          />
        </motion.div>
      </div>


      <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: 0 }}>Recent Entries</h2>
      
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <DataTable
          data={paginatedEntries}
          columns={tableColumns}
          loading={isLoading}
          emptyMessage="No egg entries found"
          responsive={true}
        />
        
        {!isLoading && eggEntries.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={eggEntries.length}
            itemsPerPage={10}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            showInfo={true}
            variant="default"
          />
        )}
      </motion.div>

      {/* Confirm Dialog for duplicate entries and deletions */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.isSuccess ? () => setConfirmDialog(prev => ({ ...prev, isOpen: false })) : confirmDialog.onConfirm}
        title={confirmDialog.title || "Duplicate Entry Found"}
        message={confirmDialog.message}
        confirmText={
          confirmDialog.isDeleting ? 'Deleting...' : 
          confirmDialog.isSuccess ? 'Close' :
          confirmDialog.variant === 'danger' ? 'Delete' : 'Update'
        }
        cancelText={confirmDialog.isSuccess ? undefined : "Cancel"}
        variant={confirmDialog.variant}
        disabled={confirmDialog.isDeleting}
      />

      {/* Historical Egg Tracking Modal */}
      <HistoricalEggTrackingModal
        isOpen={showHistoricalModal}
        onClose={() => setShowHistoricalModal(false)}
        onSuccess={() => {
          setShowHistoricalModal(false);
          success.setTrue();
        }}
      />
    </motion.div>
  );
};
