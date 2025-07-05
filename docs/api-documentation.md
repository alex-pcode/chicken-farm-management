# API Documentation

## API Endpoints

### Egg Entries
- `saveEggEntries.ts`
  - Purpose: Manages daily egg production data
  - Integration: Supabase table `egg_entries`

### Expenses
- `saveExpenses.ts`
  - Purpose: Handles expense tracking and categorization
  - Integration: Supabase table `expenses`

### Feed Inventory
- `saveFeedInventory.ts`
  - Purpose: Manages feed stock levels and consumption
  - Integration: Supabase table `feed_inventory`

### Flock Profile
- `saveFlockProfile.ts`
  - Purpose: Manages flock information and metrics
  - Integration: Supabase table `flock_profiles`

### Data Retrieval
- `getData.ts`
  - Purpose: Centralized data fetching for all components
  - Usage: Handles all GET operations from Supabase

## Error Handling

### Common Issues and Solutions

#### Data Reading Problems (Resolved)
**Issue**: Application could write to database but not read from it, causing data loss when new entries overwrote existing data.

**Root Cause**: API response structure mismatch between localStorage and Supabase modes:
- **Supabase API** returns: `{ message: "...", data: { eggEntries: [...], flockProfile: {...} }, timestamp: "..." }`
- **localStorage mode** returns: `{ eggEntries: [...], flockProfile: {...} }`
- **Components expected**: Direct access to `dbData.eggEntries`

**Solution**: Updated `fetchData()` function in `src/utils/apiUtils.ts` to normalize response structure:
```typescript
// Normalize the response structure - API returns { data: { ... } } but components expect direct access
if (result.data) {
  return result.data;
}
```

This ensures both localStorage and Supabase modes return the same data structure to components.

**Prevention**: Always test both development (localStorage) and production (Supabase) modes when implementing new features.

## Rate Limits
Document any rate limits or usage quotas here.

## Environment Variables
List of required environment variables for API functionality:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Additional environment variables as needed

## Local Development with localStorage

To safely develop and test locally without affecting Supabase or production data, you can enable a localStorage mode:

- Set `VITE_USE_LOCAL_STORAGE=true` in your `.env` file to enable localStorage mode.
- When enabled, all data operations (save and fetch) for feed inventory, egg entries, expenses, and flock profile will use the browser's localStorage instead of Supabase.
- No code changes are needed in your components—just toggle the flag in your `.env` file to switch between localStorage and Supabase.
- This allows for fast, offline-friendly development and testing, with zero risk to your real data.
- Set `VITE_USE_LOCAL_STORAGE=false` to return to normal Supabase-backed operation.

This workflow is recommended for all new features and local development to ensure production data safety.

## Data Handling Flow (Pattern for New Features)

### 1. Frontend State & Form
- User fills out a form in a React component (e.g., `FeedTracker.tsx`).
- Form state is managed with React `useState` hooks.
- On submit, a new entry object is created with all required fields matching the database schema.
- A UUID is generated for the `id` field if the table uses UUIDs.
- Only fields that exist in the database table are included in the object sent to the API.

### 2. API Call
- The frontend calls a utility function (e.g., `apiCall`) to POST the data to a dedicated API endpoint (e.g., `/saveFeedInventory`).
- The API endpoint receives an array of entries and performs an upsert (insert or update) using Supabase, matching on the primary key (`id`).
- The API only expects and processes fields that exist in the table schema.
- The API returns a success or error response, which the frontend uses to update UI state or show errors.

### 3. Database Table
- The Supabase table schema is strictly followed: all required fields must be present, types must match (e.g., UUID, numeric, date, varchar).
- Default values (e.g., `gen_random_uuid()` for `id`, `now()` for timestamps) are set in the database for fields not provided by the client.
- Only fields defined in the schema are stored; extra fields are ignored or cause errors.

### 4. Data Retrieval
- The frontend loads data by calling a fetch utility (e.g., `fetchData`), which hits a centralized API endpoint (e.g., `/getData`).
- The API queries the relevant Supabase tables and returns the data in a format matching the frontend types.
- The frontend updates its state with the fetched data for display and further interaction.

### 5. Error Handling
- All API calls are wrapped in try/catch blocks.
- Errors are logged and user-friendly messages are shown in the UI.
- The API returns detailed error messages for debugging.

### 6. Extending for New Features
- Follow the same pattern: define types, ensure form data matches the schema, use UUIDs if needed, only send/receive schema fields, and handle errors gracefully.
- Update this documentation and the database schema docs when adding new features or tables.

## Troubleshooting

### Database Connectivity Issues

#### Symptoms
- Data saves successfully but doesn't appear in the UI
- Historical data disappears after adding new entries
- Components show empty state despite database containing data

#### Diagnosis Steps
1. Check browser developer tools console for API errors
2. Verify `.env` file has correct `VITE_USE_LOCAL_STORAGE` setting
3. Test API endpoint directly: `GET /api/getData`
4. Compare response structure between localStorage and Supabase modes

#### Data Recovery
If data was lost due to this issue:
1. Check Supabase database directly - data may still be there
2. Re-upload CSV files if necessary
3. Ensure all entries have proper UUID `id` fields

### Development Best Practices

#### Dual-Mode Testing
Always test features in both modes:
- **Development**: `VITE_USE_LOCAL_STORAGE=true` for safe local testing
- **Production**: `VITE_USE_LOCAL_STORAGE=false` for Supabase integration

#### Data Structure Consistency
Ensure API responses maintain consistent structure:
- Use `result.data` normalization in `fetchData()`
- Keep localStorage and Supabase response formats aligned
- Test data flow from API → components → UI
