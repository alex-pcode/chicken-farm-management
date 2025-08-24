import React from 'react';
import { motion } from 'framer-motion';

interface BaseUIComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string | Date;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray';
  content?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }[];
}

interface TimelineProps extends BaseUIComponentProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  layout?: 'vertical' | 'alternating';
  showConnector?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  onItemClick?: (item: TimelineItem) => void;
}

const colorClasses = {
  blue: 'bg-blue-500 border-blue-500 text-blue-600',
  green: 'bg-green-500 border-green-500 text-green-600',
  yellow: 'bg-yellow-500 border-yellow-500 text-yellow-600',
  red: 'bg-red-500 border-red-500 text-red-600',
  purple: 'bg-purple-500 border-purple-500 text-purple-600',
  indigo: 'bg-indigo-500 border-indigo-500 text-indigo-600',
  gray: 'bg-gray-500 border-gray-500 text-gray-600',
};

const variantClasses = {
  default: 'p-4',
  compact: 'p-3',
  detailed: 'p-6',
};

export const Timeline: React.FC<TimelineProps> = ({
  items,
  variant = 'default',
  layout = 'vertical',
  showConnector = true,
  loading = false,
  emptyMessage = 'No items to display',
  emptyIcon = '📋',
  onItemClick,
  className = '',
  testId,
}) => {
  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionButtonClasses = (buttonVariant: string = 'secondary') => {
    const baseClasses = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
    switch (buttonVariant) {
      case 'primary':
        return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700`;
      case 'danger':
        return `${baseClasses} bg-red-50 text-red-600 hover:bg-red-100`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100`;
    }
  };

  if (loading) {
    return (
      <div className={`glass-card ${variantClasses[variant]} ${className}`} data-testid={testId}>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`glass-card ${variantClasses[variant]} ${className}`} data-testid={testId}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">{emptyIcon}</div>
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (layout === 'alternating') {
    return (
      <div className={`glass-card ${variantClasses[variant]} ${className}`} data-testid={testId}>
        <div className="relative">
          {/* Center line for alternating layout */}
          {showConnector && (
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          )}
          
          <div className="space-y-8">
            {sortedItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const color = item.color || 'indigo';
              const colorClass = colorClasses[color];
              
              return (
                <div key={item.id} className="relative">
                  {/* Desktop alternating layout */}
                  <div className={`hidden md:flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content side */}
                    <div className={`w-[calc(50%-2rem)] ${isEven ? 'text-right' : 'text-left'}`}>
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-lg shadow-md p-4 relative cursor-pointer hover:shadow-lg transition-shadow ${
                          onItemClick ? 'hover:bg-gray-50' : ''
                        }`}
                        onClick={() => onItemClick?.(item)}
                      >
                        {/* Date badge */}
                        <div className={`flex gap-2 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(item.date)}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatTime(item.date)}
                          </span>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {item.description}
                          </p>
                        )}

                        {item.content && (
                          <div className="mb-3">
                            {item.content}
                          </div>
                        )}

                        {item.actions && item.actions.length > 0 && (
                          <div className={`flex gap-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
                            {item.actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick();
                                }}
                                className={getActionButtonClasses(action.variant)}
                              >
                                {action.icon && <span>{action.icon}</span>}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Connector line */}
                        <div className={`absolute top-1/2 ${isEven ? '-right-8' : '-left-8'} transform -translate-y-1/2 w-8 h-0.5 ${colorClass.split(' ')[0]}`}></div>
                      </motion.div>
                    </div>

                    {/* Center dot */}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full bg-white border-4 ${colorClass.split(' ')[1]} relative z-10 flex items-center justify-center`}>
                        {item.icon && (
                          <span className="text-lg">{item.icon}</span>
                        )}
                      </div>
                    </div>

                    {/* Empty side */}
                    <div className="w-[calc(50%-2rem)]"></div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden">
                    <div className="flex gap-4">
                      <div className={`shrink-0 w-10 h-10 ${colorClass.split(' ')[0]} rounded-full flex items-center justify-center text-white`}>
                        {item.icon ? (
                          <span className="text-lg">{item.icon}</span>
                        ) : (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex-1 bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          onItemClick ? 'hover:bg-gray-50' : ''
                        }`}
                        onClick={() => onItemClick?.(item)}
                      >
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(item.date)}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {formatTime(item.date)}
                          </span>
                        </div>
                        
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h4>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {item.description}
                          </p>
                        )}

                        {item.content && (
                          <div className="mb-3">
                            {item.content}
                          </div>
                        )}

                        {item.actions && item.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick();
                                }}
                                className={getActionButtonClasses(action.variant)}
                              >
                                {action.icon && <span>{action.icon}</span>}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={`glass-card ${variantClasses[variant]} ${className}`} data-testid={testId}>
      <div className="relative">
        {/* Vertical connector line */}
        {showConnector && items.length > 1 && (
          <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        )}
        
        <div className="space-y-6">
          {sortedItems.map((item, index) => {
            const color = item.color || 'indigo';
            const colorClass = colorClasses[color];
            
            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Icon/dot */}
                <div className={`shrink-0 w-10 h-10 ${colorClass.split(' ')[0]} rounded-full flex items-center justify-center text-white relative z-10`}>
                  {item.icon ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex-1 bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    onItemClick ? 'hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatDate(item.date)}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatTime(item.date)}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                  )}

                  {item.content && (
                    <div className="mb-3">
                      {item.content}
                    </div>
                  )}

                  {item.actions && item.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                          className={getActionButtonClasses(action.variant)}
                        >
                          {action.icon && <span>{action.icon}</span>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};