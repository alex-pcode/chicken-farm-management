import React from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <nav className="-mb-px flex space-x-0 sm:space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex-1 sm:flex-initial
              ${activeTab === tab.id
                ? 'border-[#524AE6] text-[#524AE6] dark:border-[#7B73FF] dark:text-[#7B73FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 flex-col sm:flex-row">
              <span className="text-base sm:text-lg">{tab.icon}</span>
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[#524AE6]"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};