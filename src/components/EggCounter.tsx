"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { useKeyboardShortcut } from '../utils/useKeyboardShortcut';
import { apiCall, fetchData } from '../utils/apiUtils';
import { exportToCSV } from '../utils/exportUtils';
import type { EggEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ValidationError {
  field: string;
  message: string;
}

const saveToDatabase = async (updatedEntries: EggEntry[]) => {
  try {
    // Ensure all entries have IDs before saving
    const entriesWithIds = updatedEntries.map(entry => ({
      ...entry,
      id: entry.id || uuidv4()
    }));
    await apiCall('/saveEggEntries', entriesWithIds);
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

export const EggCounter = () => {
  const [eggEntries, setEggEntries] = useState<EggEntry[]>([]);
  const [count, setCount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {        
        // Try to fetch data from database first
        const dbData = await fetchData();
        const entries: EggEntry[] = dbData.eggEntries || [];
        
        // Ensure all entries have IDs
        const entriesWithIds = entries.map(entry => ({
          ...entry,
          id: entry.id || uuidv4() // Assign UUID if missing
        }));
        
        setEggEntries(entriesWithIds.sort((a: EggEntry, b: EggEntry) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));      } catch (error) {
        console.error('Failed to load from database:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    
    if (!count) {
      newErrors.push({ field: 'count', message: 'Please enter the number of eggs' });
    } else {
      const numCount = parseInt(count);
      if (isNaN(numCount) || numCount < 0) {
        newErrors.push({ field: 'count', message: 'Please enter a valid number of eggs' });
      } else if (numCount > 100) {
        newErrors.push({ field: 'count', message: 'Value seems unusually high. Please verify.' });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const existingEntry = eggEntries.find(entry => entry.date === selectedDate);
      let updatedEntries: EggEntry[];      if (existingEntry) {
        if (!window.confirm('An entry for this date already exists. Do you want to update it?')) {
          return;
        }
        updatedEntries = eggEntries.map(entry =>
          entry.date === selectedDate ? { ...entry, count: parseInt(count) } : entry
        );
      } else {
        const newEntry: EggEntry = { 
          id: uuidv4(),
          date: selectedDate, 
          count: parseInt(count) 
        };
        updatedEntries = [...eggEntries, newEntry].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }

      // Save to database
      await saveToDatabase(updatedEntries);
      
      // Update local state only after successful save
      setEggEntries(updatedEntries);
      setCount('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving egg entry:', error);
      setErrors([{ field: 'submit', message: 'Failed to save entry. Please try again.' }]);
    }
  };

  const calculateSummary = () => {
    const total = eggEntries.reduce((sum, entry) => sum + entry.count, 0);

    // Calculate this week (Monday-Sunday)
    const thisWeek = eggEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    }).reduce((sum, entry) => sum + entry.count, 0);

    // Calculate this month
    const thisMonth = eggEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    }).reduce((sum, entry) => sum + entry.count, 0);

    // Calculate last 7 days
    const last7Days = eggEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return entryDate >= weekAgo && entryDate <= now;
    }).reduce((sum, entry) => sum + entry.count, 0);

    // Calculate last 30 days
    const last30Days = eggEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return entryDate >= thirtyDaysAgo && entryDate <= now;
    }).reduce((sum, entry) => sum + entry.count, 0);

    // Calculate daily average (based on the first entry date)
    let dailyAverage = 0;
    if (eggEntries.length > 0) {
      const sortedEntries = [...eggEntries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstDate = new Date(sortedEntries[0].date);
      const now = new Date();
      const daysDiff = Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      dailyAverage = Math.round((total / daysDiff) * 10) / 10;
    }

    return { total, thisWeek, thisMonth, last7Days, last30Days, dailyAverage };
  };

  const summary = calculateSummary();

  const handleExport = () => {
    const exportData = eggEntries.map(entry => ({
      Date: entry.date,
      'Egg Count': entry.count,
    }));
    exportToCSV(exportData, `egg-production-${new Date().toISOString().split('T')[0]}.csv`);
  };

  useKeyboardShortcut([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => {
        const input = document.getElementById('eggCount');
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

  // Calculate pagination values
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = eggEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(eggEntries.length / entriesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-3xl mx-auto py-8"
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
                <span className="text-gray-600">Focus egg count input</span>
                <kbd className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Export data</span>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="neu-form"
      >
        <h2 className="neu-title">Log Daily Eggs</h2>
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="success-toast mb-6"
            >
              Egg count saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="eggDate">
                Date
              </label>
              <input
                id="eggDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="neu-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2" htmlFor="eggCount">
                Number of Eggs
              </label>
              <input
                id="eggCount"
                type="number"
                min="0"
                value={count}
                onChange={(e) => {
                  setCount(e.target.value);
                  setErrors([]);
                }}
                className="neu-input"
                placeholder="Enter egg count"
                required
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="error-toast"
              >
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" className="neu-button full-width md:w-auto md:min-w-[200px]">
            Log Eggs
          </button>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">This Week</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.thisWeek}</p>
          <p className="text-sm text-gray-500 mt-1">eggs collected</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">This Month</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.thisMonth}</p>
          <p className="text-sm text-gray-500 mt-1">eggs collected</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">Total</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.total}</p>
          <p className="text-sm text-gray-500 mt-1">eggs collected</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">7 Days</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.last7Days}</p>
          <p className="text-sm text-gray-500 mt-1">rolling weekly total</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">30 Days</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.last30Days}</p>
          <p className="text-sm text-gray-500 mt-1">rolling monthly total</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="neu-stat"
        >
          <h3 className="text-lg font-medium text-gray-600">Average</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">{summary.dailyAverage}</p>
          <p className="text-sm text-gray-500 mt-1">eggs per day</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Entries</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.date + index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.count}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastEntry, eggEntries.length)}
                    </span>{' '}
                    of <span className="font-medium">{eggEntries.length}</span> entries
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2
                        ${currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      ←
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                          ${currentPage === index + 1
                            ? 'z-10 bg-indigo-600 text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2
                        ${currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
