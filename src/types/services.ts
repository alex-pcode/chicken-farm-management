// Service interface definitions for API layer
import type { 
  ApiResponse, 
  FetchDataResponse 
} from './api';
import type { 
  EggEntry, 
  FeedEntry, 
  Expense, 
  FlockProfile, 
  FlockEvent, 
  Customer 
} from './index';

/**
 * HTTP methods supported by the API service
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Domain-specific service interfaces with strongly-typed methods
 */
export interface AuthService {
  getAuthHeaders(): Promise<Record<string, string>>;
  refreshToken(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
}

export interface DataService {
  fetchAllData(): Promise<FetchDataResponse>;
  saveData(data: unknown): Promise<ApiResponse>;
}

export interface ProductionService {
  getEggEntries(): Promise<ApiResponse>;
  saveEggEntries(entries: EggEntry[]): Promise<ApiResponse>;
  getExpenses(): Promise<ApiResponse>;
  saveExpenses(expenses: Expense[]): Promise<ApiResponse>;
  deleteExpense(expenseId: string): Promise<ApiResponse>;
  saveFeedInventory(inventory: FeedEntry[]): Promise<ApiResponse>;
  deleteFeedInventory(feedId: string): Promise<ApiResponse>;
}

export interface CrmService {
  getCustomers(): Promise<ApiResponse>;
  saveCustomer(customer: Customer): Promise<ApiResponse>;
  deleteCustomer(customerId: string): Promise<ApiResponse>;
}

export interface FlockService {
  saveFlockProfile(profile: FlockProfile): Promise<ApiResponse>;
  saveFlockEvents(events: FlockEvent[]): Promise<ApiResponse>;
  saveFlockEvent(flockProfileId: string, event: FlockEvent, eventId?: string): Promise<ApiResponse>;
  deleteFlockEvent(eventId: string): Promise<ApiResponse>;
}

/**
 * API service configuration
 */
export interface ApiServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  enableLogging?: boolean;
}