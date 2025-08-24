import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { FlockProfile, FlockEvent, FlockSummary } from '../types';
import { apiService } from '../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
// import { StatCard } from './ui/cards/StatCard'; // Unused import
import { EmptyState } from './ui/tables/EmptyState';
import { Timeline, TimelineItem } from './ui/timeline/Timeline';
import { FlockOverview } from './FlockOverview';
import AnimatedFarmPNG from './AnimatedFarmPNG';
import { useAuth } from '../contexts/AuthContext';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput, 
  TextareaInput,
  SubmitButton 
} from './forms';
import { useFormState } from '../hooks/useFormState';
import { useToggle, useTimeoutToggle } from '../hooks/utils';

const EVENT_TYPES = {
  acquisition: '🐣 New Birds Acquired',
  laying_start: '🥚 Started Laying',
  broody: '🐔 Went Broody',
  hatching: '🐣 Eggs Hatched',
  other: '📝 Other Event'
};


export const Profile = () => {
  const { user } = useAuth();
  const { data, isLoading: profileLoading } = useOptimizedAppData();
  const cachedProfile = data.flockProfile;
  const [profile, setProfile] = useState<FlockProfile>({
    id: undefined,
    hens: 0,
    roosters: 0,
    chicks: 0,
    brooding: 0,
    lastUpdated: new Date().toISOString(),
    breedTypes: [],
    events: [],
    flockStartDate: new Date().toISOString(),
    notes: ""
  });

  const [flockSummary, setFlockSummary] = useState<FlockSummary | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // Use custom hooks to reduce useState calls
  const batchLoading = useToggle(false);
  const success = useTimeoutToggle(false, 3000);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  
  // Event form state management with custom hook
  const eventForm = useFormState({
    initialValues: {
      type: 'acquisition' as FlockEvent['type'],
      date: new Date().toISOString().split('T')[0],
      description: '',
      affectedBirds: undefined as number | undefined,
      notes: ''
    }
  });  

  // Function to fetch flock summary from batch management
  const fetchFlockSummary = useCallback(async () => {
    if (!user) return;
    
    batchLoading.setTrue();
    try {
      const response = await apiService.flock.getFlockSummary();
      
      if (response.data) {
        const data = response.data as { summary?: FlockSummary };
        setFlockSummary(data.summary || null);
      } else {
        // No data available yet
        console.log('No flock summary data available yet');
        setFlockSummary(null);
      }
    } catch (error) {
      console.error('Error fetching flock summary:', error);
      // Don't set error state, just leave flockSummary as null
      setFlockSummary(null);
    } finally {
      batchLoading.setFalse();
      setHasLoadedOnce(true);
    }
  }, [user, batchLoading]);

  useEffect(() => {
    if (!profileLoading && cachedProfile) {
      // Use the cached profile data
      const updatedProfile = {
        id: cachedProfile.id,
        hens: cachedProfile.hens || 0,
        roosters: cachedProfile.roosters || 0,
        chicks: cachedProfile.chicks || 0,
        brooding: cachedProfile.brooding || 0,
        lastUpdated: cachedProfile.lastUpdated || new Date().toISOString(),
        breedTypes: cachedProfile.breedTypes || [],
        events: cachedProfile.events || [],
        flockStartDate: cachedProfile.flockStartDate || new Date().toISOString(),
        notes: cachedProfile.notes || ""
      };
      setProfile(updatedProfile);
      
      // Fetch batch summary data
      fetchFlockSummary();
    }
  }, [cachedProfile, profileLoading, user, fetchFlockSummary]);


  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.values.description?.trim()) {
      setError('Please provide an event description');
      return;
    }

    setIsLoading(true);
    setError(null);

    const event: FlockEvent = {
      id: Date.now().toString(), // Temporary ID, will be replaced by database ID
      date: eventForm.values.date || new Date().toISOString().split('T')[0],
      type: eventForm.values.type as FlockEvent['type'],
      description: eventForm.values.description.trim(),
      affectedBirds: eventForm.values.affectedBirds,
      notes: eventForm.values.notes?.trim()
    };

    try {
      // Check if we have a profile ID, if not we need to get it first
      if (!profile.id) {
        setError('Profile not loaded yet. Please wait and try again.');
        return;
      }

      // Save event to database using consolidated API service
      const response = await apiService.flock.saveFlockEvent(profile.id, event);
      
      if (response && response.data && (response.data as { event?: FlockEvent }).event) {
        // Use the database event data which includes the proper ID
        const dbEvent = (response.data as { event: FlockEvent }).event;
        const eventForState: FlockEvent = {
          id: dbEvent.id.toString(),
          date: dbEvent.date,
          type: dbEvent.type,
          description: dbEvent.description,
          affectedBirds: (dbEvent as unknown as { affected_birds: number }).affected_birds,
          notes: dbEvent.notes
        };
        
        // Update local state with the new event
        const updatedProfile = {
          ...profile,
          events: [...(profile.events || []), eventForState].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        };
        
        setProfile(updatedProfile);
        eventForm.resetValues();
        success.setTrue();
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to add event. Please try again.';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvent = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete event from database using consolidated API service
      await apiService.flock.deleteFlockEvent(eventId);
      
      // Update local state by removing the event
      const updatedProfile = {
        ...profile,
        events: profile.events.filter(e => e.id !== eventId)
      };
      
      setProfile(updatedProfile);
      success.setTrue();
    } catch (error) {
      console.error('Error removing event:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to remove event. Please try again.';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const startEditEvent = (event: FlockEvent) => {
    setEditingEvent(event.id);
    setIsEditMode(true);
    eventForm.setValues({
      type: event.type,
      date: event.date,
      description: event.description,
      affectedBirds: event.affectedBirds,
      notes: event.notes || ''
    });
    // Scroll to form
    document.querySelector('.neu-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !eventForm.values.description?.trim()) {
      setError('Please provide an event description');
      return;
    }

    setIsLoading(true);
    setError(null);

    const updatedEventData = {
      id: editingEvent,
      date: eventForm.values.date || new Date().toISOString().split('T')[0],
      type: eventForm.values.type,
      description: eventForm.values.description.trim(),
      affectedBirds: eventForm.values.affectedBirds,
      notes: eventForm.values.notes?.trim()
    };

    try {
      // Debug logging
      console.log('Frontend - Updating event:', {
        profileId: profile.id || '1',
        eventId: editingEvent,
        eventData: updatedEventData
      });
      
      // Update event in database using consolidated API service
      const result = await apiService.flock.saveFlockEvent(profile.id || '1', updatedEventData, editingEvent);
      
      if (result && result.data && (result.data as { event?: FlockEvent }).event) {
        // Use the database event data
        const dbEvent = (result.data as { event: FlockEvent }).event;
        const eventForState: FlockEvent = {
          id: dbEvent.id.toString(),
          date: dbEvent.date,
          type: dbEvent.type,
          description: dbEvent.description,
          affectedBirds: (dbEvent as unknown as { affected_birds: number }).affected_birds,
          notes: dbEvent.notes
        };
        
        // Update local state by replacing the updated event
        const updatedProfile = {
          ...profile,
          events: profile.events.map(e => e.id === editingEvent ? eventForState : e).sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        };
        
        setProfile(updatedProfile);
        setIsEditMode(false);
        setEditingEvent(null);
        eventForm.resetValues();
        success.setTrue();
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to update event. Please try again.';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Session expired. Please refresh the page to continue.';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error instanceof ServerError) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error instanceof ApiServiceError) {
        errorMessage = getUserFriendlyErrorMessage(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {/* Animated Farm Welcome Component */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-10 lg:mt-0 mb-8"
      >
        <AnimatedFarmPNG />
      </motion.div>


      {flockSummary === null && !batchLoading.value && hasLoadedOnce && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="glass-card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📦</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">🚀 Batch Management Available!</h2>
                <p className="text-gray-700 mb-4">
                  Upgrade your flock tracking with our new batch management system. Track groups of chickens, 
                  log losses automatically, and get better production insights.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✨ Benefits:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Track chickens in groups instead of individual counts</li>
                    <li>• Automatic count updates when logging deaths/losses</li>
                    <li>• Production analysis based on actual flock size</li>
                    <li>• Mortality tracking with detailed insights</li>
                    <li>• Better egg production rate analysis</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">🔧 Setup Required:</h4>
                  <p className="text-sm text-blue-800">
                    Run the database migration in your Supabase dashboard. 
                    See <code className="bg-blue-100 px-1 rounded">BATCH_MANAGEMENT_SETUP.md</code> for instructions.
                  </p>
                </div>

                <div className="flex gap-3">
                  <a 
                    href="/flock-batches" 
                    className="neu-button-secondary text-sm"
                  >
                    View Batch Manager
                  </a>
                  <button 
                    onClick={fetchFlockSummary}
                    className="neu-button text-sm"
                    disabled={batchLoading.value}
                  >
                    {batchLoading.value ? 'Checking...' : 'Check Again'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {flockSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-6"
        >
          {/* New Flock Overview Component */}
          <FlockOverview 
            flockSummary={flockSummary}
            isLoading={batchLoading.value}
          />
        </motion.div>
      )}

      {/* Quick Migration Notice */}
      {flockSummary && flockSummary.totalBirds === 0 && (profile.hens > 0 || profile.roosters > 0 || profile.chicks > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="neu-form">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-lg">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Upgrade to Batch Management</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    You're currently tracking {profile.hens + profile.roosters + profile.chicks + profile.brooding} birds individually. 
                    Batch management lets you track groups of chickens, log losses automatically, and get better production insights.
                  </p>
                  <Link 
                    to="/flock-batches"
                    className="neu-button-secondary text-sm bg-yellow-100 hover:bg-yellow-200"
                  >
                    Start Using Batches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events Form */}
      <div className="neu-form">
        <h2 className="neu-title">📝 {isEditMode ? 'Edit Event' : 'Add New Event'}</h2>
        
        {success.value && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {isEditMode ? "Event updated successfully!" : "Event added successfully!"}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={isEditMode ? updateEvent : addEvent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              label="Event Type"
              value={eventForm.values.type || 'acquisition'}
              onChange={(value) => eventForm.setValue('type', value as FlockEvent['type'])}
              options={Object.entries(EVENT_TYPES).map(([value, label]) => ({ value, label }))}
              required
            />
            <DateInput
              label="Date"
              value={eventForm.values.date || ''}
              onChange={(value) => eventForm.setValue('date', value)}
              required
            />
            <NumberInput
              label="Number of Birds (optional)"
              value={eventForm.values.affectedBirds || 0}
              onChange={(value) => eventForm.setValue('affectedBirds', value || undefined)}
              min={0}
              placeholder="Enter number of birds"
            />
          </div>
          <TextInput
            label="Description"
            value={eventForm.values.description || ''}
            onChange={(value) => eventForm.setValue('description', value)}
            placeholder="Describe the event..."
            required
          />
          <TextareaInput
            label="Additional Notes"
            value={eventForm.values.notes || ''}
            onChange={(value) => eventForm.setValue('notes', value)}
            placeholder="Add any additional notes..."
            rows={3}
          />
          <div className="flex gap-4 pt-4">
            <SubmitButton
              isLoading={isLoading}
              loadingText={isEditMode ? 'Updating...' : 'Adding...'}
              text={isEditMode ? 'Update Event' : 'Add Event'}
              className="md:w-auto md:min-w-[200px]"
            />
            {isEditMode && (
              <button 
                type="button" 
                onClick={() => {
                  setIsEditMode(false);
                  setEditingEvent(null);
                  eventForm.resetValues();
                }}
                className="neu-button-secondary full-width md:w-auto md:min-w-[200px]"
                disabled={isLoading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-form"
      >
        <h2 className="neu-title">📅 Events Timeline</h2>
        
        {profile.events.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events recorded yet"
            message="Add your first event above to start tracking your flock's timeline!"
          />
        ) : (
          <Timeline
            layout="alternating"
            items={[...profile.events].sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ).map((event): TimelineItem => {
              const eventIcon = event.type === 'acquisition' ? '🐣' :
                               event.type === 'laying_start' ? '🥚' :
                               event.type === 'broody' ? '🐔' :
                               event.type === 'hatching' ? '🐣' : '📝';
              
              const eventColor = event.type === 'acquisition' ? 'green' as const :
                                event.type === 'laying_start' ? 'yellow' as const :
                                event.type === 'broody' ? 'red' as const :
                                event.type === 'hatching' ? 'blue' as const : 'purple' as const;
              
              return {
                id: event.id,
                icon: eventIcon,
                color: eventColor,
                date: event.date,
                title: event.description,
                description: event.notes,
                content: event.affectedBirds ? (
                  <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full w-fit">
                    <span>🐔</span>
                    <span className="font-medium text-gray-600">{event.affectedBirds} birds affected</span>
                  </div>
                ) : undefined,
                actions: [
                  {
                    label: 'Edit',
                    onClick: () => startEditEvent(event),
                    variant: 'secondary' as const,
                    icon: '✎'
                  },
                  {
                    label: 'Remove',
                    onClick: () => removeEvent(event.id),
                    variant: 'danger' as const,
                    icon: '×'
                  }
                ]
              };
            })}
          />
        )}
      </motion.div>


    </motion.div>
  );
};