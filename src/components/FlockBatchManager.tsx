import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlockBatch, DeathRecord, FlockSummary } from '../types';
import { BatchDetailView } from './BatchDetailView';

import { FormCard } from './ui/forms/FormCard';
import { FormField } from './ui/forms/FormField';
import { FormButton } from './ui/forms/FormButton';
import { FormModal } from './ui/modals/FormModal';
import { MetricDisplay } from './ui/cards/MetricDisplay';
import { StatCard } from './ui/cards/StatCard';
import { DataTable, TableColumn } from './ui/tables/DataTable';
import { EmptyState } from './ui/tables/EmptyState';
import { PageContainer } from './ui/layout/PageContainer';
// import { useAuth } from '../contexts/AuthContext'; // Unused import
import { apiService } from '../services/api';

interface FlockBatchManagerProps {
  className?: string;
}

export const FlockBatchManager = ({ className }: FlockBatchManagerProps) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'deaths' | 'add-batch'>('batches');
  const [selectedBatch, setSelectedBatch] = useState<FlockBatch | null>(null);
  const [batches, setBatches] = useState<FlockBatch[]>([]);
  const [deathRecords, setDeathRecords] = useState<DeathRecord[]>([]);
  const [flockSummary, setFlockSummary] = useState<FlockSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New batch form state
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    breed: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    hens: '',
    roosters: '',
    chicks: '',
    brooding: '',
    ageAtAcquisition: 'adult' as 'chick' | 'juvenile' | 'adult',
    layingStartDate: '', // Manual laying start date
    source: '',
    cost: '', // Cost of acquiring the batch
    notes: ''
  });

  // Death logging form state
  const [newDeath, setNewDeath] = useState({
    batchId: '',
    date: new Date().toISOString().split('T')[0],
    count: '',
    cause: 'unknown' as 'predator' | 'disease' | 'age' | 'injury' | 'unknown' | 'culled' | 'other',
    description: '',
    notes: ''
  });

  // Edit laying date modal state
  const [showLayingDateModal, setShowLayingDateModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<FlockBatch | null>(null);
  const [layingDateForm, setLayingDateForm] = useState('');

  // Load all data using specific API endpoints
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load flock data in parallel for better performance
      const [batchesRes, deathsRes, summaryRes] = await Promise.all([
        fetch('/api/flockBatches', {
          headers: await apiService.auth.getAuthHeaders(),
        }),
        fetch('/api/deathRecords', {
          headers: await apiService.auth.getAuthHeaders(),
        }),
        apiService.flock.getFlockSummary()
      ]);

      // Handle batch data
      if (!batchesRes.ok) {
        throw new Error('Failed to load batch data');
      }
      const batchesData = await batchesRes.json();
      setBatches(batchesData.data?.batches || []);

      // Handle death records
      if (!deathsRes.ok) {
        throw new Error('Failed to load death records');
      }
      const deathsData = await deathsRes.json();
      setDeathRecords(deathsData.data?.records || []);

      // Handle flock summary
      if (summaryRes.success) {
        const summaryData = summaryRes.data as { summary?: FlockSummary };
        setFlockSummary(summaryData.summary || null);
      } else {
        setFlockSummary(null);
      }
    } catch (err) {
      console.error('Error loading flock data:', err);
      setError('Failed to load flock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new batch
  const addBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Calculate counts
    const hensCount = parseInt(newBatch.hens) || 0;
    const roostersCount = parseInt(newBatch.roosters) || 0;
    const chicksCount = parseInt(newBatch.chicks) || 0;
    const broodingCount = parseInt(newBatch.brooding) || 0;
    const totalCount = hensCount + roostersCount + chicksCount + broodingCount;

    // Validation
    if (totalCount === 0) {
      setError('Please enter at least one bird (hens, roosters, chicks, or brooding hens)');
      setIsLoading(false);
      return;
    }

    // Determine batch type
    let batchType: 'hens' | 'roosters' | 'chicks' | 'mixed';
    const totalHensAndBrooding = hensCount + broodingCount;
    if (totalHensAndBrooding > 0 && roostersCount === 0 && chicksCount === 0) {
      batchType = 'hens';
    } else if (roostersCount > 0 && totalHensAndBrooding === 0 && chicksCount === 0) {
      batchType = 'roosters';
    } else if (chicksCount > 0 && totalHensAndBrooding === 0 && roostersCount === 0) {
      batchType = 'chicks';
    } else {
      batchType = 'mixed';
    }

    try {
      const cost = parseFloat(newBatch.cost) || 0;
      
      const batchData: FlockBatch = {
        id: '', // Will be generated by the API
        batchName: newBatch.batchName,
        breed: newBatch.breed,
        acquisitionDate: newBatch.acquisitionDate,
        initialCount: totalCount,
        currentCount: totalCount, // Initially same as initialCount
        type: batchType,
        ageAtAcquisition: newBatch.ageAtAcquisition,
        actualLayingStartDate: newBatch.layingStartDate || undefined, // Use manual date
        source: newBatch.source,
        cost,
        notes: newBatch.notes,
        isActive: true, // New batches are active by default
        // Add individual counts for database constraint
        hensCount,
        roostersCount,
        chicksCount,
        broodingCount
      } as FlockBatch;

      const response = await apiService.flock.saveFlockBatch(batchData);
      
      if (!response.success) {
        throw new Error('Failed to add batch');
      }

      const responseData = response.data as { batch: FlockBatch };
      setBatches(prev => [responseData.batch, ...prev]);
      
      // Reset form
      setNewBatch({
        batchName: '',
        breed: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        hens: '',
        roosters: '',
        chicks: '',
        brooding: '',
        ageAtAcquisition: 'adult',
        layingStartDate: '',
        source: '',
        cost: '',
        notes: ''
      });

      setSuccess(`Batch added successfully! (${totalCount} birds: ${hensCount} hens, ${roostersCount} roosters, ${chicksCount} chicks${broodingCount > 0 ? `, ${broodingCount} brooding` : ''})`);
      setActiveTab('batches');
      
      // Reload summary to get updated counts
      loadData();
    } catch (err) {
      console.error('Error adding batch:', err);
      setError('Failed to add batch. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused updateBatchLayingDate function

  // Open laying date modal
  const openLayingDateModal = (batch: FlockBatch) => {
    setEditingBatch(batch);
    setLayingDateForm(batch.actualLayingStartDate || '');
    setShowLayingDateModal(true);
  };

  // Close laying date modal
  const closeLayingDateModal = () => {
    setShowLayingDateModal(false);
    setEditingBatch(null);
    setLayingDateForm('');
  };

  // Save laying date changes
  const saveLayingDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    
    setError(null);

    try {
      const headers = await apiService.auth.getAuthHeaders();
      const response = await fetch('/api/flockBatches', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          batchId: editingBatch.id,
          actualLayingStartDate: layingDateForm || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update laying date');
      }

      // Update local state
      setBatches(prev => prev.map(batch => 
        batch.id === editingBatch.id 
          ? { ...batch, actualLayingStartDate: layingDateForm || undefined }
          : batch
      ));

      setSuccess(layingDateForm 
        ? `Laying start date updated to ${new Date(layingDateForm).toLocaleDateString()}`
        : 'Laying start date cleared'
      );
      closeLayingDateModal();
    } catch (err) {
      console.error('Error updating laying date:', err);
      setError(err instanceof Error ? err.message : 'Failed to update laying date. Please try again.');
    }
  };

  // Log death
  const logDeath = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const deathData: DeathRecord = {
        id: '', // Will be generated by the API
        batchId: newDeath.batchId,
        date: newDeath.date,
        count: parseInt(newDeath.count),
        cause: newDeath.cause,
        description: newDeath.description,
        notes: newDeath.notes
      };

      const response = await apiService.flock.saveDeathRecord(deathData);
      
      if (!response.success) {
        throw new Error('Failed to log death');
      }

      const responseData = response.data as { record: DeathRecord };
      setDeathRecords(prev => [responseData.record, ...prev]);
      
      // Reset form
      setNewDeath({
        batchId: '',
        date: new Date().toISOString().split('T')[0],
        count: '',
        cause: 'unknown',
        description: '',
        notes: ''
      });

      setSuccess('Death record logged successfully');
      
      // Reload data to get updated counts
      loadData();
    } catch (err) {
      console.error('Error logging death:', err);
      setError(err instanceof Error ? err.message : 'Failed to log death. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch update from detail view
  const handleBatchUpdate = (updatedBatch: FlockBatch) => {
    setBatches(prev => prev.map(batch => 
      batch.id === updatedBatch.id ? updatedBatch : batch
    ));
    setSelectedBatch(updatedBatch); // Update the selected batch as well
  };

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);


  // Define columns for batch DataTable
  const batchColumns: TableColumn<FlockBatch>[] = [
    {
      key: 'batchName',
      label: 'Batch Name',
      sortable: true,
      render: (_, batch) => (
        <button
          onClick={() => setSelectedBatch(batch)}
          className="flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors w-full"
        >
          <span className="text-xl">
            {batch.type === 'hens' ? '🐔' : 
             batch.type === 'roosters' ? '🐓' : 
             batch.type === 'chicks' ? '🐥' : '🐔'}
          </span>
          <div>
            <div className="font-semibold text-gray-900 hover:text-indigo-600">{batch.batchName}</div>
            <div className="text-sm text-gray-600">{batch.breed}</div>
          </div>
        </button>
      )
    },
    {
      key: 'currentCount',
      label: 'Current Count',
      sortable: true,
      render: (_, batch) => (
        <div className="text-lg font-bold text-indigo-600">{batch.currentCount}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (_, batch) => (
        <div>
          {(batch.type === 'hens' || batch.type === 'mixed') && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1 w-fit ${
              batch.actualLayingStartDate 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {batch.actualLayingStartDate ? (
                <>
                  🥚 <span>Laying</span>
                </>
              ) : (
                <>
                  ⏳ <span>Not Laying</span>
                </>
              )}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'initialCount',
      label: 'Started With',
      sortable: true,
      render: (_, batch) => <div className="font-semibold text-gray-700">{batch.initialCount}</div>
    },
    {
      key: 'acquisitionDate',
      label: 'Acquired',
      sortable: true,
      render: (_, batch) => (
        <div className="text-sm text-gray-700">
          {new Date(batch.acquisitionDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (value) => <div className="text-sm text-gray-600">{value as string}</div>
    },
    {
      key: 'actualLayingStartDate',
      label: 'Laying Since',
      sortable: true,
      render: (value, batch) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {(batch.type === 'hens' || batch.type === 'mixed') ? (
              value 
                ? new Date(value as string).toLocaleDateString()
                : 'Not set'
            ) : (
              // For roosters/chicks, show age but still allow editing
              batch.ageAtAcquisition.charAt(0).toUpperCase() + batch.ageAtAcquisition.slice(1)
            )}
          </span>
          <button
            onClick={() => openLayingDateModal(batch)}
            className="text-blue-500 hover:text-blue-700 text-sm"
            title="Edit laying date"
          >
            📅
          </button>
        </div>
      )
    }
  ];

  // Define columns for death records DataTable
  const deathRecordsColumns: TableColumn<DeathRecord>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-700">
          {new Date(value as string).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'batchId',
      label: 'Batch',
      render: (batchId) => {
        const batch = batches.find(b => b.id === batchId);
        return (
          <div className="flex items-center gap-2">
            <span className="text-red-500">😢</span>
            <span className="font-medium text-gray-900">
              {batch?.batchName || 'Unknown Batch'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'count',
      label: 'Birds Lost',
      sortable: true,
      render: (value) => (
        <div className="font-semibold text-red-600">{value as number}</div>
      )
    },
    {
      key: 'cause',
      label: 'Cause',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value as string}>
          {value as string}
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'batches', label: '🐔 Batches', icon: '🐔' },
    { id: 'deaths', label: '😢 Losses', icon: '😢' },
    { id: 'add-batch', label: '➕ Add Batch', icon: '➕' }
  ];

  return (
    <PageContainer maxWidth="xl" className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <header className="header">
        <h1 
          className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent"
          role="heading"
          aria-level={1}
        >
          🐔 Flock Batch Manager
        </h1>
        <p className="text-gray-600 mt-2" role="doc-subtitle">
          Organize chickens into batches, track losses, and manage flock groups
        </p>
      </header>

      {/* Batch Statistics */}
      {!isLoading && flockSummary && (
        <section 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          aria-label="Flock batch statistics"
          role="region"
        >
          <div className="glass-card p-6">
            <MetricDisplay
              value={batches.length}
              label="Total Batches"
              format="number"
              precision={0}
              variant="default"
              color="default"
              loading={isLoading}
              testId="total-batches-metric"
            />
          </div>
          <div className="glass-card p-6">
            <MetricDisplay
              value={flockSummary.totalBirds || 0}
              label="Total Birds"
              format="number"
              precision={0}
              variant="default"
              color="success"
              loading={isLoading}
              testId="total-birds-metric"
            />
          </div>
          <div className="glass-card p-6">
            <MetricDisplay
              value={batches.filter(b => b.actualLayingStartDate).length}
              label="Laying Batches"
              format="number"
              precision={0}
              variant="default"
              color="info"
              loading={isLoading}
              testId="laying-batches-metric"
            />
          </div>
          <div className="glass-card p-6">
            <MetricDisplay
              value={deathRecords.reduce((sum, record) => sum + (record.count || 0), 0)}
              label="Total Losses"
              format="number"
              precision={0}
              variant="default"
              color="danger"
              loading={isLoading}
              testId="total-losses-metric"
            />
          </div>
        </section>
      )}

      {/* Flock Overview */}
      {!isLoading && batches.length > 0 && (
        <section 
          aria-label="Flock overview by bird type"
          role="region"
        >
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-xl">🐔</span>
            Flock Overview
          </h2>
          <div className={`grid grid-cols-2 md:grid-cols-${batches.some(b => (b.broodingCount || 0) > 0) ? '5' : '4'} gap-4`}>
            <StatCard
              title="Laying Hens"
              total={batches
                .filter(batch => batch.actualLayingStartDate) // Only batches that are laying
                .reduce((sum, batch) => {
                  const hens = batch.hensCount || 0;
                  const brooding = batch.broodingCount || 0;
                  return sum + Math.max(0, hens - brooding); // Subtract brooding hens from laying hens
                }, 0)}
              label={`${batches.filter(b => b.actualLayingStartDate && (b.hensCount || 0) > 0).length} batches laying`}
              icon="🐔"
              variant="corner-gradient"
              testId="laying-hens-stat"
            />
            <StatCard
              title="Not Laying"
              total={batches
                .filter(batch => !batch.actualLayingStartDate && ((batch.hensCount || 0) > 0 || batch.type === 'hens')) // Batches not laying that have hens or are hen batches
                .reduce((sum, batch) => {
                  const hens = batch.hensCount || 0;
                  const brooding = batch.broodingCount || 0;
                  return sum + Math.max(0, hens - brooding); // Subtract brooding hens from not laying hens
                }, 0)}
              label={`${batches.filter(b => !b.actualLayingStartDate && ((b.hensCount || 0) > 0 || b.type === 'hens')).length} batches not laying`}
              icon="⏳"
              variant="corner-gradient"
              testId="not-laying-hens-stat"
            />
            {batches.some(b => (b.broodingCount || 0) > 0) && (
              <StatCard
                title="Brooding Hens"
                total={batches.reduce((sum, batch) => sum + (batch.broodingCount || 0), 0)}
                label={`${batches.filter(b => (b.broodingCount || 0) > 0).length} batches brooding`}
                icon="🪺"
                variant="corner-gradient"
                testId="brooding-hens-stat"
              />
            )}
            <StatCard
              title="Roosters"
              total={batches.reduce((sum, batch) => sum + (batch.roostersCount || 0), 0)}
              label={`${batches.filter(b => (b.roostersCount || 0) > 0).length} batches`}
              icon="🐓"
              variant="corner-gradient"
              testId="roosters-stat"
            />
            <StatCard
              title="Chicks"
              total={batches.reduce((sum, batch) => sum + (batch.chicksCount || 0), 0)}
              label={`${batches.filter(b => (b.chicksCount || 0) > 0).length} batches`}
              icon="🐥"
              variant="corner-gradient"
              testId="chicks-stat"
            />
          </div>
        </section>
      )}

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="success-toast"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="error-toast"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <nav 
        className="glass-card p-2 flex gap-2 overflow-x-auto whitespace-nowrap max-w-full"
        role="tablist"
        aria-label="Flock batch management sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'batches' | 'deaths' | 'add-batch')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            <span className="text-lg" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label.replace(/^.+ /, '')}</span>
            {tab.id === 'batches' && batches.length > 0 && (
              <span 
                className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}
                aria-label={`${batches.length} batches`}
              >
                {batches.length}
              </span>
            )}
            {tab.id === 'deaths' && deathRecords.length > 0 && (
              <span 
                className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}
                aria-label={`${deathRecords.length} death records`}
              >
                {deathRecords.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'batches' && (
          <motion.div
            key="batches"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
            role="tabpanel"
            id="batches-panel"
            aria-labelledby="batches-tab"
          >
            <div className="neu-form">
              <h2 className="neu-title">Manage Batches</h2>
              {!selectedBatch && batches.length > 0 && (
                <p className="text-sm text-gray-600 mb-4">
                  💡 Click on any batch name to view details, composition, and timeline
                </p>
              )}
              {batches.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="No Batches Yet"
                  message="Start organizing your flock by adding your first batch"
                  action={{
                    text: "Add First Batch",
                    onClick: () => setActiveTab('add-batch')
                  }}
                />
              ) : selectedBatch ? (
                <BatchDetailView
                  batch={selectedBatch}
                  onBack={() => setSelectedBatch(null)}
                  onBatchUpdate={handleBatchUpdate}
                />
              ) : (
                <DataTable<FlockBatch>
                  data={batches}
                  columns={batchColumns}
                  loading={isLoading}
                  sortable={true}
                  onSort={(column, direction) => {
                    const sortedBatches = [...batches].sort((a, b) => {
                      const aValue = a[column as keyof FlockBatch];
                      const bValue = b[column as keyof FlockBatch];
                      if (direction === 'asc') {
                        return String(aValue).localeCompare(String(bValue));
                      }
                      return String(bValue).localeCompare(String(aValue));
                    });
                    setBatches(sortedBatches);
                  }}
                  responsive={true}
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'deaths' && (
          <motion.div
            key="deaths"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Death Logging Form */}
            <FormCard
              title="Log New Loss"
              subtitle="Record bird losses to track flock health"
              onSubmit={logDeath}
              loading={isLoading}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Batch" required>
                  <select
                    value={newDeath.batchId}
                    onChange={(e) => setNewDeath({ ...newDeath, batchId: e.target.value })}
                    className="neu-input"
                    required
                  >
                    <option value="">Select batch...</option>
                    {batches.filter(b => b.currentCount > 0).map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName} ({batch.currentCount} birds)
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Date" required>
                  <input
                    type="date"
                    value={newDeath.date}
                    onChange={(e) => setNewDeath({ ...newDeath, date: e.target.value })}
                    className="neu-input"
                    required
                  />
                </FormField>
                <FormField label="Number Lost" required>
                  <input
                    type="number"
                    min="1"
                    value={newDeath.count}
                    onChange={(e) => setNewDeath({ ...newDeath, count: e.target.value })}
                    className="neu-input"
                    placeholder="Number of birds"
                    required
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Cause" required>
                  <select
                    value={newDeath.cause}
                    onChange={(e) => setNewDeath({ ...newDeath, cause: e.target.value as 'predator' | 'disease' | 'age' | 'injury' | 'unknown' | 'culled' | 'other' })}
                    className="neu-input"
                    required
                  >
                    <option value="unknown">Unknown</option>
                    <option value="predator">Predator Attack</option>
                    <option value="disease">Disease/Illness</option>
                    <option value="age">Old Age</option>
                    <option value="injury">Injury</option>
                    <option value="culled">Culled</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>
                <FormField label="Description" required>
                  <input
                    type="text"
                    value={newDeath.description}
                    onChange={(e) => setNewDeath({ ...newDeath, description: e.target.value })}
                    className="neu-input"
                    placeholder="Brief description..."
                    required
                  />
                </FormField>
              </div>
              
              <FormField label="Additional Notes">
                <textarea
                  value={newDeath.notes}
                  onChange={(e) => setNewDeath({ ...newDeath, notes: e.target.value })}
                  className="neu-input min-h-[80px]"
                  placeholder="Additional details..."
                  rows={3}
                />
              </FormField>
              
              <FormButton 
                type="submit" 
                loading={isLoading}
                fullWidth
              >
                Log Loss
              </FormButton>
            </FormCard>

            {/* Death Records History */}
            <div className="neu-form">
              <h2 className="neu-title">Loss History</h2>
              {deathRecords.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="No Losses Recorded"
                  message="No bird losses have been logged yet"
                  variant="compact"
                />
              ) : (
                <DataTable<DeathRecord>
                  data={deathRecords}
                  columns={deathRecordsColumns}
                  loading={isLoading}
                  sortable={true}
                  onSort={(column, direction) => {
                    const sortedRecords = [...deathRecords].sort((a, b) => {
                      const aValue = a[column as keyof DeathRecord];
                      const bValue = b[column as keyof DeathRecord];
                      if (column === 'date') {
                        const aDate = new Date(aValue as string);
                        const bDate = new Date(bValue as string);
                        return direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
                      }
                      if (direction === 'asc') {
                        return String(aValue).localeCompare(String(bValue));
                      }
                      return String(bValue).localeCompare(String(aValue));
                    });
                    setDeathRecords(sortedRecords);
                  }}
                  responsive={true}
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'add-batch' && (
          <motion.div
            key="add-batch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FormCard
              title="Add New Batch"
              subtitle="Enter batch details to organize your flock management"
              onSubmit={addBatch}
              loading={isLoading}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Batch Name" required>
                  <input
                    type="text"
                    value={newBatch.batchName}
                    onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                    className="neu-input"
                    placeholder="e.g., Spring 2024 Layers"
                    required
                  />
                </FormField>
                <FormField label="Breed" required>
                  <input
                    type="text"
                    value={newBatch.breed}
                    onChange={(e) => setNewBatch({ ...newBatch, breed: e.target.value })}
                    className="neu-input"
                    placeholder="e.g., Rhode Island Red"
                    required
                  />
                </FormField>
              </div>

              <FormField 
                label="🐔 Bird Counts" 
                help="Enter 0 for types you don't have"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField label="🐔 Hens">
                    <input
                      type="number"
                      min="0"
                      value={newBatch.hens}
                      onChange={(e) => setNewBatch({ ...newBatch, hens: e.target.value })}
                      className="neu-input"
                      placeholder="0"
                    />
                  </FormField>
                  <FormField label="🪺 Brooding">
                    <input
                      type="number"
                      min="0"
                      value={newBatch.brooding}
                      onChange={(e) => setNewBatch({ ...newBatch, brooding: e.target.value })}
                      className="neu-input"
                      placeholder="0"
                    />
                  </FormField>
                  <FormField label="🐓 Roosters">
                    <input
                      type="number"
                      min="0"
                      value={newBatch.roosters}
                      onChange={(e) => setNewBatch({ ...newBatch, roosters: e.target.value })}
                      className="neu-input"
                      placeholder="0"
                    />
                  </FormField>
                  <FormField label="🐥 Chicks">
                    <input
                      type="number"
                      min="0"
                      value={newBatch.chicks}
                      onChange={(e) => setNewBatch({ ...newBatch, chicks: e.target.value })}
                      className="neu-input"
                      placeholder="0"
                    />
                  </FormField>
                </div>
                {/* Show total count preview */}
                {(parseInt(newBatch.hens) || 0) + (parseInt(newBatch.roosters) || 0) + (parseInt(newBatch.chicks) || 0) + (parseInt(newBatch.brooding) || 0) > 0 && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                    Total: {(parseInt(newBatch.hens) || 0) + (parseInt(newBatch.roosters) || 0) + (parseInt(newBatch.chicks) || 0) + (parseInt(newBatch.brooding) || 0)} birds
                    {(parseInt(newBatch.hens) || 0) > 0 && ` (${parseInt(newBatch.hens)} hens`}
                    {(parseInt(newBatch.brooding) || 0) > 0 && `, ${parseInt(newBatch.brooding)} brooding`}
                    {(parseInt(newBatch.roosters) || 0) > 0 && `, ${parseInt(newBatch.roosters)} roosters`}
                    {(parseInt(newBatch.chicks) || 0) > 0 && `, ${parseInt(newBatch.chicks)} chicks`})
                  </div>
                )}
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Age at Acquisition" required>
                  <select
                    value={newBatch.ageAtAcquisition}
                    onChange={(e) => setNewBatch({ ...newBatch, ageAtAcquisition: e.target.value as 'chick' | 'juvenile' | 'adult' })}
                    className="neu-input"
                    required
                  >
                    <option value="chick">Chick (0-8 weeks)</option>
                    <option value="juvenile">Juvenile (8-18 weeks)</option>
                    <option value="adult">Adult (18+ weeks)</option>
                  </select>
                </FormField>
                <FormField label="Acquisition Date" required>
                  <input
                    type="date"
                    value={newBatch.acquisitionDate}
                    onChange={(e) => setNewBatch({ ...newBatch, acquisitionDate: e.target.value })}
                    className="neu-input"
                    required
                  />
                </FormField>
                <FormField 
                  label="🥚 Laying Start Date" 
                  help="Leave blank if not laying yet. Set when hens actually start laying."
                >
                  <input
                    type="date"
                    value={newBatch.layingStartDate}
                    onChange={(e) => setNewBatch({ ...newBatch, layingStartDate: e.target.value })}
                    className="neu-input"
                    min={newBatch.acquisitionDate}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Source" required>
                  <input
                    type="text"
                    value={newBatch.source}
                    onChange={(e) => setNewBatch({ ...newBatch, source: e.target.value })}
                    className="neu-input"
                    placeholder="e.g., Local Hatchery, Farm Store"
                    required
                  />
                </FormField>
                <FormField 
                  label="💰 Cost" 
                  help="Leave blank or enter 0 if free"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBatch.cost}
                    onChange={(e) => setNewBatch({ ...newBatch, cost: e.target.value })}
                    className="neu-input"
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              <FormField label="Notes">
                <textarea
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                  className="neu-input min-h-[100px]"
                  placeholder="Additional notes about this batch..."
                  rows={4}
                />
              </FormField>

              <FormButton 
                type="submit" 
                loading={isLoading} 
                fullWidth
              >
                Add Batch
              </FormButton>
            </FormCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laying Date Modal */}
      <FormModal
        isOpen={showLayingDateModal}
        onClose={closeLayingDateModal}
        title="🥚 Set Laying Date"
        onSubmit={saveLayingDate}
        submitText="Set Date"
        loading={isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Batch: <span className="font-medium">{editingBatch?.batchName}</span> ({editingBatch?.type})
            </p>
            <p>
              {(editingBatch?.type === 'hens' || editingBatch?.type === 'mixed') 
                ? 'Set the date when this batch started laying eggs.'
                : 'Set a laying date if this batch will eventually lay eggs (optional for roosters/chicks).'
              }
            </p>
          </div>

          <FormField label="Laying Start Date">
            <input
              type="date"
              value={layingDateForm}
              onChange={(e) => setLayingDateForm(e.target.value)}
              className="neu-input"
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to clear the laying date
            </p>
          </FormField>
        </div>
      </FormModal>
    </PageContainer>
  );
};