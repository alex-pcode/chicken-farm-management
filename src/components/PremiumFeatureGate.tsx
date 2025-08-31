import React from 'react';
import { motion } from 'framer-motion';
import { useUserTier } from '../contexts/OptimizedDataProvider';

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  children,
  fallback,
  featureName = 'this feature'
}) => {
  const userTier = useUserTier();

  if (userTier === 'premium') {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-600 mb-6">
          Access to {featureName} requires a premium subscription. Upgrade to unlock advanced farm management features.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => {
              console.log('Upgrade to Premium clicked - ready for payment integration');
              // TODO: Integrate with payment system when available
            }}
            className="neu-button bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 w-full transition-all duration-200"
            aria-label={`Upgrade to premium to access ${featureName}`}
          >
            🚀 Upgrade to Premium
          </button>
          <p className="text-xs text-gray-500">
            Get full access to all farm management tools
          </p>
        </div>
      </div>
    </motion.div>
  );
};