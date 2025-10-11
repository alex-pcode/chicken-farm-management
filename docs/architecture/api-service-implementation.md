# API Service Implementation Guide

## Overview

The unified API service layer consolidates all data operations into a type-safe, domain-separated architecture that eliminates code duplication and provides consistent error handling across the Chicken Manager application.

**Status**: ✅ **COMPLETED** - Fully implemented and integrated
**Platform**: Netlify Functions (migrated from Vercel October 2025)

## Architecture

### Service Structure

```typescript
// src/services/api/index.ts
export const apiService = {
  auth: AuthService.getInstance(),
  data: DataService.getInstance(),
  production: ProductionService.getInstance(),
  flock: FlockService.getInstance(),
  crm: CRMService.getInstance(),
  user: UserService.getInstance(),
};
```

### Domain Separation

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| **AuthService** | Authentication & user management | `getAuthHeaders()`, `migrateUserData()` |
| **DataService** | Unified data fetching | `fetchAllData()` |
| **ProductionService** | Eggs, feed, expenses | `saveEggEntries()`, `saveExpenses()`, `saveFeedInventory()` |
| **FlockService** | Flock profiles & events | `saveFlockProfile()`, `saveFlockEvents()`, `deleteFlockEvent()` |
| **CRMService** | Customer & sales management | `getCustomers()`, `saveSale()`, `getCRMData()` |
| **UserService** | User profile & onboarding | `saveUserProfile()`, `getUserPreferences()` |

## Implementation Details

### Base Service Pattern

All services extend `BaseApiService` which provides:

```typescript
// src/services/api/BaseApiService.ts
export abstract class BaseApiService {
  // API Base URL: /.netlify/functions (Netlify serverless functions)
  private static readonly API_BASE_URL = '/.netlify/functions';

  // HTTP method implementations
  protected async get<T>(endpoint: string, dataValidator?: (data: unknown) => data is T): Promise<ApiResponse<T>>
  protected async post<T>(endpoint: string, data: unknown, dataValidator?: (data: unknown) => data is T): Promise<ApiResponse<T>>
  protected async put<T>(endpoint: string, data: unknown, dataValidator?: (data: unknown) => data is T): Promise<ApiResponse<T>>
  protected async delete<T>(endpoint: string, data?: unknown, dataValidator?: (data: unknown) => data is T): Promise<ApiResponse<T>>

  // Authentication & headers
  protected async getAuthHeaders(): Promise<Record<string, string>>
  protected getPublicHeaders(): Record<string, string>

  // Response handling with validation
  protected async handleResponse<T>(response: Response, dataValidator?: (data: unknown) => data is T): Promise<ApiResponse<T>>

  // Request validation utilities
  protected validateRequestData<T>(data: unknown, validator: (data: unknown) => data is T, typeName: string): ValidationResult<T>
}
```

### Usage Examples

#### Basic Data Fetching
```typescript
import { apiService } from '../services/api';

// Fetch all application data
const response = await apiService.data.fetchAllData();
if (response.success) {
  const { eggEntries, expenses, feedInventory } = response.data;
}
```

#### Production Data Operations
```typescript
// Save egg entries
const eggResponse = await apiService.production.saveEggEntries([
  { date: '2025-01-14', count: 12, user_id: userId }
]);

// Save expenses
const expenseResponse = await apiService.production.saveExpenses([
  { date: '2025-01-14', amount: 25.50, category: 'feed', user_id: userId }
]);
```

#### CRM Operations
```typescript
// Customer management
const customers = await apiService.crm.getCustomers();
const newCustomer = await apiService.crm.saveCustomer({
  name: 'John Doe',
  email: 'john@example.com'
});

// Sales tracking
const saleResponse = await apiService.crm.saveSale({
  customer_id: customerId,
  total_amount: 15.00,
  eggs_sold: 12
});
```

## Legacy Compatibility

The service layer includes a complete legacy compatibility layer:

```typescript
// src/services/api/index.ts
export const legacyApi = {
  // Maintains backward compatibility with existing authApiUtils.ts patterns
  fetchData: () => apiService.data.fetchAllData().then(response => response.data),
  saveEggEntries: (entries: EggEntry[]) => apiService.production.saveEggEntries(entries),
  // ... all existing function signatures preserved
};
```

## Integration with OptimizedDataProvider

The API service integrates seamlessly with the modern data provider:

```typescript
// src/contexts/OptimizedDataProvider.tsx
import { apiService } from '../services/api';

const refreshData = useCallback(async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await apiService.data.fetchAllData();
    if (response.success) {
      setData(response.data);
      setLastFetched(new Date());
    } else {
      setError(response.error?.message || 'Failed to fetch data');
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
}, []);
```

## Error Handling Patterns

### Consistent Response Format
```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
};
```

### Error Handling in Components
```typescript
const handleSubmit = async () => {
  try {
    const response = await apiService.production.saveEggEntries(entries);
    
    if (response.success) {
      setSuccess('Eggs saved successfully!');
      // Refresh data or update local state
    } else {
      setErrors([{
        field: 'submit',
        message: response.error?.message || 'Failed to save entries'
      }]);
    }
  } catch (error) {
    setErrors([{
      field: 'submit',
      message: 'Network error - please try again'
    }]);
  }
};
```

## File Structure

### Frontend API Service Layer
```
src/services/api/
├── BaseApiService.ts      # Base class with common functionality
├── AuthService.ts         # Authentication & user management
├── DataService.ts         # Unified data fetching
├── ProductionService.ts   # Production data operations
├── FlockService.ts        # Flock management
├── CRMService.ts         # Customer relationship management
├── UserService.ts        # User profile & onboarding management
├── types.ts              # Service-specific type definitions
├── index.ts              # Unified exports and legacy compatibility
└── __tests__/            # Comprehensive test coverage
    ├── AuthService.test.ts
    ├── BaseApiService.test.ts
    ├── DataService.test.ts
    ├── ProductionService.test.ts
    ├── FlockService.test.ts
    └── CRMService.test.ts
```

### Backend Netlify Functions (API Endpoints)
```
netlify/functions/
├── data.ts              # Main data endpoint (GET all user data)
├── customers.ts         # Customer CRUD operations
├── sales.ts             # Sales management
├── salesReports.ts      # Sales analytics
├── flockBatches.ts      # Flock batch management
├── flockSummary.ts      # Flock statistics
├── deathRecords.ts      # Death record tracking
├── batchEvents.ts       # Batch event logging
├── crud.ts              # Generic CRUD operations
└── debug-db.ts          # Database debugging
```

**Communication Flow**:
Frontend Service Layer → `/.netlify/functions/{endpoint}` → Netlify Function → Supabase

## Testing Coverage

All services have comprehensive test coverage using Vitest and MSW:

```typescript
// Example: ProductionService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionService } from '../ProductionService';
import { setupMSW } from '../../../test/msw-setup';

describe('ProductionService', () => {
  const service = ProductionService.getInstance();
  
  it('saves egg entries successfully', async () => {
    const entries = [{ date: '2025-01-14', count: 12, user_id: 'test-user' }];
    const response = await service.saveEggEntries(entries);
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual(expect.arrayContaining(entries));
  });
});
```

## Migration Status

### ✅ Completed Migrations
- All components using `authApiUtils.ts` patterns
- DataContext → OptimizedDataProvider integration
- Consistent error handling across all data operations
- Type-safe interfaces for all service methods

### 🔄 Legacy Support
- Full backward compatibility maintained
- Gradual migration path available
- No breaking changes for existing components

## Platform Migration Notes

### Netlify Migration (October 2025)
- ✅ All 10 backend functions successfully converted to Netlify format
- ✅ Frontend API service layer unchanged (abstraction works perfectly)
- ✅ API Base URL updated: `/api` → `/.netlify/functions`
- ✅ Zero breaking changes to service layer interfaces
- ✅ Improved timeout limits: 10s (Vercel) → 30s (Netlify)

### Benefits of Service Layer Abstraction
The unified API service layer proved invaluable during platform migration:
- **Zero component changes**: All components continued working without modification
- **Single point of configuration**: Only `BaseApiService.API_BASE_URL` needed updating
- **Type safety preserved**: Full TypeScript coverage throughout migration
- **Testing unaffected**: All service layer tests passed without changes

## Next Steps

1. **Monitor Performance**: Track Netlify function invocation counts and response times
2. **Expand Testing**: Add integration tests for complex workflows
3. **Documentation**: Complete API service JSDoc coverage
4. **Optimization**: Monitor caching effectiveness to stay within Netlify free tier (125k invocations/month)

## Related Files

### Frontend
- **Main Implementation**: `src/services/api/`
- **Data Provider**: `src/contexts/OptimizedDataProvider.tsx`
- **Legacy Utils**: `src/utils/authApiUtils.ts` (deprecated)
- **Type Definitions**: `src/types/services.ts`

### Backend (Netlify)
- **Functions Directory**: `netlify/functions/`
- **Configuration**: `netlify.toml`
- **Migration Guide**: `docs/netlify-migration-plan.md`

---

*This document reflects the completed API consolidation (Epic 1) as of January 2025, updated for Netlify migration October 2025.*