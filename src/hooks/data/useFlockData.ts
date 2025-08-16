import { useCallback, useMemo } from 'react';
import { useDataFetch } from './useDataFetch';
import { useOptimizedAppData } from '../../contexts/OptimizedDataProvider';
import { apiService } from '../../services/api';
import type { FlockProfile, FlockEvent, FlockSummary } from '../../types';

export interface UseFlockDataOptions {
  autoRefresh?: boolean;
  cacheTime?: number;
  includeEvents?: boolean;
}

export interface UseFlockDataReturn {
  profile: FlockProfile | null;
  events: FlockEvent[];
  summary: FlockSummary | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
  updateProfile: (profile: FlockProfile) => Promise<void>;
  addEvent: (event: Omit<FlockEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<FlockEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  totalBirds: number;
  layingHens: number;
  productionRate: number;
  breedDistribution: Record<string, number>;
}

export const useFlockData = (options: UseFlockDataOptions = {}): UseFlockDataReturn => {
  const {
    autoRefresh = true,
    cacheTime = 300000, // 5 minutes
    includeEvents = true
  } = options;

  // Use OptimizedDataProvider for cached data
  const { data, isLoading: contextLoading, refreshData } = useOptimizedAppData();
  const contextProfile = data.flockProfile;
  const contextEvents = data.flockEvents;

  // Fallback data fetching hook for profile (if DataContext fails)
  const {
    data: fetchedProfile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useDataFetch<FlockProfile>({
    key: 'flock-profile',
    fetcher: () => apiService.flock.getFlockProfile(),
    cacheTime,
    enabled: autoRefresh && !contextProfile
  });

  // Fetch flock summary
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useDataFetch<FlockSummary>({
    key: 'flock-summary',
    fetcher: () => apiService.flock.getFlockSummary(),
    cacheTime,
    enabled: autoRefresh
  });

  // Use context data preferentially, fallback to fetched data
  const profile = contextProfile || fetchedProfile || null;
  const events = profile?.events || [];
  const isLoading = contextLoading || profileLoading || summaryLoading;
  const error = profileError || summaryError;

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchProfile(),
      refetchSummary()
    ]);
  }, [refetchProfile, refetchSummary]);

  // Update flock profile
  const updateProfile = useCallback(async (updatedProfile: FlockProfile) => {
    // Optimistic update
    refreshData(updatedProfile);
    
    try {
      // Save to API
      await apiService.flock.saveFlockProfile(updatedProfile);
    } catch (err) {
      // Revert on error
      if (contextProfile) {
        refreshData(contextProfile);
      }
      throw err;
    }
  }, [contextProfile, refreshData]);

  // Add new flock event
  const addEvent = useCallback(async (eventData: Omit<FlockEvent, 'id'>) => {
    if (!profile) return;

    const newEvent: FlockEvent = {
      ...eventData,
      id: `temp-${Date.now()}` // Temporary ID, will be replaced by API
    };
    
    const updatedProfile = {
      ...profile,
      events: [...profile.events, newEvent]
    };
    
    // Optimistic update
    refreshData(updatedProfile);
    
    try {
      // Save to API
      await apiService.flock.saveFlockEvent(newEvent);
    } catch (err) {
      // Revert on error
      refreshData(profile);
      throw err;
    }
  }, [profile, refreshData]);

  // Update existing flock event
  const updateEvent = useCallback(async (id: string, eventData: Partial<FlockEvent>) => {
    if (!profile) return;

    const eventIndex = profile.events.findIndex(event => event.id === id);
    if (eventIndex === -1) return;

    const updatedEvents = [...profile.events];
    updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], ...eventData };
    
    const updatedProfile = {
      ...profile,
      events: updatedEvents
    };
    
    // Optimistic update
    refreshData(updatedProfile);
    
    try {
      // Save to API
      await apiService.flock.saveFlockEvent(updatedEvents[eventIndex]);
    } catch (err) {
      // Revert on error
      refreshData(profile);
      throw err;
    }
  }, [profile, refreshData]);

  // Delete flock event
  const deleteEvent = useCallback(async (id: string) => {
    if (!profile) return;

    const updatedEvents = profile.events.filter(event => event.id !== id);
    const updatedProfile = {
      ...profile,
      events: updatedEvents
    };
    
    // Optimistic update
    refreshData(updatedProfile);
    
    try {
      // Delete from API
      await apiService.flock.deleteFlockEvent(id);
    } catch (err) {
      // Revert on error
      refreshData(profile);
      throw err;
    }
  }, [profile, refreshData]);

  // Flock statistics and calculations
  const statistics = useMemo(() => {
    if (!profile) {
      return {
        totalBirds: 0,
        layingHens: 0,
        productionRate: 0,
        breedDistribution: {}
      };
    }

    const totalBirds = profile.hens + profile.roosters + profile.chicks + profile.brooding;
    const layingHens = profile.hens - profile.brooding; // Assuming brooding hens don't lay
    
    // Calculate production rate (this could be enhanced with actual egg data)
    const productionRate = layingHens > 0 ? Math.min((layingHens / profile.hens) * 100, 100) : 0;
    
    // Calculate breed distribution
    const breedDistribution = profile.breedTypes.reduce((acc, breed) => {
      acc[breed] = (acc[breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalBirds,
      layingHens,
      productionRate: Math.round(productionRate * 100) / 100,
      breedDistribution
    };
  }, [profile]);

  return useMemo(() => ({
    profile,
    events,
    summary,
    isLoading,
    error,
    refetch,
    updateProfile,
    addEvent,
    updateEvent,
    deleteEvent,
    ...statistics,
  }), [
    profile,
    events,
    summary,
    isLoading,
    error,
    refetch,
    updateProfile,
    addEvent,
    updateEvent,
    deleteEvent,
    statistics,
  ]);
};