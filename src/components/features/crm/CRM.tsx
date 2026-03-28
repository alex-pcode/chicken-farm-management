import { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomerList } from './CustomerList';
import { QuickSale } from '../sales/QuickSale';
import { CRMReports } from './CRMReports';
import AnimatedCRMPNG from '../../landing/animations/AnimatedCRMPNG';
import { useCRMData } from '../../../contexts/OptimizedDataProvider';


type CRMTab = 'customers' | 'quick-sale' | 'reports';

export const CRM = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('quick-sale');
  const { data, isLoading, error, refreshData, silentRefresh } = useCRMData();

  const tabs = [
    { id: 'quick-sale' as CRMTab, label: 'Quick Sale', emoji: '⚡' },
    { id: 'customers' as CRMTab, label: 'Customers', emoji: '👥' },
    { id: 'reports' as CRMTab, label: 'Reports', emoji: '📊' }
  ];

  // Use silentRefresh from context for mutations to avoid showing loading state
  const handleDataChange = () => {
    silentRefresh();
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading CRM</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="neu-button bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700"
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


      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 mt-8">
        <div className="glass-card p-2 flex gap-2 overflow-x-auto whitespace-nowrap max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span role="img" aria-label={tab.label} className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
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
          
          {activeTab === 'quick-sale' && (
            <QuickSale 
              customers={data.customers || []} 
              onDataChange={handleDataChange}
            />
          )}
          
          {activeTab === 'reports' && (
            <CRMReports
              sales={data.sales || []}
              customers={data.customers || []}
              onDataChange={handleDataChange}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
