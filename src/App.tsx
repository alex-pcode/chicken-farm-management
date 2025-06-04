import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
import { EggCounter } from './components/EggCounter'
import { Expenses } from './components/Expenses'
import { FeedTracker } from './components/FeedTracker'
import { Savings } from './components/Savings'
import { Profile } from './components/Profile'
import { motion } from 'framer-motion'
import testData from './components/test.json'
import type { TestData } from './components/testData'

const navigation = [
  { name: 'Dashboard', emoji: '🏠', href: '/' },
  { name: 'Profile', emoji: '🐔', href: '/profile' },
  { name: 'Production', emoji: '🥚', href: '/egg-counter' },
  { name: 'Expenses', emoji: '💰', href: '/expenses' },
  { name: 'Feed Management', emoji: '🌾', href: '/feed-tracker' },
  { name: 'Analytics', emoji: '📊', href: '/savings' },
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
  const [eggCount, setEggCount] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  
  useEffect(() => {
    // Load data from testData
    const eggEntries = (testData as TestData).eggEntries;
    const totalEggs = eggEntries.reduce((sum: number, entry: { count: number }) => 
      sum + entry.count, 0);
    
    const expenseEntries = (testData as TestData).chickenExpenses;
    const totalExpenses = expenseEntries.reduce((sum: number, expense: { amount: number }) => 
      sum + expense.amount, 0);

    const feedInventory = (testData as TestData).feedInventory;

    // Calculate daily average from last 7 days
    const last7Days = eggEntries
      .slice(-7)
      .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0) / 7;
    
    setEggCount(totalEggs);
    setExpenses(totalExpenses);
    setDailyAverage(Math.round(last7Days * 10) / 10);

    // Update localStorage with all data
    localStorage.setItem('eggEntries', JSON.stringify(eggEntries));
    localStorage.setItem('chickenExpenses', JSON.stringify(expenseEntries));
    localStorage.setItem('feedInventory', JSON.stringify(feedInventory));
    localStorage.setItem('flockProfile', JSON.stringify((testData as TestData).flockProfile));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto p-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <div className="flex gap-4">
          <Link to="/egg-counter" className="neu-button">
            <span className="text-xl mr-2" role="img" aria-label="production">🥚</span>
            Log Production
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="neu-stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="production">🥚</span>
              <h3 className="text-lg font-medium text-gray-600">Total Production</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">{eggCount}</p>
            <p className="text-sm text-gray-500 mt-1">total eggs</p>
          </motion.div>

          <motion.div 
            className="neu-stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="expenses">💰</span>
              <h3 className="text-lg font-medium text-gray-600">Total Expenses</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">${expenses.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">running total</p>
          </motion.div>

          <motion.div 
            className="neu-stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="daily average">📅</span>
              <h3 className="text-lg font-medium text-gray-600">Daily Average</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">{dailyAverage}</p>
            <p className="text-sm text-gray-500 mt-1">eggs per day (7-day avg)</p>
          </motion.div>

          <motion.div 
            className="neu-stat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="efficiency">✨</span>
              <h3 className="text-lg font-medium text-gray-600">Feed Efficiency</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">${(expenses / eggCount || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">cost per egg</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/egg-counter" className="block p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl" role="img" aria-label="production">🥚</span>
              <h3 className="text-lg font-semibold text-gray-900">Production Tracking</h3>
            </div>
            <p className="text-gray-600">Monitor and record daily egg production with detailed analytics.</p>
          </Link>
        </motion.div>

        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/expenses" className="block p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl" role="img" aria-label="finances">💰</span>
              <h3 className="text-lg font-semibold text-gray-900">Expense Management</h3>
            </div>
            <p className="text-gray-600">Track all expenses and analyze your cost breakdown.</p>
          </Link>
        </motion.div>

        <motion.div
          className="neu-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/feed-tracker" className="block p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl" role="img" aria-label="inventory">🌾</span>
              <h3 className="text-lg font-semibold text-gray-900">Feed Management</h3>
            </div>
            <p className="text-gray-600">Monitor feed inventory and consumption patterns.</p>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <aside className="sidebar">
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
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/egg-counter" element={<EggCounter />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/feed-tracker" element={<FeedTracker />} />
            <Route path="/savings" element={<Savings />} />
          </Routes>
        </main>

        <Disclosure as="nav" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          {({ open }) => (
            <>
              <Disclosure.Button className="p-2 w-full flex items-center justify-center text-gray-500">
                {open ? (
                  <span className="text-2xl" role="img" aria-label="close">❌</span>
                ) : (
                  <span className="text-2xl" role="img" aria-label="menu">☰</span>
                )}
              </Disclosure.Button>

              <Disclosure.Panel>
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </Router>
  );
}

export default App;
