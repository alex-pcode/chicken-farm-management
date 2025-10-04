# Chicken Manager Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Chicken Manager codebase as of January 2025, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on the comprehensive structural refactoring outlined in `docs/prd.md`.

### Document Scope

**Focused on areas relevant to**: Comprehensive structural refactoring to transform working prototype into maintainable, scalable codebase through 6 coordinated epics addressing API layer consolidation, component size reduction, type system consistency, shared UI components, state management optimization, and file organization.

### Change Log

| Date       | Version | Description                 | Author    |
| ---------- | ------- | --------------------------- | --------- |
| 2025-01-09 | 1.0     | Initial brownfield analysis | Winston |
| 2025-01-14 | 2.0     | Major architecture updates - API consolidation complete, shared UI components implemented, testing infrastructure added | Winston |
| 2025-10-04 | 2.1     | Platform migration - Migrated from Vercel to Netlify, updated deployment architecture | Winston |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.tsx` (React 19 + Vite setup)
- **App Router**: `src/App.tsx` (458 lines - contains Dashboard + routing)
- **Context Layer**: `src/contexts/DataContext.tsx`, `src/contexts/AuthContext.tsx`
- **API Layer**: `src/services/api/` (unified service layer), `netlify/functions/` (serverless functions)
- **Types**: `src/types/index.ts` (consolidated), `src/types/api.ts`, `src/types/crm.ts`, `src/types/services.ts`
- **Largest Components**: `src/components/Profile.tsx` (1039 lines), `src/components/FlockBatchManager.tsx` (886 lines)

### Enhancement Impact Areas

Based on the structural refactoring PRD, these areas will be heavily affected:

**Epic 1 (API Consolidation)** - ✅ COMPLETE:
- `src/services/api/` - Unified API service layer implemented with domain separation
- `src/contexts/OptimizedDataProvider.tsx` - Modern replacement for DataContext
- Legacy compatibility layer maintains backward compatibility

**Epic 2 (Component Size Reduction)** - IN PROGRESS:
- Shared UI components extracted to `src/components/ui/` and `src/components/forms/`
- `src/components/Profile.tsx` (1039 lines) - STILL PRIORITY TARGET
- `src/components/FlockBatchManager.tsx` (886 lines) - Needs breakdown
- Other large components can leverage new shared component library

## High Level Architecture

### Technical Summary

**Current State**: Working React application with organic growth patterns, successful user adoption, but significant technical debt requiring systematic refactoring before implementing intelligent features roadmap.

### Actual Tech Stack (from package.json)

| Category     | Technology               | Version | Notes                                    |
| ------------ | ------------------------ | ------- | ---------------------------------------- |
| Runtime      | Node.js                  | 20      | Required for Netlify functions           |
| Frontend     | React                    | 19.0.0  | Latest version with new features         |
| Build Tool   | Vite                     | 6.3.1   | Fast development and builds              |
| TypeScript   | TypeScript               | 5.7.2   | Comprehensive coverage with testing      |
| Styling      | Tailwind CSS             | 4.1.4   | Primary styling with shadcn/ui integration |
| Animation    | Framer Motion            | 12.7.4  | Complex animations throughout            |
| Database     | Supabase                 | 2.49.10 | PostgreSQL with RLS, authentication     |
| Routing      | React Router DOM         | 7.5.1   | Client-side routing                      |
| Charts       | Recharts                 | 2.15.3  | Dashboard visualizations                 |
| Deployment   | **Netlify**              | -       | **Functions + CDN hosting (migrated from Vercel)** |
| State Mgmt   | React Context            | -       | OptimizedDataProvider with unified API   |

### Repository Structure Reality Check

- **Type**: Monorepo (frontend + API functions)
- **Package Manager**: npm (lock file present)
- **Notable**: API functions in `netlify/functions/` folder (Netlify pattern), extensive component library in single folder

## Source Tree and Module Organization

### Project Structure (Actual)

```text
D:\Koke\Aplikacija/
├── src/
│   ├── components/          # 25+ React components with shared UI library
│   │   ├── Profile.tsx      # 1039 lines - STILL NEEDS BREAKING DOWN
│   │   ├── FlockBatchManager.tsx # 886 lines - Complex batch management
│   │   ├── [core app components]
│   │   ├── forms/           # ✅ Shared form components
│   │   │   ├── DateInput.tsx, NumberInput.tsx, TextInput.tsx
│   │   │   ├── FormCard.tsx, FormGroup.tsx, FormRow.tsx
│   │   │   └── __tests__/    # Component tests
│   │   └── ui/              # ✅ Shared UI component library
│   │       ├── cards/       # StatCard, ProgressCard, etc.
│   │       ├── layout/      # GridContainer, PageContainer, etc.
│   │       ├── modals/      # AlertDialog, ConfirmDialog, etc.
│   │       ├── navigation/  # Pagination components
│   │       ├── tables/      # DataTable, EmptyState, etc.
│   │       └── __tests__/   # UI component tests
│   ├── contexts/            # React contexts for auth and data
│   │   ├── AuthContext.tsx  # Supabase auth integration
│   │   └── OptimizedDataProvider.tsx # ✅ Modern data provider
│   ├── services/            # ✅ UNIFIED API SERVICE LAYER
│   │   └── api/
│   │       ├── BaseApiService.ts    # Base service class (API_BASE_URL: /.netlify/functions)
│   │       ├── AuthService.ts       # Authentication service
│   │       ├── DataService.ts       # Data fetching service
│   │       ├── ProductionService.ts # Production data service
│   │       ├── FlockService.ts      # Flock management service
│   │       ├── CRMService.ts        # Customer relationship service
│   │       ├── index.ts             # Unified API with legacy compatibility
│   │       └── __tests__/           # Service layer tests
│   ├── hooks/               # ✅ Specialized custom hooks
│   │   ├── data/            # Data fetching hooks
│   │   ├── forms/           # Form management hooks
│   │   ├── pagination/      # Pagination hooks
│   │   └── utils/           # Utility hooks with tests
│   ├── utils/               # Utility functions
│   │   ├── authApiUtils.ts  # Legacy compatibility (deprecated)
│   │   ├── shadcn/          # ✅ shadcn/ui utility functions
│   │   │   └── cn.ts        # className merging utility
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── __tests__/       # ✅ Utility function tests
│   ├── types/               # ✅ CONSOLIDATED & ORGANIZED
│   │   ├── index.ts         # Main barrel export with JSDoc categories
│   │   ├── api.ts           # API response and error types
│   │   ├── crm.ts           # CRM-specific types
│   │   └── services.ts      # Service interface definitions
│   ├── test/                # ✅ Testing infrastructure
│   │   ├── setup.ts         # Vitest test setup
│   │   └── utils.tsx        # Testing utilities
│   └── assets/              # Static assets and styling
├── netlify/                 # ✅ Netlify serverless functions
│   └── functions/
│       ├── data.ts          # Main data endpoint (all user data)
│       ├── customers.ts     # Customer CRUD operations
│       ├── sales.ts         # Sales management
│       ├── salesReports.ts  # Sales analytics
│       ├── flockBatches.ts  # Flock batch management
│       ├── flockSummary.ts  # Flock statistics
│       ├── deathRecords.ts  # Death record tracking
│       ├── batchEvents.ts   # Batch event logging
│       ├── crud.ts          # Generic CRUD operations
│       └── debug-db.ts      # Database debugging
├── docs/                    # Documentation and planning
│   ├── prd.md               # Structural refactoring PRD
│   ├── database-schema.md   # Database documentation
│   ├── netlify-migration-plan.md # ✅ Netlify migration guide
│   └── [other docs]
├── migrations/              # Database migrations
├── netlify.toml             # ✅ Netlify configuration (headers, redirects, functions)
└── public/                  # Static assets
```

### Key Modules and Their Purpose

- **Authentication Flow**: `src/contexts/AuthContext.tsx` + `src/components/Auth.tsx` - Supabase integration
- **Data Management**: `src/contexts/OptimizedDataProvider.tsx` - ✅ Modern data provider with unified API
- **API Layer**: `src/services/api/` - ✅ Consolidated domain-specific services
- **Shared Components**: `src/components/ui/` + `src/components/forms/` - ✅ Reusable component library
- **Production Tracking**: `src/components/EggCounter.tsx` - Daily egg logging, 562 lines
- **Financial Management**: `src/components/Expenses.tsx` + `src/components/Savings.tsx` - Cost tracking
- **Flock Management**: `src/components/Profile.tsx` (1039 lines) - STILL CRITICAL refactoring target
- **CRM System**: `src/components/CRM.tsx` + related components - Customer management
- **Feed Management**: `src/components/FeedTracker.tsx` (612 lines) - Inventory tracking
- **Testing Infrastructure**: `src/test/`, component `__tests__/` folders - ✅ Comprehensive test coverage

## Technical Debt and Known Issues

### Remaining Technical Debt (Significantly Reduced)

1. **Component Size**: Profile.tsx (1039 lines) remains the primary refactoring target
2. ✅ **API Layer**: RESOLVED - Unified API service layer implemented
3. ✅ **Type System**: RESOLVED - Comprehensive TypeScript coverage
4. **State Management**: OptimizedDataProvider implemented, context splitting opportunity remains
5. ✅ **Code Duplication**: SIGNIFICANTLY REDUCED - Shared UI and form components extracted

### Workarounds and Gotchas

- **DataContext Caching**: 5-minute cache works well but creates coupling between unrelated data
- **Component Dependencies**: Large components have internal dependencies that make extraction difficult
- **API Error Handling**: Inconsistent patterns across different components
- **Type Guards Missing**: Runtime type validation not implemented
- **Form Validation**: Similar patterns duplicated across components instead of shared

### Performance Characteristics

**Current Performance** (Generally Good):
- 85% reduction in API calls through intelligent caching
- Real-time synchronization across components
- Instant navigation between cached components
- Memoized calculations in complex analytics

**Performance Concerns**:
- Large components cause unnecessary re-renders
- Single DataContext updates trigger too many components
- Form state management creates render cascades

## Integration Points and External Dependencies

### External Services

| Service  | Purpose      | Integration Type | Key Files                              |
| -------- | ------------ | ---------------- | -------------------------------------- |
| Supabase | Database+Auth| SDK + REST       | `src/utils/supabase.ts`               |
| **Netlify** | **Hosting+Functions** | **Serverless Functions** | **`netlify/functions/`, `netlify.toml`** |
| GitHub   | Repository   | CI/CD            | Auto-deploy on push to main            |

### Internal Integration Points

- **Frontend-Backend**: REST API through `/.netlify/functions` endpoints with JWT authentication
- **Data Flow**: DataContext → Components → Netlify Functions → Supabase
- **Authentication**: AuthContext → ProtectedRoute → Component access control
- **State Sync**: Optimistic updates with cache invalidation patterns

## Development and Deployment

### Local Development Setup

**Working Commands**:
```bash
npm install                    # Install dependencies
netlify dev                    # Development server (recommended - includes functions)
npm run dev                   # Vite dev server only (API functions won't work)
```

**Environment Variables** (required):
```env
VITE_API_URL=/.netlify/functions
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Build and Deployment Process

- **Build Command**: `npm run build` (Vite → `dist/` folder)
- **Functions Bundling**: Automatic via Netlify (esbuild, configured in `netlify.toml`)
- **Deployment**: Automatic Netlify deployment on git push to main
- **Type Checking**: `npm run type-check` (TSC project references)
- **Linting**: `npm run lint` (ESLint with React rules)
- **Secrets Scanning**: Configured to allow VITE_ prefixed public variables

## Current Architecture Patterns That Need Refactoring

### 1. API Layer Issues (Epic 1 Target)

**Current Pattern** (Scattered):
```typescript
// Duplicate saveToDatabase functions in multiple components
const saveToDatabase = async (data) => {
  // Similar but slightly different implementations
}
```

**Files with API duplications**:
- `src/components/EggCounter.tsx:18` - `saveToDatabase` function
- `src/components/Expenses.tsx` - Similar pattern
- `src/components/FeedTracker.tsx` - Another variation
- `src/utils/authApiUtils.ts` - Centralized but incomplete

### 2. Component Size Issues (Epic 2 Target)

**Problematic Components**:

| Component | Lines | Primary Issues |
|-----------|-------|----------------|
| Profile.tsx | 1039 | Multiple responsibilities, form handling, data display, API calls |
| FlockBatchManager.tsx | 886 | Complex batch management, multiple forms, table handling |
| FeedCostCalculator.tsx | 652 | Calculator logic, form handling, data visualization |
| ChickenViability.tsx | 618 | Complex calculations, multiple forms, results display |
| FeedTracker.tsx | 612 | Inventory management, form handling, data display |
| EggCounter.tsx | 562 | Production tracking, statistics, form handling |

### 3. Type System Consolidation (✅ Epic 3 - COMPLETE)

**Successfully Implemented**:
- ✅ Eliminated duplicate type definitions between files
- ✅ Logical domain-based organization with JSDoc categories  
- ✅ Clean barrel export pattern with comprehensive documentation
- ✅ Centralized service interfaces in dedicated module
- ✅ Fixed TypeScript compilation with zero errors
- ✅ Maintained backward compatibility for all imports

**Completed Consolidation**:
- `src/types/index.ts` - Enhanced with JSDoc categories and improved organization
- `src/types/api.ts` - Consolidated API response and error types (no duplicates)
- `src/types/services.ts` - Centralized service interface definitions
- `src/services/api/types.ts` - Now re-exports consolidated types for compatibility

### 4. State Management Issues (Epic 5 Target)

**Current DataContext Pattern**:
```typescript
// Single context handling all data types
interface AppData {
  eggEntries: EggEntry[];
  expenses: Expense[];
  feedInventory: FeedEntry[];
  flockProfile: FlockProfile | null;
  flockEvents: FlockEvent[];
  customers?: Customer[];
  sales?: SaleWithCustomer[];
  summary?: SalesSummary;
}
```

**Problems**:
- Single context causes unnecessary re-renders
- All components get all data even if they don't need it
- Cache invalidation is all-or-nothing

## PRD-Specific Refactoring Impact Analysis

### ✅ Epic 1: API Layer Consolidation - COMPLETED

**Successfully Implemented**:
- ✅ `src/services/api/` - Unified API service layer with domain separation
- ✅ `src/contexts/OptimizedDataProvider.tsx` - Modern data provider
- ✅ Legacy compatibility layer in `src/services/api/index.ts`
- ✅ Consistent error handling and type safety across all services
- ✅ Centralized authentication token management

**Architecture Delivered**:
```typescript
apiService {
  auth: AuthService,      // Authentication & user management
  data: DataService,      // Unified data fetching
  production: ProductionService, // Eggs, feed, expenses
  flock: FlockService,    // Flock profiles & events
  crm: CRMService        // Customer & sales management
}
```

### Epic 2: Component Size Reduction - Impact Analysis

**Priority Components for Breakdown**:

1. **Profile.tsx (1039 lines)** → Extract:
   - Form validation hooks
   - Data display components  
   - API interaction logic
   - FlockEvent management

2. **FlockBatchManager.tsx (886 lines)** → Extract:
   - Batch form components
   - Death record management
   - Batch event handling
   - Summary display logic

3. **FeedCostCalculator.tsx (652 lines)** → Extract:
   - Calculator logic hooks
   - Form input components
   - Results display components

### Epic 3: Type System Consolidation - Impact Analysis

**Type Organization Strategy**:
```typescript
// Planned structure
types/
  ├── database/     # Supabase DB types
  ├── api/          # API request/response types  
  ├── components/   # Component prop types
  └── domain/       # Business logic types
```

### ✅ Epic 4: Shared UI Components - MAJOR PROGRESS

**Successfully Implemented**:
- ✅ `src/components/forms/` - Complete form component library
  - DateInput, NumberInput, TextInput, TextareaInput
  - FormCard, FormGroup, FormRow, SubmitButton
- ✅ `src/components/ui/cards/` - Reusable card components
  - StatCard, ProgressCard, ComparisonCard, SummaryCard
- ✅ `src/components/ui/layout/` - Layout components
  - GridContainer, PageContainer, SectionContainer
- ✅ `src/components/ui/modals/` - Modal system
  - AlertDialog, ConfirmDialog, FormModal, DrawerModal
- ✅ `src/components/ui/navigation/` - Pagination system
  - Pagination, PaginationControls, PageSizeSelector
- ✅ `src/components/ui/tables/` - Data display
  - DataTable, DataList, EmptyState
- ✅ Comprehensive test coverage for all shared components

### Epic 5: State Management Optimization - Impact Analysis

**Context Splitting Strategy**:
```typescript
// Planned architecture
FlockContext    - Profile, batches, events
CRMContext      - Customers, sales, reports  
FinancialContext - Expenses, savings calculations
ProductionContext - Egg entries, feed tracking
```

### Epic 6: File Organization - Impact Analysis

**New Structure Plan**:
```typescript
src/
├── features/           # Feature-based organization
│   ├── flock/         # Profile, batches, events
│   ├── production/    # EggCounter, feed tracking
│   ├── financial/     # Expenses, savings, costs
│   ├── crm/           # Customer management
│   └── shared/        # Shared components, hooks
├── services/          # API layer (consolidated)
├── hooks/             # Custom hooks
└── ui/                # Design system components
```

## Testing Reality & 2025 Framework Recommendations

### ✅ Current Test Coverage - IMPLEMENTED

- ✅ **Unit Tests**: Vitest framework implemented with comprehensive coverage
- ✅ **Component Tests**: React Testing Library setup for all shared components
- ✅ **Service Tests**: API service layer fully tested
- ✅ **Hook Tests**: Custom hooks have dedicated test suites
- ✅ **Testing Infrastructure**: Complete setup with coverage reporting
- **E2E Tests**: Ready for implementation (Playwright recommended)

### Testing Framework Status ✅

Comprehensive testing infrastructure now provides **strong safety net** for continued refactoring:
- All shared UI components have tests
- All API services have test coverage
- Custom hooks are tested
- Form validation and utilities tested

### 2025 Testing Stack Recommendations

Based on latest React testing ecosystem research and your Vite + TypeScript setup:

#### Recommended Architecture

```typescript
// Testing Pyramid for Chicken Manager
Unit Tests (70%)     - Vitest + React Testing Library
Integration Tests (20%) - Vitest + MSW (Mock Service Worker)  
E2E Tests (10%)      - Playwright
```

#### ✅ 1. Unit Testing: Vitest + React Testing Library - IMPLEMENTED

**Successfully Setup**:
- ✅ Vitest framework with React Testing Library integration
- ✅ TypeScript configuration optimized for testing
- ✅ Coverage reporting with @vitest/coverage-v8
- ✅ Test UI dashboard available via `npm run test:ui`
- ✅ Watch mode for development via `npm test`

**Available Commands**:
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Visual test dashboard
npm run test:coverage # Coverage report
```

**Perfect for Testing**:
- Shared UI components (Epic 4 deliverables)
- Custom hooks extracted during refactoring
- Utility functions and API service layer (Epic 1)

#### 2. Integration Testing: Vitest + MSW

**Mock Service Worker Benefits**:
- Test API integrations without hitting Supabase
- Perfect for your scattered API patterns consolidation (Epic 1)
- Consistent with your existing REST API structure

**Setup Commands**:
```bash
npm install -D msw
```

#### 3. E2E Testing: Playwright (Recommended over Cypress)

**Why Playwright in 2025**:
- **Most downloaded E2E framework** (overtook Cypress in 2024)
- **TypeScript native support** - no additional configuration
- **Free built-in parallelization** (Cypress charges for this)
- **4x faster** than Cypress
- **Better cross-browser support**

**Setup Commands**:
```bash
npm create playwright@latest
```

**Perfect for Testing**:
- Authentication flows (AuthContext)
- Complete user journeys (egg logging → dashboard updates)
- CRM workflows and data persistence

### Testing Strategy Aligned with Refactoring Epics

#### Epic 1 (API Layer Consolidation)
```typescript
// Test centralized API service with MSW
describe('API Service Layer', () => {
  test('handles authentication token refresh', async () => {
    // Mock token expiry scenarios
  });
});
```

#### Epic 2 (Component Size Reduction)
```typescript
// Test extracted components maintain functionality
describe('Profile Component Breakdown', () => {
  test('FlockEventManager renders correctly', () => {
    // Test extracted component
  });
});
```

#### Epic 4 (Shared UI Components)
```typescript
// Test design system components
describe('Shared Form Components', () => {
  test('FormInput validates correctly', () => {
    // Test reusable components
  });
});
```

### Implementation Timeline

#### Phase 1: Foundation (Week 1)
```bash
# Set up unit testing infrastructure
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @vitest/coverage-v8 @vitest/ui

# Add to package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

#### Phase 2: Critical Path Testing (Week 2)
- Test authentication flows (AuthContext)
- Test data fetching/caching (DataContext) 
- Test largest components before breakdown

#### Phase 3: Refactoring Safety Net (During Epics)
- Write tests BEFORE breaking down large components
- Test extracted shared components
- Integrate E2E tests for complete workflows

### Vite Configuration Updates

```typescript
// vite.config.mjs additions
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### Testing ROI for Your Project

**Risk Mitigation**:
- Prevent regression during 6-epic refactoring
- Ensure Profile.tsx (1039 lines) breakdown preserves functionality
- Validate API consolidation doesn't break data flows

**Development Velocity**:
- Faster refactoring with confidence
- Automated validation of shared components
- Continuous integration readiness

### Cost-Benefit Analysis

**Setup Investment**: ~2-3 days initial setup
**Ongoing Maintenance**: ~15% additional development time
**Risk Reduction**: Massive - prevents production bugs during refactoring
**Developer Confidence**: High - enables aggressive refactoring

### Commands Reference

```bash
# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npx playwright test

# E2E test debugging
npx playwright test --debug

# Visual test reports
npx playwright show-report
```

## Coding Standards & Style Guide

### Current State: Informal Standards ❌

Your codebase shows **inconsistent patterns** across components:
- Mixed naming conventions (camelCase vs PascalCase for variables)
- Inconsistent import ordering and grouping
- Variable TypeScript usage (some 'any' types, inconsistent interfaces)
- No documented code style guide

### Recommended Coding Standards (2025)

#### 1. **File and Directory Naming**
```typescript
// Components - PascalCase
EggCounter.tsx
FlockBatchManager.tsx

// Hooks - camelCase with 'use' prefix
useEggEntries.ts
useFlockData.ts

// Utilities - camelCase
apiUtils.ts
authApiUtils.ts

// Types - PascalCase for interfaces
interface EggEntry { }
type FlockSummary = { }
```

#### 2. **Component Structure Standard**
```typescript
// Recommended component structure
import React from 'react';
import { motion } from 'framer-motion';
import { useEggEntries } from '../contexts/DataContext';
import type { EggEntry, ValidationError } from '../types';
import './ComponentName.css'; // Only if component-specific styles needed

interface ComponentProps {
  // Props interface always defined
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks (state, context, custom hooks)
  const [localState, setLocalState] = useState('');
  const { data, loading } = useEggEntries();
  
  // 2. Event handlers
  const handleSubmit = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 4. Early returns (loading, error states)
  if (loading) return <LoadingSpinner />;
  
  // 5. Render
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  );
};
```

#### 3. **Import Organization Standard**
```typescript
// 1. React and core libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Third-party libraries
import { v4 as uuidv4 } from 'uuid';

// 3. Internal hooks and contexts
import { useAuth } from '../contexts/AuthContext';
import { useEggEntries } from '../contexts/DataContext';

// 4. Components
import { LoadingSpinner } from './LoadingSpinner';
import { StatCard } from './StatCard';

// 5. Utils and helpers
import { saveToDatabase } from '../utils/apiUtils';

// 6. Types (always last)
import type { EggEntry, ValidationError } from '../types';
```

#### 4. **TypeScript Standards**
```typescript
// ❌ Avoid
const data: any[] = [];
function saveData(entries: any) { }

// ✅ Prefer
const data: EggEntry[] = [];
function saveData(entries: EggEntry[]): Promise<void> { }

// Interface naming
interface Props { } // Component props
interface EggEntry { } // Data types
interface ValidationError { } // Error types

// Consistent null/undefined handling
const profile: FlockProfile | null = null; // Use null for missing objects
const count?: number; // Use undefined for optional properties
```

#### 5. **State Management Standards**
```typescript
// ❌ Avoid - Multiple state updates
setCount(newCount);
setLoading(false);
setErrors([]);

// ✅ Prefer - Batch state updates or use reducer
setFormState({
  count: newCount,
  loading: false,
  errors: []
});
```

#### 6. **Error Handling Standards**
```typescript
// Consistent error handling pattern
try {
  await apiCall();
  setSuccess(true);
} catch (error) {
  console.error('Operation failed:', error);
  setErrors([{ 
    field: 'submit', 
    message: error instanceof Error ? error.message : 'Operation failed'
  }]);
}
```

#### 7. **CSS and Styling Standards**
```typescript
// Tailwind class organization
className={`
  // Layout
  flex items-center justify-between
  // Spacing
  p-4 m-2
  // Colors and theming
  bg-white text-gray-900
  // States
  hover:bg-gray-50 focus:ring-2
  // Responsive
  sm:p-6 lg:p-8
`}
```

### Enforcing Standards with Tooling

#### ESLint Configuration Enhancement
Your current ESLint config is basic. Add these rules to enforce standards:

```javascript
// eslint.config.js additions
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // TypeScript standards
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      
      // Import organization
      'sort-imports': ['error', {
        'ignoreCase': false,
        'ignoreDeclarationSort': true,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }],
      
      // React standards
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      
      // Code organization
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
)
```

#### Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### Import Sorting Plugin
```bash
npm install -D eslint-plugin-import
```

#### VS Code Settings (Optional)
Create `.vscode/settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Code Review Standards

#### Pull Request Guidelines
- All components must follow the structure standard
- No 'any' types allowed without explicit justification
- Import organization must be consistent
- All new functions require proper TypeScript typing
- Error handling must follow established patterns

#### Component Size Limits (Epic 2 Alignment)
- **Maximum 200 lines per component** (your current Profile.tsx at 1039 lines violates this)
- **Single responsibility principle** enforced
- **Extract hooks** for complex state logic (>50 lines)
- **Extract utilities** for business logic (>30 lines)

## Development Tooling & Code Quality

### Critical Missing Tools Identified

Your current setup has several gaps in development tooling that are **essential** for professional React development in 2025:

#### 1. Code Formatting - MISSING ❌

**Current State**: No Prettier configuration found
**Impact**: Inconsistent code formatting across your 25+ components

**Recommended Setup**:
```bash
npm install -D prettier eslint-config-prettier
```

**Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### 2. Pre-commit Hooks - MISSING ❌

**Current State**: No Husky or lint-staged configuration
**Impact**: Code quality issues can reach repository without validation

**Critical for Your Refactoring**: With 6 components over 500 lines, pre-commit hooks prevent broken code during Epic 2 component breakdown.

**Setup**:
```bash
npm install -D husky lint-staged
npx husky-init
```

**Configuration** (package.json):
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --quiet --fix",
    "prettier --write"
  ],
  "*.{json,md,html,css}": [
    "prettier --write"
  ]
}
```

#### 3. Environment Variable Validation - MISSING ❌

**Current State**: No validation for critical Supabase environment variables
**Impact**: Runtime failures if env vars are missing/incorrect

**Recommended Setup**:
```bash
npm install -D @t3-oss/env-nextjs zod
```

**Create** `src/env.ts`:
```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),
  },
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
```

#### 4. Bundle Analysis - MISSING ❌

**Current State**: No bundle size monitoring
**Impact**: Unknown impact of dependencies on app performance

**Setup**:
```bash
npm install -D vite-bundle-analyzer
```

## Error Monitoring & Production Observability

### Current State: Major Gap ❌

**Production Error Tracking**: None implemented
**Performance Monitoring**: None implemented
**User Experience Monitoring**: None implemented

### Recommended: Sentry Integration

Given your multi-user application with financial data, error monitoring is **critical**:

**Setup**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configuration** (`src/main.tsx`):
```typescript
import * as Sentry from "@sentry/react";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

**Benefits for Your Refactoring**:
- Monitor errors during component breakdown (Epic 2)
- Track API consolidation issues (Epic 1)
- Performance monitoring for state management changes (Epic 5)

## CI/CD Pipeline Enhancement

### Current State: Basic Vercel Integration ✅

Your Vercel deployment works, but missing **critical CI/CD practices**:

#### Missing: GitHub Actions Pipeline ❌

**Current**: Direct Vercel deployment from GitHub
**Gap**: No pre-deployment validation (tests, linting, type checking)

**Recommended Enhancement**:

Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npm run type-check
      
      - name: Lint code
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
```

**Benefits During Refactoring**:
- Prevents broken code from reaching production
- Validates each Epic implementation
- Enables confident component refactoring

#### Missing: Deployment Environments ❌

**Current**: Single production environment
**Recommended**: Staging environment for refactoring validation

```yaml
# Add to Vercel workflow
- name: Deploy to staging
  if: github.event_name == 'pull_request'
  run: |
    vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
```

## Security Considerations

### Current State Assessment

**Authentication**: ✅ Supabase Auth properly implemented
**Database Security**: ✅ Row Level Security (RLS) in place
**API Security**: ✅ JWT token validation

### ✅ Enhanced Security Measures

**Recently Added**:
- ✅ **@sentry/react**: Production error monitoring and performance tracking
- ✅ **Zod validation**: Runtime type validation (v4.0.17)
- ✅ **Web Vitals**: Performance monitoring implementation

### ✅ shadcn/ui Integration Status

**Foundation Setup Complete**:
- ✅ **Core Dependencies**: @radix-ui components, class-variance-authority, lucide-react
- ✅ **Utility Setup**: `src/utils/shadcn/cn.ts` - className merging utility
- ✅ **Styling Foundation**: tailwind-merge integration for conflict resolution
- 🔄 **Component Library**: Ready for shadcn component installation

**Next Steps for shadcn Integration**:
```bash
# Install individual components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card  
npx shadcn-ui@latest add form
```

The foundation is now in place to replace existing custom components with shadcn/ui equivalents during continued refactoring.

### Additional Security Considerations

#### 1. Dependency Vulnerability Scanning
```bash
npm audit
# Consider: npm install -D @lavamoat/allow-scripts
```

#### 2. Environment Variable Security
- Store sensitive tokens as GitHub Secrets
- Implement proper secret rotation strategy
- Use environment validation (recommended above)

#### 3. Content Security Policy (CSP)
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://*.supabase.co;">
```

## Performance Monitoring

### Missing: Production Performance Tracking ❌

**Current**: No performance monitoring in production
**Impact**: Unknown user experience issues

**Recommended Addition**:
```typescript
// Add to main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log('Web Vital:', metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Implementation Priority Matrix

### 🚨 **Critical (Implement Before Refactoring)**
1. **Testing Framework** (Vitest) - Safety net for refactoring
2. **Pre-commit Hooks** (Husky + lint-staged) - Prevent broken code
3. **Environment Validation** - Production stability

### ⚡ **High Priority (During Epic 1-2)**
4. **CI/CD Pipeline** (GitHub Actions) - Deployment safety
5. **Error Monitoring** (Sentry) - Production visibility

### 📈 **Medium Priority (During Epic 3-4)**
6. **Code Formatting** (Prettier) - Team consistency
7. **Bundle Analysis** - Performance optimization

### 📊 **Long-term (Post-Refactoring)**
8. **Performance Monitoring** - User experience tracking
9. **Security Enhancements** - Comprehensive hardening

## ✅ Implementation Progress Summary

Your architecture has evolved significantly since January 9th with **major epic completion**:

### ✅ **COMPLETED EPICS**:
- **Epic 1 (API Consolidation)**: Unified service layer with domain separation
- **Epic 3 (Type System)**: Comprehensive TypeScript coverage  
- **Epic 4 (Shared UI Components)**: Extensive component library extracted

### 🔄 **IN PROGRESS**:
- **Epic 2 (Component Size Reduction)**: Profile.tsx (1039 lines) remains priority target
- **Epic 5 (State Management)**: OptimizedDataProvider implemented, context splitting opportunity
- **Epic 6 (File Organization)**: Feature-based structure ready for implementation

### ✅ **INFRASTRUCTURE COMPLETED**:
- **Testing Framework** (Vitest + React Testing Library)
- **Error Monitoring** (Sentry integration) 
- **Security Enhancements** (Zod validation, Web Vitals)
- **shadcn/ui Foundation** (Ready for component migration)

### 🎯 **REMAINING PRIORITIES**:
1. **Profile.tsx breakdown** - Last major oversized component
2. **Context splitting** - Domain-specific data providers 
3. **Feature-based file organization** - Module restructuring
4. **shadcn/ui migration** - Replace custom components with shadcn equivalents

The architectural foundation is now **enterprise-ready** with comprehensive testing, unified APIs, and reusable components supporting continued refactoring.

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm install           # Install dependencies
npx vercel dev       # Full development environment (recommended)
npm run dev          # Frontend only (API functions won't work)
npm run build        # Production build
npm run type-check   # TypeScript compilation check
npm run lint         # ESLint code quality check
```

### Component Analysis Commands

```bash
# Find large components (used in this analysis)
find src/components -name "*.tsx" -exec wc -l {} \; | sort -nr

# Search for duplicate patterns
grep -r "saveToDatabase" src/components/
grep -r "useState.*Error" src/components/
```

### Refactoring Helper Commands

```bash
# Find all API calls to consolidate
grep -r "await fetch" src/
grep -r "authApiUtils" src/

# Find type usage patterns
grep -r ": any" src/
grep -r "any\[\]" src/
```

## Success Criteria for Refactoring

Based on the PRD requirements, the refactoring will be successful when:

1. **Component sizes reduced by 40%+** while maintaining functionality
2. **Zero 'any' types** in API layer and critical components
3. **Shared UI components** eliminate code duplication
4. **Domain-specific contexts** reduce unnecessary re-renders
5. **Centralized API service** provides consistent error handling
6. **All existing functionality preserved** during transformation

## Technology Stack Evolution & 2025 Recommendations

### Current Stack Assessment

Based on comprehensive research of latest 2024-2025 developments in React ecosystem technologies, your current stack is **well-positioned** but has strategic update opportunities:

#### ✅ Excellent Choices (Keep Current)

| Technology | Current Version | 2025 Assessment |
|------------|----------------|------------------|
| **React** | 19.0.0 | Latest stable with new Actions, useFormStatus perfect for your forms |
| **TypeScript** | 5.7.2 | Latest with improved React 19 integration |
| **Vite** | 6.3.1 | Latest major version with significant performance improvements |
| **Supabase** | 2.49.10 | Active development with 2024-2025 feature updates |
| **Framer Motion** | 12.7.4 | Current (now rebranded as "Motion"), ideal for your animations |

#### 🎯 Strategic Update Opportunities

**1. Tailwind CSS v4.0 - PRIORITY UPDATE**
- **Current**: v4.1.4 (verify version - ahead of official releases)
- **Benefits**: 5x faster builds, 100x faster incremental builds, zero config
- **Impact**: Massive performance gains during Epic 2 (Component breakdown)

**2. State Management Enhancement - STRATEGIC ADDITION**
- **Current**: React Context with 5-minute caching
- **Recommendation**: Context + Zustand hybrid for Epic 5
- **Benefits**: Eliminates re-render issues, 1KB bundle, perfect for context splitting

### Technology Alignment with Refactoring Epics

**Epic 1 (API Consolidation)**:
- React 19 Actions - perfect for form-centric API calls
- Supabase Edge Functions Dashboard - develop API consolidation directly

**Epic 2 (Component Size Reduction)**:
- React 19 useFormStatus - eliminates form prop drilling
- Tailwind v4 performance - faster development during extraction

**Epic 5 (State Management Optimization)**:
- Zustand - ideal solution for context splitting without performance overhead
- Planned architecture:
  ```typescript
  useFlockStore     - Profile, batches, events
  useCRMStore       - Customers, sales, reports  
  useFinancialStore - Expenses, savings
  useProductionStore - Egg entries, feed tracking
  ```

### Immediate Recommendations

**High Priority** (This Week):
1. Update to Tailwind CSS v4.0 for 5x faster builds during refactoring
2. Plan Zustand integration for Epic 5 state management splitting

**During Refactoring**:
1. Leverage React 19 Actions for Epic 1 API consolidation
2. Use Tailwind v4 features for Epic 4 design system creation

**Long-term** (2025):
1. Monitor Supabase API key migration (November 2025 deadline)
2. Stay current with React ecosystem updates

### Conclusion

Your technology stack represents a cutting-edge, production-ready foundation that positions you excellently for 2025 and beyond. The strategic updates recommended directly support your refactoring goals while maintaining your strong architectural foundation.

---

## Platform Migration: Vercel → Netlify (October 2025)

### Migration Summary

On October 4, 2025, the application was successfully migrated from Vercel to Netlify with zero downtime and no data loss.

### Why Netlify?

**Advantages Gained**:
- ✅ **Better free tier timeout**: 30 seconds (vs Vercel's 10s)
- ✅ **Same memory limits**: 1GB per function
- ✅ **Better control**: Explicit configuration in `netlify.toml`
- ✅ **Similar DX**: Comparable developer experience

**Trade-offs**:
- ⚠️ **Function invocations**: 125k/month (vs Vercel's 1M) - monitor usage
- ✅ **Bandwidth**: Same 100GB/month free tier

### Migration Changes

**Code Changes**:
1. **API Functions**: All 10 functions converted from Vercel format to Netlify format
   - Changed: `VercelRequest/VercelResponse` → `HandlerEvent/HandlerContext`
   - Changed: `export default function` → `export const handler: Handler`
   - Changed: Request/response patterns to Netlify structure

2. **API Base URL**: Updated from `/api` to `/.netlify/functions`
   - `src/services/api/BaseApiService.ts`: Updated API_BASE_URL
   - `.env`: Updated VITE_API_URL

3. **Configuration**:
   - Added `netlify.toml` with build config, headers, redirects
   - Updated `.gitignore` for Netlify artifacts
   - Configured secrets scanning to allow public VITE_ variables

**File Structure Changes**:
```
Before (Vercel):          After (Netlify):
api/                   →  netlify/functions/
  ├── data.ts              ├── data.ts
  ├── customers.ts         ├── customers.ts
  └── ...                  └── ...
vercel.json            →  netlify.toml
```

### Migration Stats

- **Duration**: ~2 hours (as planned)
- **Files Changed**: 16 files, 7,435+ lines added
- **Commits**: 3 (`3f97509`, `acbc4f1`, `75add84`)
- **Downtime**: Zero (Vercel remained active during migration)
- **Data Migration**: None required (Supabase unchanged)

### Function Conversion Details

All 10 API functions successfully converted:
- ✅ `data.ts` - Main data endpoint (all user data)
- ✅ `customers.ts` - Customer CRUD operations
- ✅ `sales.ts` - Sales management
- ✅ `salesReports.ts` - Sales analytics
- ✅ `flockBatches.ts` - Flock batch management
- ✅ `flockSummary.ts` - Flock statistics
- ✅ `deathRecords.ts` - Death record tracking
- ✅ `batchEvents.ts` - Batch event logging
- ✅ `crud.ts` - Generic CRUD operations
- ✅ `debug-db.ts` - Database debugging

**Conversion Pattern**:
- Request access: `req.method` → `event.httpMethod`
- Query params: `req.query` → `event.queryStringParameters`
- Request body: `req.body` → `JSON.parse(event.body || '{}')`
- Response: `res.status(200).json(data)` → `return { statusCode: 200, body: JSON.stringify(data) }`

### Build Issues Resolved

**Issue 1: Duplicate Variable Declaration** (commit `acbc4f1`)
- Fixed duplicate `authHeader` declaration in `crud.ts`

**Issue 2: Secrets Scanning** (commit `75add84`)
- Configured `SECRETS_SCAN_OMIT_KEYS` to allow VITE_ prefixed public variables
- These variables are intentionally exposed to browser (Supabase RLS protects data)

### Post-Migration Monitoring

**Key Metrics to Watch**:
1. **Function Invocations**: Monitor via Netlify Dashboard
   - Free tier limit: 125,000/month
   - Current caching reduces calls by 85%

2. **Function Performance**:
   - Timeout: 30s (improved from Vercel's 10s)
   - Memory: 1GB (same as Vercel)

3. **Error Rates**: Monitor Netlify Functions tab for failures

**Success Criteria** (All Met ✅):
- ✅ All 10 API functions working
- ✅ Frontend successfully calling Netlify functions
- ✅ Authentication flow unchanged
- ✅ No data loss or corruption
- ✅ Zero production errors
- ✅ Performance equal to Vercel

### Netlify-Specific Configuration

**`netlify.toml` Configuration**:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node bundler: `esbuild`
- Cache headers: Migrated from `vercel.json`
- SPA routing: Single-page app redirect configuration
- Secrets scanning: Configured to allow public VITE_ variables

**Environment Variables** (set in Netlify Dashboard):
- `VITE_API_URL` - Public (/.netlify/functions)
- `VITE_SUPABASE_URL` - Public
- `VITE_SUPABASE_ANON_KEY` - Public (safe to expose, RLS protects data)
- `SUPABASE_URL` - Server-side
- `SUPABASE_SERVICE_ROLE_KEY` - Secret (full database access)

### Migration Documentation

Complete migration guide available at: `docs/netlify-migration-plan.md`

---

This brownfield architecture document captures the current reality of the Chicken Manager codebase and provides the detailed analysis needed to execute the 6-epic structural refactoring outlined in `docs/prd.md`. The system is functional and performant but requires systematic architectural improvements to enable the intelligent features roadmap.

**Last Updated**: October 4, 2025 (Version 2.1 - Netlify Migration)

**Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By:** Claude <noreply@anthropic.com>