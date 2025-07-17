import { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomerList } from './CustomerList';
import { SalesList } from './SalesList';
import { QuickSale } from './QuickSale';
import { SalesReports } from './SalesReports';
import AnimatedCRMPNG from './AnimatedCRMPNG';
import { useAppData } from '../contexts/DataContext';

type CRMTab = 'customers' | 'sales' | 'quick-sale' | 'reports';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('customers');
  const { data, isLoading, error, refreshData } = useAppData();

  const tabs = [
    { id: 'customers' as CRMTab, label: 'Customers', emoji: '👥' },
    { id: 'sales' as CRMTab, label: 'Sales', emoji: '🧾' },
    { id: 'quick-sale' as CRMTab, label: 'Quick Sale', emoji: '⚡' },
    { id: 'reports' as CRMTab, label: 'Reports', emoji: '📊' }
  ];

  // Use refreshData from context for mutations
  const handleDataChange = () => {
    refreshData();
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
            onClick={refreshData}
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
      {/* Animated CRM Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mb-8"
      >
        <AnimatedCRMPNG />
      </motion.div>

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
        {data.summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{data.summary.customer_count}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{data.summary.total_sales}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">${data.summary.total_revenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.summary.total_eggs_sold}</div>
              <div className="text-sm text-gray-600">Eggs Sold</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{data.summary.free_eggs_given || 0}</div>
              <div className="text-sm text-gray-600">Free Eggs</div>
            </div>
            <div className="neu-card p-4 text-center">
              <div className="text-lg font-bold text-purple-600 truncate">{data.summary.top_customer || 'None'}</div>
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
            customers={data.customers || []} 
            onDataChange={handleDataChange}
          />
        )}
        
        {activeTab === 'sales' && (
          <SalesList 
            sales={data.sales || []} 
            customers={data.customers || []}
            onDataChange={handleDataChange}
          />
        )}
        
        {activeTab === 'quick-sale' && (
          <QuickSale 
            customers={data.customers || []} 
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
