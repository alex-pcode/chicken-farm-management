import { motion } from 'framer-motion';
import { useCRMData } from '../contexts/OptimizedDataProvider';

export const SalesReports = () => {
  const { data, isLoading } = useCRMData();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="neu-stat">
            <h4 className="text-sm font-medium text-gray-600">Total Sales</h4>
            <p className="text-2xl font-bold text-gray-900">{data.summary?.total_sales || 0}</p>
          </div>
          <div className="neu-stat">
            <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
            <p className="text-2xl font-bold text-gray-900">${(data.summary?.total_revenue || 0).toFixed(2)}</p>
          </div>
          <div className="neu-stat">
            <h4 className="text-sm font-medium text-gray-600">Active Customers</h4>
            <p className="text-2xl font-bold text-gray-900">{data.summary?.customer_count || 0}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h4 className="text-md font-medium text-gray-700 mb-2">Advanced Reports Coming Soon</h4>
          <p className="text-gray-600 text-sm">
            Detailed sales analytics, trends, and customer insights will be available here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};