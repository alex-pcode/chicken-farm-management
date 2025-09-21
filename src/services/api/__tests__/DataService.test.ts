/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataService } from '../DataService';

// Mock Supabase
vi.mock('../../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

// Import the mocked module
import { supabase } from '../../../utils/supabase';
const mockSupabase = vi.mocked(supabase);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DataService', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = DataService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = DataService.getInstance();
      const instance2 = DataService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('fetchAllData - basic API calls', () => {
    beforeEach(() => {
      // Mock successful authentication for API calls
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: 'user1' } } },
        error: null,
      } as any);
      
      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: 'user1' } } },
        error: null
      } as any);
    });

    it('should fetch data from API with all data types', async () => {
      const mockData = {
        feedInventory: [{ id: '1', brand: 'Test Feed' }],
        eggEntries: [{ id: '1', date: '2025-01-01', count: 12 }],
        expenses: [{ id: '1', category: 'feed', amount: 50 }],
        flockProfile: { id: '1', hens: 10 },
        flockEvents: [{ id: '1', type: 'acquisition' }],
        flockBatches: [{ id: '1', batchName: 'Batch 1' }],
        deathRecords: [{ id: '1', count: 1 }],
      };

      const mockApiResponse = {
        success: true,
        data: mockData,
        message: 'All data fetched successfully'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await dataService.fetchAllData();

      expect(mockFetch).toHaveBeenCalledWith('/api/data?type=all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle API response with empty data', async () => {
      const emptyMockData = {
        feedInventory: [],
        eggEntries: [],
        expenses: [],
        flockProfile: null,
        flockEvents: [],
        flockBatches: [],
        deathRecords: [],
      };

      const mockApiResponse = {
        success: true,
        data: emptyMockData,
        message: 'No data found'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await dataService.fetchAllData();

      expect(result.data).toEqual(emptyMockData);
    });
  });

  describe('fetchAllData - API mode', () => {
    beforeEach(() => {
      // API mode setup - mock successful authentication
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: 'user1' } } },
        error: null,
      } as any);
      
      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: 'user1' } } },
        error: null
      } as any);
    });

    it('should fetch data from API', async () => {
      const mockApiData = {
        feedInventory: [{ id: '1', brand: 'API Feed' }],
        eggEntries: [{ id: '1', date: '2025-01-01', count: 15 }],
        expenses: [{ id: '1', category: 'feed', amount: 75 }],
        flockProfile: { id: '1', hens: 20 },
        flockEvents: [],
        flockBatches: [],
        deathRecords: [],
      };

      const mockApiResponse = {
        success: true,
        data: mockApiData,
        message: 'All data fetched successfully'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await dataService.fetchAllData();

      expect(mockFetch).toHaveBeenCalledWith('/api/data?type=all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
      expect(result.data).toEqual(mockApiData);
    });

    it('should handle API response with partial data structure', async () => {
      const mockPartialData = {
        feedInventory: [{ id: '1' }],
        eggEntries: [{ id: '1' }],
        expenses: [],
        flockProfile: null,
      };

      const mockApiResponse = {
        success: true,
        data: mockPartialData,
        message: 'Partial data fetched successfully'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await dataService.fetchAllData();
      expect(result.data).toEqual(mockPartialData);
    });
  });

  describe('saveData', () => {
    it('should throw error for generic save operations', async () => {
      // DataService now delegates to specific service methods
      const testData = { test: 'data' };

      await expect(dataService.saveData(testData)).rejects.toThrow('Use specific service methods for saving data');
    });

    it('should consistently throw error regardless of data type', async () => {
      const testData = { feedInventory: [{ id: '1' }] };

      await expect(dataService.saveData(testData)).rejects.toThrow('Use specific service methods for saving data');
    });
  });
});
