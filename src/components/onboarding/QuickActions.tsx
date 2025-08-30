/**
 * Quick Actions Component - Contextual next steps based on user progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CardContainer } from '../ui/layout/CardContainer';
import { MetricDisplay } from '../ui/cards/MetricDisplay';
import type { FarmSetupProgress } from '../../types';

interface QuickActionsProps {
  progress: FarmSetupProgress;
  percentage: number;
  onActionClick?: (action: string) => void;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  progress,
  percentage,
  onActionClick,
  className = ''
}) => {
  // Determine the most relevant actions based on current progress
  const getRecommendedActions = () => {
    const actions = [];

    // Phase 1: New User (0-40%)
    if (percentage <= 40) {
      if (!progress.hasRecordedProduction) {
        actions.push({
          key: 'add-eggs',
          title: 'Record Your First Eggs',
          description: 'Start tracking daily egg production',
          icon: '🥚',
          priority: 1
        });
      }
      
      if (!progress.hasRecordedExpense) {
        actions.push({
          key: 'add-expense',
          title: 'Track an Expense',
          description: 'Keep track of feed and supply costs',
          icon: '💰',
          priority: 2
        });
      }
    }

    // Phase 2: Getting Started (40-70%)
    else if (percentage <= 70) {
      if (!progress.hasCustomer) {
        actions.push({
          key: 'add-customer',
          title: 'Add Your First Customer',
          description: 'Start building your customer base',
          icon: '👤',
          priority: 1
        });
      }

      if (!progress.hasSale) {
        actions.push({
          key: 'add-sale',
          title: 'Record a Sale',
          description: 'Track your egg sales and revenue',
          icon: '💳',
          priority: 2
        });
      }

      if (!progress.hasFeedTracking) {
        actions.push({
          key: 'add-feed',
          title: 'Start Feed Tracking',
          description: 'Monitor feed consumption and costs',
          icon: '🌾',
          priority: 3
        });
      }
    }

    // Phase 3: Active User (70-90%)
    else if (percentage <= 90) {
      if (!progress.hasMultipleBatches) {
        actions.push({
          key: 'add-batch',
          title: 'Create Additional Batches',
          description: 'Organize birds by groups for better tracking',
          icon: '🐣',
          priority: 1
        });
      }

      actions.push({
        key: 'view-analytics',
        title: 'Explore Analytics',
        description: 'View detailed reports and insights',
        icon: '📊',
        priority: 2
      });
    }

    // Phase 4: Power User (90-100%)
    else {
      actions.push({
        key: 'optimize-operations',
        title: 'Optimize Operations',
        description: 'Use advanced features for maximum efficiency',
        icon: '⚡',
        priority: 1
      });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 2);
  };

  const recommendedActions = getRecommendedActions();

  return (
    <CardContainer variant="glass" padding="md" className={className}>
      <h4 className="text-md font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
        Quick Actions
      </h4>
      
      {/* Progress Overview */}
      <div className="mb-4">
        <MetricDisplay
          label="Current Phase"
          value={percentage}
          format="percentage"
          precision={0}
          variant="compact"
        />
      </div>

      {/* Phase-specific guidance */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">Current Phase</h5>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Stage:</span>
              <span className="font-medium text-indigo-700">
                {percentage <= 40 ? "Getting Started" : 
                 percentage <= 70 ? "Building Features" : 
                 percentage <= 90 ? "Advanced Setup" : "Power User"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Focus:</span>
              <span className="font-medium text-purple-700">
                {percentage <= 40 ? "Basic Setup" : 
                 percentage <= 70 ? "Track Sales" : 
                 percentage <= 90 ? "Optimize" : "Complete"}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Cards */}
      <div className="space-y-3">
        {recommendedActions.map((action, index) => (
          <motion.div
            key={action.key}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all cursor-pointer hover:shadow-sm"
            onClick={() => onActionClick?.(action.key)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{action.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {action.title}
                </div>
                <div className="text-xs text-gray-600">
                  {action.description}
                </div>
              </div>
              <div className="text-indigo-600 font-bold">→</div>
            </div>
          </motion.div>
        ))}
        
        {recommendedActions.length === 0 && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-sm font-semibold text-green-900 mb-1">All Set!</div>
            <div className="text-xs text-green-700">
              No immediate actions needed. Keep up the great work!
            </div>
          </div>
        )}
      </div>
    </CardContainer>
  );
};