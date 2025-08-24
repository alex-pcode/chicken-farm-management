import { supabase } from '../../utils/supabase';
import { ApiError, ApiResponse } from '../../types/api';
import { 
  isApiResponse, 
  ValidationResult, 
  createValidationError, 
  createInvalidResult, 
  createValidResult 
} from '../../utils/typeGuards';

/**
 * Base API Service class providing common functionality for all API operations
 * Handles authentication, token refresh, and standardized error handling
 */
export abstract class BaseApiService {
  private static readonly API_BASE_URL = '/api';

  /**
   * Get authenticated headers with automatic token refresh
   */
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    // First try to get the current session
    const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
    let session = initialSession;
    
    // If no session or session is expired, try to refresh
    if (sessionError || !session || !session.access_token) {
      this.logDebug('No valid session found, attempting token refresh');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        this.logError('Token refresh failed', refreshError);
        throw new ApiError('User not authenticated - please log in again', 401);
      }
      
      // Use the refreshed session
      session = refreshData.session;
      this.logDebug('Token refreshed successfully');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    };
  }

  /**
   * Get non-authenticated headers for public endpoints
   */
  protected getPublicHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Build full API URL from endpoint
   */
  protected buildUrl(endpoint: string): string {
    return `${BaseApiService.API_BASE_URL}${endpoint}`;
  }

  /**
   * Handle API response and errors consistently with validation
   */
  protected async handleResponse<T>(
    response: Response,
    dataValidator?: (data: unknown) => data is T
  ): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      this.logError(`API Error ${response.status}`, errorText);
      
      // Handle authentication errors by signing out
      if (response.status === 401) {
        await supabase.auth.signOut();
        throw new ApiError('Authentication failed - please refresh the page or log in again', 401);
      }
      
      throw new ApiError(`HTTP error! status: ${response.status} - ${errorText}`, response.status);
    }

    try {
      const rawData = await response.json();
      
      
      // Validate the response structure
      if (!isApiResponse(rawData, dataValidator)) {
        this.logError('Invalid API response structure', rawData);
        throw new ApiError('Server returned invalid response format', 500);
      }
      
      // Transform message format to ApiResponse format if needed
      if ('message' in rawData && 'timestamp' in rawData && !('success' in rawData)) {
        const messageData = rawData as { data?: T; message: string };
        
        
        const transformedData: ApiResponse<T> = {
          success: true,
          data: messageData.data,
          message: messageData.message
        };
        
        return transformedData;
      }
      
      // Additional data validation if validator is provided and data exists
      if (dataValidator && rawData.data !== undefined && !dataValidator(rawData.data)) {
        this.logError('API response data failed validation', rawData.data);
        throw new ApiError('Server returned invalid data format', 500);
      }
      
      return rawData;
    } catch (error) {
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }
      
      this.logError('Failed to parse API response', error);
      throw new ApiError('Invalid response format from server', 500);
    }
  }

  /**
   * Perform authenticated GET request with optional data validation
   */
  protected async get<T>(
    endpoint: string,
    dataValidator?: (data: unknown) => data is T
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'GET',
        headers,
      });

      return this.handleResponse<T>(response, dataValidator);
    } catch (error) {
      this.logError(`GET ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Perform authenticated POST request with optional data validation
   */
  protected async post<T>(
    endpoint: string, 
    data: unknown,
    dataValidator?: (data: unknown) => data is T
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response, dataValidator);
    } catch (error) {
      this.logError(`POST ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Perform authenticated PUT request with optional data validation
   */
  protected async put<T>(
    endpoint: string, 
    data: unknown,
    dataValidator?: (data: unknown) => data is T
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response, dataValidator);
    } catch (error) {
      this.logError(`PUT ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Perform authenticated DELETE request with optional data validation
   */
  protected async delete<T>(
    endpoint: string, 
    data?: unknown,
    dataValidator?: (data: unknown) => data is T
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'DELETE',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response, dataValidator);
    } catch (error) {
      this.logError(`DELETE ${endpoint} failed`, error);
      throw error;
    }
  }

  /**
   * Validate request data before sending to API
   */
  protected validateRequestData<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    typeName: string
  ): ValidationResult<T> {
    if (validator(data)) {
      return createValidResult(data);
    }
    
    return createInvalidResult([
      createValidationError(
        'request_data',
        `Invalid ${typeName} data provided`,
        'invalid'
      )
    ]);
  }

  /**
   * Log API errors with consistent format
   */
  private logError(context: string, error: unknown): void {
    // Errors are handled by the calling code
    void context; // Mark as used to avoid linting warning
    void error; // Mark as used to avoid linting warning
  }

  /**
   * Log debug information in development mode
   */
  private logDebug(message: string): void {
    // Debug logging removed
    void message; // Mark as used to avoid linting warning
  }
}