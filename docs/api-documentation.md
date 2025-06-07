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
Document common API errors and their solutions here.

## Rate Limits
Document any rate limits or usage quotas here.

## Environment Variables
List of required environment variables for API functionality:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Additional environment variables as needed
