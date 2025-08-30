# Data Models

### User (Extended)

**Purpose:** Extends your existing users table with subscription information to maintain single source of truth for user data

**Key Attributes:**
- user_id: UUID - Existing primary key (unchanged)
- email: String - Existing field (unchanged)  
- subscription_status: Enum - Current subscription state (free, active, cancelled, past_due)
- subscription_id: String - LemonSqueezy subscription identifier
- customer_id: String - LemonSqueezy customer identifier
- billing_email: String - Email used for billing (may differ from login email)
- subscription_start_date: Timestamp - When premium subscription began
- subscription_end_date: Timestamp - When subscription expires (for cancelled users)
- plan_id: String - LemonSqueezy product variant identifier
- updated_at: Timestamp - Last subscription sync timestamp

#### TypeScript Interface
```typescript
interface User {
  // Existing fields
  id: string;
  email: string;
  created_at: string;
  
  // New subscription fields
  subscription_status: 'free' | 'active' | 'cancelled' | 'past_due' | 'paused';
  subscription_id?: string;
  customer_id?: string;
  billing_email?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  plan_id?: string;
  subscription_updated_at?: string;
}
```

#### Relationships
- Maintains existing relationships to flock_profiles, egg_entries, etc.
- No new foreign key relationships needed - subscription data is embedded

### WebhookEvent

**Purpose:** Audit trail and idempotency tracking for LemonSqueezy webhook processing

**Key Attributes:**
- id: UUID - Primary key
- webhook_id: String - LemonSqueezy webhook unique identifier (for idempotency)
- event_type: String - Type of webhook event (subscription_created, subscription_updated, etc.)
- user_id: UUID - Foreign key to users table
- processed_at: Timestamp - When webhook was successfully processed
- payload: JSONB - Raw webhook payload for debugging
- processing_status: Enum - Success, failed, or retrying

#### TypeScript Interface
```typescript
interface WebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;
  user_id: string;
  processed_at: string;
  payload: Record<string, any>;
  processing_status: 'success' | 'failed' | 'retrying';
}
```

#### Relationships
- Belongs to User (user_id foreign key)

### SubscriptionFeature

**Purpose:** Configuration table defining which features require premium subscription

**Key Attributes:**
- feature_key: String - Unique identifier for feature (primary key)
- feature_name: String - Human readable feature name
- description: String - Feature description for UI
- requires_premium: Boolean - Whether feature requires subscription
- created_at: Timestamp - When feature gate was added

#### TypeScript Interface
```typescript
interface SubscriptionFeature {
  feature_key: string;
  feature_name: string;
  description: string;
  requires_premium: boolean;
  created_at: string;
}
```

#### Relationships
- Referenced by application code for feature gating (no foreign keys)

### Shared Types for Frontend/Backend

#### Subscription Context Data
```typescript
interface SubscriptionContextData {
  user: User;
  isPremium: boolean;
  isLoading: boolean;
  features: Record<string, boolean>;
  upgradeUrl?: string;
  customerPortalUrl?: string;
}
```

#### Premium Feature Check
```typescript
interface FeatureAccess {
  hasAccess: boolean;
  requiresUpgrade: boolean;
  featureName: string;
  upgradePrompt?: string;
}
```
