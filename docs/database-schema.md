# Database Schema Documentation

## Supabase Tables

### flock_profiles
**Purpose**: Store farm and flock information with detailed bird counts and metadata

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each flock profile
- `farm_name` (TEXT): Name of the farm (default: 'My Chicken Farm')
- `location` (TEXT): Farm location/address
- `flock_size` (INTEGER): Total number of birds in the flock
- `breed` (TEXT): Comma-separated list of chicken breeds
- `start_date` (DATE): Date when the flock was established
- `hens` (INTEGER, NOT NULL, DEFAULT 0): Number of laying hens
- `roosters` (INTEGER, NOT NULL, DEFAULT 0): Number of roosters
- `chicks` (INTEGER, NOT NULL, DEFAULT 0): Number of young chicks
- `brooding` (INTEGER, NOT NULL, DEFAULT 0): Number of brooding hens
- `notes` (TEXT): Additional notes about the flock
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**API Operations**:
- **Save**: Uses upsert logic - updates existing profile or creates new one
- **Read**: Returns the first (and typically only) profile with all fields mapped to frontend format

**Data Integrity**:
- Only one flock profile is expected per application instance
- Bird counts are stored in dedicated columns (not in JSON)
- Frontend maps database field names to application field names
- All bird count fields have default values of 0

**Relationships**:
- Parent table for `flock_events` (one-to-many relationship)

### egg_entries
**Purpose**: Track daily egg production with proper data persistence

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each entry
- `date` (DATE, NOT NULL): Date of egg collection
- `count` (INTEGER, NOT NULL): Number of eggs collected

**API Operations**:
- **Save**: Uses `upsert` with `onConflict: 'id'` to prevent data loss
- **Read**: Returns all entries ordered by date (descending)

**Data Integrity**:
- All entries must have UUID `id` field for proper upsert functionality
- Frontend generates UUIDs for new entries using `uuidv4()`
- Existing entries from CSV imports retain their original IDs
- No duplicate dates allowed per entry

**Recent Fixes**:
- ✅ Fixed data loss issue where new entries overwrote existing data
- ✅ Ensured proper ID assignment for all entries
- ✅ Normalized API response structure for consistent data access

### flock_events
**Purpose**: Track timeline events and milestones in the flock's lifecycle

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each event
- `flock_profile_id` (UUID, Foreign Key): References flock_profiles.id
- `date` (DATE, NOT NULL): Date when the event occurred
- `type` (TEXT, NOT NULL): Event type ('acquisition', 'laying_start', 'broody', 'hatching', 'other')
- `description` (TEXT, NOT NULL): Human-readable description of the event
- `affected_birds` (INTEGER): Number of birds affected by the event (optional)
- `notes` (TEXT): Additional notes about the event (optional)
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**API Operations**:
- **Save**: POST creates new events, PUT updates existing events
- **Read**: Fetched with flock profile, ordered by date ascending
- **Delete**: DELETE removes events by ID

**Data Integrity**:
- Events are linked to flock profiles via foreign key
- Event types are constrained to predefined values
- Frontend generates UUIDs for new events, database returns actual IDs
- Events are sorted chronologically in the timeline

**Event Types**:
- `acquisition`: New birds acquired (🐣)
- `laying_start`: Hens started laying eggs (🥚)
- `broody`: Hens went broody (🐔)
- `hatching`: Eggs hatched (🐣)
- `other`: Other significant events (📝)

### feed_inventory
**Purpose**: Track feed purchases, consumption, and inventory management

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each feed entry
- `brand` (TEXT, NOT NULL): Feed brand name
- `type` (TEXT, NOT NULL): Type of feed (starter, grower, layer, etc.)
- `quantity` (NUMERIC, NOT NULL): Amount of feed
- `unit` (TEXT, NOT NULL): Unit of measurement ('kg' or 'lbs')
- `opened_date` (DATE, NOT NULL): Date when feed was opened/started
- `depleted_date` (DATE): Date when feed was finished (optional)
- `batch_number` (TEXT): Manufacturer's batch number (optional)
- `price_per_unit` (NUMERIC, NOT NULL): Cost per unit
- `description` (TEXT): Additional notes about the feed (optional)
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**API Operations**:
- **Save**: Creates or updates feed inventory entries
- **Read**: Returns all entries ordered by opened_date descending

**Data Integrity**:
- All entries must have valid dates and quantities
- Price tracking for cost analysis
- Batch numbers for quality control tracking

### expenses
**Purpose**: Track all farm-related expenses for financial analysis

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each expense
- `date` (DATE, NOT NULL): Date when expense was incurred
- `category` (TEXT, NOT NULL): Expense category (feed, medical, equipment, etc.)
- `description` (TEXT, NOT NULL): Description of the expense
- `amount` (NUMERIC, NOT NULL): Cost amount in local currency
- `created_at` (TIMESTAMP): Record creation timestamp

**API Operations**:
- **Save**: Uses upsert with conflict resolution on id
- **Read**: Returns all expenses ordered by date descending

**Data Integrity**:
- All expenses must have valid dates and amounts
- Categories help with expense classification and reporting
- UUIDs generated for new entries to prevent data loss

**Expense Categories**:
- Common categories include: feed, medical, equipment, housing, utilities, other

## Data Relationships

### Primary Relationships
- **flock_profiles → flock_events**: One-to-many relationship
  - One flock profile can have multiple timeline events
  - Events are linked via `flock_profile_id` foreign key
  - Events are automatically loaded when fetching flock profile data

### Independent Tables
- **egg_entries**: Standalone daily production tracking
- **feed_inventory**: Standalone feed management
- **expenses**: Standalone financial tracking

### Data Flow
1. **Profile Setup**: User creates flock_profiles entry with basic farm information
2. **Timeline Events**: flock_events are created to track important milestones
3. **Daily Operations**: egg_entries track daily production independently
4. **Resource Management**: feed_inventory and expenses track costs and resources

## Data Validation Rules

### flock_profiles
- `farm_name`: Required, defaults to 'My Chicken Farm'
- `hens`, `roosters`, `chicks`, `brooding`: Non-negative integers, default 0
- `start_date`: Valid date format
- `flock_size`: Should match sum of individual bird counts

### flock_events
- `flock_profile_id`: Must reference existing flock_profiles.id
- `date`: Required, valid date format
- `type`: Must be one of: 'acquisition', 'laying_start', 'broody', 'hatching', 'other'
- `description`: Required, non-empty string
- `affected_birds`: Optional, non-negative integer

### egg_entries
- `date`: Required, unique per entry
- `count`: Required, non-negative integer
- `id`: UUID format required for proper upsert functionality

### feed_inventory
- `quantity`: Required, positive number
- `price_per_unit`: Required, non-negative number
- `unit`: Must be 'kg' or 'lbs'
- `opened_date`: Required, valid date

### expenses
- `amount`: Required, positive number
- `date`: Required, valid date format
- `category` and `description`: Required, non-empty strings

## Database Indexes and Performance

### Primary Keys (Automatic Indexes)
- All tables use UUID primary keys for optimal distribution
- UUIDs prevent conflicts in distributed environments

### Foreign Key Indexes
- `flock_events.flock_profile_id` → `flock_profiles.id`

### Query Optimization
- Events are ordered by date for timeline display
- Egg entries ordered by date descending for recent-first display
- Expenses ordered by date descending for financial analysis

## API Endpoints and Operations

### Data Fetching
- **GET /api/getData**: Returns all data (profiles, events, eggs, feed, expenses)
- Normalizes database field names to frontend expectations
- Handles missing or null data gracefully

### Data Persistence
- **POST /api/saveFlockProfile**: Upsert flock profile data
- **POST /api/saveFlockEvents**: Create new timeline events
- **PUT /api/saveFlockEvents**: Update existing timeline events
- **DELETE /api/deleteFlockEvent**: Remove timeline events
- **POST /api/saveEggEntries**: Upsert egg production data
- **POST /api/saveFeedInventory**: Manage feed inventory
- **POST /api/saveExpenses**: Track financial expenses

### Error Handling
- UUID validation for foreign key relationships
- Proper HTTP status codes for different error types
- Detailed error messages for debugging

## Recent Schema Changes

### ✅ Completed Migrations
1. **flock_events Table Creation**: Added dedicated events table to replace JSON storage
2. **Event Data Migration**: Moved timeline data from flock_profiles.notes to flock_events
3. **Bird Count Columns**: Added dedicated columns for hens, roosters, chicks, brooding
4. **Profile Data Normalization**: Mapped database fields to frontend expectations
5. **API Endpoint Updates**: Created comprehensive CRUD operations for events

### Data Migration Notes
- Legacy events stored in profile notes were migrated to flock_events table
- Bird counts moved from JSON to dedicated integer columns
- All APIs updated to use new schema structure
- Frontend components updated to use proper database relationships
