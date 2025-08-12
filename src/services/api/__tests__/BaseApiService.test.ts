import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseApiService } from '../BaseApiService';
import { ApiError } from '../../../types/api';

// Mock Supabase
const mockSupabaseAuth = {
  getSession: vi.fn(),
  refreshSession: vi.fn(),
  signOut: vi.fn(),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
};

vi.mock('../../../utils/supabase', () => ({
  supabase: mockSupabase,
}));

// Global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Concrete implementation of BaseApiService for testing
class TestApiService extends BaseApiService {
  public async testGet<T>(endpoint: string) {
    return this.get<T>(endpoint);
  }

  public async testPost<T>(endpoint: string, data: unknown) {
    return this.post<T>(endpoint, data);
  }

  public async testPut<T>(endpoint: string, data: unknown) {
    return this.put<T>(endpoint, data);
  }

  public async testDelete<T>(endpoint: string, data?: unknown) {
    return this.delete<T>(endpoint, data);
  }

  public async testGetAuthHeaders() {
    return this.getAuthHeaders();
  }

  public testGetPublicHeaders() {
    return this.getPublicHeaders();
  }

  public testBuildUrl(endpoint: string) {
    return this.buildUrl(endpoint);
  }
}

describe('BaseApiService', () => {
  let service: TestApiService;

  beforeEach(() => {
    service = new TestApiService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAuthHeaders', () => {
    it('should return headers with valid session token', async () => {
      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const headers = await service.testGetAuthHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      });
    });

    it('should refresh token when session is expired', async () => {
      const expiredSession = null;
      const refreshedSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh-token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession },
        error: null,
      });

      const headers = await service.testGetAuthHeaders();

      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer new-token',
      });
    });

    it('should throw ApiError when token refresh fails', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Refresh failed'),
      });

      await expect(service.testGetAuthHeaders()).rejects.toThrow(ApiError);
      await expect(service.testGetAuthHeaders()).rejects.toThrow('User not authenticated');
    });
  });

  describe('getPublicHeaders', () => {
    it('should return public headers without authorization', () => {
      const headers = service.testGetPublicHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('buildUrl', () => {
    it('should build correct API URL', () => {
      const url = service.testBuildUrl('/test');
      expect(url).toBe('/api/test');
    });
  });

  describe('HTTP methods', () => {
    const mockSession = {
      access_token: 'test-token',
      refresh_token: 'refresh-token',
    };

    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    describe('GET requests', () => {
      it('should make successful GET request', async () => {
        const mockResponse = { data: { test: 'data' } };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service.testGet('/test');

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        });
        expect(result).toEqual(mockResponse);
      });

      it('should handle 401 authentication errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: () => Promise.resolve('Unauthorized'),
        });

        await expect(service.testGet('/test')).rejects.toThrow(ApiError);
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });

      it('should handle non-401 HTTP errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Internal Server Error'),
        });

        await expect(service.testGet('/test')).rejects.toThrow(ApiError);
        await expect(service.testGet('/test')).rejects.toThrow('HTTP error! status: 500');
      });
    });

    describe('POST requests', () => {
      it('should make successful POST request with data', async () => {
        const testData = { test: 'data' };
        const mockResponse = { data: { success: true } };
        
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service.testPost('/test', testData);

        expect(mockFetch).toHaveBeenCalledWith('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(testData),
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('PUT requests', () => {
      it('should make successful PUT request', async () => {
        const testData = { id: 1, test: 'updated data' };
        const mockResponse = { data: { updated: true } };
        
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service.testPut('/test/1', testData);

        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(testData),
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('DELETE requests', () => {
      it('should make successful DELETE request without data', async () => {
        const mockResponse = { data: { deleted: true } };
        
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service.testDelete('/test/1');

        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: undefined,
        });
        expect(result).toEqual(mockResponse);
      });

      it('should make successful DELETE request with data', async () => {
        const deleteData = { reason: 'test deletion' };
        const mockResponse = { data: { deleted: true } };
        
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await service.testDelete('/test/1', deleteData);

        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(deleteData),
        });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      });
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(service.testGet('/test')).rejects.toThrow(ApiError);
      await expect(service.testGet('/test')).rejects.toThrow('Invalid response format from server');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.testGet('/test')).rejects.toThrow('Network error');
    });
  });
});