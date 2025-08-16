import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FlockProfile, FlockEvent, FlockSummary } from '../types';
import { apiService } from '../services/api';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import AnimatedFarmPNG from './AnimatedFarmPNG';
import { useAuth } from '../contexts/AuthContext';
import { useToggle } from '../hooks/utils';
import { FlockSummaryDisplay, EventForm, EventTimeline } from './flock';

export const ExperimentProfile = () => {
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
  const [editingEvent, setEditingEvent] = useState<FlockEvent | null>(null);
  
  // Use custom hooks to reduce useState calls
  const batchLoading = useToggle(false);

  // Function to fetch flock summary from batch management
  const fetchFlockSummary = async () => {
    if (!user) return;
    
    batchLoading.setTrue();
    try {
      const response = await apiService.flock.getFlockSummary();
      
      if (response.data) {
        setFlockSummary((response.data as any).summary || response.data);
      } else {
        console.log('No flock summary data available yet');
        setFlockSummary(null);
      }
    } catch (error) {
      console.error('Error fetching flock summary:', error);
      setFlockSummary(null);
    } finally {
      batchLoading.setFalse();
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    if (!profileLoading && cachedProfile) {
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
      fetchFlockSummary();
    }
  }, [cachedProfile, profileLoading, user]);

  const handleEventAdded = (event: FlockEvent) => {
    const updatedProfile = {
      ...profile,
      events: [...(profile.events || []), event].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    };
    setProfile(updatedProfile);
  };

  const handleEventUpdated = (updatedEvent: FlockEvent) => {
    const updatedProfile = {
      ...profile,
      events: profile.events.map(e => e.id === updatedEvent.id ? updatedEvent : e).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    };
    setProfile(updatedProfile);
  };

  const handleEventDeleted = (eventId: string) => {
    const updatedProfile = {
      ...profile,
      events: profile.events.filter(e => e.id !== eventId)
    };
    setProfile(updatedProfile);
  };

  const handleEditEvent = (event: FlockEvent) => {
    setEditingEvent(event);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
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

      {/* Flock Summary Display */}
      <FlockSummaryDisplay
        flockSummary={flockSummary}
        profile={profile}
        batchLoading={batchLoading.value}
        hasLoadedOnce={hasLoadedOnce}
        onRefreshSummary={fetchFlockSummary}
      />

      {/* Event Form */}
      <EventForm
        profileId={profile.id}
        onEventAdded={handleEventAdded}
        onEventUpdated={handleEventUpdated}
        editingEvent={editingEvent}
        onCancelEdit={handleCancelEdit}
      />

      {/* Events Timeline */}
      <EventTimeline
        events={profile.events}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleEventDeleted}
        isLoading={false}
      />
    </motion.div>
  );
};