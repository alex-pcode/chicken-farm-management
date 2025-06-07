# Database Schema Documentation

## Supabase Tables

### flock_profiles
Document the structure and relationships of the flock profiles table
- Primary key
- Fields for tracking individual birds
- Metadata fields
- Relationships with other tables

### egg_entries
Document the structure for tracking egg production
- Primary key
- Daily count fields
- Timestamp fields
- Related calculations

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
