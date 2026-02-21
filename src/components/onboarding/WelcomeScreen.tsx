/**
 * Welcome Screen Component - First-time user landing page
 * Introduces the application and guides users to setup
 */

import React from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '../ui/layout/PageContainer';
import { CardContainer } from '../ui/layout/CardContainer';
import { FormButton } from '../ui/forms/FormButton';
import { StatCard } from '../ui/cards/StatCard';

interface WelcomeScreenProps {
  onStartSetup: () => void;
  onSkipToApp: () => void;
  className?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSetup,
  onSkipToApp,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${className}`}>
      <PageContainer maxWidth="md" padding="lg" className="w-full">
        <CardContainer variant="glass" padding="xl" className="text-center relative overflow-hidden">
          {/* Corner Gradient Overlay */}
          <div 
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              top: '-25%',
              right: '-15%',
              width: '35%',
              height: '30%',
              borderRadius: '70%',
              background: 'radial-gradient(circle, #4F46E5 0%, #2A2580 100%)',
              filter: 'blur(60px)',
              opacity: 0.8
            }}
          />
          
          <div className="relative">
            {/* Logo/Brand Section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🐔</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Welcome to Chicken Care App
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Your complete solution for managing chickens and maximizing egg production
              </p>
            </motion.div>

            {/* Value Proposition Cards */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                  title="Track Production"
                  total="📊"
                  label="Monitor daily egg collection, feed consumption, and expenses"
                  variant="corner-gradient"
                  className="text-left"
                />
                <StatCard
                  title="Manage Flocks"
                  total="🐣"
                  label="Organize birds by batches, track health events and lifecycle"
                  variant="corner-gradient"
                  className="text-left"
                />
                <StatCard
                  title="Boost Profits"
                  total="💰"
                  label="Analyze costs, track sales, and optimize your operation"
                  variant="corner-gradient"
                  className="text-left"
                />
              </div>
            </motion.div>

            {/* Getting Started Message */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <CardContainer variant="glass" padding="lg" className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                  Ready to get started?
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Let's set up your flock in just a few simple steps. It takes less than 2 minutes 
                  and you'll immediately see your personalized dashboard.
                </p>
              </CardContainer>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <FormButton
                onClick={onStartSetup}
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Set Up My Flock
              </FormButton>
              
              <FormButton
                onClick={onSkipToApp}
                variant="secondary"
                size="lg"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Skip for Now
              </FormButton>
            </motion.div>

            {/* Help Text */}
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              Don't worry - you can always set up your flock later from your profile settings
            </motion.p>
          </div>
        </CardContainer>
      </PageContainer>
    </div>
  );
};