# Chicken Manager API Documentation

## Overview

The Chicken Manager API provides secure, user-specific endpoints for managing chicken flock data. All endpoints require user authentication via JWT tokens provided by Supabase Auth.

## New API Service Layer (January 2025)

**✅ IMPLEMENTED**: The application now uses a unified API service layer (`src/services/api/`) for all API operations. This provides:

- **Centralized Authentication**: Automatic token refresh and header management
- **Consistent Error Handling**: Standardized ApiError class with proper error responses
- **Domain Separation**: Organized services (Auth, Data, Production, Flock, CRM)
- **Type Safety**: Full TypeScript support with proper interfaces
- **Legacy Compatibility**: Backward-compatible with existing API patterns

## Type-Safe API Implementation (Story 1.2 - ✅ Complete)

**All API methods now feature comprehensive TypeScript typing** replacing all `any` types with proper interfaces:

- **Type-Safe Parameters**: All API methods use strongly-typed interfaces instead of `any[]` or `any` types
- **Generic Response Types**: `ApiResponse<T>` interface ensures consistent, typed API responses  
- **Custom Error Classes**: `AuthenticationError`, `NetworkError`, and `ServerError` provide typed error handling
- **JSDoc Documentation**: Complete parameter and return type documentation with usage examples
- **Compile-Time Safety**: TypeScript compiler catches type errors during development
- **Runtime Validation**: Proper error handling with user-friendly typed error messages

## Consolidated API Service Migration (Story 1.3 - ✅ Complete)

**All components now use the unified API service layer** eliminating duplicate code and improving maintainability:

- **Eliminated Duplicates**: Removed duplicate `saveToDatabase` functions from all 4 components
- **Centralized Architecture**: All components now use domain-specific API services (production, flock, auth)
- **Standardized Error Handling**: Components use consistent `ApiError` class with user-friendly messages
- **Preserved Behavior**: Identical component interfaces and user experience maintained
- **Enhanced Reliability**: Fixed critical bugs and improved error handling patterns
- **Comprehensive Testing**: 23+ test cases covering API integration and error scenarios

### Using the Consolidated API Service

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

### API Response Structure

All API methods now return consistently typed responses using the generic `ApiResponse<T>` interface:

```typescript
interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: string;
  success?: boolean;
}

// Error responses use typed error classes
interface ApiErrorResponse {
  message: string;
  error: string;
  code?: string;
  timestamp: string;
}
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
    const response = await fetch('/api/saveData', {
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

## API Endpoints

### Authentication Status
- **Method**: Varies by endpoint
- **Authentication**: Required for all endpoints
- **Response**: `401 Unauthorized` if authentication fails

---

## Data Retrieval

### GET /api/getData
Fetches all user-specific data including egg entries, expenses, flock profile, feed inventory, and flock events.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Data fetched successfully",
  "data": {
    "eggEntries": [...],
    "expenses": [...],
    "flockProfile": {...},
    "feedInventory": [...],
    "flockEvents": [...]
  },
  "timestamp": "2025-01-06T..."
}
```

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
    "created_at": "2025-01-06T10:00:00Z"
  }
]
```

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

**Last Updated**: January 2025  
**API Version**: 1.0 with Authentication and Type Safety
