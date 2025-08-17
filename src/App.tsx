import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

// Code-split route components for better performance
const EggCounter = lazy(() => import('./components/EggCounter').then(module => ({ default: module.EggCounter })));
const Expenses = lazy(() => import('./components/Expenses').then(module => ({ default: module.Expenses })));
const FeedTracker = lazy(() => import('./components/FeedTracker').then(module => ({ default: module.FeedTracker })));
const Savings = lazy(() => import('./components/Savings').then(module => ({ default: module.Savings })));
const Profile = lazy(() => import('./components/Profile').then(module => ({ default: module.Profile })));
const ExperimentProfile = lazy(() => import('./components/ExperimentProfile').then(module => ({ default: module.ExperimentProfile })));
const CRM = lazy(() => import('./components/CRM').then(module => ({ default: module.CRM })));
const ChickenViability = lazy(() => import('./components/ChickenViability').then(module => ({ default: module.ChickenViability })));
const FeedCostCalculator = lazy(() => import('./components/FeedCostCalculator').then(module => ({ default: module.FeedCostCalculator })));
const FlockBatchManager = lazy(() => import('./components/FlockBatchManager').then(module => ({ default: module.FlockBatchManager })));
const CardShowcase = lazy(() => import('./components/examples/CardShowcase').then(module => ({ default: module.default })));
import { motion } from 'framer-motion'
import { StatCard } from './components/testCom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { OptimizedDataProvider, useOptimizedAppData } from './contexts/OptimizedDataProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserProfile } from './components/UserProfile'
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts'
// Simple Modal Component
// import { Login } from './components/Login' // Temporarily disabled

// Full navigation for desktop sidebar
const navigation = [
  { name: 'Dashboard', emoji: '🏠', href: '/' },
  { name: 'Profile', emoji: '🐔', href: '/profile' },
  { name: 'Experiment', emoji: '🧪', href: '/experiment' },
  { name: 'Production', emoji: '🥚', href: '/egg-counter' },
  { name: 'CRM', emoji: '💼', href: '/crm' },
  { name: 'Expenses', emoji: '💰', href: '/expenses' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Feed Calculator', emoji: '🧮', href: '/feed-calculator' },
  { name: 'Savings', emoji: '📈', href: '/savings' },
  { name: 'Viability', emoji: '🧮', href: '/viability' },
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
  { name: 'Profile', emoji: '🐔', href: '/profile' },
  { name: 'Experiment', emoji: '🧪', href: '/experiment' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Feed Calculator', emoji: '🧮', href: '/feed-calculator' },
  { name: 'Savings', emoji: '📈', href: '/savings' },
  { name: 'Viability', emoji: '🧮', href: '/viability' },
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

const Dashboard = () => {
  const { data, isLoading } = useOptimizedAppData();
  
  // Memoize expensive calculations based on data changes only
  const stats = useMemo(() => {
    if (isLoading || !data) {
      return {
        totalEggs: 0,
        dailyAverage: 0,
        thisMonthProduction: 0,
        lastMonthProduction: 0,
        eggValue: 0,
        revenue: 0,
        freeEggs: 0,
        last30DaysData: [] as { date: string; count: number }[]
      };
    }
    
    const eggEntries = data.eggEntries || [];
    const sales = data.sales || [];
    
    // Pre-calculate date boundaries to avoid repeated calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Single pass through egg entries with category tracking
    let totalEggs = 0;
    let last7DaysTotal = 0;
    let thisMonthProduction = 0;
    let lastMonthProduction = 0;
    
    for (const entry of eggEntries) {
      const entryDate = new Date(entry.date);
      const entryMonth = entryDate.getMonth();
      const entryYear = entryDate.getFullYear();
      
      // Total eggs (always count)
      totalEggs += entry.count;
      
      // Last 7 days check
      if (entryDate >= sevenDaysAgo) {
        last7DaysTotal += entry.count;
      }
      
      // This month check
      if (entryMonth === currentMonth && entryYear === currentYear) {
        thisMonthProduction += entry.count;
      }
      
      // Last month check
      if (entryMonth === lastMonth && entryYear === lastMonthYear) {
        lastMonthProduction += entry.count;
      }
    }
    
    const dailyAverage = last7DaysTotal / 7;
    
    // Single pass through sales for this month's revenue and free eggs
    let revenue = 0;
    let freeEggs = 0;
    
    for (const sale of sales) {
      const saleDate = new Date(sale.sale_date);
      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();
      
      // Only process this month's sales
      if (saleMonth === currentMonth && saleYear === currentYear) {
        revenue += sale.total_amount;
        
        // If it's a free sale (total_amount === 0), count the eggs
        if (sale.total_amount === 0) {
          freeEggs += (sale.dozen_count * 12 + sale.individual_count);
        }
      }
    }
    
    // Egg Value calculation: this month's production * default price (matching Financial Overview period)
    const defaultEggPrice = 0.30; // Same default as Savings component
    const eggValue = thisMonthProduction * defaultEggPrice; // This month only, not total
    
    
    // Last 30 days data for graph - optimized with lookup map
    const eggEntriesMap = new Map(eggEntries.map(entry => [entry.date, entry.count]));
    const last30DaysData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      last30DaysData.push({
        date: dateStr,
        count: eggEntriesMap.get(dateStr) || 0
      });
    }
    
    
    return {
        totalEggs,
        dailyAverage: Math.round(dailyAverage * 10) / 10,
        thisMonthProduction,
        lastMonthProduction,
        eggValue: Math.round(eggValue * 100) / 100, // Round to 2 decimal places
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
        freeEggs,
        last30DaysData
      };
  }, [data, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto p-0" style={{ opacity: 1, marginTop: '45px' }}
    >
      <div className="header mb-0 mt-4" style={{ marginBottom: 'unset' }}>
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">🥚 Production Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard title="Total Eggs" total={stats.totalEggs} label="collected" />
          <StatCard title="Daily Average" total={stats.dailyAverage} label="eggs per day (7-day)" />
          <StatCard 
            title="This Month" 
            total={stats.thisMonthProduction} 
            label={
              <span className="flex items-center gap-1 flex-wrap">
                {stats.lastMonthProduction > 0 && (
                  <>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      stats.thisMonthProduction > stats.lastMonthProduction 
                        ? 'bg-green-100 text-green-600' 
                        : stats.thisMonthProduction < stats.lastMonthProduction
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {stats.thisMonthProduction > stats.lastMonthProduction 
                        ? '+' : ''}{Math.round(((stats.thisMonthProduction - stats.lastMonthProduction) / stats.lastMonthProduction) * 100)}%
                    </span>
                    <span className="text-xs text-gray-500">compared to previous month</span>
                  </>
                )}
              </span>
            } 
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">📊 30-Day Production Trend</h2>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.last30DaysData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value} eggs`, 'Production']}
                labelFormatter={(label, payload) => {
                  // Get the date from the payload data instead of the label
                  if (payload && payload.length > 0 && payload[0].payload) {
                    const dateStr = payload[0].payload.date;
                    const date = new Date(dateStr + 'T12:00:00');
                    return date.toLocaleDateString();
                  }
                  return String(label);
                }}
              />
              <Bar
                dataKey="count"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                name="Production"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">💰 Financial Overview (This Month)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard 
            title="Egg Value" 
            total={`$${stats.eggValue}`} 
            label="potential revenue"
          />
          <StatCard title="Revenue" total={`$${stats.revenue}`} label="from sales" />
          <StatCard title="Free Eggs" total={stats.freeEggs} label="given away" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/egg-counter" className="block p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <span className="text-xl lg:text-2xl" role="img" aria-label="production">🥚</span>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Production Tracking</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600">Monitor and record daily egg production with detailed analytics.</p>
          </Link>
        </motion.div>

        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/expenses" className="block p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <span className="text-xl lg:text-2xl" role="img" aria-label="finances">💰</span>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Expense Management</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600">Track all expenses and analyze your cost breakdown.</p>
          </Link>
        </motion.div>

        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/feed-tracker" className="block p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <span className="text-xl lg:text-2xl" role="img" aria-label="inventory">🌾</span>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Feed Management</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600">Monitor feed inventory and consumption patterns.</p>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OptimizedDataProvider>
          <MainApp />
        </OptimizedDataProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

const MainApp = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
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
      <main className="main-content" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        <Suspense fallback={<ComponentLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/experiment" element={<ExperimentProfile />} />
            <Route path="/flock-batches" element={<FlockBatchManager />} />
            <Route path="/egg-counter" element={<EggCounter />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/feed-tracker" element={<FeedTracker />} />
            <Route path="/feed-calculator" element={<FeedCostCalculator />} />
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
