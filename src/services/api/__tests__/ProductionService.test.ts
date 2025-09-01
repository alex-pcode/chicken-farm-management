import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductionService } from '../ProductionService';
import type { EggEntry, FeedEntry, Expense } from '../../../types';

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

describe('ProductionService', () => {
  let service: ProductionService;

  beforeEach(() => {
    service = ProductionService.getInstance();
    vi.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ProductionService.getInstance();
      const instance2 = ProductionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getEggEntries', () => {
    it('should extract egg entries from getData response', async () => {
      const mockEggEntries: EggEntry[] = [
        { 
          id: '1', 
          date: '2025-01-01', 
          count: 12, 
          created_at: '2025-01-01T10:00:00Z' 
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: { 
          eggEntries: mockEggEntries,
          expenses: [],
          feedEntries: []
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

      const result = await service.getEggEntries();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/data?type=production', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      
      expect(result).toEqual({
        success: true,
        data: mockEggEntries,
        message: 'Egg entries fetched successfully'
      });
    });

    it('should return empty array when no egg entries found', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          expenses: [],
          feedEntries: []
          // No eggEntries property
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

      const result = await service.getEggEntries();
      
      expect(result).toEqual({
        success: true,
        data: [],
        message: 'No egg entries found in response'
      });
    });
  });

  describe('saveEggEntries', () => {
    it('should call POST /saveEggEntries endpoint with egg entries', async () => {
      const eggEntries: EggEntry[] = [
        { 
          id: '1', 
          date: '2025-01-01', 
          count: 12, 
          created_at: '2025-01-01T10:00:00Z' 
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: eggEntries 
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

      const result = await service.saveEggEntries(eggEntries);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=eggs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(eggEntries),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveFeedInventory', () => {
    it('should call POST /saveFeedInventory endpoint with feed entries', async () => {
      const feedEntries: FeedEntry[] = [
        { 
          id: '1', 
          brand: 'Test Brand', 
          type: 'layer_feed',
          quantity: 50,
          unit: 'kg',
          pricePerUnit: 25.00,
          total_cost: 1250.00,
          openedDate: '2025-01-01',
          created_at: '2025-01-01T10:00:00Z'
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: feedEntries 
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

      const result = await service.saveFeedInventory(feedEntries);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(feedEntries),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getExpenses', () => {
    it('should extract expenses from getData response', async () => {
      const mockExpenses: Expense[] = [
        { 
          id: '1', 
          date: '2025-01-01', 
          category: 'feed',
          description: 'Feed purchase',
          amount: 100.00,
          created_at: '2025-01-01T10:00:00Z' 
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: { 
          expenses: mockExpenses,
          eggEntries: [],
          feedEntries: []
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

      const result = await service.getExpenses();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/data?type=expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      
      expect(result).toEqual({
        success: true,
        data: mockExpenses,
        message: 'Expenses fetched successfully'
      });
    });

    it('should return empty array when no expenses found', async () => {
      const mockResponse = { 
        success: true, 
        data: { 
          eggEntries: [],
          feedEntries: []
          // No expenses property
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

      const result = await service.getExpenses();
      
      expect(result).toEqual({
        success: true,
        data: [],
        message: 'No expenses found in response'
      });
    });
  });

  describe('saveExpenses', () => {
    it('should call POST /saveExpenses endpoint with expenses', async () => {
      const expenses: Expense[] = [
        { 
          id: '1', 
          date: '2025-01-01', 
          category: 'feed',
          description: 'Feed purchase',
          amount: 100.00,
          created_at: '2025-01-01T10:00:00Z' 
        }
      ];
      
      const mockResponse = { 
        success: true, 
        data: expenses 
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

      const result = await service.saveExpenses(expenses);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crud?operation=expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(expenses),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProductionAnalytics', () => {
    it('should call GET /productionAnalytics endpoint without date range', async () => {
      const mockResponse = { 
        success: true, 
        data: {
          totalEggs: 100,
          avgDaily: 12.5,
          productivity: 0.85
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

      const result = await service.getProductionAnalytics();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/productionAnalytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /productionAnalytics endpoint with date range parameters', async () => {
      const dateRange = { start: '2025-01-01', end: '2025-01-31' };
      const mockResponse = { 
        success: true, 
        data: {
          totalEggs: 50,
          avgDaily: 10.0,
          productivity: 0.80
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

      const result = await service.getProductionAnalytics(dateRange);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/productionAnalytics?start=2025-01-01&end=2025-01-31', {
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

      await expect(service.getEggEntries()).rejects.toThrow('User not authenticated - please log in again');
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

      await expect(service.getEggEntries()).rejects.toThrow('Network error');
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
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database error' }),
      } as any);

      await expect(service.getEggEntries()).rejects.toThrow();
    });
  });
});
