import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { FlockProfile, FlockEvent, FlockSummary } from '../types';
import { apiService } from '../services/api';
import { ApiServiceError, AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage } from '../types/api';
import { useFlockProfile } from '../contexts/DataContext';
import { StatCard } from './ui';
import AnimatedFarmPNG from './AnimatedFarmPNG';
import { useAuth } from '../contexts/AuthContext';
import { 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput, 
  TextareaInput,
  FormCard, 
  FormGroup, 
  FormRow, 
  SubmitButton 
} from './forms';
import { useFormState } from '../hooks/useFormState';
import { useToggle, useTimeoutToggle } from '../hooks/utils';
import { useAsync } from '../hooks/utils';

const EVENT_TYPES = {
  acquisition: '🐣 New Birds Acquired',
  laying_start: '🥚 Started Laying',
  broody: '🐔 Went Broody',
  hatching: '🐣 Eggs Hatched',
  other: '📝 Other Event'
};


export const Profile = () => {
  const { user } = useAuth();
  const { flockProfile: cachedProfile, isLoading: profileLoading, updateFlockProfile } = useFlockProfile();
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
  
  // Use custom hooks to reduce useState calls
  const batchLoading = useToggle(false);
  const success = useTimeoutToggle(false, 3000);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Breed form state management with custom hook
  const breedForm = useFormState({
    initialValues: {
      newBreed: '',
      acquisitionAge: 'chick',
      layingStartDate: '',
      source: ''
    }
  });
  
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
  const fetchFlockSummary = async () => {
    if (!user) return;
    
    batchLoading.setTrue();
    try {
      const response = await apiService.flock.getFlockSummary();
      
      if (response.data) {
        setFlockSummary(response.data.summary || response.data);
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
    }
  };

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
  }, [cachedProfile, profileLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const updatedProfile = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      breedTypes: profile.breedTypes || []
    };
      try {
      // Save using consolidated API service
      await apiService.flock.saveFlockProfile(updatedProfile);
      
      setProfile(updatedProfile);
      updateFlockProfile(updatedProfile);
      success.setTrue();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Use standardized error handling with user-friendly messages
      let errorMessage = 'Failed to save profile. Please try again.';
      
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
      
      if (response && response.data && response.data.event) {
        // Use the database event data which includes the proper ID
        const dbEvent = response.data.event;
        const eventForState: FlockEvent = {
          id: dbEvent.id.toString(),
          date: dbEvent.date,
          type: dbEvent.type,
          description: dbEvent.description,
          affectedBirds: dbEvent.affected_birds,
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
        eventForm.resetForm();
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

  const startEditEvent = (event: FlockEvent) => {
    setEditingEvent(event.id);
    eventForm.setValues({
      type: event.type,
      date: event.date,
      description: event.description,
      affectedBirds: event.affectedBirds,
      notes: event.notes || ''
    });
  };

  const cancelEditEvent = () => {
    setEditingEvent(null);
    eventForm.resetForm();
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
      date: eventForm.values.date || new Date().toISOString().split('T')[0],
      type: eventForm.values.type,
      description: eventForm.values.description.trim(),
      affectedBirds: eventForm.values.affectedBirds,
      notes: eventForm.values.notes?.trim()
    };

    try {
      // Update event in database using consolidated API service
      const result = await apiService.flock.saveFlockEvent(profile.id || '1', updatedEventData, editingEvent);
      
      if (result && result.data && result.data.event) {
        // Use the database event data
        const dbEvent = result.data.event;
        const eventForState: FlockEvent = {
          id: dbEvent.id.toString(),
          date: dbEvent.date,
          type: dbEvent.type,
          description: dbEvent.description,
          affectedBirds: dbEvent.affected_birds,
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
        cancelEditEvent();
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

      {/* Batch Management Summary */}
      {flockSummary === null && !batchLoading.value && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
        >
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
        </motion.div>
      )}

      {flockSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📦 Batch Management Overview</h2>
            <Link 
              to="/flock-batches" 
              className="neu-button-secondary text-sm"
            >
              Manage Batches
            </Link>
          </div>
          
          {batchLoading.value ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatCard 
                  title="🐔 Total Birds" 
                  total={flockSummary.totalBirds} 
                  label="in batch system"
                />
                <StatCard 
                  title="� Hens" 
                  total={flockSummary.totalHens || 0} 
                  label="female birds"
                />
                <StatCard 
                  title="🐓 Roosters" 
                  total={flockSummary.totalRoosters || 0} 
                  label="male birds"
                />
                <StatCard 
                  title="🐥 Chicks" 
                  total={flockSummary.totalChicks || 0} 
                  label="young birds"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard 
                  title="�📦 Active Batches" 
                  total={flockSummary.activeBatches} 
                  label="managed groups"
                />
                <StatCard 
                  title="🥚 Expected Layers" 
                  total={flockSummary.expectedLayers} 
                  label="laying age"
                />
                <StatCard 
                  title="💀 Mortality Rate" 
                  total={`${flockSummary.mortalityRate}%`} 
                  label="overall loss rate"
                />
              </div>

              {flockSummary.batchSummary.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Batches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flockSummary.batchSummary.slice(0, 6).map((batch) => (
                      <div key={batch.id} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {batch.type === 'hens' ? '🐔' : 
                             batch.type === 'roosters' ? '🐓' : 
                             batch.type === 'chicks' ? '🐥' : '🐔'}
                          </span>
                          <h4 className="font-semibold text-gray-900 text-sm">{batch.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{batch.breed}</p>
                        <p className="text-lg font-bold text-indigo-600">{batch.currentCount} birds</p>
                        <p className="text-xs text-gray-500">
                          Since {new Date(batch.acquisitionDate).toLocaleDateString()}
                        </p>
                        {batch.type === 'hens' && (
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            batch.isLayingAge 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {batch.isLayingAge ? 'Laying Age' : 'Pre-Laying'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {flockSummary.batchSummary.length > 6 && (
                    <div className="mt-4 text-center">
                      <button 
                        className="neu-button-secondary text-sm"
                        onClick={() => {
                          // Navigate to full batch manager
                          console.log('Show all batches');
                        }}
                      >
                        View All {flockSummary.batchSummary.length} Batches
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batches Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start using batch management to track your flock in groups and get better insights.
                  </p>
                  <button 
                    className="neu-button"
                    onClick={() => {
                      // Navigate to add batch
                      console.log('Navigate to add batch');
                    }}
                  >
                    Add Your First Batch
                  </button>
                </div>
              )}

              {/* Quick Migration Notice */}
              {flockSummary.totalBirds === 0 && (profile.hens > 0 || profile.roosters > 0 || profile.chicks > 0) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 text-lg">💡</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Upgrade to Batch Management</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        You're currently tracking {profile.hens + profile.roosters + profile.chicks + profile.brooding} birds individually. 
                        Batch management lets you track groups of chickens, log losses automatically, and get better production insights.
                      </p>
                      <button 
                        className="neu-button-secondary text-sm bg-yellow-100 hover:bg-yellow-200"
                        onClick={() => {
                          // Navigate to migration or batch setup
                          console.log('Start batch migration');
                        }}
                      >
                        Start Using Batches
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Profile Stats */}

      <FormCard
        title="Add New Batch"
        success={success.value ? "Batch added successfully!" : undefined}
        error={error || undefined}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormRow>
            <TextInput
              label="Batch Name"
              value={profile.notes || ''}
              onChange={(value) => setProfile({ ...profile, notes: value })}
              placeholder="e.g., Spring 2024 Layers"
              required
            />
            <TextInput
              label="Breed"
              value={breedForm.values.newBreed}
              onChange={(value) => breedForm.setFieldValue('newBreed', value)}
              placeholder="e.g., Rhode Island Red"
              required
            />
          </FormRow>

          <FormGroup 
            label={
              <span className="flex items-center gap-2">
                🐔 Bird Counts
                <span className="text-xs text-gray-500">(Enter 0 for types you don't have)</span>
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput
                label="🐔 Hens"
                value={profile.hens}
                onChange={(value) => setProfile({ ...profile, hens: value })}
                min={0}
                placeholder="0"
              />
              <NumberInput
                label="🐓 Roosters"
                value={profile.roosters}
                onChange={(value) => setProfile({ ...profile, roosters: value })}
                min={0}
                placeholder="0"
              />
              <NumberInput
                label="🐥 Chicks"
                value={profile.chicks}
                onChange={(value) => setProfile({ ...profile, chicks: value })}
                min={0}
                placeholder="0"
              />
            </div>
            {/* Show total count preview */}
            {(profile.hens + profile.roosters + profile.chicks) > 0 && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                Total: {profile.hens + profile.roosters + profile.chicks} birds
                {profile.hens > 0 && ` (${profile.hens} hens`}
                {profile.roosters > 0 && `, ${profile.roosters} roosters`}
                {profile.chicks > 0 && `, ${profile.chicks} chicks`})
              </div>
            )}
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectInput
              label="Age at Acquisition"
              value={breedForm.values.acquisitionAge}
              onChange={(value) => breedForm.setFieldValue('acquisitionAge', value)}
              options={[
                { value: 'chick', label: 'Chick (0-8 weeks)' },
                { value: 'juvenile', label: 'Juvenile (8-18 weeks)' },
                { value: 'adult', label: 'Adult (18+ weeks)' }
              ]}
              required
            />
            <DateInput
              label="Acquisition Date"
              value={profile.flockStartDate?.split('T')[0] || ''}
              onChange={(value) => setProfile({ ...profile, flockStartDate: new Date(value).toISOString() })}
              required
            />
            <DateInput
              label={
                <span className="flex items-center gap-2">
                  🥚 Laying Start Date
                  <span className="text-xs text-gray-500">(Optional)</span>
                </span>
              }
              value={breedForm.values.layingStartDate}
              onChange={(value) => breedForm.setFieldValue('layingStartDate', value)}
              helperText="Leave blank if not laying yet. Set when hens actually start laying."
            />
          </div>

          <TextInput
            label="Source"
            value={breedForm.values.source}
            onChange={(value) => breedForm.setFieldValue('source', value)}
            placeholder="e.g., Local Hatchery, Farm Store"
            required
          />

          <TextareaInput
            label="Notes"
            value={profile.notes || ''}
            onChange={(value) => setProfile({ ...profile, notes: value })}
            placeholder="Additional notes about this batch..."
            rows={4}
          />

          <SubmitButton
            isLoading={isLoading}
            loadingText="Adding Batch..."
            text="Add Batch"
          />
        </form>
      </FormCard>

      <FormCard
        title={editingEvent ? 'Edit Event 📝' : 'Flock Timeline 📅'}
        success={success.value ? (editingEvent ? "Event updated successfully!" : "Event added successfully!") : undefined}
        error={error || undefined}
      >
        <form onSubmit={editingEvent ? updateEvent : addEvent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              label="Event Type"
              value={eventForm.values.type || 'acquisition'}
              onChange={(value) => eventForm.setFieldValue('type', value as FlockEvent['type'])}
              options={Object.entries(EVENT_TYPES).map(([value, label]) => ({ value, label }))}
              required
            />
            <DateInput
              label="Date"
              value={eventForm.values.date || ''}
              onChange={(value) => eventForm.setFieldValue('date', value)}
              required
            />
            <NumberInput
              label="Number of Birds (optional)"
              value={eventForm.values.affectedBirds || 0}
              onChange={(value) => eventForm.setFieldValue('affectedBirds', value || undefined)}
              min={0}
              placeholder="Enter number of birds"
            />
          </div>
          <TextInput
            label="Description"
            value={eventForm.values.description || ''}
            onChange={(value) => eventForm.setFieldValue('description', value)}
            placeholder="Describe the event..."
            required
          />
          <TextareaInput
            label="Additional Notes"
            value={eventForm.values.notes || ''}
            onChange={(value) => eventForm.setFieldValue('notes', value)}
            placeholder="Add any additional notes..."
            rows={3}
          />
          <div className="flex gap-4">
            <SubmitButton
              isLoading={isLoading}
              loadingText={editingEvent ? 'Updating...' : 'Adding...'}
              text={editingEvent ? 'Update Event' : 'Add Event'}
              className="md:w-auto md:min-w-[200px]"
            />
            {editingEvent && (
              <button 
                type="button" 
                onClick={cancelEditEvent}
                className="neu-button-secondary full-width md:w-auto md:min-w-[200px]"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h3>
          
          {profile.events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500">No events recorded yet. Add your first event above!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Main timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
              
              {/* Events */}
              <div className="space-y-12">
                {[...profile.events].sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                ).map((event, index) => {
                  const eventIcon = event.type === 'acquisition' ? '🐣' :
                                   event.type === 'laying_start' ? '🥚' :
                                   event.type === 'broody' ? '🐔' :
                                   event.type === 'hatching' ? '🐣' : '📝';
                  
                  const eventColor = event.type === 'acquisition' ? 'bg-green-500' :
                                    event.type === 'laying_start' ? 'bg-yellow-500' :
                                    event.type === 'broody' ? 'bg-orange-500' :
                                    event.type === 'hatching' ? 'bg-blue-500' : 'bg-purple-500';
                  
                  const isEven = index % 2 === 0;
                  
                  return (
                    <div key={event.id} className="relative">
                      {/* Desktop layout */}
                      <div className={`hidden md:flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Content side */}
                        <div className={`w-[calc(50%-2rem)] ${isEven ? 'text-right' : 'text-left'}`}>
                          <motion.div
                            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-md p-6 relative"
                          >
                            {/* Date badge */}
                            <div className={`flex gap-2 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>                              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                                {EVENT_TYPES[event.type].replace(/^[^a-zA-Z]*/, '')}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-3">
                              {event.description}
                            </h4>

                            {event.affectedBirds && (
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full ${isEven ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <span className="text-base">🐔</span>
                                  <span className="font-medium text-gray-600">{event.affectedBirds} birds affected</span>
                                </span>
                              </div>
                            )}                            {event.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                                <p className="text-sm text-gray-600 italic">{event.notes}</p>
                              </div>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeEvent(event.id)}
                              className={`absolute ${isEven ? '-left-2 translate-x-full' : '-right-2 -translate-x-full'} top-0 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-sm`}
                              disabled={isLoading}
                              title="Remove event"
                            >
                              ×
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditEvent(event)}
                              className={`absolute ${isEven ? '-left-2 translate-x-full' : '-right-2 -translate-x-full'} top-8 w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-sm`}
                              disabled={isLoading}
                              title="Edit event"
                            >
                              ✎
                            </motion.button>

                            <div className={`absolute top-1/2 ${isEven ? '-right-8' : '-left-8'} transform -translate-y-1/2 w-8 h-0.5 ${eventColor}`}></div>
                          </motion.div>
                        </div>

                        {/* Center dot */}
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full bg-white border-4 ${eventColor.replace('bg-', 'border-')} relative z-10`}>
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
                              {eventIcon}
                            </span>
                          </div>
                        </div>

                        {/* Empty side */}
                        <div className="w-[calc(50%-2rem)]"></div>
                      </div>

                      {/* Mobile layout */}
                      <div className="md:hidden bg-white rounded-lg shadow-sm p-4 relative">
                        <div className="flex items-start gap-4">
                          <div className={`shrink-0 w-8 h-8 ${eventColor} rounded-full flex items-center justify-center`}>
                            <span className="text-sm text-white">{eventIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                {EVENT_TYPES[event.type].replace(/^[^a-zA-Z]*/, '')}
                              </span>
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-2">{event.description}</h4>
                            {event.affectedBirds && (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full">
                                  <span>🐔</span>
                                  <span className="font-medium text-gray-600">{event.affectedBirds} birds</span>
                                </span>
                              </div>
                            )}
                            {event.notes && (                              <p className="text-xs text-gray-600 italic">{event.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditEvent(event)}
                              className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center text-sm"
                              disabled={isLoading}
                              title="Edit event"
                            >
                              ✎
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeEvent(event.id)}
                              className="shrink-0 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-sm"
                              disabled={isLoading}
                              title="Remove event"
                            >
                              ×
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </FormCard>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Flock Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="🐔 Laying Hens" total={profile.hens} label="productive birds" />
          <StatCard title="🐓 Roosters" total={profile.roosters} label="male birds" />
          <StatCard title="🐥 Chicks" total={profile.chicks} label="growing birds" />
          <StatCard title="🥚 Brooding" total={profile.brooding} label="nesting hens" />
        </div>
      </motion.div>
    </motion.div>
  );
};