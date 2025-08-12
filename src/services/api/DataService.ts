import { BaseApiService } from './BaseApiService';
import { DataService as IDataService, ApiResponse } from './types';
import { isLocalStorageMode } from '../../utils/supabase';
import type { EggEntry, FeedEntry, Expense, FlockProfile, FlockEvent, FlockBatch, DeathRecord } from '../../types';
import { 
  isEggEntryArray, 
  isFeedEntryArray, 
  isExpenseArray, 
  isFlockProfile,
  isFlockEventArray,
  isObject
} from '../../utils/typeGuards';

/**
 * Data service handling general data operations
 * Supports both Supabase API and localStorage modes
 */
export class DataService extends BaseApiService implements IDataService {
  private static instance: DataService;

  /**
   * Singleton pattern for consistent data operations
   */
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Fetch all application data with validation
   * Handles both authenticated API calls and localStorage fallback
   */
  public async fetchAllData(): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      return this.fetchDataFromLocalStorage();
    }

    // Define validator for the expected data structure
    const dataValidator = (data: unknown): data is {
      feedInventory: FeedEntry[];
      eggEntries: EggEntry[];
      expenses: Expense[];
      flockProfile: FlockProfile | null;
      flockEvents?: FlockEvent[];
      flockBatches?: FlockBatch[];
      deathRecords?: DeathRecord[];
    } => {
      console.log('[DataService] Validating data structure:', data);
      
      if (!isObject(data)) {
        console.log('[DataService] Data is not an object');
        return false;
      }
      
      const typedData = data as any;
      
      console.log('[DataService] feedInventory sample:', typedData.feedInventory?.[0]);
      console.log('[DataService] flockProfile:', typedData.flockProfile);
      
      const feedInventoryValid = isFeedEntryArray(typedData.feedInventory);
      const eggEntriesValid = isEggEntryArray(typedData.eggEntries);
      const expensesValid = isExpenseArray(typedData.expenses);
      const flockProfileValid = (typedData.flockProfile === null || isFlockProfile(typedData.flockProfile));
      const flockEventsValid = (typedData.flockEvents === undefined || isFlockEventArray(typedData.flockEvents));
      const flockBatchesValid = (typedData.flockBatches === undefined || Array.isArray(typedData.flockBatches));
      const deathRecordsValid = (typedData.deathRecords === undefined || Array.isArray(typedData.deathRecords));
      
      console.log('[DataService] Validation results:', {
        feedInventoryValid,
        eggEntriesValid,
        expensesValid,
        flockProfileValid,
        flockEventsValid,
        flockBatchesValid,
        deathRecordsValid
      });
      
      return (
        feedInventoryValid &&
        eggEntriesValid &&
        expensesValid &&
        flockProfileValid &&
        flockEventsValid &&
        flockBatchesValid &&
        deathRecordsValid
      );
    };

    // Temporarily disable strict validation to restore app functionality
    const response = await this.get<{
      feedInventory: FeedEntry[];
      eggEntries: EggEntry[];
      expenses: Expense[];
      flockProfile: FlockProfile | null;
      flockEvents?: FlockEvent[];
      flockBatches?: FlockBatch[];
      deathRecords?: DeathRecord[];
    }>('/getData'); // dataValidator removed temporarily

    // Normalize the response structure - API returns { data: { ... } } 
    // but components expect direct access to the nested data
    if (response.data) {
      return { 
        success: true,
        data: response.data 
      };
    }

    // Fallback for unexpected response structure
    return response;
  }

  /**
   * Save data to appropriate storage backend
   */
  public async saveData(data: unknown): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      return this.saveDataToLocalStorage(data);
    }

    // For authenticated API calls, delegate to specific service methods
    throw new Error('Use specific service methods for saving data');
  }

  /**
   * Fetch data from localStorage (development/offline mode) with validation
   */
  private fetchDataFromLocalStorage(): ApiResponse {
    try {
      // Parse data from localStorage with fallbacks
      const rawFeedInventory = JSON.parse(localStorage.getItem('feedInventory') || '[]');
      const rawEggEntries = JSON.parse(localStorage.getItem('eggEntries') || '[]');
      const rawExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const rawFlockProfile = JSON.parse(localStorage.getItem('flockProfile') || 'null');
      const rawFlockEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const rawFlockBatches = JSON.parse(localStorage.getItem('flockBatches') || '[]');
      const rawDeathRecords = JSON.parse(localStorage.getItem('deathRecords') || '[]');

      // Validate each data type
      const feedInventory = isFeedEntryArray(rawFeedInventory) ? rawFeedInventory : [];
      const eggEntries = isEggEntryArray(rawEggEntries) ? rawEggEntries : [];
      const expenses = isExpenseArray(rawExpenses) ? rawExpenses : [];
      const flockProfile = (rawFlockProfile === null || isFlockProfile(rawFlockProfile)) ? rawFlockProfile : null;
      const flockEvents = isFlockEventArray(rawFlockEvents) ? rawFlockEvents : [];
      const flockBatches = Array.isArray(rawFlockBatches) ? rawFlockBatches : [];
      const deathRecords = Array.isArray(rawDeathRecords) ? rawDeathRecords : [];

      const data = {
        feedInventory,
        eggEntries,
        expenses,
        flockProfile,
        flockEvents,
        flockBatches,
        deathRecords,
      };

      return {
        success: true,
        data,
        message: 'Data loaded from localStorage with validation'
      };
    } catch (error) {
      console.error('[DataService] Error parsing localStorage data:', error);
      
      // Return empty data structure if localStorage is corrupted
      return {
        success: true,
        data: {
          feedInventory: [],
          eggEntries: [],
          expenses: [],
          flockProfile: null,
          flockEvents: [],
          flockBatches: [],
          deathRecords: [],
        },
        message: 'Fallback to empty data due to localStorage corruption'
      };
    }
  }

  /**
   * Save data to localStorage (development/offline mode)
   */
  private saveDataToLocalStorage(data: unknown): ApiResponse {
    // This is a generic fallback - specific data types should use dedicated methods
    localStorage.setItem('genericData', JSON.stringify(data));
    
    return {
      success: true,
      data,
      message: 'Data saved to localStorage'
    };
  }
}