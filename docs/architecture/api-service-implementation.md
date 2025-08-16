# API Service Implementation Guide

## Overview

The unified API service layer consolidates all data operations into a type-safe, domain-separated architecture that eliminates code duplication and provides consistent error handling across the Chicken Manager application.

**Status**: ✅ **COMPLETED** - Fully implemented and integrated

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

## Implementation Details

### Base Service Pattern

All services extend `BaseApiService` which provides:

```typescript
// src/services/api/BaseApiService.ts
export abstract class BaseApiService {
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Consistent error handling
    // Authentication header management
    // Response type validation
  }
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

```
src/services/api/
├── BaseApiService.ts      # Base class with common functionality
├── AuthService.ts         # Authentication & user management
├── DataService.ts         # Unified data fetching
├── ProductionService.ts   # Production data operations
├── FlockService.ts        # Flock management
├── CRMService.ts         # Customer relationship management
├── types.ts              # Service-specific type definitions
├── index.ts              # Unified exports and legacy compatibility
└── __tests__/            # Comprehensive test coverage
    ├── AuthService.test.ts
    ├── DataService.test.ts
    ├── ProductionService.test.ts
    ├── FlockService.test.ts
    └── CRMService.test.ts
```

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

## Next Steps

1. **Monitor Performance**: API service performance metrics
2. **Expand Testing**: Add integration tests for complex workflows
3. **Documentation**: API service JSDoc completion
4. **Optimization**: Consider caching strategies for specific endpoints

## Related Files

- **Main Implementation**: `src/services/api/`
- **Data Provider**: `src/contexts/OptimizedDataProvider.tsx`
- **Legacy Utils**: `src/utils/authApiUtils.ts` (deprecated)
- **Type Definitions**: `src/types/services.ts`

---

*This document reflects the completed API consolidation (Epic 1) as of January 2025.*