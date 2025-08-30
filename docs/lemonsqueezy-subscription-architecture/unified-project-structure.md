# Unified Project Structure

```plaintext
poultry-management-app/
├── .github/                           # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                   # Extended with subscription tests
│       └── deploy.yaml               # Unchanged deployment workflow
├── api/                              # Vercel serverless functions (extended)
│   ├── webhooks/
│   │   └── lemonsqueezy.ts          # New: LemonSqueezy webhook handler
│   ├── subscription/                 # New: Subscription management endpoints
│   │   ├── status.ts                # Get subscription status
│   │   ├── upgrade-url.ts           # Generate checkout URLs
│   │   ├── customer-portal.ts       # Billing portal access
│   │   └── features.ts              # Feature access checks
│   ├── getData.ts                   # Extended: Include subscription data
│   ├── [other existing endpoints]   # Unchanged
│   └── lib/                         # Shared backend utilities
│       ├── subscription.ts          # New: Subscription business logic
│       ├── lemonsqueezy.ts         # New: LemonSqueezy API client
│       └── webhook-validator.ts     # New: Webhook signature validation
├── src/                             # Frontend application (extended)
│   ├── components/                  # React components
│   │   ├── subscription/            # New: Subscription-related UI
│   │   │   ├── PremiumFeatureGate.tsx
│   │   │   ├── SubscriptionStatus.tsx
│   │   │   ├── UpgradePrompt.tsx
│   │   │   └── FeatureComparison.tsx
│   │   ├── settings/               # Extended: Subscription settings
│   │   │   └── SubscriptionSettings.tsx
│   │   ├── EggCounter.tsx          # Unchanged (free feature)
│   │   ├── Dashboard.tsx           # Extended: Premium feature gates
│   │   └── [other components]      # Extended: Wrapped with feature gates
│   ├── contexts/                   # State management
│   │   ├── AuthContext.tsx         # Unchanged
│   │   ├── OptimizedDataProvider.tsx  # Extended: Include subscription data
│   │   └── OnboardingProvider.tsx  # Unchanged
│   ├── hooks/                      # Custom React hooks
│   │   ├── useSubscription.ts      # New: Subscription state hooks
│   │   ├── usePremiumFeature.ts    # New: Feature access hooks
│   │   └── [existing hooks]        # Unchanged
│   ├── services/api/               # API client layer
│   │   ├── index.ts                # Extended: Subscription endpoints
│   │   ├── subscriptionService.ts  # New: Subscription API calls
│   │   └── [existing services]     # Unchanged
│   ├── types/                      # TypeScript definitions
│   │   ├── subscription.ts         # New: Subscription type definitions
│   │   └── index.ts                # Extended: Include subscription types
│   ├── utils/                      # Utility functions
│   └── test/                       # Frontend tests
│       ├── setup.ts                # Extended: Subscription mocks
│       └── mocks/
│           └── subscription.ts     # New: Subscription test data
├── migrations/                     # Database migrations
│   ├── [existing migrations]      # Unchanged
│   └── 005_add_subscription_support.sql  # New: Subscription schema
├── docs/                          # Documentation
│   ├── prd-subscription.md        # Your existing PRD
│   ├── lemonsqueezy-subscription-architecture.md  # This document
│   └── [other docs]               # Unchanged
├── scripts/                       # Build/deploy scripts
├── .env.example                   # Extended: LemonSqueezy environment vars
├── .env.local                     # Extended: Development secrets
├── package.json                   # Extended: New dependencies
├── vercel.json                    # Unchanged: Existing Vercel config
└── README.md                      # Updated: Subscription setup instructions
```
