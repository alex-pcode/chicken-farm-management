// API Response Types and Error Handling

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorData;
  message?: string;
}

// Error response data interface
export interface ApiErrorData {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
}

// API Error class for throwing errors
export class ApiError extends Error {
  public readonly status: number;
  public readonly timestamp: string;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}

// Specific API Response Types
export interface EggEntriesSaveData {
  saved: number;
  entries: string[]; // IDs of saved entries
}

export interface ExpensesSaveData {
  saved: number;
  expenses: string[]; // IDs of saved expenses
}

export interface FeedInventorySaveData {
  saved: number;
  inventory: string[]; // IDs of saved inventory items
}

export interface FlockProfileSaveData {
  profileId: string;
  updated: boolean;
}

export interface FlockEventsSaveData {
  saved: number;
  events: string[]; // IDs of saved events
}

export interface FlockEventSaveData {
  eventId: string;
  created: boolean;
  updated: boolean;
}

export interface DeleteEventData {
  deleted: boolean;
  eventId: string;
}

export interface MigrationData {
  migrated: boolean;
  recordsProcessed: number;
}

export type EggEntriesResponse = ApiResponse<EggEntriesSaveData>;
export type ExpensesResponse = ApiResponse<ExpensesSaveData>;
export type FeedInventoryResponse = ApiResponse<FeedInventorySaveData>;
export type FlockProfileResponse = ApiResponse<FlockProfileSaveData>;
export type FlockEventsResponse = ApiResponse<FlockEventsSaveData>;
export type FlockEventResponse = ApiResponse<FlockEventSaveData>;
export type DeleteEventResponse = ApiResponse<DeleteEventData>;
export type MigrationResponse = ApiResponse<MigrationData>;

// Generic fetch response - will be properly typed in future stories
export type FetchDataResponse = ApiResponse<unknown>;

// Custom Error Classes
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiServiceError';
  }
}

export class AuthenticationError extends ApiServiceError {
  constructor(message: string = 'Authentication failed - please log in again', details?: string) {
    super(message, 'AUTHENTICATION_FAILED', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends ApiServiceError {
  constructor(message: string = 'Network request failed', statusCode: number = 0, details?: string) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

export class ApiValidationError extends ApiServiceError {
  constructor(message: string = 'Request validation failed', details?: string) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ApiValidationError';
  }
}

export class ServerError extends ApiServiceError {
  constructor(message: string = 'Internal server error', statusCode: number = 500, details?: string) {
    super(message, 'SERVER_ERROR', statusCode, details);
    this.name = 'ServerError';
  }
}

// Error message mapping for user-friendly messages
export const ERROR_MESSAGES: Record<string, string> = {
  AUTHENTICATION_FAILED: 'Please refresh the page or log in again',
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  VALIDATION_ERROR: 'The provided data is invalid. Please check your input.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Helper function to create user-friendly error messages
export const getUserFriendlyErrorMessage = (error: ApiErrorData | Error): string => {
  if (error instanceof ApiServiceError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  
  if ('code' in error && typeof error.code === 'string') {
    return ERROR_MESSAGES[error.code] || error.message || 'An unexpected error occurred';
  }
  
  return error.message || 'An unexpected error occurred';
};