import { useMemo } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useOptimizedAppData } from '../contexts/OptimizedDataProvider'
import { useOnboarding } from '../contexts/OnboardingProvider'
import { SetupProgress } from './onboarding'
import { StatCard, PageContainer, SectionContainer, GridContainer, ChartCard } from './ui'

export const Dashboard = () => {
  const { data, isLoading } = useOptimizedAppData();
  const { onboardingState, calculateProgress, restartOnboarding } = useOnboarding();
  
  // Memoize expensive calculations based on data changes only
  const stats = useMemo(() => {
    if (isLoading || !data) {
      return {
        totalEggs: 0,
        dailyAverage: 0,
        last7DaysTotal: 0,
        previous7DaysTotal: 0,
        thisMonthProduction: 0,
        lastMonthProduction: 0,
        eggValue: 0,
        revenue: 0,
        freeEggs: 0,
        last30DaysData: [] as { date: string; count: number }[],
        weeklyRevenueData: [] as { week: string; revenue: number }[]
      };
    }
    
    const eggEntries = data.eggEntries || [];
    const sales = data.sales || [];
    
    // Pre-calculate date boundaries to avoid repeated calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Use date arithmetic with proper time boundaries for inclusive filtering
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Set to start of day to be inclusive
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Calculate 7-day periods with proper time boundaries
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);
    
    // Single pass through egg entries with category tracking
    let totalEggs = 0;
    const last7DaysEntries = [];
    const previous7DaysEntries = [];
    let thisMonthProduction = 0;
    let lastMonthProduction = 0;
    const thisMonthEntries = [];
    
    for (const entry of eggEntries) {
      const entryDate = new Date(entry.date);
      const entryMonth = entryDate.getMonth();
      const entryYear = entryDate.getFullYear();
      
      // Total eggs (always count)
      totalEggs += entry.count;
      
      // Last 7 days check - collect entries (ensure date comparison is at start of day)
      const entryAtMidnight = new Date(entry.date + 'T00:00:00');
      if (entryAtMidnight >= sevenDaysAgo) {
        last7DaysEntries.push(entry);
      }
      
      // Previous 7 days check - collect entries (ensure date comparison is at start of day)
      if (entryAtMidnight >= fourteenDaysAgo && entryAtMidnight < sevenDaysAgo) {
        previous7DaysEntries.push(entry);
      }
      
      // This month check
      if (entryMonth === currentMonth && entryYear === currentYear) {
        thisMonthProduction += entry.count;
        thisMonthEntries.push(entry);
      }
      
      // Last month check
      if (entryMonth === lastMonth && entryYear === lastMonthYear) {
        lastMonthProduction += entry.count;
      }
    }
    
    // Calculate totals from actual entries
    const last7DaysTotal = last7DaysEntries.reduce((sum, entry) => sum + entry.count, 0);
    const previous7DaysTotal = previous7DaysEntries.reduce((sum, entry) => sum + entry.count, 0);
    
    // Monthly-based daily average: thisMonth total / last entry date
    let dailyAverage = 0;
    if (thisMonthEntries.length > 0) {
      const lastDateThisMonth = Math.max(...thisMonthEntries.map(entry => new Date(entry.date).getDate()));
      dailyAverage = thisMonthProduction / lastDateThisMonth;
    }
    
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
    
    // Weekly revenue data for last 12 weeks
    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    const weeklyRevenueMap = new Map();
    for (const sale of sales) {
      const saleDate = new Date(sale.sale_date);
      const weekStart = getWeekStart(saleDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyRevenueMap.has(weekKey)) {
        weeklyRevenueMap.set(weekKey, 0);
      }
      weeklyRevenueMap.set(weekKey, weeklyRevenueMap.get(weekKey) + sale.total_amount);
    }
    
    // Generate last 12 weeks of data
    const weeklyRevenueData = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeklyRevenueData.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        revenue: weeklyRevenueMap.get(weekKey) || 0
      });
    }
    
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
        last7DaysTotal,
        previous7DaysTotal,
        thisMonthProduction,
        lastMonthProduction,
        eggValue: Math.round(eggValue * 100) / 100, // Round to 2 decimal places
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
        freeEggs,
        last30DaysData,
        weeklyRevenueData
      };
  }, [data, isLoading]);

  // Calculate setup progress for new users
  const progressInfo = useMemo(() => {
    if (!onboardingState.showGuidance) return null;
    return calculateProgress();
  }, [onboardingState.showGuidance, calculateProgress]);

  // Handle action clicks from progress components
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'add-eggs':
        // Navigate to egg counter
        window.location.href = '/egg-counter';
        break;
      case 'add-expense':
        // Navigate to expenses
        window.location.href = '/expenses';
        break;
      case 'add-customer':
      case 'add-sale':
        // Navigate to CRM
        window.location.href = '/crm';
        break;
      case 'add-feed':
        // Navigate to feed tracker
        window.location.href = '/feed-tracker';
        break;
      case 'add-batch':
        // Navigate to profile for batch management
        window.location.href = '/profile';
        break;
      case 'setup-flock':
        // Navigate to profile
        window.location.href = '/profile';
        break;
      case 'complete-onboarding':
        // Restart onboarding flow for users who skipped initially
        restartOnboarding();
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  return (
    <PageContainer 
      maxWidth="xl"
      padding="none"
      className="space-y-6"
      style={{ marginTop: '45px', paddingLeft: '15px', paddingRight: '15px' }}
    >
      <div className="header mb-0 mt-4" style={{ marginBottom: 'unset' }}>
        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
      </div>

      {/* Progressive Guidance Section for All Users */}
      {progressInfo && progressInfo.percentage < 100 && (
        <SectionContainer
          title={
            progressInfo.percentage <= 40 ? "🚀 Getting Started" :
            progressInfo.percentage <= 70 ? "📈 Building Your Farm" :
            progressInfo.percentage <= 90 ? "⚡ Advanced Features" :
            "🎯 Final Steps"
          }
          variant="default"
          spacing="md"
        >
          <SetupProgress
            progress={progressInfo.progress}
            percentage={progressInfo.percentage}
            onActionClick={handleActionClick}
          />
        </SectionContainer>
      )}


      <SectionContainer
        title="Production Metrics"
        variant="default"
        spacing="md"
      >
        <GridContainer columns={4} gap="lg">
          <StatCard 
            title="Total Eggs" 
            total={stats.totalEggs} 
            label="collected" 
            icon="🥚"
            variant="corner-gradient"
            className="!p-3"
          />
          <StatCard 
            title="7-Day Average" 
            total={stats.dailyAverage} 
            label="eggs per day" 
            icon="📊"
            variant="corner-gradient"
            className="!p-3"
          />
          <StatCard 
            title="Last 7 Days" 
            total={stats.last7DaysTotal} 
            label={
              <span className="flex items-center gap-1 flex-wrap">
                {stats.previous7DaysTotal > 0 && (
                  <>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      stats.last7DaysTotal > stats.previous7DaysTotal 
                        ? 'bg-green-100 text-green-600' 
                        : stats.last7DaysTotal < stats.previous7DaysTotal
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {stats.last7DaysTotal > stats.previous7DaysTotal 
                        ? '+' : ''}{Math.round(((stats.last7DaysTotal - stats.previous7DaysTotal) / stats.previous7DaysTotal) * 100)}%
                    </span>
                    <span className="text-xs text-gray-500">vs previous</span>
                  </>
                )}
              </span>
            }
            icon="📆"
            variant="corner-gradient"
            className="!p-3"
          />
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
                    <span className="text-xs text-gray-500">vs last month</span>
                  </>
                )}
              </span>
            }
            icon="📅"
            variant="corner-gradient"
            className="!p-3"
          />
        </GridContainer>
      </SectionContainer>

      <ChartCard 
        title="📊 30-Day Production Trend"
        height={300}
        className="glass-card"
      >
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
      </ChartCard>

      <SectionContainer
        title="Financial Overview"
        variant="default"
        spacing="md"
      >
        <GridContainer columns={3} gap="lg">
          <StatCard 
            title="Egg Value" 
            total={`$${stats.eggValue}`} 
            label="potential revenue"
            icon="💰"
            variant="corner-gradient"
          />
          <StatCard 
            title="Revenue" 
            total={`$${stats.revenue}`} 
            label="from sales" 
            icon="💵"
            variant="corner-gradient"
          />
          <StatCard 
            title="Free Eggs" 
            total={stats.freeEggs} 
            label="given away" 
            icon="🎁"
            variant="corner-gradient"
          />
        </GridContainer>
      </SectionContainer>

      <SectionContainer
        title="Analytics & Events"
        variant="default"
        spacing="md"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - 2 columns */}
          <div className="lg:col-span-2">
            <ChartCard 
              title="Revenue Trend"
              subtitle="Weekly revenue over last 12 weeks"
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.weeklyRevenueData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                  />
                  <YAxis width={35} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Weekly Revenue']}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#544CE6" 
                    fill="#544CE6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          
          {/* Upcoming Events - 1 column */}
          <div className="lg:col-span-1">
            <ChartCard 
              title="Upcoming Events"
              subtitle="Important dates and milestones"
              height={320}
              className="overflow-hidden"
            >
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-xl" role="img" aria-label="brooding">🐣</span>
                    <div>
                      <h4 className="font-medium text-amber-800">Baby Chickens Expected</h4>
                      <p className="text-sm text-amber-600">~10 days remaining</p>
                      <p className="text-xs text-amber-500 mt-1">1 brooding hen</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-xl" role="img" aria-label="vaccination">💉</span>
                    <div>
                      <h4 className="font-medium text-blue-800">Vaccination Due</h4>
                      <p className="text-sm text-blue-600">Next week</p>
                      <p className="text-xs text-blue-500 mt-1">Annual health check</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-xl" role="img" aria-label="feed">🌾</span>
                    <div>
                      <h4 className="font-medium text-green-800">Feed Restock</h4>
                      <p className="text-sm text-green-600">3 days</p>
                      <p className="text-xs text-green-500 mt-1">Current supply low</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-xl" role="img" aria-label="cleaning">🧽</span>
                    <div>
                      <h4 className="font-medium text-purple-800">Coop Cleaning</h4>
                      <p className="text-sm text-purple-600">Weekly schedule</p>
                      <p className="text-xs text-purple-500 mt-1">Deep clean recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </SectionContainer>

    </PageContainer>
  );
};