import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { EggCounter } from './components/EggCounter'
import { Expenses } from './components/Expenses'
import { FeedTracker } from './components/FeedTracker'
import { Savings } from './components/Savings'
import { Profile } from './components/Profile'
import { CRM } from './components/CRM'
import { motion } from 'framer-motion'
import { StatCard } from './components/testCom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider, useAppData } from './contexts/DataContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserProfile } from './components/UserProfile'
// import { Login } from './components/Login' // Temporarily disabled

const navigation = [
  { name: 'Dashboard', emoji: '🏠', href: '/' },
  { name: 'Profile', emoji: '🐔', href: '/profile' },
  { name: 'Production', emoji: '🥚', href: '/egg-counter' },
  { name: 'CRM', emoji: '💼', href: '/crm' },
  { name: 'Expenses', emoji: '💰', href: '/expenses' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Analytics', emoji: '📊', href: '/savings' }
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

const Dashboard = () => {
  const { data, isLoading } = useAppData();
  const [eggCount, setEggCount] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  
  useEffect(() => {
    if (!isLoading && data) {
      const eggEntries = data.eggEntries || [];
      const totalEggs = eggEntries.reduce((sum: number, entry: { count: number }) => 
        sum + entry.count, 0);
      
      const expenseEntries = data.expenses || [];
      const totalExpenses = expenseEntries.reduce((sum: number, expense: { amount: number }) => 
        sum + expense.amount, 0);

      // Calculate daily average from last 7 days
      const last7Days = eggEntries
        .slice(-7)
        .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0) / 7;
      
      setEggCount(totalEggs);
      setExpenses(totalExpenses);
      setDailyAverage(Math.round(last7Days * 10) / 10);
    }
  }, [data, isLoading]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-6xl mx-auto p-0"
    >
      <div className="header">
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <div className="header-actions">
          <Link to="/egg-counter" className="neu-button">
            <span className="text-lg lg:text-xl mr-2" role="img" aria-label="production">🥚</span>
            <span className="hidden sm:inline">Log Production</span>
            <span className="sm:hidden">Log</span>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard title="Production" total={eggCount} label="total eggs" />
          <StatCard title="Expenses" total={expenses} label="running total" />
          <StatCard title="Daily Avg" total={dailyAverage} label="eggs per day" />
          <StatCard title="Efficiency" total={Number.isFinite(expenses / eggCount) ? parseFloat((expenses / eggCount).toFixed(2)) : 0} label="cost per egg" />
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
        <DataProvider>
          <MainApp />
        </DataProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

const MainApp = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

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
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <span className="text-xl" role="img" aria-label="user menu">👤</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <UserProfile />
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="neu-button w-full bg-red-100 text-red-600 hover:bg-red-200 mt-4"
                  >
                    Logout ({user?.email?.split('@')[0]})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-2">
        <div className="flex justify-around items-center max-w-screen-xl mx-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mb-1" role="img" aria-label={item.name}>
                  {item.emoji}
                </span>
                <span className="text-xs font-medium text-center leading-tight truncate w-full">
                  {item.name === 'Feed Management' ? 'Feed' : item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content pb-20 lg:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/egg-counter" element={<EggCounter />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/feed-tracker" element={<FeedTracker />} />
          <Route path="/savings" element={<Savings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
