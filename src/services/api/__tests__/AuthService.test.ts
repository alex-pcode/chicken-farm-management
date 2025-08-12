import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../AuthService';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('../../../utils/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAuthHeaders', () => {
    it('should return valid auth headers', async () => {
      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const headers = await authService.getAuthHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: { access_token: 'new-token' } },
        error: null,
      });

      await expect(authService.refreshToken()).resolves.not.toThrow();
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('should throw error when refresh fails', async () => {
      const refreshError = new Error('Refresh failed');
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: refreshError,
      });

      await expect(authService.refreshToken()).rejects.toThrow('Failed to refresh authentication token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'valid-token' } },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false for invalid session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when session check fails', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session check failed'),
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'));

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      const mockSession = { access_token: 'token', user: { id: '123' } };
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await authService.getCurrentSession();
      expect(session).toEqual(mockSession);
    });

    it('should throw error when session retrieval fails', async () => {
      const sessionError = new Error('Session retrieval failed');
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });

      await expect(authService.getCurrentSession()).rejects.toThrow('Failed to get current session: Session retrieval failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should throw error when user retrieval fails', async () => {
      const userError = new Error('User retrieval failed');
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: userError,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get current user: User retrieval failed');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const signOutError = new Error('Sign out failed');
      mockSupabase.auth.signOut.mockResolvedValue({
        error: signOutError,
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed: Sign out failed');
    });
  });

  describe('migrateUserData', () => {
    it('should make successful migration request', async () => {
      const mockSession = { access_token: 'token' };
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const mockResponse = { data: { migrated: true } };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.migrateUserData();

      expect(mockFetch).toHaveBeenCalledWith('/api/migrateUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
        body: JSON.stringify({}),
      });
      expect(result).toEqual(mockResponse);
    });
  });
});