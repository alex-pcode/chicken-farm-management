# Unified Project Structure

## Overview

This document defines the standardized project structure for the chicken farm management application. This structure emphasizes maintainability, scalability, and clear separation of concerns while supporting modern full-stack development practices.

## Project Root Structure

```
aplikacija/
├── .github/                    # GitHub Actions and workflows
│   └── workflows/
├── api/                        # Serverless API functions (Vercel)
├── assets/                     # Static assets and resources
├── docs/                       # Project documentation
├── migrations/                 # Database migration scripts
├── public/                     # Public static files
├── src/                        # Source code (React application)
├── dist/                       # Build output
├── node_modules/              # Dependencies
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.mjs            # Vite build configuration
├── vercel.json                # Vercel deployment configuration
├── supabase.json              # Supabase project configuration
└── README.md                  # Project overview and setup
```

## API Structure (`/api`)

Serverless functions deployed to Vercel, following RESTful conventions:

```
api/
├── customers.ts               # Customer management endpoints
├── deathRecords.ts            # Flock mortality tracking
├── flockBatches.ts            # Batch management operations
├── flockSummary.ts            # Flock analytics and summaries
├── getData.ts                 # Main data fetching endpoint
├── sales.ts                   # Sales transaction handling
├── salesReports.ts            # Sales analytics and reporting
├── saveEggEntries.ts          # Egg production logging
├── saveExpenses.ts            # Expense tracking
├── saveFeedInventory.ts       # Feed inventory management
├── saveFlockEvents.ts         # Flock event logging
├── saveFlockProfile.ts        # Flock profile management
└── deleteFlockEvent.ts        # Event deletion
```

### API Naming Conventions:
- **CRUD Operations**: `[verb][Entity].ts` (e.g., `saveEggEntries.ts`, `deleteFlockEvent.ts`)
- **Data Retrieval**: `get[Entity].ts` or `[entity].ts` for general access
- **Reports/Analytics**: `[entity]Reports.ts` or `[entity]Summary.ts`

## Source Structure (`/src`)

React application with feature-based organization:

```
src/
├── components/                # React components
│   ├── __tests__/            # Component tests
│   ├── [FeatureComponents].tsx
│   └── shared/               # Reusable UI components
├── contexts/                 # React Context providers
│   └── __tests__/           # Context tests
├── services/                # Service layer
│   └── api/                 # API service implementations
│       ├── __tests__/       # Service tests
│       ├── BaseApiService.ts
│       ├── [Domain]Service.ts
│       ├── types.ts
│       └── index.ts
├── types/                   # TypeScript type definitions
│   ├── api.ts              # API-related types
│   ├── crm.ts              # CRM domain types
│   └── index.ts            # Core domain types
├── utils/                  # Utility functions
│   ├── __tests__/         # Utility tests
│   └── [utility].ts
├── design-system/         # Design tokens and system
├── test/                  # Test utilities and setup
├── App.tsx               # Root application component
├── main.tsx             # Application entry point
└── index.css           # Global styles
```

## Component Organization

### Component Categories:

1. **Feature Components**: Business logic components (e.g., `EggCounter.tsx`, `FeedTracker.tsx`)
2. **Layout Components**: Page structure and navigation
3. **UI Components**: Reusable interface elements
4. **Animation Components**: Animated graphics and interactions

### Component Structure:
```
components/
├── [FeatureName].tsx         # Main feature components
├── [Animation]PNG.tsx        # Animated components
├── [Shared].tsx             # Reusable components
└── __tests__/
    └── [Component].test.tsx  # Co-located tests
```

## Service Layer Architecture

Organized by domain responsibility:

```
services/api/
├── BaseApiService.ts         # Common HTTP operations
├── AuthService.ts            # Authentication operations
├── DataService.ts            # General data operations
├── FlockService.ts           # Flock management operations
├── ProductionService.ts      # Production data operations
├── types.ts                  # Service type definitions
└── index.ts                  # Service exports and instances
```

### Service Responsibilities:
- **BaseApiService**: HTTP client, error handling, authentication
- **AuthService**: User authentication, session management
- **DataService**: General data fetching and caching
- **FlockService**: Flock profiles, events, batch management
- **ProductionService**: Eggs, feed, expenses, sales

## Type System Organization

Centralized type definitions with domain separation:

```
types/
├── index.ts                 # Core business types
├── api.ts                   # API response and error types
└── crm.ts                   # Customer relationship types
```

### Type Categories:
- **Core Types**: Business entities (EggEntry, Expense, FlockProfile)
- **API Types**: Request/response interfaces, error classes
- **CRM Types**: Customer and sales-related types
- **Utility Types**: Generic helpers and shared interfaces

## Documentation Structure (`/docs`)

Hierarchical documentation with clear ownership:

```
docs/
├── prd.md                    # Product Requirements Document
├── architecture.md           # High-level architecture overview
├── unified-project-structure.md  # This document
├── architecture/             # Detailed architecture docs
│   ├── api-service-layer.md
│   ├── coding-standards.md
│   ├── source-tree.md
│   └── [other-arch-docs].md
├── prd/                     # PRD components
├── stories/                 # Development stories
└── [feature-docs].md       # Feature-specific documentation
```

## Configuration Files

### Build and Development:
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript compilation settings
- `vite.config.mjs`: Build tool configuration
- `eslint.config.js`: Code quality rules

### Deployment:
- `vercel.json`: Vercel platform configuration
- `supabase.json`: Supabase project settings

## Migration Management

Database schema changes and data migrations:

```
migrations/
├── 001_create_crm_tables.sql
├── 002_create_batch_management_tables.sql
└── [sequential_migrations].sql
```

### Migration Conventions:
- **Naming**: `{number}_{description}.sql`
- **Sequencing**: Zero-padded numbers for proper ordering
- **Scope**: One logical change per migration

## Testing Strategy

Co-located tests with clear organization:

```
__tests__/
├── [Component].test.tsx      # Component tests
├── [Service].test.ts         # Service layer tests
├── [Utility].test.ts         # Utility function tests
└── integration/              # Cross-component tests
```

### Test Organization:
- **Unit Tests**: Co-located with source files
- **Integration Tests**: Separate integration directory
- **Test Utilities**: Centralized in `src/test/`

## Import Path Conventions

### Relative Imports:
- Same directory: `./ComponentName`
- Parent directories: `../utils/helper`

### Absolute Imports (from src root):
- Components: `import { Component } from 'components/Component'`
- Services: `import { apiService } from 'services/api'`
- Types: `import type { Type } from 'types'`
- Utils: `import { helper } from 'utils/helper'`

## File Naming Conventions

### Components:
- **PascalCase**: `EggCounter.tsx`, `FeedTracker.tsx`
- **Descriptive**: Names reflect primary functionality

### Services:
- **PascalCase with suffix**: `FlockService.ts`, `AuthService.ts`
- **Domain-based**: Grouped by business domain

### Utilities:
- **camelCase**: `authApiUtils.ts`, `animationUtils.ts`
- **Purpose-focused**: Clear indication of utility purpose

### Types:
- **camelCase**: `index.ts`, `api.ts`, `crm.ts`
- **Domain-based**: Organized by functional area

## Environment Configuration

Environment-specific settings and secrets:

```
.env.local                   # Local development overrides
.env.example                 # Template for required variables
```

### Environment Variables:
- **VITE_**: Frontend environment variables
- **SUPABASE_**: Database and auth configuration
- **VERCEL_**: Deployment-specific settings

## Development Workflow

### Directory Creation:
1. Features get components and tests
2. New domains get service classes
3. Shared functionality goes to utils
4. Types are centralized by domain

### File Modification:
1. Update related tests
2. Update type definitions if needed
3. Update documentation for architectural changes
4. Ensure imports remain clean

## Integration Points

### Frontend-Backend:
- API calls through service layer only
- Consistent error handling via API types
- Type sharing between frontend and serverless functions

### Database Integration:
- Migrations for schema changes
- Type-safe database operations
- Consistent data modeling

## Security Considerations

### File Access:
- No sensitive data in source control
- Environment variables for secrets
- API keys in server-side functions only

### Type Safety:
- Strict TypeScript configuration
- Runtime validation for external data
- Type guards for API responses

---

This structure supports the current application architecture while providing clear patterns for future development. It emphasizes type safety, maintainability, and clear separation of concerns across the full stack.