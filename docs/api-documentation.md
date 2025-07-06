# Chicken Manager API Documentation

## Overview

The Chicken Manager API provides secure, user-specific endpoints for managing chicken flock data. All endpoints require user authentication via JWT tokens provided by Supabase Auth.

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

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "id": "uuid-string",
    "date": "2025-01-06",
    "count": 12
  }
]
```

**Response:**
```json
{
  "message": "Egg entries saved successfully",
  "data": {
    "eggEntries": [...]
  },
  "timestamp": "2025-01-06T..."
}
```

### POST /api/saveExpenses
Saves or updates expense records for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "id": "uuid-string",
    "date": "2025-01-06",
    "category": "Feed",
    "description": "Layer feed purchase",
    "amount": 45.99
  }
]
```

### POST /api/saveFlockProfile
Saves or updates the user's flock profile information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
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

### POST /api/saveFeedInventory
Saves or updates feed inventory records for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
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
    "depletedDate": null
  }
]
```

### POST /api/saveFlockEvents
Saves individual flock events for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "flockProfileId": "uuid-string",
  "event": {
    "date": "2025-01-06",
    "type": "health",
    "description": "Vaccination administered",
    "affectedBirds": 25,
    "notes": "Annual vaccination program"
  }
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

**Last Updated**: January 2025
**API Version**: 1.0 with Authentication
