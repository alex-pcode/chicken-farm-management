# Introduction

### Starter Template or Existing Project

**Status:** **Existing Project Extension**

Your application is built on:
- **React 19 + TypeScript + Vite** frontend
- **Supabase (PostgreSQL)** with Row Level Security
- **Vercel** serverless deployment
- **Existing authentication system** via Supabase Auth
- **Tailwind CSS 4.x** design system
- **Sophisticated DataContext caching system** (5-minute cache, 85% API call reduction)

**Architectural Constraints:**
- Must preserve existing authentication flow and DataContext patterns
- Cannot disrupt current free users or their data
- Must integrate with existing `api/getData` unified API approach
- Must respect current RLS policies and user data isolation
- Should leverage existing monorepo structure and development workflow

**Critical Design Decisions Made:**
1. **Preserve existing patterns** - Subscription status becomes part of your DataContext system
2. **Extend RLS policies** - Add subscription checks to existing user_id-based security
3. **Leverage Vercel functions** - Webhook processing fits your serverless approach
4. **Build on existing auth** - Subscription tied to your current user system

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-30 | 1.0 | Initial architecture document based on PRD requirements | Winston (Architect) |
