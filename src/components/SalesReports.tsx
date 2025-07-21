import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '../utils/authApiUtils';
import { MonthlySales } from '../types/crm';
import { useAppData } from '../contexts/DataContext';

export const SalesReports = () => {
  const { data, isLoading: dataLoading, error: dataError, refreshData } = useAppData();
  const [monthlyData, setMonthlyData] = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | 'year' | 'all'>('6months');

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();

      // Fetch only monthly data since summary comes from DataContext
      const monthlyRes = await fetch('/api/salesReports?type=monthly', { headers });

      if (!monthlyRes.ok) {
        throw new Error('Failed to fetch monthly reports data');
      }

      const monthlyDataRes = await monthlyRes.json();
      setMonthlyData(monthlyDataRes);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!dataLoading) {
      fetchReportsData();
    }
  }, [dataLoading]);

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

  if (dataLoading || isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (dataError || error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
        <p className="text-red-600 mb-4">{dataError || error}</p>
        <button
          onClick={() => {
            refreshData();
            fetchReportsData();
          }}
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
        <button
          onClick={() => {
            refreshData();
            fetchReportsData();
          }}
          className="neu-button-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Overall Summary */}
      {data.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Overall Summary</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-600">Customers</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{data.summary.customer_count}</p>
              <p className="text-sm text-gray-500 mt-1">total customers</p>
            </div>
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-600">Sales</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{data.summary.total_sales}</p>
              <p className="text-sm text-gray-500 mt-1">total sales</p>
            </div>
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-600">Revenue</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">${data.summary.total_revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">total revenue</p>
            </div>
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-600">Eggs Sold</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{data.summary.total_eggs_sold}</p>
              <p className="text-sm text-gray-500 mt-1">paid eggs only</p>
            </div>
            <div className="neu-stat">
              <h3 className="text-lg font-medium text-gray-600">Free Eggs</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{data.summary.free_eggs_given || 0}</p>
              <p className="text-sm text-gray-500 mt-1">eggs given</p>
            </div>
          </div>
          
          {data.summary.top_customer && (
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-gray-700">🏆 Top Customer</div>
              <div className="text-gray-600">{data.summary.top_customer}</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Period Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedPeriod === 'all' ? 'All Time' : selectedPeriod.replace(/(\d+)(\w+)/, '$1 $2').toUpperCase()} Summary
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{totalSales}</div>
            <div className="text-sm text-gray-600">Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{totalEggsSold}</div>
            <div className="text-sm text-gray-600">Eggs Sold</div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Monthly Breakdown</h2>
        </div>
        
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
                        <div className="font-bold text-gray-700">{item.total_sales}</div>
                        <div className="text-gray-600">Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-700">${item.total_revenue.toFixed(2)}</div>
                        <div className="text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-700">{item.total_eggs}</div>
                        <div className="text-gray-600">Eggs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-700">${avgPerSale.toFixed(2)}</div>
                        <div className="text-gray-600">Avg/Sale</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-700">{eggsPerSale.toFixed(1)}</div>
                        <div className="text-gray-600">Eggs/Sale</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Key Metrics</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Sale Value:</span>
              <span className="font-semibold text-gray-900">
                ${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Eggs per Sale:</span>
              <span className="font-semibold text-gray-900">
                {totalSales > 0 ? (totalEggsSold / totalSales).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue per Egg:</span>
              <span className="font-semibold text-gray-900">
                ${totalEggsSold > 0 ? (totalRevenue / totalEggsSold).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Free Eggs Statistics</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold text-gray-900">
                ${data.summary?.total_revenue.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Free Eggs Given:</span>
              <span className="font-semibold text-gray-900">
                {data.summary?.free_eggs_given || 0} eggs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue Percentage:</span>
              <span className="font-semibold text-gray-900">
                {data.summary && (data.summary.total_eggs_sold + (data.summary.free_eggs_given || 0)) > 0 
                  ? ((data.summary.total_eggs_sold / (data.summary.total_eggs_sold + (data.summary.free_eggs_given || 0))) * 100).toFixed(1)
                  : '0.0'
                }% paid sales
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
