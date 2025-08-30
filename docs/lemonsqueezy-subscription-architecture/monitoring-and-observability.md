# Monitoring and Observability

### Monitoring Stack
- **Frontend Monitoring:** Vercel Analytics (existing) + subscription-specific error tracking
- **Backend Monitoring:** Vercel Functions monitoring + Supabase logs for database operations
- **Error Tracking:** Console logging with structured subscription error codes
- **Performance Monitoring:** Vercel performance metrics + subscription endpoint response times

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (unchanged)
- JavaScript errors (including subscription component errors)
- API response times (including subscription endpoints)
- User interactions (subscription upgrade clicks, feature gate interactions)

**Backend Metrics:**
- Request rate (including webhook processing volume)
- Error rate (subscription endpoint failures, webhook processing failures)
- Response time (subscription status checks, webhook processing duration)
- Database query performance (subscription-related queries, RLS policy impact)

**Subscription-Specific Metrics:**
- Webhook processing success rate (target: >99.9%)
- Subscription status sync latency (webhook to UI update)
- Feature gate performance impact (RLS query overhead)
- Upgrade conversion funnel metrics (feature gate clicks to completed payments)

---
