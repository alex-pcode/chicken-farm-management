# Chicken Manager API Documentation

## Overview

The Chicken Manager API provides secure, user-specific endpoints for managing chicken flock data. All endpoints require user authentication via JWT tokens provided by Supabase Auth.

## Current API Architecture (October 2025)

**✅ PRODUCTION-READY IMPLEMENTATION**: The application uses a **well-architected** serverless design:

**Frontend (Client-Side)**:
- ✅ **Unified API Service Layer** (`src/services/api/`) provides clean abstraction
- ✅ **Domain Separation**: `apiService.auth`, `apiService.data`, `apiService.production`, etc.
- ✅ **Type Safety**: Full TypeScript interfaces and error handling
- ✅ **Legacy Compatibility**: Backward-compatible wrapper functions
- ✅ **Platform Agnostic**: Abstraction layer enables seamless platform migration

**Backend (Netlify Functions)**:
- ✅ **10 Netlify Functions**: AWS Lambda-based serverless functions
- ✅ **30-Second Timeout**: Improved from Vercel's 10s limit
- ✅ **Node.js 20**: Modern runtime environment
- ✅ **Consistent Patterns**: Standardized Netlify handler format
- ✅ **Migration Complete**: Successfully migrated from Vercel (October 2025)

## Type-Safe Frontend Implementation (Partial)

**Frontend API service layer features comprehensive TypeScript typing**:

- **Type-Safe Parameters**: All API methods use strongly-typed interfaces instead of `any[]` or `any` types
- **Generic Response Types**: `ApiResponse<T>` interface ensures consistent, typed API responses  
- **Custom Error Classes**: `AuthenticationError`, `NetworkError`, and `ServerError` provide typed error handling
- **JSDoc Documentation**: Complete parameter and return type documentation with usage examples
- **Compile-Time Safety**: TypeScript compiler catches type errors during development
- **Runtime Validation**: Proper error handling with user-friendly typed error messages

## Frontend Service Consolidation (Complete)

**Frontend components use the unified API service layer** while backend remains distributed:

- **Eliminated Duplicates**: Removed duplicate `saveToDatabase` functions from all 4 components
- **Centralized Architecture**: All components now use domain-specific API services (production, flock, auth)
- **Standardized Error Handling**: Components use consistent `ApiError` class with user-friendly messages
- **Preserved Behavior**: Identical component interfaces and user experience maintained
- **Enhanced Reliability**: Fixed critical bugs and improved error handling patterns
- **Comprehensive Testing**: 23+ test cases covering API integration and error scenarios

### Current Frontend API Usage

```typescript
import { apiService } from '../services/api';
import { EggEntry, Expense, FlockProfile } from '../types';
import { ApiResponse, ApiError } from '../types/api';

// Production operations using domain-specific services
const eggEntries: EggEntry[] = [
  { id: 'uuid', date: '2025-01-06', count: 12, created_at: new Date() }
];
const eggResponse = await apiService.production.saveEggEntries(eggEntries);

// Expense tracking with consolidated service
const expenses: Expense[] = [
  { id: 'uuid', date: '2025-01-06', category: 'Feed', description: 'Layer feed', amount: 45.99 }
];
const expenseResponse = await apiService.production.saveExpenses(expenses);

// Flock management using flock service
const profile: FlockProfile = {
  farmName: 'Happy Hens Farm',
  flockSize: 25,
  breedTypes: ['Rhode Island Red'],
  // ... other typed properties
};
const profileResponse = await apiService.flock.saveFlockProfile(profile);

// Feed inventory management
const feedInventory: FeedEntry[] = [
  { id: 'uuid', brand: 'Premium Feed', type: 'Pellets', quantity: 50 }
];
await apiService.production.saveFeedInventory(feedInventory);

// Authentication operations
const headers = await apiService.auth.getAuthHeaders();
const isAuthenticated = await apiService.auth.isAuthenticated();
```

### Legacy API Methods (Deprecated)

The following individual function imports are deprecated in favor of the consolidated service:

```typescript
// ❌ Deprecated - Individual function imports
import { saveEggEntries, saveExpenses, saveFlockProfile } from '../utils/authApiUtils';

// ✅ Recommended - Consolidated API service
import { apiService } from '../services/api';
await apiService.production.saveEggEntries(entries);
```

### Mixed Response Formats

**Frontend services** provide consistent interfaces, but **backend endpoints** use different response patterns:

**Frontend (Consistent)**:

```typescript
interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: string;
  success?: boolean;
}

**Backend (Netlify Functions - Standardized Patterns)**:
- `/.netlify/functions/data`: `{ message, data: {...}, timestamp }`
- `/.netlify/functions/customers`: Direct array `[{...}]` or single objects
- `/.netlify/functions/sales`: Direct objects with joined data
- `/.netlify/functions/crud`: `{ message, data: {...}, timestamp }`

// Error responses vary by endpoint
// Some use: { error: "message" }
// Others use: { message: "error message", error: "details" }
```

### Error Handling with Consolidated API Service

The consolidated API service provides standardized error handling across all components:

```typescript
import { apiService } from '../services/api';
import { ApiError } from '../types/api';

// Modern error handling pattern used by all components
try {
  const result = await apiService.production.saveEggEntries(entries);
  // Success - result contains typed response data
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // User automatically signed out by service layer
      console.log('Authentication failed - user redirected to login');
    } else {
      // User-friendly error message displayed to user
      console.error(`API Error ${error.status}: ${error.message}`);
      setErrorMessage(error.message); // Standardized error handling
    }
  } else {
    // Unexpected errors
    console.error('Unexpected error:', error);
    setErrorMessage('An unexpected error occurred. Please try again.');
  }
}
```

### Component Integration Benefits

Components using the consolidated service gain:

```typescript
// Before - Duplicate error handling in each component
const saveToDatabase = async (data) => {
  try {
    const response = await fetch('/.netlify/functions/saveData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Save failed');
    return response.json();
  } catch (error) {
    console.error('Component-specific error handling');
    throw error;
  }
};

// After - Standardized service with consistent error handling
await apiService.production.saveEggEntries(entries);
// Error handling is automatically standardized across all components
```

## Authentication

### Required Headers
All API requests must include an Authorization header:
```
Authorization: Bearer <user_jwt_token>
```

### Getting Authentication Token
The frontend automatically handles token management through Supabase Auth. Tokens are obtained during login and automatically refreshed as needed.

### Security Features
- **User Authentication**: All endpoints require valid user sessions
- **Data Isolation**: Users can only access their own data
- **Row Level Security (RLS)**: Database-level protection ensures data privacy
- **JWT Validation**: Tokens are validated server-side for each request

## Current Backend Architecture

### Netlify Serverless Function Structure

The backend consists of **10 independent Netlify serverless functions** (AWS Lambda):

| Function | File | Purpose | Response Pattern |
|----------|------|---------|------------------|
| `/.netlify/functions/data` | `netlify/functions/data.ts` | Main data retrieval with type parameter | `{ message, data, timestamp }` |
| `/.netlify/functions/crud` | `netlify/functions/crud.ts` | Generic CRUD operations via query params | `{ message, data, timestamp }` |
| `/.netlify/functions/customers` | `netlify/functions/customers.ts` | Customer management (GET/POST/PUT) | Direct objects/arrays |
| `/.netlify/functions/sales` | `netlify/functions/sales.ts` | Sales transactions with customer joins | Objects with joined data |
| `/.netlify/functions/salesReports` | `netlify/functions/salesReports.ts` | Analytics and reporting | Direct computed objects |
| `/.netlify/functions/flockBatches` | `netlify/functions/flockBatches.ts` | Batch management operations | Mixed patterns |
| `/.netlify/functions/batchEvents` | `netlify/functions/batchEvents.ts` | Event logging for batches | Standard format |
| `/.netlify/functions/flockSummary` | `netlify/functions/flockSummary.ts` | Flock analytics | Computed summaries |
| `/.netlify/functions/deathRecords` | `netlify/functions/deathRecords.ts` | Mortality tracking | Standard format |
| `/.netlify/functions/debug-db` | `netlify/functions/debug-db.ts` | Database debugging utilities | Diagnostic data |

### Authentication Pattern (Standardized Across Functions)

Each function implements this authentication pattern:
```typescript
import type { Handler, HandlerEvent } from '@netlify/functions';

async function getAuthenticatedUser(event: HandlerEvent) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}
```

### Platform Architecture

**Netlify Serverless Benefits**:
- ✅ AWS Lambda infrastructure (reliable, scalable)
- ✅ 30-second timeout (3x improvement from Vercel)
- ✅ 1GB memory allocation per function
- ✅ Automatic scaling with edge network
- ✅ Built-in DDoS protection

**Current Implementation**:
- ✅ Client-side service layer provides unified interface
- ✅ RLS policies handle data security at database level
- ✅ Standardized Netlify handler format across all functions
- ✅ Consistent authentication patterns

**Migration Achievement (October 2025)**:
- ✅ All 10 functions successfully migrated from Vercel
- ✅ Zero breaking changes to frontend
- ✅ Improved timeout limits (10s → 30s)
- ✅ Enhanced reliability and performance

## API Endpoints

### Authentication Status
- **Method**: Varies by endpoint
- **Authentication**: Required for all endpoints (JWT Bearer token)
- **Response**: `401 Unauthorized` if authentication fails
- **Pattern**: Each function validates independently

---

## Data Retrieval

### GET /api/data
Fetches user-specific data with different levels of detail based on the type parameter.

**Query Parameters:**
- `type` (optional): Data type to fetch
  - `"all"` (default): Complete data with all fields - used by OptimizedDataProvider
  - `"production"`: Minimal production data - used by fallback services
  - `"dashboard"`: Summary data for dashboard view
  - `"feed"`, `"expenses"`, `"flock"`, `"crm"`: Specific data types

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (type=all - Complete Data):**
```json
{
  "message": "Data fetched successfully",
  "data": {
    "eggEntries": [
      {
        "id": "uuid-string",
        "date": "2025-01-06",
        "count": 12,
        "size": "large",
        "color": "brown", 
        "notes": "Free range eggs",
        "created_at": "2025-01-06T10:00:00Z",
        "user_id": "uuid-string"
      }
    ],
    "expenses": [...],
    "flockProfile": {...},
    "feedInventory": [...],
    "flockEvents": [...],
    "customers": [...],
    "sales": [...],
    "summary": {...}
  },
  "timestamp": "2025-01-06T..."
}
```

**Response (type=production - Minimal Data):**
```json
{
  "message": "Production data fetched successfully", 
  "data": {
    "eggEntries": [
      {
        "id": "uuid-string",
        "date": "2025-01-06",
        "count": 12
      }
    ]
  },
  "timestamp": "2025-01-06T..."
}
```

**⚠️ Important Notes for Developers:**
- **Always use `type=all`** for full application functionality
- **`type=production`** is for legacy compatibility only - missing size, color, notes fields
- **OptimizedDataProvider** automatically uses `type=all` for complete data
- **Fallback services** may use `type=production` but will have limited field availability

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication
- `500 Internal Server Error` - Database or server error

---

## Data Management

### POST /api/saveEggEntries
Saves or updates egg production entries for the authenticated user.

**Type Definition:**
```typescript
function saveEggEntries(entries: EggEntry[]): Promise<ApiResponse<EggEntriesSaveData>>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (EggEntry[]):**
```json
[
  {
    "id": "uuid-string",
    "date": "2025-01-06", 
    "count": 12,
    "size": "large",
    "color": "brown",
    "notes": "Free range eggs",
    "created_at": "2025-01-06T10:00:00Z"
  }
]
```

**EggEntry Field Definitions:**
- `id` (uuid): Unique identifier (auto-generated if not provided)
- `date` (string): Entry date in YYYY-MM-DD format
- `count` (number): Number of eggs collected
- `size` (string, optional): Egg size classification - "small", "medium", "large", "extra-large", "jumbo"
- `color` (string, optional): Shell color - "white", "brown", "blue", "green", "speckled", "cream"
- `notes` (string, optional): Additional notes about the entry
- `created_at` (string): Timestamp when entry was created

**Response (ApiResponse<EggEntriesSaveData>):**
```json
{
  "message": "Egg entries saved successfully",
  "data": {
    "eggEntries": [...],
    "updatedCount": 1
  },
  "timestamp": "2025-01-06T...",
  "success": true
}
```

### POST /api/saveExpenses
Saves or updates expense records for the authenticated user.

**Type Definition:**
```typescript
function saveExpenses(expenses: Expense[]): Promise<ApiResponse<ExpensesSaveData>>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (Expense[]):**
```json
[
  {
    "id": "uuid-string",
    "date": "2025-01-06",
    "category": "Feed",
    "description": "Layer feed purchase", 
    "amount": 45.99,
    "created_at": "2025-01-06T10:00:00Z"
  }
]
```

**Response (ApiResponse<ExpensesSaveData>):**
```json
{
  "message": "Expenses saved successfully",
  "data": {
    "expenses": [...],
    "updatedCount": 1
  },
  "timestamp": "2025-01-06T...",
  "success": true
}
```

### POST /api/saveFlockProfile
Saves or updates the user's flock profile information.

**Type Definition:**
```typescript
function saveFlockProfile(profile: FlockProfile): Promise<ApiResponse<FlockProfileSaveData>>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (FlockProfile):**
```json
{
  "farmName": "Happy Hens Farm",
  "location": "Rural Valley", 
  "flockSize": 25,
  "breedTypes": ["Rhode Island Red", "Leghorn"],
  "flockStartDate": "2024-03-15",
  "hens": 20,
  "roosters": 2,
  "chicks": 3,
  "notes": "Free-range organic operation"
}
```

**Response (ApiResponse<FlockProfileSaveData>):**
```json
{
  "message": "Flock profile saved successfully",
  "data": {
    "flockProfile": {...},
    "updated": true
  },
  "timestamp": "2025-01-06T...",
  "success": true
}
```

### POST /api/saveFeedInventory
Saves or updates feed inventory records for the authenticated user.

**Type Definition:**
```typescript
function saveFeedInventory(inventory: FeedEntry[]): Promise<ApiResponse<FeedInventorySaveData>>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (FeedEntry[]):**
```json
[
  {
    "id": "uuid-string",
    "brand": "Premium Layer Feed",
    "type": "Pellets", 
    "quantity": 50,
    "unit": "lbs",
    "pricePerUnit": 0.89,
    "openedDate": "2025-01-01",
    "depletedDate": null,
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

**Response (ApiResponse<FeedInventorySaveData>):**
```json
{
  "message": "Feed inventory saved successfully",
  "data": {
    "feedInventory": [...],
    "updatedCount": 1
  },
  "timestamp": "2025-01-06T...",
  "success": true
}
```

### POST /api/saveFlockEvents
Saves individual flock events for the authenticated user.

**Type Definition:**
```typescript
function saveFlockEvents(events: FlockEvent[]): Promise<ApiResponse<FlockEventsSaveData>>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (FlockEvent[]):**
```json
[
  {
    "id": "uuid-string",
    "flockProfileId": "uuid-string",
    "date": "2025-01-06",
    "type": "health",
    "description": "Vaccination administered", 
    "affectedBirds": 25,
    "notes": "Annual vaccination program",
    "created_at": "2025-01-06T10:00:00Z"
  }
]
```

**Response (ApiResponse<FlockEventsSaveData>):**
```json
{
  "message": "Flock events saved successfully",
  "data": {
    "flockEvents": [...],
    "updatedCount": 1
  },
  "timestamp": "2025-01-06T...",
  "success": true
}
```

### DELETE /api/deleteFlockEvent
Deletes a specific flock event for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": "uuid-string"
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "message": "Unauthorized - Please log in"
}
```

**405 Method Not Allowed**
```json
{
  "message": "Method not allowed"
}
```

**500 Internal Server Error**
```json
{
  "message": "Error saving data",
  "error": "Detailed error message",
  "stack": "Error stack trace (development only)"
}
```

---

## Data Security

### User Data Isolation
- All data is automatically associated with the authenticated user's ID
- Users cannot access or modify data belonging to other users
- Database queries automatically filter by user ID

### Row Level Security (RLS)
Database-level security policies ensure:
- Users can only SELECT their own records
- Users can only INSERT records with their user_id
- Users can only UPDATE records they own
- Users can only DELETE records they own

### CORS Configuration
- Proper CORS headers for cross-origin requests
- Authorization header allowed for authenticated requests
- Secure token transmission

---

## Migration and Data Management

### GET /api/getUserMigrationScript
Generates SQL scripts for migrating orphaned data to current user account.

**Use Case**: Assigns existing data without user_id to the current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Migration SQL script generated",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "migrationSQL": "UPDATE statements...",
  "instructions": [...]
}
```

---

## Development Notes

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Testing Authentication
- Use browser developer tools to inspect Authorization headers
- Check network tab for 401 responses indicating auth issues
- Verify token validity in Supabase dashboard

### Local Development
- Ensure Supabase project is properly configured
- Verify RLS policies are enabled and correct
- Test with multiple user accounts to verify data isolation

---

## Customer Relationship Management (CRM)

### GET /api/customers
Retrieves all customers for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Customers fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Customer Name",
      "phone": "123-456-7890",
      "notes": "Customer notes",
      "is_active": true,
      "created_at": "2025-07-15T10:00:00Z"
    }
  ],
  "timestamp": "2025-07-15T10:00:00Z"
}
```

### POST /api/customers
Creates a new customer for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Customer Name",
  "phone": "123-456-7890",
  "notes": "Optional customer notes"
}
```

**Response:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Customer Name",
    "phone": "123-456-7890",
    "notes": "Optional customer notes",
    "is_active": true,
    "created_at": "2025-07-15T10:00:00Z"
  },
  "timestamp": "2025-07-15T10:00:00Z"
}
```

### PUT /api/customers
Updates an existing customer for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Updated Customer Name",
  "phone": "987-654-3210",
  "notes": "Updated notes",
  "is_active": false
}
```

### GET /api/sales
Retrieves all sales with customer information for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Sales data fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "customer_id": "uuid",
      "customer_name": "Customer Name",
      "sale_date": "2025-07-15",
      "dozen_count": 2,
      "individual_count": 6,
      "total_amount": 15.00,
      "notes": "Sale notes",
      "created_at": "2025-07-15T10:00:00Z"
    }
  ],
  "timestamp": "2025-07-15T10:00:00Z"
}
```

### POST /api/sales
Records a new sale for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_id": "uuid",
  "sale_date": "2025-07-15",
  "dozen_count": 2,
  "individual_count": 6,
  "total_amount": 15.00,
  "notes": "Optional sale notes"
}
```

**Notes:**
- Frontend uses simplified egg count input but converts to dozens/individual for API
- Supports $0.00 sales for free egg distribution
- Backend stores dozens and individual counts for compatibility

### PUT /api/sales
Updates an existing sale for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "sale_date": "2025-07-15",
  "dozen_count": 3,
  "individual_count": 0,
  "total_amount": 18.00,
  "notes": "Updated sale notes"
}
```

### GET /api/salesReports
Generates analytics and reports for the authenticated user's sales data.

**Query Parameters:**
- `type`: `summary` | `monthly`
- `period`: Optional time period filter

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Summary Response (type=summary):**
```json
{
  "total_sales": 25,
  "total_revenue": 450.00,
  "total_eggs_sold": 348,
  "free_eggs_given": 24,
  "customer_count": 8,
  "top_customer": "Best Customer Name"
}
```

**Monthly Response (type=monthly):**
```json
{
  "2025-07": {
    "total_sales": 12,
    "total_revenue": 180.00,
    "total_eggs": 156
  }
}
```

---

## Type Definitions

For complete interface definitions and error classes, see:
- `src/types/index.ts` - Core data interfaces (EggEntry, Expense, FlockProfile, etc.)
- `src/types/api.ts` - API response types and error classes
- `src/utils/authApiUtils.ts` - JSDoc documentation with usage examples

---

## Troubleshooting Guide

### Missing Fields in API Responses

**Problem**: Frontend components receive incomplete data (e.g., missing size, color, notes fields in egg entries).

**Root Cause**: API response mapping in serverless functions manually filters fields instead of returning complete database records.

**Solution Steps**:

1. **Check API Response Mapping**: Look for manual `.map()` operations in API endpoints
   ```typescript
   // ❌ Problematic mapping (incomplete fields)
   eggEntries: eggEntries?.map(entry => ({
     id: entry.id,
     date: entry.date,
     count: entry.count  // Missing size, color, notes!
   })) || [],
   
   // ✅ Correct mapping (all fields)
   eggEntries: eggEntries?.map(entry => ({
     id: entry.id,
     date: entry.date,
     count: entry.count,
     size: entry.size,
     color: entry.color,
     notes: entry.notes,
     created_at: entry.created_at,
     user_id: entry.user_id
   })) || [],
   ```

2. **Verify Database Schema**: Use Supabase dashboard or SQL queries to confirm all expected fields exist
3. **Check SQL SELECT Statements**: Ensure database queries select all required fields
4. **Test with Direct Database Query**: Confirm database returns complete data
5. **Update API Response Mapping**: Include all database fields in response objects

**Prevention**: Always return complete database records unless explicitly filtering for performance reasons.

### Data Type Parameter Issues

**Problem**: Components receive different data structures depending on endpoint used.

**Solution**: 
- Use `type=all` for complete application functionality
- Reserve `type=production` for legacy compatibility only
- Document clearly which endpoints return which fields

### Authentication Issues

**Problem**: `401 Unauthorized` responses even with valid tokens.

**Common Causes**:
- Expired JWT tokens (auto-refresh every hour)
- Missing `Authorization: Bearer <token>` header
- Invalid Supabase configuration
- Network issues preventing token validation

**Solution**:
1. Check browser developer tools for authentication headers
2. Verify token validity in Supabase dashboard  
3. Test with fresh login to get new token
4. Confirm Supabase environment variables are correct

### Performance Troubleshooting

**Problem**: Slow API responses or excessive database queries.

**Optimization Checklist**:
- ✅ Use OptimizedDataProvider for shared caching
- ✅ Implement proper data source precedence (context over fallback)
- ✅ Use `type=all` for complete data in single request
- ✅ Monitor API call patterns in browser dev tools
- ✅ Check database query performance in Supabase dashboard

### Row Level Security (RLS) Issues

**Problem**: Users can see data from other users or get empty results.

**Solution**:
1. Verify RLS policies are enabled on all tables
2. Check policies include proper `user_id` filtering  
3. Confirm authenticated user ID matches data `user_id`
4. Test with multiple user accounts to verify isolation

---

---

## Architectural Debt Assessment

### ⚠️ Current Technical Debt

**Response Inconsistency**:
- `/api/data` returns `{ message, data: {...}, timestamp }`
- `/api/customers` returns direct arrays `[{...}]` or objects `{...}`
- `/api/sales` returns objects with joined customer data
- Error responses vary: `{ error }` vs `{ message, error }`

**Authentication Duplication**:
- `getAuthenticatedUser()` function copied across 9 files
- JWT validation logic repeated with slight variations
- CORS headers manually set in each function

**Manual Field Mapping**:
- Database field transformations done manually in each function
- High risk of field omission (e.g., missing `size`, `color` in egg entries)
- No shared validation or sanitization logic

### 🔄 Migration Strategy (When Ready)

When you decide to refactor, consider this approach:

1. **Shared Utilities First**
   - Create `/api/_lib/` with shared auth, CORS, response helpers
   - Standardize response formats across all endpoints
   
2. **Gradual Consolidation**  
   - Keep existing endpoints functional
   - Create new consolidated endpoints alongside old ones
   - Migrate frontend services one domain at a time

3. **Response Standardization**
   - Define unified `ApiResponse<T>` format for all endpoints
   - Create consistent error response patterns
   - Implement shared field mapping utilities

**Recommended Order**: Start with most-used endpoints first (`/api/data`, `/api/crud`)

---

**Last Updated**: August 2025  
**API Version**: 1.0 Hybrid Architecture  
**Status**: Mixed client-side service layer with distributed serverless backend  
**Next Phase**: Consider backend consolidation when development velocity stabilizes
