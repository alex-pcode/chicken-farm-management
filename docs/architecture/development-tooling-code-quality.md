# Development Tooling & Code Quality

### Critical Missing Tools Identified

Your current setup has several gaps in development tooling that are **essential** for professional React development in 2025:

#### 1. Code Formatting - MISSING ❌

**Current State**: No Prettier configuration found
**Impact**: Inconsistent code formatting across your 25+ components

**Recommended Setup**:
```bash
npm install -D prettier eslint-config-prettier
```

**Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

#### 2. Pre-commit Hooks - MISSING ❌

**Current State**: No Husky or lint-staged configuration
**Impact**: Code quality issues can reach repository without validation

**Critical for Your Refactoring**: With 6 components over 500 lines, pre-commit hooks prevent broken code during Epic 2 component breakdown.

**Setup**:
```bash
npm install -D husky lint-staged
npx husky-init
```

**Configuration** (package.json):
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --quiet --fix",
    "prettier --write"
  ],
  "*.{json,md,html,css}": [
    "prettier --write"
  ]
}
```

#### 3. Environment Variable Validation - MISSING ❌

**Current State**: No validation for critical Supabase environment variables
**Impact**: Runtime failures if env vars are missing/incorrect

**Recommended Setup**:
```bash
npm install -D @t3-oss/env-nextjs zod
```

**Create** `src/env.ts`:
```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1),
  },
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
```

#### 4. Bundle Analysis - MISSING ❌

**Current State**: No bundle size monitoring
**Impact**: Unknown impact of dependencies on app performance

**Setup**:
```bash
npm install -D vite-bundle-analyzer
```
