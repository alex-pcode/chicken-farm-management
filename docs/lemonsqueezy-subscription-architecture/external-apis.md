# External APIs

### LemonSqueezy API

- **Purpose:** Complete subscription lifecycle management including checkout, billing, customer portal, and webhook events
- **Documentation:** https://docs.lemonsqueezy.com/api
- **Base URL(s):** 
  - Production: `https://api.lemonsqueezy.com/v1/`
  - Sandbox: `https://api.lemonsqueezy.com/v1/` (with test API key)
- **Authentication:** Bearer token using LemonSqueezy API key
- **Rate Limits:** 1000 requests per minute per API key

**Key Endpoints Used:**
- `GET /checkouts` - Create hosted checkout sessions for subscription upgrades
- `GET /subscriptions/{id}` - Retrieve subscription details for status verification
- `GET /customers/{id}` - Get customer information and billing details
- `PATCH /subscriptions/{id}` - Update subscription details (pause/resume)
- `GET /subscription-invoices` - Access billing history and invoices

**Integration Notes:** 
- Webhooks provide real-time subscription updates, reducing need for polling
- Customer portal URLs generated server-side for security
- Sandbox environment essential for testing payment flows
- International tax compliance handled automatically by LemonSqueezy
- Subscription status synchronization occurs through webhooks rather than polling API
