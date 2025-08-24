import { useContext } from 'react';
import { FeatureFlagContext, FeatureFlagContextType } from '../contexts/FeatureFlagContext';

export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};