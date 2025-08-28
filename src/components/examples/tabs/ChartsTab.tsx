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
  ResponsiveContainer,
  ComposedChart 
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
    { name: 'Feed', value: 423, color: '#544CE6' },
    { name: 'Equipment', value: 145, color: '#2A2580' },
    { name: 'Veterinary', value: 89, color: '#191656' },
    { name: 'Utilities', value: 67, color: '#6B5CE6' },
    { name: 'Maintenance', value: 34, color: '#4A3DC7' }
  ];

  const quarterlyTrends = [
    { quarter: 'Q1 2023', production: 3790, efficiency: 89.2, revenue: 1895 },
    { quarter: 'Q2 2023', production: 4205, efficiency: 92.1, revenue: 2102 },
    { quarter: 'Q3 2023', production: 4456, efficiency: 94.8, revenue: 2228 },
    { quarter: 'Q4 2023', production: 4102, efficiency: 91.3, revenue: 2051 },
    { quarter: 'Q1 2024', production: 4402, efficiency: 95.2, revenue: 2201 }
  ];

  const performanceData = [
    { month: 'Jan', efficiency: 87.5, satisfaction: 92.3, productivity: 89.1 },
    { month: 'Feb', efficiency: 89.2, satisfaction: 94.1, productivity: 91.4 },
    { month: 'Mar', efficiency: 91.8, satisfaction: 89.7, productivity: 93.2 },
    { month: 'Apr', efficiency: 93.4, satisfaction: 96.2, productivity: 95.1 },
    { month: 'May', efficiency: 95.1, satisfaction: 91.8, productivity: 92.7 },
    { month: 'Jun', efficiency: 92.6, satisfaction: 93.5, productivity: 94.3 }
  ];


  return (
    <>
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
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProductionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis width={25} />
                <Tooltip />
                <Legend />
                <Bar dataKey="eggs" fill="#544CE6" name="Actual Production" />
                <Bar dataKey="target" fill="#2A2580" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Weekly Overview"
            subtitle="Daily egg production this week"
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis width={25} />
                <Tooltip />
                <Legend />
                <Bar dataKey="eggs" fill="#544CE6" name="Eggs Collected" />
                <Bar dataKey="hens" fill="#2A2580" name="Active Hens" />
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
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quarterlyTrends} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" width={25} />
                <YAxis yAxisId="right" orientation="right" width={25} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="production" 
                  stroke="#544CE6" 
                  strokeWidth={2}
                  name="Production"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#2A2580" 
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard
            title="Revenue Growth"
            subtitle="Monthly revenue with trend area"
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProductionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis width={25} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#544CE6" 
                  fill="#544CE6"
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
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
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
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
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
                  {[
                    { name: 'Grade A', value: 78, color: '#544CE6' },
                    { name: 'Grade B', value: 15, color: '#2A2580' },
                    { name: 'Grade C', value: 5, color: '#191656' },
                    { name: 'Cracked', value: 2, color: '#6B5CE6' }
                  ].map((entry, index) => (
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
            height={200}
            loading
          >
            <div className="h-48" />
          </ChartCard>
          
          <ChartCard
            title="Compact Chart"
            subtitle="Smaller chart for dashboard widgets"
            height={170}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData.slice(0, 5)}>
                <Line 
                  type="monotone" 
                  dataKey="eggs" 
                  stroke="#544CE6" 
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
            height={120}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData.slice(0, 4)}>
                <Area 
                  type="monotone" 
                  dataKey="eggs" 
                  stroke="#544CE6" 
                  fill="#544CE6"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>


      {/* Dashboard Layout Example */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Layout Example</h2>
          <p className="text-gray-600">Mixed chart layout for comprehensive dashboards</p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ChartCard
              title="Production Trends"
              subtitle="Monthly egg production and revenue correlation"
              height={370}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyProductionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" width={25} />
                  <YAxis yAxisId="right" orientation="right" width={25} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="eggs" 
                    stroke="#544CE6" 
                    fill="#544CE6"
                    fillOpacity={0.3}
                    name="Egg Production"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2A2580" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          
          <div className="space-y-6">
            <ChartCard
              title="Current Expenses"
              subtitle="This month's spending breakdown"
              height={220}
            >
              <ResponsiveContainer width="100%" height="100%">
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
              height={170}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <Bar dataKey="eggs" fill="#544CE6" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </section>
    </div>

    {/* Standalone Performance Chart */}
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Performance Analytics</h2>
        <p className="text-gray-600">Standalone chart showing comprehensive performance metrics</p>
      </div>
      
      <ChartCard
        title="Multi-Metric Performance Dashboard"
        subtitle="Tracking efficiency, satisfaction, and productivity over time"
        height={420}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[80, 100]} width={25} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="#544CE6" 
              strokeWidth={3}
              name="Farm Efficiency (%)"
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="#2A2580" 
              strokeWidth={3}
              name="Customer Satisfaction (%)"
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="productivity" 
              stroke="#8833D7" 
              strokeWidth={3}
              name="Overall Productivity (%)"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
    </>
  );
};

export default ChartsTab;