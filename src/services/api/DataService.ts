import { BaseApiService } from './BaseApiService';
import { DataService as IDataService, ApiResponse } from './types';
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
  private isAppData(data: unknown): data is {
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
      Array.isArray((data as any).feedInventory) &&
      Array.isArray((data as any).eggEntries) &&
      Array.isArray((data as any).expenses) &&
      ((data as any).flockProfile === null || typeof (data as any).flockProfile === 'object')
    );
  }

  /**
   * Fetch all application data with validation
   */
  public async fetchAllData(): Promise<ApiResponse> {
    const response = await this.get<{
      feedInventory: FeedEntry[];
      eggEntries: EggEntry[];
      expenses: Expense[];
      flockProfile: FlockProfile | null;
      flockEvents?: FlockEvent[];
      flockBatches?: FlockBatch[];
      deathRecords?: DeathRecord[];
    }>('/getData', this.isAppData.bind(this));

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
   * Save data using specific service methods
   */
  public async saveData(_data: unknown): Promise<ApiResponse> {
    // For authenticated API calls, delegate to specific service methods
    throw new Error('Use specific service methods for saving data');
  }
}