import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '../utils/authApiUtils';
import { MonthlySales } from '../types/crm';

export const SalesReports = () => {
  const [summary, setSummary] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | 'year' | 'all'>('6months');

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();

      // Fetch summary and monthly data in parallel
      const [summaryRes, monthlyRes] = await Promise.all([
        fetch('/api/salesReports?type=summary', { headers }),
        fetch('/api/salesReports?type=monthly', { headers })
      ]);

      if (!summaryRes.ok || !monthlyRes.ok) {
        throw new Error('Failed to fetch reports data');
      }

      const [summaryData, monthlyDataRes] = await Promise.all([
        summaryRes.json(),
        monthlyRes.json()
      ]);

      setSummary(summaryData);
      setMonthlyData(monthlyDataRes);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const filterMonthlyData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return monthlyData;
    }

    return monthlyData.filter(item => {
      const itemDate = new Date(item.month + '-01');
      return itemDate >= cutoffDate;
    });
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const filteredData = filterMonthlyData();
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalEggsSold = filteredData.reduce((sum, item) => sum + item.total_eggs, 0);
  const totalSales = filteredData.reduce((sum, item) => sum + item.total_sales, 0);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchReportsData}
          className="neu-button bg-red-100 text-red-700 hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
        
        <div className="flex gap-2">
          {([
            { key: '3months', label: '3M' },
            { key: '6months', label: '6M' },
            { key: 'year', label: '1Y' },
            { key: 'all', label: 'All' }
          ] as const).map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`neu-button-sm ${
                selectedPeriod === period.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Summary */}
      {summary && (
        <div className="neu-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.customer_count}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.total_sales}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">${summary.total_revenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.total_eggs_sold}</div>
              <div className="text-sm text-gray-600">Total Eggs Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.free_eggs_given || 0}</div>
              <div className="text-sm text-gray-600">Free Eggs Given</div>
            </div>
          </div>
          
          {summary.top_customer && (
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-purple-600">🏆 Top Customer</div>
              <div className="text-gray-700">{summary.top_customer}</div>
            </div>
          )}
        </div>
      )}

      {/* Period Summary */}
      <div className="neu-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedPeriod === 'all' ? 'All Time' : selectedPeriod.replace(/(\d+)(\w+)/, '$1 $2').toUpperCase()} Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalSales}</div>
            <div className="text-sm text-gray-600">Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{totalEggsSold}</div>
            <div className="text-sm text-gray-600">Eggs Sold</div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="neu-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
        
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📊</span>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h4>
            <p className="text-gray-600">No sales recorded for the selected period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.slice().reverse().map((item, index) => {
              const avgPerSale = item.total_sales > 0 ? item.total_revenue / item.total_sales : 0;
              const eggsPerSale = item.total_sales > 0 ? item.total_eggs / item.total_sales : 0;
              
              return (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {formatMonth(item.month)}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{item.total_sales}</div>
                        <div className="text-gray-600">Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">${item.total_revenue.toFixed(2)}</div>
                        <div className="text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{item.total_eggs}</div>
                        <div className="text-gray-600">Eggs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">${avgPerSale.toFixed(2)}</div>
                        <div className="text-gray-600">Avg/Sale</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-indigo-600">{eggsPerSale.toFixed(1)}</div>
                        <div className="text-gray-600">Eggs/Sale</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neu-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Sale Value:</span>
              <span className="font-semibold">
                ${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Eggs per Sale:</span>
              <span className="font-semibold">
                {totalSales > 0 ? (totalEggsSold / totalSales).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue per Egg:</span>
              <span className="font-semibold">
                ${totalEggsSold > 0 ? (totalRevenue / totalEggsSold).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="neu-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Free Eggs Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold text-green-600">
                ${summary?.total_revenue.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Free Eggs Given:</span>
              <span className="font-semibold text-green-600">
                {summary?.free_eggs_given || 0} eggs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue Percentage:</span>
              <span className="font-semibold">
                {summary && (summary.total_eggs_sold + (summary.free_eggs_given || 0)) > 0 
                  ? ((summary.total_eggs_sold / (summary.total_eggs_sold + (summary.free_eggs_given || 0))) * 100).toFixed(1)
                  : '0.0'
                }% paid sales
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
