import { createContext } from 'react';
import { FeatureFlags } from '../utils/featureFlags';

export interface FeatureFlagContextType {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  loading: boolean;
}

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);