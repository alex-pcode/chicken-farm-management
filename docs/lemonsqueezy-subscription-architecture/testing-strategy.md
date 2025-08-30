# Testing Strategy

### Testing Pyramid
```
                E2E Tests
               /        \
          Integration Tests  
             /            \
        Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests
```
src/test/
├── components/
│   └── subscription/
│       ├── PremiumFeatureGate.test.tsx
│       ├── SubscriptionStatus.test.tsx
│       └── UpgradePrompt.test.tsx
├── hooks/
│   ├── useSubscription.test.ts
│   └── usePremiumFeature.test.ts
├── contexts/
│   └── SubscriptionProvider.test.tsx
└── integration/
    └── subscription-flow.test.tsx
```

#### Backend Tests
```
api/test/
├── webhooks/
│   └── lemonsqueezy.test.ts
├── subscription/
│   ├── status.test.ts
│   ├── upgrade-url.ts
│   └── features.test.ts
└── lib/
    ├── subscription.test.ts
    └── webhook-validator.test.ts
```

#### E2E Tests
```
e2e/
├── subscription/
│   ├── upgrade-flow.spec.ts
│   ├── webhook-processing.spec.ts
│   └── feature-gates.spec.ts
└── fixtures/
    └── lemonsqueezy-webhooks.json
```

### Test Examples

#### Frontend Component Test
```typescript
// src/test/components/subscription/PremiumFeatureGate.test.tsx
import { render, screen } from '@testing-library/react';
import { PremiumFeatureGate } from '@/components/subscription';
import { useSubscription } from '@/hooks';

jest.mock('@/hooks');
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>;

describe('PremiumFeatureGate', () => {
  it('renders children for premium users', () => {
    mockUseSubscription.mockReturnValue({
      isPremium: true,
      isLoading: false,
      subscription: { status: 'active' }
    });

    render(
      <PremiumFeatureGate feature="crm">
        <div>Premium Content</div>
      </PremiumFeatureGate>
    );

    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('renders upgrade prompt for free users', () => {
    mockUseSubscription.mockReturnValue({
      isPremium: false,
      isLoading: false,
      subscription: { status: 'free' }
    });

    render(
      <PremiumFeatureGate feature="crm">
        <div>Premium Content</div>
      </PremiumFeatureGate>
    );

    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
  });
});
```

#### Backend API Test
```typescript
// api/test/webhooks/lemonsqueezy.test.ts
import { POST } from '@/api/webhooks/lemonsqueezy';
import { NextRequest } from 'next/server';

describe('/api/webhooks/lemonsqueezy', () => {
  it('processes valid subscription webhook', async () => {
    const mockWebhook = {
      meta: { event_name: 'subscription_created', webhook_id: 'wh_123' },
      data: {
        id: 'sub_123',
        attributes: { user_email: 'test@example.com', status: 'active' }
      }
    };

    const request = new NextRequest('http://localhost:3000/api/webhooks/lemonsqueezy', {
      method: 'POST',
      body: JSON.stringify(mockWebhook),
      headers: { 'x-signature': 'valid_signature' }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects webhooks with invalid signatures', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/lemonsqueezy', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'x-signature': 'invalid_signature' }
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
```

#### E2E Test
```typescript
// e2e/subscription/upgrade-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Upgrade Flow', () => {
  test('user can upgrade to premium', async ({ page }) => {
    // Login as free user
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');

    // Try to access premium feature
    await page.goto('/crm');
    await expect(page.locator('[data-testid=upgrade-prompt]')).toBeVisible();

    // Click upgrade button
    await page.click('[data-testid=upgrade-button]');
    await expect(page).toHaveURL(/.*lemonsqueezy\.com.*checkout.*/);

    // Simulate successful payment return
    await page.goto('/upgrade-success?session_id=test_session');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();

    // Verify premium access
    await page.goto('/crm');
    await expect(page.locator('[data-testid=crm-dashboard]')).toBeVisible();
  });
});
```
