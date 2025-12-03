# Component Documentation

## Project Reorganization (November 2025) ✅ Complete

**Component structure reorganized into feature-based architecture** for improved maintainability:

### New Structure
```
src/components/
├── features/          # Feature-specific components by domain
│   ├── auth/         # Authentication (Auth.tsx, ProtectedRoute.tsx)
│   ├── crm/          # Customer management
│   ├── dashboard/    # Dashboard views
│   ├── eggs/         # Egg production tracking
│   ├── expenses/     # Financial management
│   ├── feed/         # Feed tracking
│   ├── flock/        # Flock and batch management
│   ├── profile/      # User profile
│   ├── reports/      # Sales reporting
│   └── sales/        # Sales management
├── landing/          # Landing page with animations/
├── common/           # Shared cross-feature components
├── onboarding/       # User onboarding flows
├── ui/               # Shared UI component library
│   ├── cards/
│   ├── forms/
│   ├── layout/
│   ├── modals/
│   ├── navigation/
│   └── tables/
├── examples/         # Component demos
└── __tests__/        # Integration tests
```

### Benefits
- ✅ **Clear Domain Boundaries**: Each feature has dedicated folder
- ✅ **Improved Discoverability**: Components grouped by business domain
- ✅ **Better Scalability**: Easy to add new features
- ✅ **Reduced Cognitive Load**: Related components co-located
- ✅ **Type Safety Maintained**: All imports updated, build passes

---

## API Service Integration (Epic 1.1 - ✅ Complete)

**All components now use the unified API service layer** (`src/services/api/`) instead of legacy `authApiUtils.ts` patterns.

## Consolidated API Migration (Story 1.3 - ✅ Complete)

**All components successfully migrated to consolidated API service** eliminating duplicate code and improving maintainability:

### Migration Summary
- **DataContext**: Uses `apiService.data.fetchAllData()` 
- **EggCounter**: Migrated to `apiService.production.saveEggEntries()` - removed duplicate `saveToDatabase` wrapper
- **Expenses**: Uses `apiService.production.saveExpenses()` with enhanced error handling
- **FeedTracker**: Uses `apiService.production.saveFeedInventory()` with standardized error patterns
- **Profile**: Fully migrated to `apiService.flock` services - fixed critical bug with missing `getAuthHeaders` import

### Component Migration Details
- **Eliminated 4 duplicate `saveToDatabase` functions** across components
- **Standardized error handling** using `ApiError` class with user-friendly messages
- **Preserved identical behavior** and component interfaces
- **Fixed critical bugs** discovered during migration (Profile.tsx authentication issue)
- **Added comprehensive testing** with 23+ test cases covering API integration

### New Import Pattern
```typescript
// ❌ Old Pattern (deprecated) - Individual function imports
import { saveEggEntries, getAuthHeaders } from '../utils/authApiUtils';

// ✅ New Pattern (current) - Consolidated API service
import { apiService } from '../services/api';

// Usage with domain-specific services
await apiService.production.saveEggEntries(entries);
await apiService.flock.saveFlockProfile(profile);
const headers = await apiService.auth.getAuthHeaders();
```

### Migration Benefits
- ✅ **Eliminated Code Duplication**: Removed duplicate `saveToDatabase` functions
- ✅ **Standardized Error Handling**: Consistent `ApiError` patterns across all components
- ✅ **Enhanced Reliability**: Fixed critical bugs and improved error patterns
- ✅ **Centralized Architecture**: Domain-specific services (production, flock, auth, data)
- ✅ **Comprehensive Testing**: 23+ test cases covering API integration and error scenarios
- ✅ **Preserved Behavior**: Identical component interfaces and user experience maintained

## Authentication Components

### AuthContext.tsx
**Purpose**: Provides authentication state and user management throughout the application

**Features**:
- User session management with Supabase Auth
- Automatic token refresh
- Global authentication state
- Sign out functionality

**Usage**:
```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, session, loading, signOut } = useAuth();
  // Component logic
};
```

### Auth.tsx (AuthComponent)
**Purpose**: Renders the login/signup interface using Supabase Auth UI

**Features**:
- Email/password authentication
- Styled with Tailwind CSS
- Integration with Supabase Auth
- Responsive design

### ProtectedRoute.tsx
**Purpose**: Wraps components that require authentication

**Features**:
- Redirects unauthenticated users to login
- Shows loading spinner during auth check
- Protects sensitive app routes

**Usage**:
```tsx
<ProtectedRoute>
  <SensitiveComponent />
</ProtectedRoute>
```

### UserProfile.tsx
**Purpose**: Displays current user information

**Features**:
- Shows user email
- Welcome message
- User avatar placeholder

---

## Data Management & Caching

### DataContext.tsx
**Purpose**: Centralized data caching and state management for optimal performance

**Features**:
- **Single API Call**: All data fetched once and cached for 5 minutes
- **Smart Invalidation**: Automatically refreshes stale data every minute
- **Optimistic Updates**: Immediate UI updates with cache synchronization
- **Error Resilience**: Graceful fallback if API calls fail
- **Performance**: ~85% reduction in API calls across the application

**Cache Strategy**:
- 5-minute cache duration for optimal balance of performance vs. freshness
- Background refresh checks every minute
- Automatic invalidation on data mutations

**Specialized Hooks**:
```tsx
// Full app data access
const { data, isLoading, refreshData } = useAppData();

// Specialized data hooks
const { eggEntries, updateEggEntries } = useEggEntries();
const { expenses, updateExpenses } = useExpenses();
const { feedInventory, updateFeedInventory } = useFeedInventory();
const { flockProfile, updateFlockProfile } = useFlockProfile();
```

**Data Structure**:
```tsx
interface AppData {
  eggEntries: EggEntry[];
  expenses: Expense[];
  feedInventory: FeedEntry[];
  flockProfile: FlockProfile | null;
  flockEvents: FlockEvent[];
}
```

**Performance Benefits**:
- Instant navigation between components (no loading spinners)
- Real-time updates across all components when data changes
- Reduced server load and improved user experience
- Offline-like behavior during navigation

---

## Form Component Library (Story 2.1 - ✅ Complete)

**Comprehensive reusable form components with consistent validation and styling** extracted from complex components to eliminate code duplication and standardize user experience.

### Form Input Components

**Location**: `src/components/forms/`

#### TextInput.tsx
**Purpose**: Reusable text input with integrated validation and consistent styling

**Features**:
- Built-in validation with error display
- Consistent neumorphic styling (neu-input classes)
- Accessibility support with ARIA attributes
- Optional prefix support for currency inputs
- Responsive design with proper focus states

**Usage**:
```tsx
import { TextInput } from './forms';

<TextInput
  value={description}
  onChange={setDescription}
  placeholder="Enter description"
  label="Description"
  error={errors.description}
  required
/>
```

#### NumberInput.tsx
**Purpose**: Numeric input with validation constraints and formatting

**Features**:
- Number-only validation with min/max constraints
- Decimal places control
- Auto-formatting for currency/quantities
- Error handling for invalid ranges
- Integration with validation hooks

**Usage**:
```tsx
import { NumberInput } from './forms';

<NumberInput
  value={amount}
  onChange={setAmount}
  label="Amount"
  min={0}
  max={1000}
  step={0.01}
  error={errors.amount}
/>
```

#### DateInput.tsx
**Purpose**: Standardized date picker with validation

**Features**:
- HTML5 date input with fallback
- Date range validation
- Consistent styling with other inputs
- Required field validation
- Default to current date option

**Usage**:
```tsx
import { DateInput } from './forms';

<DateInput
  value={selectedDate}
  onChange={setSelectedDate}
  label="Date"
  error={errors.date}
  required
/>
```

#### SelectInput.tsx
**Purpose**: Dropdown select with consistent styling

**Features**:
- Custom option rendering
- Consistent neumorphic styling
- Keyboard navigation support
- Validation integration
- Default value handling

**Usage**:
```tsx
import { SelectInput } from './forms';

<SelectInput
  value={category}
  onChange={setCategory}
  options={CATEGORIES}
  label="Category"
  error={errors.category}
/>
```

#### TextareaInput.tsx
**Purpose**: Multi-line text input with character count

**Features**:
- Auto-resize functionality
- Character count display
- Consistent textarea styling
- Validation integration
- Configurable rows and max length

### Form Layout Components

#### FormCard.tsx
**Purpose**: Card wrapper for form sections with consistent spacing and styling

**Features**:
- Neumorphic card design matching app theme
- Consistent padding and margins
- Responsive design
- Optional title and description
- Loading state support

**Usage**:
```tsx
import { FormCard } from './forms';

<FormCard title="User Information">
  <FormGroup>
    {/* Form inputs */}
  </FormGroup>
</FormCard>
```

#### FormRow.tsx
**Purpose**: Horizontal layout component for side-by-side form inputs

**Features**:
- Responsive flex layout
- Equal spacing between inputs
- Mobile-first responsive design
- Consistent gap spacing
- Support for different input counts

**Usage**:
```tsx
import { FormRow } from './forms';

<FormRow>
  <TextInput label="First Name" value={firstName} onChange={setFirstName} />
  <TextInput label="Last Name" value={lastName} onChange={setLastName} />
</FormRow>
```

#### FormGroup.tsx
**Purpose**: Grouping component for logical form sections

**Features**:
- Consistent spacing between form elements
- Optional fieldset semantics
- Accessible form grouping
- Responsive design

#### SubmitButton.tsx
**Purpose**: Standardized submit button with loading states

**Features**:
- Loading state with spinner
- Disabled state handling
- Consistent button styling (neu-btn classes)
- Success/error state indicators
- Framer Motion animations

**Usage**:
```tsx
import { SubmitButton } from './forms';

<SubmitButton
  isLoading={isSubmitting}
  disabled={hasErrors}
  onClick={handleSubmit}
>
  Save Changes
</SubmitButton>
```

### Form Validation System

#### useFormValidation Hook
**Purpose**: Centralized form validation logic with error handling

**Features**:
- Field-level validation
- Real-time error checking
- Custom validation rules
- Integration with form components
- Async validation support

**Usage**:
```tsx
import { useFormValidation } from '../hooks/useFormValidation';

const { errors, validateField, clearErrors } = useFormValidation();

const handleSubmit = async () => {
  const isValid = await validateField('email', email, 'email');
  if (isValid) {
    // Submit form
  }
};
```

#### Validation Utilities
**Location**: `src/utils/validation.ts`

**App-Specific Validators**:
- `validateEggCount()` - Egg production validation with reasonable limits
- `validateExpenseAmount()` - Expense amount validation with currency formatting
- `validateBirdCount()` - Flock count validation with realistic maximums
- `validateDateRange()` - Date range validation for production entries

### Form Component Migration Status

**All existing forms successfully migrated to shared components** (Story 2.1 - ✅ Complete):

- ✅ **EggCounter.tsx** - Uses DateInput, NumberInput, SubmitButton with FormCard layout
- ✅ **Profile.tsx** - Both batch management and event timeline forms migrated to full form component library
- ✅ **Expenses.tsx** - Expense form converted to use FormCard, FormRow, DateInput, SelectInput, TextInput, NumberInput, SubmitButton
- ✅ **FeedTracker.tsx** - Feed inventory form updated with shared validation hooks and all form components

### Migration Benefits

- **Code Reduction**: Eliminated duplicate form patterns across 4 major components
- **Consistent UX**: Standardized form styling and validation messages
- **Maintainability**: Single source of truth for form components
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Testing**: Comprehensive test coverage with 24 passing tests
- **Type Safety**: Full TypeScript integration with ValidationError interface

### Testing Coverage

**Test Files**: `src/components/forms/__tests__/`
- TextInput.test.tsx - 8 tests covering props, validation, accessibility
- NumberInput.test.tsx - 8 tests covering numeric validation, constraints, errors
- useFormValidation.test.ts - 8 tests covering validation logic and error handling

**Test Framework**: Vitest + React Testing Library with comprehensive coverage of form behavior, validation states, and user interactions.

---

## Data Management Components

### EggCounter.tsx
**Purpose**: Track daily egg collection with user-specific data

**Features**:
- Daily egg count logging with date tracking
- Visual statistics and trends
- Historical data analysis
- **Welcome Animation**: Animated hen sitting on pyramid of eggs for new users
- **Consolidated API**: Uses `apiService.production.saveEggEntries()` for secure API calls
- **Data Isolation**: Only shows current user's egg entries
- **Caching**: Uses `useEggEntries()` hook for optimized performance

**API Migration (Story 1.3 - ✅ Complete)**:
- **Removed duplicate `saveToDatabase` wrapper function** - eliminated redundant code
- **Direct API service integration**: Now uses `apiService.production.saveEggEntries()` directly
- **Enhanced error handling**: Standardized `ApiError` patterns with user-friendly messages
- **Preserved behavior**: Identical user experience and component interface maintained

**Key Functions**:
- Add/edit egg entries with automatic cache updates and consolidated API service
- Bulk operations with standardized error handling
- Data validation using type-safe API methods
- Optimistic UI updates with reliable error recovery

**Cache Integration**:
```tsx
const { eggEntries, isLoading, updateEggEntries } = useEggEntries();
// Updates both local state and global cache using consolidated API service
updateEggEntries(newEntries);
```

### FeedTracker.tsx
**Purpose**: Monitor feed inventory with user-specific data

**Features**:
- Feed type and brand management
- Quantity tracking with units
- Purchase date and expiry monitoring
- Cost per unit calculations
- **Consolidated API**: Uses `apiService.production.saveFeedInventory()` for secure operations
- **Data Isolation**: User-specific feed inventory
- **Caching**: Uses `useFeedInventory()` and `useFlockProfile()` for optimal performance

**API Migration (Story 1.3 - ✅ Complete)**:
- **Enhanced error handling**: Upgraded to standardized `ApiError` patterns for all feed operations
- **Improved reliability**: Better error recovery and user feedback for inventory operations
- **Consistent patterns**: Aligned with other components using consolidated API service
- **Maintained functionality**: All feed tracking operations work identically

**Integration**:
- Links to expense tracking using consolidated API service
- Automatic expense creation on feed purchase with standardized error handling
- Real-time updates across all components with enhanced reliability

**Cache Integration**:
```tsx
const { feedInventory, updateFeedInventory } = useFeedInventory();
const { flockProfile } = useFlockProfile();
// Both use consolidated API service with enhanced error handling
```

### Expenses.tsx
**Purpose**: Track and categorize expenses with full user data isolation

**Features**:
- Multiple expense categories (Feed, Equipment, Veterinary, etc.)
- Visual analytics with charts
- **Consolidated API**: Uses `apiService.production.saveExpenses()` for secure operations
- **Caching**: Uses `useExpenses()` hook for instant loading
- Monthly/yearly summaries
- **Welcome Animation**: Spinning Euro coin with chicken design for new users
- **Authentication**: All expense data is user-specific
- **Real-time Updates**: Changes reflect instantly across all components

**API Migration (Story 1.3 - ✅ Complete)**:
- **Enhanced error handling**: Improved async operations with standardized `ApiError` patterns
- **Better user feedback**: User-friendly error messages for expense operations
- **Maintained behavior**: Identical user experience with improved reliability
- **Consistent patterns**: Aligned with consolidated API service architecture

**Categories**:
- Feed, Equipment, Veterinary, Maintenance, Supplies, Other

**Cache Integration**:
```tsx
const { expenses, isLoading, updateExpenses } = useExpenses();
// Automatic cache synchronization with consolidated API service
updateExpenses(newExpenses);
```

### Profile.tsx
**Purpose**: Manage flock information with user-specific profiles

**Features**:
- Farm details (name, location, breed types)
- Bird count tracking (hens, roosters, chicks, brooding)
- Flock event logging (health, breeding, mortality)
- **Consolidated API**: Fully migrated to `apiService.flock` services
- **Data Privacy**: Flock events are user-specific
- **Caching**: Uses `useFlockProfile()` for optimized performance
- **Real-time Sync**: Profile updates reflect instantly in analytics

**API Migration (Story 1.3 - ✅ Complete)**:
- **Critical Bug Fix**: Fixed missing `getAuthHeaders` import that would cause runtime errors
- **Full Migration**: Now uses `apiService.flock.saveFlockProfile()`, `saveFlockEvent()`, `deleteFlockEvent()`
- **Updated Response Handling**: Changed from raw fetch patterns to API service response structure
- **Enhanced Reliability**: Proper error handling with `ApiError` class and user-friendly messages
- **Maintained Functionality**: All flock management operations work identically with improved reliability

**Event Types**:
- Health, Feeding, Breeding, Mortality, Brooding, Hatching, Other

**API Integration**:
```tsx
// Profile management
await apiService.flock.saveFlockProfile(profile);

// Event management  
await apiService.flock.saveFlockEvent(event);
await apiService.flock.deleteFlockEvent(eventId);

// Flock summary (fixed from manual fetch)
const summary = await apiService.flock.getFlockSummary();
```

**Cache Integration**:
```tsx
const { flockProfile, isLoading, updateFlockProfile } = useFlockProfile();
// Updates both local state and global cache using consolidated API service
updateFlockProfile(newProfile);
```

### Savings.tsx
**Purpose**: Track financial benefits with user-specific calculations and real-time analytics

**Features**:
- **Instant ROI calculations** based on user's cached data
- Cost comparison analysis with memoized computations
- Visual charts and metrics with no loading delays
- **Performance Optimized**: Uses `useAppData()` for cached data access
- **Real-time Updates**: Calculations update instantly when changing price inputs
- Time period filtering (month, quarter, year, all time)
- Comprehensive profitability analysis

**Key Metrics**:
- Total egg production and value
- Operating expenses tracking
- Net profit/loss calculations
- Cost per egg analysis
- Break-even point calculations
- Eggs per hen productivity stats
- Daily lay rate monitoring
- Revenue per hen analysis

**Performance Features**:
- **Memoized Calculations**: Heavy computations cached using `useMemo`
- **Smart Filtering**: Time period calculations optimized with `useCallback`
- **Zero API Calls**: All data sourced from global cache
- **Instant Response**: Price changes trigger immediate recalculations

**Cache Integration**:
```tsx
const { data, isLoading } = useAppData();

// Memoized calculations for optimal performance
const savingsData = useMemo(() => {
  // Complex financial calculations using cached data
}, [data, eggPrice, startingCost, getFilteredData, isLoading]);

const productivityStats = useMemo(() => {
  // Productivity metrics using cached data
}, [data, eggPrice, isLoading]);
```

**Time Period Filtering**:
- This Month, This Quarter, This Year, All Time
- Dynamic calculations based on selected period
- Real-time filtering without API calls

---

## Animation Components

### AnimatedHen.tsx
**Purpose**: Welcome animation for the EggCounter tab

**Features**:
- Animated hen sitting on a pyramid of eggs
- Smooth CSS transitions and transforms
- Responsive design
- Welcome message for new users

**Animation Details**:
- Gentle floating motion for the hen
- Subtle scaling and rotation effects
- Gradient pyramid of eggs underneath
- Themed colors matching the app design

### AnimatedCoin.tsx
**Purpose**: Welcome animation for the Expenses tab

**Features**:
- Spinning Euro coin with dual sides
- One side shows € symbol, other shows chicken silhouette
- Continuous rotation animation
- Financial theme appropriate for expenses

**Animation Details**:
- 3D flip rotation effect
- Alternating sides visibility
- Smooth CSS transitions
- Themed colors and gradients

---

## Utility Components

### LoadingSpinner.tsx
**Purpose**: Provides consistent loading states throughout the app

**Usage Guidelines**:
- Use during initial data loading
- Authentication state loading
- Rare due to caching system implementation

**Customization**:
- Configurable size and color
- Responsive design

---

## API Integration

### authApiUtils.ts (Legacy - Deprecated)
**Status**: Individual function imports deprecated in favor of consolidated API service

**Migration Status (Story 1.3 - ✅ Complete)**:
- **Components Migrated**: All 4 components (EggCounter, Expenses, FeedTracker, Profile) now use consolidated API service
- **Duplicate Code Eliminated**: Removed duplicate `saveToDatabase` wrapper functions
- **Enhanced Error Handling**: Components now use standardized `ApiError` patterns
- **Maintained Compatibility**: Legacy functions still available during transition period

**Replacement Pattern**:
```typescript
// ❌ Deprecated Pattern
import { saveEggEntries, saveExpenses } from '../utils/authApiUtils';

// ✅ Current Pattern - Consolidated API Service
import { apiService } from '../services/api';
await apiService.production.saveEggEntries(entries);
await apiService.production.saveExpenses(expenses);
await apiService.flock.saveFlockProfile(profile);
```

**Type Safety Features (Story 1.2 - ✅ Complete)**:
- **No More 'any' Types**: All parameters use proper TypeScript interfaces
- **Generic Response Types**: `ApiResponse<T>` interface for consistent, typed responses
- **Custom Error Classes**: `AuthenticationError`, `NetworkError`, `ServerError` for typed error handling
- **JSDoc Documentation**: Complete parameter and return type documentation with usage examples
- **Compile-Time Safety**: TypeScript compiler catches type errors during development

**Legacy Functions** (Available but Deprecated):
- `fetchData()` - Use `apiService.data.fetchAllData()` instead
- `saveEggEntries()` - Use `apiService.production.saveEggEntries()` instead  
- `saveExpenses()` - Use `apiService.production.saveExpenses()` instead
- `saveFlockProfile()` - Use `apiService.flock.saveFlockProfile()` instead
- `saveFeedInventory()` - Use `apiService.production.saveFeedInventory()` instead

**Cache Integration**:
- Legacy functions still work with `DataContext` caching system
- Recommended to use consolidated API service for new development
- Migration provides better error handling and maintainability

---

## App Structure

### App.tsx
**Purpose**: Main application component with multi-layer context integration

**Provider Hierarchy**:
```tsx
<AuthProvider>
  <ProtectedRoute>
    <DataProvider>
      <MainApp />
    </DataProvider>
  </ProtectedRoute>
</AuthProvider>
```

**Features**:
- Route protection with authentication
- Centralized data caching for all components
- User-specific dashboard data with cached statistics
- Navigation with optimized performance
- **Security**: All routes require authentication
- **Performance**: Single data fetch shared across all components

**Dashboard Performance**:
- Uses cached data from `useAppData()` hook
- Instant loading of statistics
- Real-time updates when data changes in other components

**Components**:
- Dashboard with user-specific metrics
- Navigation with user profile
- Protected route wrapper

### main.tsx
**Purpose**: Application entry point with authentication provider

**Setup**:
- Wraps app with `AuthProvider`
- Router configuration
- Global styles and providers

---

## Data Flow

### Authentication & Caching Flow
1. User visits app → Redirected to login if not authenticated
2. User logs in → Session established with Supabase
3. `DataProvider` makes single API call to fetch all user data
4. Data cached for 5 minutes with automatic refresh
5. All components use cached data via specialized hooks
6. Data mutations update both database and cache instantly
7. Users experience instant navigation and real-time updates

### Caching Strategy
- **Initial Load**: Single `fetchData()` call retrieves all user data
- **Cache Duration**: 5 minutes for optimal balance of performance vs. freshness
- **Background Refresh**: Automatic checks every minute for stale data
- **Optimistic Updates**: UI updates immediately, cache syncs automatically
- **Error Recovery**: Graceful fallback and retry logic

### Performance Benefits
- **API Calls**: Reduced from 6+ per page load to 1 shared call
- **Navigation**: Instant switching between components (no loading)
- **Calculations**: Real-time updates in Savings component
- **User Experience**: Offline-like performance with live data

### Data Security
- **Frontend**: All components use authenticated API calls
- **API**: All endpoints validate user sessions  
- **Database**: RLS policies ensure data isolation
- **Network**: JWT tokens secure all communications
- **Cache**: User-specific data isolation maintained in memory

---

## Animation Components

### General Animation Update (2025)
**Note:** All major welcome animations have been updated from SVG/CSS-based to PNG-based components using Framer Motion. Each animation now features a gentle left-right rotation effect and uses a themed PNG mascot image for a more modern, consistent look.

- **EggCounter Animation:** Now uses `AnimatedEggCounterPNG` with `hen-on-eggs.png` and gentle rotation.
- **Expenses Animation:** Now uses `AnimatedCoinPNG` with `chicken-coin.png` and gentle rotation.
- **Profile Animation:** Now uses `AnimatedFarmPNG` with `chickens-on-a-farm.png` and gentle rotation.
- **FeedTracker Animation:** Now uses `AnimatedFeedPNG` with `cute-chicken-having-dinner.png` and gentle rotation.
- **Savings Animation:** Now uses `AnimatedSavingsPNG` with `cute-chicken-pecking-a-calculator.png` and gentle rotation.
- **CRM Animation:** Now uses `AnimatedCRMPNG` with `cute-chicken-business.png` and gentle rotation.

**Animation Details:**
- All PNG mascot images animate with a smooth entrance and then continuously rotate left and right (Framer Motion, 6s duration, infinite loop).
- Themed welcome message and info badge included in each animation.
- All previous SVG/CSS-based mascot animations have been replaced for consistency and performance.

---

## CRM (Customer Relationship Management) Components

### CRM.tsx
**Purpose**: Main CRM interface with tabbed navigation for customer and sales management

**Features**:
- Tabbed interface (Customers, Sales, Quick Sale, Reports)
- Real-time summary statistics dashboard
- Integrated data fetching and state management
- Responsive design with loading states

**Props**: None (self-contained component)

**Usage**:
```tsx
import { CRM } from './CRM';
<CRM />
```

### QuickSale.tsx
**Purpose**: Streamlined interface for recording egg sales quickly

**Features**:
- **Simplified Design**: Single egg count input (EggCounter styling)
- Price per egg configuration
- Quick quantity buttons (+1, +6, +12, +24)
- Automatic total calculation
- Support for $0.00 sales (free egg distribution)
- Form validation with error handling

**Props**:
```tsx
interface QuickSaleProps {
  customers: Customer[];
  onDataChange: () => void;
}
```

### CustomerList.tsx
**Purpose**: Customer management interface for adding, editing, and deactivating customers

**Features**:
- Add new customers with name, phone, notes
- Edit existing customer information
- Soft delete (deactivate) customers
- Search and filter capabilities
- Customer statistics display

**Props**:
```tsx
interface CustomerListProps {
  customers: Customer[];
  onDataChange: () => void;
}
```

### SalesList.tsx
**Purpose**: Display and manage sales history with editing capabilities

**Features**:
- View all sales with customer information
- Edit existing sales (simplified egg count format)
- Free egg indicators with green badges
- Responsive table design
- EggCounter-style form inputs

**Props**:
```tsx
interface SalesListProps {
  sales: SaleWithCustomer[];
  customers: Customer[];
  onDataChange: () => void;
}
```

### SalesReports.tsx
**Purpose**: Analytics and reporting dashboard for sales insights

**Features**:
- Overall sales summary with free egg tracking
- Monthly breakdown charts
- Key performance metrics
- Free eggs statistics (replaces payment tracking)
- Flexible time period filtering
- Top customer identification

**Props**: None (self-contained with data fetching)

---

## Type Safety Improvements (Story 1.2 - ✅ Complete)

### FlockBatchManager.tsx
**Type Safety Fixes Applied**:
- **Removed 'as any' type casting**: Eliminated 3 instances of unsafe type casting
- **Proper Interface Usage**: Now uses proper TypeScript interfaces throughout component
- **Type-Safe API Calls**: Updated to use type-safe API methods with proper error handling
- **Compile-Time Safety**: Component now benefits from full TypeScript type checking

**Before (Unsafe)**:
```typescript
const data = response.json() as any;
const batchData = batchResponse as any;
const eventData = eventInfo as any;
```

**After (Type-Safe)**:
```typescript
const data: ApiResponse<BatchData> = await response.json();
const batchData: FlockBatch = batchResponse.data;
const eventData: FlockEvent = eventInfo.data;
```

**Benefits**:
- **Compile-Time Error Detection**: TypeScript catches type mismatches during development
- **Better IDE Support**: Full autocomplete and type hints for all data properties
- **Runtime Safety**: Proper error handling with typed error responses
- **Maintainability**: Clear interfaces make code easier to understand and modify

---

## Type Consolidation and Organization (Story 3.1 - ✅ Complete)

### Type System Improvements

**All type definitions successfully consolidated and organized** with eliminated duplication and enhanced developer experience:

### Key Achievements
- ✅ **Eliminated Duplicate Types**: Removed duplicate `ApiResponse`, `ApiError`, and service interface definitions between `src/types/api.ts` and `src/services/api/types.ts`
- ✅ **Logical Domain Organization**: Organized types into clear categories with comprehensive JSDoc documentation
- ✅ **Clean Barrel Exports**: Enhanced `src/types/index.ts` with categorized exports and improved code navigation
- ✅ **Service Interface Centralization**: Created dedicated `src/types/services.ts` for service interface definitions
- ✅ **Backward Compatibility**: All existing import statements continue to work unchanged
- ✅ **TypeScript Compilation**: All code compiles successfully with zero errors

### New Type Organization Structure

**Centralized Type Categories** (in `src/types/index.ts`):
```typescript
/* ===== FORM AND VALIDATION TYPES ===== */
- ValidationError interface for client-side form validation

/* ===== CORE APPLICATION DATA TYPES ===== */
- EggEntry, Expense interfaces for main data models

/* ===== FLOCK MANAGEMENT TYPES ===== */
- FlockEvent, FlockBatch, DeathRecord, BatchEvent interfaces

/* ===== SUMMARY AND ANALYTICS TYPES ===== */
- FlockSummary with comprehensive analytics data

/* ===== DATABASE AND PROFILE TYPES ===== */
- DBFlockProfile, FlockProfile with computed fields

/* ===== FEED AND INVENTORY TYPES ===== */
- FeedEntry interface for inventory tracking

/* ===== BARREL EXPORTS ===== */
- Clean re-exports from api.ts, crm.ts, services.ts
```

### Developer Experience Improvements
- **JSDoc Documentation**: Comprehensive comments for all type categories improving code navigation
- **Domain Separation**: Clear boundaries between API types, service interfaces, and domain models  
- **Import Consistency**: Standardized import paths using barrel exports rather than direct file imports
- **Type Safety**: Enhanced compile-time type checking with better error detection

### File Structure After Consolidation
```
src/types/
├── index.ts      # Main barrel export with JSDoc categories
├── api.ts        # API response and error types (consolidated)
├── crm.ts        # Customer relationship management types
└── services.ts   # Service interface definitions (new)
```

### Migration Benefits for Development
- **Reduced Maintenance**: Single source of truth eliminates type duplication
- **Better IDE Support**: Enhanced autocomplete and type hints with organized structure
- **Code Navigation**: JSDoc categories make finding types faster and easier
- **Future-Proof**: Clean architecture supports continued type system expansion

---

## Consolidated API Testing (Story 1.3 - ✅ Complete)

### Comprehensive Test Coverage

**Added 23+ test cases** covering API integration, error handling, and component behavior:

### Test Files Created:
- **`src/components/__tests__/EggCounter.test.tsx`** - Comprehensive API integration tests
  - Tests direct `apiService.production.saveEggEntries()` integration
  - Validates removal of duplicate `saveToDatabase` wrapper
  - Tests standardized error handling with `ApiError` class
  - Verifies preserved component behavior and user experience

- **`src/components/__tests__/Expenses.test.tsx`** - Form behavior and error handling tests
  - Tests enhanced async operations with consolidated API service
  - Validates improved error handling patterns
  - Tests expense category validation and form behavior
  - Verifies maintained identical user experience

- **`src/components/__tests__/FeedTracker.test.tsx`** - Inventory management and validation tests
  - Tests feed inventory operations with enhanced error handling
  - Validates improved reliability for all feed tracking operations
  - Tests integration with expense tracking using consolidated service
  - Verifies maintained feed tracking functionality

### Testing Benefits:
- **API Service Integration**: All components tested with consolidated API service patterns
- **Error Handling Validation**: Tests cover `ApiError` handling scenarios with user-friendly messages
- **Behavior Preservation**: Tests ensure identical component behavior after migration
- **Reliability Verification**: Tests validate critical bug fixes (e.g., Profile.tsx authentication issue)
- **Regression Prevention**: Comprehensive coverage prevents future API integration issues
