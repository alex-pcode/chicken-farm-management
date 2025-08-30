# Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; connect-src 'self' *.lemonsqueezy.com *.supabase.co; script-src 'self' 'unsafe-inline'`
- XSS Prevention: React's built-in XSS protection + input sanitization for subscription data
- Secure Storage: Subscription status cached in memory only, never localStorage

**Backend Security:**
- Input Validation: Webhook signature validation using HMAC-SHA256, strict payload schema validation
- Rate Limiting: Vercel's built-in 1000 req/min, additional rate limiting on webhook endpoints
- CORS Policy: Same-origin for subscription endpoints, webhook endpoint allows LemonSqueezy origins only

**Authentication Security:**
- Token Storage: JWT stored in httpOnly cookies (your existing pattern)
- Session Management: Supabase Auth session handling (unchanged)
- Password Policy: Supabase Auth policies (unchanged)

**Subscription-Specific Security:**
- **Webhook Signature Validation:** All webhooks verified with HMAC-SHA256 before processing
- **Service Role Isolation:** Webhook processing uses service role, user endpoints use user JWT
- **Feature Gate Enforcement:** RLS policies prevent premium data access regardless of UI manipulation
- **Idempotency Protection:** Duplicate webhook processing prevented via unique webhook_id tracking

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: <200KB additional for subscription features (minimal impact)
- Loading Strategy: Subscription components lazy-loaded, feature gates render immediately
- Caching Strategy: Subscription status cached with existing 5-minute DataContext cycle

**Backend Performance:**
- Response Time Target: <100ms for subscription status checks (cached data)
- Database Optimization: Indexed subscription_status field, partial index on active subscriptions
- Caching Strategy: Subscription data included in existing user data cache, no additional cache layers

**Subscription-Specific Optimizations:**
- **Feature Access Caching:** All feature permissions computed once and cached
- **Webhook Processing:** Async processing with 30-second timeout, minimal database operations
- **RLS Policy Efficiency:** Subscription checks use indexed fields to minimize query impact
- **Bundle Splitting:** Subscription UI components code-split from core application
