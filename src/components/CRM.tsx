import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '../utils/authApiUtils';
import { Customer, Sale, SaleWithCustomer, CustomerWithStats, SalesSummary } from '../types/crm';
import { CustomerList } from './CustomerList';
import { SalesList } from './SalesList';
import { QuickSale } from './QuickSale';
import { SalesReports } from './SalesReports';

type CRMTab = 'customers' | 'sales' | 'quick-sale' | 'reports';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'customers' as CRMTab, label: 'Customers', emoji: '👥' },
    { id: 'sales' as CRMTab, label: 'Sales', emoji: '🧾' },
    { id: 'quick-sale' as CRMTab, label: 'Quick Sale', emoji: '⚡' },
    { id: 'reports' as CRMTab, label: 'Reports', emoji: '📊' }
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();

      // Fetch customers, sales, and summary in parallel
      const [customersRes, salesRes, summaryRes] = await Promise.all([
        fetch('/api/customers', { headers }),
        fetch('/api/sales', { headers }),
        fetch('/api/salesReports?type=summary', { headers })
      ]);

      if (!customersRes.ok || !salesRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch CRM data');
      }

      const [customersData, salesData, summaryData] = await Promise.all([
        customersRes.json(),
        salesRes.json(),
        summaryRes.json()
      ]);

      setCustomers(customersData);
      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load CRM data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDataChange = () => {
    // Refresh data when changes are made
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading CRM</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="neu-button bg-red-100 text-red-700 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <h1 className="page-title">
          <span className="text-4xl mr-3" role="img" aria-label="CRM">💼</span>
          Customer & Sales Management
        </h1>
        <p className="page-subtitle">
          Manage your egg customers and track sales
        </p>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{summary.customer_count}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.total_sales}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">${summary.total_revenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.total_eggs_sold}</div>
              <div className="text-sm text-gray-600">Eggs Sold</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.free_eggs_given || 0}</div>
              <div className="text-sm text-gray-600">Free Eggs</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-lg font-bold text-purple-600 truncate">{summary.top_customer || 'None'}</div>
              <div className="text-sm text-gray-600">Top Customer</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`neu-button flex items-center gap-2 px-4 py-2 ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span role="img" aria-label={tab.label}>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'customers' && (
          <CustomerList 
            customers={customers} 
            onDataChange={handleDataChange}
          />
        )}
        
        {activeTab === 'sales' && (
          <SalesList 
            sales={sales} 
            customers={customers}
            onDataChange={handleDataChange}
          />
        )}
        
        {activeTab === 'quick-sale' && (
          <QuickSale 
            customers={customers} 
            onDataChange={handleDataChange}
          />
        )}
        
        {activeTab === 'reports' && (
          <SalesReports />
        )}
      </motion.div>
    </div>
  );
};
