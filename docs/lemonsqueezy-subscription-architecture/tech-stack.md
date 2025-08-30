# Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Type-safe subscription state management | Already established in your codebase |
| Frontend Framework | React | 19.x | Subscription UI components and context | Your current framework choice |
| UI Component Library | Tailwind CSS + Custom Components | 4.x | Subscription management interfaces | Maintains design system consistency |
| State Management | React Context (Extended DataContext) | React 19 | Subscription status caching | Integrates with your existing 85% cache hit system |
| Backend Language | TypeScript | 5.x | Webhook processing functions | Consistency across frontend/backend |
| Backend Framework | Vercel Functions | Latest | LemonSqueezy webhook handlers | Your existing serverless infrastructure |
| API Style | REST (Extended existing endpoints) | - | Subscription status endpoints | Maintains your current API patterns |
| Database | Supabase PostgreSQL | Latest | Extended users table + webhook logs | Your existing database with minimal schema changes |
| Cache | DataContext (5-minute cycle) | - | Subscription status caching | Proven performance pattern in your app |
| File Storage | Supabase Storage | Latest | Invoice/receipt storage (if needed) | Your existing storage solution |
| Authentication | Supabase Auth (Extended) | Latest | User-subscription linking | Your established auth system |
| Frontend Testing | Vitest + React Testing Library | Latest | Subscription component testing | Your current testing setup |
| Backend Testing | Vitest | Latest | Webhook handler testing | Consistency with frontend testing |
| E2E Testing | Playwright | Latest | Subscription flow testing | Modern E2E tool for payment flows |
| Build Tool | Vite | Latest | Frontend builds | Your existing build system |
| Bundler | Vite | Latest | Code bundling | Your existing bundler |
| IaC Tool | Vercel CLI | Latest | Deployment configuration | Your current deployment approach |
| CI/CD | GitHub Actions (Extended) | Latest | Subscription feature testing | Your existing CI/CD with added test scenarios |
| Monitoring | Vercel Analytics + Supabase Logs | Latest | Webhook processing monitoring | Leverages your existing monitoring |
| Logging | Console + Supabase Functions | Latest | Webhook event logging | Your existing logging infrastructure |
| CSS Framework | Tailwind CSS | 4.x | Subscription UI styling | Your current styling approach |
| Payment Processing | LemonSqueezy | Latest | Subscription management and billing | International compliance, VAT handling |
| Webhook Signatures | crypto (Node.js) | Built-in | Webhook security verification | Standard security for webhook validation |
