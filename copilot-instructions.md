# Copilot Instructions for Chicken Manager

This documentation outlines standards and instructions for the Chicken Manager project, which is a React/Vite web application designed to help backyard chicken keepers and small flock owners manage their chickens, track egg production, monitor feed inventory, and related expenses. The application is deployed through Vercel and uses Supabase as its database backend with full user authentication and multi-user support.

## Organization Guidelines

- Store technical documentation in a `docs/` directory
- Keep the README focused on user-facing information and basic setup
- Avoid duplicate documentation across files
- Use clear, descriptive filenames that reflect component purposes
- Maintain separation of concerns between different tracking features (eggs, feed, expenses)
- Document authentication and security requirements for all features
- Maintain user data privacy and isolation guidelines

## Writing Standards

- Use clear, concise language focused on small-scale chicken keeping concepts
- Include practical examples and code snippets that demonstrate real use cases for backyard flocks
- Structure content with meaningful headings and bullet points
- Reference actual file paths and component names from the codebase (e.g., `src/components/EggCounter.tsx`)
- Document relationships between different components (e.g., how `FeedTracker` affects `Expenses`)

## Technical Requirements

- Always verify that file paths and code references are current
- Include version information for key dependencies
- Maintain accurate TypeScript type definitions in `src/types`
- Cross-reference related documentation to avoid duplication
- Document Vercel deployment configurations and environment variables
- Ensure Supabase database connections are properly configured through Vercel
- Document API endpoints and their interactions with Supabase
- **Authentication Security**: All API endpoints must require user authentication
- **Row Level Security (RLS)**: Document database security policies for user data isolation
- **JWT Token Management**: Ensure proper token handling in all API communications
- **User Session Management**: Document authentication context and protected routes

## Component Organization

- Keep component-specific logic within respective files:
  - `EggCounter.tsx` for egg production tracking (user-specific data)
  - `FeedTracker.tsx` for feed inventory management (user-specific data)
  - `Expenses.tsx` for financial tracking (user-specific data)
  - `Profile.tsx` for flock profile management and timeline events (user-specific data)
  - `Savings.tsx` for analytics and profitability analysis (user-specific data)
  - `ReportGenerator.tsx` for data analysis and reporting (user-specific data)
- **Authentication Components**:
  - `AuthContext.tsx` for user session management and authentication state
  - `Auth.tsx` for login/signup interface using Supabase Auth UI
  - `ProtectedRoute.tsx` for route protection requiring authentication
  - `UserProfile.tsx` for displaying current user information

## Data Management

### Database Structure
- Document Supabase table schemas and relationships:
  - `flock_profiles` - Stores chicken flock information with individual bird counts (hens, roosters, chicks, brooding) **+ user_id for data isolation**
  - `flock_events` - Tracks timeline events and milestones in flock lifecycle **+ user_id for data isolation**
  - `egg_entries` - Tracks daily egg production **+ user_id for data isolation**
  - `expenses` - Records all financial transactions **+ user_id for data isolation**
  - `feed_inventory` - Manages feed stock and consumption **+ user_id for data isolation**
- **Security Requirements**:
  - All tables must have `user_id` column (UUID, NOT NULL)
  - Row Level Security (RLS) policies enabled on all tables
  - RLS policies restrict access to user's own data only
  - Foreign key relationships must respect user boundaries

### API Endpoints
- **Authentication Required**: All endpoints require valid JWT token in Authorization header
- Data retrieval: `GET /api/getData` - Returns user-specific application data only
- Profile management: `POST /api/saveFlockProfile` - Create/update user's flock profiles
- Event management: 
  - `POST /api/saveFlockEvents` - Create new user timeline events
  - `PUT /api/saveFlockEvents` - Update user's existing timeline events
  - `DELETE /api/deleteFlockEvent` - Remove user's timeline events
- Production tracking: `POST /api/saveEggEntries` - Track user's daily egg production
- Inventory management: `POST /api/saveFeedInventory` - Manage user's feed inventory
- Financial tracking: `POST /api/saveExpenses` - Record user's expenses
- **Migration Support**: `GET /api/getUserMigrationScript` - Generate SQL to migrate orphaned data to current user

### Data Import Process
- **Legacy Migration Completed**: CSV files were used for initial data import (historical `egg_entries_with_id.csv`)
- **User Data Migration**: Existing data has been migrated to include proper user_id associations
- **Multi-User Security**: All data is now isolated by user authentication
- Event data has been migrated from JSON storage to dedicated `flock_events` table with user_id
- Bird counts have been migrated from JSON to individual columns in `flock_profiles` with user_id
- Document data migration and import procedures for multi-user environments
- Maintain clear documentation for Supabase schema with RLS policies
- Document data validation, error handling, and user authentication procedures
- **Migration Tools**: Use `getUserMigrationScript` endpoint to handle orphaned data assignments

### Recent Schema Updates
- **User Authentication Integration**: Added Supabase Auth with complete user session management
- **Multi-User Support**: Added `user_id` columns to all data tables for user isolation
- **Row Level Security (RLS)**: Enabled database-level security policies for data protection
- **flock_events table**: Added dedicated table for timeline events (replaced JSON storage) with user_id
- **flock_profiles columns**: Added individual bird count columns (hens, roosters, chicks, brooding) with user_id
- **Event management**: Full CRUD operations for timeline events with proper foreign key relationships and user restrictions
- **Data migration**: Completed migration from legacy JSON-based storage to normalized database structure with user associations
- **API modernization**: Updated all endpoints to require authentication and work with user-specific data
- **Authentication Context**: Added React context for global user session management
- **Protected Routes**: All application routes now require user authentication

### Deployment
- Document Vercel deployment process and configuration
- Maintain environment variables documentation (including Supabase Auth keys)
- Document GitHub integration setup
- Detail database connection configuration in Vercel
- **Security Environment Variables**:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for auth
  - `VITE_USE_LOCAL_STORAGE` - Set to false for production (use Supabase)

## Maintenance Practices

- Update documentation whenever code changes are made
- Keep build and deployment instructions current
- Document troubleshooting scenarios and their solutions
- Record any breaking changes and migration steps
- Update keyboard shortcuts documentation when modified
- Maintain API endpoint documentation in sync with implementation
- **Security Maintenance**:
  - Document RLS policy updates and testing procedures
  - Maintain authentication flow documentation
  - Keep user migration scripts and procedures current
  - Test multi-user data isolation regularly

## Feature-Specific Guidelines

### Egg Production Tracking
- Document egg counting mechanisms for user-specific data
- Explain carton visualization logic with user isolation
- Detail production rate calculations per user
- Document authentication requirements for egg tracking

### Feed Inventory
- Document feed type classifications for user-specific inventory
- Explain inventory calculation methods with user data isolation
- Detail consumption tracking procedures per user account
- Document user-specific feed management and authentication

### Expense Management
- Document expense categorization for user-specific financial tracking
- Explain cost calculation methodologies per user account
- Detail reporting and analysis features with user data isolation
- Document authentication requirements for expense tracking

### Flock Profiles
- Document bird tracking system with individual counts (hens, roosters, chicks, brooding) per user
- Explain flock performance metrics and analytics integration with user data isolation
- Detail profile management procedures and data validation for authenticated users
- Document timeline event integration and relationship management per user account
- Document user-specific flock data and privacy protection
- Document timeline event integration and relationship management

### Timeline and Event Management
- Document event tracking system for flock milestones per user account
- Explain event types: acquisition, laying_start, broody, hatching, other (user-specific)
- Detail event CRUD operations (create, read, update, delete) with authentication
- Document relationship between user flock profiles and user events
- Document user data isolation for timeline events

### Analytics and Reporting
- Document savings calculations and profitability analysis in `Savings.tsx` per user
- Explain productivity metrics (eggs per hen, daily lay rate, revenue per hen) with user data isolation
- Detail cost analysis and break-even calculations for individual user accounts
- Document time period filtering (month, quarter, year, all-time) with user-specific data
- Document authentication requirements for analytics and reporting features

### Authentication and Security
- Document user registration and login flows with Supabase Auth
- Explain JWT token management and automatic refresh
- Detail protected route implementation and authentication context
- Document Row Level Security (RLS) policies and their enforcement
- Explain user data isolation at the database level
- Document migration procedures for existing data to authenticated users
- Detail logout procedures and session cleanup

This documentation emphasizes maintaining accuracy across all chicken management features, avoiding duplication, and ensuring that all references to code and file paths remain current as the project evolves. It serves as a comprehensive guide for maintaining and extending the Chicken Manager application with full user authentication, data privacy, and multi-user support. **Security and user data isolation are now fundamental requirements for all features and components.**