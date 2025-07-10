import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlockProfile, FlockEvent } from '../types';
import { saveFlockProfile, fetchData, deleteFlockEvent, saveFlockEvent } from '../utils/authApiUtils';
import { StatCard } from './testCom';
import AnimatedFarm from './AnimatedFarm';

const EVENT_TYPES = {
  acquisition: '🐣 New Birds Acquired',
  laying_start: '🥚 Started Laying',
  broody: '🐔 Went Broody',
  hatching: '🐣 Eggs Hatched',
  other: '📝 Other Event'
};

const saveToDatabase = async (profile: FlockProfile) => {
  try {
    await saveFlockProfile(profile);
    return true;
  } catch (error) {
    console.error('Error saving to database:', error);
    return false;
  }
};

export const Profile = () => {
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

  const [newBreed, setNewBreed] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  
  const [newEvent, setNewEvent] = useState<Partial<FlockEvent>>({
    type: 'acquisition',
    date: new Date().toISOString().split('T')[0],
    description: '',
    affectedBirds: undefined,
    notes: ''
  });  useEffect(() => {
    // Load from database
    const loadProfile = async () => {
      try {
        const dbData = await fetchData();
        const profileData = dbData.flockProfile;
        
        if (profileData && Object.keys(profileData).length > 0) {
          // Use the proper database columns directly
          const updatedProfile = {
            id: profileData.id, // Make sure to include the database ID
            hens: profileData.hens || 0,
            roosters: profileData.roosters || 0,
            chicks: profileData.chicks || 0,
            brooding: profileData.brooding || 0,
            lastUpdated: profileData.updated_at || new Date().toISOString(),
            breedTypes: profileData.breedTypes || [],
            events: profileData.events || [],
            flockStartDate: profileData.flockStartDate || new Date().toISOString(),
            notes: profileData.notes || "",
            farmName: profileData.farmName || "",
            location: profileData.location || "",
            flockSize: profileData.flockSize || 0
          };
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.log('Failed to load from database:', error);
      }
    };
    
    loadProfile();
  }, []);

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
      const saved = await saveToDatabase(updatedProfile);
      if (saved) {
        setProfile(updatedProfile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addBreed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBreed.trim() && !profile.breedTypes?.includes(newBreed.trim())) {
      setIsLoading(true);
      setError(null);
      
      const updatedProfile = {
        ...profile,
        breedTypes: [...(profile.breedTypes || []), newBreed.trim()]
      };
        try {
        const saved = await saveToDatabase(updatedProfile);
        if (saved) {
          setProfile(updatedProfile);
          setNewBreed('');
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error('Failed to save breed');
        }
      } catch (err) {
        setError('Failed to add breed. Please try again.');
        console.error('Error adding breed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeBreed = async (breed: string) => {
    setIsLoading(true);
    setError(null);
    
    const updatedProfile = {
      ...profile,
      breedTypes: profile.breedTypes?.filter(b => b !== breed)
    };
      try {
      const saved = await saveToDatabase(updatedProfile);
      if (saved) {
        setProfile(updatedProfile);
      } else {
        throw new Error('Failed to remove breed');
      }
    } catch (err) {
      setError('Failed to remove breed. Please try again.');
      console.error('Error removing breed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.description?.trim()) {
      setError('Please provide an event description');
      return;
    }

    setIsLoading(true);
    setError(null);

    const event: FlockEvent = {
      id: Date.now().toString(), // Temporary ID, will be replaced by database ID
      date: newEvent.date || new Date().toISOString().split('T')[0],
      type: newEvent.type as FlockEvent['type'],
      description: newEvent.description.trim(),
      affectedBirds: newEvent.affectedBirds,
      notes: newEvent.notes?.trim()
    };

    try {
      // Check if we have a profile ID, if not we need to get it first
      if (!profile.id) {
        setError('Profile not loaded yet. Please wait and try again.');
        return;
      }

      // Save event to database using new API
      const response = await saveFlockEvent(profile.id, event);
      
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
        setNewEvent({
          type: 'acquisition',
          date: new Date().toISOString().split('T')[0],
          description: '',
          affectedBirds: undefined,
          notes: ''
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save event');
      }
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event. Please try again. Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvent = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete event from database using new API
      const response = await deleteFlockEvent(eventId);
      
      if (response) {
        // Update local state by removing the event
        const updatedProfile = {
          ...profile,
          events: profile.events.filter(e => e.id !== eventId)
        };
        
        setProfile(updatedProfile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (err) {
      console.error('Error removing event:', err);
      setError('Failed to remove event. Please try again. Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const startEditEvent = (event: FlockEvent) => {
    setEditingEvent(event.id);
    setNewEvent({
      type: event.type,
      date: event.date,
      description: event.description,
      affectedBirds: event.affectedBirds,
      notes: event.notes
    });
  };

  const cancelEditEvent = () => {
    setEditingEvent(null);
    setNewEvent({
      type: 'acquisition',
      date: new Date().toISOString().split('T')[0],
      description: '',
      affectedBirds: undefined,
      notes: ''
    });
  };

  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !newEvent.description?.trim()) {
      setError('Please provide an event description');
      return;
    }

    setIsLoading(true);
    setError(null);

    const updatedEventData = {
      date: newEvent.date || new Date().toISOString().split('T')[0],
      type: newEvent.type,
      description: newEvent.description.trim(),
      affectedBirds: newEvent.affectedBirds,
      notes: newEvent.notes?.trim()
    };

    try {
      // Update event in database using PUT method
      const response = await fetch(`/api/saveFlockEvents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flockProfileId: profile.id || 1,
          event: updatedEventData,
          eventId: editingEvent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const result = await response.json();
      
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
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event. Please try again. Error: ' + (err instanceof Error ? err.message : String(err)));
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
      >
        <AnimatedFarm />
      </motion.div>

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          🐔 Flock Profile
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-form"
      >
        <h2 className="neu-title">Flock Information</h2>
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="success-toast mb-6"
            >
              Profile updated successfully!
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="error-toast mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="flockStartDate">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="calendar">📅</span>
                  Flock Start Date
                </div>
              </label>
              <input
                id="flockStartDate"
                type="date"
                value={profile.flockStartDate?.split('T')[0] || ''}
                onChange={(e) => setProfile({ ...profile, flockStartDate: new Date(e.target.value).toISOString() })}
                className="neu-input"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="hens">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="hen">🐔</span>
                  Number of Hens
                </div>
              </label>
              <input
                id="hens"
                type="number"
                min="0"
                value={profile.hens}
                onChange={(e) => setProfile({ ...profile, hens: parseInt(e.target.value) || 0 })}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="roosters">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="rooster">🐓</span>
                  Number of Roosters
                </div>
              </label>
              <input
                id="roosters"
                type="number"
                min="0"
                value={profile.roosters}
                onChange={(e) => setProfile({ ...profile, roosters: parseInt(e.target.value) || 0 })}
                className="neu-input"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="chicks">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="baby chick">🐥</span>
                  Number of Chicks
                </div>
              </label>
              <input
                id="chicks"
                type="number"
                min="0"
                value={profile.chicks}
                onChange={(e) => setProfile({ ...profile, chicks: parseInt(e.target.value) || 0 })}
                className="neu-input"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="brooding">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="brooding hen">🥚</span>
                  Brooding Hens
                </div>
              </label>
              <input
                id="brooding"
                type="number"
                min="0"
                value={profile.brooding}
                onChange={(e) => setProfile({ ...profile, brooding: parseInt(e.target.value) || 0 })}
                className="neu-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              value={profile.notes || ''}
              onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
              className="neu-input min-h-[100px] py-2"
              placeholder="Add any notes about your flock..."
              rows={3}
            />
          </div>

          <button type="submit" className="neu-button full-width md:w-auto md:min-w-[200px]" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-form"
      >
        <h2 className="neu-title">Breed Types 🪶</h2>
        <form onSubmit={addBreed} className="space-y-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
              className="neu-input flex-grow"
              placeholder="Enter breed name..."
            />
            <button type="submit" className="neu-button" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Breed'}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.breedTypes?.map((breed) => (
            <motion.div
              key={breed}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
            >
              <span>🪶 {breed}</span>
              <button
                onClick={() => removeBreed(breed)}
                className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-white text-xs"
                disabled={isLoading}
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-form"
      >
        <h2 className="neu-title">{editingEvent ? 'Edit Event 📝' : 'Flock Timeline 📅'}</h2>
        <form onSubmit={editingEvent ? updateEvent : addEvent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="eventType">
                Event Type
              </label>
              <select
                id="eventType"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as FlockEvent['type'] })}
                className="neu-input"
                required
              >
                {Object.entries(EVENT_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="eventDate">
                Date
              </label>
              <input
                id="eventDate"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="affectedBirds">
                Number of Birds (optional)
              </label>
              <input
                id="affectedBirds"
                type="number"
                min="0"
                value={newEvent.affectedBirds || ''}
                onChange={(e) => setNewEvent({ ...newEvent, affectedBirds: parseInt(e.target.value) || undefined })}
                className="neu-input"
                placeholder="Enter number of birds"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="eventDescription">
              Description
            </label>
            <input
              id="eventDescription"
              type="text"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="neu-input"
              placeholder="Describe the event..."
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="eventNotes">
              Additional Notes
            </label>
            <textarea
              id="eventNotes"
              value={newEvent.notes}
              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              className="neu-input min-h-[100px]"
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="neu-button full-width md:w-auto md:min-w-[200px]" disabled={isLoading}>
              {isLoading ? (editingEvent ? 'Updating...' : 'Adding...') : (editingEvent ? 'Update Event' : 'Add Event')}
            </button>
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
        </form>        <div className="mt-8">
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
      </motion.div>

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