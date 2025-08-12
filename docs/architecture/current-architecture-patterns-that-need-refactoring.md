# Current Architecture Patterns That Need Refactoring

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

**✅ Story 2.1 Complete - Form Component Library Extracted**:

**Form Pattern Refactoring Status**:
- **✅ EggCounter.tsx** - 562 lines → Now uses shared form components (DateInput, NumberInput, SubmitButton)
- **✅ Profile.tsx** - 1039 lines → Both batch management and event timeline forms migrated to shared components
- **✅ Expenses.tsx** - 462 lines → Expense form converted to use shared form layout patterns
- **✅ FeedTracker.tsx** - 612 lines → Updated to use shared validation hooks and form components

**Benefits Achieved**:
- Eliminated duplicate form validation logic across 4 major components
- Standardized form styling and error message handling
- Created reusable form component library with 9 components and validation hooks
- 24 comprehensive tests ensuring form behavior consistency

**Remaining Large Components** (Future Epic 2 Stories):

| Component | Lines | Primary Issues | Form Status |
|-----------|-------|----------------|-------------|
| Profile.tsx | 1039 | Multiple responsibilities, data display, API calls | ✅ Forms extracted |
| FlockBatchManager.tsx | 886 | Complex batch management, multiple forms, table handling | Needs extraction |
| FeedCostCalculator.tsx | 652 | Calculator logic, form handling, data visualization | Needs extraction |
| ChickenViability.tsx | 618 | Complex calculations, multiple forms, results display | Needs extraction |
| FeedTracker.tsx | 612 | Inventory management, data display | ✅ Forms extracted |
| EggCounter.tsx | 562 | Production tracking, statistics | ✅ Forms extracted |

### 3. Type System Issues (Epic 3 Target)

**Current Problems**:
- Mixed 'any' types in API functions
- Database types vs Application types confusion
- Missing type guards for runtime validation
- Inconsistent interface naming patterns

**Files needing type refactoring**:
- `src/types/index.ts` - Good foundation but needs organization
- ✅ `src/utils/authApiUtils.ts` - **COMPLETED**: All 'any[]' parameters replaced with proper interfaces (Story 1.2)
- Component props - Many implicit any types

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
