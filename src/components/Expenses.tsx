import { useState, useEffect, useMemo } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import type { Expense } from '../types';
import { saveExpenses } from '../utils/authApiUtils';
import { useExpenses } from '../contexts/DataContext';
import { AnimatedCoinPNG } from './AnimatedCoinPNG';

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

const saveToDatabase = async (expenses: Expense[]) => {
  try {
    await saveExpenses(expenses);
  } catch (error) {
    console.error('Error saving to database:', error);
  }
};

export const Expenses = () => {
  const { expenses: cachedExpenses, isLoading: dataLoading, updateExpenses } = useExpenses();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [continueMode, setContinueMode] = useState(false);  
  
  useEffect(() => {
    if (!dataLoading) {
      setExpenses(cachedExpenses);
      setIsLoading(false);
    }
  }, [cachedExpenses, dataLoading]);

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
    };    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    updateExpenses(updatedExpenses);
    
    // Save to database
    saveToDatabase(updatedExpenses);

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
    if (deleteConfirm === id) {      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      updateExpenses(updatedExpenses);
      
      // Save to database
      saveToDatabase(updatedExpenses);
      
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
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
  const categoryData = useMemo(() => {
    return CATEGORIES.map(category => ({
      name: category,
      total: expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)
    }));
  }, [expenses]);

  const summary = calculateSummary();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto pt-20"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {/* Animated Piggy Bank Section - Testing (will be for new users) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <AnimatedCoinPNG />
      </motion.div>

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
      </motion.div>      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
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
        </div>        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Date</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Category</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Description</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Amount</th>
                  <th className="px-2 md:px-6 py-2 md:py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Actions</th>
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
                      {expense.id && (
                        <button
                          onClick={() => handleDelete(expense.id!)}
                          className={`inline-flex items-center p-2 rounded-full
                            ${deleteConfirm === expense.id
                              ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                            } transition-colors`}
                          title={deleteConfirm === expense.id ? "Click again to confirm deletion" : "Delete expense"}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
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