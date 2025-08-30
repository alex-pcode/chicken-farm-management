# Frontend Architecture

### Component Architecture

#### Component Organization
```
src/
├── components/
│   ├── subscription/           # New subscription-related components
│   │   ├── PremiumFeatureGate.tsx
│   │   ├── SubscriptionStatus.tsx
│   │   ├── UpgradePrompt.tsx
│   │   └── FeatureComparison.tsx
│   ├── settings/              # Extend existing settings
│   │   └── SubscriptionSettings.tsx
│   └── [existing components]   # CRM, EggCounter, etc. (unchanged)
├── contexts/
│   ├── SubscriptionProvider.tsx # New subscription context
│   └── [existing contexts]     # AuthContext, DataProvider (unchanged)
├── hooks/
│   ├── useSubscription.ts      # New subscription hooks
│   ├── usePremiumFeature.ts
│   └── [existing hooks]        # Unchanged
├── types/
│   └── subscription.ts         # New subscription TypeScript definitions
└── services/api/
    └── subscriptionService.ts  # New subscription API calls
```

#### Component Template
```typescript
// PremiumFeatureGate.tsx - Wraps existing components with subscription logic
import React from 'react';
import { useSubscription, usePremiumFeature } from '@/hooks';
import { UpgradePrompt } from './UpgradePrompt';

interface PremiumFeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  preview?: boolean;
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  feature,
  children,
  fallback,
  preview = false
}) => {
  const { isPremium, isLoading } = useSubscription();
  const featureAccess = usePremiumFeature(feature);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (featureAccess.hasAccess) {
    return <>{children}</>;
  }

  if (preview) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <UpgradePrompt 
          feature={featureAccess.featureName}
          prompt={featureAccess.upgradePrompt}
        />
      </div>
    );
  }

  return fallback || <UpgradePrompt feature={featureAccess.featureName} />;
};
```

### State Management Architecture

#### State Structure
```typescript
// Extends your existing DataContext pattern
interface SubscriptionState {
  subscription: {
    status: 'free' | 'active' | 'cancelled' | 'past_due' | 'paused';
    isPremium: boolean;
    subscriptionId?: string;
    planId?: string;
    billingEmail?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    nextBillingDate?: string;
  };
  features: Record<string, FeatureAccess>;
  upgradeUrl?: string;
  customerPortalUrl?: string;
  isLoading: boolean;
  error?: string;
}

// Integration with your existing DataContext
interface ExtendedDataState {
  // Your existing data fields
  user: User;
  flockProfiles: FlockProfile[];
  eggEntries: EggEntry[];
  expenses: Expense[];
  
  // New subscription data (cached together)
  subscription: SubscriptionState['subscription'];
  features: SubscriptionState['features'];
}
```

#### State Management Patterns
- **Single source of truth:** Subscription data flows through your existing DataContext cache
- **Computed values:** `isPremium` computed from subscription status, not stored separately
- **Feature access caching:** All feature access states cached to prevent repeated calculations
- **Optimistic updates:** UI updates immediately on subscription changes, with rollback on failure
- **Error boundaries:** Subscription failures don't crash existing functionality

### Routing Architecture

#### Route Organization
```
/                          # Dashboard (shows premium features with gates)
├── /production           # EggCounter (always accessible)
├── /crm                  # Premium feature with PremiumFeatureGate
├── /expenses             # Premium feature with PremiumFeatureGate
├── /analytics            # Premium feature with PremiumFeatureGate
├── /settings
│   └── /subscription     # New subscription management page
└── /upgrade-success      # New post-payment success page
```

#### Protected Route Pattern
```typescript
// No changes to your existing ProtectedRoute - subscription gates at component level
import { PremiumFeatureGate } from '@/components/subscription';

// Wrap premium routes with feature gates instead of route-level protection
const CRMPage = () => (
  <PremiumFeatureGate feature="crm" preview={true}>
    <CRMDashboard />
  </PremiumFeatureGate>
);

// Free features remain unchanged
const EggCounterPage = () => <EggCounter />;
```

### Frontend Services Layer

#### API Client Setup
```typescript
// Extends your existing API service layer
// src/services/api/subscriptionService.ts
import { apiService } from './index';

export const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    // Integrated into your existing /api/getData endpoint
    const data = await apiService.data.getData();
    return data.subscription;
  },

  generateUpgradeUrl: async (planId: string): Promise<string> => {
    const response = await fetch('/api/subscription/upgrade-url', {
      method: 'POST',
      headers: apiService.getAuthHeaders(),
      body: JSON.stringify({ planId }),
    });
    const data = await response.json();
    return data.checkout_url;
  },

  getCustomerPortalUrl: async (): Promise<string> => {
    const response = await fetch('/api/subscription/customer-portal', {
      headers: apiService.getAuthHeaders(),
    });
    const data = await response.json();
    return data.portal_url;
  },

  syncStatus: async (): Promise<void> => {
    // Triggers cache refresh in your DataContext
    await apiService.data.refreshCache();
  }
};
```

#### Service Example
```typescript
// src/hooks/useSubscription.ts - Integrates with your DataContext pattern
import { useContext } from 'react';
import { DataContext } from '@/contexts/DataProvider';

export const useSubscription = () => {
  const { data, isLoading, error } = useContext(DataContext);
  
  return {
    subscription: data?.subscription,
    isPremium: data?.subscription?.status === 'active',
    isLoading,
    error,
    // Integrates with your existing cache refresh mechanism
    refresh: () => data?.refresh?.(),
  };
};

export const usePremiumFeature = (featureKey: string) => {
  const { data } = useContext(DataContext);
  const featureAccess = data?.features?.[featureKey];
  
  return {
    hasAccess: featureAccess?.has_access ?? false,
    requiresUpgrade: featureAccess?.requires_upgrade ?? true,
    featureName: featureAccess?.feature_name ?? featureKey,
    upgradePrompt: featureAccess?.upgrade_prompt,
  };
};
```
