# Copilot Instructions for Chicken Manager

This documentation outlines standards and instructions for the Chicken Manager project, which is a React/Vite web application designed to help backyard chicken keepers and small flock owners manage their chickens, track egg production, monitor feed inventory, and related expenses. The application is deployed through Vercel and uses Supabase as its database backend.

## Organization Guidelines

- Store technical documentation in a `docs/` directory
- Keep the README focused on user-facing information and basic setup
- Avoid duplicate documentation across files
- Use clear, descriptive filenames that reflect component purposes
- Maintain separation of concerns between different tracking features (eggs, feed, expenses)

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

## Component Organization

- Keep component-specific logic within respective files:
  - `EggCounter.tsx` for egg production tracking
  - `FeedTracker.tsx` for feed inventory management
  - `Expenses.tsx` for financial tracking
  - `Profile.tsx` for flock profile management
  - `ReportGenerator.tsx` for data analysis and reporting

## Data Management

### Database Structure
- Document Supabase table schemas and relationships:
  - `flock_profiles` - Stores chicken flock information
  - `egg_entries` - Tracks daily egg production
  - `expenses` - Records all financial transactions
  - `feed_inventory` - Manages feed stock and consumption

### Data Import Process
- CSV files are used for initial data import only:
  - `egg_entries_with_id.csv` → `egg_entries` table
  - `expenses_with_id.csv` → `expenses` table
  - `feed_inventory_with_id.csv` → `feed_inventory` table
  - `flock_profiles_with_id.csv` → `flock_profiles` table
- Document data migration and import procedures
- Maintain clear documentation for Supabase schema and relationships
- Document data validation and error handling procedures

### Deployment
- Document Vercel deployment process and configuration
- Maintain environment variables documentation
- Document GitHub integration setup
- Detail database connection configuration in Vercel

## Maintenance Practices

- Update documentation whenever code changes are made
- Keep build and deployment instructions current
- Document troubleshooting scenarios and their solutions
- Record any breaking changes and migration steps
- Update keyboard shortcuts documentation when modified
- Maintain API endpoint documentation in sync with implementation

## Feature-Specific Guidelines

### Egg Production Tracking
- Document egg counting mechanisms
- Explain carton visualization logic
- Detail production rate calculations

### Feed Inventory
- Document feed type classifications
- Explain inventory calculation methods
- Detail consumption tracking procedures

### Expense Management
- Document expense categorization
- Explain cost calculation methodologies
- Detail reporting and analysis features

### Flock Profiles
- Document bird tracking system
- Explain flock performance metrics
- Detail profile management procedures

This documentation emphasizes maintaining accuracy across all chicken management features, avoiding duplication, and ensuring that all references to code and file paths remain current as the project evolves. It serves as a comprehensive guide for maintaining and extending the Chicken Manager application.