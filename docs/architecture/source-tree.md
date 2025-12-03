# Chicken Manager - Source Tree Documentation

## Project Structure Overview

**Project Structure for Chicken Manager Application**

```
aplikacija/ (D:\Koke\Aplikacija\)
├── .bmad-core/                 # BMad task management system
│   ├── tasks/                  # Executable workflow tasks
│   ├── templates/              # Document templates
│   ├── checklists/             # Validation checklists
│   ├── data/                   # Reference data and preferences
│   └── utils/                  # BMad utilities
├── .claude/                    # Claude Code configuration
├── .git/                       # Git repository data
├── .netlify/                   # Netlify build cache (generated)
├── .vscode/                    # VS Code workspace settings
├── netlify/                    # Netlify serverless functions (Backend API)
│   └── functions/              # API endpoints (10 total)
│       ├── batchEvents.ts      # Flock batch lifecycle event tracking
│       ├── crud.ts             # Core CRUD operations for all entities
│       ├── customers.ts        # Customer management for egg sales CRM
│       ├── data.ts             # Main data aggregation endpoint (5-min cache)
│       ├── deathRecords.ts     # Bird death tracking and analysis
│       ├── debug-db.ts         # Database debugging utilities
│       ├── flockBatches.ts     # Flock batch management and lifecycle
│       ├── flockSummary.ts     # Flock productivity and health analytics
│       ├── sales.ts            # Egg sales transaction management
│       └── salesReports.ts     # Revenue analytics and customer reports
├── assets/                     # Legacy static assets (use public/ instead)
├── docs/                       # Comprehensive project documentation
│   ├── architecture/           # System and security architecture
│   ├── lemonsqueezy-subscription-architecture/  # Subscription system docs
│   ├── prd/                    # Product requirements documents
│   ├── stories/                # User stories and feature specifications
│   ├── api-documentation.md    # API endpoint documentation
│   ├── database-schema.md      # Database schema and migration history
│   ├── market-research.md      # Market analysis and customer insights
│   ├── performance.md          # Performance optimization guidelines
│   └── [various .md files]     # Feature-specific documentation
├── dist/                       # Vite build output (generated)
├── migrations/                 # Supabase database migrations
├── node_modules/               # NPM dependencies (generated)
├── public/                     # Static public assets served by Vite
├── src/                        # Frontend React application source
│   ├── components/             # React components (feature-based organization)
│   │   ├── features/           # Feature-based business logic components
│   │   │   ├── auth/           # Authentication (Auth.tsx, ProtectedRoute.tsx)
│   │   │   ├── crm/            # Customer relationship management (CRM.tsx, CustomerList.tsx)
│   │   │   ├── dashboard/      # Dashboard and event tracking (Dashboard.tsx, UpcomingEvents.tsx)
│   │   │   ├── eggs/           # Egg production tracking (EggCounter.tsx)
│   │   │   ├── expenses/       # Cost tracking (Expenses.tsx, Savings.tsx, Costs.tsx)
│   │   │   ├── feed/           # Feed management (FeedTracker.tsx, FeedCostCalculator.tsx)
│   │   │   ├── flock/          # Flock management (FlockBatchManager.tsx, BatchDetailView.tsx, etc.)
│   │   │   ├── profile/        # User profiles (ProfilePage.tsx, Profile.tsx, UserProfile.tsx)
│   │   │   ├── reports/        # Analytics and reporting (SalesReport.tsx)
│   │   │   └── sales/          # Sales transactions (SalesList.tsx, QuickSale.tsx)
│   │   ├── landing/            # Marketing and public pages
│   │   │   ├── animations/     # Animated PNG components (AnimatedChickenViabilityPNG.tsx, etc.)
│   │   │   ├── LandingPage.tsx # Main marketing landing page
│   │   │   └── LandingNavbar.tsx # Public navigation
│   │   ├── common/             # Shared application components
│   │   │   ├── ErrorBoundary.tsx        # Error handling boundary
│   │   │   ├── FeatureFlagProvider.tsx  # Feature flag management
│   │   │   └── PremiumFeatureGate.tsx   # Subscription feature gating
│   │   ├── ui/                 # Design system components
│   │   │   ├── cards/          # StatCard and analytics displays
│   │   │   ├── forms/          # Form inputs (TextInput, NumberInput, DateInput, etc.)
│   │   │   ├── layout/         # Navigation and page structure
│   │   │   ├── modals/         # Modal dialogs (FormModal, ConfirmDialog, etc.)
│   │   │   ├── tables/         # Data tables and grids
│   │   │   ├── timeline/       # Timeline components
│   │   │   └── [shared].tsx    # Reusable UI primitives
│   │   ├── onboarding/         # New user onboarding flow
│   │   ├── examples/           # Component examples and demos
│   │   └── __tests__/          # Component tests
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Supabase authentication state
│   │   ├── OptimizedDataProvider.tsx  # Intelligent data caching (5-min cache)
│   │   └── OnboardingProvider.tsx     # User onboarding progress tracking
│   ├── services/               # Service layer abstraction
│   │   └── api/                # API service with domain separation
│   │       ├── index.ts        # Main API service (data, flock, production, auth)
│   │       └── UserService.ts  # User-specific operations
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts            # Consolidated type definitions for flock, eggs, sales
│   ├── hooks/                  # Custom React hooks for data fetching
│   ├── utils/                  # Utility functions and helpers
│   ├── constants/              # Application constants
│   ├── test/                   # Test utilities and setup (Vitest + RTL)
│   ├── lib/                    # Third-party library configurations
│   ├── assets/                 # Component-specific assets
│   ├── App.tsx                 # Root application component with routing
│   ├── App.css                 # Application-wide styles
│   ├── main.tsx                # Application entry point with providers
│   ├── index.css               # Global CSS with Tailwind imports
│   └── vite-env.d.ts           # Vite environment type definitions
├── supabase/                   # Supabase local development configuration
├── CLAUDE.md                   # Claude Code development instructions
├── README.md                   # Project overview and setup guide
├── package.json                # Dependencies and development scripts
├── package-lock.json           # Exact dependency version lock
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # Application-specific TS config
├── tsconfig.node.json          # Node.js tooling TS config
├── vite.config.mjs             # Vite build configuration
├── netlify.toml                # Netlify deployment and function config
├── supabase.json               # Supabase project configuration
├── eslint.config.js            # ESLint code quality rules
├── postcss.config.js           # PostCSS and Tailwind processing
├── index.html                  # HTML entry point for Vite
└── [backup-*.js/.ps1/.md]      # Database backup and recovery utilities
```

## Business Context

### Application Overview
**Chicken Care** is a comprehensive flock management application targeting the $20-60M addressable market of tech-savvy chicken keepers, including:

- **Urban Homesteaders**: Millennials/Gen-Z professionals pursuing self-sufficiency (primary segment)
- **Suburban Families**: Parents using chickens for education and food production
- **Small-Scale Commercial**: Semi-commercial operations selling eggs locally
- **Retirement Hobbyists**: Empty nesters pursuing fulfilling retirement activities

### Core Value Proposition
"Complete modern solution for data-driven chicken keeping" - differentiating through:
- Integrated CRM for egg sales (unique market gap)
- Modern UX leadership in stagnant competitive landscape
- Intelligent data caching reducing API calls by 85%
- Community-driven features for knowledge sharing

## Technical Architecture

### Architecture Patterns
- **Authentication-First Design**: All features require user authentication with Row Level Security
- **Intelligent Data Caching**: 5-minute cache duration with background refresh via DataContext
- **Unified API Service Layer**: Domain-separated services (data, production, flock, auth)
- **Serverless Backend**: Netlify functions for automatic scaling and cost optimization (30s timeout, 1GB memory)

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with custom design tokens
- **Animations**: Framer Motion
- **Charts**: Recharts for production analytics
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with JWT tokens
- **Deployment**: Netlify (serverless functions, migrated October 2025)

### Key Data Models
- **FlockProfile**: Farm details, bird counts (hens, roosters, chicks, brooding)
- **FlockEvent**: Timeline events (acquisition, laying_start, broody, hatching, other)
- **EggEntry**: Daily egg production with date tracking
- **Customer**: Customer information for egg sales CRM
- **Sale**: Egg sales with customer relationships and pricing
- **Expense**: Categorized expense tracking (feed, equipment, veterinary)

## Directory Structure Rationale

### Backend API Organization (`/netlify/functions`)
Organized by chicken keeping workflows rather than technical patterns:
- **Data Aggregation**: `data.ts` provides single endpoint for dashboard (reduces API calls by 85%)
- **Flock Management**: `flockBatches.ts`, `flockSummary.ts`, `batchEvents.ts`
- **Production Tracking**: Core egg production and feed management
- **Business Operations**: `sales.ts`, `customers.ts`, `salesReports.ts`
- **Health Monitoring**: `deathRecords.ts` for responsible animal care
- **Development Tools**: `debug-db.ts` for database debugging

**Migration Note**: All 10 functions successfully migrated from Vercel to Netlify (October 2025) with improved timeout limits and zero breaking changes to frontend.

### Frontend Structure (`/src`)
- **Feature-Based Architecture**: Components organized by business domain (auth, crm, dashboard, eggs, expenses, feed, flock, profile, reports, sales)
- **Component Hierarchy**: 
  - `features/` - Domain-specific business logic components
  - `landing/` - Marketing and public-facing pages with animations
  - `common/` - Shared application components (error boundaries, feature flags)
  - `ui/` - Reusable design system primitives (forms, modals, cards, tables)
  - `onboarding/` - User onboarding flows
- **Context Providers**: Authentication, data caching, and onboarding state management
- **Service Layer**: API abstraction with domain separation
- **Type Safety**: Consolidated TypeScript definitions for all business entities

### Documentation Strategy (`/docs`)
Comprehensive documentation supporting AI-driven development:
- **Architecture**: System design and technical decisions
- **Market Research**: Customer insights and competitive analysis
- **Stories**: Feature specifications and user requirements
- **API Documentation**: Endpoint specifications and usage examples

## Development Workflow

### Key Commands
- **Development**: `netlify dev` (recommended for full API support with Netlify functions)
- **Alternative Dev**: `npm run dev` (Vite only, API functions won't work)
- **Build**: `npm run build`
- **Testing**: `npm test` (Vitest with jsdom environment)
- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`

### Security Architecture
- **Row Level Security**: All database tables enforce user data isolation
- **Authentication Required**: All API endpoints validate JWT tokens
- **No Client-Side Secrets**: Service role key used only in backend functions

### Performance Optimizations
- **Intelligent Caching**: DataContext reduces API calls by 85%
- **Memoized Calculations**: Complex analytics cached in components
- **Optimistic Updates**: Instant UI feedback for better user experience
- **Background Refresh**: Data stays current without user intervention

## Platform Migration History

### Netlify Migration (October 2025)
- ✅ Successfully migrated all 10 serverless functions from Vercel to Netlify
- ✅ Improved function timeout: 10s → 30s (3x improvement)
- ✅ Zero breaking changes to frontend due to unified API service layer abstraction
- ✅ Maintained identical functionality with better performance characteristics
- ✅ Updated configuration: `vercel.json` → `netlify.toml`
- ✅ API base URL: `/api` → `/.netlify/functions`

**Migration Benefits**:
- Better free tier timeout limits for complex operations
- Same memory allocation (1GB) and bandwidth (100GB)
- Cleaner configuration with explicit `netlify.toml`
- Seamless developer experience with `netlify dev`

## Component Organization Principles

### Feature-Based Architecture (November 2025 Reorganization)
Components are organized by business domain rather than technical function, improving:
- **Developer Navigation**: Related components grouped together by feature
- **Code Maintenance**: Changes to a feature are localized to one directory
- **Import Clarity**: Clear import paths show component relationships
- **Scalability**: New features can be added without restructuring

### Component Categories
1. **Features** (`features/`): Domain-specific components with business logic
2. **Landing** (`landing/`): Public marketing pages and animations
3. **Common** (`common/`): Shared application utilities (error handling, feature flags)
4. **UI** (`ui/`): Reusable design system components without business logic
5. **Onboarding** (`onboarding/`): User setup and introduction flows

### Import Path Patterns
- Features → Types: `import type { FlockBatch } from '../../../types'`
- Features → Services: `import { apiService } from '../../../services/api'`
- Features → UI Components: `import { FormCard } from '../../ui/forms/FormCard'`
- Features → Common: `import { ErrorBoundary } from '../../common/ErrorBoundary'`

---

*This source tree reflects the current state of Chicken Manager as a modern, full-stack chicken care application built for the growing market of data-driven chicken keepers seeking integrated tracking, financial management, and customer relationship tools. Last updated: November 2025 (Feature-based component reorganization).*