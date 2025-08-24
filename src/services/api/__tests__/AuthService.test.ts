import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../AuthService';
import type { AuthError, Session, User } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('../../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Import the mocked module and properly type it
import { supabase } from '../../../utils/supabase';

// Get properly typed mock functions
const mockGetSession = vi.mocked(supabase.auth.getSession);
const mockRefreshSession = vi.mocked(supabase.auth.refreshSession);  
const mockGetUser = vi.mocked(supabase.auth.getUser);
const mockSignOut = vi.mocked(supabase.auth.signOut);

// Helper to create AuthError-like object
const createAuthError = (message: string): AuthError => {
  const error = new Error(message) as Error & { code: string; status: number };
  error.name = 'AuthError';
  error.code = 'auth_error';
  error.status = 400;
  return error as AuthError;
};

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
      const mockSession: Session = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: { 
          id: 'user-id', 
          email: 'test@example.com', 
          aud: 'authenticated', 
          created_at: '2025-01-01T00:00:00.000Z',
          app_metadata: {},
          user_metadata: {}
        }
      };

      mockGetSession.mockResolvedValue({
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
      const newSession: Session = {
        access_token: 'new-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          aud: 'authenticated',
          created_at: '2025-01-01T00:00:00.000Z',
          app_metadata: {},
          user_metadata: {}
        }
      };
      mockRefreshSession.mockResolvedValue({
        data: { 
          session: newSession,
          user: null 
        },
        error: null,
      });

      await expect(authService.refreshToken()).resolves.not.toThrow();
      expect(mockRefreshSession).toHaveBeenCalled();
    });

    it('should throw error when refresh fails', async () => {
      const refreshError = createAuthError('Refresh failed');
      mockRefreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: refreshError,
      });

      await expect(authService.refreshToken()).rejects.toThrow('Failed to refresh authentication token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid session', async () => {
      const validSession: Session = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          aud: 'authenticated',
          created_at: '2025-01-01T00:00:00.000Z',
          app_metadata: {},
          user_metadata: {}
        }
      };
      mockGetSession.mockResolvedValue({
        data: { session: validSession },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false for invalid session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when session check fails', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: createAuthError('Session check failed'),
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should handle exceptions gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'));

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      const mockSession: Session = { 
        access_token: 'token', 
        refresh_token: 'refresh_token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: { 
          id: '123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2025-01-01T00:00:00.000Z'
        }
      };
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await authService.getCurrentSession();
      expect(session).toEqual(mockSession);
    });

    it('should throw error when session retrieval fails', async () => {
      const sessionError = createAuthError('Session retrieval failed');
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });

      await expect(authService.getCurrentSession()).rejects.toThrow('Failed to get current session: Session retrieval failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser: User = { 
        id: '123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2025-01-01T00:00:00.000Z'
      };
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should throw error when user retrieval fails', async () => {
      const userError = createAuthError('User retrieval failed');
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: userError,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get current user: User retrieval failed');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValue({
        error: null,
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const signOutError = createAuthError('Sign out failed');
      mockSignOut.mockResolvedValue({
        error: signOutError,
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed: Sign out failed');
    });
  });

  describe('migrateUserData', () => {
    it('should make successful migration request', async () => {
      const mockSession: Session = { 
        access_token: 'token',
        refresh_token: 'refresh_token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: { 
          id: 'user-id',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2025-01-01T00:00:00.000Z'
        }
      };
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const mockResponse = { 
        success: true, 
        data: { migrated: true },
        message: 'User data migrated successfully'
      };
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