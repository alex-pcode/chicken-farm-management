import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { StatCard } from './testCom';
import { LoadingSpinner } from './LoadingSpinner';
import AnimatedSavingsPNG from './AnimatedSavingsPNG';

type TimePeriod = 'all' | 'month' | 'year' | 'custom';

export const Savings = () => {
  const { data, isLoading } = useOptimizedAppData();
  const [eggPrice, setEggPrice] = useState('0.30'); // Default price per egg
  const [startingCost, setStartingCost] = useState('0.00'); // Default starting cost
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Memoized filter function
  const getFilteredData = useCallback((date: string) => {
    const now = new Date();
    const entryDate = new Date(date);
    
    switch (timePeriod) {
      case 'month':
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      case 'year':
        return entryDate.getFullYear() === now.getFullYear();
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999); // Include the full end date
          return entryDate >= startDate && entryDate <= endDate;
        } else {
          // Default to last 3 months if no custom dates are set
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return entryDate >= threeMonthsAgo;
        }
      default:
        return true;
    }
  }, [timePeriod, customStartDate, customEndDate]);

  // Memoized savings calculations
  const savingsData = useMemo(() => {
    if (isLoading) {
      return {
        eggPrice: parseFloat(eggPrice),
        startingCost: parseFloat(startingCost),
        totalEggs: 0,
        totalExpenses: 0,
        netSavings: 0
      };
    }

    // Calculate filtered totals
    const totalEggs = data.eggEntries
      .filter((entry: any) => getFilteredData(entry.date))
      .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);

    const operatingExpenses = data.expenses
      .filter((expense: any) => getFilteredData(expense.date))
      .reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);

    // Only include startup costs for "All Time" view, not for specific periods
    const totalStartupCosts = timePeriod === 'all' ? parseFloat(startingCost) : 0;
    const totalEggValue = totalEggs * parseFloat(eggPrice);
    const netSavings = totalEggValue - operatingExpenses - totalStartupCosts;

    return {
      eggPrice: parseFloat(eggPrice),
      startingCost: totalStartupCosts,
      totalEggs,
      totalExpenses: operatingExpenses + totalStartupCosts,
      netSavings
    };
  }, [data, eggPrice, startingCost, getFilteredData, isLoading, timePeriod]);

  // Memoized productivity calculations
  const productivityStats = useMemo(() => {
    if (isLoading || !data.flockProfile || data.flockProfile.hens === 0) {
      return { eggsPerHen: 0, dailyLayRate: 0, revenuePerHen: 0 };
    }

    // Use filtered eggs for the selected time period
    const filteredEggs = data.eggEntries
      .filter((entry: any) => getFilteredData(entry.date))
      .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);

    // Calculate eggs per hen for the selected period
    const eggsPerHen = filteredEggs / data.flockProfile.hens;

    // Calculate daily lay rate for the selected period
    let dailyLayRate = 0;
    const filteredEntries = data.eggEntries.filter((entry: any) => getFilteredData(entry.date));
    
    if (filteredEntries.length > 0) {
      // Get the date range of filtered entries
      const dates = filteredEntries.map((entry: any) => new Date(entry.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      dailyLayRate = (filteredEggs / (daysDiff * data.flockProfile.hens)) * 100;
    }

    // Calculate revenue per hen for the selected period
    const revenuePerHen = eggsPerHen * parseFloat(eggPrice);

    return { eggsPerHen, dailyLayRate, revenuePerHen };
  }, [data, eggPrice, isLoading, getFilteredData]);

  const handleEggPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEggPrice(e.target.value);
  };

  const handleStartingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartingCost(e.target.value);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto p-6"
      style={{ margin: '0px auto', opacity: 1 }}
    >
      {/* Animated Savings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mt-5 mb-0"
      >
        <AnimatedSavingsPNG />
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div>
        <div className="neu-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Price per Egg</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={eggPrice}
                  onChange={handleEggPriceChange}
                  className="neu-input pl-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Total Starting Cost
                {timePeriod !== 'all'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={startingCost}
                  onChange={handleStartingCostChange}
                  className={`neu-input pl-8 ${timePeriod !== 'all' ? 'opacity-60' : ''}`}
                  title={timePeriod !== 'all' ? 'Starting costs are only included when viewing "All Time" data' : ''}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Financial Summary</h2>
          <div className="flex gap-2">
            <select
              value={timePeriod}
              onChange={(e) => {
                const newPeriod = e.target.value as TimePeriod;
                setTimePeriod(newPeriod);
                
                // Set default date range when switching to custom
                if (newPeriod === 'custom' && !customStartDate && !customEndDate) {
                  const today = new Date();
                  const threeMonthsAgo = new Date(today);
                  threeMonthsAgo.setMonth(today.getMonth() - 3);
                  
                  setCustomStartDate(threeMonthsAgo.toISOString().split('T')[0]);
                  setCustomEndDate(today.toISOString().split('T')[0]);
                }
              }}
              className="neu-input px-4 py-2"
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Period</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {timePeriod === 'custom' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card backdrop-blur-md border border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stat-card">
              <h3 className="text-lg font-medium text-white">Total Eggs</h3>
              <p className="text-4xl font-bold mt-2">{savingsData.totalEggs}</p>
              <p className="text-sm text-white/90 mt-1">collected eggs</p>
            </div>
            
            <div className="stat-card">
              <h3 className="text-lg font-medium text-white">Egg Value</h3>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(savingsData.totalEggs * savingsData.eggPrice)}
              </p>
              <p className="text-sm text-white/90 mt-1">total potential revenue</p>
            </div>

            <div className="stat-card">
              <h3 className="text-lg font-medium text-white">Operating Expenses</h3>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(savingsData.totalExpenses)}
              </p>
              <p className="text-sm text-white/90 mt-1">
                {timePeriod === 'all' ? 'including startup costs' : 'period expenses only'}
              </p>
            </div>

            <div className="stat-card">
              <h3 className="text-lg font-medium text-white">Net Profit/Loss</h3>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(savingsData.netSavings)}
              </p>
              <p className="text-sm text-white/90 mt-1">
                {timePeriod === 'all' ? 'including startup costs' : 'period profit only'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Productivity Analysis</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eggs per Hen</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                {productivityStats.eggsPerHen.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {timePeriod === 'all' ? 'lifetime' : timePeriod} eggs per hen
              </p>
            </div>

            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lay Rate</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                {productivityStats.dailyLayRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                average daily lay rate
              </p>
            </div>

            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue per Hen</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                ${productivityStats.revenuePerHen.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {timePeriod === 'all' ? 'lifetime' : timePeriod} revenue per hen
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Flock Composition</h3>
            {data.flockProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="🐔 Productive Hens" total={data.flockProfile.hens} label="hens" />
                <StatCard title="🐓 Roosters" total={data.flockProfile.roosters} label="roosters" />
                <StatCard title="🐥 Growing Chicks" total={data.flockProfile.chicks} label="chicks" />
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6">
                No flock profile data available. Please set up your profile first.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Profitability Analysis</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card bg-white/50">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cost per Egg</h3>
              {savingsData.totalEggs > 0 ? (
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    {formatCurrency(savingsData.totalExpenses / savingsData.totalEggs)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    total cost per egg (incl. startup)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No egg production data available</p>
              )}
            </div>

            <div className="glass-card bg-white/50">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profit Margin per Egg</h3>
              {savingsData.totalEggs > 0 ? (
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    {formatCurrency(savingsData.eggPrice - (savingsData.totalExpenses / savingsData.totalEggs))}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    net profit per egg (incl. startup)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No egg production data available</p>
              )}
            </div>

            <div className="glass-card bg-white/50">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Break-even Point</h3>
              {savingsData.totalExpenses > 0 && savingsData.eggPrice > 0 ? (
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                    {Math.ceil(savingsData.totalExpenses / savingsData.eggPrice)} eggs
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    to cover all costs (incl. startup)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Insufficient data for break-even analysis</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
        </>
      )}
    </motion.div>
  );
};