import { BaseApiService } from './BaseApiService';
import { AuthService as IAuthService, ApiResponse } from './types';
import { supabase } from '../../utils/supabase';

/**
 * Authentication service handling token management and user authentication state
 */
export class AuthService extends BaseApiService implements IAuthService {
  private static instance: AuthService;

  /**
   * Singleton pattern to ensure consistent auth state across the application
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get authenticated headers with automatic token refresh
   * Public method to expose base functionality
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    return super.getAuthHeaders();
  }

  /**
   * Refresh the current session token
   */
  public async refreshToken(): Promise<void> {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh authentication token');
    }
  }

  /**
   * Check if user is currently authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session?.access_token;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Get current user session
   */
  public async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Failed to get current session: ${error.message}`);
    }
    return session;
  }

  /**
   * Get current user information
   */
  public async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }
    return user;
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Migrate user data (from legacy authApiUtils.ts)
   */
  public async migrateUserData(): Promise<ApiResponse> {
    return this.post('/migrateUserData', {});
  }
}