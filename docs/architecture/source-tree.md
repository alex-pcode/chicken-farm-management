# Source Tree and Module Organization

### Project Structure (Actual)

```text
D:\Koke\Aplikacija/
├── src/
│   ├── components/          # 25 React components (many now using shared form library)
│   │   ├── forms/           # ✅ NEW: Shared form component library (Story 2.1 Complete)
│   │   │   ├── TextInput.tsx      # Reusable text input with validation
│   │   │   ├── NumberInput.tsx    # Number input with constraints
│   │   │   ├── DateInput.tsx      # Standardized date picker
│   │   │   ├── SelectInput.tsx    # Dropdown select component
│   │   │   ├── TextareaInput.tsx  # Multi-line text input
│   │   │   ├── FormCard.tsx       # Card wrapper for form sections
│   │   │   ├── FormRow.tsx        # Horizontal layout component
│   │   │   ├── FormGroup.tsx      # Form grouping component
│   │   │   ├── SubmitButton.tsx   # Standardized submit button
│   │   │   ├── index.ts           # Barrel export for form components
│   │   │   └── __tests__/         # Comprehensive form component tests
│   │   │       ├── TextInput.test.tsx      # 8 test cases
│   │   │       ├── NumberInput.test.tsx    # 8 test cases
│   │   │       └── useFormValidation.test.ts # 8 test cases
│   │   ├── Profile.tsx      # 1039 lines - ✅ MIGRATED: Now uses shared form components
│   │   ├── FlockBatchManager.tsx # 886 lines - Complex batch management
│   │   ├── FeedCostCalculator.tsx # 652 lines - Calculator logic
│   │   ├── EggCounter.tsx   # 562 lines - ✅ MIGRATED: Uses shared form components
│   │   ├── Expenses.tsx     # 462 lines - ✅ MIGRATED: Uses shared form components
│   │   ├── FeedTracker.tsx  # 612 lines - ✅ MIGRATED: Uses shared form components
│   │   └── [20+ other components]
│   ├── contexts/            # React contexts for auth and data
│   │   ├── AuthContext.tsx  # Supabase auth integration
│   │   └── DataContext.tsx  # Intelligent caching system (5-min cache)
│   ├── hooks/               # ✅ NEW: Shared React hooks (Story 2.1 Complete)
│   │   ├── useFormValidation.ts # Form validation hook with error handling
│   │   ├── useFormState.ts      # Form state management hook
│   │   └── useSimpleValidation.ts # Simplified validation for specific forms
│   ├── services/            # ✅ NEW: Unified API service layer (Epic 1 Complete)
│   │   └── api/             # Centralized API services with domain separation
│   │       ├── BaseApiService.ts    # Common HTTP methods and authentication
│   │       ├── AuthService.ts       # Authentication and token management
│   │       ├── DataService.ts       # General data operations
│   │       ├── ProductionService.ts # Egg and feed operations
│   │       ├── FlockService.ts      # Flock management operations
│   │       ├── types.ts             # API service type definitions
│   │       ├── index.ts             # Unified service exports
│   │       └── __tests__/           # Comprehensive unit tests
│   ├── utils/               # Utility functions (API logic migrated to services)
│   │   ├── authApiUtils.ts  # ✅ MIGRATED: Functions moved to API services
│   │   ├── apiUtils.ts      # ✅ MIGRATED: Consolidated patterns in services
│   │   ├── validation.ts    # ✅ NEW: Validation utilities and app-specific validators
│   │   └── supabase.ts      # Supabase client setup
│   ├── types/               # Type definitions - Enhanced with form types
│   │   ├── index.ts         # Main types + ValidationError interface
│   │   └── crm.ts           # CRM-specific types
│   └── assets/              # Static assets and styling
├── api/                     # Vercel serverless functions
│   ├── getData.ts           # Main data endpoint
│   ├── saveEggEntries.ts    # Production data saving
│   ├── saveExpenses.ts      # Expense data saving
│   └── [10+ other endpoints]
├── docs/                    # Documentation and planning
│   ├── prd.md               # Structural refactoring PRD
│   ├── database-schema.md   # Database documentation
│   └── [other docs]
├── migrations/              # Database migrations
└── public/                  # Static assets
```

### Key Modules and Their Purpose

- **Authentication Flow**: `src/contexts/AuthContext.tsx` + `src/components/Auth.tsx` - Supabase integration
- **Data Management**: `src/contexts/DataContext.tsx` - Intelligent 5-minute caching, ✅ NOW USES unified API services
- **Production Tracking**: `src/components/EggCounter.tsx` - Daily egg logging, 562 lines
- **Financial Management**: `src/components/Expenses.tsx` + `src/components/Savings.tsx` - Cost tracking
- **Flock Management**: `src/components/Profile.tsx` (1039 lines) - CRITICAL refactoring target
- **CRM System**: `src/components/CRM.tsx` + related components - Customer management
- **Feed Management**: `src/components/FeedTracker.tsx` (612 lines) - Inventory tracking
