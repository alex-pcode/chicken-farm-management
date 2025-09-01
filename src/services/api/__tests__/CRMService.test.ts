import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CRMService } from '../CRMService';
import type { CustomerForm, SaleForm } from '../../../types';

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

describe('CRMService', () => {
  let service: CRMService;

  beforeEach(() => {
    service = CRMService.getInstance();
    vi.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CRMService.getInstance();
      const instance2 = CRMService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getCustomers', () => {
    it('should call GET /customers endpoint', async () => {
      const mockResponse = { 
        success: true, 
        data: [{ id: '1', name: 'Test Customer', user_id: 'user1', created_at: '2025-01-01', is_active: true }] 
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

      const result = await service.getCustomers();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveCustomer', () => {
    it('should call POST /customers endpoint with customer data', async () => {
      const customerData: CustomerForm = {
        name: 'New Customer',
        phone: '123-456-7890',
        notes: 'Test notes'
      };
      
      const mockResponse = { 
        success: true, 
        data: { id: '1', ...customerData, user_id: 'user1', created_at: '2025-01-01', is_active: true } 
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

      const result = await service.saveCustomer(customerData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(customerData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('saveSale', () => {
    it('should call POST /sales endpoint with sale data', async () => {
      const saleData: SaleForm = {
        customer_id: 'customer1',
        sale_date: '2025-01-01',
        dozen_count: 2,
        individual_count: 5,
        total_amount: 25.50,
        notes: 'Test sale'
      };
      
      const mockResponse = { 
        success: true, 
        data: { 
          id: '1', 
          ...saleData, 
          user_id: 'user1', 
          created_at: '2025-01-01',
          customer_name: 'Test Customer'
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

      const result = await service.saveSale(saleData);
      
      expect(global.fetch).toHaveBeenCalledWith('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(saleData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCRMData', () => {
    it('should call GET /crm-data endpoint', async () => {
      const mockResponse = { 
        success: true, 
        data: {
          customers: [],
          recentSales: [],
          salesSummary: {
            total_sales: 0,
            total_revenue: 0,
            total_eggs_sold: 0,
            free_eggs_given: 0,
            customer_count: 0
          }
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

      const result = await service.getCRMData();
      
      expect(global.fetch).toHaveBeenCalledWith('/api/crm-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
