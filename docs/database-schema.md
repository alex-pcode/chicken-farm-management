# Database Schema Documentation

## Supabase Tables

### flock_profiles
Document the structure and relationships of the flock profiles table
- Primary key
- Fields for tracking individual birds
- Metadata fields
- Relationships with other tables

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

### feed_inventory
Document the feed tracking system
- Primary key
- Feed type classifications
- Quantity tracking
- Purchase date tracking
- Consumption calculations

### expenses
Document the expense tracking system
- Primary key
- Expense categories
- Amount fields
- Date tracking
- Related calculations

## Data Relationships
Document how the tables relate to each other:
- Flock profiles to egg entries
- Feed inventory to expenses
- Other relevant relationships

## Data Validation Rules
Document the validation rules for each table:
- Required fields
- Data types
- Constraints
- Default values

## Indexes
Document any database indexes for optimization:
- Primary keys
- Foreign keys
- Performance-related indexes

Note: Update this documentation whenever database schema changes are made.
