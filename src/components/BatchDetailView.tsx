import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlockBatch, BatchEvent } from '../types';
import { apiService } from '../services/api';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { Timeline, TimelineItem } from './ui/timeline/Timeline';
import { FormCard } from './ui/forms/FormCard';
import { FormField } from './ui/forms/FormField';
import { FormButton } from './ui/forms/FormButton';
import { FormModal } from './ui/modals/FormModal';
import { MetricDisplay } from './ui/cards/MetricDisplay';

interface BatchDetailViewProps {
  batch: FlockBatch;
  onBack: () => void;
  onBatchUpdate?: (updatedBatch: FlockBatch) => void;
  className?: string;
}

interface TimelineEventFormData {
  date: string;
  type: string;
  description: string;
  affectedCount: number | null;
  notes: string;
}

export const BatchDetailView = ({ batch, onBack, onBatchUpdate, className }: BatchDetailViewProps) => {
  const { refreshData } = useOptimizedAppData();
  const [events, setEvents] = useState<BatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for editing batch composition
  const [showEditComposition, setShowEditComposition] = useState(false);
  const [editingComposition, setEditingComposition] = useState({
    hens: '',
    roosters: '',
    chicks: '',
    brooding: ''
  });

  // Form state for adding new events
  const [newEvent, setNewEvent] = useState<TimelineEventFormData>({
    date: new Date().toISOString().split('T')[0],
    type: 'other',
    description: '',
    affectedCount: null,
    notes: ''
  });

  // Load batch events
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = await apiService.auth.getAuthHeaders();
      const response = await fetch(`/api/batchEvents?batchId=${batch.id}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to load timeline events');
      }

      const data = await response.json();
      setEvents(data.data?.events || []);
    } catch (err) {
      console.error('Error loading batch events:', err);
      setError('Failed to load timeline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [batch.id]);

  // Refresh batch data after brooding events
  const refreshBatchData = async () => {
    if (!onBatchUpdate) return;
    
    try {
      const headers = await apiService.auth.getAuthHeaders();
      const response = await fetch(`/api/flockBatches?batchId=${batch.id}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to refresh batch data');
      }

      const data = await response.json();
      
      if (data.data?.batch) {
        onBatchUpdate(data.data.batch);
      }
    } catch (err) {
      console.error('Error refreshing batch data:', err);
    }
  };

  // Open composition editing form
  const openEditComposition = () => {
    setEditingComposition({
      hens: (batch.hensCount || 0).toString(),
      roosters: (batch.roostersCount || 0).toString(),
      chicks: (batch.chicksCount || 0).toString(),
      brooding: (batch.broodingCount || 0).toString()
    });
    setShowEditComposition(true);
  };

  // Close composition editing form
  const closeEditComposition = () => {
    setShowEditComposition(false);
    setEditingComposition({
      hens: '',
      roosters: '',
      chicks: '',
      brooding: ''
    });
  };

  // Save composition changes
  const saveCompositionChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const hensCount = parseInt(editingComposition.hens) || 0;
      const roostersCount = parseInt(editingComposition.roosters) || 0;
      const chicksCount = parseInt(editingComposition.chicks) || 0;
      const broodingCount = parseInt(editingComposition.brooding) || 0;
      const newCurrentCount = hensCount + roostersCount + chicksCount + broodingCount;

      // Validation
      if (newCurrentCount === 0) {
        setError('At least one bird must remain in the batch');
        return;
      }

      // Determine new batch type
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

      const headers = await apiService.auth.getAuthHeaders();
      const response = await fetch('/api/flockBatches', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          batchId: batch.id,
          hensCount,
          roostersCount,
          chicksCount,
          broodingCount,
          currentCount: newCurrentCount,
          type: batchType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update batch composition');
      }

      // Update local state
      const updatedBatch = {
        ...batch,
        hensCount,
        roostersCount,
        chicksCount,
        broodingCount,
        currentCount: newCurrentCount,
        type: batchType
      };

      if (onBatchUpdate) {
        onBatchUpdate(updatedBatch);
      }

      setSuccess(`Batch composition updated: ${hensCount} hens, ${roostersCount} roosters, ${chicksCount} chicks, ${broodingCount} brooding`);
      closeEditComposition();
      
    } catch (err) {
      console.error('Error updating batch composition:', err);
      setError(err instanceof Error ? err.message : 'Failed to update batch composition. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new event
  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const eventData = {
        batchId: batch.id,
        date: newEvent.date,
        type: newEvent.type,
        description: newEvent.description,
        affectedCount: newEvent.affectedCount || undefined,
        notes: newEvent.notes
      };

      const headers = await apiService.auth.getAuthHeaders();
      const response = await fetch('/api/batchEvents', {
        method: 'POST',
        headers,
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Failed to add event');
      }

      const result = await response.json();
      setEvents(prev => [result.data.event, ...prev]);
      
      // Reset form
      setNewEvent({
        date: new Date().toISOString().split('T')[0],
        type: 'other',
        description: '',
        affectedCount: null,
        notes: ''
      });

      setSuccess('Event added to timeline');
      
      // Refresh batch data if this was a brooding event
      if (newEvent.type === 'brooding_start' || newEvent.type === 'brooding_stop') {
        await refreshBatchData();
      }

      // Refresh global data to update Profile timeline (since batch events propagate to flock events)
      await refreshData();
      
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert BatchEvent to TimelineItem
  const convertToTimelineItems = (events: BatchEvent[]): TimelineItem[] => {
    const getEventStyle = (type: string) => {
      const styles = {
        health_check: { icon: '🩺', color: 'blue' as const },
        vaccination: { icon: '💉', color: 'green' as const },
        relocation: { icon: '🏠', color: 'purple' as const },
        breeding: { icon: '💕', color: 'red' as const },
        laying_start: { icon: '🥚', color: 'yellow' as const },
        brooding_start: { icon: '🪺', color: 'yellow' as const },
        brooding_stop: { icon: '🐔', color: 'green' as const },
        production_note: { icon: '📝', color: 'indigo' as const },
        flock_added: { icon: '🎉', color: 'green' as const },
        flock_loss: { icon: '💔', color: 'red' as const },
        other: { icon: '📋', color: 'gray' as const }
      };
      return styles[type as keyof typeof styles] || styles.other;
    };

    return events.map(event => {
      const style = getEventStyle(event.type);
      return {
        id: event.id,
        title: event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: event.description,
        date: event.date,
        icon: style.icon,
        color: style.color,
        content: (
          <div className="space-y-2">
            {event.affectedCount && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {event.affectedCount} birds affected
                </span>
              </div>
            )}
            {event.notes && (
              <p className="text-sm text-gray-600 italic">
                {event.notes}
              </p>
            )}
          </div>
        )
      };
    });
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [batch.id, loadEvents]);

  // Clear messages after delay
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

  // Calculate age in weeks
  const getAgeInWeeks = () => {
    const acquisitionDate = new Date(batch.acquisitionDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - acquisitionDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Back to Batches
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">
              {batch.type === 'hens' ? '🐔' : 
               batch.type === 'roosters' ? '🐓' : 
               batch.type === 'chicks' ? '🐥' : '🐔'}
            </span>
            {batch.batchName}
          </h1>
          <p className="text-gray-600">{batch.breed} • {batch.type.charAt(0).toUpperCase() + batch.type.slice(1)}</p>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Composition */}
      <div className="neu-form">
        <div className="flex justify-between items-center mb-6">
          <h2 className="neu-title !mb-0">Batch Composition</h2>
          <button
            onClick={openEditComposition}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ✏️ Edit Composition
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-4">
            <MetricDisplay
              value={batch.currentCount}
              label="Current Total"
              format="number"
              precision={0}
              variant="default"
              color="default"
              testId="current-total-metric"
            />
          </div>
          <div className="glass-card p-4">
            <MetricDisplay
              value={batch.hensCount || 0}
              label="Hens"
              format="number"
              precision={0}
              variant="default"
              color="success"
              testId="hens-count-metric"
            />
          </div>
          <div className="glass-card p-4">
            <MetricDisplay
              value={batch.broodingCount || 0}
              label="Brooding"
              format="number"
              precision={0}
              variant="default"
              color="warning"
              testId="brooding-count-metric"
            />
          </div>
          <div className="glass-card p-4">
            <MetricDisplay
              value={batch.roostersCount || 0}
              label="Roosters"
              format="number"
              precision={0}
              variant="default"
              color="info"
              testId="roosters-count-metric"
            />
          </div>
          <div className="glass-card p-4">
            <MetricDisplay
              value={batch.chicksCount || 0}
              label="Chicks"
              format="number"
              precision={0}
              variant="default"
              color="warning"
              testId="chicks-count-metric"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acquired</label>
            <p className="text-gray-900">{new Date(batch.acquisitionDate).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">{getAgeInWeeks()} weeks ago</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age at Acquisition</label>
            <p className="text-gray-900 capitalize">{batch.ageAtAcquisition}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <p className="text-gray-900">{batch.source}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <p className="text-gray-900">
              {batch.cost && batch.cost > 0 ? `$${batch.cost.toFixed(2)}` : 'Free'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Started With</label>
            <p className="text-gray-900">{batch.initialCount} birds</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laying Status</label>
            <div className="flex items-center gap-2">
              {batch.actualLayingStartDate ? (
                <>
                  <span className="text-green-600">🥚 Laying</span>
                  <span className="text-xs text-gray-500">
                    since {new Date(batch.actualLayingStartDate).toLocaleDateString()}
                  </span>
                </>
              ) : (
                <span className="text-amber-600">⏳ Not laying yet</span>
              )}
            </div>
          </div>
          {batch.notes && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <p className="text-gray-900 text-sm">{batch.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Form */}
      <FormCard
        title="Add Timeline Event"
        subtitle="Record important events for this batch"
        onSubmit={addEvent}
        loading={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Date" required>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="neu-input"
              required
            />
          </FormField>
          <FormField label="Event Type" required>
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              className="neu-input"
              required
            >
              <option value="health_check">🩺 Health Check</option>
              <option value="vaccination">💉 Vaccination</option>
              <option value="relocation">🏠 Relocation</option>
              <option value="breeding">💕 Breeding</option>
              <option value="laying_start">🥚 Laying Start</option>
              <option value="brooding_start">🪺 Brooding Start</option>
              <option value="brooding_stop">🐔 Brooding Stop</option>
              <option value="production_note">📝 Production Note</option>
              <option value="flock_added">🎉 Flock Added</option>
              <option value="flock_loss">💔 Flock Loss</option>
              <option value="other">📋 Other</option>
            </select>
          </FormField>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Description" required>
            <input
              type="text"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="neu-input"
              placeholder="Brief description of the event..."
              required
            />
          </FormField>
          <FormField label="Affected Count">
            <input
              type="number"
              min="0"
              value={newEvent.affectedCount || ''}
              onChange={(e) => setNewEvent({ ...newEvent, affectedCount: e.target.value ? parseInt(e.target.value) : null })}
              className="neu-input"
              placeholder="Number of birds affected"
            />
          </FormField>
        </div>
        
        <FormField label="Notes">
          <textarea
            value={newEvent.notes}
            onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
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
          Add Event
        </FormButton>
      </FormCard>

      {/* Timeline */}
      <div className="neu-form">
        <h2 className="neu-title">Timeline</h2>
        <Timeline
          items={convertToTimelineItems(events)}
          variant="default"
          layout="alternating"
          loading={isLoading}
          emptyMessage="No events recorded yet"
          emptyIcon="📅"
          className="!p-0 !bg-transparent !shadow-none !border-none"
        />
      </div>

      {/* Edit Composition Modal */}
      <FormModal
        isOpen={showEditComposition}
        onClose={closeEditComposition}
        title="✏️ Edit Batch Composition"
        onSubmit={saveCompositionChanges}
        submitText="Save Changes"
        loading={isLoading}
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Batch: <span className="font-medium">{batch.batchName}</span> ({batch.breed})
            </p>
            <p className="text-amber-600">
              💡 Use this to update bird counts when chicks grow up or batch composition changes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="🐔 Hens">
              <input
                type="number"
                min="0"
                value={editingComposition.hens}
                onChange={(e) => setEditingComposition({ ...editingComposition, hens: e.target.value })}
                className="neu-input"
                placeholder="0"
              />
            </FormField>
            <FormField label="🪺 Brooding Hens">
              <input
                type="number"
                min="0"
                value={editingComposition.brooding}
                onChange={(e) => setEditingComposition({ ...editingComposition, brooding: e.target.value })}
                className="neu-input"
                placeholder="0"
              />
            </FormField>
            <FormField label="🐓 Roosters">
              <input
                type="number"
                min="0"
                value={editingComposition.roosters}
                onChange={(e) => setEditingComposition({ ...editingComposition, roosters: e.target.value })}
                className="neu-input"
                placeholder="0"
              />
            </FormField>
            <FormField label="🐥 Chicks">
              <input
                type="number"
                min="0"
                value={editingComposition.chicks}
                onChange={(e) => setEditingComposition({ ...editingComposition, chicks: e.target.value })}
                className="neu-input"
                placeholder="0"
              />
            </FormField>
          </div>

          {/* Show total count preview */}
          {((parseInt(editingComposition.hens) || 0) + (parseInt(editingComposition.roosters) || 0) + (parseInt(editingComposition.chicks) || 0) + (parseInt(editingComposition.brooding) || 0)) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Updated Composition:</h4>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Total: {(parseInt(editingComposition.hens) || 0) + (parseInt(editingComposition.roosters) || 0) + (parseInt(editingComposition.chicks) || 0) + (parseInt(editingComposition.brooding) || 0)} birds</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {(parseInt(editingComposition.hens) || 0) > 0 && <li>{parseInt(editingComposition.hens)} hens</li>}
                  {(parseInt(editingComposition.brooding) || 0) > 0 && <li>{parseInt(editingComposition.brooding)} brooding hens</li>}
                  {(parseInt(editingComposition.roosters) || 0) > 0 && <li>{parseInt(editingComposition.roosters)} roosters</li>}
                  {(parseInt(editingComposition.chicks) || 0) > 0 && <li>{parseInt(editingComposition.chicks)} chicks</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
};