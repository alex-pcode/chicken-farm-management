import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'

// Code-split route components for better performance
const Dashboard = lazy(() => import('./components/features/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const EggCounter = lazy(() => import('./components/features/eggs/EggCounter').then(module => ({ default: module.EggCounter })));
const Expenses = lazy(() => import('./components/features/expenses/Expenses').then(module => ({ default: module.Expenses })));
const FeedTracker = lazy(() => import('./components/features/feed/FeedTracker').then(module => ({ default: module.FeedTracker })));
const Savings = lazy(() => import('./components/features/expenses/Savings').then(module => ({ default: module.Savings })));
const Profile = lazy(() => import('./components/features/profile/Profile').then(module => ({ default: module.Profile })));
const ProfilePage = lazy(() => import('./components/features/profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CRM = lazy(() => import('./components/features/crm/CRM').then(module => ({ default: module.CRM })));
const ChickenViability = lazy(() => import('./components/features/flock/ChickenViability').then(module => ({ default: module.ChickenViability })));
const FlockBatchManager = lazy(() => import('./components/features/flock/FlockBatchManager').then(module => ({ default: module.FlockBatchManager })));
const CardShowcase = lazy(() => import('./components/examples/CardShowcase').then(module => ({ default: module.default })));
const Costs = lazy(() => import('./components/features/expenses/Costs').then(module => ({ default: module.Costs })));
// Import LandingPage directly - no lazy loading for main entry point
import { LandingPage } from './components/landing/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { OptimizedDataProvider, useUserTier } from './contexts/OptimizedDataProvider'
import { OnboardingProvider } from './contexts/OnboardingProvider'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/features/auth/ProtectedRoute'
import { UserProfile } from './components/features/auth/UserProfile'
import { PremiumFeatureGate } from './components/common/PremiumFeatureGate'
import { ThemeToggle } from './components/ui/forms'
// Simple Modal Component
// import { Login } from './components/Login' // Temporarily disabled

// Navigation item type
type NavigationItem = {
  name: string;
  emoji: string;
  href: string;
};

// Free tier navigation items (available to all users)
const freeNavigation: NavigationItem[] = [
  { name: 'Eggs', emoji: '🥚', href: '/app/egg-counter' },
  { name: 'Account', emoji: '⚙️', href: '/app/account' },
];

// Premium tier navigation items (premium subscription required)
const premiumNavigation: NavigationItem[] = [
  { name: 'Dashboard', emoji: '🏠', href: '/app/dashboard' },
  { name: 'Eggs', emoji: '🥚', href: '/app/egg-counter' },
  { name: 'My Flock', emoji: '🐔', href: '/app/profile' },
  { name: 'Sales', emoji: '💼', href: '/app/crm' },
  { name: 'Expenses', emoji: '💰', href: '/app/expenses' },
  { name: 'Feed', emoji: '🌾', href: '/app/feed-tracker' },
  { name: 'Savings', emoji: '📈', href: '/app/savings' },
  { name: 'Viability', emoji: '🧮', href: '/app/viability' },
];

// Admin-only navigation items
const adminNavigation: NavigationItem[] = [
  { name: 'Cards', emoji: '🎨', href: '/app/cards' },
];

// Function to get navigation items based on user tier and admin status
const getNavigationItems = (userTier: 'free' | 'premium', isAdmin: boolean): NavigationItem[] => {
  if (userTier === 'free') {
    return freeNavigation;
  }

  const baseNav = [...premiumNavigation];

  // Add admin-only navigation items for admin users
  if (isAdmin) {
    baseNav.push(...adminNavigation);
  }

  // Add Account at the end
  baseNav.push({ name: 'Account', emoji: '⚙️', href: '/app/account' });

  return baseNav;
};

// Function to get mobile navigation items based on user tier and admin status
const getMobileNavigationItems = (userTier: 'free' | 'premium', isAdmin: boolean): { primary: NavigationItem[]; secondary: NavigationItem[] } => {
  if (userTier === 'free') {
    return {
      primary: freeNavigation,
      secondary: []
    };
  }

  const secondaryNav: NavigationItem[] = [
    { name: 'My Flock', emoji: '🐔', href: '/app/profile' },
    { name: 'Feed', emoji: '🌾', href: '/app/feed-tracker' },
    { name: 'Savings', emoji: '📈', href: '/app/savings' },
    { name: 'Viability', emoji: '🧮', href: '/app/viability' },
  ];

  // Add admin-only navigation items for admin users
  if (isAdmin) {
    secondaryNav.push(...adminNavigation);
  }

  // Add Account Settings at the end
  secondaryNav.push({ name: 'Account Settings', emoji: '⚙️', href: '/app/account' });

  return {
    primary: [
      { name: 'Dashboard', emoji: '🏠', href: '/app/dashboard' },
      { name: 'Eggs', emoji: '🥚', href: '/app/egg-counter' },
      { name: 'Sales', emoji: '💼', href: '/app/crm' },
      { name: 'Expenses', emoji: '💰', href: '/app/expenses' }
    ],
    secondary: secondaryNav
  };
};

const NavLink = ({ item }: { item: NavigationItem }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  return (
    <Link
      to={item.href}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      <span className="text-xl" role="img" aria-label={item.name}>{item.emoji}</span>
      {item.name}
    </Link>
  );
};

// Loading component for Suspense fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/costs" element={
            <Suspense fallback={<ComponentLoader />}>
              <Costs />
            </Suspense>
          } />

          {/* Protected Routes */}
          <Route path="/app/*" element={
            <OnboardingProvider>
              <ProtectedRoute>
                <OptimizedDataProvider>
                  <MainApp />
                </OptimizedDataProvider>
              </ProtectedRoute>
            </OnboardingProvider>
          } />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

const MainApp = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { userTier } = useUserTier();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Get default route based on user tier
  const getDefaultRoute = (userTier: 'free' | 'premium') => {
    return userTier === 'premium' ? '/app/dashboard' : '/app/egg-counter';
  };

  const navigation = getNavigationItems(userTier, isAdmin);
  const mobileNav = getMobileNavigationItems(userTier, isAdmin);

  // Close mobile menu when route changes and scroll to top
  useEffect(() => {
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);


  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:block">
        <div className="brand">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="brand">🐔</span>
            <div>
              <h1 style={{ marginBottom: '5px' }}>ChickenCare</h1>
              <p className="text-xs text-gray-500 leading-tight">Egg-ceptional flock management</p>
            </div>
          </div>
        </div>

        <nav className="space-y-8">
          <div className="nav-section">
            <h2 className="nav-title text-xs uppercase font-medium text-gray-500 mb-4">Menu</h2>
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
          <div className="mt-8">
            <UserProfile />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Theme</p>
              <ThemeToggle variant="compact" />
            </div>
            <button
              onClick={signOut}
              className="neu-button w-full bg-red-100 text-red-600 hover:bg-red-200 mt-4"
            >
              Logout ({user?.email?.split('@')[0]})
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="brand">🐔</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ marginBottom: '2px' }}>ChickenCare</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Egg-ceptional flock management</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="text-xl" role="img" aria-label="user menu">👤</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 z-40 px-2 py-3">
        <div className="flex justify-around items-center max-w-screen-xl mx-auto">
          {/* Primary Navigation Items */}
          {mobileNav.primary.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 min-h-[48px] ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg mb-1" role="img" aria-label={item.name}>
                  {item.emoji}
                </span>
                <span className="text-xs font-medium text-center leading-tight truncate w-full">
                  {item.name === 'Production' ? 'Eggs' : item.name}
                </span>
              </Link>
            );
          })}

          {/* More Menu Button - Only show if there are secondary nav items */}
          {mobileNav.secondary.length > 0 && (
            <button
              onClick={() => setShowMobileMenu(true)}
              className="flex flex-col items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 min-h-[48px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-lg mb-1" role="img" aria-label="More options">
                ⋯
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                More
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Overflow Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] rounded-t-xl border-t border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">More Options</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {mobileNav.secondary.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } border`}
                    >
                      <span className="text-xl" role="img" aria-label={item.name}>
                        {item.emoji}
                      </span>
                      <div>
                        <div className="font-medium text-sm">
                          {item.name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple User Menu Dropdown */}
      {showUserMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowUserMenu(false)}>
          <div
            className="fixed top-16 right-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg min-w-[250px] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">👤 User Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
              </div>
              
              <UserProfile />

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-2">Theme</p>
                <ThemeToggle variant="compact" />
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="neu-button w-full bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 text-sm font-medium"
                >
                  🚪 Logout ({user?.email?.split('@')[0]})
                </button>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="neu-button-secondary w-full px-4 py-2 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: 0, paddingLeft: '17px', paddingRight: '17px' }}>
        <Suspense fallback={<ComponentLoader />}>
          <Routes>
            {/* Default redirect from /app based on user tier */}
            <Route index element={<Navigate to={getDefaultRoute(userTier)} replace />} />
            
            {/* Premium Features */}
            <Route path="dashboard" element={
              <PremiumFeatureGate featureName="Dashboard Analytics">
                <Dashboard />
              </PremiumFeatureGate>
            } />
            <Route path="profile" element={
              <PremiumFeatureGate featureName="My Flock">
                <Profile />
              </PremiumFeatureGate>
            } />
            <Route path="flock-batches" element={
              <PremiumFeatureGate featureName="Flock Batch Management">
                <FlockBatchManager />
              </PremiumFeatureGate>
            } />
            <Route path="crm" element={
              <PremiumFeatureGate featureName="Customer Management">
                <CRM />
              </PremiumFeatureGate>
            } />
            <Route path="expenses" element={
              <PremiumFeatureGate featureName="Expense Tracking">
                <Expenses />
              </PremiumFeatureGate>
            } />
            <Route path="feed-tracker" element={
              <PremiumFeatureGate featureName="Feed Management">
                <FeedTracker />
              </PremiumFeatureGate>
            } />
            <Route path="savings" element={
              <PremiumFeatureGate featureName="Savings Analysis">
                <Savings />
              </PremiumFeatureGate>
            } />
            <Route path="viability" element={
              <PremiumFeatureGate featureName="Viability Calculator">
                <ChickenViability />
              </PremiumFeatureGate>
            } />
            {/* Admin-only route - Cards tab only visible to admins */}
            {isAdmin && (
              <Route path="cards" element={<CardShowcase />} />
            )}
            
            {/* Free Features - Available to all users */}
            <Route path="egg-counter" element={<EggCounter />} />
            <Route path="account" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

// Public Landing Page Component (no authentication required, no suspense needed)
const PublicLandingPage = () => {
  return <LandingPage />;
};

export default App;
