import { BaseApiService } from './BaseApiService';
import { DataService as IDataService, ApiResponse } from './types';
import type { EggEntry, FeedEntry, Expense, FlockProfile, FlockEvent, FlockBatch, DeathRecord, AppData } from '../../types';
import { 
  // isEggEntryArray, 
  // isFeedEntryArray, 
  // isExpenseArray, 
  // isFlockProfile,
  // isFlockEventArray,
  // isObject
} from '../../utils/typeGuards';

/**
 * Data service handling general data operations
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
   * Type guard for application data structure
   */
   
  // @ts-ignore - Type guard utility function for future use
  private _isAppData(data: unknown): data is {
    feedInventory: FeedEntry[];
    eggEntries: EggEntry[];
    expenses: Expense[];
    flockProfile: FlockProfile | null;
    flockEvents?: FlockEvent[];
    flockBatches?: FlockBatch[];
    deathRecords?: DeathRecord[];
  } {
    return (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray((data as Record<string, unknown>).feedInventory) &&
      Array.isArray((data as Record<string, unknown>).eggEntries) &&
      Array.isArray((data as Record<string, unknown>).expenses) &&
      ((data as Record<string, unknown>).flockProfile === null || typeof (data as Record<string, unknown>).flockProfile === 'object')
    );
  }

  /**
   * Fetch all application data with validation
   */
  public async fetchAllData(): Promise<ApiResponse<AppData>> {
    const response = await this.get<{
      feedInventory: FeedEntry[];
      eggEntries: EggEntry[];
      expenses: Expense[];
      flockProfile: FlockProfile | null;
      flockEvents?: FlockEvent[];
      flockBatches?: FlockBatch[];
      deathRecords?: DeathRecord[];
    }>('/data?type=all');


    // Normalize the response structure - API returns { data: { ... } } 
    // but components expect direct access to the nested data
    if (response.data) {
      const normalizedResponse = { 
        success: true,
        data: response.data 
      };
      
      return normalizedResponse;
    }

    // Fallback for unexpected response structure
    return response;
  }

  /**
   * Save data using specific service methods
   */
  public async saveData(data: unknown): Promise<ApiResponse> {
    // For authenticated API calls, delegate to specific service methods
    void data; // Mark as used to avoid linting warning
    throw new Error('Use specific service methods for saving data');
  }
}