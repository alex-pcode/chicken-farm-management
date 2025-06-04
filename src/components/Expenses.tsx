import { useState, useEffect, useMemo } from 'react';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { exportToCSV } from '../utils/exportUtils';
import { useKeyboardShortcut } from '../utils/useKeyboardShortcut';
import testData from './test.json';
import type { Expense, TestData } from './testData';

interface ValidationError {
  field: string;
  message: string;
}

const CATEGORIES = [
  'Feed',
  'Equipment',
  'Veterinary',
  'Maintenance',
  'Supplies',
  'Other'
];

const saveToJson = async (expenses: Expense[]) => {
  try {
    const response = await fetch('http://localhost:3001/api/saveExpenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenses),
    });
    if (!response.ok) {
      console.error('Failed to save to test.json');
    }
  } catch (error) {
    console.error('Error saving to test.json:', error);
  }
};

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [continueMode, setContinueMode] = useState(false);  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const expenseData = (testData as TestData).chickenExpenses;
        setExpenses(expenseData);
        // Sync to localStorage
        localStorage.setItem('chickenExpenses', JSON.stringify(expenseData));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Listen for data updates from other components
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'expense') {
        setExpenses(event.detail.data);
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    if (!description.trim()) {
      newErrors.push({ field: 'description', message: 'Please enter a description' });
    }
    
    if (!amount) {
      newErrors.push({ field: 'amount', message: 'Please enter an amount' });
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.push({ field: 'amount', message: 'Please enter a valid amount greater than 0' });
      }
    }

    if (!date) {
      newErrors.push({ field: 'date', message: 'Please select a date' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      date,
      category,
      description: description.trim(),
      amount: parseFloat(amount)
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    // Update both localStorage and test.json
    localStorage.setItem('chickenExpenses', JSON.stringify(updatedExpenses));
    (testData as TestData).chickenExpenses = updatedExpenses;
    saveToJson(updatedExpenses);

    // Reset form based on continue mode
    if (!continueMode) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(CATEGORIES[0]);
    } else {
      setDescription('');
      setAmount('');
    }
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      
      // Update both localStorage and test.json
      localStorage.setItem('chickenExpenses', JSON.stringify(updatedExpenses));
      (testData as TestData).chickenExpenses = updatedExpenses;
      saveToJson(updatedExpenses);
      
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleExport = () => {
    const exportData = expenses.map(expense => ({
      Date: expense.date,
      Category: expense.category,
      Description: expense.description,
      Amount: expense.amount.toFixed(2),
    }));
    exportToCSV(exportData, `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const calculateSummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTotal = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const yearlyTotal = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const categoryTotals = CATEGORIES.map(cat => ({
      category: cat,
      total: expenses
        .filter(expense => expense.category === cat)
        .reduce((sum, expense) => sum + expense.amount, 0)
    }));

    return { monthlyTotal, yearlyTotal, categoryTotals };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const dailyExpenseData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayExpenses = expenses.filter(e => e.date === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      };
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(category => ({
      name: category,
      total: expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)
    }));
  }, [expenses]);

  const summary = calculateSummary();

  useKeyboardShortcut([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => {
        const input = document.getElementById('description');
        if (input) {
          input.focus();
        }
      }
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: handleExport
    },
    {
      key: '?',
      callback: () => setShowShortcuts(prev => !prev)
    }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {showShortcuts && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowShortcuts(false)}
        >
          <motion.div
            className="glass-card max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900">Keyboard Shortcuts</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Add new expense</span>
                <kbd className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Export expenses</span>
                <kbd className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">Ctrl + E</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Show/hide shortcuts</span>
                <kbd className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">?</kbd>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Expenses
        </h1>
        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="neu-form"
      >
        <h2 className="neu-title">Add New Expense</h2>
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="success-toast mb-6"
            >
              Expense added successfully!
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="error-toast mb-6"
            >
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="expenseDate">
                Date
              </label>
              <input
                id="expenseDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="neu-input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(errors.filter(e => e.field !== 'description'));
              }}
              className="neu-input"
              placeholder="Enter expense description"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2" htmlFor="amount">
              Amount ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">$</span>
              </div>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors(errors.filter(e => e.field !== 'amount'));
                }}
                className="neu-input pl-8"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="continueMode"
              type="checkbox"
              checked={continueMode}
              onChange={(e) => setContinueMode(e.target.checked)}
              className="neu-checkbox"
            />
            <label htmlFor="continueMode" className="text-sm text-gray-600">
              Keep date and category for next entry
            </label>
          </div>
          <button
            type="submit"
            className="neu-button full-width md:w-auto md:min-w-[200px]"
          >
            Add Expense
          </button>
        </form>
      </motion.div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Expense Records</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors font-medium"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export Data
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Expense Summary</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card">
              <h3 className="text-lg font-medium text-white/90">This Month</h3>
              <p className="text-4xl font-bold mt-2">{formatCurrency(summary.monthlyTotal)}</p>
              <p className="text-sm text-white/75 mt-1">total expenses</p>
            </div>
            <div className="stat-card">
              <h3 className="text-lg font-medium text-white/90">This Year</h3>
              <p className="text-4xl font-bold mt-2">{formatCurrency(summary.yearlyTotal)}</p>
              <p className="text-sm text-white/75 mt-1">total expenses</p>
            </div>
            <div className="stat-card">
              <h3 className="text-lg font-medium text-white/90">Average Monthly</h3>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(summary.yearlyTotal / 12)}
              </p>
              <p className="text-sm text-white/75 mt-1">monthly average</p>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Daily Expenses (Last 30 Days)</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyExpenseData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={2}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Expenses']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Expenses by Category</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                  />
                  <Bar
                    dataKey="total"
                    fill="#6366f1"
                    name="Total"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Expenses</h2>
          <div className="text-sm text-gray-500">
            Showing {Math.min(expenses.length, 10)} of {expenses.length} entries
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.slice().reverse().map((expense) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">{expense.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className={`inline-flex items-center p-2 rounded-full
                          ${deleteConfirm === expense.id
                            ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                          } transition-colors`}
                        title={deleteConfirm === expense.id ? "Click again to confirm deletion" : "Delete expense"}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};