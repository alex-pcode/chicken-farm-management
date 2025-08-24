import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BatchEvent } from '../types';
import { apiService } from '../services/api';
import { Timeline, TimelineItem } from './ui/timeline/Timeline';

interface BatchTimelineProps {
  batchId: string;
  batchName: string;
  className?: string;
}

interface TimelineEventFormData {
  date: string;
  type: string;
  description: string;
  affectedCount: number | null;
  notes: string;
}

export const BatchTimeline = ({ batchId, batchName, className }: BatchTimelineProps) => {
  const [events, setEvents] = useState<BatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      const response = await fetch(`/api/batchEvents?batchId=${batchId}`, {
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
  }, [batchId]);

  // Add new event
  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const eventData = {
        batchId,
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
      setShowAddForm(false);
      
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load events when batch changes
  useEffect(() => {
    if (isExpanded) {
      loadEvents();
    }
  }, [batchId, isExpanded, loadEvents]);

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

  // Convert BatchEvent to TimelineItem
  const convertToTimelineItems = (events: BatchEvent[]): TimelineItem[] => {
    const getEventStyle = (type: string) => {
      const styles = {
        health_check: { icon: '🩺', color: 'blue' as const },
        vaccination: { icon: '💉', color: 'green' as const },
        relocation: { icon: '🏠', color: 'purple' as const },
        breeding: { icon: '💕', color: 'red' as const },
        laying_start: { icon: '🥚', color: 'yellow' as const },
        production_note: { icon: '📝', color: 'indigo' as const },
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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className || ''}`}>
      {/* Timeline Header */}
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📅</span>
            <div>
              <h3 className="font-medium text-gray-900">Timeline</h3>
              <p className="text-sm text-gray-600">
                {events.length === 0 ? 'No events yet' : `${events.length} event${events.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▼
          </motion.div>
        </div>
      </div>

      {/* Timeline Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {/* Messages */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
                  >
                    {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Event Button */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Events for {batchName}</h4>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={isLoading}
                >
                  {showAddForm ? 'Cancel' : '+ Add Event'}
                </button>
              </div>

              {/* Add Event Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={addEvent}
                    className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type *
                        </label>
                        <select
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="health_check">Health Check</option>
                          <option value="vaccination">Vaccination</option>
                          <option value="relocation">Relocation</option>
                          <option value="breeding">Breeding</option>
                          <option value="laying_start">Laying Start</option>
                          <option value="production_note">Production Note</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Brief description of the event..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Affected Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newEvent.affectedCount || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, affectedCount: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Number of birds affected"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={newEvent.notes}
                        onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Additional details..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Adding...' : 'Add Event'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Timeline Events */}
              <Timeline
                items={convertToTimelineItems(events)}
                variant="compact"
                layout="alternating"
                loading={isLoading}
                emptyMessage="No events recorded yet"
                emptyIcon="📅"
                className="!p-0 !bg-transparent !shadow-none !border-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};