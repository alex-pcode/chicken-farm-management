import { supabase } from './supabase';

// Helper function to get authenticated headers
export const getAuthHeaders = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('User not authenticated');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
};

// Original fetchData function
export const fetchData = async () => {
  try {
    const response = await fetch('/api/getData', {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Helper functions for authenticated API calls
export const saveEggEntries = async (entries: any[]) => {
  try {
    const response = await fetch('/api/saveEggEntries', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(entries),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving egg entries:', error);
    throw error;
  }
};

export const saveExpenses = async (expenses: any[]) => {
  try {
    const response = await fetch('/api/saveExpenses', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(expenses),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw error;
  }
};

export const saveFeedInventory = async (inventory: any[]) => {
  try {
    const response = await fetch('/api/saveFeedInventory', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(inventory),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving feed inventory:', error);
    throw error;
  }
};

export const saveFlockProfile = async (profile: any) => {
  try {
    const response = await fetch('/api/saveFlockProfile', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving flock profile:', error);
    throw error;
  }
};

export const saveFlockEvents = async (events: any[]) => {
  try {
    const response = await fetch('/api/saveFlockEvents', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving flock events:', error);
    throw error;
  }
};

export const deleteFlockEvent = async (eventId: string) => {
  try {
    const response = await fetch('/api/deleteFlockEvent', {
      method: 'DELETE',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting flock event:', error);
    throw error;
  }
};

export const saveFlockEvent = async (flockProfileId: string, event: any, eventId?: string) => {
  try {
    const method = eventId ? 'PUT' : 'POST';
    const response = await fetch('/api/saveFlockEvents', {
      method,
      headers: await getAuthHeaders(),
      body: JSON.stringify({ flockProfileId, event, eventId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving flock event:', error);
    throw error;
  }
};

export const migrateUserData = async () => {
  try {
    const response = await fetch('/api/migrateUserData', {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error migrating user data:', error);
    throw error;
  }
};
