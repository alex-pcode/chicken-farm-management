# Coding Standards

### Critical Fullstack Rules
- **Type Sharing:** Always define subscription types in src/types/subscription.ts and import consistently across frontend/backend
- **API Calls:** Never make direct subscription API calls - use subscriptionService layer exclusively
- **Environment Variables:** Access LemonSqueezy config only through structured config objects, never process.env directly in components
- **Error Handling:** All subscription API routes must use the standard error format defined in your existing API patterns
- **State Updates:** Never mutate subscription state directly - use proper DataContext refresh mechanisms
- **Feature Gates:** Always implement both UI gates (PremiumFeatureGate) AND database RLS policies for defense-in-depth security
- **Webhook Processing:** All webhook handlers must be idempotent and handle duplicate processing gracefully
- **Cache Integration:** Subscription data must flow through existing DataContext patterns, never create separate caching layers

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `PremiumFeatureGate.tsx` |
| Hooks | camelCase with 'use' | - | `useSubscription.ts` |
| API Routes | - | kebab-case | `/api/subscription/upgrade-url` |
| Database Tables | - | snake_case | `webhook_events` |
| Subscription Fields | - | snake_case | `subscription_status` |
