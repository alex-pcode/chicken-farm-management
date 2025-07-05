import { isLocalStorageMode } from './supabase';

// Utility to get the correct API base URL for both development and production
export const getApiUrl = (endpoint: string): string => {
  // Always use relative API routes - Vite will proxy to Vercel functions in dev
  return `/api${endpoint}`;
};

// Helper function for making API calls with proper error handling
export const apiCall = async (endpoint: string, data: any) => {
  if (isLocalStorageMode()) {
    // Simulate API endpoints for localStorage
    if (endpoint === '/saveFeedInventory') {
      localStorage.setItem('feedInventory', JSON.stringify(data));
      return { message: 'Feed inventory saved locally', data: { feedInventory: data }, timestamp: new Date().toISOString() };
    }
    if (endpoint === '/saveEggEntries') {
      localStorage.setItem('eggEntries', JSON.stringify(data));
      return { message: 'Egg entries saved locally', data: { eggEntries: data }, timestamp: new Date().toISOString() };
    }
    if (endpoint === '/saveExpenses') {
      localStorage.setItem('expenses', JSON.stringify(data));
      return { message: 'Expenses saved locally', data: { expenses: data }, timestamp: new Date().toISOString() };
    }
    if (endpoint === '/saveFlockProfile') {
      localStorage.setItem('flockProfile', JSON.stringify(data));
      return { message: 'Flock profile saved locally', data: { flockProfile: data }, timestamp: new Date().toISOString() };
    }
    if (endpoint === '/saveFlockEvents') {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const newEvents = [...existingEvents, data.event];
      localStorage.setItem('flockEvents', JSON.stringify(newEvents));
      return { message: 'Event saved locally', data: { event: data.event }, timestamp: new Date().toISOString() };
    }
    if (endpoint === '/deleteFlockEvent') {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const filteredEvents = existingEvents.filter((e: any) => e.id !== data.eventId);
      localStorage.setItem('flockEvents', JSON.stringify(filteredEvents));
      return { message: 'Event deleted locally', eventId: data.eventId, timestamp: new Date().toISOString() };
    }
    // Default fallback
    return { message: 'Saved locally', data, timestamp: new Date().toISOString() };
  }
  const url = getApiUrl(endpoint);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for DELETE API calls
export const apiDelete = async (endpoint: string, data: any) => {
  if (isLocalStorageMode()) {
    // Simulate API endpoints for localStorage
    if (endpoint === '/deleteFlockEvent') {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const filteredEvents = existingEvents.filter((e: any) => e.id !== data.eventId);
      localStorage.setItem('flockEvents', JSON.stringify(filteredEvents));
      return { message: 'Event deleted locally', eventId: data.eventId, timestamp: new Date().toISOString() };
    }
    // Default fallback
    return { message: 'Deleted locally', data, timestamp: new Date().toISOString() };
  }
  
  const url = getApiUrl(endpoint);
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API delete failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for fetching data from the database or localStorage
export const fetchData = async () => {
  if (isLocalStorageMode()) {
    // Simulate fetching all data from localStorage
    return {
      feedInventory: JSON.parse(localStorage.getItem('feedInventory') || '[]'),
      eggEntries: JSON.parse(localStorage.getItem('eggEntries') || '[]'),
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      flockProfile: JSON.parse(localStorage.getItem('flockProfile') || 'null'),
    };
  }
  const url = getApiUrl('/getData');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    
    // Normalize the response structure - API returns { data: { ... } } but components expect direct access
    if (result.data) {
      return result.data;
    }
    
    // Fallback for unexpected response structure
    return result;
  } catch (error) {
    console.error('API fetchData failed:', error);
    throw error;
  }
};
