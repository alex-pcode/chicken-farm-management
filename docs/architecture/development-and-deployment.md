# Development and Deployment

### Local Development Setup

**Working Commands**:
```bash
npm install                    # Install dependencies
npx vercel dev                # Development server (recommended)
npm run dev                   # Vite dev server (API functions won't work)
```

**Environment Variables** (required):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Build and Deployment Process

- **Build Command**: `npm run build` (Vite → `dist/` folder)
- **Deployment**: Automatic Vercel deployment on git push to main
- **Type Checking**: `npm run type-check` (TSC project references)
- **Linting**: `npm run lint` (ESLint with React rules)
