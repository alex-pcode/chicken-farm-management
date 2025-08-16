import { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomerList } from './CustomerList';
import { SalesList } from './SalesList';
import { QuickSale } from './QuickSale';
import { SalesReports } from './SalesReports';
import AnimatedCRMPNG from './AnimatedCRMPNG';
import { useCRMData } from '../contexts/OptimizedDataProvider';

// Basic utilities
import { cn } from '../utils/shadcn/cn';
import { StatCard } from './testCom';

type CRMTab = 'customers' | 'sales' | 'quick-sale' | 'reports';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('customers');
  const { data, isLoading, error, refreshData } = useCRMData();

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
        className="w-full mb-8 mt-10 lg:mt-0"
      >
        <AnimatedCRMPNG />
      </motion.div>

      {/* Enhanced Summary Stats with Epic 4 Cards */}
      {data.summary && (
        <div className="mt-6">
          {/* Mobile-First Responsive Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Customers"
              total={data.summary.customer_count}
              label="active"
            />
            <StatCard
              title="Sales"
              total={data.summary.total_sales}
              label="transactions"
            />
            <StatCard
              title="Revenue"
              total={`$${data.summary.total_revenue.toFixed(2)}`}
              label="total earnings"
            />
            <StatCard
              title="Eggs Sold"
              total={data.summary.total_eggs_sold}
              label="units"
            />
            <StatCard
              title="Free Eggs"
              total={data.summary.free_eggs_given || 0}
              label="given away"
            />
            <StatCard
              title="Top Customer"
              total={data.summary.top_customer || 'None'}
              label="highest purchaser"
            />
          </div>
        </div>
      )}

      {/* Enhanced Tab Navigation with Epic 4 Styling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 mt-8">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + (index * 0.1) }}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'neu-button',
              "flex items-center justify-center gap-2 px-4 py-3 text-center transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300",
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)]'
                : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]'
            )}
          >
            <span role="img" aria-label={tab.label} className="text-lg">{tab.emoji}</span>
            <span className="font-medium font-[Fraunces]">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card min-h-[400px]">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
    </div>
  );
};
