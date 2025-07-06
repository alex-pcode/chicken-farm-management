import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FlockProfile } from '../types';
import { fetchData } from '../utils/authApiUtils';
import { StatCard } from './testCom';

interface SavingsData {
  eggPrice: number;
  startingCost: number;
  totalEggs: number;
  totalExpenses: number;
  netSavings: number;
}

type TimePeriod = 'all' | 'month' | 'quarter' | 'year';

export const Savings = () => {
  const [eggPrice, setEggPrice] = useState('0.50'); // Default price per egg
  const [startingCost, setStartingCost] = useState('0.00'); // Default starting cost
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [savingsData, setSavingsData] = useState<SavingsData>({
    eggPrice: 0.50,
    startingCost: 0.00,
    totalEggs: 0,
    totalExpenses: 0,
    netSavings: 0
  });
  const [flockProfile, setFlockProfile] = useState<FlockProfile | null>(null);
  const [productivityStats, setProductivityStats] = useState({
    eggsPerHen: 0,
    dailyLayRate: 0,
    revenuePerHen: 0
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbData = await fetchData();
        if (dbData.flockProfile) {
          setFlockProfile(dbData.flockProfile);
        }
      } catch (error) {
        console.log('Failed to load profile from database:', error);
      }
    };
    
    loadData();
    calculateSavings();
  }, [eggPrice, startingCost, timePeriod]);  useEffect(() => {
    const calculateProductivityStats = async () => {
      if (flockProfile && flockProfile.hens > 0) {
        try {
          const dbData = await fetchData();
          const eggEntries = dbData.eggEntries || [];
          const totalEggs = eggEntries.reduce((sum: number, entry: { count: number }) => 
            sum + entry.count, 0);

          // Calculate eggs per hen
          const eggsPerHen = totalEggs / flockProfile.hens;

          // Calculate daily lay rate (last 7 days)
          const last7DaysEggs = eggEntries
            .slice(-7)
            .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);
          const dailyLayRate = (last7DaysEggs / (7 * flockProfile.hens)) * 100;

          // Calculate revenue per hen
          const revenuePerHen = eggsPerHen * parseFloat(eggPrice);

          setProductivityStats({
            eggsPerHen,
            dailyLayRate,
            revenuePerHen
          });
        } catch (error) {
          console.log('Failed to load egg data for productivity stats:', error);
        }
      }
    };
    
    calculateProductivityStats();
  }, [flockProfile, eggPrice, savingsData.totalEggs]);

  const getFilteredData = (date: string) => {
    const now = new Date();
    const entryDate = new Date(date);
    
    switch (timePeriod) {
      case 'month':
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
        return entryDate >= quarterStart;
      case 'year':
        return entryDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };
  const calculateSavings = async () => {
    try {
      const dbData = await fetchData();
      
      // Get egg data from database
      const eggEntries = dbData.eggEntries || [];
      const totalEggs = eggEntries
        .filter((entry: any) => getFilteredData(entry.date))
        .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);

      // Get expenses data from database
      const expenses = dbData.expenses || [];
      const operatingExpenses = expenses
        .filter((expense: any) => getFilteredData(expense.date))
        .reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);

      // Calculate total startup costs
      const totalStartupCosts = parseFloat(startingCost);

      // Calculate total egg value and net savings (including startup costs)
      const totalEggValue = totalEggs * parseFloat(eggPrice);
      const netSavings = totalEggValue - operatingExpenses - totalStartupCosts;

      setSavingsData({
        eggPrice: parseFloat(eggPrice),
        startingCost: parseFloat(startingCost),
        totalEggs,
        totalExpenses: operatingExpenses + totalStartupCosts,
        netSavings
      });
    } catch (error) {
      console.log('Failed to load data for savings calculation:', error);
    }
  };

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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Price Settings</h2>
          <div className="flex gap-2">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="neu-input px-4 py-2"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
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
              <label className="block text-gray-600 text-sm mb-2">Total Starting Cost</label>
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
                  className="neu-input pl-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Financial Summary</h2>
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
              <p className="text-sm text-white/90 mt-1">including startup costs</p>
            </div>

            <div className="stat-card">
              <h3 className="text-lg font-medium text-white">Net Profit/Loss</h3>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(savingsData.netSavings)}
              </p>
              <p className="text-sm text-white/90 mt-1">including startup costs</p>
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
                7-day average lay rate
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
            {flockProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="🐔 Productive Hens" total={flockProfile.hens} label="hens" />
                <StatCard title="🐓 Roosters" total={flockProfile.roosters} label="roosters" />
                <StatCard title="🐥 Growing Chicks" total={flockProfile.chicks} label="chicks" />
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
    </motion.div>
  );
};