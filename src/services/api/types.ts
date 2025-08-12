// Import consolidated API types from main types module
import type { ApiResponse, ApiError } from '../../types/api';

// Re-export API types for use by service implementations
export type { ApiResponse, ApiError };

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

// Re-export service types from main types module for convenience
export type { 
  HttpMethod, 
  RequestConfig, 
  AuthService, 
  DataService, 
  ProductionService, 
  CrmService, 
  FlockService, 
  ApiServiceConfig 
} from '../../types/services';