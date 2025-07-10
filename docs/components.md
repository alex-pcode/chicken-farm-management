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

## Data Management Components

### EggCounter.tsx
**Purpose**: Track daily egg collection with user-specific data

**Features**:
- Daily egg count logging with date tracking
- Visual statistics and trends
- Export data to CSV format
- Historical data analysis
- **Welcome Animation**: Animated hen sitting on pyramid of eggs for new users
- **Authentication**: Uses `authApiUtils` for secure API calls
- **Data Isolation**: Only shows current user's egg entries

**Key Functions**:
- Add/edit egg entries
- Bulk operations
- Data validation
- Automatic saving

**Animation Components**:
- `AnimatedHen`: Welcome animation featuring a hen on eggs pyramid

### FeedTracker.tsx
**Purpose**: Monitor feed inventory with user-specific data

**Features**:
- Feed type and brand management
- Quantity tracking with units
- Purchase date and expiry monitoring
- Cost per unit calculations
- **Authentication**: Requires user session for all operations
- **Data Isolation**: User-specific feed inventory

**Integration**:
- Links to expense tracking
- Automatic expense creation on feed purchase

### Expenses.tsx
**Purpose**: Track and categorize expenses with full user data isolation

**Features**:
- Multiple expense categories (Feed, Equipment, Veterinary, etc.)
- Visual analytics with charts
- Monthly/yearly summaries
- **Welcome Animation**: Spinning Euro coin with chicken design for new users
- **Authentication**: All expense data is user-specific
- **Security**: Uses authenticated API endpoints

**Categories**:
- Feed, Equipment, Veterinary, Maintenance, Supplies, Other

**Animation Components**:
- `AnimatedCoin`: Welcome animation featuring spinning Euro coin with chicken

### Profile.tsx
**Purpose**: Manage flock information with user-specific profiles

**Features**:
- Farm details (name, location, breed types)
- Bird count tracking (hens, roosters, chicks, brooding)
- Flock event logging (health, breeding, mortality)
- **Authentication**: Each user has their own flock profile
- **Data Privacy**: Flock events are user-specific

**Event Types**:
- Health, Feeding, Breeding, Mortality, Brooding, Hatching, Other

### ReportGenerator.tsx
**Purpose**: Generate insights and reports from user's data

**Features**:
- User-specific data aggregation
- Multiple report types
- Data visualization
- Export functionality
- **Security**: Only processes authenticated user's data

### Savings.tsx
**Purpose**: Track financial benefits with user-specific calculations

**Features**:
- ROI calculations based on user's data
- Cost comparison analysis
- Visual charts and metrics
- **Data Source**: Uses user's expenses and production data

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
- Use during API calls
- Authentication state loading
- Data fetching operations

**Customization**:
- Configurable size and color
- Responsive design

### KeyboardShortcuts.tsx
**Purpose**: Displays available keyboard shortcuts

**Available Shortcuts**:
- Quick data entry
- Navigation shortcuts
- Modal controls

**Implementation**:
- Uses `useKeyboardShortcut` hook
- Context-aware shortcuts

---

## API Integration

### authApiUtils.ts
**Purpose**: Provides authenticated API functions for all data operations

**Key Functions**:
- `fetchData()` - Get all user data
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

---

## App Structure

### App.tsx
**Purpose**: Main application component with authentication integration

**Features**:
- Route protection with authentication
- User-specific dashboard data
- Navigation with user context
- **Security**: All routes require authentication

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

### Authentication Flow
1. User visits app → Redirected to login if not authenticated
2. User logs in → Session established with Supabase
3. All API calls include user's JWT token
4. Database queries filter by user ID
5. User sees only their own data

### Data Security
- **Frontend**: All components use authenticated API calls
- **API**: All endpoints validate user sessions
- **Database**: RLS policies ensure data isolation
- **Network**: JWT tokens secure all communications

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
