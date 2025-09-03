import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOptimizedAppData, useSalesSummary } from '../contexts/OptimizedDataProvider';
import { useAuth } from '../contexts/AuthContext';
import { 
  StatCard, 
  MetricDisplay, 
  PageContainer, 
  GridContainer 
} from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import AnimatedSavingsPNG from './AnimatedSavingsPNG';
import { SelectInput } from './forms';
import { apiService } from '../services/api';
import type { EggEntry, Expense, FlockSummary } from '../types';

type TimePeriod = 'all' | 'month' | 'year' | 'custom';

export const Savings = () => {
  const { data, isLoading } = useOptimizedAppData();
  const salesSummary = useSalesSummary();
  const { user } = useAuth();
  const [flockSummary, setFlockSummary] = useState<FlockSummary | null>(null);
  const [flockLoading, setFlockLoading] = useState(true);
  
  // Get egg price from user metadata, fallback to default
  const eggPrice = user?.user_metadata?.egg_price || 0.30;
  const [startingCost] = useState('0.00'); // Default starting cost
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

  // Check if user is business-focused
  const isBusinessGoal = user?.user_metadata?.chicken_goal === 'business';

  // Memoized savings calculations
  const savingsData = useMemo(() => {
    if (isLoading) {
      return {
        eggPrice: eggPrice,
        startingCost: parseFloat(startingCost),
        totalEggs: 0,
        totalExpenses: 0,
        netSavings: 0,
        actualRevenue: 0
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
    
    // For hobby users: theoretical value based on store egg prices
    const totalEggValue = totalEggs * eggPrice;
    
    // For business users: actual revenue from sales
    const actualRevenue = salesSummary?.total_revenue || 0;
    
    // Calculate net result based on user goal
    const netResult = isBusinessGoal 
      ? actualRevenue - operatingExpenses - totalStartupCosts  // Profit for business users
      : totalEggValue - operatingExpenses - totalStartupCosts; // Savings for hobby users

    return {
      eggPrice: eggPrice,
      startingCost: totalStartupCosts,
      totalEggs,
      totalExpenses: operatingExpenses + totalStartupCosts,
      netSavings: netResult,
      actualRevenue
    };
  }, [data, eggPrice, startingCost, getFilteredData, isLoading, timePeriod, isBusinessGoal, salesSummary]);



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
        className="w-full mt-8 mb-4"
      >
        <AnimatedSavingsPNG />
      </motion.div>

      {isLoading || flockLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold" style={{ color: '#111827', marginBottom: 0 }}>
            {isBusinessGoal ? "Business Performance" : "Financial Summary"}
          </h2>
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
          <div className="mb-8 p-6 glass-card">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
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
          <GridContainer columns={{ sm: 1, md: 2, lg: 4 }} gap="lg">
            <StatCard
              title="You Got"
              total={savingsData.totalEggs}
              label="eggs without breaking them"
              icon="🥚"
              variant="dark"
            />
            
            <StatCard
              title={isBusinessGoal ? "You Earned" : "You Saved"}
              total={formatCurrency(isBusinessGoal ? savingsData.actualRevenue : savingsData.totalEggs * savingsData.eggPrice)}
              label={isBusinessGoal ? "from egg sales" : "vs buying organic eggs"}
              icon="💰"
              variant="dark"
            />

            <StatCard
              title="You Invested"
              total={formatCurrency(savingsData.totalExpenses)}
              label="in chicken happiness"
              icon="❤️"
              variant="dark"
            />

            <StatCard
              title={isBusinessGoal ? "Net Profit" : "Net Savings"}
              total={formatCurrency(savingsData.netSavings)}
              label={isBusinessGoal 
                ? (savingsData.netSavings >= 0 ? "business profit" : "to break even")
                : (savingsData.netSavings >= 0 ? "of delicious egg value" : "egg value to cover costs")
              }
              icon={savingsData.netSavings >= 0 ? (isBusinessGoal ? '📈' : '😋') : '🤝'}
              variant="dark"
            />
          </GridContainer>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3" style={{ color: '#111827' }}>Lifetime Impact</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="You've Gone"
              total={(() => {
                // Use all egg entries for lifetime calculation
                const allEntries = data.eggEntries;
                if (allEntries.length === 0) return 0;
                
                const dates = allEntries.map((entry: EggEntry) => new Date(entry.date));
                const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
                return Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              })()}
              label="days without buying eggs"
              icon="🏪"
              variant="corner-gradient"
            />

            <StatCard
              title="You've Given"
              total={salesSummary?.free_eggs_given || 0}
              label="eggs for free (lifetime)"
              icon="🎁"
              variant="corner-gradient"
            />

            <StatCard
              title="You've Eaten"
              total={(() => {
                // Use all eggs for lifetime calculation
                const totalLifetimeEggs = data.eggEntries.reduce((sum: number, entry: { count: number }) => sum + entry.count, 0);
                const eggsSold = salesSummary?.total_eggs_sold || 0;
                const eggsGiven = salesSummary?.free_eggs_given || 0;
                const eggsConsumed = totalLifetimeEggs - eggsSold - eggsGiven;
                return Math.floor(eggsConsumed / 5);
              })()}
              label="omelettes (5 eggs each)"
              icon="🍳"
              variant="corner-gradient"
            />

            <StatCard
              title="You Saw"
              total={(() => {
                // Use all egg entries for lifetime calculation
                const allEntries = data.eggEntries;
                if (allEntries.length === 0) return 0;
                
                const dates = allEntries.map((entry: EggEntry) => new Date(entry.date));
                const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
                const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return Math.floor(totalDays * 0.5);
              })()}
              label="hours of chicken comedy"
              icon="📺"
              variant="corner-gradient"
            />

            <StatCard
              title="You Saved"
              total={(() => {
                // For now, use current total birds + deaths as an approximation
                // This isn't perfect since we don't have the actual totalInitial from the API
                if (!flockSummary) return 0;
                return flockSummary.totalBirds + flockSummary.totalDeaths;
              })()}
              label="chickens from caged life"
              icon="🕊️"
              variant="corner-gradient"
            />

            <StatCard
              title="You Raised"
              total={(() => {
                if (!flockSummary?.batchSummary) return 0;
                return flockSummary.batchSummary.filter(batch => batch.ageAtAcquisition === 'chick').length;
              })()}
              label="flocks from baby chickens"
              icon="🐣"
              variant="corner-gradient"
            />
          </div>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3" style={{ color: '#111827' }}>
          {isBusinessGoal ? "Profitability Analysis" : "Cost Analysis"}
        </h2>
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
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: '#6B7280' }}>No egg production data available</p>
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
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: '#6B7280' }}>No egg production data available</p>
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
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: '#6B7280' }}>Insufficient data for break-even analysis</p>
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