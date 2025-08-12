# PRD-Specific Refactoring Impact Analysis

### Epic 1: API Layer Consolidation - Impact Analysis

**Files That Will Need Modification**:
- `src/utils/authApiUtils.ts` - Expand into centralized service layer
- `src/contexts/DataContext.tsx` - Update to use new API layer
- All components with `saveToDatabase` functions (EggCounter, Expenses, FeedTracker, etc.)

**New Architecture**:
- Single API service layer with domain-specific methods
- Consistent error handling and type safety
- Centralized authentication token management

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

### Epic 4: Shared UI Components - Impact Analysis

**Common Patterns to Extract**:
- Form input components (duplicated across 10+ components)
- Table/list display patterns
- Modal and dialog components
- Stat card displays (used in Dashboard, individual components)
- Pagination logic (EggCounter, others)

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
