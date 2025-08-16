# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Development Server
```bash
# Recommended for full API support (Vercel functions)
npx vercel dev

# Alternative using Vite only (no API support)
npm run dev
```

### Build and Test
```bash
# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test                 # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:ui         # Run tests with Vitest UI
npm run test:coverage   # Run tests with coverage
```

### Preview
```bash
npm run preview         # Preview production build
```

## Project Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with custom design tokens
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (serverless functions)

### Core Architecture Patterns

#### 1. Authentication-First Design
All features require user authentication. Every data operation is user-scoped with Row Level Security (RLS) policies at the database level. The app uses Supabase Auth with JWT tokens that auto-refresh every hour.

#### 2. Intelligent Data Caching (DataContext)
The app uses a sophisticated caching system via `DataContext.tsx`:
- **5-minute cache duration** with background refresh
- **85% reduction** in API calls through shared data state
- **Optimistic updates** for instant UI responses
- **Single API call** (`/api/getData`) shared across all components
- **Automatic cache invalidation** when data becomes stale

#### 3. Unified API Service Layer
Located in `src/services/api/`, this provides:
- **Domain separation**: `apiService.data`, `apiService.production`, `apiService.flock`, `apiService.auth`
- **Consistent error handling** and authentication headers
- **Type-safe interfaces** using consolidated types from `src/types/` (Story 3.1 complete)
- **Legacy compatibility** layer for migration

#### 4. Component Organization
- **Main navigation**: Dashboard, Profile, Production (EggCounter), CRM, Expenses, Feed Management, Savings, Calculators
- **Authentication flow**: AuthContext → ProtectedRoute → DataProvider → MainApp
- **Responsive design**: Desktop sidebar + mobile bottom dock navigation

### Key Data Models

#### Flock Management
- `FlockProfile`: Farm details, bird counts (hens, roosters, chicks, brooding)
- `FlockEvent`: Timeline events (acquisition, laying_start, broody, hatching, other)

#### Production Tracking
- `EggEntry`: Daily egg production with date tracking
- `FeedEntry`: Feed inventory with consumption tracking
- `Expense`: Categorized expense tracking (feed, equipment, veterinary, other)

#### Customer Relationship Management
- `Customer`: Customer information with contact details
- `Sale`: Egg sales with customer relationships and pricing
- `SalesSummary`: Revenue analytics and free egg tracking

### File Structure Essentials

```
src/
├── components/           # React components (main features)
├── contexts/            # AuthContext, DataContext (caching system)
├── services/api/        # Unified API service layer
├── hooks/              # Specialized data hooks and utilities
├── types/              # TypeScript definitions (consolidated & organized)
├── utils/              # Utility functions
├── design-system/      # Design tokens and shared styles
└── test/              # Test utilities and setup

api/                    # Vercel serverless functions
docs/                   # Comprehensive documentation
migrations/             # Database schema migrations
```

### Environment Configuration

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Security Architecture

- **Row Level Security (RLS)** on all database tables
- **User data isolation**: All tables include `user_id` with enforced access policies
- **Authentication required**: All API endpoints validate JWT tokens
- **No client-side secrets**: Service role key used only in backend functions

### Performance Optimizations

The app implements several performance strategies:
- **Intelligent caching** reduces API calls by 85%
- **Memoized calculations** for complex analytics
- **Optimistic UI updates** for instant feedback
- **Background data refresh** maintains current information
- **Lazy loading** for non-critical components

### Testing Strategy

- **Vitest** for unit testing with jsdom environment
- **React Testing Library** for component testing
- **MSW** for API mocking in tests
- **Coverage reporting** with v8 provider
- Test setup in `src/test/setup.ts`

### Development Guidelines

- **Type-safe everything**: Comprehensive TypeScript coverage
- **User data isolation**: Always consider multi-user data security
- **Cache-aware updates**: Use DataContext for data mutations
- **Authentication headers**: All API calls require proper auth
- **Consistent error handling**: Use unified API service patterns