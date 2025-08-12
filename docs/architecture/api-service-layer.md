# API Service Layer Architecture

## Overview

The unified API service layer (`src/services/api/`) provides centralized, type-safe API operations for the Chicken Manager application. Implemented as part of **Epic 1: API Consolidation**, this layer consolidates all data operations with consistent error handling, authentication, and domain separation.

## Architecture Principles

### 1. **Single Responsibility**
Each service class handles operations for a specific business domain:
- `AuthService` - Authentication and session management
- `DataService` - General data retrieval operations  
- `ProductionService` - Egg tracking, feed inventory, expenses
- `FlockService` - Flock profiles, events, batch management

### 2. **Consistent Error Handling**
- Standardized `ApiError` class with status codes and timestamps
- Automatic 401 handling with user sign-out
- Consistent error logging across all services
- Type-safe error responses

### 3. **Centralized Authentication**
- Automatic JWT token refresh via `AuthService`
- Consistent authorization headers across all requests
- Session validation and management
- Secure token storage and retrieval

### 4. **Type Safety**
- Full TypeScript support with proper interfaces
- Standardized `ApiResponse<T>` types
- Domain-specific type definitions
- Runtime type validation

## Service Structure

```typescript
src/services/api/
├── BaseApiService.ts      # Abstract base class with common HTTP methods
├── AuthService.ts         # Authentication and session management
├── DataService.ts         # General data operations
├── ProductionService.ts   # Production-related operations
├── FlockService.ts        # Flock management operations
├── types.ts              # API service type definitions
├── index.ts              # Unified exports and service instances
└── __tests__/            # Comprehensive unit test coverage
    ├── BaseApiService.test.ts
    ├── AuthService.test.ts
    └── DataService.test.ts
```

## Usage Patterns

### Basic Usage
```typescript
import { apiService } from '../services/api';

// Fetch all application data
const response = await apiService.data.fetchAllData();
const { eggEntries, expenses, flockProfile } = response.data;

// Save production data
await apiService.production.saveEggEntries(entries);
await apiService.production.saveExpenses(expenses);

// Manage flock operations
await apiService.flock.saveFlockProfile(profile);
await apiService.flock.deleteFlockEvent(eventId);
```

### Authentication Operations
```typescript
// Check authentication status
const isAuthenticated = await apiService.auth.isAuthenticated();

// Get current user session
const session = await apiService.auth.getCurrentSession();

// Manual token refresh (usually automatic)
await apiService.auth.refreshToken();
```

### Error Handling
```typescript
try {
  await apiService.production.saveEggEntries(entries);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // User will be automatically signed out
      console.log('Authentication failed');
    } else {
      console.error(`API Error ${error.status}: ${error.message}`);
    }
  }
}
```

## Service Classes

### BaseApiService
Abstract base class providing common functionality:
- HTTP method implementations (GET, POST, PUT, DELETE)
- Authentication header management
- Response handling and error processing
- URL building and request configuration

**Key Features:**
- Automatic token refresh on expired sessions
- Consistent error handling with `ApiError` class
- Support for both authenticated and public endpoints
- Request/response logging for debugging

### AuthService (Singleton)
Handles all authentication-related operations:

**Methods:**
- `getAuthHeaders()` - Get headers with current auth token
- `refreshToken()` - Manually refresh authentication token  
- `isAuthenticated()` - Check current authentication status
- `getCurrentSession()` - Get current user session
- `getCurrentUser()` - Get current user information
- `signOut()` - Sign out current user
- `migrateUserData()` - Migrate legacy user data

**Features:**
- Singleton pattern for consistent auth state
- Automatic session management
- Token expiration handling

### DataService (Singleton) 
Handles general data retrieval operations:

**Methods:**
- `fetchAllData()` - Retrieve all application data
- `saveData()` - Generic data saving (development only)

**Features:**
- Support for both API and localStorage modes
- Response normalization for component compatibility
- Consistent data structure handling

### ProductionService (Singleton)
Handles production-related operations:

**Methods:**
- `saveEggEntries(entries)` - Save egg production data
- `saveFeedInventory(inventory)` - Save feed inventory records
- `saveExpenses(expenses)` - Save expense records
- `getProductionAnalytics(dateRange?)` - Get production insights

**Features:**
- Domain-specific data validation
- Support for both online and offline operations
- Production analytics and reporting

### FlockService (Singleton)
Handles flock management operations:

**Methods:**
- `saveFlockProfile(profile)` - Save flock profile information
- `saveFlockEvents(events)` - Save multiple flock events
- `saveFlockEvent(profileId, event, eventId?)` - Save single event
- `deleteFlockEvent(eventId)` - Delete specific event
- `saveFlockBatch(batch)` - Save batch information
- `saveDeathRecord(record)` - Record death events
- `getFlockSummary()` - Get flock analytics

**Features:**
- Comprehensive flock event management
- Batch tracking and mortality records
- Automated flock analytics calculation

## Integration with Existing Code

### DataContext Integration
The `DataContext` has been updated to use the new API service:

```typescript
// Before (authApiUtils.ts)
const dbData = await fetchData();

// After (API service)
const response = await apiService.data.fetchAllData();
const dbData = response.data;
```

### Component Integration
Components now import and use the unified service:

```typescript
// Before
import { saveEggEntries } from '../utils/authApiUtils';

// After  
import { apiService } from '../services/api';
await apiService.production.saveEggEntries(entries);
```

### Legacy Compatibility
A legacy compatibility layer provides backward compatibility:

```typescript
import { legacyApi } from '../services/api';

// These still work during migration
await legacyApi.saveEggEntries(entries);
await legacyApi.saveExpenses(expenses);
```

## Testing Strategy

### Unit Testing
- Comprehensive test coverage for all service classes
- Mock Supabase authentication and HTTP requests
- Test error scenarios and edge cases
- Validate type safety and response handling

### Integration Testing
- Test service integration with React contexts
- Validate real API endpoint behavior
- Test authentication flows and token refresh
- Verify data consistency across services

### Test Files
```typescript
src/services/api/__tests__/
├── BaseApiService.test.ts    # Base class functionality
├── AuthService.test.ts       # Authentication operations  
├── DataService.test.ts       # Data retrieval operations
├── ProductionService.test.ts # Production operations
└── FlockService.test.ts      # Flock management operations
```

## Migration Guide

### For New Development
Always use the unified API service for new components:

```typescript
import { apiService } from '../services/api';

const MyComponent = () => {
  const handleSave = async (data) => {
    try {
      await apiService.production.saveEggEntries(data);
    } catch (error) {
      // Handle error
    }
  };
};
```

### For Existing Components
Gradually migrate existing components:

1. Replace `authApiUtils` imports with `apiService`
2. Update function calls to use domain-specific services
3. Update error handling to use `ApiError` class
4. Test integration thoroughly

### Best Practices
- Use domain-specific services (`production`, `flock`, etc.)
- Handle `ApiError` exceptions appropriately
- Leverage TypeScript for type safety
- Use singleton instances via `apiService` object
- Test both success and error scenarios

## Performance Considerations

### Singleton Pattern
All service classes use singleton pattern to:
- Ensure consistent authentication state
- Reduce memory overhead
- Maintain connection pooling
- Enable service-level caching

### Request Optimization
- Automatic token refresh reduces redundant auth calls
- Consistent error handling reduces debugging overhead
- Type safety prevents runtime errors
- Service separation enables targeted optimizations

## Future Enhancements

### Planned Improvements
- Request caching and deduplication
- Retry logic for failed requests
- Request interceptors for logging/monitoring
- Service worker integration for offline support
- GraphQL layer for complex queries

### Extension Points
- Additional domain services (CRM, Analytics, etc.)
- Custom error handlers per service
- Configurable timeout and retry policies
- Service-level middleware support

## Monitoring and Debugging

### Development Tools
- Comprehensive error logging with stack traces
- Request/response logging for debugging
- TypeScript compilation ensures type safety
- Unit tests validate service behavior

### Production Monitoring
- Structured error reporting with timestamps
- Authentication failure tracking
- API response time monitoring
- Service health checks

---

**Status**: ✅ **Implemented** (Epic 1.1 Complete)  
**Last Updated**: January 2025  
**Coverage**: Production-ready with comprehensive testing