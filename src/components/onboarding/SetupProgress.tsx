/**
 * Setup Progress Component - Shows user progress through onboarding features
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CardContainer } from '../ui/layout/CardContainer';
import { FormButton } from '../ui/forms/FormButton';
import { ProgressCard } from '../ui/cards/ProgressCard';
import { ComparisonCard } from '../ui/cards/ComparisonCard';
import { Timeline } from '../ui/timeline/Timeline';
import type { FarmSetupProgress } from '../../types';

interface SetupProgressProps {
  progress: FarmSetupProgress;
  percentage: number;
  onActionClick?: (action: string) => void;
  className?: string;
}

const PROGRESS_ITEMS = [
  {
    key: 'hasFlockProfile' as keyof FarmSetupProgress,
    label: 'Flock Profile Created',
    points: 50,
    icon: '🐔',
    action: 'Set up your flock details',
    actionKey: 'setup-flock'
  },
  {
    key: 'hasRecordedProduction' as keyof FarmSetupProgress,
    label: 'First Egg Entry',
    points: 30,
    icon: '🥚',
    action: 'Record your first egg collection',
    actionKey: 'add-eggs'
  },
  {
    key: 'hasRecordedExpense' as keyof FarmSetupProgress,
    label: 'First Expense Logged',
    points: 20,
    icon: '💰',
    action: 'Track your first expense',
    actionKey: 'add-expense'
  },
  {
    key: 'hasFeedTracking' as keyof FarmSetupProgress,
    label: 'Feed Tracking Started',
    points: 20,
    icon: '🌾',
    action: 'Track your feed inventory',
    actionKey: 'add-feed'
  }
];

export const SetupProgress: React.FC<SetupProgressProps> = ({
  progress,
  percentage,
  onActionClick,
  className = ''
}) => {
  const getPhase = (percentage: number) => {
    if (percentage <= 40) return { name: 'New User', gradient: 'from-indigo-400 to-indigo-600', message: 'Get started with basic setup' };
    if (percentage <= 70) return { name: 'Getting Started', gradient: 'from-purple-400 to-purple-600', message: 'Expand to core features' };
    if (percentage <= 90) return { name: 'Active User', gradient: 'from-violet-400 to-violet-600', message: 'Unlock advanced features' };
    return { name: 'Power User', gradient: 'from-indigo-500 to-purple-600', message: 'You\'re using all features!' };
  };

  const phase = getPhase(percentage);
  const nextActions = PROGRESS_ITEMS.filter(item => !progress[item.key]).slice(0, 3);

  return (
    <CardContainer variant="glass" padding="lg" className={className}>
      {/* Header */}
      <div className="mb-6" style={{ marginBottom: '0px' }}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>Setup Progress</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{phase.message}</p>
      </div>

      {/* Enhanced Progress Display */}
      <div className="mb-6">
        <ProgressCard
          title=""
          value={percentage}
          max={100}
          label={`${PROGRESS_ITEMS.filter(item => progress[item.key]).length} of ${PROGRESS_ITEMS.length} completed`}
          variant="default"
          showPercentage={false}
        />
      </div>

      {/* Two Column Layout: Recent Achievements & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements Timeline */}
        <div>
          {percentage > 0 && PROGRESS_ITEMS.filter(item => progress[item.key]).length > 0 ? (
            <>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                Recent Achievements
              </h4>
              <div className="max-h-64 overflow-y-auto">
                <Timeline 
                  items={PROGRESS_ITEMS.filter(item => progress[item.key]).slice(-3).map((item, index) => ({
                    id: `completed-${item.key}`,
                    title: item.label,
                    description: `+${item.points} points earned`,
                    date: new Date(Date.now() - index * 60 * 60 * 1000),
                    icon: '✅',
                    color: 'green'
                  }))}
                  variant="compact"
                />
              </div>
            </>
          ) : (
            <>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                Achievements Timeline
              </h4>
              <div className="text-center py-8 px-4">
                <div className="text-4xl opacity-40 mb-3">🏆</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">No achievements yet</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Complete your first setup step to start earning achievements
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next Actions */}
        {nextActions.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
              Recommended Next Steps
            </h4>
            <div className="space-y-2">
              {/* Special handling for flock setup - show complete onboarding button */}
              {!progress.hasFlockProfile && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200 dark:border-indigo-700 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎯</div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                        Complete Your Flock Setup
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Start the guided setup to add your chickens and create your first batch
                      </div>
                    </div>
                  </div>
                  <FormButton
                    onClick={() => onActionClick?.('complete-onboarding')}
                    variant="primary"
                    size="md"
                    fullWidth
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    🚀 Start Guided Setup
                  </FormButton>
                </motion.div>
              )}
              
              {nextActions.map((action, index) => (
                <motion.button
                  key={action.key}
                  onClick={() => onActionClick?.(action.actionKey)}
                  className="
                    w-full flex items-center gap-3 p-3 text-left
                    border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50
                    hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900
                  "
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
                >
                  <div className="text-xl">{action.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.action}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      +{action.points} points • {action.label}
                    </div>
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400">
                    →
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {percentage === 100 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              Congratulations!
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              You're using all the features available in BMad Farm.
              Keep tracking your flock to maximize your profits!
            </div>
          </div>
          
          <ComparisonCard
            title="Setup Journey"
            before={{ value: 0, label: "Started" }}
            after={{ value: 100, label: "Completed" }}
            format="percentage"
          />
        </motion.div>
      )}
    </CardContainer>
  );
};