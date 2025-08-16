import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlockBatch, DeathRecord, FlockSummary } from '../types';
import { StatCard } from './ui';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface FlockBatchManagerProps {
  className?: string;
}

export const FlockBatchManager = ({ className }: FlockBatchManagerProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'batches' | 'deaths' | 'add-batch'>('batches');
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
    ageAtAcquisition: 'adult' as 'chick' | 'juvenile' | 'adult',
    layingStartDate: '', // Manual laying start date
    source: '',
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

  // API Helper function
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!user) throw new Error('User not authenticated');

    const headers = await apiService.auth.getAuthHeaders();
    
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  };

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load in parallel for better performance
      const [batchesRes, deathsRes, summaryRes] = await Promise.all([
        makeAuthenticatedRequest('/api/flockBatches'),
        makeAuthenticatedRequest('/api/deathRecords'),
        makeAuthenticatedRequest('/api/flockSummary')
      ]);

      if (!batchesRes.ok || !deathsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to load flock data');
      }

      const [batchesData, deathsData, summaryData] = await Promise.all([
        batchesRes.json(),
        deathsRes.json(),
        summaryRes.json()
      ]);

      setBatches(batchesData.data.batches || []);
      setDeathRecords(deathsData.data.records || []);
      setFlockSummary(summaryData.data.summary || null);
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
    const totalCount = hensCount + roostersCount + chicksCount;

    // Validation
    if (totalCount === 0) {
      setError('Please enter at least one bird (hens, roosters, or chicks)');
      setIsLoading(false);
      return;
    }

    // Determine batch type
    let batchType: 'hens' | 'roosters' | 'chicks' | 'mixed';
    if (hensCount > 0 && roostersCount === 0 && chicksCount === 0) {
      batchType = 'hens';
    } else if (roostersCount > 0 && hensCount === 0 && chicksCount === 0) {
      batchType = 'roosters';
    } else if (chicksCount > 0 && hensCount === 0 && roostersCount === 0) {
      batchType = 'chicks';
    } else {
      batchType = 'mixed';
    }

    try {
      const response = await makeAuthenticatedRequest('/api/flockBatches', {
        method: 'POST',
        body: JSON.stringify({
          batchName: newBatch.batchName,
          breed: newBatch.breed,
          acquisitionDate: newBatch.acquisitionDate,
          initialCount: totalCount,
          type: batchType,
          ageAtAcquisition: newBatch.ageAtAcquisition,
          actualLayingStartDate: newBatch.layingStartDate || null, // Use manual date
          source: newBatch.source,
          notes: newBatch.notes,
          // Include individual counts for future use
          hensCount,
          roostersCount,
          chicksCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add batch');
      }

      const result = await response.json();
      setBatches(prev => [result.data.batch, ...prev]);
      
      // Reset form
      setNewBatch({
        batchName: '',
        breed: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        hens: '',
        roosters: '',
        chicks: '',
        ageAtAcquisition: 'adult',
        layingStartDate: '',
        source: '',
        notes: ''
      });

      setSuccess(`Batch added successfully! (${totalCount} birds: ${hensCount} hens, ${roostersCount} roosters, ${chicksCount} chicks)`);
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

  // Update batch laying start date
  const updateBatchLayingDate = async (batchId: string, layingDate: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest('/api/flockBatches', {
        method: 'PUT',
        body: JSON.stringify({
          batchId,
          actualLayingStartDate: layingDate || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update laying date');
      }

      const result = await response.json();
      
      // Update local state
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, actualLayingStartDate: layingDate || null }
          : batch
      ));

      setSuccess(layingDate 
        ? `Laying start date updated to ${new Date(layingDate).toLocaleDateString()}`
        : 'Laying start date cleared'
      );
      
      // Reload summary to get updated counts
      loadData();
    } catch (err) {
      console.error('Error updating laying date:', err);
      setError(err instanceof Error ? err.message : 'Failed to update laying date. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Log death
  const logDeath = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest('/api/deathRecords', {
        method: 'POST',
        body: JSON.stringify({
          batchId: newDeath.batchId,
          date: newDeath.date,
          count: parseInt(newDeath.count),
          cause: newDeath.cause,
          description: newDeath.description,
          notes: newDeath.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log death');
      }

      const result = await response.json();
      setDeathRecords(prev => [result.data.record, ...prev]);
      
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

  const tabs = [
    { id: 'batches', label: '🐔 Batches', icon: '🐔' },
    { id: 'deaths', label: '💀 Losses', icon: '💀' },
    { id: 'add-batch', label: '➕ Add Batch', icon: '➕' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-6 max-w-7xl mx-auto ${className || ''}`}
    >
      {/* Header */}
      <div className="header">
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          🐔 Flock Batch Manager
        </h1>
        <p className="text-gray-600 mt-2">Organize chickens into batches, track losses, and manage flock groups</p>
      </div>

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
      <div className="neu-form">
        <div className="flex flex-wrap gap-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'batches' | 'deaths' | 'add-batch')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'batches' && (
          <motion.div
            key="batches"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="neu-form">
              <h2 className="neu-title">Manage Batches</h2>
              {batches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-500">No batches yet. Add your first batch!</p>
                  <button
                    onClick={() => setActiveTab('add-batch')}
                    className="neu-button mt-4"
                  >
                    Add First Batch
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {batch.type === 'hens' ? '🐔' : 
                               batch.type === 'roosters' ? '🐓' : 
                               batch.type === 'chicks' ? '🐥' : '🐔'}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{batch.batchName}</h3>
                              <p className="text-sm text-gray-600">{batch.breed} • {batch.source}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Current Count</p>
                              <p className="text-lg font-bold text-indigo-600">{batch.currentCount}</p>
                              {(batch.type === 'hens' || batch.type === 'mixed') && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  batch.actualLayingStartDate 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                  {batch.actualLayingStartDate ? '🥚 Laying' : '⏳ Not laying yet'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Started With</p>
                              <p className="text-lg font-bold text-gray-700">{batch.initialCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Acquired</p>
                              <p className="text-sm text-gray-700">
                                {new Date(batch.acquisitionDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                {batch.actualLayingStartDate ? 'Started Laying' : 'Age at Acquisition'}
                              </p>
                              <p className="text-sm text-gray-700">
                                {batch.actualLayingStartDate 
                                  ? new Date(batch.actualLayingStartDate).toLocaleDateString()
                                  : batch.ageAtAcquisition.charAt(0).toUpperCase() + batch.ageAtAcquisition.slice(1)
                                }
                              </p>
                            </div>
                          </div>

                          {batch.notes && (
                            <div className="mt-4 p-3 bg-white rounded border-l-4 border-gray-200">
                              <p className="text-sm text-gray-600">{batch.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="neu-form">
              <h2 className="neu-title">Log New Loss</h2>
              <form onSubmit={logDeath} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Batch
                    </label>
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
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDeath.date}
                      onChange={(e) => setNewDeath({ ...newDeath, date: e.target.value })}
                      className="neu-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Number Lost
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newDeath.count}
                      onChange={(e) => setNewDeath({ ...newDeath, count: e.target.value })}
                      className="neu-input"
                      placeholder="Number of birds"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Cause
                    </label>
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
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newDeath.description}
                      onChange={(e) => setNewDeath({ ...newDeath, description: e.target.value })}
                      className="neu-input"
                      placeholder="Brief description..."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={newDeath.notes}
                    onChange={(e) => setNewDeath({ ...newDeath, notes: e.target.value })}
                    className="neu-input min-h-[80px]"
                    placeholder="Additional details..."
                    rows={3}
                  />
                </div>
                <button type="submit" className="neu-button" disabled={isLoading}>
                  {isLoading ? 'Logging...' : 'Log Loss'}
                </button>
              </form>
            </div>

            {/* Death Records History */}
            <div className="neu-form">
              <h2 className="neu-title">Loss History</h2>
              {deathRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500">No losses recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deathRecords.map((record) => {
                    const batch = batches.find(b => b.id === record.batchId);
                    return (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-red-500 text-lg">💀</span>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {record.count} birds lost - {batch?.batchName || 'Unknown Batch'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(record.date).toLocaleDateString()} • {record.cause}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                            {record.notes && (
                              <p className="text-xs text-gray-500 italic">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            <div className="neu-form">
              <h2 className="neu-title">Add New Batch</h2>
              <form onSubmit={addBatch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Batch Name
                    </label>
                    <input
                      type="text"
                      value={newBatch.batchName}
                      onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                      className="neu-input"
                      placeholder="e.g., Spring 2024 Layers"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={newBatch.breed}
                      onChange={(e) => setNewBatch({ ...newBatch, breed: e.target.value })}
                      className="neu-input"
                      placeholder="e.g., Rhode Island Red"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-3">
                    <span className="flex items-center gap-2">
                      🐔 Bird Counts
                      <span className="text-xs text-gray-500">(Enter 0 for types you don't have)</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">
                        🐔 Hens
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newBatch.hens}
                        onChange={(e) => setNewBatch({ ...newBatch, hens: e.target.value })}
                        className="neu-input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">
                        🐓 Roosters
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newBatch.roosters}
                        onChange={(e) => setNewBatch({ ...newBatch, roosters: e.target.value })}
                        className="neu-input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-xs mb-1">
                        🐥 Chicks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newBatch.chicks}
                        onChange={(e) => setNewBatch({ ...newBatch, chicks: e.target.value })}
                        className="neu-input"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {/* Show total count preview */}
                  {(parseInt(newBatch.hens) || 0) + (parseInt(newBatch.roosters) || 0) + (parseInt(newBatch.chicks) || 0) > 0 && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                      Total: {(parseInt(newBatch.hens) || 0) + (parseInt(newBatch.roosters) || 0) + (parseInt(newBatch.chicks) || 0)} birds
                      {(parseInt(newBatch.hens) || 0) > 0 && ` (${parseInt(newBatch.hens)} hens`}
                      {(parseInt(newBatch.roosters) || 0) > 0 && `, ${parseInt(newBatch.roosters)} roosters`}
                      {(parseInt(newBatch.chicks) || 0) > 0 && `, ${parseInt(newBatch.chicks)} chicks`})
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Age at Acquisition
                    </label>
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
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      Acquisition Date
                    </label>
                    <input
                      type="date"
                      value={newBatch.acquisitionDate}
                      onChange={(e) => setNewBatch({ ...newBatch, acquisitionDate: e.target.value })}
                      className="neu-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">
                      <span className="flex items-center gap-2">
                        🥚 Laying Start Date
                        <span className="text-xs text-gray-500">(Optional)</span>
                      </span>
                    </label>
                    <input
                      type="date"
                      value={newBatch.layingStartDate}
                      onChange={(e) => setNewBatch({ ...newBatch, layingStartDate: e.target.value })}
                      className="neu-input"
                      min={newBatch.acquisitionDate}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank if not laying yet. Set when hens actually start laying.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newBatch.source}
                    onChange={(e) => setNewBatch({ ...newBatch, source: e.target.value })}
                    className="neu-input"
                    placeholder="e.g., Local Hatchery, Farm Store"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newBatch.notes}
                    onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                    className="neu-input min-h-[100px]"
                    placeholder="Additional notes about this batch..."
                    rows={4}
                  />
                </div>

                <button type="submit" className="neu-button full-width" disabled={isLoading}>
                  {isLoading ? 'Adding Batch...' : 'Add Batch'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};