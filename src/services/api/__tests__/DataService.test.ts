import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataService } from '../DataService';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  },
};

// Mock localStorage mode check
const mockIsLocalStorageMode = vi.fn();

vi.mock('../../../utils/supabase', () => ({
  supabase: mockSupabase,
  isLocalStorageMode: mockIsLocalStorageMode,
}));

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

  describe('fetchAllData - localStorage mode', () => {
    beforeEach(() => {
      mockIsLocalStorageMode.mockReturnValue(true);
    });

    it('should fetch data from localStorage', async () => {
      const mockData = {
        feedInventory: [{ id: '1', brand: 'Test Feed' }],
        eggEntries: [{ id: '1', date: '2025-01-01', count: 12 }],
        expenses: [{ id: '1', category: 'feed', amount: 50 }],
        flockProfile: { id: '1', hens: 10 },
        flockEvents: [{ id: '1', type: 'acquisition' }],
        flockBatches: [{ id: '1', batchName: 'Batch 1' }],
        deathRecords: [{ id: '1', count: 1 }],
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'feedInventory': return JSON.stringify(mockData.feedInventory);
          case 'eggEntries': return JSON.stringify(mockData.eggEntries);
          case 'expenses': return JSON.stringify(mockData.expenses);
          case 'flockProfile': return JSON.stringify(mockData.flockProfile);
          case 'flockEvents': return JSON.stringify(mockData.flockEvents);
          case 'flockBatches': return JSON.stringify(mockData.flockBatches);
          case 'deathRecords': return JSON.stringify(mockData.deathRecords);
          default: return null;
        }
      });

      const result = await dataService.fetchAllData();

      expect(result.data).toEqual(mockData);
      expect(result.message).toBe('Data loaded from localStorage');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle missing localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await dataService.fetchAllData();

      const expectedData = {
        feedInventory: [],
        eggEntries: [],
        expenses: [],
        flockProfile: null,
        flockEvents: [],
        flockBatches: [],
        deathRecords: [],
      };

      expect(result.data).toEqual(expectedData);
    });
  });

  describe('fetchAllData - API mode', () => {
    beforeEach(() => {
      mockIsLocalStorageMode.mockReturnValue(false);
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      });
    });

    it('should fetch data from API', async () => {
      const mockApiResponse = {
        data: {
          feedInventory: [{ id: '1', brand: 'API Feed' }],
          eggEntries: [{ id: '1', date: '2025-01-01', count: 15 }],
          expenses: [{ id: '1', category: 'feed', amount: 75 }],
          flockProfile: { id: '1', hens: 20 },
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await dataService.fetchAllData();

      expect(mockFetch).toHaveBeenCalledWith('/api/getData', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
      expect(result.data).toEqual(mockApiResponse.data);
    });

    it('should handle API response without nested data structure', async () => {
      const mockDirectResponse = {
        feedInventory: [{ id: '1' }],
        eggEntries: [{ id: '1' }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDirectResponse),
      });

      const result = await dataService.fetchAllData();
      expect(result).toEqual(mockDirectResponse);
    });
  });

  describe('saveData', () => {
    it('should save data to localStorage in localStorage mode', async () => {
      mockIsLocalStorageMode.mockReturnValue(true);
      const testData = { test: 'data' };

      const result = await dataService.saveData(testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('genericData', JSON.stringify(testData));
      expect(result.message).toBe('Data saved to localStorage');
      expect(result.data).toEqual(testData);
    });

    it('should throw error in API mode', async () => {
      mockIsLocalStorageMode.mockReturnValue(false);
      const testData = { test: 'data' };

      await expect(dataService.saveData(testData)).rejects.toThrow('Use specific service methods for saving data');
    });
  });
});