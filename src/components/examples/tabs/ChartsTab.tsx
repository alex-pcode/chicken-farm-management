import React from 'react';
import { ChartCard } from '../../ui/charts/ChartCard';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ChartsTab: React.FC = () => {
  // Chart data
  const monthlyProductionData = [
    { month: 'Jan', eggs: 1245, target: 1200, revenue: 622.50 },
    { month: 'Feb', eggs: 1189, target: 1200, revenue: 594.50 },
    { month: 'Mar', eggs: 1356, target: 1300, revenue: 678.00 },
    { month: 'Apr', eggs: 1423, target: 1350, revenue: 711.50 },
    { month: 'May', eggs: 1467, target: 1400, revenue: 733.50 },
    { month: 'Jun', eggs: 1512, target: 1450, revenue: 756.00 }
  ];

  const weeklyData = [
    { day: 'Mon', eggs: 47, hens: 45 },
    { day: 'Tue', eggs: 45, hens: 45 },
    { day: 'Wed', eggs: 49, hens: 45 },
    { day: 'Thu', eggs: 46, hens: 44 },
    { day: 'Fri', eggs: 48, hens: 44 },
    { day: 'Sat', eggs: 44, hens: 44 },
    { day: 'Sun', eggs: 45, hens: 45 }
  ];

  const expenseData = [
    { name: 'Feed', value: 423, color: '#8B5CF6' },
    { name: 'Equipment', value: 145, color: '#06B6D4' },
    { name: 'Veterinary', value: 89, color: '#10B981' },
    { name: 'Utilities', value: 67, color: '#F59E0B' },
    { name: 'Maintenance', value: 34, color: '#EF4444' }
  ];

  const quarterlyTrends = [
    { quarter: 'Q1 2023', production: 3790, efficiency: 89.2, revenue: 1895 },
    { quarter: 'Q2 2023', production: 4205, efficiency: 92.1, revenue: 2102 },
    { quarter: 'Q3 2023', production: 4456, efficiency: 94.8, revenue: 2228 },
    { quarter: 'Q4 2023', production: 4102, efficiency: 91.3, revenue: 2051 },
    { quarter: 'Q1 2024', production: 4402, efficiency: 95.2, revenue: 2201 }
  ];

  const farmAnalyticsData = [
    { month: 'Jan', eggs: 1245, feed: 245, revenue: 622, expenses: 289, profit: 333 },
    { month: 'Feb', eggs: 1189, feed: 238, revenue: 595, expenses: 276, profit: 319 },
    { month: 'Mar', eggs: 1356, feed: 271, revenue: 678, expenses: 312, profit: 366 },
    { month: 'Apr', eggs: 1423, feed: 285, revenue: 712, expenses: 329, profit: 383 },
    { month: 'May', eggs: 1467, feed: 293, revenue: 734, expenses: 341, profit: 393 },
    { month: 'Jun', eggs: 1512, feed: 302, revenue: 756, expenses: 356, profit: 400 }
  ];

  return (
    <div className="space-y-12">
      {/* Bar Charts */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bar Charts</h2>
          <p className="text-gray-600">Comparative data visualization with bars</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Monthly Egg Production"
            subtitle="Eggs produced vs target by month"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="eggs" fill="#8B5CF6" name="Actual Production" />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Weekly Overview"
            subtitle="Daily egg production this week"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="eggs" fill="#06B6D4" name="Eggs Collected" />
                <Bar dataKey="hens" fill="#10B981" name="Active Hens" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Line Charts */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Line Charts</h2>
          <p className="text-gray-600">Trend analysis over time</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Quarterly Trends"
            subtitle="Production and efficiency trends over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quarterlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="production" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Production"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Revenue Growth"
            subtitle="Monthly revenue with trend area"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Pie Charts */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pie Charts</h2>
          <p className="text-gray-600">Proportional data representation</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Expense Breakdown"
            subtitle="Monthly expenses by category"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Production Distribution"
            subtitle="Donut chart showing production by quality grade"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Grade A', value: 78, color: '#10B981' },
                    { name: 'Grade B', value: 15, color: '#F59E0B' },
                    { name: 'Grade C', value: 5, color: '#EF4444' },
                    { name: 'Cracked', value: 2, color: '#6B7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Chart Variations & States */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chart Variations & States</h2>
          <p className="text-gray-600">Different chart sizes and loading states</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Loading Chart"
            subtitle="Chart in loading state"
            loading
          >
            <div className="h-48" />
          </ChartCard>
          
          <ChartCard
            title="Compact Chart"
            subtitle="Smaller chart for dashboard widgets"
          >
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={weeklyData.slice(0, 5)}>
                <Line 
                  type="monotone" 
                  dataKey="eggs" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Mini Chart"
            subtitle="Tiny chart for cards"
          >
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={weeklyData.slice(0, 4)}>
                <Area 
                  type="monotone" 
                  dataKey="eggs" 
                  stroke="#06B6D4" 
                  fill="#06B6D4"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Full-Width Chart Examples */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Full-Width Chart Examples</h2>
          <p className="text-gray-600">Comprehensive charts spanning full width</p>
        </div>
        
        <ChartCard
          title="Complete Farm Analytics Dashboard"
          subtitle="Comprehensive view of all farm metrics over time"
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={farmAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
                name="Revenue ($)"
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="expenses" 
                stackId="2"
                stroke="#EF4444" 
                fill="#EF4444"
                fillOpacity={0.6}
                name="Expenses ($)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="eggs" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                name="Egg Production"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Dashboard Layout Example */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Layout Example</h2>
          <p className="text-gray-600">Mixed chart layout for comprehensive dashboards</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard
              title="Production Trends"
              subtitle="Monthly egg production and revenue correlation"
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyProductionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="eggs" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    name="Egg Production"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          
          <div className="space-y-6">
            <ChartCard
              title="Current Expenses"
              subtitle="This month's spending breakdown"
              >
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            
            <ChartCard
              title="Weekly Trend"
              subtitle="This week's daily production"
              >
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={weeklyData}>
                  <Bar dataKey="eggs" fill="#06B6D4" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChartsTab;