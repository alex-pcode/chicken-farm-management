import { supabase } from './supabase';

// Helper function to get authenticated headers with automatic token refresh
export const getAuthHeaders = async () => {
  // First try to get the current session
  let { data: { session }, error } = await supabase.auth.getSession();
  
  // If no session or session is expired, try to refresh
  if (error || !session || !session.access_token) {
    console.log('No valid session found, attempting refresh...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      console.error('Token refresh failed:', refreshError);
      throw new Error('User not authenticated - please log in again');
    }
    
    session = refreshData.session;
    console.log('Token refreshed successfully');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
};

// Original fetchData function with better error handling
export const fetchData = async () => {
  try {
    const response = await fetch('/api/getData', {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed - please refresh the page or log in again');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // If it's an authentication error, the user needs to log in again
    if (error instanceof Error && error.message.includes('not authenticated')) {
      // This will trigger the AuthContext to show the login screen
      await supabase.auth.signOut();
    }
    
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
