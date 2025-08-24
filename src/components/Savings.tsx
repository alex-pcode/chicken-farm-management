import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider';
import { 
  StatCard, 
  MetricDisplay, 
  PageContainer, 
  GridContainer 
} from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import AnimatedSavingsPNG from './AnimatedSavingsPNG';
import { SelectInput, NumberInput, FormGroup } from './forms';
import { apiService } from '../services/api';
import type { EggEntry, Expense, FlockSummary } from '../types';

type TimePeriod = 'all' | 'month' | 'year' | 'custom';

export const Savings = () => {
  const { data, isLoading } = useOptimizedAppData();
  const [flockSummary, setFlockSummary] = useState<FlockSummary | null>(null);
  const [flockLoading, setFlockLoading] = useState(true);
  const [eggPrice, setEggPrice] = useState('0.30'); // Default price per egg
  const [startingCost, setStartingCost] = useState('0.00'); // Default starting cost
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch flock summary data
  useEffect(() => {
    const fetchFlockSummary = async () => {
      if (!isLoading) {
        try {
          setFlockLoading(true);
          const response = await apiService.flock.getFlockSummary();
          if (response.success && response.data) {
            const summaryData = response.data as { summary?: FlockSummary };
            setFlockSummary(summaryData.summary || null);
          } else {
            setFlockSummary(null);
          }
        } catch (error) {
          console.error('Error fetching flock summary:', error);
          setFlockSummary(null);
        } finally {
          setFlockLoading(false);
        }
      }
    };

    fetchFlockSummary();
  }, [isLoading]);

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
      .filter((entry: EggEntry) => getFilteredData(entry.date))
      .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);

    const operatingExpenses = data.expenses
      .filter((expense: Expense) => getFilteredData(expense.date))
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

  // Memoized productivity calculations using FlockSummary data
  const productivityStats = useMemo(() => {
    if (isLoading || flockLoading || !flockSummary) {
      return { 
        eggsPerHen: 0, 
        dailyLayRate: 0, 
        revenuePerHen: 0,
        layingHens: 0,
        notLayingHens: 0,
        broodingHens: 0
      };
    }

    // Use laying hens specifically for calculations
    const layingHens = flockSummary.expectedLayers || 0;
    const notLayingHens = (flockSummary.totalHens || 0) - layingHens - (flockSummary.totalBrooding || 0);
    const broodingHens = flockSummary.totalBrooding || 0;

    if (layingHens === 0) {
      return { 
        eggsPerHen: 0, 
        dailyLayRate: 0, 
        revenuePerHen: 0,
        layingHens,
        notLayingHens,
        broodingHens
      };
    }

    // Use filtered eggs for the selected time period
    const filteredEggs = data.eggEntries
      .filter((entry: EggEntry) => getFilteredData(entry.date))
      .reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);

    // Calculate eggs per laying hen for the selected period
    const eggsPerHen = filteredEggs / layingHens;

    // Calculate daily lay rate for the selected period
    let dailyLayRate = 0;
    const filteredEntries = data.eggEntries.filter((entry: EggEntry) => getFilteredData(entry.date));
    
    if (filteredEntries.length > 0) {
      // Get the date range of filtered entries
      const dates = filteredEntries.map((entry: EggEntry) => new Date(entry.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      // Use laying hens for daily lay rate calculation
      dailyLayRate = (filteredEggs / (daysDiff * layingHens)) * 100;
    }

    // Calculate revenue per laying hen for the selected period
    const revenuePerHen = eggsPerHen * parseFloat(eggPrice);

    return { 
      eggsPerHen, 
      dailyLayRate, 
      revenuePerHen,
      layingHens,
      notLayingHens,
      broodingHens
    };
  }, [data, eggPrice, isLoading, flockLoading, flockSummary, getFilteredData]);

  const handleEggPriceChange = (value: number) => {
    setEggPrice(value.toString());
  };

  const handleStartingCostChange = (value: number) => {
    setStartingCost(value.toString());
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <PageContainer maxWidth="xl" padding="md" animated={true}>
      {/* Animated Savings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mt-5 mb-12"
      >
        <AnimatedSavingsPNG />
      </motion.div>

      {isLoading || flockLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-form mb-16"
      >
        <FormGroup 
          title="Pricing Configuration"
          description="Set your egg pricing and initial investment costs"
          columns={2}
          gap="lg"
        >
          <NumberInput
            label="Price per Egg ($)"
            value={parseFloat(eggPrice) || 0}
            onChange={handleEggPriceChange}
            step={0.01}
            min={0}
            placeholder="0.30"
            showSpinner={false}
            selectAllOnFocus={true}
          />
          
          <NumberInput
            label="Total Starting Cost ($)"
            value={parseFloat(startingCost) || 0}
            onChange={handleStartingCostChange}
            step={0.01}
            min={0}
            placeholder="0.00"
            showSpinner={false}
            disabled={timePeriod !== 'all'}
            className={timePeriod !== 'all' ? 'opacity-60' : ''}
          />
        </FormGroup>
        
        {timePeriod !== 'all' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm" style={{ color: '#602AE9' }}>
              <strong>Note:</strong> Starting costs are only included when viewing "All Time" data.
            </p>
          </div>
        )}
      </motion.div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '10px' }}>Financial Summary</h2>
          <div className="w-48">
            <SelectInput
              label=""
              value={timePeriod}
              onChange={(value) => {
                const newPeriod = value as TimePeriod;
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
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Period' },
                { value: 'all', label: 'All Time' }
              ]}
            />
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
        >
          <GridContainer columns={4} gap="lg">
            <StatCard
              title="Total Eggs"
              total={savingsData.totalEggs}
              label="collected eggs"
              icon="🥚"
              variant="corner-gradient"
            />
            
            <StatCard
              title="Egg Value"
              total={formatCurrency(savingsData.totalEggs * savingsData.eggPrice)}
              label="total potential revenue"
              icon="💰"
              variant="corner-gradient"
            />

            <StatCard
              title="Operating Expenses"
              total={formatCurrency(savingsData.totalExpenses)}
              label={timePeriod === 'all' ? 'including startup costs' : 'period expenses only'}
              icon="📊"
              variant="corner-gradient"
            />

            <StatCard
              title="Net Profit/Loss"
              total={formatCurrency(savingsData.netSavings)}
              label={timePeriod === 'all' ? 'including startup costs' : 'period profit only'}
              icon={savingsData.netSavings >= 0 ? '📈' : '📉'}
              variant="corner-gradient"
            />
          </GridContainer>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '10px' }}>Productivity Analysis</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-12"
        >
          <div className="mb-12">
            {flockSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard 
                  title="Laying Hens" 
                  total={productivityStats.layingHens} 
                  label={`${Math.ceil((flockSummary.batchSummary?.filter(b => b.isLayingAge).length || 0))} batches laying`}
                  icon="🐔"
                  variant="corner-gradient"
                  testId="laying-hens-stat"
                />
                <StatCard 
                  title="Not Laying" 
                  total={productivityStats.notLayingHens} 
                  label={`${Math.ceil((flockSummary.batchSummary?.filter(b => !b.isLayingAge && b.type === 'hens').length || 0))} batches not laying`}
                  icon="⏳"
                  variant="corner-gradient"
                  testId="not-laying-hens-stat"
                />
                <StatCard 
                  title="Brooding Hens" 
                  total={productivityStats.broodingHens} 
                  label={`${Math.ceil((flockSummary.batchSummary?.filter(b => b.type === 'brooding').length || 0))} batches brooding`}
                  icon="🪺"
                  variant="corner-gradient"
                  testId="brooding-hens-stat"
                />
                <StatCard 
                  title="Roosters" 
                  total={flockSummary.totalRoosters} 
                  label={`${Math.ceil((flockSummary.batchSummary?.filter(b => b.type === 'roosters').length || 0))} batches`}
                  icon="🐓"
                  variant="corner-gradient"
                  testId="roosters-stat"
                />
                <StatCard 
                  title="Chicks" 
                  total={flockSummary.totalChicks} 
                  label={`${Math.ceil((flockSummary.batchSummary?.filter(b => b.type === 'chicks').length || 0))} batches`}
                  icon="🐥"
                  variant="corner-gradient"
                  testId="chicks-stat"
                />
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6">
                No flock data available. Please set up your batches in the Flock Management section first.
              </div>
            )}
          </div>

          <GridContainer columns={3} gap="lg">
            <MetricDisplay
              value={productivityStats.eggsPerHen.toFixed(1)}
              label={`${timePeriod === 'all' ? 'lifetime' : timePeriod} eggs per hen`}
              format="decimal"
              precision={1}
              variant="default"
              color="default"
            />

            <MetricDisplay
              value={productivityStats.dailyLayRate.toFixed(1)}
              label="average daily lay rate"
              format="percentage"
              precision={1}
              variant="default"
              color="default"
            />

            <MetricDisplay
              value={productivityStats.revenuePerHen}
              label={`${timePeriod === 'all' ? 'lifetime' : timePeriod} revenue per hen`}
              format="currency"
              precision={2}
              variant="default"
              color="default"
            />
          </GridContainer>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '10px' }}>Profitability Analysis</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GridContainer columns={3} gap="lg">
            {savingsData.totalEggs > 0 ? (
              <MetricDisplay
                value={savingsData.totalExpenses / savingsData.totalEggs}
                label="total cost per egg (incl. startup)"
                format="currency"
                precision={3}
                variant="default"
                color="info"
              />
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-500">No egg production data available</p>
              </div>
            )}

            {savingsData.totalEggs > 0 ? (
              <MetricDisplay
                value={savingsData.eggPrice - (savingsData.totalExpenses / savingsData.totalEggs)}
                label="net profit per egg (incl. startup)"
                format="currency"
                precision={3}
                variant="default"
                color={savingsData.eggPrice - (savingsData.totalExpenses / savingsData.totalEggs) >= 0 ? "success" : "danger"}
              />
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-500">No egg production data available</p>
              </div>
            )}

            {savingsData.totalExpenses > 0 && savingsData.eggPrice > 0 ? (
              <MetricDisplay
                value={Math.ceil(savingsData.totalExpenses / savingsData.eggPrice)}
                label="eggs to cover all costs (incl. startup)"
                format="number"
                precision={0}
                variant="default"
                color="warning"
                unit="eggs"
              />
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-gray-500">Insufficient data for break-even analysis</p>
              </div>
            )}
          </GridContainer>
        </motion.div>
      </div>
        </>
      )}
    </PageContainer>
  );
};