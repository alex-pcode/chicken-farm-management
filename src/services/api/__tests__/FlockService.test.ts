import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlockService } from '../FlockService';
import type { FlockProfile, FlockEvent, FlockBatch, DeathRecord } from '../../../types';

// Mock the base dependencies
vi.mock('../../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('FlockService', () => {
  let service: FlockService;

  beforeEach(() => {
    service = FlockService.getInstance();
    vi.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = FlockService.getInstance();
      const instance2 = FlockService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveFlockProfile', () => {
    it('should call POST /saveFlockProfile endpoint with profile data', async () => {
      const flockProfile: FlockProfile = {
        id: '1',
        hens: 20,
        roosters: 2,
        chicks: 5,
        brooding: 3,
        lastUpdated: '2025-01-01',
        breedTypes: ['Rhode Island Red', 'Leghorn'],
        flockStartDate: '2024-12-01',
        events: [],
        notes: 'Test flock'
      };
      
      const mockResponse = { 
        success: true, 
        data: flockProfile 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveFlockProfile(flockProfile);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=flockProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(flockProfile),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveFlockEvents', () => {
    it('should call POST /crud?operation=flockEvents endpoint with events array', async () => {
      const flockEvents: FlockEvent[] = [
        {
          id: '1',
          date: '2025-01-01',
          type: 'acquisition',
          description: 'Acquired 20 hens',
          affectedBirds: 20,
          notes: 'From local farm'
        },
        {
          id: '2',
          date: '2025-01-15',
          type: 'laying_start',
          description: 'First eggs laid',
          affectedBirds: 5,
          notes: 'Started with younger hens'
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: flockEvents 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveFlockEvents(flockEvents);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=flockEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(flockEvents),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveFlockEvent', () => {
    it('should call POST /crud?operation=flockEvents for new event', async () => {
      const flockProfileId = 'profile-1';
      const flockEvent: FlockEvent = {
        id: '1',
        date: '2025-01-01',
        type: 'broody',
        description: 'Hen went broody',
        affectedBirds: 1,
        notes: 'Isolated for now'
      };
      
      const requestData = { date: flockEvent.date, type: flockEvent.type, description: flockEvent.description, affectedBirds: flockEvent.affectedBirds, notes: flockEvent.notes, flock_profile_id: flockProfileId };
      const mockResponse = { 
        success: true, 
        data: flockEvent 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveFlockEvent(flockProfileId, flockEvent);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=flockEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /crud?operation=flockEvents for updating existing event', async () => {
      const flockProfileId = 'profile-1';
      const eventId = 'event-1';
      const flockEvent: FlockEvent = {
        id: eventId,
        date: '2025-01-01',
        type: 'hatching',
        description: 'Chicks hatched successfully',
        affectedBirds: 8,
        notes: 'All healthy'
      };
      
      const requestData = { ...flockEvent, flock_profile_id: flockProfileId, id: eventId };
      const mockResponse = { 
        success: true, 
        data: flockEvent 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveFlockEvent(flockProfileId, flockEvent, eventId);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=flockEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteFlockEvent', () => {
    it('should call DELETE /crud?operation=flockEvents endpoint with event ID', async () => {
      const eventId = 'event-1';
      const mockResponse = { 
        success: true, 
        message: 'Event deleted successfully' 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.deleteFlockEvent(eventId);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=flockEvents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ id: eventId }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveFlockBatch', () => {
    it('should call POST /flockBatches endpoint with batch data', async () => {
      const flockBatch: FlockBatch = {
        id: 'batch-1',
        batchName: 'Spring 2025 Batch',
        breed: 'Rhode Island Red',
        acquisitionDate: '2025-01-01',
        initialCount: 25,
        currentCount: 24,
        type: 'hens',
        ageAtAcquisition: 'juvenile',
        expectedLayingStartDate: '2025-03-01',
        source: 'Local Hatchery',
        notes: 'High quality breeding stock',
        isActive: true
      };
      
      const mockResponse = { 
        success: true, 
        data: flockBatch 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveFlockBatch(flockBatch);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/flockBatches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(flockBatch),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveDeathRecord', () => {
    it('should call POST /deathRecords endpoint with death record data', async () => {
      const deathRecord: DeathRecord = {
        id: 'death-1',
        batchId: 'batch-1',
        date: '2025-01-15',
        count: 1,
        cause: 'predator',
        description: 'Fox attack during night',
        notes: 'Need to improve coop security'
      };
      
      const mockResponse = { 
        success: true, 
        data: deathRecord 
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.saveDeathRecord(deathRecord);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/deathRecords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(deathRecord),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFlockSummary', () => {
    it('should call GET /flockSummary endpoint', async () => {
      const mockResponse = { 
        success: true, 
        data: {
          totalBirds: 27,
          activeBatches: 2,
          eggProductivity: 0.85,
          healthStatus: 'good',
          upcomingEvents: []
        }
      };
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await service.getFlockSummary();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/flockSummary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      // Mock auth failure
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Not authenticated' }
      } as any);
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh failed' }
      } as any);

      const flockProfile: FlockProfile = {
        hens: 10,
        roosters: 1,
        chicks: 0,
        brooding: 0,
        lastUpdated: '2025-01-01',
        breedTypes: ['Test'],
        events: []
      };

      await expect(service.saveFlockProfile(flockProfile)).rejects.toThrow('User not authenticated - please log in again');
    });

    it('should handle network errors', async () => {
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock network failure
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      await expect(service.getFlockSummary()).rejects.toThrow('Network error');
    });

    it('should handle API error responses', async () => {
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      // Mock API error response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid flock data' }),
      } as any);

      const flockProfile: FlockProfile = {
        hens: -1, // Invalid data
        roosters: 1,
        chicks: 0,
        brooding: 0,
        lastUpdated: '2025-01-01',
        breedTypes: ['Test'],
        events: []
      };

      await expect(service.saveFlockProfile(flockProfile)).rejects.toThrow();
    });
  });

  describe('flock event types', () => {
    it('should handle all supported event types', async () => {
      const eventTypes: Array<FlockEvent['type']> = ['acquisition', 'laying_start', 'broody', 'hatching', 'other'];
      
      // Mock successful auth
      const { supabase } = await import('../../../utils/supabase');
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user1' } } },
        error: null
      } as any);

      for (const eventType of eventTypes) {
        const flockEvent: FlockEvent = {
          id: `event-${eventType}`,
          date: '2025-01-01',
          type: eventType,
          description: `Test ${eventType} event`,
          affectedBirds: 1
        };

        const mockResponse = { success: true, data: flockEvent };
        
        vi.mocked(global.fetch).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as any);

        const result = await service.saveFlockEvent('profile-1', flockEvent);
        expect(result).toEqual(mockResponse);
      }
    });
  });
});
