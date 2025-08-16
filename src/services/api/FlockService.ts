import { BaseApiService } from './BaseApiService';
import { FlockService as IFlockService, ApiResponse } from './types';
import type { FlockProfile, FlockEvent, FlockBatch, DeathRecord } from '../../types';

/**
 * Flock service handling flock profiles, events, batches, and related operations
 */
export class FlockService extends BaseApiService implements IFlockService {
  private static instance: FlockService;

  /**
   * Singleton pattern for consistent flock data operations
   */
  public static getInstance(): FlockService {
    if (!FlockService.instance) {
      FlockService.instance = new FlockService();
    }
    return FlockService.instance;
  }

  /**
   * Save flock profile to database
   */
  public async saveFlockProfile(profile: FlockProfile): Promise<ApiResponse> {
    return this.post('/crud?operation=flockProfile', profile);
  }

  /**
   * Save multiple flock events to database
   */
  public async saveFlockEvents(events: FlockEvent[]): Promise<ApiResponse> {
    return this.post('/crud?operation=flockEvents', events);
  }

  /**
   * Save or update a single flock event
   */
  public async saveFlockEvent(
    flockProfileId: string, 
    event: FlockEvent, 
    eventId?: string
  ): Promise<ApiResponse> {
    const method = eventId ? 'PUT' : 'POST';
    const eventWithProfile = { ...event, flock_profile_id: flockProfileId, id: eventId };
    return this.post('/crud?operation=flockEvents', eventWithProfile);
  }

  /**
   * Delete a flock event
   */
  public async deleteFlockEvent(eventId: string): Promise<ApiResponse> {
    return this.delete('/crud?operation=flockEvents', { id: eventId });
  }

  /**
   * Save flock batch information
   */
  public async saveFlockBatch(batch: FlockBatch): Promise<ApiResponse> {
    return this.post('/saveFlockBatch', batch);
  }

  /**
   * Save death record
   */
  public async saveDeathRecord(deathRecord: DeathRecord): Promise<ApiResponse> {
    return this.post('/saveDeathRecord', deathRecord);
  }

  /**
   * Get flock summary with analytics
   */
  public async getFlockSummary(): Promise<ApiResponse> {
    return this.get('/flockSummary');
  }
}