# Component Documentation

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

## Data Management Components

### EggCounter.tsx
**Purpose**: Track daily egg collection with user-specific data

**Features**:
- Daily egg count logging with date tracking
- Visual statistics and trends
- Historical data analysis
- **Welcome Animation**: Animated hen sitting on pyramid of eggs for new users
- **Authentication**: Uses `authApiUtils` for secure API calls
- **Data Isolation**: Only shows current user's egg entries
- **Caching**: Uses `useEggEntries()` hook for optimized performance

**Key Functions**:
- Add/edit egg entries with automatic cache updates
- Bulk operations
- Data validation
- Optimistic UI updates

**Animation Components**:
- `AnimatedHen`: Welcome animation featuring a hen on eggs pyramid

**Cache Integration**:
```tsx
const { eggEntries, isLoading, updateEggEntries } = useEggEntries();
// Updates both local state and global cache
updateEggEntries(newEntries);
```

### FeedTracker.tsx
**Purpose**: Monitor feed inventory with user-specific data

**Features**:
- Feed type and brand management
- Quantity tracking with units
- Purchase date and expiry monitoring
- Cost per unit calculations
- **Authentication**: Requires user session for all operations
- **Data Isolation**: User-specific feed inventory
- **Caching**: Uses `useFeedInventory()` and `useFlockProfile()` for optimal performance

**Integration**:
- Links to expense tracking
- Automatic expense creation on feed purchase
- Real-time updates across all components

**Cache Integration**:
```tsx
const { feedInventory, updateFeedInventory } = useFeedInventory();
const { flockProfile } = useFlockProfile();
```

### Expenses.tsx
**Purpose**: Track and categorize expenses with full user data isolation

**Features**:
- Multiple expense categories (Feed, Equipment, Veterinary, etc.)
- Visual analytics with charts
- **Caching**: Uses `useExpenses()` hook for instant loading
- Monthly/yearly summaries
- **Welcome Animation**: Spinning Euro coin with chicken design for new users
- **Authentication**: All expense data is user-specific
- **Security**: Uses authenticated API endpoints
- **Real-time Updates**: Changes reflect instantly across all components

**Categories**:
- Feed, Equipment, Veterinary, Maintenance, Supplies, Other

**Animation Components**:
- `AnimatedCoin`: Welcome animation featuring spinning Euro coin with chicken

**Cache Integration**:
```tsx
const { expenses, isLoading, updateExpenses } = useExpenses();
// Automatic cache synchronization on add/delete
updateExpenses(newExpenses);
```

### Profile.tsx
**Purpose**: Manage flock information with user-specific profiles

**Features**:
- Farm details (name, location, breed types)
- Bird count tracking (hens, roosters, chicks, brooding)
- Flock event logging (health, breeding, mortality)
- **Authentication**: Each user has their own flock profile
- **Data Privacy**: Flock events are user-specific
- **Caching**: Uses `useFlockProfile()` for optimized performance
- **Real-time Sync**: Profile updates reflect instantly in analytics

**Event Types**:
- Health, Feeding, Breeding, Mortality, Brooding, Hatching, Other

**Cache Integration**:
```tsx
const { flockProfile, isLoading, updateFlockProfile } = useFlockProfile();
// Updates both local state and global cache
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

### authApiUtils.ts
**Purpose**: Provides authenticated API functions for all data operations

**Key Functions**:
- `fetchData()` - Get all user data (used once per cache cycle)
- `saveEggEntries()` - Save egg production data
- `saveExpenses()` - Save expense records
- `saveFlockProfile()` - Save flock information
- `saveFeedInventory()` - Save feed inventory
- `saveFlockEvents()` - Save flock events
- `deleteFlockEvent()` - Delete flock events

**Security Features**:
- Automatic token inclusion in headers
- Error handling for authentication failures
- User session validation

**Cache Integration**:
- Primary data source for `DataContext`
- Triggered automatically for cache refresh
- Minimal API calls due to 5-minute caching

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

### AnimatedFarm.tsx
**Purpose**: Welcome animation component featuring a characteristic rooster, hens, and chicks

**Features**:
- Wide, detailed rooster with elaborate tail feathers and comb
- Four animated hens with different colors and bobbing animations  
- Three animated chicks that appear progressively
- Farm setting with fence, clouds, sun, and scattered feed
- Welcome message bubble and info badge
- Smooth entrance animations with Framer Motion

**Usage**:
```tsx
import AnimatedFarm from './AnimatedFarm';

// Used at the top of Profile page
<AnimatedFarm />
```

**Design Details**:
- Rooster: Wider body, prominent white breast, red comb and wattles
- Hens: Varied colors (amber, red, white, black) with individual animations
- Chicks: Small yellow birds with cute bobbing motion
- Background: Sky gradient, clouds, sun, fence structure

### AnimatedFeedPile.tsx
**Purpose**: Welcome animation component showing chickens consuming a pile of feed

**Features**:
- Large, highly visible feed pile that shrinks in stages
- Five chickens appear progressively as pile shrinks
- Each chicken has unique pecking/bobbing animation
- Scattered grain details for realism
- Welcome message bubble and info badge
- Multi-stage timing synchronized with chicken arrivals

**Usage**:
```tsx
import AnimatedFeedPile from './AnimatedFeedPile';

// Used at the top of FeedTracker page
<AnimatedFeedPile />
```

**Design Details**:
- Feed pile: Yellow gradients with borders and shadow for visibility
- Ground patch underneath for contrast
- Five shrinking stages timed to chicken arrivals
- Varied chicken colors and animation speeds
- Sky background with sun and clouds

**Animation Timing**:
- Stage 1: Initial pile appears (0.8s)
- Stages 2-6: Progressive shrinking as chickens arrive (1.2s - 4.5s)
- Each chicken has unique bobbing animation cycle

---

**Last Updated**: January 2025  
**Version**: 2.0 with Multi-User Authentication

## Component Updates
Document any changes to component behavior or props here.

Note: Update this documentation when making changes to components or adding new features.
