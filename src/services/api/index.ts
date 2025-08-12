/**
 * Unified API Service Layer
 * 
 * This module provides a centralized API service layer for the Chicken Manager application.
 * It consolidates all data operations with consistent error handling, authentication,
 * and domain separation.
 * 
 * Usage:
 * ```typescript
 * import { apiService } from '../services/api';
 * 
 * // Use domain-specific services
 * const data = await apiService.data.fetchAllData();
 * const response = await apiService.production.saveEggEntries(entries);
 * const profile = await apiService.flock.saveFlockProfile(profile);
 * ```
 */

// Service classes
export { BaseApiService } from './BaseApiService';
export { AuthService } from './AuthService';
export { DataService } from './DataService';
export { ProductionService } from './ProductionService';
export { FlockService } from './FlockService';

// Types and interfaces
export * from './types';

// Service instances for easy access
import { AuthService } from './AuthService';
import { DataService } from './DataService';
import { ProductionService } from './ProductionService';
import { FlockService } from './FlockService';
import type { EggEntry, FeedEntry, Expense, FlockProfile, FlockEvent } from '../../types';

/**
 * Unified API service interface
 * Provides access to all domain-specific services through a single object
 */
export const apiService = {
  auth: AuthService.getInstance(),
  data: DataService.getInstance(),
  production: ProductionService.getInstance(),
  flock: FlockService.getInstance(),
};

/**
 * Legacy compatibility layer
 * Provides backward compatibility with existing authApiUtils.ts functions
 * 
 * @deprecated Use apiService.auth or specific domain services instead
 */

export const legacyApi = {
  /**
   * @deprecated Use apiService.auth.getAuthHeaders() instead
   */
  getAuthHeaders: () => apiService.auth.getAuthHeaders(),

  /**
   * @deprecated Use apiService.data.fetchAllData() instead
   */
  fetchData: () => apiService.data.fetchAllData().then(response => response.data),

  /**
   * @deprecated Use apiService.production.saveEggEntries() instead
   */
  saveEggEntries: (entries: EggEntry[]) => apiService.production.saveEggEntries(entries),

  /**
   * @deprecated Use apiService.production.saveExpenses() instead
   */
  saveExpenses: (expenses: Expense[]) => apiService.production.saveExpenses(expenses),

  /**
   * @deprecated Use apiService.production.saveFeedInventory() instead
   */
  saveFeedInventory: (inventory: FeedEntry[]) => apiService.production.saveFeedInventory(inventory),

  /**
   * @deprecated Use apiService.flock.saveFlockProfile() instead
   */
  saveFlockProfile: (profile: FlockProfile) => apiService.flock.saveFlockProfile(profile),

  /**
   * @deprecated Use apiService.flock.saveFlockEvents() instead
   */
  saveFlockEvents: (events: FlockEvent[]) => apiService.flock.saveFlockEvents(events),

  /**
   * @deprecated Use apiService.flock.saveFlockEvent() instead
   */
  saveFlockEvent: (flockProfileId: string, event: FlockEvent, eventId?: string) => 
    apiService.flock.saveFlockEvent(flockProfileId, event, eventId),

  /**
   * @deprecated Use apiService.flock.deleteFlockEvent() instead
   */
  deleteFlockEvent: (eventId: string) => apiService.flock.deleteFlockEvent(eventId),

  /**
   * @deprecated Use apiService.auth.migrateUserData() instead
   */
  migrateUserData: () => apiService.auth.migrateUserData(),
};

/**
 * Default export for convenience
 */
export default apiService;