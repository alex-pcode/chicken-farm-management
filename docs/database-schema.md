# Database Schema Documentation

## Overview

The Chicken Manager application uses Supabase (PostgreSQL) with Row Level Security (RLS) enabled for multi-user data isolation. Each table includes a `user_id` column to associate records with specific users.

## Authentication & Security

### User Authentication (Supabase Auth)
Supabase provides built-in user authentication with the following features:
- **User Registration**: Email/password signup
- **User Login**: Secure session management
- **JWT Tokens**: Automatic token generation and refresh
- **Session Persistence**: Maintains login state across browser sessions

### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only access their own data
- All new records are automatically tagged with the user's ID
- Database-level security prevents unauthorized access

### Required RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE flock_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE flock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE flock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_events ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can only access their own flock profiles" ON flock_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own egg entries" ON egg_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own feed inventory" ON feed_inventory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own flock events" ON flock_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own flock batches" ON flock_batches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own death records" ON death_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own batch events" ON batch_events
  FOR ALL USING (auth.uid() = user_id);
```

---

## Tables

### flock_profiles
**Purpose**: Store farm and flock information with detailed bird counts and metadata

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each flock profile
- `user_id` (UUID, NOT NULL): Foreign key to auth.users (Supabase Auth)
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

**Security**:
- RLS policy ensures users only access their own profiles
- Each user typically has one flock profile

### egg_entries
**Purpose**: Track daily egg production with detailed classification

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each entry
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
- `date` (DATE, NOT NULL): Date of egg collection
- `count` (INTEGER, NOT NULL): Number of eggs collected (count >= 0)
- `size` (TEXT): Egg size classification ('small', 'medium', 'large', 'extra-large', 'jumbo')
- `color` (TEXT): Egg shell color ('white', 'brown', 'blue', 'green', 'speckled', 'cream')
- `notes` (TEXT): Optional notes about the egg entry
- `created_at` (TIMESTAMP): Record creation timestamp

**Security**:
- RLS policy filters entries by user_id
- Users can only see their own egg production data

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
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
- `name` (TEXT, NOT NULL): Feed name/brand
- `quantity` (NUMERIC, NOT NULL): Amount of feed (quantity >= 0)
- `unit` (TEXT, NOT NULL): Unit of measurement ('kg' or 'lbs')
- `purchase_date` (DATE): Date when feed was purchased
- `expiry_date` (DATE): Date when feed expires
- `total_cost` (NUMERIC): Total cost for the entire feed bag/purchase
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**API Operations**:
- **Save**: Creates or updates feed inventory entries
- **Read**: Returns all entries ordered by purchase_date descending

**Data Integrity**:
- All entries must have valid dates and quantities
- Total cost tracking for financial analysis
- Purchase and expiry date tracking for inventory management

### expenses
**Purpose**: Track all farm-related expenses for financial analysis

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each expense
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
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

## Customer Relationship Management (CRM) Tables

### customers
Stores customer information for egg sales with user isolation.

**Columns:**
- `id` (UUID, Primary Key) - Unique customer identifier
- `user_id` (UUID, Foreign Key, NOT NULL) - References auth.users for data isolation
- `name` (TEXT, NOT NULL) - Customer name
- `phone` (TEXT) - Customer phone number
- `notes` (TEXT) - Additional customer notes
- `is_active` (BOOLEAN, DEFAULT true) - Soft delete flag
- `created_at` (TIMESTAMPTZ, DEFAULT now()) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Index on `user_id` for efficient user data queries
- Index on `is_active` for filtering active customers

**RLS Policy:**
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);
```

### sales
Records egg sales transactions with customer relationships and user isolation.

**Columns:**
- `id` (UUID, Primary Key) - Unique sale identifier
- `user_id` (UUID, Foreign Key, NOT NULL) - References auth.users for data isolation
- `customer_id` (UUID, Foreign Key) - References customers.id (nullable)
- `sale_date` (DATE, NOT NULL) - Date of sale
- `dozen_count` (INTEGER, DEFAULT 0) - Number of dozens sold (dozen_count >= 0)
- `individual_count` (INTEGER, DEFAULT 0) - Number of individual eggs sold (individual_count >= 0)
- `total_amount` (DECIMAL(10,2), NOT NULL) - Sale amount (total_amount >= 0)
- `paid` (BOOLEAN, DEFAULT false) - Payment status tracking
- `notes` (TEXT) - Sale notes
- `created_at` (TIMESTAMPTZ, DEFAULT now()) - Creation timestamp

**Constraints:**
- `total_amount >= 0` - Allows free egg distribution ($0.00 sales)
- `dozen_count >= 0 AND individual_count >= 0` - Non-negative quantities
- Foreign key: `customer_id` references `customers(id)` with user boundary respect

**Indexes:**
- Primary key on `id`
- Index on `user_id` for efficient user data queries
- Index on `customer_id` for customer sales lookup
- Index on `sale_date` for chronological queries

**RLS Policy:**
```sql
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id);
```

**Relationships:**
- `sales.customer_id` → `customers.id` (Many sales per customer)
- Both tables enforce user boundary through `user_id` column

**Design Notes:**
- Frontend uses simplified total egg count input
- Backend stores `dozen_count` and `individual_count` for compatibility
- Supports $0.00 sales for free egg distribution tracking
- Payment status tracking with `paid` boolean field

## Batch Management System

### flock_batches
**Purpose**: Track individual batches of birds with detailed lifecycle management

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each batch
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
- `batch_name` (TEXT, NOT NULL): Human-readable name for the batch
- `breed` (TEXT, NOT NULL): Breed of birds in this batch
- `acquisition_date` (DATE, NOT NULL): Date when batch was acquired
- `initial_count` (INTEGER, NOT NULL): Starting number of birds (initial_count > 0)
- `current_count` (INTEGER, NOT NULL): Current number of living birds (current_count >= 0)
- `hens_count` (INTEGER, DEFAULT 0): Number of female adult chickens in this batch
- `roosters_count` (INTEGER, DEFAULT 0): Number of male adult chickens in this batch  
- `chicks_count` (INTEGER, DEFAULT 0): Number of young chickens in this batch
- `brooding_count` (INTEGER, DEFAULT 0): Number of brooding hens (calculated from batch events)
- `type` (TEXT, NOT NULL): Batch type ('hens', 'roosters', 'chicks', 'mixed')
- `age_at_acquisition` (TEXT, NOT NULL): Age when acquired ('chick', 'juvenile', 'adult')
- `expected_laying_start_date` (DATE): Expected date for laying to begin
- `actual_laying_start_date` (DATE): Actual date laying began
- `source` (TEXT, NOT NULL): Where birds were acquired from
- `cost` (NUMERIC, DEFAULT 0.00): Cost paid for acquiring this batch
- `notes` (TEXT): Additional notes about the batch
- `is_active` (BOOLEAN, DEFAULT true): Soft delete flag
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Security**:
- RLS policy ensures users only access their own batches
- Foreign keys maintain relationships with death records and batch events

### death_records
**Purpose**: Track mortality events for proper flock management and analysis

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each death record
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
- `batch_id` (UUID, NOT NULL): Foreign key to flock_batches.id
- `date` (DATE, NOT NULL): Date when death occurred
- `count` (INTEGER, NOT NULL): Number of birds that died (count > 0)
- `cause` (TEXT, NOT NULL): Cause of death ('predator', 'disease', 'age', 'injury', 'unknown', 'culled', 'other')
- `description` (TEXT, NOT NULL): Detailed description of the death event
- `notes` (TEXT): Additional notes about the incident
- `created_at` (TIMESTAMP): Record creation timestamp

**Security**:
- RLS policy filters records by user_id
- Foreign key ensures deaths are linked to valid batches

### batch_events
**Purpose**: Comprehensive event tracking for batch lifecycle management

**Schema**:
- `id` (UUID, Primary Key): Unique identifier for each event
- `user_id` (UUID, NOT NULL): Foreign key to auth.users
- `batch_id` (UUID, NOT NULL): Foreign key to flock_batches.id
- `date` (DATE, NOT NULL): Date when event occurred
- `type` (TEXT, NOT NULL): Event type ('health_check', 'vaccination', 'relocation', 'breeding', 'laying_start', 'brooding_start', 'brooding_stop', 'production_note', 'flock_added', 'flock_loss', 'other')
- `description` (TEXT, NOT NULL): Event description
- `affected_count` (INTEGER): Number of birds affected (affected_count > 0)
- `notes` (TEXT): Additional notes about the event
- `created_at` (TIMESTAMP): Record creation timestamp

**Security**:
- RLS policy ensures users only access their own batch events
- Foreign key maintains relationship with flock batches

**Event Types**:
- `health_check`: Regular health inspections
- `vaccination`: Vaccination records
- `relocation`: Moving birds to different locations
- `breeding`: Breeding activities
- `laying_start`: When hens begin laying
- `brooding_start`/`brooding_stop`: Brooding behavior tracking
- `production_note`: Production-related observations
- `flock_added`: Adding birds to the batch
- `flock_loss`: Loss events (deaths tracked separately in death_records)
- `other`: Other significant events

## Data Relationships

### Primary Relationships
- **flock_profiles → flock_events**: One-to-many relationship
  - One flock profile can have multiple timeline events
  - Events are linked via `flock_profile_id` foreign key
  - Events are automatically loaded when fetching flock profile data

### Batch Management Relationships
- **flock_batches → death_records**: One-to-many relationship
  - One batch can have multiple death records
  - Deaths are linked via `batch_id` foreign key
  - Mortality tracking for batch analysis
  
- **flock_batches → batch_events**: One-to-many relationship
  - One batch can have multiple lifecycle events
  - Events are linked via `batch_id` foreign key
  - Comprehensive event history for batch management

### Customer Management Relationships  
- **customers → sales**: One-to-many relationship
  - One customer can have multiple sales
  - Sales are linked via `customer_id` foreign key
  - Customer relationship tracking for CRM

### Independent Tables
- **egg_entries**: Standalone daily production tracking
- **feed_inventory**: Standalone feed management  
- **expenses**: Standalone financial tracking

### Data Flow
1. **Profile Setup**: User creates flock_profiles entry with basic farm information
2. **Timeline Events**: flock_events are created to track important milestones
3. **Daily Operations**: egg_entries track daily production independently
4. **Resource Management**: feed_inventory and expenses track costs and resources
5. **Customer Management**: customers table stores customer information for sales
6. **Sales Tracking**: sales table records egg sales transactions

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

### customers
- `user_id`: Must reference existing auth.users
- `name`: Required, non-empty string
- `phone`: Optional, valid phone number format
- `notes`: Optional, no specific format
- `is_active`: Boolean value, defaults to true
- `created_at`: Timestamp with time zone, defaults to current time

### sales
- `user_id`: Must reference existing auth.users
- `customer_id`: Must reference existing customers.id (nullable)
- `sale_date`: Required, valid date format
- `dozen_count`, `individual_count`: Non-negative integers
- `total_amount`: Required, non-negative decimal number
- `paid`: Boolean value, defaults to false
- `notes`: Optional, no specific format
- `created_at`: Timestamp with time zone, defaults to current time

### flock_batches
- `user_id`: Must reference existing auth.users
- `batch_name`: Required, non-empty string
- `breed`: Required, non-empty string
- `acquisition_date`: Required, valid date format
- `initial_count`: Required, positive integer (initial_count > 0)
- `current_count`: Required, non-negative integer (current_count >= 0)
- `hens_count`, `roosters_count`, `chicks_count`, `brooding_count`: Non-negative integers
- `type`: Must be one of 'hens', 'roosters', 'chicks', 'mixed'
- `age_at_acquisition`: Must be one of 'chick', 'juvenile', 'adult'
- `source`: Required, non-empty string
- `cost`: Non-negative decimal number, defaults to 0.00
- `is_active`: Boolean value, defaults to true

### death_records
- `user_id`: Must reference existing auth.users
- `batch_id`: Must reference existing flock_batches.id
- `date`: Required, valid date format
- `count`: Required, positive integer (count > 0)
- `cause`: Must be one of 'predator', 'disease', 'age', 'injury', 'unknown', 'culled', 'other'
- `description`: Required, non-empty string
- `notes`: Optional, no specific format

### batch_events
- `user_id`: Must reference existing auth.users
- `batch_id`: Must reference existing flock_batches.id
- `date`: Required, valid date format
- `type`: Must be one of 'health_check', 'vaccination', 'relocation', 'breeding', 'laying_start', 'brooding_start', 'brooding_stop', 'production_note', 'flock_added', 'flock_loss', 'other'
- `description`: Required, non-empty string
- `affected_count`: Optional, positive integer when specified

## Database Indexes and Performance

### Primary Keys (Automatic Indexes)
- All tables use UUID primary keys for optimal distribution
- UUIDs prevent conflicts in distributed environments

### Foreign Key Indexes
- `flock_events.flock_profile_id` → `flock_profiles.id`
- `sales.customer_id` → `customers.id`

### Query Optimization
- Events are ordered by date for timeline display
- Egg entries ordered by date descending for recent-first display
- Expenses ordered by date descending for financial analysis
- Sales can be queried by customer and date for reporting

## API Endpoints and Operations

### Data Fetching
- **GET /api/getData**: Returns all data (profiles, events, eggs, feed, expenses, customers, sales)
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
- **POST /api/saveCustomer**: Upsert customer data
- **POST /api/saveSale**: Record new egg sale

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
6. **customers Table Creation**: Added table for customer data with user isolation
7. **sales Table Creation**: Added table for sales transactions with customer relationships
8. **CRM Data Migration**: Migrated existing customer and sales data to new tables
9. **Batch Management System**: Added flock_batches, death_records, and batch_events tables
10. **Enhanced Egg Tracking**: Added size, color, and notes fields to egg_entries
11. **Feed Inventory Updates**: Renamed fields and added total_cost tracking
12. **Payment Tracking**: Added paid status field to sales table

### Data Migration Notes
- Legacy events stored in profile notes were migrated to flock_events table
- Bird counts moved from JSON to dedicated integer columns
- All APIs updated to use new schema structure
- Frontend components updated to use proper database relationships
- Batch management system enables detailed flock lifecycle tracking
- Enhanced egg classification with size and color attributes
- Comprehensive mortality tracking with cause analysis
