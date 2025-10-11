# Netlify Migration Plan - Chicken Manager App

## Migration Overview

**Timeline**: 2-4 hours (testing included)
**Risk Level**: Low (Supabase stays unchanged, minimal code changes)
**Rollback**: Simple (keep Vercel active until confirmed)

---

## Current Vercel Setup Analysis

### API Functions (10 endpoints)
```
api/
├── data.ts              # Main data endpoint (GET all user data)
├── customers.ts         # Customer CRUD
├── sales.ts             # Sales management
├── salesReports.ts      # Sales analytics
├── flockBatches.ts      # Flock batch management
├── flockSummary.ts      # Flock statistics
├── deathRecords.ts      # Death record tracking
├── batchEvents.ts       # Batch event logging
├── crud.ts              # Generic CRUD operations
└── debug-db.ts          # Database debugging
```

### Environment Variables (Required)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Sentry (if configured)
VITE_SENTRY_DSN=your_sentry_dsn
```

### Vercel Configuration (`vercel.json`)
- **Build**: `npm run build`
- **Framework**: Vite
- **Output**: `dist/`
- **Cache headers**: Extensive asset caching (1 year for static, 5 min for API)
- **API rewrites**: `/api/*` routing

---

## Netlify Migration Guide

### Phase 1: Project Setup (15 minutes)

#### Step 1.1: Create Netlify Account & Import Repository
1. Go to https://app.netlify.com/signup
2. Sign up with GitHub account
3. Click "Add new site" → "Import an existing project"
4. Select your Chicken Manager repository
5. **STOP** - Don't deploy yet, configure first

#### Step 1.2: Configure Build Settings
```yaml
# Netlify will auto-detect, but verify:
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions  # We'll create this
```

#### Step 1.3: Set Environment Variables
In Netlify Dashboard → Site settings → Environment variables:

Add all three required variables:
```
VITE_SUPABASE_URL = <your_value>
VITE_SUPABASE_ANON_KEY = <your_value>
SUPABASE_SERVICE_ROLE_KEY = <your_value>
```

**IMPORTANT**: Don't deploy yet!

---

### Phase 2: Convert API Functions (45 minutes)

#### Step 2.1: Create Netlify Functions Directory
```bash
mkdir -p netlify/functions
```

#### Step 2.2: Function Conversion Pattern

**Vercel Function Format** (`api/data.ts`):
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get auth header
  const authHeader = req.headers.authorization;

  // Your logic here
  const data = await fetchData();

  return res.status(200).json(data);
}
```

**Netlify Function Format** (`netlify/functions/data.ts`):
```typescript
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Get auth header
  const authHeader = event.headers.authorization;

  // Your logic here
  const data = await fetchData();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
    },
    body: JSON.stringify(data)
  };
};
```

#### Step 2.3: Key Conversion Differences

| Aspect | Vercel | Netlify |
|--------|--------|---------|
| **Request object** | `req: VercelRequest` | `event: HandlerEvent` |
| **Response** | `res.status(200).json(data)` | `return { statusCode: 200, body: JSON.stringify(data) }` |
| **HTTP method** | `req.method` | `event.httpMethod` |
| **Query params** | `req.query` | `event.queryStringParameters` |
| **Body** | `req.body` | `JSON.parse(event.body || '{}')` |
| **Headers** | `req.headers` | `event.headers` (lowercase keys) |

#### Step 2.4: Install Netlify CLI & Types
```bash
npm install -D @netlify/functions
npm install -D netlify-cli
```

Update `package.json`:
```json
{
  "scripts": {
    "dev": "netlify dev",
    "build": "vite build",
    "netlify:serve": "netlify dev"
  }
}
```

#### Step 2.5: Function Migration Checklist

For each of the 10 API functions, create converted version in `netlify/functions/`:

- [ ] `data.ts` - Main data endpoint
- [ ] `customers.ts` - Customer CRUD
- [ ] `sales.ts` - Sales management
- [ ] `salesReports.ts` - Sales analytics
- [ ] `flockBatches.ts` - Flock batch management
- [ ] `flockSummary.ts` - Flock statistics
- [ ] `deathRecords.ts` - Death records
- [ ] `batchEvents.ts` - Batch events
- [ ] `crud.ts` - Generic CRUD
- [ ] `debug-db.ts` - Database debugging

**Conversion Template** (use for all functions):

```typescript
// netlify/functions/[function-name].ts
import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Copy all your type imports and interfaces from api/[function-name].ts

export const handler: Handler = async (event, context) => {
  // 1. Handle CORS for OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // 2. Get authorization header (CONVERT: req.headers → event.headers)
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing or invalid authorization header' })
      };
    }

    // 3. Initialize Supabase (same as Vercel)
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Handle different HTTP methods (CONVERT: req.method → event.httpMethod)
    switch (event.httpMethod) {
      case 'GET':
        // Copy your GET logic, convert:
        // - req.query → event.queryStringParameters
        const data = await yourGetLogic();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        };

      case 'POST':
        // Copy your POST logic, convert:
        // - req.body → JSON.parse(event.body || '{}')
        const postData = JSON.parse(event.body || '{}');
        const result = await yourPostLogic(postData);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        };

      // Add other methods as needed (PUT, DELETE, etc.)

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    };
  }
};
```

---

### Phase 3: Create Netlify Configuration (10 minutes)

#### Step 3.1: Create `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

# Cache static assets (similar to vercel.json headers)
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.woff"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.ttf"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=2592000"

[[headers]]
  for = "/*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=2592000"

[[headers]]
  for = "/*.svg"
  [headers.values]
    Cache-Control = "public, max-age=2592000"

# API function caching
[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Cache-Control = "public, max-age=300, s-maxage=300, stale-while-revalidate=60"

# SPA routing - redirect all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
  conditions = {Role = ["client"]}

[functions]
  node_bundler = "esbuild"
  # 30 second timeout on free tier
  # 1024 MB memory limit
```

#### Step 3.2: Update `.gitignore`
```bash
# Add Netlify-specific ignores
.netlify/
netlify/
```

Wait - **DON'T ignore netlify/functions**, only `.netlify/` (build cache).

Correct `.gitignore` addition:
```bash
# Netlify
.netlify/
```

---

### Phase 4: Local Testing (30 minutes)

#### Step 4.1: Install Netlify CLI
```bash
npm install -D netlify-cli
```

#### Step 4.2: Test Functions Locally
```bash
netlify dev
```

This will:
- Start Vite dev server
- Start Netlify Functions locally
- Functions available at `http://localhost:8888/.netlify/functions/[function-name]`

#### Step 4.3: Test Each Endpoint

Create a test script or use curl:
```bash
# Test main data endpoint
curl -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  http://localhost:8888/.netlify/functions/data

# Test customer endpoint
curl -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  http://localhost:8888/.netlify/functions/customers

# Repeat for all 10 functions
```

#### Step 4.4: Frontend URL Updates

**IMPORTANT**: Update API base URL in your frontend code.

Find and update in `src/services/api/BaseApiService.ts` (or wherever API calls are made):

**Before** (Vercel):
```typescript
const API_BASE_URL = '/api';  // Vercel pattern
```

**After** (Netlify):
```typescript
// Development vs Production
const API_BASE_URL = import.meta.env.DEV
  ? '/.netlify/functions'  // Local dev
  : '/.netlify/functions'; // Production

// Or simpler:
const API_BASE_URL = '/.netlify/functions';
```

Update all API calls from:
```typescript
fetch('/api/data')           // Vercel
```

To:
```typescript
fetch('/.netlify/functions/data')  // Netlify
```

**Better approach**: Use environment variable:
```typescript
// vite.config.ts or equivalent
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
```

Then in `.env`:
```env
VITE_API_BASE_URL=/.netlify/functions
```

---

### Phase 5: Deployment (15 minutes)

#### Step 5.1: Commit Changes
```bash
git add netlify.toml netlify/functions/ package.json
git commit -m "feat: migrate from Vercel to Netlify"
git push origin main
```

#### Step 5.2: Deploy to Netlify
Netlify will auto-deploy when you push to main (if you connected the repo).

**OR** manual deploy via CLI:
```bash
netlify deploy --prod
```

#### Step 5.3: Verify Deployment
1. Check Netlify deploy logs for errors
2. Visit your Netlify URL (e.g., `your-app.netlify.app`)
3. Test authentication flow
4. Test all major features:
   - [ ] Login/Authentication
   - [ ] Dashboard data loading
   - [ ] Egg entry creation
   - [ ] Customer management
   - [ ] Sales tracking
   - [ ] Flock batch management

#### Step 5.4: Custom Domain (Optional)
1. Netlify Dashboard → Domain settings
2. Add your custom domain
3. Update DNS records as instructed
4. Netlify auto-provisions SSL certificate

---

### Phase 6: Post-Migration Cleanup (10 minutes)

#### Step 6.1: Monitor Function Usage
Netlify Dashboard → Functions tab

Check:
- Function invocation counts
- Error rates
- Response times

#### Step 6.2: Set Up Monitoring
1. **Function monitoring**: Built into Netlify dashboard
2. **Error tracking**: Sentry (already configured)
3. **Usage alerts**: Enable in Netlify settings

#### Step 6.3: Keep Vercel Active for 7 Days
- Monitor Netlify for any issues
- Keep Vercel deployment as backup
- After 7 days of stable Netlify operation, delete Vercel project

---

## Testing Checklist

### Pre-Deployment Testing (Local)
- [ ] All 10 functions return expected data
- [ ] Authentication works with Supabase tokens
- [ ] CORS headers allow frontend requests
- [ ] Error handling returns proper status codes
- [ ] Database queries execute correctly

### Post-Deployment Testing (Production)
- [ ] Login flow works
- [ ] Dashboard loads all data
- [ ] Can create new egg entries
- [ ] Can add/edit customers
- [ ] Can record sales
- [ ] Can manage flock batches
- [ ] Can view analytics/reports
- [ ] No console errors
- [ ] Function logs show no errors

---

## Rollback Procedure

If anything goes wrong:

### Immediate Rollback (5 minutes)
1. **Update DNS** back to Vercel (if custom domain migrated)
2. **Update frontend** API base URL:
   ```typescript
   const API_BASE_URL = '/api';  // Back to Vercel
   ```
3. **Deploy to Vercel**: `git push` (Vercel still watching repo)

### Data Integrity
- **No data loss risk**: Supabase unchanged throughout migration
- **User sessions**: May need to re-login if JWT tokens cached

---

## Cost Comparison

### Vercel Free Tier
- 100 GB bandwidth
- 1M function invocations
- 10s function timeout

### Netlify Free Tier
- 100 GB bandwidth
- 125,000 function invocations ⚠️ (lower than Vercel)
- 30s function timeout ✅ (better than Vercel)

**Recommendation**: Monitor usage first month on Netlify. If you exceed 125k invocations, consider upgrading to Netlify Pro ($19/mo) or implement more aggressive frontend caching.

---

## Migration Timeline Summary

| Phase | Duration | Can Skip? |
|-------|----------|-----------|
| Phase 1: Project Setup | 15 min | No |
| Phase 2: Function Conversion | 45 min | No |
| Phase 3: Netlify Config | 10 min | No |
| Phase 4: Local Testing | 30 min | Not recommended |
| Phase 5: Deployment | 15 min | No |
| Phase 6: Cleanup | 10 min | Optional |
| **Total** | **2 hours 5 min** | - |

---

## Common Issues & Solutions

### Issue 1: Functions Not Found (404)
**Symptom**: `/.netlify/functions/data` returns 404
**Solution**:
- Check `netlify.toml` has `functions = "netlify/functions"`
- Verify function files export `handler` properly
- Redeploy after changes

### Issue 2: CORS Errors
**Symptom**: Browser console shows CORS policy errors
**Solution**: Add CORS headers to all function responses:
```typescript
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
  body: JSON.stringify(data)
};
```

### Issue 3: Environment Variables Not Working
**Symptom**: Functions can't connect to Supabase
**Solution**:
- Verify env vars set in Netlify Dashboard (not just `.env` file)
- Check spelling: `VITE_SUPABASE_URL` not `VITE_SUPABASE_URI`
- Redeploy after adding env vars

### Issue 4: Function Timeout
**Symptom**: Function exceeds 30s limit
**Solution**:
- Optimize database queries (add indexes)
- Implement pagination for large datasets
- Use background functions for long operations (requires paid plan)

### Issue 5: High Function Invocation Count
**Symptom**: Approaching 125k/month limit
**Solution**:
- Increase frontend cache duration (currently 5 minutes)
- Implement service worker caching
- Batch API requests where possible
- Upgrade to Netlify Pro if needed

---

## Success Criteria

Migration is successful when:

1. ✅ All 10 API functions working on Netlify
2. ✅ Frontend successfully calls Netlify functions
3. ✅ Authentication flow unchanged
4. ✅ No data loss or corruption
5. ✅ Performance equal to or better than Vercel
6. ✅ Zero production errors for 7 days
7. ✅ Function invocation count within free tier limits

---

## Next Steps After Migration

1. **Monitor for 7 days** - Watch for errors and performance issues
2. **Optimize caching** - Reduce function invocations if needed
3. **Delete Vercel project** - After confirming stability
4. **Update documentation** - Remove Vercel references, add Netlify setup
5. **Consider Netlify features**:
   - Netlify Forms (for contact forms)
   - Netlify Identity (alternative to Supabase Auth if needed)
   - Split Testing (A/B testing built-in)
   - Deploy Previews (automatic preview deployments for PRs)

---

**Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By:** Claude <noreply@anthropic.com>
