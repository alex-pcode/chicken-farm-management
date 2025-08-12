import { BaseApiService } from './BaseApiService';
import { FlockService as IFlockService, ApiResponse } from './types';
import { isLocalStorageMode } from '../../utils/supabase';
import type { FlockProfile, FlockEvent, FlockBatch, DeathRecord, BatchEvent } from '../../types';

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
   * Save flock profile to database or localStorage
   */
  public async saveFlockProfile(profile: FlockProfile): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      localStorage.setItem('flockProfile', JSON.stringify(profile));
      return {
        success: true,
        message: 'Flock profile saved locally',
        data: { flockProfile: profile }
      };
    }

    return this.post('/saveFlockProfile', profile);
  }

  /**
   * Save multiple flock events to database or localStorage
   */
  public async saveFlockEvents(events: FlockEvent[]): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const updatedEvents = [...existingEvents, ...events];
      localStorage.setItem('flockEvents', JSON.stringify(updatedEvents));
      return {
        success: true,
        message: 'Flock events saved locally',
        data: { flockEvents: updatedEvents }
      };
    }

    return this.post('/saveFlockEvents', events);
  }

  /**
   * Save or update a single flock event
   */
  public async saveFlockEvent(
    flockProfileId: string, 
    event: FlockEvent, 
    eventId?: string
  ): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      
      if (eventId) {
        // Update existing event
        const eventIndex = existingEvents.findIndex((e: FlockEvent) => e.id === eventId);
        if (eventIndex >= 0) {
          existingEvents[eventIndex] = { ...event, id: eventId };
        }
      } else {
        // Add new event
        const newEvent = { ...event, id: event.id || `event_${Date.now()}` };
        existingEvents.push(newEvent);
      }
      
      localStorage.setItem('flockEvents', JSON.stringify(existingEvents));
      return {
        success: true,
        message: 'Flock event saved locally',
        data: { event, eventId }
      };
    }

    const method = eventId ? 'PUT' : 'POST';
    const requestData = { flockProfileId, event, eventId };
    
    if (method === 'PUT') {
      return this.put('/saveFlockEvents', requestData);
    } else {
      return this.post('/saveFlockEvents', requestData);
    }
  }

  /**
   * Delete a flock event
   */
  public async deleteFlockEvent(eventId: string): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const existingEvents = JSON.parse(localStorage.getItem('flockEvents') || '[]');
      const filteredEvents = existingEvents.filter((e: FlockEvent) => e.id !== eventId);
      localStorage.setItem('flockEvents', JSON.stringify(filteredEvents));
      return {
        success: true,
        message: 'Flock event deleted locally',
        data: { eventId }
      };
    }

    return this.delete('/deleteFlockEvent', { eventId });
  }

  /**
   * Save flock batch information
   */
  public async saveFlockBatch(batch: FlockBatch): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const existingBatches = JSON.parse(localStorage.getItem('flockBatches') || '[]');
      const batchIndex = existingBatches.findIndex((b: FlockBatch) => b.id === batch.id);
      
      if (batchIndex >= 0) {
        existingBatches[batchIndex] = batch;
      } else {
        existingBatches.push(batch);
      }
      
      localStorage.setItem('flockBatches', JSON.stringify(existingBatches));
      return {
        success: true,
        message: 'Flock batch saved locally',
        data: { flockBatch: batch }
      };
    }

    return this.post('/saveFlockBatch', batch);
  }

  /**
   * Save death record
   */
  public async saveDeathRecord(deathRecord: DeathRecord): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const existingRecords = JSON.parse(localStorage.getItem('deathRecords') || '[]');
      existingRecords.push(deathRecord);
      localStorage.setItem('deathRecords', JSON.stringify(existingRecords));
      return {
        success: true,
        message: 'Death record saved locally',
        data: { deathRecord }
      };
    }

    return this.post('/saveDeathRecord', deathRecord);
  }

  /**
   * Get flock summary with analytics
   */
  public async getFlockSummary(): Promise<ApiResponse> {
    if (isLocalStorageMode()) {
      const flockProfile = JSON.parse(localStorage.getItem('flockProfile') || 'null');
      const flockBatches = JSON.parse(localStorage.getItem('flockBatches') || '[]');
      const deathRecords = JSON.parse(localStorage.getItem('deathRecords') || '[]');
      
      const summary = this.calculateFlockSummary(flockProfile, flockBatches, deathRecords);
      return {
        success: true,
        data: summary,
        message: 'Flock summary calculated from local data'
      };
    }

    return this.get('/flockSummary');
  }

  /**
   * Calculate flock summary from local data
   */
  private calculateFlockSummary(
    flockProfile: FlockProfile | null, 
    flockBatches: FlockBatch[], 
    deathRecords: DeathRecord[]
  ) {
    const totalDeaths = deathRecords.reduce((sum, record) => sum + record.count, 0);
    const activeBatches = flockBatches.filter(batch => batch.isActive);
    
    const totalBirds = activeBatches.reduce((sum, batch) => sum + batch.currentCount, 0);
    const totalHens = activeBatches
      .filter(batch => batch.type === 'hens' || batch.type === 'mixed')
      .reduce((sum, batch) => sum + batch.currentCount, 0);
    
    return {
      totalBirds,
      totalHens,
      totalRoosters: activeBatches
        .filter(batch => batch.type === 'roosters')
        .reduce((sum, batch) => sum + batch.currentCount, 0),
      totalChicks: activeBatches
        .filter(batch => batch.type === 'chicks')
        .reduce((sum, batch) => sum + batch.currentCount, 0),
      activeBatches: activeBatches.length,
      totalDeaths,
      mortalityRate: totalBirds > 0 ? (totalDeaths / (totalBirds + totalDeaths)) * 100 : 0,
      batchSummary: activeBatches.map(batch => ({
        id: batch.id,
        name: batch.batchName,
        breed: batch.breed,
        type: batch.type,
        currentCount: batch.currentCount,
        acquisitionDate: batch.acquisitionDate,
        isLayingAge: this.calculateIsLayingAge(batch)
      }))
    };
  }

  /**
   * Calculate if a batch is of laying age
   */
  private calculateIsLayingAge(batch: FlockBatch): boolean {
    if (batch.type !== 'hens' && batch.type !== 'mixed') return false;
    if (batch.actualLayingStartDate) return true;
    if (batch.expectedLayingStartDate) {
      return new Date() >= new Date(batch.expectedLayingStartDate);
    }
    return false;
  }
}