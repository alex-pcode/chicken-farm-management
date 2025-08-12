import { supabase } from './supabase';
import type { 
  EggEntry, 
  Expense, 
  FeedEntry, 
  FlockProfile, 
  FlockEvent 
} from '../types/index';
import type {
  EggEntriesResponse,
  ExpensesResponse,
  FeedInventoryResponse,
  FlockProfileResponse,
  FlockEventsResponse,
  FlockEventResponse,
  DeleteEventResponse,
  MigrationResponse,
  FetchDataResponse
} from '../types/api';
import {
  AuthenticationError,
  NetworkError,
  ServerError,
  getUserFriendlyErrorMessage
} from '../types/api';

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

/**
 * Fetches all user data from the API
 * @returns Promise resolving to user data
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * try {
 *   const data = await fetchData();
 *   console.log('User data loaded:', data);
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     // Handle authentication error
 *   }
 * }
 * ```
 */
export const fetchData = async (): Promise<unknown> => {
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

    const result: FetchDataResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to fetch data. Please check your connection.');
    }
    
    throw new ServerError('Failed to fetch data. Please try again.');
  }
};

/**
 * Saves egg entries to the database
 * @param entries - Array of egg entries to save
 * @returns Promise resolving to API response with saved entry information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const entries: EggEntry[] = [{ id: '1', date: '2025-08-09', count: 12 }];
 * const response = await saveEggEntries(entries);
 * if (response.success) {
 *   console.log(`Saved ${response.data?.saved} entries`);
 * }
 * ```
 */
export const saveEggEntries = async (entries: EggEntry[]): Promise<EggEntriesResponse> => {
  try {
    const response = await fetch('/api/saveEggEntries', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(entries),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: EggEntriesResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving egg entries:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save egg entries. Please check your connection.');
    }
    
    throw new ServerError('Failed to save egg entries. Please try again.');
  }
};

/**
 * Saves expense records to the database
 * @param expenses - Array of expense records to save
 * @returns Promise resolving to API response with saved expense information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const expenses: Expense[] = [{ 
 *   date: '2025-08-09', 
 *   category: 'feed', 
 *   description: 'Chicken feed', 
 *   amount: 25.50 
 * }];
 * const response = await saveExpenses(expenses);
 * ```
 */
export const saveExpenses = async (expenses: Expense[]): Promise<ExpensesResponse> => {
  try {
    const response = await fetch('/api/saveExpenses', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(expenses),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ExpensesResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving expenses:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save expenses. Please check your connection.');
    }
    
    throw new ServerError('Failed to save expenses. Please try again.');
  }
};

/**
 * Saves feed inventory records to the database
 * @param inventory - Array of feed inventory items to save
 * @returns Promise resolving to API response with saved inventory information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const inventory: FeedEntry[] = [{
 *   id: '1',
 *   brand: 'Premium Feed',
 *   type: 'layer',
 *   quantity: 50,
 *   unit: 'kg',
 *   openedDate: '2025-08-09',
 *   pricePerUnit: 1.20
 * }];
 * const response = await saveFeedInventory(inventory);
 * ```
 */
export const saveFeedInventory = async (inventory: FeedEntry[]): Promise<FeedInventoryResponse> => {
  try {
    const response = await fetch('/api/saveFeedInventory', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(inventory),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FeedInventoryResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving feed inventory:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save feed inventory. Please check your connection.');
    }
    
    throw new ServerError('Failed to save feed inventory. Please try again.');
  }
};

/**
 * Saves or updates flock profile information
 * @param profile - Flock profile data to save
 * @returns Promise resolving to API response with saved profile information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const profile: FlockProfile = {
 *   hens: 25,
 *   roosters: 2,
 *   chicks: 0,
 *   lastUpdated: '2025-08-09',
 *   breedTypes: ['Rhode Island Red'],
 *   events: []
 * };
 * const response = await saveFlockProfile(profile);
 * ```
 */
export const saveFlockProfile = async (profile: FlockProfile): Promise<FlockProfileResponse> => {
  try {
    const response = await fetch('/api/saveFlockProfile', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FlockProfileResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving flock profile:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save flock profile. Please check your connection.');
    }
    
    throw new ServerError('Failed to save flock profile. Please try again.');
  }
};

/**
 * Saves multiple flock events to the database
 * @param events - Array of flock events to save
 * @returns Promise resolving to API response with saved events information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const events: FlockEvent[] = [{
 *   id: '1',
 *   date: '2025-08-09',
 *   type: 'laying_start',
 *   description: 'First eggs from new batch',
 *   affectedBirds: 10
 * }];
 * const response = await saveFlockEvents(events);
 * ```
 */
export const saveFlockEvents = async (events: FlockEvent[]): Promise<FlockEventsResponse> => {
  try {
    const response = await fetch('/api/saveFlockEvents', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FlockEventsResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving flock events:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save flock events. Please check your connection.');
    }
    
    throw new ServerError('Failed to save flock events. Please try again.');
  }
};

/**
 * Deletes a flock event from the database
 * @param eventId - ID of the event to delete
 * @returns Promise resolving to API response confirming deletion
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const response = await deleteFlockEvent('event123');
 * if (response.success) {
 *   console.log('Event deleted successfully');
 * }
 * ```
 */
export const deleteFlockEvent = async (eventId: string): Promise<DeleteEventResponse> => {
  try {
    const response = await fetch('/api/deleteFlockEvent', {
      method: 'DELETE',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DeleteEventResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting flock event:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to delete flock event. Please check your connection.');
    }
    
    throw new ServerError('Failed to delete flock event. Please try again.');
  }
};

/**
 * Saves or updates a single flock event
 * @param flockProfileId - ID of the flock profile
 * @param event - Flock event data to save
 * @param eventId - Optional event ID for updates
 * @returns Promise resolving to API response with saved event information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const event: FlockEvent = {
 *   id: '1',
 *   date: '2025-08-09',
 *   type: 'health_check',
 *   description: 'Monthly health inspection'
 * };
 * const response = await saveFlockEvent('profile123', event);
 * ```
 */
export const saveFlockEvent = async (flockProfileId: string, event: FlockEvent, eventId?: string): Promise<FlockEventResponse> => {
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

    const result: FlockEventResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving flock event:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to save flock event. Please check your connection.');
    }
    
    throw new ServerError('Failed to save flock event. Please try again.');
  }
};

/**
 * Migrates user data between storage systems
 * @returns Promise resolving to API response with migration information
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {NetworkError} When network request fails
 * @throws {ServerError} When server returns error response
 * 
 * @example
 * ```typescript
 * const response = await migrateUserData();
 * if (response.success) {
 *   console.log(`Migrated ${response.data?.recordsProcessed} records`);
 * }
 * ```
 */
export const migrateUserData = async (): Promise<MigrationResponse> => {
  try {
    const response = await fetch('/api/migrateUserData', {
      method: 'POST',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: MigrationResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error migrating user data:', error);
    
    if (error instanceof Error && error.message.includes('not authenticated')) {
      await supabase.auth.signOut();
      throw new AuthenticationError(getUserFriendlyErrorMessage(error));
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to migrate user data. Please check your connection.');
    }
    
    throw new ServerError('Failed to migrate user data. Please try again.');
  }
};

// Re-export error classes for convenience
export { AuthenticationError, NetworkError, ServerError, getUserFriendlyErrorMessage };
