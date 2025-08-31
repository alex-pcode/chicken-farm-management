import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

// Code-split route components for better performance
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const EggCounter = lazy(() => import('./components/EggCounter').then(module => ({ default: module.EggCounter })));
const Expenses = lazy(() => import('./components/Expenses').then(module => ({ default: module.Expenses })));
const FeedTracker = lazy(() => import('./components/FeedTracker').then(module => ({ default: module.FeedTracker })));
const Savings = lazy(() => import('./components/Savings').then(module => ({ default: module.Savings })));
const Profile = lazy(() => import('./components/Profile').then(module => ({ default: module.Profile })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CRM = lazy(() => import('./components/CRM').then(module => ({ default: module.CRM })));
const ChickenViability = lazy(() => import('./components/ChickenViability').then(module => ({ default: module.ChickenViability })));
const FlockBatchManager = lazy(() => import('./components/FlockBatchManager').then(module => ({ default: module.FlockBatchManager })));
const CardShowcase = lazy(() => import('./components/examples/CardShowcase').then(module => ({ default: module.default })));
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { OptimizedDataProvider } from './contexts/OptimizedDataProvider'
import { OnboardingProvider } from './contexts/OnboardingProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserProfile } from './components/UserProfile'
// Simple Modal Component
// import { Login } from './components/Login' // Temporarily disabled

// Full navigation for desktop sidebar
const navigation = [
  { name: 'Dashboard', emoji: '🏠', href: '/' },
  { name: 'My Flock', emoji: '🐔', href: '/profile' },
  { name: 'Production', emoji: '🥚', href: '/egg-counter' },
  { name: 'CRM', emoji: '💼', href: '/crm' },
  { name: 'Expenses', emoji: '💰', href: '/expenses' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Savings', emoji: '📈', href: '/savings' },
  { name: 'Viability', emoji: '🧮', href: '/viability' },
  { name: 'Cards', emoji: '🎨', href: '/cards' },
  { name: 'Account', emoji: '⚙️', href: '/account' },
];

// Primary mobile navigation - most critical daily tasks
const primaryMobileNav = [
  { name: 'Dashboard', emoji: '🏠', href: '/' },
  { name: 'Production', emoji: '🥚', href: '/egg-counter' },
  { name: 'CRM', emoji: '💼', href: '/crm' },
  { name: 'Expenses', emoji: '💰', href: '/expenses' }
];

// Secondary navigation - less frequent but important features  
const secondaryMobileNav = [
  { name: 'My Flock', emoji: '🐔', href: '/profile' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Savings', emoji: '📈', href: '/savings' },
  { name: 'Viability', emoji: '🧮', href: '/viability' },
  { name: 'Cards', emoji: '🎨', href: '/cards' },
  { name: 'Account Settings', emoji: '⚙️', href: '/account' },
];

const NavLink = ({ item }: { item: typeof navigation[0] }) => {
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
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);


function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ProtectedRoute>
          <OptimizedDataProvider>
            <MainApp />
          </OptimizedDataProvider>
        </ProtectedRoute>
      </OnboardingProvider>
    </AuthProvider>
  );
}

const MainApp = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

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
          <span className="text-2xl" role="img" aria-label="brand">🐔</span>
          <h1>Chicken Manager</h1>
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
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="brand">🐔</span>
            <h1 className="text-lg font-semibold">Chicken Manager</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="text-xl" role="img" aria-label="user menu">👤</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-3">
        <div className="flex justify-around items-center max-w-screen-xl mx-auto">
          {/* Primary Navigation Items */}
          {primaryMobileNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 min-h-[48px] ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 min-h-[48px] text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <span className="text-lg mb-1" role="img" aria-label="More options">
              ⋯
            </span>
            <span className="text-xs font-medium text-center leading-tight">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Overflow Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl border-t border-gray-200 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">More Options</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {secondaryMobileNav.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                          : 'text-gray-700 hover:bg-gray-50 border-gray-200'
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
            className="fixed top-16 right-4 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[250px] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">👤 User Profile</h3>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
              
              <UserProfile />
              
              <div className="space-y-2 pt-3 border-t border-gray-100">
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/flock-batches" element={<FlockBatchManager />} />
            <Route path="/egg-counter" element={<EggCounter />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/feed-tracker" element={<FeedTracker />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/viability" element={<ChickenViability />} />
            <Route path="/cards" element={<CardShowcase />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
