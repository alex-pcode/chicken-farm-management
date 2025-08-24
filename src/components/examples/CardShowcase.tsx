import React, { useState } from 'react';
import { 
  ComponentsTab,
  LayoutsTab,
  ModalsTab,
  TablesTab,
  FormsTab,
  ChartsTab,
  TimelineTab
} from './tabs';

const CardShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'components' | 'layouts' | 'modals' | 'tables' | 'forms' | 'charts' | 'timeline'>('components');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components':
        return <ComponentsTab />;
      case 'layouts':
        return <LayoutsTab />;
      case 'modals':
        return <ModalsTab />;
      case 'tables':
        return <TablesTab />;
      case 'forms':
        return <FormsTab />;
      case 'charts':
        return <ChartsTab />;
      case 'timeline':
        return <TimelineTab />;
      default:
        return <ComponentsTab />;
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Header and Navigation - Always Full Width */}
        <div className="space-y-8 p-8 pt-20 lg:pt-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Card Components Showcase
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="glass-card p-2 flex gap-2 overflow-x-auto whitespace-nowrap max-w-full">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'components'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('layouts')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'layouts'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Layouts
              </button>
              <button
                onClick={() => setActiveTab('modals')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'modals'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Modals
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'tables'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Tables
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'forms'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Forms
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'charts'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
                  activeTab === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content - Responsive container based on tab */}
        {activeTab !== 'charts' && activeTab !== 'timeline' && (
          <div className="max-w-7xl mx-auto space-y-8 px-0 pb-0">
            {renderTabContent()}
          </div>
        )}

        {/* Full-width content for charts and timeline */}
        {(activeTab === 'charts' || activeTab === 'timeline') && (
          <div className="w-full space-y-8 px-4 pb-8">
            {renderTabContent()}
          </div>
        )}
      </div>
    </>
  );
};

export default CardShowcase;