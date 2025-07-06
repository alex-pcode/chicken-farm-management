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
- **Authentication**: Uses `authApiUtils` for secure API calls
- **Data Isolation**: Only shows current user's egg entries

**Key Functions**:
- Add/edit egg entries
- Bulk operations
- Data validation
- Automatic saving

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
- **Authentication**: All expense data is user-specific
- **Security**: Uses authenticated API endpoints

**Categories**:
- Feed, Equipment, Veterinary, Maintenance, Supplies, Other

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

**Last Updated**: January 2025  
**Version**: 2.0 with Multi-User Authentication

## Component Updates
Document any changes to component behavior or props here.

Note: Update this documentation when making changes to components or adding new features.
